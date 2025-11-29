"""
Unit tests for the `perform_create` method of `UserDocumentsListCreateView` in photo/views.py.

Tested method:
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
"""

import pytest
from unittest.mock import MagicMock
from photo.views import UserDocumentsListCreateView


class TestUserDocumentsListCreateViewPerformCreate:

    @pytest.fixture(autouse=True)
    def setup_view(self):
        """
        Sets up a UserDocumentsListCreateView instance and a mock request for each test.
        """
        self.view = UserDocumentsListCreateView()
        self.mock_user = MagicMock(name="User")
        self.mock_request = MagicMock(name="Request", user=self.mock_user)
        self.view.request = self.mock_request

    # -------------------- Happy Path Tests --------------------

    @pytest.mark.happy_path
    def test_perform_create_calls_serializer_save_with_user(self):
        """
        Test that perform_create calls serializer.save with the correct user from the request.
        """
        mock_serializer = MagicMock()
        self.view.perform_create(mock_serializer)
        mock_serializer.save.assert_called_once_with(user=self.mock_user)

    @pytest.mark.happy_path
    def test_perform_create_with_different_user_objects(self):
        """
        Test perform_create with different user objects to ensure user is always passed correctly.
        """
        for username in ["alice", "bob", "charlie"]:
            user = MagicMock(name=f"User_{username}")
            self.view.request.user = user
            mock_serializer = MagicMock()
            self.view.perform_create(mock_serializer)
            mock_serializer.save.assert_called_once_with(user=user)

    # -------------------- Edge Case Tests --------------------

    @pytest.mark.edge_case
    def test_perform_create_with_request_user_none(self):
        """
        Test perform_create when request.user is None.
        Should pass None as user to serializer.save.
        """
        self.view.request.user = None
        mock_serializer = MagicMock()
        self.view.perform_create(mock_serializer)
        mock_serializer.save.assert_called_once_with(user=None)

    @pytest.mark.edge_case
    def test_perform_create_with_request_missing_user_attribute(self):
        """
        Test perform_create when request object has no 'user' attribute.
        Should raise AttributeError.
        """
        del self.view.request.user
        mock_serializer = MagicMock()

        with pytest.raises(AttributeError):
            self.view.perform_create(mock_serializer)

    @pytest.mark.edge_case
    def test_perform_create_serializer_save_raises_exception(self):
        """
        Test perform_create when serializer.save raises an exception.
        The exception should propagate.
        """
        mock_serializer = MagicMock()
        mock_serializer.save.side_effect = ValueError("Save failed")

        with pytest.raises(ValueError, match="Save failed"):
            self.view.perform_create(mock_serializer)

    @pytest.mark.edge_case
    def test_perform_create_with_non_mock_serializer(self):
        """
        Test perform_create with a real object as serializer that has a save method.
        """

        class DummySerializer:
            def __init__(self):
                self.saved_user = None

            def save(self, user):
                self.saved_user = user

        serializer = DummySerializer()
        self.view.perform_create(serializer)

        assert serializer.saved_user is self.mock_user

    @pytest.mark.edge_case
    def test_perform_create_with_extra_kwargs_ignored(self):
        """
        Test perform_create ignores extra kwargs in serializer.save signature.
        """

        class DummySerializer:
            def __init__(self):
                self.called_with = None

            def save(self, user, **kwargs):
                self.called_with = user

        serializer = DummySerializer()
        self.view.perform_create(serializer)

        assert serializer.called_with is self.mock_user
