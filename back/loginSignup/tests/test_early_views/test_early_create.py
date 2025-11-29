"""
Unit tests for the `create` method of `UserSignupView`.

Covers:
- New user signup
- Existing inactive user → resend OTP
- Existing active user
- Password mismatch
- Missing fields / serializer validation errors

All external dependencies (send_otp, User model, serializer) are mocked.
"""

import pytest
from unittest.mock import MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import UserSignupView


@pytest.fixture
def api_factory():
    return APIRequestFactory()


@pytest.fixture
def mock_user(mocker):
    """
    Patch the User model as imported inside loginSignup.views.
    """
    return mocker.patch("loginSignup.views.User")


@pytest.fixture
def mock_send_otp(mocker):
    """
    Patch send_otp for the view.
    """
    return mocker.patch("loginSignup.views.send_otp")


@pytest.fixture
def mock_serializer_cls(mocker):
    """
    Correctly patch the serializer used by DRF through the view.
    """

    mock_serializer_class = MagicMock()      # mock of the serializer class
    mocker.patch.object(UserSignupView, "serializer_class", mock_serializer_class)

    return mock_serializer_class


class TestUserSignupViewCreate:

    # ------------------------------------------------------------------
    # HAPPY PATH 1: NEW USER SIGNUP
    # ------------------------------------------------------------------
    @pytest.mark.happy_path
    def test_create_new_user_success(self, api_factory, mock_user, mock_send_otp, mock_serializer_cls):
        data = {
            "email_address": "test@example.com",
            "password": "pass123",
            "confirm_password": "pass123",
            "full_name": "Test User",
            "mobile_number": "1234567890"
        }
        request = api_factory.post("/signup/", data, format="json")

        mock_user.objects.filter.return_value.first.return_value = None

        # Serializer instance mock
        mock_serializer = MagicMock()
        new_user = MagicMock()
        new_user.id = 42

        mock_serializer.save.return_value = new_user
        mock_serializer_cls.return_value = mock_serializer

        response = UserSignupView.as_view()(request)

        assert response.status_code == status.HTTP_201_CREATED
        assert "Signup successful" in response.data["message"]
        assert response.data["user_id"] == 42

        mock_send_otp.assert_called_once_with(new_user, "email_verify")
        new_user.save.assert_called()

    # ------------------------------------------------------------------
    # HAPPY PATH 2: EXISTING INACTIVE USER → RESEND OTP
    # ------------------------------------------------------------------
    @pytest.mark.happy_path
    def test_existing_inactive_user_resends_otp(self, api_factory, mock_user, mock_send_otp):
        data = {
            "email_address": "inactive@example.com",
            "password": "pass123",
            "confirm_password": "pass123",
            "full_name": "Inactive User",
            "mobile_number": "5555555555"
        }
        request = api_factory.post("/signup/", data, format="json")

        existing_user = MagicMock()
        existing_user.is_active = False
        existing_user.id = 99

        mock_user.objects.filter.return_value.first.return_value = existing_user

        response = UserSignupView.as_view()(request)

        assert response.status_code == 200
        assert "not verified" in response.data["message"]
        assert response.data["user_id"] == 99

        assert existing_user.full_name == "Inactive User"
        assert existing_user.mobile_number == "5555555555"
        existing_user.set_password.assert_called_once_with("pass123")
        existing_user.save.assert_called_once()
        mock_send_otp.assert_called_once_with(existing_user, "email_verify")

    # ------------------------------------------------------------------
    # HAPPY PATH 3: EXISTING ACTIVE USER → ERROR
    # ------------------------------------------------------------------
    @pytest.mark.happy_path
    def test_existing_active_user_returns_error(self, api_factory, mock_user, mock_send_otp):
        data = {
            "email_address": "active@example.com",
            "password": "pass123",
            "confirm_password": "pass123",
            "full_name": "Active User",
            "mobile_number": "1111111111"
        }
        request = api_factory.post("/signup/", data, format="json")

        existing_user = MagicMock()
        existing_user.is_active = True

        mock_user.objects.filter.return_value.first.return_value = existing_user

        response = UserSignupView.as_view()(request)

        assert response.status_code == 400
        assert "Account already exists" in response.data["error"]
        mock_send_otp.assert_not_called()

    # ------------------------------------------------------------------
    # EDGE CASES
    # ------------------------------------------------------------------

    @pytest.mark.edge_case
    def test_passwords_do_not_match(self, api_factory, mock_send_otp, mock_user):
        data = {
            "email_address": "mismatch@example.com",
            "password": "pass123",
            "confirm_password": "other",
            "full_name": "Test User",
            "mobile_number": "1234567890"
        }
        request = api_factory.post("/signup/", data, format="json")

        response = UserSignupView.as_view()(request)

        assert response.status_code == 400
        assert "Passwords do not match" in response.data["error"]
        mock_send_otp.assert_not_called()
        mock_user.objects.filter.assert_not_called()

    @pytest.mark.edge_case
    def test_missing_required_fields(self, api_factory, mock_user, mock_serializer_cls, mock_send_otp):
        data = {
            "password": "pass123",
            "confirm_password": "pass123",
            "full_name": "Test User",
            "mobile_number": "1234567890",
        }
        request = api_factory.post("/signup/", data, format="json")

        mock_user.objects.filter.return_value.first.return_value = None

        mock_serializer = MagicMock()
        mock_serializer.is_valid.side_effect = Exception("Validation error")
        mock_serializer_cls.return_value = mock_serializer

        with pytest.raises(Exception) as exc:
            UserSignupView.as_view()(request)

        assert "Validation error" in str(exc.value)
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_serializer_validation_error(self, api_factory, mock_user, mock_serializer_cls, mock_send_otp):
        data = {
            "email_address": "invalidemail",
            "password": "pass123",
            "confirm_password": "pass123",
            "full_name": "Test User",
            "mobile_number": "1234567890"
        }
        request = api_factory.post("/signup/", data, format="json")

        mock_user.objects.filter.return_value.first.return_value = None

        mock_serializer = MagicMock()
        mock_serializer.is_valid.side_effect = Exception("Invalid email")
        mock_serializer_cls.return_value = mock_serializer

        with pytest.raises(Exception) as exc:
            UserSignupView.as_view()(request)

        assert "Invalid email" in str(exc.value)
        mock_send_otp.assert_not_called()
