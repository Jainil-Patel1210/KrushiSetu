import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from loginSignup.authentication import CookieJWTAuthentication


@pytest.mark.django_db
class TestCookieJWTAuthentication:

    def setup_method(self):
        self.factory = APIRequestFactory()
        self.auth = CookieJWTAuthentication()

    def test_no_access_token_returns_none(self):
        """If no cookie is present → authentication returns None."""
        request = self.factory.get("/some-url/")

        result = self.auth.authenticate(request)

        assert result is None

    @patch("loginSignup.authentication.JWTAuthentication.get_validated_token")
    @patch("loginSignup.authentication.JWTAuthentication.get_user")
    def test_valid_token_authenticates_user(self, mock_get_user, mock_validate):
        """Valid token in cookies → user + token returned."""
        request = self.factory.get("/secure-url/")
        request.COOKIES["access_token"] = "VALIDTOKEN123"

        mock_token = MagicMock()
        mock_user = MagicMock()

        mock_validate.return_value = mock_token
        mock_get_user.return_value = mock_user

        user, token = self.auth.authenticate(request)

        mock_validate.assert_called_once_with("VALIDTOKEN123")
        mock_get_user.assert_called_once_with(mock_token)

        assert user == mock_user
        assert token == mock_token

    @patch("loginSignup.authentication.JWTAuthentication.get_validated_token")
    def test_invalid_token_raises_exception(self, mock_validate):
        """If token validation fails → propagate exception."""
        request = self.factory.get("/secure-url/")
        request.COOKIES["access_token"] = "BADTOKEN"

        mock_validate.side_effect = Exception("Invalid token")

        with pytest.raises(Exception):
            self.auth.authenticate(request)

    @patch("loginSignup.authentication.JWTAuthentication.get_validated_token")
    def test_cookie_present_but_empty_string(self, mock_validate):
        """Empty cookie string should cause validation error."""
        request = self.factory.get("/secure-url/")
        request.COOKIES["access_token"] = ""

        mock_validate.side_effect = Exception("Invalid token")

        with pytest.raises(Exception):
            self.auth.authenticate(request)

    @patch("loginSignup.authentication.JWTAuthentication.get_validated_token")
    def test_cookie_present_but_empty_string(self, mock_validate):
        """
        Empty cookie → authentication should return None
        and should NOT call token validator.
        """
        request = self.factory.get("/secure-url/")
        request.COOKIES["access_token"] = ""

        result = self.auth.authenticate(request)

        assert result is None
        mock_validate.assert_not_called()

