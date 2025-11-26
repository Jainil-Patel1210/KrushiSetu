"""
Unit tests for LoginOtpView.post in loginSignup/views.py
"""

import pytest
from unittest.mock import patch

from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import LoginOtpView

pytestmark = pytest.mark.django_db


class TestLoginOtpViewPost:
    @pytest.fixture(autouse=True)
    def setup(self, db, django_user_model):
        self.factory = APIRequestFactory()
        self.User = django_user_model
        self.mobile_number = "1234567890"

        self.user = self.User.objects.create_user(
            email_address="test@example.com",
            password="testpass123",
            mobile_number=self.mobile_number,
            full_name="Test User",
            role="user"
        )

    # ---------------------------------------------------
    # HAPPY PATH
    # ---------------------------------------------------
    @pytest.mark.happy_path
    def test_post_valid_mobile_otp_sent(self):
        data = {"mobile_number": self.mobile_number}
        request = self.factory.post("/login-otp/", data, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = LoginOtpView.as_view()(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["message"] == "OTP sent"
        assert response.data["user_id"] == self.user.id
        mock_send_otp.assert_called_once_with(self.user, "login")

    @pytest.mark.happy_path
    def test_post_mobile_with_leading_trailing_spaces_should_still_work(self):
        """
        PhoneNumberField normalizes whitespace → should still find the user.
        """
        data = {"mobile_number": f"   {self.mobile_number}   "}
        request = self.factory.post("/login-otp/", data, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = LoginOtpView.as_view()(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["user_id"] == self.user.id
        mock_send_otp.assert_called_once()

    # ---------------------------------------------------
    # EDGE CASES
    # ---------------------------------------------------
    @pytest.mark.edge_case
    def test_post_missing_mobile_number(self):
        request = self.factory.post("/login-otp/", {}, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = LoginOtpView.as_view()(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_post_mobile_number_not_registered(self):
        request = self.factory.post(
            "/login-otp/", {"mobile_number": "9999999999"}, format="json"
        )

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = LoginOtpView.as_view()(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_post_mobile_number_is_empty_string(self):
        request = self.factory.post(
            "/login-otp/", {"mobile_number": ""}, format="json"
        )

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = LoginOtpView.as_view()(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_post_mobile_number_is_none(self):
        request = self.factory.post(
            "/login-otp/", {"mobile_number": None}, format="json"
        )

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = LoginOtpView.as_view()(request)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data["error"] == "User not found"
        mock_send_otp.assert_not_called()

    @pytest.mark.edge_case
    def test_post_mobile_number_is_integer_raises_typeerror(self):
        """
        PhoneNumberField raises TypeError when input is an integer.
        """
        request = self.factory.post(
            "/login-otp/", {"mobile_number": 1234567890}, format="json"
        )

        with pytest.raises(TypeError):
            LoginOtpView.as_view()(request)

    @pytest.mark.edge_case
    def test_post_mobile_number_is_list_raises_typeerror(self):
        """
        PhoneNumberField raises TypeError for non-string types like list.
        """
        request = self.factory.post(
            "/login-otp/", {"mobile_number": [self.mobile_number]}, format="json"
        )

        with pytest.raises(TypeError):
            LoginOtpView.as_view()(request)
