import pytest
from unittest.mock import MagicMock, patch
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from photo.views import UserDocumentRetrieveUpdateView
from photo.models import Document

User = get_user_model()


@pytest.mark.django_db
class TestUserDocumentRetrieveUpdateViewGetQueryset:

    @pytest.fixture(autouse=True)
    def setup(self, db):
        """
        Shared setup for all tests: create a request factory and a test user.
        """
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="testpass"
        )

    # ---------------- Happy Path ----------------

    @pytest.mark.happy_path
    def test_returns_queryset_with_user_documents(self):
        doc1 = Document.objects.create(user=self.user, file="file1.pdf")

        other_user = User.objects.create_user(
            full_name="Other User",
            mobile_number="+9111111111",
            email_address="other@example.com",
            password="otherpass"
        )
        Document.objects.create(user=other_user, file="file2.pdf")

        request = self.factory.get("/fake-url/")
        request.user = self.user
        view = UserDocumentRetrieveUpdateView()
        view.request = request

        qs = view.get_queryset()
        assert list(qs) == [doc1]
        assert all(doc.user == self.user for doc in qs)

    @pytest.mark.happy_path
    def test_returns_empty_queryset_when_user_has_no_documents(self):
        request = self.factory.get("/fake-url/")
        request.user = self.user
        view = UserDocumentRetrieveUpdateView()
        view.request = request

        qs = view.get_queryset()
        assert qs.count() == 0

    # ---------------- Edge Cases ----------------

    @pytest.mark.edge_case
    def test_returns_empty_queryset_when_user_is_anonymous(self):
        request = self.factory.get("/fake-url/")
        request.user = AnonymousUser()
        view = UserDocumentRetrieveUpdateView()
        view.request = request

        qs = view.get_queryset()
        assert qs.count() == 0

    @pytest.mark.edge_case
    def test_returns_empty_queryset_when_user_is_none(self):
        request = self.factory.get("/fake-url/")
        request.user = None
        view = UserDocumentRetrieveUpdateView()
        view.request = request

        with patch.object(Document.objects, "filter", wraps=Document.objects.filter) as mock_filter:
            qs = view.get_queryset()
            assert qs.count() == 0
            mock_filter.assert_called_with(user=None)

    @pytest.mark.edge_case
    def test_returns_queryset_when_user_is_superuser(self):
        superuser = User.objects.create_superuser(
            full_name="Admin User",
            mobile_number="+9199999999",
            email_address="admin@example.com",
            password="adminpass"
        )
        doc = Document.objects.create(user=superuser, file="adminfile.pdf")
        Document.objects.create(user=self.user, file="userfile.pdf")

        request = self.factory.get("/fake-url/")
        request.user = superuser
        view = UserDocumentRetrieveUpdateView()
        view.request = request

        qs = view.get_queryset()
        assert list(qs) == [doc]

    @pytest.mark.edge_case
    def test_returns_queryset_when_user_has_no_id(self):
        unsaved_user = User(
            full_name="Unsaved",
            mobile_number="+9177777777",
            email_address="unsaved@example.com"
        )

        request = self.factory.get("/fake-url/")
        request.user = unsaved_user
        view = UserDocumentRetrieveUpdateView()
        view.request = request

        qs = view.get_queryset()
        assert qs.count() == 0

    @pytest.mark.edge_case
    def test_returns_queryset_when_user_is_inactive(self):
        inactive_user = User.objects.create_user(
            full_name="Inactive User",
            mobile_number="+9188888888",
            email_address="inactive@example.com",
            password="pass",
        )
        inactive_user.is_active = False
        inactive_user.save()

        doc = Document.objects.create(user=inactive_user, file="inactivefile.pdf")

        request = self.factory.get("/fake-url/")
        request.user = inactive_user
        view = UserDocumentRetrieveUpdateView()
        view.request = request

        qs = view.get_queryset()
        assert list(qs) == [doc]
