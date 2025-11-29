# test_views.py

import pytest
from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from photo.views import UserDocumentRetrieveUpdateView

User = get_user_model()

@pytest.fixture
def user():
    """Fixture to create a mock user."""
    return MagicMock(spec=User, username='testuser', id=1)

@pytest.fixture
def mock_request(user):
    """Fixture to create a mock request with a user."""
    factory = APIRequestFactory()
    req = factory.put('/fake-url/')
    req.user = user
    return req

@pytest.fixture
def serializer():
    """Fixture to create a mock serializer."""
    return MagicMock()

@pytest.mark.usefixtures("mock_request", "serializer")
class TestUserDocumentRetrieveUpdateViewPerformUpdate:
    # --- Happy Path Tests ---

    @pytest.mark.happy_path
    def test_perform_update_calls_serializer_save_with_user(self, mock_request, serializer):
        view = UserDocumentRetrieveUpdateView()
        view.request = mock_request

        view.perform_update(serializer)

        serializer.save.assert_called_once_with(user=mock_request.user)

    @pytest.mark.happy_path
    def test_perform_update_with_different_user(self, serializer):
        another_user = MagicMock(spec=User, username='another', id=2)
        factory = APIRequestFactory()
        req = factory.put('/fake-url/')
        req.user = another_user

        view = UserDocumentRetrieveUpdateView()
        view.request = req

        view.perform_update(serializer)

        serializer.save.assert_called_once_with(user=another_user)

    # --- Edge Case Tests ---

    @pytest.mark.edge_case
    def test_perform_update_serializer_save_raises_exception(self, mock_request, serializer):
        view = UserDocumentRetrieveUpdateView()
        view.request = mock_request
        serializer.save.side_effect = ValueError("Save failed")

        with pytest.raises(ValueError, match="Save failed"):
            view.perform_update(serializer)

    @pytest.mark.edge_case
    def test_perform_update_with_request_user_none(self, serializer):
        factory = APIRequestFactory()
        req = factory.put('/fake-url/')
        req.user = None

        view = UserDocumentRetrieveUpdateView()
        view.request = req

        view.perform_update(serializer)

        serializer.save.assert_called_once_with(user=None)

    @pytest.mark.edge_case
    def test_perform_update_with_missing_request_attribute(self, serializer):
        view = UserDocumentRetrieveUpdateView()

        with pytest.raises(AttributeError):
            view.perform_update(serializer)

    @pytest.mark.edge_case
    def test_perform_update_with_serializer_save_accepts_kwargs(self, mock_request):
        class DummySerializer:
            def __init__(self):
                self.saved_kwargs = None
            def save(self, **kwargs):
                self.saved_kwargs = kwargs

        serializer = DummySerializer()
        view = UserDocumentRetrieveUpdateView()
        view.request = mock_request

        view.perform_update(serializer)

        assert serializer.saved_kwargs == {'user': mock_request.user}
