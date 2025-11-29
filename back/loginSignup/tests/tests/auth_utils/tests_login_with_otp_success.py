import pytest
from unittest.mock import patch, MagicMock
from rest_framework.response import Response
from loginSignup.auth_utils import login_with_otp_success
from loginSignup.models import User


@pytest.mark.django_db
class TestLoginWithOTPSuccess:

    @patch("loginSignup.auth_utils.RefreshToken")
    def test_login_with_otp_success_sets_cookies(self, mock_refresh):
        """Should return DRF Response and set access + refresh cookies correctly."""

        # Mock the RefreshToken instance
        mock_token_instance = MagicMock()
        mock_token_instance.access_token = "ACCESS123"
        mock_refresh.for_user.return_value = mock_token_instance
        mock_token_instance.__str__.return_value = "REFRESH123"

        # Create a test user
        user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="user@test.com",
            password="pass123"
        )

        response = login_with_otp_success(user)

        # Verify response
        assert isinstance(response, Response)
        assert response.data["message"] == "Login successful"

        # --- Verify cookies ---
        cookies = response.cookies

        assert "access_token" in cookies
        assert "refresh_token" in cookies

        # Correct values
        assert cookies["access_token"].value == "ACCESS123"
        assert cookies["refresh_token"].value == "REFRESH123"

        # Correct attributes
        assert cookies["access_token"]["httponly"] is True
        assert cookies["access_token"]["max-age"] == 300

        assert cookies["refresh_token"]["httponly"] is True
        assert cookies["refresh_token"]["max-age"] == 7 * 24 * 60 * 60

        # Ensure RefreshToken.for_user() was called correctly
        mock_refresh.for_user.assert_called_once_with(user)

    @patch("loginSignup.auth_utils.RefreshToken")
    def test_login_with_otp_success_uses_strings(self, mock_refresh):
        """Ensure the access and refresh tokens are converted to str."""
        mock_token_instance = MagicMock()
        mock_token_instance.access_token = MagicMock()
        mock_token_instance.__str__.return_value = "REFRESHXYZ"
        mock_refresh.for_user.return_value = mock_token_instance

        user = User.objects.create_user(
            full_name="Another User",
            mobile_number="+919999999999",
            email_address="another@test.com",
            password="pass123",
        )

        response = login_with_otp_success(user)

        assert isinstance(response, Response)
        assert "access_token" in response.cookies
        assert "refresh_token" in response.cookies

        # The actual assertion:
        assert isinstance(response.cookies["access_token"].value, str)
        assert isinstance(response.cookies["refresh_token"].value, str)

    @patch("loginSignup.auth_utils.RefreshToken")
    def test_login_with_otp_success_response_structure(self, mock_refresh):
        """Basic sanity check: response contains the expected structure."""
        mock_token = MagicMock()
        mock_token.access_token = "A"
        mock_token.__str__.return_value = "R"
        mock_refresh.for_user.return_value = mock_token

        user = User.objects.create_user(
            full_name="User X",
            mobile_number="+917700000000",
            email_address="x@test.com",
            password="pass123"
        )

        response = login_with_otp_success(user)

        assert response.status_code == 200
        assert response.data == {"message": "Login successful"}
