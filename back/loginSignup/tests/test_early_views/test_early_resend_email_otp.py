import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory
from rest_framework import status

from loginSignup.views import resend_email_otp

pytestmark = pytest.mark.django_db


class TestResendEmailOtp:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()

    # -------------------- HAPPY PATHS --------------------

    @pytest.mark.happy_path
    def test_resend_email_otp_success(self, django_user_model):
        user = django_user_model.objects.create(email_address="test@example.com")

        data = {"email_address": "test@example.com"}
        request = self.factory.post("/dummy-url/", data, format="json")

        with patch("loginSignup.views.send_otp") as mock_send:
            response = resend_email_otp(request)

        assert response.status_code == 200
        assert response.data == {"message": "Email OTP resent successfully"}
        mock_send.assert_called_once_with(user, "email_verify")

    @pytest.mark.happy_path
    def test_resend_email_otp_success_case_sensitive(self, django_user_model):
        user = django_user_model.objects.create(email_address="Test@Example.com")

        data = {"email_address": "Test@Example.com"}
        request = self.factory.post("/dummy-url/", data, format="json")

        with patch("loginSignup.views.send_otp") as mock_send:
            response = resend_email_otp(request)

        assert response.status_code == 200
        assert response.data == {"message": "Email OTP resent successfully"}
        mock_send.assert_called_once_with(user, "email_verify")

    # -------------------- EDGE CASES --------------------

    @pytest.mark.edge_case
    def test_resend_email_otp_missing_email(self):
        data = {}
        request = self.factory.post("/dummy-url/", data, format="json")

        response = resend_email_otp(request)

        assert response.status_code == 400
        assert response.data == {"error": "Email required"}

    @pytest.mark.edge_case
    def test_resend_email_otp_empty_email(self):
        data = {"email_address": ""}
        request = self.factory.post("/dummy-url/", data, format="json")

        response = resend_email_otp(request)

        assert response.status_code == 400
        assert response.data == {"error": "Email required"}

    @pytest.mark.edge_case
    def test_resend_email_otp_user_not_found(self):
        data = {"email_address": "notfound@example.com"}
        request = self.factory.post("/dummy-url/", data, format="json")

        response = resend_email_otp(request)

        assert response.status_code == 404
        assert response.data == {"error": "User not found"}

    @pytest.mark.edge_case
    def test_resend_email_otp_multiple_users_same_email(self, mocker, django_user_model):
        """
        Simulate multiple users by mocking filter().first(), 
        because DB cannot contain duplicates.
        """

        # create one real user
        user1 = django_user_model.objects.create(email_address="dupe@example.com")

        # mock filter().first() to return user1 ALWAYS
        mock_filter = mocker.patch(
            "loginSignup.views.User.objects.filter",
            return_value=MagicMock(first=lambda: user1)
        )

        # ALSO mock .get() to call filter().first()
        mocker.patch(
            "loginSignup.views.User.objects.get",
            side_effect=lambda email_address: mock_filter().first(),
        )

        data = {"email_address": "dupe@example.com"}
        request = self.factory.post("/dummy-url/", data, format="json")

        with patch("loginSignup.views.send_otp") as mock_send_otp:
            response = resend_email_otp(request)

        assert response.status_code == 200
        assert response.data == {"message": "Email OTP resent successfully"}
        mock_send_otp.assert_called_once_with(user1, "email_verify")

    @pytest.mark.edge_case
    def test_resend_email_otp_send_otp_raises_exception(self, django_user_model):
        user = django_user_model.objects.create(email_address="fail@example.com")

        data = {"email_address": "fail@example.com"}
        request = self.factory.post("/dummy-url/", data, format="json")

        with patch("loginSignup.views.send_otp", side_effect=Exception("OTP error")):
            with pytest.raises(Exception) as exc:
                resend_email_otp(request)

        assert "OTP error" in str(exc.value)
