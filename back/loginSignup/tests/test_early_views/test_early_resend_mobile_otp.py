import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import resend_mobile_otp
from loginSignup.models import User   # <-- Needed for raising User.DoesNotExist


class TestResendMobileOtp:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()

    # ------------------- HAPPY PATH -------------------

    @pytest.mark.happy
    def test_resend_mobile_otp_success(self, mocker):
        """Valid user_id → OTP resent successfully"""
        mock_user = MagicMock(id=1)

        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        send_mock = mocker.patch("loginSignup.views.send_otp")

        data = {"user_id": 1}
        request = self.factory.post("/resend-mobile/", data, format="json")

        response = resend_mobile_otp(request)

        assert response.status_code == 200
        assert response.data == {"message": "Mobile OTP resent successfully"}
        send_mock.assert_called_once_with(mock_user, "mobile_verify")

    @pytest.mark.happy
    def test_resend_mobile_otp_with_different_id(self, mocker):
        """Ensure resend works for any user_id"""
        mock_user = MagicMock(id=99)

        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        send_mock = mocker.patch("loginSignup.views.send_otp")

        data = {"user_id": 99}
        request = self.factory.post("/resend-mobile/", data, format="json")

        response = resend_mobile_otp(request)

        assert response.status_code == 200
        send_mock.assert_called_once_with(mock_user, "mobile_verify")

    # ------------------- EDGE CASES -------------------

    @pytest.mark.edge
    def test_user_not_found(self, mocker):
        """User.objects.get → User.DoesNotExist → return 404"""

        mocker.patch(
            "loginSignup.views.User.objects.get",
            side_effect=User.DoesNotExist   # <-- FIXED
        )

        data = {"user_id": 999}
        request = self.factory.post("/resend-mobile/", data, format="json")

        response = resend_mobile_otp(request)

        assert response.status_code == 404
        assert response.data == {"error": "User not found"}

    @pytest.mark.edge
    def test_missing_user_id(self, mocker):
        """Missing user_id → return 404 via DoesNotExist"""

        mocker.patch(
            "loginSignup.views.User.objects.get",
            side_effect=User.DoesNotExist   # <-- FIXED
        )

        data = {}  # no user_id
        request = self.factory.post("/resend-mobile/", data, format="json")

        response = resend_mobile_otp(request)

        assert response.status_code == 404
        assert response.data == {"error": "User not found"}

    @pytest.mark.edge
    def test_user_id_none(self, mocker):
        """user_id=None → return 404 via DoesNotExist"""

        mocker.patch(
            "loginSignup.views.User.objects.get",
            side_effect=User.DoesNotExist   # <-- FIXED
        )

        data = {"user_id": None}
        request = self.factory.post("/resend-mobile/", data, format="json")

        response = resend_mobile_otp(request)

        assert response.status_code == 404
        assert response.data == {"error": "User not found"}

    @pytest.mark.edge
    def test_send_otp_error_propagates(self, mocker):
        """If send_otp raises exception → should not be caught"""

        mock_user = MagicMock(id=1)

        mocker.patch("loginSignup.views.User.objects.get", return_value=mock_user)
        mocker.patch("loginSignup.views.send_otp", side_effect=Exception("OTP failure"))

        data = {"user_id": 1}
        request = self.factory.post("/resend-mobile/", data, format="json")

        with pytest.raises(Exception) as excinfo:
            resend_mobile_otp(request)

        assert "OTP failure" in str(excinfo.value)
