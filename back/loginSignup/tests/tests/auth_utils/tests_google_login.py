import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status
from django.contrib.auth import get_user_model
from loginSignup.auth_utils import GoogleLoginView

User = get_user_model()


@pytest.mark.django_db
class TestGoogleLoginView:

    # 1. Valid Google token → successful login
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    @patch("loginSignup.auth_utils.RefreshToken")
    def test_google_login_success(self, mock_refresh, mock_verify):
        factory = APIRequestFactory()

        mock_verify.return_value = {
            "email": "test@example.com",
            "name": "John Doe"
        }

        # Mock tokens
        mock_refresh_instance = MagicMock()
        mock_refresh_instance.access_token = "ACCESS123"
        mock_refresh.for_user.return_value = mock_refresh_instance
        mock_refresh_instance.__str__.return_value = "REFRESH123"

        request = factory.post("/google-login/", {"token": "valid-token"})
        response = GoogleLoginView.as_view()(request)

        assert response.status_code == status.HTTP_200_OK
        assert User.objects.filter(email_address="test@example.com").exists()

        # Cookie checks
        cookies = response.cookies
        assert cookies["access_token"].value == "ACCESS123"
        assert int(cookies["access_token"]["max-age"]) == 300


    # 2. Should create new user if not exists
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    @patch("loginSignup.auth_utils.RefreshToken")
    def test_google_login_creates_new_user(self, mock_refresh, mock_verify):
        mock_verify.return_value = {
            "email": "newuser@example.com",
            "name": "New User"
        }

        mock_refresh_instance = MagicMock()
        mock_refresh_instance.access_token = "A1"
        mock_refresh.for_user.return_value = mock_refresh_instance
        mock_refresh_instance.__str__.return_value = "R1"

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "valid"})

        GoogleLoginView.as_view()(request)

        user = User.objects.get(email_address="newuser@example.com")
        assert user.full_name == "New User"


    # 3. Should NOT create a new user if already exists
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    @patch("loginSignup.auth_utils.RefreshToken")
    def test_google_login_existing_user(self, mock_refresh, mock_verify):
        user = User.objects.create_user(
            full_name="Existing User",
            email_address="exists@example.com",
            mobile_number="+910000000000",
            password="pass"
        )

        mock_verify.return_value = {
            "email": "exists@example.com",
            "name": "Should Not Update"
        }

        mock_refresh_instance = MagicMock()
        mock_refresh_instance.access_token = "AX"
        mock_refresh.for_user.return_value = mock_refresh_instance
        mock_refresh_instance.__str__.return_value = "RX"

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "valid-token"})
        response = GoogleLoginView.as_view()(request)

        assert response.status_code == 200
        user.refresh_from_db()
        assert user.full_name == "Existing User"  # unchanged


    # 4. Missing token in request
    def test_google_login_missing_token(self):
        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": None}, format="json")
        response = GoogleLoginView.as_view()(request)

        assert response.status_code == 400
        assert "error" in response.data


    # 5. Invalid Google token → verification fails
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    def test_google_login_invalid_token(self, mock_verify):
        mock_verify.side_effect = Exception("Invalid token")

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "bad-token"})
        response = GoogleLoginView.as_view()(request)

        assert response.status_code == 400
        assert response.data["error"] == "Invalid token"


    # 6. Google returns no email → should fail
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    def test_google_login_missing_email(self, mock_verify):
        mock_verify.return_value = {
            "name": "User Without Email"
        }

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "valid"})
        response = GoogleLoginView.as_view()(request)

        assert response.status_code == 400


    # 7. Cookies must be HttpOnly + secure + samesite=None
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    @patch("loginSignup.auth_utils.RefreshToken")
    def test_google_login_cookie_attributes(self, mock_refresh, mock_verify):
        mock_verify.return_value = {"email": "cookie@test.com"}

        mock_refresh_instance = MagicMock()
        mock_refresh_instance.access_token = "TOK"
        mock_refresh.for_user.return_value = mock_refresh_instance
        mock_refresh_instance.__str__.return_value = "REF"

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "valid"})
        response = GoogleLoginView.as_view()(request)

        cookies = response.cookies
        access_cookie = cookies["access_token"]

        assert access_cookie["httponly"] is True
        assert access_cookie["secure"] is True
        assert access_cookie["samesite"] == "None"


    # 8. JWT token generator is called with correct user
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    @patch("loginSignup.auth_utils.RefreshToken")
    def test_google_login_calls_refresh_for_user(self, mock_refresh, mock_verify):
        mock_verify.return_value = {
            "email": "abc@test.com",
            "name": "A B C"
        }

        mock_refresh_instance = MagicMock()
        mock_refresh_instance.access_token = "AAA"
        mock_refresh.for_user.return_value = mock_refresh_instance
        mock_refresh_instance.__str__.return_value = "RRR"

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "valid"})
        GoogleLoginView.as_view()(request)

        user = User.objects.get(email_address="abc@test.com")
        mock_refresh.for_user.assert_called_once_with(user)


    # 9. Should return full user info in response JSON
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    @patch("loginSignup.auth_utils.RefreshToken")
    def test_google_login_response_payload(self, mock_refresh, mock_verify):
        mock_verify.return_value = {
            "email": "xyz@test.com",
            "name": "XYZ"
        }

        mock_refresh_instance = MagicMock()
        mock_refresh_instance.access_token = "abc"
        mock_refresh.for_user.return_value = mock_refresh_instance
        mock_refresh_instance.__str__.return_value = "def"

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "valid"})
        response = GoogleLoginView.as_view()(request)

        data = response.data["user"]
        assert data["email"] == "xyz@test.com"
        assert data["full_name"] == "XYZ"
        assert "role" in data


    # 10. Internal unexpected exception handled gracefully
    @patch("loginSignup.auth_utils.id_token.verify_oauth2_token")
    def test_google_login_unexpected_exception(self, mock_verify):
        mock_verify.side_effect = RuntimeError("Crash")

        factory = APIRequestFactory()
        request = factory.post("/google-login/", {"token": "t"})
        response = GoogleLoginView.as_view()(request)

        assert response.status_code == 400
        assert "Crash" in response.data["error"]
