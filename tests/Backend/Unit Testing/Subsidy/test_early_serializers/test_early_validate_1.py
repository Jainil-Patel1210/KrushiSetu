# test_serializers_validate_1.py

import pytest
from unittest.mock import MagicMock, patch
from subsidy.serializers import SubsidyApplicationSerializer
from rest_framework import serializers

@pytest.fixture
def user():
    """Fixture to provide a mock user object."""
    mock_user = MagicMock()
    mock_user.id = 1
    return mock_user

@pytest.fixture
def subsidy():
    """Fixture to provide a mock subsidy object."""
    mock_subsidy = MagicMock()
    mock_subsidy.id = 10
    return mock_subsidy

@pytest.fixture
def mock_request(user):
    """Fixture to provide a mock request with a user."""
    mock_r = MagicMock()
    mock_r.user = user
    return mock_r

@pytest.fixture
def serializer_context(mock_request):
    """Fixture to provide serializer context with request."""
    return {'request': mock_request}

@pytest.fixture
def attrs(subsidy):
    """Fixture to provide valid attrs for the serializer."""
    return {'subsidy': subsidy}

@pytest.fixture
def serializer(serializer_context):
    """Fixture to provide an instance of SubsidyApplicationSerializer."""
    return SubsidyApplicationSerializer(context=serializer_context)

@pytest.mark.usefixtures("serializer", "attrs")
class TestSubsidyApplicationSerializerValidate:

    @pytest.mark.happy
    def test_validate_allows_new_application(self, serializer, attrs, user, subsidy):
        with patch("subsidy.serializers.SubsidyApplication.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = False
            result = serializer.validate(attrs)

            assert result == attrs
            mock_manager.filter.assert_called_once_with(user=user, subsidy=subsidy)

    @pytest.mark.happy
    def test_validate_with_minimal_attrs(self, serializer, subsidy, user):
        attrs = {"subsidy": subsidy}
        with patch("subsidy.serializers.SubsidyApplication.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = False
            result = serializer.validate(attrs)
            assert result == attrs

    @pytest.mark.edge
    def test_validate_raises_if_already_applied(self, serializer, attrs, user, subsidy):
        with patch("subsidy.serializers.SubsidyApplication.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = True
            with pytest.raises(serializers.ValidationError) as excinfo:
                serializer.validate(attrs)

            assert "already applied" in str(excinfo.value)

    @pytest.mark.edge
    def test_validate_handles_missing_subsidy_in_attrs(self, serializer, user):
        attrs = {}
        with patch("subsidy.serializers.SubsidyApplication.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = False
            result = serializer.validate(attrs)
            assert result == attrs

    @pytest.mark.edge
    def test_validate_handles_unusual_user_object(self, subsidy):
        class DummyUser: pass
        dummy_user = DummyUser()

        serializer = SubsidyApplicationSerializer(
            context={"request": MagicMock(user=dummy_user)}
        )
        attrs = {"subsidy": subsidy}

        with patch("subsidy.serializers.SubsidyApplication.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = False
            result = serializer.validate(attrs)
            assert result == attrs

    @pytest.mark.edge
    def test_validate_handles_none_user(self, subsidy):
        serializer = SubsidyApplicationSerializer(
            context={"request": MagicMock(user=None)}
        )
        attrs = {"subsidy": subsidy}

        with patch("subsidy.serializers.SubsidyApplication.objects") as mock_manager:
            mock_manager.filter.return_value.exists.return_value = False
            result = serializer.validate(attrs)
            assert result == attrs
