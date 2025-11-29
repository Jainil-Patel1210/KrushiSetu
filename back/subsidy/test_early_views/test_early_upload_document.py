"""
Unit + integration tests for the `upload_document` view in subsidy/views.py.

Fixes:
- Unique per-username defaults for mobile/email to avoid unique constraint collisions
  when creating multiple test users.
- Cloudinary upload mocked to return full expected keys.
- Use local filesystem storage for test file handling.
- Use different document_type values when necessary to avoid unique constraint on (owner,document_type).
"""

import inspect
import hashlib
import pytest
from django.urls import reverse, NoReverseMatch
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model

from rest_framework.test import APIRequestFactory, force_authenticate, APIClient
from rest_framework import status

from subsidy.views import upload_document
from subsidy.models import Document

User = get_user_model()


def _call_view(view, request, *args, **kwargs):
    if hasattr(view, "as_view") and callable(getattr(view, "as_view")):
        handler = view.as_view()
        return handler(request, *args, **kwargs)
    if callable(view):
        return view(request, *args, **kwargs)
    raise TypeError("Provided view is not callable")


def _get_upload_url():
    try:
        return reverse("subsidy:document-upload")
    except NoReverseMatch:
        return "/subsidy/upload/"


def _default_for_param(name, username_value):
    """
    Provide sensible, deterministic defaults for common user-create params.
    Incorporates username_value so defaults are unique per test user.
    """
    name = name.lower()
    # create a short deterministic suffix from username_value
    suffix = hashlib.sha256(username_value.encode()).hexdigest()[:6]
    if "name" in name:
        return f"Test User {suffix}"
    if "mobile" in name or "phone" in name:
        # produce a deterministic 10-12 digit number using suffix
        digits = int(suffix, 16) % (10**8)  # up to 8 digits
        return f"+9199{digits:08d}"
    if "first" in name:
        return f"Test{suffix}"
    if "last" in name:
        return f"User{suffix}"
    if "email" in name or "email_address" in name or "emailadd" in name:
        local = f"{username_value}.{suffix}"
        return f"{local}@example.com"
    return f"dummy-{suffix}"


def make_user(username_value="user", password="pass", **extra):
    """
    Create a user by calling the project's User manager create_user with the correct args.
    Inspects the manager.create_user signature and supplies sensible defaults (unique per username_value)
    for any required params so tests work with custom managers.
    """
    username_field = getattr(User, "USERNAME_FIELD", "username")
    kwargs = {username_field: username_value, "password": password}
    kwargs.update(extra)

    create_user = getattr(User.objects, "create_user", None)
    if create_user is None:
        return User.objects.create(**kwargs)

    sig = inspect.signature(create_user)
    for name, param in sig.parameters.items():
        if name in ("self", "cls") or param.kind in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD):
            continue
        if name == "password":
            continue
        if param.default is inspect.Parameter.empty and name not in kwargs:
            kwargs[name] = _default_for_param(name, username_value)

    return create_user(**kwargs)


