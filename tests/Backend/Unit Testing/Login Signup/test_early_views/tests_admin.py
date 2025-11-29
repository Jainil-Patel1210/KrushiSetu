import pytest
from django.contrib import admin
from django.test import RequestFactory

from loginSignup.admin import CustomUserAdmin, OTPAdmin
from loginSignup.models import User, OTP


@pytest.mark.django_db
def test_custom_user_admin_setup():
    """Ensure the CustomUserAdmin is correctly wired."""
    admin_site = admin.AdminSite()
    user_admin = CustomUserAdmin(User, admin_site)

    # Check forms
    assert user_admin.add_form is not None
    assert user_admin.form is not None

    # Check list_display
    assert "full_name" in user_admin.list_display
    assert "email_address" in user_admin.list_display

    # Check filters
    assert "role" in user_admin.list_filter
    assert "is_staff" in user_admin.list_filter

    # Check fieldsets
    assert isinstance(user_admin.fieldsets, tuple)
    assert "email_address" in user_admin.fieldsets[0][1]["fields"]

    # Check add_fieldsets
    assert isinstance(user_admin.add_fieldsets, tuple)
    assert "full_name" in user_admin.add_fieldsets[0][1]["fields"]


@pytest.mark.django_db
def test_custom_user_admin_registration():
    """Ensure User is registered with CustomUserAdmin."""
    assert admin.site._registry[User].__class__ is CustomUserAdmin


@pytest.mark.django_db
def test_otp_admin_methods():
    """Test OTPAdmin custom methods."""
    admin_site = admin.AdminSite()
    otp_admin = OTPAdmin(OTP, admin_site)

    # Create user + OTP
    user = User.objects.create(
        full_name="John Doe",
        email_address="john@example.com",
        mobile_number="9999999999",
        role="farmer",
        aadhaar_number="123412341234",
        password="pass123",
    )
    otp = OTP.objects.create(
        user=user,
        otp="123456",
        purpose="login",
        attempts=1,
    )

    # Test user_email()
    assert otp_admin.user_email(otp) == "john@example.com"

    # Test user_id_display()
    assert otp_admin.user_id_display(otp) == user.id

@pytest.mark.django_db
def test_otp_admin_registration():
    """Ensure OTP admin is registered."""
    assert admin.site._registry[OTP].__class__ is OTPAdmin
