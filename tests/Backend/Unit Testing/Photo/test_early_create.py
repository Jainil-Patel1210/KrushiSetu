# test_early_create.py

import pytest
from unittest.mock import MagicMock
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory

from photo.serializers import DocumentSerializer
from photo.models import Document

User = get_user_model()


@pytest.mark.django_db
class TestDocumentSerializerCreate:

    @pytest.fixture
    def user(self, db):
        # Custom user model requires full_name, mobile_number, email_address, password
        return User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="testuser@example.com",
            password="testpass",
        )

    @pytest.fixture
    def fake_request(self, user):
        factory = APIRequestFactory()
        req = factory.post("/fake-url/")
        req.user = user
        return req

    @pytest.fixture
    def serializer_context(self, fake_request):
        return {"request": fake_request}

    @pytest.fixture
    def valid_data(self):
        # Use a simple string as Cloudinary public_id to avoid real upload
        return {
            "title": "Test Document",
            "document_type": "aadhar_card",
            "document_number": "ABC123",
            "file": "doc/abc123",
        }

    # ---------------- HAPPY PATH ----------------

    @pytest.mark.happy_path
    def test_create_document_success(self, serializer_context, valid_data, user):
        serializer = DocumentSerializer(data=valid_data, context=serializer_context)
        assert serializer.is_valid(), serializer.errors
        doc = serializer.save()

        assert isinstance(doc, Document)
        assert doc.user == user
        assert doc.title == valid_data["title"]
        assert doc.document_type == valid_data["document_type"]
        assert doc.document_number == valid_data["document_number"]

    @pytest.mark.happy_path
    def test_create_document_with_minimal_fields(self, serializer_context, user):
        data = {
            "title": "Minimal Doc",
            "document_type": "aadhar_card",
            "document_number": "XYZ123",
            "file": "doc/min123",
        }
        serializer = DocumentSerializer(data=data, context=serializer_context)
        assert serializer.is_valid(), serializer.errors
        doc = serializer.save()

        assert doc.user == user
        assert doc.title == data["title"]

    # ---------------- EDGE CASES ----------------

    @pytest.mark.edge_case
    def test_create_document_missing_user_in_context(self, valid_data):
        # request without user attribute; save should raise AttributeError in create()
        fake_req = MagicMock()
        if hasattr(fake_req, "user"):
            del fake_req.user
        serializer = DocumentSerializer(data=valid_data, context={"request": fake_req})
        assert serializer.is_valid(), serializer.errors
        with pytest.raises(AttributeError):
            serializer.save()

    @pytest.mark.edge_case
    def test_create_document_missing_request_in_context(self, valid_data):
        serializer = DocumentSerializer(data=valid_data, context={})
        assert serializer.is_valid(), serializer.errors
        with pytest.raises(KeyError):
            serializer.save()

    @pytest.mark.edge_case
    def test_create_document_with_extra_fields(self, serializer_context, valid_data, user):
        data = valid_data.copy()
        data["extra_field"] = "ignore"
        serializer = DocumentSerializer(data=data, context=serializer_context)
        assert serializer.is_valid(), serializer.errors
        doc = serializer.save()
        assert doc.title == valid_data["title"]
        assert not hasattr(doc, "extra_field")

    @pytest.mark.edge_case
    def test_create_document_with_null_file(self, serializer_context, user):
        data = {
            "title": "Null File Doc",
            "document_type": "aadhar_card",
            "document_number": "NULL1",
            "file": None,
        }
        serializer = DocumentSerializer(data=data, context=serializer_context)
        # Validation should fail before save
        assert not serializer.is_valid()

    @pytest.mark.edge_case
    def test_create_document_with_empty_data(self, serializer_context):
        serializer = DocumentSerializer(data={}, context=serializer_context)
        assert not serializer.is_valid()

    @pytest.mark.edge_case
    def test_create_document_with_non_dict_validated_data(self, serializer_context):
        # DRF Serializer expects dict; passing non-dict via data parameter triggers failure
        serializer = DocumentSerializer(data=None, context=serializer_context)
        assert not serializer.is_valid()