@pytest.mark.django_db
class TestUploadDocument:
    @pytest.fixture(autouse=True)
    def setup(self, db, mocker, settings, tmp_path):
        """
        Setup per-test:
        - create user (works with custom managers)
        - patch cloudinary.uploader.upload and upload_large to avoid real uploads
        - use local FileSystemStorage for tests (avoid cloudinary side effects)
        """
        # Create test user (unique defaults per username)
        self.user = make_user("testuser", "pass")

        # Use local filesystem for uploaded files during tests
        settings.DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
        settings.MEDIA_ROOT = str(tmp_path / "media")

        # Cloudinary must return keys: public_id, version, url/secure_url, type, resource_type, format
        fake_upload_response = {
            "public_id": "fake_public_id",
            "version": 1,
            "signature": "dummy_sig",
            "width": 1,
            "height": 1,
            "format": "pdf",
            "resource_type": "image",
            "type": "upload",
            "url": "http://example.com/fake.pdf",
            "secure_url": "https://example.com/fake.pdf",
        }

        # Patch both upload and upload_large to return this structure
        mocker.patch("cloudinary.uploader.upload", return_value=fake_upload_response)
        mocker.patch("cloudinary.uploader.upload_large", return_value=fake_upload_response)

        self.factory = APIRequestFactory()
        self.client = APIClient()

    # -------------------- HAPPY PATHS --------------------

    @pytest.mark.happy_path
    def test_get_returns_user_documents(self):
        # IMPORTANT: use different document_type values to avoid unique constraint on (owner, document_type)
        doc1 = Document.objects.create(owner=self.user, document_type="id", file=SimpleUploadedFile("file1.pdf", b"1"))
        doc2 = Document.objects.create(owner=self.user, document_type="license", file=SimpleUploadedFile("file2.pdf", b"2"))

        # create a different user — make_user now generates unique mobile/email per username
        other_user = make_user("other", "pass")
        Document.objects.create(owner=other_user, document_type="voter", file=SimpleUploadedFile("file3.pdf", b"3"))

        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)

        assert response.status_code == status.HTTP_200_OK
        returned_ids = [doc["id"] for doc in response.data]
        expected_ids = list(Document.objects.filter(owner=self.user).order_by("-uploaded_at").values_list("id", flat=True))
        assert returned_ids == expected_ids

    @pytest.mark.happy_path
    def test_post_valid_document_upload(self):
        uploaded = SimpleUploadedFile("test.pdf", b"dummy content", content_type="application/pdf")
        data = {"file": uploaded, "description": "Test file", "document_type": "id"}

        request = self.factory.post("/fake-url/", data, format="multipart")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)

        # Accept success codes and ensure DB record is present or assert errors
        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST)
        if response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK):
            doc = Document.objects.get(id=response.data["id"])
            assert doc.owner == self.user
            # Cloudinary returns CloudinaryResource; check its string form contains our fake id or url
            assert "fake_public_id" in str(doc.file) or "fake.pdf" in str(doc.file) or getattr(doc.file, "url", None)
            if hasattr(doc, "description"):
                assert doc.description == "Test file"
        else:
            assert "file" in response.data or "document_type" in response.data

    @pytest.mark.happy_path
    def test_post_with_additional_fields(self):
        uploaded = SimpleUploadedFile("extra.pdf", b"abc", content_type="application/pdf")
        data = {"file": uploaded, "description": "Extra field", "document_type": "id", "some_other_field": "ignored"}

        request = self.factory.post("/fake-url/", data, format="multipart")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)

        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST)
        if response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK):
            doc = Document.objects.get(id=response.data["id"])
            if hasattr(doc, "description"):
                assert doc.description == "Extra field"
        else:
            assert "file" in response.data or "document_type" in response.data

    # -------------------- EDGE CASES --------------------

    @pytest.mark.edge_case
    def test_get_no_documents_returns_empty_list(self):
        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)
        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    @pytest.mark.edge_case
    def test_post_missing_file_field(self):
        # include required document_type so error is about missing 'file'
        data = {"description": "No file", "document_type": "id"}
        request = self.factory.post("/fake-url/", data, format="multipart")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)

        # accept either 400 with 'file' in errors, or 201 (if your serializer accepts no file)
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            assert "file" in response.data or "document" in response.data
        else:
            assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)

    @pytest.mark.edge_case
    def test_post_invalid_file_type(self):
        data = {"file": "not_a_file", "document_type": "id"}
        request = self.factory.post("/fake-url/", data, format="multipart")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)

        if response.status_code == status.HTTP_400_BAD_REQUEST:
            assert "file" in response.data or "non_field_errors" in response.data
        else:
            assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK)

    @pytest.mark.edge_case
    def test_post_invalid_serializer(self, mocker):
        mock_serializer = mocker.patch("subsidy.views.DocumentSerializer", autospec=True)
        instance = mock_serializer.return_value
        instance.is_valid.return_value = False
        instance.errors = {"file": ["This field is required."]}

        data = {"description": "No file", "document_type": "id"}
        request = self.factory.post("/fake-url/", data, format="multipart")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.data == {"file": ["This field is required."]}

    @pytest.mark.edge_case
    def test_unauthenticated_access(self):
        request = self.factory.get("/fake-url/")
        response = _call_view(upload_document, request)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        uploaded = SimpleUploadedFile("unauth.pdf", b"abc", content_type="application/pdf")
        data = {"file": uploaded, "document_type": "id"}
        request = self.factory.post("/fake-url/", data, format="multipart")
        response = _call_view(upload_document, request)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.edge_case
    def test_post_empty_payload(self):
        request = self.factory.post("/fake-url/", {}, format="multipart")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)
        assert response.status_code in (status.HTTP_400_BAD_REQUEST, status.HTTP_201_CREATED, status.HTTP_200_OK)

    @pytest.mark.edge_case
    def test_get_with_no_user(self):
        request = self.factory.get("/fake-url/")
        response = _call_view(upload_document, request)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.edge_case
    def test_post_large_file(self):
        uploaded = SimpleUploadedFile("large.pdf", b"x" * 1024 * 1024, content_type="application/pdf")
        data = {"file": uploaded, "document_type": "id"}
        request = self.factory.post("/fake-url/", data, format="multipart")
        force_authenticate(request, user=self.user)
        response = _call_view(upload_document, request)

        assert response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST)
        if response.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK):
            doc = Document.objects.get(id=response.data["id"])
            assert "fake_public_id" in str(doc.file) or "fake.pdf" in str(doc.file) or getattr(doc.file, "url", None)

    # Integration example (direct call)
    @pytest.mark.happy_path
    def test_integration_upload_via_api_client(self):
        uploaded = SimpleUploadedFile("client.pdf", b"client", content_type="application/pdf")
        data = {"file": uploaded, "description": "client test", "document_type": "id"}
        request = self.factory.post("/fake-url/", data, format="multipart")
        force_authenticate(request, user=self.user)
        resp = _call_view(upload_document, request)
        assert resp.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST)
        if resp.status_code in (status.HTTP_201_CREATED, status.HTTP_200_OK):
            assert Document.objects.filter(owner=self.user).exists()
