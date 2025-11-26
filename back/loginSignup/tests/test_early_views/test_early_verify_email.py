"""
Unit tests for the verify_email function in loginSignup.views.
Covers happy paths and edge cases using pytest and pytest markers.
Mocks external dependencies: verify_otp and send_otp.
"""

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import verify_email

pytestmark = pytest.mark.django_db  # Ensures DB access for User model

# Helper: get User model
from django.contrib.auth import get_user_model
User = get_user_model()


@pytest.fixture
def api_factory():
    """Provides an APIRequestFactory instance."""
    return APIRequestFactory()


@pytest.fixture
def user(db):
    """Creates and returns a test user."""
    return User.objects.create(email_address="test@example.com")


class TestVerifyEmail:
    # -------------------- HAPPY PATHS --------------------

    @pytest.mark.happy
    def test_successful_email_verification(self, api_factory, user):
        """
        Test that verify_email returns success when correct email and OTP are provided.
        """
        data = {"email_address": user.email_address, "otp": "123456"}
        request = api_factory.post("/fake-url/", data, format="json")

        with patch("loginSignup.views.verify_otp", return_value=(True, "OK")) as mock_verify_otp, \
             patch("loginSignup.views.send_otp") as mock_send_otp:
            response = verify_email(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Email verified. OTP sent to your mobile."
        assert response.data["user_id"] == user.id
        mock_verify_otp.assert_called_once_with(user, "email_verify", "123456")
        mock_send_otp.assert_called_once_with(user, "mobile_verify")

    @pytest.mark.happy
    def test_successful_email_verification_with_different_otp(self, api_factory, user):
        """
        Test that verify_email works with a different valid OTP.
        """
        data = {"email_address": user.email_address, "otp": "654321"}
        request = api_factory.post("/fake-url/", data, format="json")

        with patch("loginSignup.views.verify_otp", return_value=(True, "OK")) as mock_verify_otp, \
             patch("loginSignup.views.send_otp") as mock_send_otp:
            response = verify_email(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "Email verified. OTP sent to your mobile."
        assert response.data["user_id"] == user.id
        mock_verify_otp.assert_called_once_with(user, "email_verify", "654321")
        mock_send_otp.assert_called_once_with(user, "mobile_verify")

    # -------------------- EDGE CASES --------------------

    @pytest.mark.edge
    def test_missing_email(self, api_factory):
        """
        Test that verify_email returns 400 if email is missing.
        """
        data = {"otp": "123456"}
        request = api_factory.post("/fake-url/", data, format="json")

        response = verify_email(request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Email and OTP required"

    @pytest.mark.edge
    def test_missing_otp(self, api_factory):
        """
        Test that verify_email returns 400 if OTP is missing.
        """
        data = {"email_address": "test@example.com"}
        request = api_factory.post("/fake-url/", data, format="json")

        response = verify_email(request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Email and OTP required"

    @pytest.mark.edge
    def test_missing_both_email_and_otp(self, api_factory):
        """
        Test that verify_email returns 400 if both email and OTP are missing.
        """
        data = {}
        request = api_factory.post("/fake-url/", data, format="json")

        response = verify_email(request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Email and OTP required"

    @pytest.mark.edge
    def test_user_not_found(self, api_factory):
        """
        Test that verify_email returns 404 if user with given email does not exist.
        """
        data = {"email_address": "nonexistent@example.com", "otp": "123456"}
        request = api_factory.post("/fake-url/", data, format="json")

        response = verify_email(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"

    @pytest.mark.edge
    def test_invalid_otp(self, api_factory, user):
        """
        Test that verify_email returns 400 if OTP verification fails.
        """
        data = {"email_address": user.email_address, "otp": "wrongotp"}
        request = api_factory.post("/fake-url/", data, format="json")

        with patch("loginSignup.views.verify_otp", return_value=(False, "Invalid OTP")) as mock_verify_otp, \
             patch("loginSignup.views.send_otp") as mock_send_otp:
            response = verify_email(request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Invalid OTP"
        mock_verify_otp.assert_called_once_with(user, "email_verify", "wrongotp")
        mock_send_otp.assert_not_called()

    @pytest.mark.edge
    def test_verify_otp_raises_exception(self, api_factory, user):
        """
        Test that verify_email handles unexpected exceptions from verify_otp gracefully.
        """
        data = {"email_address": user.email_address, "otp": "123456"}
        request = api_factory.post("/fake-url/", data, format="json")

        with patch("loginSignup.views.verify_otp", side_effect=Exception("Unexpected error")), \
             patch("loginSignup.views.send_otp") as mock_send_otp:
            # Since the function does not catch this, it will propagate; test for that
            with pytest.raises(Exception) as excinfo:
                verify_email(request)
            assert "Unexpected error" in str(excinfo.value)
            mock_send_otp.assert_not_called()

    @pytest.mark.edge
    def test_send_otp_raises_exception(self, api_factory, user):
        """
        Test that verify_email propagates exceptions from send_otp.
        """
        data = {"email_address": user.email_address, "otp": "123456"}
        request = api_factory.post("/fake-url/", data, format="json")

        with patch("loginSignup.views.verify_otp", return_value=(True, "OK")), \
             patch("loginSignup.views.send_otp", side_effect=Exception("Send OTP failed")):
            with pytest.raises(Exception) as excinfo:
                verify_email(request)
            assert "Send OTP failed" in str(excinfo.value)

    @pytest.mark.edge
    def test_email_case_sensitivity(self, api_factory, user):
        """
        Test that verify_email is case-sensitive for email addresses.
        """
        data = {"email_address": user.email_address.upper(), "otp": "123456"}
        request = api_factory.post("/fake-url/", data, format="json")

        response = verify_email(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"

    @pytest.mark.edge
    def test_empty_email_and_otp(self, api_factory):
        """
        Test that verify_email returns 400 if email and OTP are empty strings.
        """
        data = {"email_address": "", "otp": ""}
        request = api_factory.post("/fake-url/", data, format="json")

        response = verify_email(request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data["error"] == "Email and OTP required"