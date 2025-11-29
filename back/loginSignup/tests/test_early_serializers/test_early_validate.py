"""
Unit tests for the `validate` method of `UserSignupSerializer` in loginSignup/serializers.py.

Covers:
- Happy paths (valid data, optional fields, etc.)
- Edge cases (password mismatch, duplicate email/mobile, null aadhaar, etc.)
"""

import pytest
from unittest.mock import patch, MagicMock

from loginSignup.serializers import UserSignupSerializer

@pytest.fixture
def valid_user_data():
    """Fixture: Returns a valid user data dictionary."""
    return {
        "full_name": "John Doe",
        "email_address": "john@example.com",
        "mobile_number": "9876543210",
        "aadhaar_number": "123412341234",
        "password": "securepassword",
        "confirm_password": "securepassword"
    }

@pytest.mark.usefixtures("valid_user_data")
class TestUserSignupSerializerValidate:

    # -------------------- HAPPY PATHS --------------------

    @pytest.mark.happy_path
    def test_validate_successful(self, valid_user_data):
        """Test: validate passes with all valid and unique fields."""
        with patch("loginSignup.serializers.User.objects") as mock_manager:
            # No user exists with email or mobile
            mock_manager.filter.return_value.exists.return_value = False

            serializer = UserSignupSerializer()
            validated = serializer.validate(valid_user_data.copy())
            assert validated == valid_user_data

    @pytest.mark.happy_path
    def test_validate_optional_aadhaar(self, valid_user_data):
        """Test: validate passes when aadhaar_number is omitted (optional field)."""
        data = valid_user_data.copy()
        data.pop("aadhaar_number")
        with patch("loginSignup.serializers.User.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = False
            serializer = UserSignupSerializer()
            validated = serializer.validate(data)
            assert validated == data

    @pytest.mark.happy_path
    def test_validate_aadhaar_null(self, valid_user_data):
        """Test: validate passes when aadhaar_number is explicitly None."""
        data = valid_user_data.copy()
        data["aadhaar_number"] = None
        with patch("loginSignup.serializers.User.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = False
            serializer = UserSignupSerializer()
            validated = serializer.validate(data)
            assert validated == data

    # -------------------- EDGE CASES --------------------

    @pytest.mark.edge_case
    def test_validate_password_mismatch(self, valid_user_data):
        """Test: validate raises error if password and confirm_password do not match."""
        data = valid_user_data.copy()
        data["confirm_password"] = "differentpassword"
        serializer = UserSignupSerializer()
        with pytest.raises(Exception) as exc:
            serializer.validate(data)
        assert "Passwords do not match" in str(exc.value)

    @pytest.mark.edge_case
    def test_validate_duplicate_active_email(self, valid_user_data):
        """Test: validate raises error if an active user with the same email exists."""
        with patch("loginSignup.serializers.User.objects") as mock_manager:
            # Simulate email exists
            def filter_side_effect(**kwargs):
                if kwargs.get("email_address") == valid_user_data["email_address"] and kwargs.get("is_active") is True:
                    mock = MagicMock()
                    mock.exists.return_value = True
                    return mock
                mock = MagicMock()
                mock.exists.return_value = False
                return mock
            mock_manager.filter.side_effect = filter_side_effect

            serializer = UserSignupSerializer()
            with pytest.raises(Exception) as exc:
                serializer.validate(valid_user_data.copy())
            assert "email_address" in str(exc.value)
            assert "already exists" in str(exc.value)

    @pytest.mark.edge_case
    def test_validate_duplicate_active_mobile(self, valid_user_data):
        """Test: validate raises error if an active user with the same mobile number exists."""
        with patch("loginSignup.serializers.User.objects") as mock_manager:
            # First call (email check): no user
            # Second call (mobile check): user exists
            def filter_side_effect(**kwargs):
                if kwargs.get("mobile_number") == valid_user_data["mobile_number"] and kwargs.get("is_active") is True:
                    mock = MagicMock()
                    mock.exists.return_value = True
                    return mock
                mock = MagicMock()
                mock.exists.return_value = False
                return mock
            mock_manager.filter.side_effect = filter_side_effect

            serializer = UserSignupSerializer()
            with pytest.raises(Exception) as exc:
                serializer.validate(valid_user_data.copy())
            assert "mobile_number" in str(exc.value)
            assert "already exists" in str(exc.value)

    @pytest.mark.edge_case
    def test_validate_missing_confirm_password(self, valid_user_data):
        """Test: validate raises KeyError if confirm_password is missing."""
        data = valid_user_data.copy()
        data.pop("confirm_password")
        serializer = UserSignupSerializer()
        with pytest.raises(KeyError):
            serializer.validate(data)

    @pytest.mark.edge_case
    def test_validate_missing_password(self, valid_user_data):
        """Test: validate raises KeyError if password is missing."""
        data = valid_user_data.copy()
        data.pop("password")
        serializer = UserSignupSerializer()
        with pytest.raises(KeyError):
            serializer.validate(data)

    @pytest.mark.edge_case
    def test_validate_email_and_mobile_duplicate(self, valid_user_data):
        """Test: validate raises error for email first if both email and mobile are duplicates."""
        with patch("loginSignup.serializers.User.objects") as mock_manager:
            # Both email and mobile exist, but email check comes first
            def filter_side_effect(**kwargs):
                if kwargs.get("email_address") == valid_user_data["email_address"] and kwargs.get("is_active") is True:
                    mock = MagicMock()
                    mock.exists.return_value = True
                    return mock
                if kwargs.get("mobile_number") == valid_user_data["mobile_number"] and kwargs.get("is_active") is True:
                    mock = MagicMock()
                    mock.exists.return_value = True
                    return mock
                mock = MagicMock()
                mock.exists.return_value = False
                return mock
            mock_manager.filter.side_effect = filter_side_effect

            serializer = UserSignupSerializer()
            with pytest.raises(Exception) as exc:
                serializer.validate(valid_user_data.copy())
            # Should only raise for email, as that's checked first
            assert "email_address" in str(exc.value)
            assert "already exists" in str(exc.value)