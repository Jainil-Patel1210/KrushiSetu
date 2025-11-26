"""
Unit tests for CustomTokenObtainPairSerializer.get_token in loginSignup.views
Covers: happy paths and edge cases.
"""

import pytest
from unittest.mock import MagicMock, patch
from loginSignup.views import CustomTokenObtainPairSerializer


@pytest.fixture
def user_fixture():
    """
    Provides a mock user object with default attributes for tests.
    """
    user = MagicMock()
    user.full_name = "John Doe"
    user.email_address = "john@example.com"
    user.role = "admin"
    return user


class TestCustomTokenObtainPairSerializerGetToken:

    @pytest.mark.happy_path
    def test_get_token_happy_path(self, user_fixture):
        """
        Test that get_token returns a token with correct custom claims.
        """
        with patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.get_token"
        ) as super_get_token:

            token_mock = {}
            super_get_token.return_value = token_mock

            token = CustomTokenObtainPairSerializer.get_token(user_fixture)

            assert token["full_name"] == "John Doe"
            assert token["email_address"] == "john@example.com"
            assert token["role"] == "admin"
            assert token is token_mock  # Same object returned

    @pytest.mark.happy_path
    def test_get_token_with_different_user_roles(self, user_fixture):
        """
        Role should be copied exactly.
        """
        with patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.get_token"
        ) as super_get_token:

            token_mock = {}
            super_get_token.return_value = token_mock

            user_fixture.role = "user"
            token = CustomTokenObtainPairSerializer.get_token(user_fixture)
            assert token["role"] == "user"

            user_fixture.role = "manager"
            token = CustomTokenObtainPairSerializer.get_token(user_fixture)
            assert token["role"] == "manager"

    @pytest.mark.edge_case
    def test_get_token_user_with_empty_strings(self, user_fixture):
        """
        Empty strings should be stored directly.
        """
        with patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.get_token"
        ) as super_get_token:

            token_mock = {}
            super_get_token.return_value = token_mock

            user_fixture.full_name = ""
            user_fixture.email_address = ""
            user_fixture.role = ""

            token = CustomTokenObtainPairSerializer.get_token(user_fixture)

            assert token["full_name"] == ""
            assert token["email_address"] == ""
            assert token["role"] == ""

    @pytest.mark.edge_case
    def test_get_token_user_with_none_fields(self, user_fixture):
        """
        None values must be stored without modification.
        """
        with patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.get_token"
        ) as super_get_token:

            token_mock = {}
            super_get_token.return_value = token_mock

            user_fixture.full_name = None
            user_fixture.email_address = None
            user_fixture.role = None

            token = CustomTokenObtainPairSerializer.get_token(user_fixture)

            assert token["full_name"] is None
            assert token["email_address"] is None
            assert token["role"] is None

    @pytest.mark.edge_case
    def test_get_token_user_missing_attributes(self):
        """
        Missing attributes should cause AttributeError.
        """
        with patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.get_token"
        ) as super_get_token:

            token_mock = {}
            super_get_token.return_value = token_mock

            # full_name missing
            user = MagicMock(spec=["email_address", "role"])
            user.email_address = "a@b.com"
            user.role = "user"
            with pytest.raises(AttributeError):
                CustomTokenObtainPairSerializer.get_token(user)

            # email_address missing
            user = MagicMock(spec=["full_name", "role"])
            user.full_name = "Jane"
            user.role = "user"
            with pytest.raises(AttributeError):
                CustomTokenObtainPairSerializer.get_token(user)

            # role missing
            user = MagicMock(spec=["full_name", "email_address"])
            user.full_name = "Jane"
            user.email_address = "a@b.com"
            with pytest.raises(AttributeError):
                CustomTokenObtainPairSerializer.get_token(user)

    @pytest.mark.edge_case
    def test_get_token_super_returns_non_dict(self, user_fixture):
        """
        Ensure custom claims can be added to any object supporting __setitem__.
        """
        class DummyToken:
            def __setitem__(self, key, value):
                setattr(self, key, value)

            def __getitem__(self, key):
                return getattr(self, key)

        dummy_token = DummyToken()

        with patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.get_token"
        ) as super_get_token:

            super_get_token.return_value = dummy_token

            token = CustomTokenObtainPairSerializer.get_token(user_fixture)

            assert token.full_name == "John Doe"
            assert token.email_address == "john@example.com"
            assert token.role == "admin"

             # NEW: Use [] to trigger __getitem__
            assert token["full_name"] == "John Doe"
            assert token["email_address"] == "john@example.com"
            assert token["role"] == "admin"

    @pytest.mark.edge_case
    def test_get_token_user_with_non_string_fields(self, user_fixture):
        """
        Non-string values should be stored directly.
        """
        with patch(
            "rest_framework_simplejwt.serializers.TokenObtainPairSerializer.get_token"
        ) as super_get_token:

            token_mock = {}
            super_get_token.return_value = token_mock

            user_fixture.full_name = 12345
            user_fixture.email_address = ["a", "b"]
            user_fixture.role = {"admin": True}

            token = CustomTokenObtainPairSerializer.get_token(user_fixture)

            assert token["full_name"] == 12345
            assert token["email_address"] == ["a", "b"]
            assert token["role"] == {"admin": True}
