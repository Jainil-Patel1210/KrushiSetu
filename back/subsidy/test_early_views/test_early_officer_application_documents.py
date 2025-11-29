# subsidy/test_early_views/test_early_officer_application_documents.py

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from subsidy.views import officer_application_documents
from subsidy.models import SubsidyApplication


class DummyUser:
    @property
    def is_authenticated(self):
        return True

    def __init__(self, role="user", pk=1):
        self.role = role
        self.id = pk
        self.pk = pk


@pytest.fixture
def api_rf():
    return APIRequestFactory()


@pytest.fixture
def officer_user():
    return DummyUser(role="officer", pk=10)


@pytest.fixture
def non_officer_user():
    return DummyUser(role="user", pk=20)


@pytest.fixture
def mock_documents():
    """Return 2 fake documents."""
    d1 = MagicMock()
    d1.id = 1
    d1.document_type = "ID Proof"
    d1.document_number = "ABC123"
    d1.uploaded_at = "2024-01-01"
    d1.file = MagicMock()
    d1.file.url = "http://example.com/doc1"

    d2 = MagicMock()
    d2.id = 2
    d2.document_type = "Land Record"
    d2.document_number = "XYZ456"
    d2.uploaded_at = "2024-01-02"
    d2.file = None

    return [d1, d2]


@pytest.fixture
def mock_application(mock_documents, officer_user):
    """Mock SubsidyApplication with 2 documents."""
    app = MagicMock()
    app.id = 1

    docs_qs = MagicMock()
    docs_qs.all.return_value = mock_documents
    app.documents = docs_qs

    app.assigned_officer = officer_user
    return app


class TestOfficerApplicationDocuments:

    def prepare_request(self, api_rf, user):
        req = api_rf.get("/fake-url/")
        force_authenticate(req, user=user)
        return req

    def test_officer_can_fetch_documents(self, api_rf, officer_user, mock_application):
        req = self.prepare_request(api_rf, officer_user)

        with patch.object(SubsidyApplication.objects, "get") as mock_get:
            mock_get.return_value = mock_application

            response = officer_application_documents(req, app_id=1)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
        assert response.data[0]["document_type"] == "ID Proof"

    def test_non_officer_forbidden(self, api_rf, non_officer_user):
        req = self.prepare_request(api_rf, non_officer_user)

        response = officer_application_documents(req, app_id=1)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_application_not_found(self, api_rf, officer_user):
        req = self.prepare_request(api_rf, officer_user)

        with patch.object(SubsidyApplication.objects, "get") as mock_get:
            mock_get.side_effect = SubsidyApplication.DoesNotExist

            response = officer_application_documents(req, app_id=999)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_documents_empty(self, api_rf, officer_user):
        req = self.prepare_request(api_rf, officer_user)

        empty_app = MagicMock()
        empty_app.documents.all.return_value = []
        empty_app.assigned_officer = officer_user

        with patch.object(SubsidyApplication.objects, "get") as mock_get:
            mock_get.return_value = empty_app

            response = officer_application_documents(req, app_id=1)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []
