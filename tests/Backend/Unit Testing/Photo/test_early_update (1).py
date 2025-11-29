# test_serializers.py

import pytest
from unittest.mock import MagicMock
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ErrorDetail
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

from photo.serializers import DocumentSerializer
from photo.models import Document

User = get_user_model()

@pytest.fixture
def user(db):
    """Fixture to create a test user (custom user model signature)."""
    return User.objects.create_user(
        full_name="Test User",
        mobile_number="+911234567890",
        email_address="testuser@example.com",
        password="testpass",
    )

@pytest.fixture
def another_user(db):
    """Fixture to create another test user."""
    return User.objects.create_user(
        full_name="Another User",
        mobile_number="+919999999999",
        email_address="anotheruser@example.com",
        password="testpass",
    )

@pytest.fixture
def document(user, db):
    """Fixture to create a test document instance with required fields."""
    return Document.objects.create(
        user=user,
        title="Test Doc",
        document_type="aadhar_card",
        document_number="ABC123",
        file="test.pdf",
    )

@pytest.fixture
def api_request_factory():
    """Fixture to provide DRF's APIRequestFactory."""
    return APIRequestFactory()

@pytest.fixture
def serializer_context(user, api_request_factory):
    """Fixture to provide serializer context with a request and user."""
    request = api_request_factory.get("/fake-url/")
    request.user = user
    return {"request": request}

@pytest.fixture
def serializer(document, serializer_context):
    """Fixture to provide a DocumentSerializer instance."""
    return DocumentSerializer(instance=document, context=serializer_context)

@pytest.mark.usefixtures("db")
class TestDocumentSerializerUpdate:
    # -------------------- Happy Path Tests --------------------

    @pytest.mark.happy
    def test_update_sets_user_from_context(self, serializer, another_user):
        """
        Test that update sets the 'user' field from the request context,
        regardless of what is in validated_data.
        """
        validated_data = {
            "title": "Updated Title",
            "user": another_user,  # Should be ignored
        }
        updated_doc = serializer.update(serializer.instance, validated_data)
        assert updated_doc.title == "Updated Title"
        # The user should be set from context, not from validated_data
        assert updated_doc.user == serializer.context["request"].user

    @pytest.mark.happy
    def test_update_with_minimal_validated_data(self, serializer):
        """
        Test update with minimal validated_data (no user, only one field).
        """
        validated_data = {
            "title": "Minimal Update"
        }
        updated_doc = serializer.update(serializer.instance, validated_data)
        assert updated_doc.title == "Minimal Update"
        assert updated_doc.user == serializer.context["request"].user

    @pytest.mark.happy
    def test_update_overwrites_existing_fields(self, serializer):
        """
        Test that update properly overwrites multiple fields.
        """
        validated_data = {
            "title": "Completely New Title",
            "file": "newfile.pdf"
        }
        updated_doc = serializer.update(serializer.instance, validated_data)
        assert updated_doc.title == "Completely New Title"
        assert str(updated_doc.file) == "newfile.pdf"
        assert updated_doc.user == serializer.context["request"].user

    # -------------------- Edge Case Tests --------------------

    @pytest.mark.edge
    def test_update_with_empty_validated_data(self, serializer):
        """
        Test update with empty validated_data (should only update user).
        """
        validated_data = {}
        updated_doc = serializer.update(serializer.instance, validated_data)
        # Title and file should remain unchanged
        assert updated_doc.title == serializer.instance.title
        assert updated_doc.user == serializer.context["request"].user

    @pytest.mark.edge
    def test_update_when_context_missing_request(self, document):
        """
        Test update raises KeyError if 'request' is missing from context.
        """
        serializer = DocumentSerializer(instance=document, context={})
        validated_data = {"title": "Should Fail"}
        with pytest.raises(KeyError):
            serializer.update(document, validated_data)

    @pytest.mark.edge
    def test_update_when_request_missing_user(self, document, api_request_factory):
        """
        Test update raises AttributeError if 'user' is missing from request.
        """
        request = api_request_factory.get("/fake-url/")
        # Intentionally do not set request.user
        serializer = DocumentSerializer(instance=document, context={"request": request})
        validated_data = {"title": "Should Fail"}
        with pytest.raises(AttributeError):
            serializer.update(document, validated_data)

    @pytest.mark.edge
    def test_update_with_none_validated_data(self, serializer):
        """
        Test update with None as validated_data (should raise TypeError).
        """
        with pytest.raises(TypeError):
            serializer.update(serializer.instance, None)

    @pytest.mark.edge
    def test_update_with_extra_fields_in_validated_data(self, serializer):
        """
        Test update ignores extra fields not on the model.
        """
        data = {
            "title": "Extra Field Test",
            "nonexistent_field": "should be ignored",
        }
        # Run through DRF validation so unknown fields are dropped
        s = DocumentSerializer(instance=serializer.instance, data=data, context=serializer.context, partial=True)
        assert s.is_valid(), s.errors
        updated_doc = s.save()
        assert updated_doc.title == "Extra Field Test"
        assert not hasattr(updated_doc, "nonexistent_field")
        assert updated_doc.user == serializer.context["request"].user