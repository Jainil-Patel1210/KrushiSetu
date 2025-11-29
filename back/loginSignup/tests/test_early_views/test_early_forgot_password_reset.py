import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status
from loginSignup.views import forgot_password_reset


# FIX: fixture must be OUTSIDE the class
@pytest.fixture
def mock_user_model():
    with patch("loginSignup.views.User") as mock_user:
        mock_user.DoesNotExist = type("DoesNotExist", (Exception,), {})
        yield mock_user


class TestForgotPasswordReset:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()

    # -------------- HAPPY PATH --------------
    @pytest.mark.happy_path
    def test_password_reset_successful(self, mock_user_model):
        email = "test@example.com"
        new_password = "newsecurepassword"

        user = MagicMock()
        mock_user_model.objects.get.return_value = user

        request = self.factory.post(
            "/forgot-password-reset/",
            {"email": email, "new_password": new_password},
            format="json"
        )

        response = forgot_password_reset(request)

        assert response.status_code == 200
        assert response.data == {"message": "Password reset successful"}
        mock_user_model.objects.get.assert_called_once_with(email_address=email)
        user.save.assert_called_once()

    # -------------- EDGE CASES --------------
    def test_missing_email(self):
        request = self.factory.post("/forgot-password-reset/", {"new_password": "pass"}, format="json")
        response = forgot_password_reset(request)
        assert response.status_code == 400

    def test_missing_new_password(self):
        request = self.factory.post("/forgot-password-reset/", {"email": "a@b.com"}, format="json")
        response = forgot_password_reset(request)
        assert response.status_code == 400

    def test_both_missing(self):
        request = self.factory.post("/forgot-password-reset/", {}, format="json")
        response = forgot_password_reset(request)
        assert response.status_code == 400

    def test_user_not_found(self, mock_user_model):
        mock_user_model.objects.get.side_effect = mock_user_model.DoesNotExist

        request = self.factory.post(
            "/forgot-password-reset/",
            {"email": "x@x.com", "new_password": "123"},
            format="json"
        )
        response = forgot_password_reset(request)
        assert response.status_code == 404
        assert response.data == {"error": "User not found"}

    def test_empty_email_and_password(self):
        request = self.factory.post("/forgot-password-reset/", {"email": "", "new_password": ""}, format="json")
        response = forgot_password_reset(request)
        assert response.status_code == 400

    def test_email_case_sensitivity(self, mock_user_model):
        mock_user_model.objects.get.side_effect = mock_user_model.DoesNotExist
        request = self.factory.post(
            "/forgot-password-reset/",
            {"email": "Test@Example.com", "new_password": "123"},
            format="json"
        )
        response = forgot_password_reset(request)
        assert response.status_code == 404

    def test_new_password_whitespace(self, mock_user_model):
        user = MagicMock()
        mock_user_model.objects.get.return_value = user

        request = self.factory.post(
            "/forgot-password-reset/",
            {"email": "test@example.com", "new_password": "   "},
            format="json"
        )
        response = forgot_password_reset(request)

        assert response.status_code == 200
        user.save.assert_called_once()

    def test_email_with_spaces(self, mock_user_model):
        mock_user_model.objects.get.side_effect = mock_user_model.DoesNotExist
        request = self.factory.post(
            "/forgot-password-reset/",
            {"email": "  test@example.com  ", "new_password": "pass"},
            format="json"
        )
        response = forgot_password_reset(request)
        assert response.status_code == 404
