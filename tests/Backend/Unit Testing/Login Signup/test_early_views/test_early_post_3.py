"""
Unit tests for VerifyOTPView.post in loginSignup.views

Covers:
- Happy paths: correct OTP, remember True/False, correct user
- Edge cases: missing fields, user not found, OTP failure, various remember values

All external dependencies (verify_otp, User, RefreshToken) are mocked.
"""

import pytest
from unittest.mock import patch, MagicMock

from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import VerifyOTPView

# Fixtures for shared setup

@pytest.fixture
def api_factory():
    return APIRequestFactory()

@pytest.fixture
def user_mock():
    user = MagicMock()
    user.id = 42
    user.email_address = "test@example.com"
    user.full_name = "Test User"
    user.role = "customer"
    return user

@pytest.fixture
def refresh_token_mock():
    refresh = MagicMock()
    refresh.access_token = "access.jwt.token"
    refresh.__str__.return_value = "refresh.jwt.token"
    return refresh

@pytest.fixture
def patch_user_get(user_mock):
    with patch("loginSignup.views.User.objects.get") as get_mock:
        get_mock.return_value = user_mock
        yield get_mock

@pytest.fixture
def patch_verify_otp():
    with patch("loginSignup.views.verify_otp") as verify_otp_mock:
        yield verify_otp_mock

@pytest.fixture
def patch_refresh_token(refresh_token_mock):
    with patch("loginSignup.views.RefreshToken") as refresh_token_cls:
        refresh_token_cls.for_user.return_value = refresh_token_mock
        yield refresh_token_cls

@pytest.fixture
def view_instance():
    return VerifyOTPView.as_view()

# ------------------- TEST CLASS -------------------

class TestVerifyOTPViewPost:

    # ------------------- HAPPY PATHS -------------------

    @pytest.mark.happy
    def test_successful_otp_verification_remember_false(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test successful OTP verification with remember=False (default).
        Should return 200, set cookies with short expiry, and user info.
        """
        patch_verify_otp.return_value = (True, "OTP verified")
        data = {"user_id": user_mock.id, "otp": "123456"}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        assert response.status_code == 200
        assert response.data["message"] == "Login successful"
        assert response.data["user"]["id"] == user_mock.id
        assert response.cookies["access_token"]["max-age"] == 300
        assert response.cookies["refresh_token"]["max-age"] == 7 * 24 * 3600
        assert response.cookies["access_token"]["httponly"]
        assert response.cookies["refresh_token"]["httponly"]

    @pytest.mark.happy
    def test_successful_otp_verification_remember_true(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test successful OTP verification with remember=True.
        Should set cookies with long expiry.
        """
        patch_verify_otp.return_value = (True, "OTP verified")
        data = {"user_id": user_mock.id, "otp": "654321", "remember": True}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        assert response.status_code == 200
        assert response.data["message"] == "Login successful"
        assert response.cookies["access_token"]["max-age"] == 86400
        assert response.cookies["refresh_token"]["max-age"] == 30 * 24 * 3600

    @pytest.mark.happy
    def test_successful_otp_verification_remember_string_true(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test successful OTP verification with remember="true" (string).
        Should treat as True and set long expiry.
        """
        patch_verify_otp.return_value = (True, "OTP verified")
        data = {"user_id": user_mock.id, "otp": "654321", "remember": "true"}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        # Django REST Framework parses JSON booleans, but if string is passed, it may be treated as True
        # This test ensures robustness if frontend sends "true" as string
        # The view uses remember = request.data.get("remember", False)
        # So "true" is truthy in Python
        assert response.status_code == 200
        assert response.cookies["access_token"]["max-age"] == 86400
        assert response.cookies["refresh_token"]["max-age"] == 30 * 24 * 3600

    # ------------------- EDGE CASES -------------------

    @pytest.mark.edge
    def test_missing_user_id(
        self, api_factory, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test missing user_id in request data.
        Should return 404 (user not found).
        """
        data = {"otp": "123456"}
        request = api_factory.post("/verify-otp/", data, format="json")

        # Patch User.objects.get to raise DoesNotExist
        patch_user_get.side_effect = Exception("DoesNotExist")

        response = view_instance(request)

        assert response.status_code == 404
        assert "error" in response.data
        assert "User not found" in response.data["error"]

    @pytest.mark.edge
    def test_user_not_found(
        self, api_factory, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        data = {"user_id": 42, "otp": "123456"}

        # IMPORTANT: use User.DoesNotExist, not plain Exception.
        from loginSignup.views import User
        patch_user_get.side_effect = User.DoesNotExist

        request = api_factory.post("/verify-otp/", data, format="json")
        response = view_instance(request)

        assert response.status_code == 404
        assert "User not found" in response.data["error"]


    @pytest.mark.edge
    def test_missing_otp(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test missing OTP in request data.
        Should call verify_otp with None and likely fail.
        """
        patch_verify_otp.return_value = (False, "OTP required")
        data = {"user_id": user_mock.id}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        assert response.status_code == 400
        assert "error" in response.data
        assert "OTP required" in response.data["error"]

    @pytest.mark.edge
    def test_incorrect_otp(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test incorrect OTP (verify_otp returns False).
        Should return 400 with error message.
        """
        patch_verify_otp.return_value = (False, "OTP incorrect")
        data = {"user_id": user_mock.id, "otp": "badotp"}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        assert response.status_code == 400
        assert "error" in response.data
        assert "OTP incorrect" in response.data["error"]

    @pytest.mark.edge
    def test_remember_field_false_string(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test remember field as string "false".
        Should treat as truthy (since non-empty string), but this is a frontend bug.
        """
        patch_verify_otp.return_value = (True, "OTP verified")
        data = {"user_id": user_mock.id, "otp": "123456", "remember": "false"}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        # "false" as string is truthy, so long expiry is set
        assert response.status_code == 200
        assert response.cookies["access_token"]["max-age"] == 86400
        assert response.cookies["refresh_token"]["max-age"] == 30 * 24 * 3600

    @pytest.mark.edge
    def test_remember_field_none(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test remember field as None.
        Should default to short expiry.
        """
        patch_verify_otp.return_value = (True, "OTP verified")
        data = {"user_id": user_mock.id, "otp": "123456", "remember": None}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        assert response.status_code == 200
        assert response.cookies["access_token"]["max-age"] == 300
        assert response.cookies["refresh_token"]["max-age"] == 7 * 24 * 3600

    @pytest.mark.edge
    def test_remember_field_integer(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test remember field as integer 1 (truthy).
        Should set long expiry.
        """
        patch_verify_otp.return_value = (True, "OTP verified")
        data = {"user_id": user_mock.id, "otp": "123456", "remember": 1}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        assert response.status_code == 200
        assert response.cookies["access_token"]["max-age"] == 86400
        assert response.cookies["refresh_token"]["max-age"] == 30 * 24 * 3600

    @pytest.mark.edge
    def test_remember_field_integer_zero(
        self, api_factory, user_mock, patch_user_get, patch_verify_otp, patch_refresh_token, view_instance
    ):
        """
        Test remember field as integer 0 (falsy).
        Should set short expiry.
        """
        patch_verify_otp.return_value = (True, "OTP verified")
        data = {"user_id": user_mock.id, "otp": "123456", "remember": 0}
        request = api_factory.post("/verify-otp/", data, format="json")

        response = view_instance(request)

        assert response.status_code == 200
        assert response.cookies["access_token"]["max-age"] == 300
        assert response.cookies["refresh_token"]["max-age"] == 7 * 24 * 3600

    