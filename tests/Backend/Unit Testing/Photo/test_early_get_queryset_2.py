# test_early_get_queryset_2.py

import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory
from unittest.mock import MagicMock, patch
from photo.views import UserDocumentDeleteView
from photo.models import Document

User = get_user_model()


@pytest.mark.django_db
class TestUserDocumentDeleteViewGetQueryset:
    """
    Unit tests for UserDocumentDeleteView.get_queryset method.
    """

    @pytest.fixture(autouse=True)
    def setup(self, db):
        """
        Setup for each test: create request factory and test user.
        """
        self.factory = RequestFactory()
        self._uid = 0
        self.user = self.create_user(full_name='Test User 1')
        self.view = UserDocumentDeleteView()

    def _next_uid(self):
        self._uid += 1
        return self._uid

    def create_user(self, full_name="Test User", password='testpass'):
        """Create a user compatible with the custom User model.
        Requires full_name, mobile_number, email_address, password.
        Ensures unique mobile/email per invocation.
        """
        i = self._next_uid()
        email = f"user{i}@example.com"
        # Indian numbers are 10 digits; prefix with +91
        mobile = f"+9199{i:08d}"
        return User.objects.create_user(
            full_name=full_name,
            mobile_number=mobile,
            email_address=email,
            password=password,
        )

    def create_document(self, user, title="Test Doc", doc_type='aadhar_card', doc_number='1234'):
        """Helper to create a Document without real Cloudinary upload.
        CloudinaryField stores a public_id string in DB, so set a dummy value.
        """
        public_id = f"test-public-id-{self._next_uid()}"
        return Document.objects.create(
            user=user,
            title=title,
            document_type=doc_type,
            document_number=doc_number,
            file=public_id,
            resource_type='raw',
        )

    # ---------------------------------------------------------
    #                     HAPPY PATH TESTS
    # ---------------------------------------------------------

    @pytest.mark.happy_path
    def test_authenticated_user_queryset(self):
        """
        Should filter documents belonging to the authenticated user.
        """
        # Create documents for this user
        doc1 = self.create_document(self.user, "User Doc 1")
        doc2 = self.create_document(self.user, "User Doc 2")
        
        # Create document for another user
        other_user = self.create_user(full_name='Other User', password='pass')
        self.create_document(other_user, "Other Doc")

        request = self.factory.delete('/documents/1/')
        request.user = self.user
        self.view.request = request

        qs = self.view.get_queryset()
        
        assert qs.count() == 2
        assert doc1 in qs
        assert doc2 in qs
        assert all(doc.user == self.user for doc in qs)

    @pytest.mark.happy_path
    def test_authenticated_user_with_no_documents(self):
        """
        Should return an empty queryset when user has no documents.
        """
        request = self.factory.delete('/documents/1/')
        request.user = self.user
        self.view.request = request

        qs = self.view.get_queryset()
        
        assert qs.count() == 0
        assert list(qs) == []

    # ---------------------------------------------------------
    #                     EDGE CASE TESTS
    # ---------------------------------------------------------

    @pytest.mark.edge_case
    def test_user_is_none(self):
        """
        When request.user is None, should return empty queryset or handle gracefully.
        """
        request = self.factory.delete('/documents/1/')
        request.user = None
        self.view.request = request

        # The view will try to filter with user=None
        qs = self.view.get_queryset()
        assert qs.count() == 0

    @pytest.mark.edge_case
    def test_user_is_anonymous(self):
        """
        For AnonymousUser, should return empty queryset.
        """
        request = self.factory.delete('/documents/1/')
        request.user = AnonymousUser()
        self.view.request = request

        qs = self.view.get_queryset()
        
        # AnonymousUser won't match any documents
        assert qs.count() == 0

    @pytest.mark.edge_case
    def test_multiple_users_with_documents(self):
        """
        Should only return documents for the requesting user.
        """
        user2 = self.create_user(full_name='User Two', password='pass2')
        user3 = self.create_user(full_name='User Three', password='pass3')
        
        doc1 = self.create_document(self.user, "User1 Doc")
        self.create_document(user2, "User2 Doc")
        self.create_document(user3, "User3 Doc")

        request = self.factory.delete('/documents/1/')
        request.user = self.user
        self.view.request = request

        qs = self.view.get_queryset()
        
        assert qs.count() == 1
        assert list(qs) == [doc1]

    @pytest.mark.edge_case
    def test_queryset_does_not_include_other_users_documents(self):
        """
        Ensure strict filtering - other users' documents should never appear.
        """
        other_user = self.create_user(full_name='Hacker', password='hack123')
        
        my_doc = self.create_document(self.user, "My Doc")
        other_doc = self.create_document(other_user, "Hacker Doc")

        request = self.factory.delete('/documents/1/')
        request.user = self.user
        self.view.request = request

        qs = self.view.get_queryset()
        
        assert my_doc in qs
        assert other_doc not in qs
        assert qs.count() == 1
