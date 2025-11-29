import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


@pytest.mark.django_db
class TestCustomUserManager:

    def test_create_user_success(self):
        user = User.objects.create_user(
            full_name="John Doe",
            mobile_number="+911234567890",
            email_address="john@example.com",
            password="strongpassword123"
        )

        assert user.id is not None
        assert user.full_name == "John Doe"
        assert str(user.mobile_number) == "+911234567890"
        assert user.email_address == "john@example.com"
        assert user.check_password("strongpassword123") is True
        assert user.role == "farmer"   # default value

    def test_create_user_missing_email_raises_error(self):
        with pytest.raises(ValueError) as exc:
            User.objects.create_user(
                full_name="Test User",
                mobile_number="+911234567890",
                email_address=None,
                password="pass123"
            )
        assert "mobile number and an email address" in str(exc.value)

    def test_create_user_missing_mobile_raises_error(self):
        with pytest.raises(ValueError) as exc:
            User.objects.create_user(
                full_name="Test User",
                mobile_number=None,
                email_address="test@example.com",
                password="pass123"
            )
        assert "mobile number and an email address" in str(exc.value)

    def test_create_user_missing_both_raises_error(self):
        with pytest.raises(ValueError):
            User.objects.create_user(
                full_name="Test User",
                mobile_number=None,
                email_address=None,
                password="pass123"
            )

    def test_create_user_sets_unusable_password_when_none(self):
        user = User.objects.create_user(
            full_name="NoPass User",
            mobile_number="+911111111111",
            email_address="nopass@example.com",
            password=None
        )

        assert user.has_usable_password() is False

    def test_create_user_custom_role(self):
        user = User.objects.create_user(
            full_name="Officer User",
            mobile_number="+919999999999",
            email_address="officer@example.com",
            password="officer123",
            role="officer"
        )

        assert user.role == "officer"
