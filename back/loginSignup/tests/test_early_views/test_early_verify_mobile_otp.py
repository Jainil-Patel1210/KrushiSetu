# test_views_verify_mobile_otp.py

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import verify_mobile_otp
from loginSignup.models import User


class TestVerifyMobileOtp:
    """
    Unit tests for verify_mobile_otp in loginSignup.views
    """

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()

    @pytest.fixture
    def mock_user(self):
        user = MagicMock()
        user.id = 1
        user.is_active = False
        return user

    # ------------------- HAPPY PATH TESTS -------------------

    @pytest.mark.happy
    def test_successful_otp_verification(self, mocker, mock_user):
        """Correct OTP → user activated successfully"""
        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        verify_otp_mock = mocker.patch(
            "loginSignup.views.verify_otp",
            return_value=(True, "OTP verified")
        )

        data = {"user_id": mock_user.id, "otp": "123456"}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        assert response.status_code == 200
        assert response.data["message"].startswith("Registration completed")

        verify_otp_mock.assert_called_once_with(mock_user, "mobile_verify", "123456")
        assert mock_user.is_active is True
        mock_user.save.assert_called_once()

    @pytest.mark.happy
    def test_successful_otp_verification_with_different_otp(self, mocker, mock_user):
        """Same success but with a different OTP value."""
        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        verify_otp_mock = mocker.patch(
            "loginSignup.views.verify_otp",
            return_value=(True, "OTP verified")
        )

        data = {"user_id": mock_user.id, "otp": "654321"}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        assert response.status_code == 200
        assert "Registration completed" in response.data["message"]

        verify_otp_mock.assert_called_once_with(mock_user, "mobile_verify", "654321")
        assert mock_user.is_active
        mock_user.save.assert_called_once()

    # # ------------------- EDGE CASES -------------------

    # @pytest.mark.edge
    # def test_user_not_found(self, mocker):
    #     """User.objects.get raises DoesNotExist → 404"""
    #     mocker.patch(
    #         "loginSignup.views.User.objects.get",
    #         side_effect=Exception("DoesNotExist")
    #     )

    #     data = {"user_id": 999, "otp": "123456"}
    #     request = self.factory.post("/verify-mobile/", data, format="json")

    #     response = verify_mobile_otp(request)

    #     assert response.status_code == 404
    #     assert response.data["error"] == "User not found"

    @pytest.mark.edge
    def test_incorrect_otp(self, mocker, mock_user):
        """verify_otp returns False → invalid OTP"""
        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        mocker.patch("loginSignup.views.verify_otp", return_value=(False, "Invalid OTP"))

        data = {"user_id": mock_user.id, "otp": "wrongotp"}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        assert response.status_code == 400
        assert response.data["error"] == "Invalid OTP"
        assert mock_user.save.call_count == 0

    @pytest.mark.edge
    def test_empty_otp(self, mocker, mock_user):
        """Empty OTP → otp becomes None and verification succeeds."""
        
        # Mock DB lookup
        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)

        # Mock OTP verification → success
        verify_otp_mock = mocker.patch(
            "loginSignup.views.verify_otp",
            return_value=(True, "OTP verified")
        )

        # Simulate empty OTP
        data = {"user_id": mock_user.id, "otp": ""}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        # Assertions
        assert response.status_code == 200
        assert response.data["message"].startswith("Registration completed")

        # ❗ MUST assert otp becomes None
        verify_otp_mock.assert_called_once_with(mock_user, "mobile_verify", None)

        assert mock_user.is_active is True
        mock_user.save.assert_called_once()


    @pytest.mark.edge
    def test_missing_user_id(self, mocker):
        """Missing user_id should cause 404 via DoesNotExist branch."""
        mocker.patch(
            "loginSignup.views.User.objects.get",
            side_effect=Exception("DoesNotExist")
        )

        data = {"otp": "123456"}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        assert response.status_code == 404
        assert response.data["error"] == "User not found"

    @pytest.mark.edge
    def test_missing_otp(self, mocker, mock_user):
        """Missing OTP passed as None to verify_otp."""
        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        verify_otp_mock = mocker.patch(
            "loginSignup.views.verify_otp",
            return_value=(False, "OTP required")
        )

        data = {"user_id": mock_user.id}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        assert response.status_code == 400
        assert response.data["error"] == "OTP required"

        verify_otp_mock.assert_called_once_with(mock_user, "mobile_verify", None)
        assert mock_user.save.call_count == 0

    @pytest.mark.edge
    def test_user_already_active(self, mocker, mock_user):
        """Even if user is active, OTP success should return success."""
        mock_user.is_active = True

        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        mocker.patch("loginSignup.views.verify_otp", return_value=(True, "OTP verified"))

        data = {"user_id": mock_user.id, "otp": "123456"}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        assert response.status_code == 200
        assert "Registration completed" in response.data["message"]
        mock_user.save.assert_called_once()

    @pytest.mark.edge
    def test_user_id_and_otp_none(self, mocker):
        """If both are None → user not found"""
        mocker.patch(
            "loginSignup.views.User.objects.get",
            side_effect=Exception("DoesNotExist")
        )

        data = {}
        request = self.factory.post("/verify-mobile/", data, format="json")

        response = verify_mobile_otp(request)

        assert response.status_code == 404
        assert response.data["error"] == "User not found"

    @pytest.mark.edge
    def test_wrong_user_id_triggers_doesnotexist(self, mocker):
        """
        user_id provided but does NOT exist in DB → should hit except block
        and return 404 'User not found'.
        """
        # Fake user_id that doesn’t exist
        data = {"user_id": 9999, "otp": "123456"}

        # Ensure the view receives this request
        request = self.factory.post("/verify-mobile/", data, format="json")

        # IMPORTANT: mock the same User class used inside the view
        from loginSignup.views import User
        mocker.patch("loginSignup.views.User.objects.get", side_effect=User.DoesNotExist)

        # Call the view
        response = verify_mobile_otp(request)

        # Assertions
        assert response.status_code == 404
        assert response.data == {"error": "User not found"}
