import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


@pytest.mark.django_db
class TestCreateSuperuser:

    def test_create_superuser_success(self):
        """Superuser should be created with correct flags and role."""
        user = User.objects.create_superuser(
            full_name="Admin Test",
            mobile_number="+911234567890",
            email_address="admin@test.com",
            password="adminpass123",
            aadhaar_number="123456789012"
        )

        assert user is not None
        assert user.email_address == "admin@test.com"
        assert user.full_name == "Admin Test"
        assert user.role == "admin"  # role must be overridden
        assert user.is_staff is True
        assert user.is_superuser is True
        assert user.check_password("adminpass123") is True


    def test_create_superuser_requires_password(self):
        """Superuser must fail without a password."""
        with pytest.raises(ValueError):
            User.objects.create_superuser(
                full_name="Admin Test",
                mobile_number="+911234567890",
                email_address="admin@test.com",
                password=None
            )


    def test_superuser_flags_are_set_correctly(self):
        """Even if create_user sets them wrong, create_superuser should enforce True."""
        user = User.objects.create_superuser(
            full_name="Admin Test",
            mobile_number="+911234567890",
            email_address="admin@test.com",
            password="securepass",
        )

        assert user.is_staff is True
        assert user.is_superuser is True


    def test_superuser_email_uniqueness(self):
        """Should not allow two superusers with same email."""
        User.objects.create_superuser(
            full_name="Admin One",
            mobile_number="+911234567891",
            email_address="duplicate@test.com",
            password="pass123"
        )

        with pytest.raises(Exception):
            User.objects.create_superuser(
                full_name="Admin Two",
                mobile_number="+911234567892",
                email_address="duplicate@test.com",
                password="pass123"
            )


    def test_superuser_mobile_uniqueness(self):
        """Should reject duplicate mobile numbers."""
        User.objects.create_superuser(
            full_name="Admin One",
            mobile_number="+911234567891",
            email_address="admin1@test.com",
            password="pass123"
        )

        with pytest.raises(Exception):
            User.objects.create_superuser(
                full_name="Admin Two",
                mobile_number="+911234567891",
                email_address="admin2@test.com",
                password="pass123"
            )
