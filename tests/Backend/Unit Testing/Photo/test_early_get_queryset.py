import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from unittest.mock import MagicMock, patch
from photo.models import Document
from photo.views import UserDocumentsListCreateView
import time

User = get_user_model()

@pytest.mark.django_db
class TestUserDocumentsListCreateViewGetQueryset:

    @pytest.fixture(autouse=True)
    def setup(self, db):
        """
        Shared setup for all tests: create a request factory and a test user.
        """
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            full_name='Test User',
            mobile_number='+911234567890',
            email_address='test@example.com',
            password='testpass'
        )

    def create_document(self, user, title, doc_type='aadhar_card', doc_number='1234'):
        with patch('cloudinary.uploader.upload'):
            doc = Document.objects.create(
                user=user,
                title=title,
                document_type=doc_type,
                document_number=doc_number,
                file="test.pdf"   # Store plain string directly in DB
        )
        return doc


    @pytest.mark.happy_path
    def test_returns_only_user_documents(self):
        other_user = User.objects.create_user(
            full_name='Other User',
            mobile_number='+911111111111',
            email_address='other@example.com',
            password='otherpass'
        )

        doc1 = self.create_document(self.user, "Test Doc 1", 'aadhar_card', '1234')
        time.sleep(0.01)
        doc2 = self.create_document(self.user, "Test Doc 2", 'bank_passbook', '5678')
        self.create_document(other_user, "Other Doc", 'aadhar_card', '9999')

        request = self.factory.get('/documents/')
        request.user = self.user

        view = UserDocumentsListCreateView()
        view.request = request

        qs = view.get_queryset()
        assert list(qs) == [doc2, doc1]
        assert all(doc.user == self.user for doc in qs)

    @pytest.mark.happy_path
    def test_returns_empty_queryset_when_user_has_no_documents(self):
        request = self.factory.get('/documents/')
        request.user = self.user

        view = UserDocumentsListCreateView()
        view.request = request

        qs = view.get_queryset()
        assert list(qs) == []

    @pytest.mark.edge_case
    def test_returns_queryset_when_multiple_users_have_documents(self):
        other_user1 = User.objects.create_user(
            full_name='User One',
            mobile_number='+911111111112',
            email_address='u1@example.com',
            password='pass1'
        )
        other_user2 = User.objects.create_user(
            full_name='User Two',
            mobile_number='+911111111113',
            email_address='u2@example.com',
            password='pass2'
        )

        doc1 = self.create_document(self.user, "My Doc", 'aadhar_card', '1111')
        self.create_document(other_user1, "Other1 Doc", 'aadhar_card', '2222')
        self.create_document(other_user2, "Other2 Doc", 'aadhar_card', '3333')

        request = self.factory.get('/documents/')
        request.user = self.user

        view = UserDocumentsListCreateView()
        view.request = request
        qs = view.get_queryset()

        assert list(qs) == [doc1]
        assert all(doc.user == self.user for doc in qs)

    @pytest.mark.edge_case
    def test_documents_are_ordered_by_uploaded_at_descending(self):
        doc1 = self.create_document(self.user, "First Doc", 'aadhar_card', '1111')
        time.sleep(0.01)
        doc2 = self.create_document(self.user, "Second Doc", 'bank_passbook', '2222')
        time.sleep(0.01)
        doc3 = self.create_document(self.user, "Third Doc", 'land_document', '3333')

        request = self.factory.get('/documents/')
        request.user = self.user

        view = UserDocumentsListCreateView()
        view.request = request
        qs = view.get_queryset()

        assert list(qs) == [doc3, doc2, doc1]

    @pytest.mark.edge_case
    def test_request_user_is_anonymous(self):
        request = self.factory.get('/documents/')
        request.user = AnonymousUser()

        view = UserDocumentsListCreateView()
        view.request = request
        qs = view.get_queryset()

        assert list(qs) == []

    @pytest.mark.edge_case
    def test_request_user_is_none(self):
        request = self.factory.get('/documents/')
        request.user = None

        view = UserDocumentsListCreateView()
        view.request = request

        try:
            qs = view.get_queryset()
            assert list(qs) == []
        except AttributeError:
            pass

    @pytest.mark.edge_case
    def test_uploaded_at_field_with_identical_timestamps(self):
        docs = [
            self.create_document(self.user, f"Doc {i}", 'aadhar_card', f'{i}000')
            for i in range(3)
        ]

        request = self.factory.get('/documents/')
        request.user = self.user

        view = UserDocumentsListCreateView()
        view.request = request
        qs = view.get_queryset()

        assert len(qs) == 3
        assert all(doc.user == self.user for doc in qs)
