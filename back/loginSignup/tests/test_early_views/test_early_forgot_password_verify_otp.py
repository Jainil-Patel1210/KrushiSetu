import pytest
from unittest.mock import MagicMock, patch

from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import forgot_password_verify_otp
from loginSignup.models import User


@pytest.mark.django_db
class TestForgotPasswordVerifyOtp:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()
        self.url = "/dummy-url/"

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            full_name="Test User",
            email_address="test@example.com",
            mobile_number="9999999999",
            password="pass123",
            aadhaar_number="123456789012",
            role="farmer"
        )

    # ---------- Missing Fields -----------

    def test_missing_email(self):
        request = self.factory.post(self.url, {"otp": "123456"}, format="json")
        response = forgot_password_verify_otp(request)
        assert response.status_code == 400
        assert response.data == {"error": "Email and OTP required"}

    def test_missing_otp(self):
        request = self.factory.post(self.url, {"email": "test@example.com"}, format="json")
        response = forgot_password_verify_otp(request)
        assert response.status_code == 400
        assert response.data == {"error": "Email and OTP required"}

    def test_missing_email_and_otp(self):
        request = self.factory.post(self.url, {}, format="json")
        response = forgot_password_verify_otp(request)
        assert response.status_code == 400
        assert response.data == {"error": "Email and OTP required"}

    # ---------- User Not Found -----------

    def test_user_not_found(self):
        with patch("loginSignup.views.User.objects.get") as mock_get:
            mock_get.side_effect = User.DoesNotExist

            data = {"email": "nope@example.com", "otp": "123456"}
            request = self.factory.post(self.url, data, format="json")
            response = forgot_password_verify_otp(request)

            assert response.status_code == 404
            assert response.data == {"error": "User not found"}

    # ---------- OTP Failure -----------

    def test_otp_failure(self, user):
        with patch("loginSignup.views.User.objects.get", return_value=user), \
             patch("loginSignup.views.verify_otp", return_value=(False, "OTP expired")):

            data = {"email": user.email_address, "otp": "999999"}
            request = self.factory.post(self.url, data, format="json")
            response = forgot_password_verify_otp(request)

            assert response.status_code == 400
            assert response.data == {"error": "OTP expired"}

    # ---------- OTP Success -----------

    def test_otp_success(self, user):
        with patch("loginSignup.views.User.objects.get", return_value=user), \
             patch("loginSignup.views.verify_otp", return_value=(True, "OK")) as mock_verify:

            data = {"email": user.email_address, "otp": "111111"}
            request = self.factory.post(self.url, data, format="json")
            response = forgot_password_verify_otp(request)

            assert response.status_code == 200
            assert response.data == {"message": "OTP verified successfully"}

            # Ensure verify_otp was called correctly
            mock_verify.assert_called_once_with(user, "forgot_password", "111111")

    # ---------- Edge: OTP as int -----------

    def test_otp_as_integer(self, user):
        with patch("loginSignup.views.User.objects.get", return_value=user), \
             patch("loginSignup.views.verify_otp", return_value=(True, "OK")):

            data = {"email": user.email_address, "otp": 123456}
            request = self.factory.post(self.url, data, format="json")
            response = forgot_password_verify_otp(request)

            assert response.status_code == 200
            assert response.data == {"message": "OTP verified successfully"}
