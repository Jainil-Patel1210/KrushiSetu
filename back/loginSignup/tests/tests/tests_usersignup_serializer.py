import pytest
from loginSignup.serializers import UserSignupSerializer
from loginSignup.models import User

@pytest.mark.django_db
class TestUserSignupSerializer:

    def test_password_mismatch(self):
        serializer = UserSignupSerializer(data={
            "full_name": "Test",
            "email_address": "test@example.com",
            "mobile_number": "+911234567890",
            "aadhaar_number": "123456789012",
            "password": "pass123",
            "confirm_password": "wrongpass"
        })

        assert serializer.is_valid() is False
        assert "Passwords do not match" in str(serializer.errors)

    def test_active_email_exists(self):
        User.objects.create_user(
            full_name="Existing",
            email_address="test@example.com",
            mobile_number="+911111111111",
            password="pass123",
            is_active=True
        )

        serializer = UserSignupSerializer(data={
            "full_name": "Test",
            "email_address": "test@example.com",
            "mobile_number": "+922222222222",
            "aadhaar_number": "123456789012",
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert serializer.is_valid() is False
        assert "email" in str(serializer.errors).lower()

    def test_active_mobile_exists(self):
        User.objects.create_user(
            full_name="Existing",
            email_address="old@example.com",
            mobile_number="+911234567890",
            password="pass123",
            is_active=True
        )

        serializer = UserSignupSerializer(data={
            "full_name": "Test",
            "email_address": "test@example.com",
            "mobile_number": "+911234567890",
            "aadhaar_number": "123456789012",
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert not serializer.is_valid()
        assert "mobile" in str(serializer.errors).lower()

    def test_inactive_user_found_by_email_updates_record(self):
        inactive = User.objects.create(
            full_name="Old",
            email_address="test@example.com",
            mobile_number="+911000000000",
            is_active=False
        )


        serializer = UserSignupSerializer(data={
            "full_name": "New Name",
            "email_address": "test@example.com",
            "mobile_number": "+911234567890",
            "aadhaar_number": "111122223333",
            "password": "newpass",
            "confirm_password": "newpass"
        })

        assert serializer.is_valid()
        user = serializer.save()

        assert user.id == inactive.id
        assert user.full_name == "New Name"
        assert user.mobile_number == "+911234567890"
        assert user.check_password("newpass")

    def test_inactive_user_found_by_mobile_updates_record(self):
        inactive = User.objects.create(
            full_name="Old",
            email_address="old@example.com",
            mobile_number="+911234567890",
            is_active=False
        )

        serializer = UserSignupSerializer(data={
            "full_name": "Updated",
            "email_address": "new@example.com",
            "mobile_number": "+911234567890",
            "aadhaar_number": "111122223333",
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert serializer.is_valid()
        user = serializer.save()

        assert user.id == inactive.id
        assert user.email_address == "new@example.com"
        assert user.full_name == "Updated"
        assert user.check_password("pass123")

    def test_new_user_created(self):
        serializer = UserSignupSerializer(data={
            "full_name": "New User",
            "email_address": "new@example.com",
            "mobile_number": "+919876543210",
            "aadhaar_number": None,
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert serializer.is_valid()
        user = serializer.save()

        assert User.objects.count() == 1
        assert user.full_name == "New User"
        assert user.check_password("pass123")

    def test_confirm_password_required(self):
        serializer = UserSignupSerializer(data={
            "full_name": "Test",
            "email_address": "test@example.com",
            "mobile_number": "+911234567890",
            "password": "pass123",
            # missing confirm_password
        })

        assert not serializer.is_valid()
        assert "confirm_password" in serializer.errors

    def test_password_is_write_only(self):
        serializer = UserSignupSerializer()
        assert serializer.fields["password"].write_only is True

    def test_successful_signup_returns_valid_data(self):
        serializer = UserSignupSerializer(data={
            "full_name": "Test User",
            "email_address": "user@example.com",
            "mobile_number": "+911111111111",
            "aadhaar_number": "123123123123",
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert serializer.is_valid()
        user = serializer.save()
        assert user.full_name == "Test User"
        assert user.check_password("pass123")

    def test_aadhaar_optional(self):
        serializer = UserSignupSerializer(data={
            "full_name": "No Aadhaar",
            "email_address": "noaadhaar@example.com",
            "mobile_number": "+911234000000",
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert serializer.is_valid()
        user = serializer.save()
        assert user.aadhaar_number is None

    @pytest.mark.django_db
    def test_confirm_password_is_removed_in_create(self):
        data = {
            "full_name": "Pop Test",
            "email_address": "pop@example.com",
            "mobile_number": "+911234111111",
            "aadhaar_number": "123412341234",
            "password": "pass123",
            "confirm_password": "pass123",
        }

        serializer = UserSignupSerializer(data=data)
        assert serializer.is_valid()
        user = serializer.save()

        # confirm_password should not be on user OR database
        assert not hasattr(user, "confirm_password")

    @pytest.mark.django_db
    def test_validate_returns_data(self):
        data = {
            "full_name": "Valid User",
            "email_address": "valid@example.com",
            "mobile_number": "+911234567891",
            "aadhaar_number": "123412341234",
            "password": "pass123",
            "confirm_password": "pass123",
        }
        serializer = UserSignupSerializer(data=data)
        assert serializer.is_valid()
        validated = serializer.validated_data
        assert validated["email_address"] == "valid@example.com"

    @pytest.mark.django_db
    def test_inactive_email_does_not_raise_duplicate(self):
        User.objects.create_user(
            full_name="Inactive",
            email_address="unique@example.com",
            mobile_number="+919999999999",
            password="pass123",
            is_active=False
        )

        serializer = UserSignupSerializer(data={
            "full_name": "New",
            "email_address": "unique@example.com",
            "mobile_number": "+911111111111",
            "aadhaar_number": "111122223333",
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert serializer.is_valid()

    @pytest.mark.django_db
    def test_inactive_mobile_does_not_raise_duplicate(self):
        User.objects.create_user(
            full_name="Inactive",
            email_address="abc@example.com",
            mobile_number="+911234567890",
            password="pass123",
            is_active=False
        )

        serializer = UserSignupSerializer(data={
            "full_name": "New",
            "email_address": "new@example.com",
            "mobile_number": "+911234567890",
            "aadhaar_number": "111122223333",
            "password": "pass123",
            "confirm_password": "pass123"
        })

        assert serializer.is_valid()

