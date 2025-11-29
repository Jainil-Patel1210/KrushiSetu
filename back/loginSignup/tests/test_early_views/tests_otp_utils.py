import pytest
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from loginSignup.models import OTP
from loginSignup.otp_utils import (
    generate_otp,
    otp_is_expired,
    get_or_create_otp,
    OTP_EXPIRY_SECONDS,
)

User = get_user_model()


@pytest.mark.django_db
class TestOTPUtils:

    def test_generate_otp_is_six_digits(self):
        otp = generate_otp()
        assert len(otp) == 6
        assert otp.isdigit()

    def test_otp_is_expired_true(self):
        user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123"
        )

        otp_obj = OTP.objects.create(
            user=user,
            otp="123456",
            purpose="login",
        )

        # Must update AFTER creation due to auto_now_add=True
        otp_obj.created_at = timezone.now() - timedelta(seconds=OTP_EXPIRY_SECONDS + 1)
        otp_obj.save()

        assert otp_is_expired(otp_obj) is True


    def test_otp_is_expired_false(self):
        user = User.objects.create_user(
            full_name="User2",
            mobile_number="+911234567891",
            email_address="test2@example.com",
            password="pass123"
        )

        otp_obj = OTP.objects.create(
            user=user,
            otp="654321",
            purpose="login",
            created_at=timezone.now(),
        )

        assert otp_is_expired(otp_obj) is False

    def test_get_or_create_otp_creates_new_otp(self):
        user = User.objects.create_user(
            full_name="User3",
            mobile_number="+911234567892",
            email_address="u3@example.com",
            password="pass123"
        )

        otp_obj = get_or_create_otp(user, "login")

        assert isinstance(otp_obj, OTP)
        assert otp_obj.user == user
        assert otp_obj.otp.isdigit()
        assert len(otp_obj.otp) == 6

    def test_get_or_create_otp_returns_existing_if_not_expired(self):
        user = User.objects.create_user(
            full_name="User4",
            mobile_number="+911234567893",
            email_address="u4@example.com",
            password="pass123"
        )

        otp_obj1 = get_or_create_otp(user, "login")
        otp_before = otp_obj1.otp

        otp_obj2 = get_or_create_otp(user, "login")

        # Should NOT regenerate
        assert otp_obj1.id == otp_obj2.id
        assert otp_before == otp_obj2.otp

    def test_get_or_create_otp_regenerates_when_expired(self, monkeypatch):
        user = User.objects.create_user(
            full_name="User5",
            mobile_number="+911234567894",
            email_address="u5@example.com",
            password="pass123"
        )

        otp_obj = get_or_create_otp(user, "login")

        # Manually set OTP expiry
        OTP.objects.filter(id=otp_obj.id).update(
            created_at=timezone.now() - timedelta(seconds=OTP_EXPIRY_SECONDS + 1)
        )

        old_otp = otp_obj.otp
        otp_obj_refreshed = get_or_create_otp(user, "login")

        assert otp_obj_refreshed.otp != old_otp
        assert otp_obj_refreshed.attempts == 0
        assert otp_obj_refreshed.created_at > otp_obj.created_at

import pytest
from unittest.mock import patch, MagicMock
from django.utils import timezone
from datetime import timedelta
from loginSignup.models import User, OTP
from loginSignup.otp_utils import send_sms, send_otp, OTP_EXPIRY_SECONDS
from django.conf import settings


@pytest.mark.django_db
class TestSMSAndOTPDelivery:

    @patch("loginSignup.otp_utils.Client")
    def test_send_sms_calls_twilio_correctly(self, mock_twilio_client):
        """Ensure Twilio client is called with correct arguments."""
        mock_instance = MagicMock()
        mock_twilio_client.return_value = mock_instance

        send_sms("+911234567890", "Hello Test")

        mock_instance.messages.create.assert_called_once_with(
            body="Hello Test",
            from_= settings.TWILIO_PHONE_NUMBER,
            to="+911234567890"
        )

    @patch("loginSignup.otp_utils.send_sms")
    @pytest.mark.django_db
    def test_send_otp_sms_called_for_mobile_purposes(self, mock_send_sms):
        """send_sms should be called only for login/mobile_verify."""
        user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123",
        )

        otp = send_otp(user, "login")

        # Ensure SMS was triggered
        mock_send_sms.assert_called_once()

        # Ensure OTP exists
        assert OTP.objects.filter(user=user, purpose="login").exists()
        assert otp == OTP.objects.get(user=user, purpose="login").otp

    @patch("loginSignup.otp_utils.send_sms")
    @pytest.mark.django_db
    def test_send_otp_sms_not_called_for_email_purposes(self, mock_send_sms):
        """send_sms should NOT be called for email_verify / forgot_password."""
        user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123",
        )

        send_otp(user, "forgot_password")

        # Ensure SMS was NOT triggered
        mock_send_sms.assert_not_called()

        # OTP still must be created
        assert OTP.objects.filter(user=user, purpose="forgot_password").exists()

