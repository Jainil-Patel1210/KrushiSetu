# test_models_str.py

import pytest
from unittest.mock import Mock
from django.contrib.auth import get_user_model
from django.utils import timezone
from photo.models import Document

User = get_user_model()

@pytest.mark.django_db
class TestDocumentStr:
    """Unit tests for the __str__ method of the Document model."""

    @pytest.fixture
    def user_with_email(self, db):
        """Real user instance with an added .email attribute for __str__ path."""
        user = User.objects.create_user(
            full_name="Email User",
            mobile_number="+919999000001",
            email_address="testuser@example.com",
            password="pass",
        )
        # Add a transient 'email' attribute so __str__ uses it
        user.email = user.email_address
        return user

    @pytest.fixture
    def user_without_email(self, db):
        """Real user instance lacking the transient 'email' attr; __str__ should use id."""
        user = User.objects.create_user(
            full_name="No Email User",
            mobile_number="+919999000002",
            email_address="noemail@example.com",
            password="pass",
        )
        # Ensure there's no 'email' attr (our model doesn't define it)
        if hasattr(user, "email"):
            delattr(user, "email")
        return user

    @pytest.fixture
    def document_kwargs(self):
        """Fixture for common Document kwargs except user and title."""
        return {
            "document_type": "aadhar_card",
            "document_number": "1234567890",
            "file": Mock(),  # CloudinaryField can be mocked
            "resource_type": "auto",
            "uploaded_at": timezone.now(),
        }

    # ------------------- Happy Path Tests -------------------

    @pytest.mark.happy_path
    def test_str_returns_email_and_title(self, user_with_email, document_kwargs):
        """
        Test that __str__ returns '<user.email> - <title>' when user has an email.
        """
        doc = Document(
            user=user_with_email,
            title="Aadhar Card",
            **document_kwargs
        )
        assert str(doc) == f"{user_with_email.email} - Aadhar Card"

    @pytest.mark.happy_path
    def test_str_returns_id_and_title_when_no_email(self, user_without_email, document_kwargs):
        """
        Test that __str__ returns '<user.id> - <title>' when user has no email attribute.
        """
        doc = Document(
            user=user_without_email,
            title="Land Document",
            **document_kwargs
        )
        assert str(doc) == f"{user_without_email.id} - Land Document"

    @pytest.mark.happy_path
    def test_str_with_numeric_title(self, user_with_email, document_kwargs):
        """
        Test that __str__ works when title is numeric.
        """
        doc = Document(
            user=user_with_email,
            title="12345",
            **document_kwargs
        )
        assert str(doc) == f"{user_with_email.email} - 12345"

    @pytest.mark.happy_path
    def test_str_with_special_characters_in_title(self, user_with_email, document_kwargs):
        """
        Test that __str__ works when title contains special characters.
        """
        doc = Document(
            user=user_with_email,
            title="Résumé & ID #42!",
            **document_kwargs
        )
        assert str(doc) == f"{user_with_email.email} - Résumé & ID #42!"

    # ------------------- Edge Case Tests -------------------

    @pytest.mark.edge_case
    def test_str_with_empty_title(self, user_with_email, document_kwargs):
        """
        Test that __str__ works when title is an empty string.
        """
        doc = Document(
            user=user_with_email,
            title="",
            **document_kwargs
        )
        assert str(doc) == f"{user_with_email.email} - "

    @pytest.mark.edge_case
    def test_str_with_none_title(self, user_with_email, document_kwargs):
        """
        Test that __str__ handles title=None gracefully (should raise TypeError).
        """
        doc = Document(
            user=user_with_email,
            title=None,
            **document_kwargs
        )
        # f-string with None will print 'None'
        assert str(doc) == f"{user_with_email.email} - None"

    @pytest.mark.edge_case
    def test_str_user_id_is_none(self, document_kwargs):
        """
        Test __str__ when user has no email and id is None (unsaved user).
        """
        user = User(
            full_name="Unsaved User",
            mobile_number="+919999000003",
        )  # unsaved -> id is None
        # ensure there's no 'email' attribute
        if hasattr(user, "email"):
            delattr(user, "email")
        doc = Document(user=user, title="Test Title", **document_kwargs)
        assert str(doc) == "None - Test Title"

    @pytest.mark.edge_case
    def test_str_user_is_integer(self, document_kwargs):
        """
        Passing a non-User to ForeignKey should raise ValueError at init.
        """
        with pytest.raises(ValueError):
            Document(user=123, title="Test Title", **document_kwargs)

    @pytest.mark.edge_case
    def test_str_user_is_none(self, document_kwargs):
        """
        user=None leads __str__ to access None.id and raise AttributeError.
        """
        doc = Document(user=None, title="Test Title", **document_kwargs)
        with pytest.raises(AttributeError):
            str(doc)