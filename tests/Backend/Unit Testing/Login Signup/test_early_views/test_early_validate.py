"""
Unit tests for CustomTokenObtainPairSerializer.validate in loginSignup.views
Covers: happy paths, edge cases.
"""

import pytest
from unittest.mock import MagicMock, patch

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from loginSignup.views import CustomTokenObtainPairSerializer


@pytest.fixture
def user_mock():
    """
    Fixture to create a mock user with required attributes.
    """
    user = MagicMock()
    user.id = 1
    user.email_address = "test@example.com"
    user.full_name = "Test User"
    user.role = "admin"
    return user


@pytest.fixture
def serializer_with_user(user_mock):
    """
    Fixture to create a serializer with self.user already set.
    """
    serializer = CustomTokenObtainPairSerializer()
    serializer.user = user_mock
    return serializer


class TestCustomTokenObtainPairSerializerValidate:

    @pytest.mark.happy_path
    def test_validate_returns_expected_data(self, serializer_with_user):
        attrs = {"email": "test@example.com", "password": "password123"}

        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "token1", "refresh": "token2"},
        ):
            data = CustomTokenObtainPairSerializer.validate(serializer_with_user, attrs)

            assert data["access"] == "token1"
            assert data["refresh"] == "token2"

            assert data["user"]["id"] == 1
            assert data["user"]["email"] == "test@example.com"
            assert data["user"]["full_name"] == "Test User"
            assert data["user"]["role"] == "admin"

    @pytest.mark.happy_path
    def test_validate_with_different_user_roles(self, user_mock):
        user_mock.role = "user"

        serializer = CustomTokenObtainPairSerializer()
        serializer.user = user_mock
        attrs = {"email": "test@example.com", "password": "password123"}

        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "a", "refresh": "b"},
        ):
            data = CustomTokenObtainPairSerializer.validate(serializer, attrs)
            assert data["user"]["role"] == "user"

    # ---------------- EDGE CASES -------------------

    @pytest.mark.edge_case
    def test_validate_user_missing_email_address(self, user_mock):
        user_mock.email_address = None

        serializer = CustomTokenObtainPairSerializer()
        serializer.user = user_mock
        attrs = {"email": "x", "password": "y"}

        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "a", "refresh": "b"},
        ):
            data = CustomTokenObtainPairSerializer.validate(serializer, attrs)
            assert data["user"]["email"] is None

    @pytest.mark.edge_case
    def test_validate_user_missing_full_name(self, user_mock):
        user_mock.full_name = None

        serializer = CustomTokenObtainPairSerializer()
        serializer.user = user_mock

        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "a", "refresh": "b"},
        ):
            data = CustomTokenObtainPairSerializer.validate(serializer, {})
            assert data["user"]["full_name"] is None

    @pytest.mark.edge_case
    def test_validate_user_missing_role(self, user_mock):
        user_mock.role = None

        serializer = CustomTokenObtainPairSerializer()
        serializer.user = user_mock

        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "a", "refresh": "b"},
        ):
            data = CustomTokenObtainPairSerializer.validate(serializer, {})
            assert data["user"]["role"] is None

    @pytest.mark.edge_case
    def test_validate_user_missing_id(self, user_mock):
        user_mock.id = None

        serializer = CustomTokenObtainPairSerializer()
        serializer.user = user_mock

        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "a", "refresh": "b"},
        ):
            data = CustomTokenObtainPairSerializer.validate(serializer, {})
            assert data["user"]["id"] is None

    @pytest.mark.edge_case
    def test_validate_super_validate_returns_extra_fields(self, serializer_with_user):
        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "a", "refresh": "b", "foo": "bar"},
        ):
            data = CustomTokenObtainPairSerializer.validate(serializer_with_user, {})
            assert data["foo"] == "bar"
            assert "user" in data

    @pytest.mark.edge_case
    def test_validate_raises_if_user_not_set(self):
        serializer = CustomTokenObtainPairSerializer()

        with patch.object(
            TokenObtainPairSerializer,
            "validate",
            return_value={"access": "a", "refresh": "b"},
        ):
            with pytest.raises(AttributeError):
                CustomTokenObtainPairSerializer.validate(serializer, {})
