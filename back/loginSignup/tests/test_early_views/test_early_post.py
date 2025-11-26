"""
Unit tests for CustomTokenObtainPairView.post in loginSignup.views
"""

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework.response import Response

from loginSignup.views import CustomTokenObtainPairView, User


@pytest.fixture
def api_factory():
    return APIRequestFactory()


@pytest.fixture
def user_mock():
    """
    Mock user object with required attributes.
    """
    user = MagicMock()
    user.id = 1
    user.email_address = "test@example.com"
    user.full_name = "Test User"
    user.role = "admin"
    return user


class TestCustomTokenObtainPairViewPost:

    # -------------------------------------------------------
    # HAPPY PATH: SUCCESSFUL LOGIN
    # -------------------------------------------------------
    @pytest.mark.happy
    def test_login_successful_sets_cookies_and_returns_message(self, api_factory, user_mock):
        data = {
            "email_address": user_mock.email_address,
            "password": "correct_password",
            "role": "admin",
            "remember": False,
        }
        request = api_factory.post("/login/", data, format="json")

        # Mock parent JWT response
        super_response = Response({
            "refresh": "refresh_token",
            "access": "access_token",
            "user": {"id": user_mock.id}
        })
        super_response.status_code = 200

        with patch("loginSignup.views.User.objects.get", return_value=user_mock), \
             patch("rest_framework_simplejwt.views.TokenObtainPairView.post", return_value=super_response):

            user_mock.check_password.return_value = True

            response = CustomTokenObtainPairView.as_view()(request)

        assert response.status_code == 200
        assert response.data["message"] == "Login successful"

        # Cookies created
        assert response.cookies["access_token"].value == "access_token"
        assert response.cookies["refresh_token"].value == "refresh_token"

        # Expiry
        assert response.cookies["access_token"]["max-age"] == int("300")
        assert response.cookies["refresh_token"]["max-age"] == int(7 * 24 * 3600)

        # Security flags
        assert response.cookies["access_token"]["httponly"]
        assert response.cookies["access_token"]["secure"]
        assert response.cookies["access_token"]["samesite"] == "None"

    # -------------------------------------------------------
    # HAPPY PATH: REMEMBER ME
    # -------------------------------------------------------
    @pytest.mark.happy
    def test_login_successful_with_remember_sets_longer_cookies(self, api_factory, user_mock):
        data = {
            "email_address": user_mock.email_address,
            "password": "correct_password",
            "role": "admin",
            "remember": True,
        }
        request = api_factory.post("/login/", data, format="json")

        super_response = Response({
            "refresh": "refresh_token",
            "access": "access_token",
            "user": {"id": user_mock.id}
        })
        super_response.status_code = 200

        with patch("loginSignup.views.User.objects.get", return_value=user_mock), \
             patch("rest_framework_simplejwt.views.TokenObtainPairView.post", return_value=super_response):

            user_mock.check_password.return_value = True

            response = CustomTokenObtainPairView.as_view()(request)

        assert response.status_code == 200
        assert response.cookies["access_token"]["max-age"] == int("86400")
        assert response.cookies["refresh_token"]["max-age"] == int(30 * 24 * 3600)

    # -------------------------------------------------------
    # ERROR CASES
    # -------------------------------------------------------
    @pytest.mark.edge
    @pytest.mark.parametrize(
        "data", [
            {"password": "pw", "role": "admin"},         # missing email
            {"email_address": "x", "role": "admin"},     # missing password
            {"email_address": "x", "password": "pw"},    # missing role
            {},                                          # missing all
        ]
    )
    def test_missing_required_fields_returns_400(self, api_factory, data):
        request = api_factory.post("/login/", data, format="json")
        response = CustomTokenObtainPairView.as_view()(request)

        assert response.status_code == 400
        assert "required" in response.data["error"]

    @pytest.mark.edge
    def test_email_not_registered_returns_404(self, api_factory):
        data = {
            "email_address": "notfound@example.com",
            "password": "pw",
            "role": "admin",
        }
        request = api_factory.post("/login/", data, format="json")

        with patch("loginSignup.views.User.objects.get", side_effect=User.DoesNotExist):
            response = CustomTokenObtainPairView.as_view()(request)

        assert response.status_code == 404
        assert "Email not registered" in response.data["error"]

    @pytest.mark.edge
    def test_role_mismatch_returns_400(self, api_factory, user_mock):
        data = {
            "email_address": user_mock.email_address,
            "password": "correct_password",
            "role": "user",  # wrong
        }
        request = api_factory.post("/login/", data, format="json")

        with patch("loginSignup.views.User.objects.get", return_value=user_mock):
            response = CustomTokenObtainPairView.as_view()(request)

        assert response.status_code == 400
        assert "Role does not match" in response.data["error"]

    @pytest.mark.edge
    def test_incorrect_password_returns_400(self, api_factory, user_mock):
        data = {
            "email_address": user_mock.email_address,
            "password": "incorrect",
            "role": "admin",
        }
        request = api_factory.post("/login/", data, format="json")

        with patch("loginSignup.views.User.objects.get", return_value=user_mock):

            user_mock.check_password.return_value = False

            response = CustomTokenObtainPairView.as_view()(request)

        assert response.status_code == 400
        assert "Incorrect password" in response.data["error"]

    @pytest.mark.edge
    def test_super_post_returns_non_200(self, api_factory, user_mock):
        data = {
            "email_address": user_mock.email_address,
            "password": "correct_password",
            "role": "admin",
        }
        request = api_factory.post("/login/", data, format="json")

        mock_response = Response({"detail": "Invalid credentials"})
        mock_response.status_code = 401

        with patch("loginSignup.views.User.objects.get", return_value=user_mock), \
             patch("rest_framework_simplejwt.views.TokenObtainPairView.post", return_value=mock_response):

            user_mock.check_password.return_value = True

            response = CustomTokenObtainPairView.as_view()(request)

        assert response.status_code == 401
        assert "detail" in response.data
        assert "access_token" not in response.cookies
        assert "refresh_token" not in response.cookies
