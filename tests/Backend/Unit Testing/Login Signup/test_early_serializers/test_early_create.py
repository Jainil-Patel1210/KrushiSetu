# test_serializers.py

import pytest
from unittest import mock
from loginSignup.serializers import UserSignupSerializer
from loginSignup.models import User

@pytest.fixture
def valid_user_data():
    """Fixture: Returns a valid set of user signup data."""
    return {
        "full_name": "John Doe",
        "email_address": "john@example.com",
        "mobile_number": "1234567890",
        "aadhaar_number": "123412341234",
        "password": "securepassword",
        "confirm_password": "securepassword",
    }

@pytest.fixture
def user_instance():
    """Fixture: Returns a mock user instance."""
    user = mock.Mock(spec=User)
    user.set_password = mock.Mock()
    user.save = mock.Mock()
    return user

class TestUserSignupSerializerCreate:
    @pytest.mark.happy_path
    def test_create_new_user(self, valid_user_data):
        """
        Test: Should create a new user when no inactive user exists by email or mobile.
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        # Patch User.objects.get to always raise DoesNotExist
        with mock.patch.object(User.objects, "get", side_effect=User.DoesNotExist), \
             mock.patch.object(User.objects, "create_user", return_value="created_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == "created_user"
            # confirm_password should be popped
            assert "confirm_password" not in validated_data
            mock_create_user.assert_called_once_with(
                full_name="John Doe",
                email_address="john@example.com",
                mobile_number="1234567890",
                aadhaar_number="123412341234",
                password="securepassword"
            )

    @pytest.mark.happy_path
    def test_update_inactive_user_by_email(self, valid_user_data, user_instance):
        """
        Test: Should update and return inactive user found by email.
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        # Patch User.objects.get to return user on first call (by email)
        with mock.patch.object(User.objects, "get", side_effect=[user_instance]), \
             mock.patch.object(User.objects, "create_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == user_instance
            assert user_instance.full_name == "John Doe"
            assert user_instance.mobile_number == "1234567890"
            assert user_instance.aadhaar_number == "123412341234"
            user_instance.set_password.assert_called_once_with("securepassword")
            user_instance.save.assert_called_once()
            mock_create_user.assert_not_called()

    @pytest.mark.happy_path
    def test_update_inactive_user_by_mobile(self, valid_user_data, user_instance):
        """
        Test: Should update and return inactive user found by mobile if not found by email.
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        # Patch User.objects.get: first call (by email) raises DoesNotExist, second call (by mobile) returns user
        with mock.patch.object(User.objects, "get", side_effect=[User.DoesNotExist, user_instance]), \
             mock.patch.object(User.objects, "create_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == user_instance
            assert user_instance.full_name == "John Doe"
            assert user_instance.email_address == "john@example.com"
            assert user_instance.aadhaar_number == "123412341234"
            user_instance.set_password.assert_called_once_with("securepassword")
            user_instance.save.assert_called_once()
            mock_create_user.assert_not_called()

    @pytest.mark.edge_case
    def test_create_user_with_no_aadhaar(self, valid_user_data):
        """
        Test: Should create a new user when aadhaar_number is missing (None).
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        validated_data["aadhaar_number"] = None
        with mock.patch.object(User.objects, "get", side_effect=User.DoesNotExist), \
             mock.patch.object(User.objects, "create_user", return_value="created_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == "created_user"
            mock_create_user.assert_called_once_with(
                full_name="John Doe",
                email_address="john@example.com",
                mobile_number="1234567890",
                aadhaar_number=None,
                password="securepassword"
            )

    @pytest.mark.edge_case
    def test_create_user_with_empty_aadhaar(self, valid_user_data):
        """
        Test: Should create a new user when aadhaar_number is empty string.
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        validated_data["aadhaar_number"] = ""
        with mock.patch.object(User.objects, "get", side_effect=User.DoesNotExist), \
             mock.patch.object(User.objects, "create_user", return_value="created_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == "created_user"
            mock_create_user.assert_called_once_with(
                full_name="John Doe",
                email_address="john@example.com",
                mobile_number="1234567890",
                aadhaar_number="",
                password="securepassword"
            )

    @pytest.mark.edge_case
    def test_create_user_missing_confirm_password(self, valid_user_data):
        """
        Test: Should create a new user even if confirm_password is missing from validated_data.
        (Assumes validation is done elsewhere.)
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        validated_data.pop("confirm_password")
        with mock.patch.object(User.objects, "get", side_effect=User.DoesNotExist), \
             mock.patch.object(User.objects, "create_user", return_value="created_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == "created_user"
            mock_create_user.assert_called_once()

    @pytest.mark.edge_case
    def test_create_user_with_minimal_fields(self, valid_user_data):
        """
        Test: Should create a new user when only required fields are present (no aadhaar_number).
        """
        serializer = UserSignupSerializer()
        validated_data = {
            "full_name": "Jane Doe",
            "email_address": "jane@example.com",
            "mobile_number": "9876543210",
            "password": "anotherpassword",
            "confirm_password": "anotherpassword"
        }
        with mock.patch.object(User.objects, "get", side_effect=User.DoesNotExist), \
             mock.patch.object(User.objects, "create_user", return_value="created_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == "created_user"
            mock_create_user.assert_called_once_with(
                full_name="Jane Doe",
                email_address="jane@example.com",
                mobile_number="9876543210",
                password="anotherpassword"
            )

    @pytest.mark.edge_case
    def test_update_inactive_user_by_email_missing_aadhaar(self, valid_user_data, user_instance):
        """
        Test: Should update inactive user by email when aadhaar_number is missing.
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        validated_data.pop("aadhaar_number")
        with mock.patch.object(User.objects, "get", side_effect=[user_instance]), \
             mock.patch.object(User.objects, "create_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == user_instance
            assert user_instance.aadhaar_number is None
            user_instance.set_password.assert_called_once_with("securepassword")
            user_instance.save.assert_called_once()
            mock_create_user.assert_not_called()

    @pytest.mark.edge_case
    def test_update_inactive_user_by_mobile_missing_aadhaar(self, valid_user_data, user_instance):
        """
        Test: Should update inactive user by mobile when aadhaar_number is missing.
        """
        serializer = UserSignupSerializer()
        validated_data = valid_user_data.copy()
        validated_data.pop("aadhaar_number")
        with mock.patch.object(User.objects, "get", side_effect=[User.DoesNotExist, user_instance]), \
             mock.patch.object(User.objects, "create_user") as mock_create_user:
            result = serializer.create(validated_data)
            assert result == user_instance
            assert user_instance.aadhaar_number is None
            user_instance.set_password.assert_called_once_with("securepassword")
            user_instance.save.assert_called_once()
            mock_create_user.assert_not_called()