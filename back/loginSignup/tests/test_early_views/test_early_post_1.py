# test_views.py

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework.response import Response
from rest_framework import status

from loginSignup.views import CookieTokenRefreshView

@pytest.mark.usefixtures("rf")
class TestCookieTokenRefreshViewPost:
    """
    Unit tests for CookieTokenRefreshView.post method.
    """

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()
        self.view = CookieTokenRefreshView.as_view()
        self.url = "/api/token/refresh/"

    # -------------------- HAPPY PATHS --------------------

    @pytest.mark.happy_path
    def test_token_refresh_success(self):
        """
        Test that a valid refresh token in cookies returns a new access token and sets the cookie.
        """
        valid_refresh_token = "valid_refresh_token_string"
        # Patch RefreshToken to not actually validate JWT
        with patch("loginSignup.views.RefreshToken") as mock_refresh_token:
            mock_refresh = MagicMock()
            mock_access_token = "new_access_token_string"
            mock_refresh.access_token = mock_access_token
            mock_refresh_token.return_value = mock_refresh

            request = self.factory.post(self.url)
            request.COOKIES["refresh_token"] = valid_refresh_token

            response = self.view(request)

            assert response.status_code == 200
            assert response.data == {"message": "Token refreshed"}
            # Check that the access_token cookie is set with correct value and attributes
            cookies = response.cookies
            assert "access_token" in cookies
            cookie = cookies["access_token"]
            assert cookie.value == mock_access_token
            assert cookie["httponly"]
            assert cookie["secure"]
            assert cookie["samesite"] == "None"
            assert int(cookie["max-age"]) == 300

    # -------------------- EDGE CASES --------------------

    @pytest.mark.edge_case
    def test_no_refresh_token_in_cookies(self):
        """
        Test that if no refresh_token is present in cookies, returns 401 with appropriate error.
        """
        request = self.factory.post(self.url)
        # No refresh_token in cookies
        response = self.view(request)

        assert response.status_code == 401
        assert response.data == {"error": "No refresh token"}

    @pytest.mark.edge_case
    def test_invalid_refresh_token(self):
        """
        Test that an invalid refresh token returns 401 with appropriate error.
        """
        invalid_refresh_token = "invalid_refresh_token_string"
        with patch("loginSignup.views.RefreshToken", side_effect=Exception("Invalid token")):
            request = self.factory.post(self.url)
            request.COOKIES["refresh_token"] = invalid_refresh_token

            response = self.view(request)

            assert response.status_code == 401
            assert response.data == {"error": "Invalid refresh token"}

    @pytest.mark.edge_case
    def test_refresh_token_cookie_is_empty_string(self):
        """
        Test that an empty string as refresh_token in cookies is treated as missing and returns 401.
        """
        request = self.factory.post(self.url)
        request.COOKIES["refresh_token"] = ""

        response = self.view(request)

        assert response.status_code == 401
        assert response.data == {"error": "No refresh token"}

    @pytest.mark.edge_case
    def test_refresh_token_cookie_is_none(self):
        """
        Test that a None value as refresh_token in cookies is treated as missing and returns 401.
        """
        request = self.factory.post(self.url)
        request.COOKIES["refresh_token"] = None

        response = self.view(request)

        assert response.status_code == 401
        assert response.data == {"error": "No refresh token"}

    @pytest.mark.edge_case
    def test_refresh_token_cookie_is_whitespace(self):
        """
        Test that a whitespace string as refresh_token in cookies is treated as missing and returns 401.
        """
        request = self.factory.post(self.url)
        request.COOKIES["refresh_token"] = "   "

        response = self.view(request)

        assert response.status_code == 401
        assert response.data == {"error": "Invalid refresh token"}

    @pytest.mark.edge_case
    def test_refresh_token_raises_nonstandard_exception(self):
        """
        Test that if RefreshToken raises a non-standard exception, still returns 401 with error.
        """
        with patch("loginSignup.views.RefreshToken", side_effect=ValueError("Some error")):
            request = self.factory.post(self.url)
            request.COOKIES["refresh_token"] = "some_token"

            response = self.view(request)

            assert response.status_code == 401
            assert response.data == {"error": "Invalid refresh token"}