import pytest
from unittest.mock import patch, MagicMock
from django.utils import timezone
from datetime import timedelta
from loginSignup.models import User, OTP
from loginSignup.otp_utils import (
    OTP_EXPIRY_SECONDS,
    send_otp,
    verify_otp,
)


@pytest.mark.django_db
class TestEmailOTPDelivery:

    @patch("loginSignup.otp_utils.EmailMultiAlternatives")
    @patch("loginSignup.otp_utils.render_to_string")
    def test_send_otp_sends_email_for_non_mobile_purposes(
        self, mock_render, mock_email_class
    ):
        """Ensure email is sent for email_verify / reset_password / account_security."""
        mock_render.return_value = "<html>Email Content</html>"
        mock_email = MagicMock()
        mock_email_class.return_value = mock_email

        user = User.objects.create_user(
            full_name="User A",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123",
        )

        otp = send_otp(user, "email_verify")

        # email created
        mock_email_class.assert_called_once()
        args, kwargs = mock_email_class.call_args

        assert kwargs["subject"] == "KrushiSetu - Email Verification"
        assert kwargs["to"] == ["test@example.com"]

        # rendered template called
        mock_render.assert_called_once()

        # html alternative attached
        mock_email.attach_alternative.assert_called_once()

        # email actually sent
        mock_email.send.assert_called_once()

        # returned otp string
        assert isinstance(otp, str)


    @patch("loginSignup.otp_utils.EmailMultiAlternatives")
    @patch("loginSignup.otp_utils.render_to_string")
    def test_send_otp_uses_default_email_config_for_unknown_purpose(
        self, mock_render, mock_email_class
    ):
        """Unknown purpose → should fall back to default config."""
        mock_render.return_value = "<html>Default OTP Email</html>"
        mock_email = MagicMock()
        mock_email_class.return_value = mock_email

        user = User.objects.create_user(
            full_name="User B",
            mobile_number="+911111111111",
            email_address="default@example.com",
            password="pass123",
        )

        otp = send_otp(user, "some_random_purpose")

        args, kwargs = mock_email_class.call_args
        assert kwargs["subject"] == "KrushiSetu - OTP Verification"  # default
        assert kwargs["to"] == ["default@example.com"]
        assert isinstance(otp, str)

        mock_email.send.assert_called_once()


@pytest.mark.django_db
class TestVerifyOTP:

    def test_verify_otp_success(self):
        """Valid OTP should verify and delete the record."""
        user = User.objects.create_user(
            full_name="User",
            mobile_number="+911234567890",
            email_address="user@test.com",
            password="pass123",
        )

        otp_obj = OTP.objects.create(
            user=user,
            otp="123456",
            purpose="login",
        )

        otp_obj.created_at=timezone.now(),

        ok, msg = verify_otp(user, "login", "123456")

        assert ok is True
        assert msg == "OTP verified successfully"
        assert OTP.objects.count() == 0  # deleted


    def test_verify_otp_incorrect(self):
        """Incorrect OTP should increase attempts."""
        user = User.objects.create_user(
            full_name="User",
            mobile_number="+911234567890",
            email_address="wrong@test.com",
            password="pass123",
        )

        otp_obj = OTP.objects.create(
            user=user,
            otp="111111",
            purpose="login",
        )
        otp_obj.created_at=timezone.now(),

        ok, msg = verify_otp(user, "login", "000000")

        assert ok is False
        assert msg == "Invalid OTP"

        otp_obj.refresh_from_db()
        assert otp_obj.attempts == 1


    def test_verify_otp_expired(self):
        """Expired OTP should be deleted and fail."""
        user = User.objects.create_user(
            full_name="UserX",
            mobile_number="+919999999999",
            email_address="expire@test.com",
            password="pass123",
        )

        otp_obj = OTP.objects.create(
            user=user,
            otp="444444",
            purpose="login",
        )

        otp_obj.created_at=timezone.now() - timedelta(seconds=OTP_EXPIRY_SECONDS + 10)
        otp_obj.save()

        ok, msg = verify_otp(user, "login", "444444")

        assert ok is False
        assert msg == "OTP expired"
        assert OTP.objects.count() == 0


    def test_verify_otp_rejects_after_max_attempts(self):
        """If max attempts reached, delete OTP and fail."""
        user = User.objects.create_user(
            full_name="UserY",
            mobile_number="+918888888888",
            email_address="limit@test.com",
            password="pass123",
        )

        otp_obj = OTP.objects.create(
            user=user,
            otp="999999",
            purpose="login",
            attempts=3,  # MAX_ATTEMPTS
        )

        ok, msg = verify_otp(user, "login", "999999")

        assert ok is False
        assert msg == "Too many invalid attempts. OTP removed."
        assert OTP.objects.count() == 0


    def test_verify_otp_not_generated(self):
        """Should fail when no OTP exists for user+purpose."""
        user = User.objects.create_user(
            full_name="UserZ",
            mobile_number="+917777777777",
            email_address="nootp@test.com",
            password="pass123",
        )

        ok, msg = verify_otp(user, "login", "123456")

        assert ok is False
        assert msg == "OTP not generated"
