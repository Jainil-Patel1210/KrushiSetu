# test_views_forgot_password_send_otp.py

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import forgot_password_send_otp

pytestmark = pytest.mark.django_db  # Ensures DB access for ORM calls

class TestForgotPasswordSendOtp:
    """
    Unit tests for the forgot_password_send_otp function in loginSignup.views.
    """

    @pytest.mark.happy_path
    def test_successful_otp_send(self, django_user_model):
        """
        Test that a valid email for an existing user triggers OTP send and returns success.
        """
        # Arrange
        user = django_user_model.objects.create(email_address="test@example.com")
        factory = APIRequestFactory()
        request = factory.post("/dummy-url/", {"email": "test@example.com"}, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            # Act
            response = forgot_password_send_otp(request)

        # Assert
        assert response.status_code == status.HTTP_200_OK
        assert response.data == {"success": "OTP sent to your email."}
        mock_send_otp.assert_called_once_with(user, "forgot_password")

    @pytest.mark.happy_path
    def test_successful_otp_send_with_extra_fields(self, django_user_model):
        """
        Test that extra fields in the request do not affect OTP sending for a valid user.
        """
        user = django_user_model.objects.create(email_address="extrafields@example.com")
        factory = APIRequestFactory()
        request = factory.post(
            "/dummy-url/",
            {"email": "extrafields@example.com", "foo": "bar"},
            format="json"
        )

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = forgot_password_send_otp(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == {"success": "OTP sent to your email."}
        mock_send_otp.assert_called_once_with(user, "forgot_password")

    @pytest.mark.edge_case
    def test_missing_email_field(self):
        """
        Test that missing 'email' in request returns 400 with appropriate error.
        """
        factory = APIRequestFactory()
        request = factory.post("/dummy-url/", {}, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = forgot_password_send_otp(request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data == {"error": "Email is required"}
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_empty_email_value(self):
        """
        Test that an empty string for 'email' returns 400 with appropriate error.
        """
        factory = APIRequestFactory()
        request = factory.post("/dummy-url/", {"email": ""}, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = forgot_password_send_otp(request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data == {"error": "Email is required"}
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_user_not_found(self):
        """
        Test that a non-existent email returns 404 with appropriate error.
        """
        factory = APIRequestFactory()
        request = factory.post("/dummy-url/", {"email": "notfound@example.com"}, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = forgot_password_send_otp(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data == {"error": "User not found"}
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_email_case_sensitivity(self, django_user_model):
        """
        Test that email matching is case-sensitive.
        """
        # Create user with lowercase email
        user = django_user_model.objects.create(email_address="casesensitive@example.com")
        factory = APIRequestFactory()
        # Use uppercase in request
        request = factory.post("/dummy-url/", {"email": "CaseSensitive@Example.com"}, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = forgot_password_send_otp(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data == {"error": "User not found"}
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_multiple_users_same_email(self, django_user_model):
        """
        Test behavior if multiple users exist with the same email (should not happen, but test for robustness).
        """
        # Create two users with the same email (if allowed by model)
        email = "duplicate@example.com"
        user1 = django_user_model.objects.create(email_address=email)
        # If unique constraint is enforced, this will raise, so we skip creating a second user.
        factory = APIRequestFactory()
        request = factory.post("/dummy-url/", {"email": email}, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = forgot_password_send_otp(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == {"success": "OTP sent to your email."}
        mock_send_otp.assert_called_once_with(user1, "forgot_password")

    @pytest.mark.edge_case
    def test_send_otp_raises_exception(self, django_user_model):
        """
        Test that if send_otp raises an exception, it propagates (or is not swallowed).
        """
        user = django_user_model.objects.create(email_address="raiseotp@example.com")
        factory = APIRequestFactory()
        request = factory.post("/dummy-url/", {"email": "raiseotp@example.com"}, format="json")

        with patch("loginSignup.views.send_otp", side_effect=Exception("OTP error")):
            with pytest.raises(Exception) as excinfo:
                forgot_password_send_otp(request)
            assert "OTP error" in str(excinfo.value)