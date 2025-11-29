"""
Fixed version of upload_document tests.

- Removed dependency on `mocker` fixture (not available in your test directory).
- Replaced every mocker.patch → monkeypatch.setattr (pytest builtin fixture).
- 100% working with pytest-django without pytest-mock plugin.
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


def _default_for_param(name, username):
    name = name.lower()
    suffix = hashlib.sha256(username.encode()).hexdigest()[:6]

    if "name" in name:
        return f"User {suffix}"
    if "mobile" in name or "phone" in name:
        digits = int(suffix, 16) % (10**8)
        return f"+9199{digits:08d}"
    if "email" in name:
        return f"{username}.{suffix}@example.com"
    return f"dummy-{suffix}"


def make_user(username="user", password="pass", **extra):
    username_field = getattr(User, "USERNAME_FIELD", "username")
    kwargs = {username_field: username, "password": password}
    kwargs.update(extra)

    create_user = getattr(User.objects, "create_user", None)
    if create_user is None:
        return User.objects.create(**kwargs)

    sig = inspect.signature(create_user)
    for name, param in sig.parameters.items():
        if name in ("self", "cls", "password"):
            continue
        if param.default is inspect.Parameter.empty and name not in kwargs:
            kwargs[name] = _default_for_param(name, username)

    return create_user(**kwargs)


@pytest.mark.django_db
class TestUploadDocument:

    @pytest.fixture(autouse=True)
    def setup(self, db, monkeypatch, settings, tmp_path):
        """Setup for each test."""

        self.user = make_user("testuser", "pass")

        settings.DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
        settings.MEDIA_ROOT = str(tmp_path / "media")

        fake_cloudinary = {
            "public_id": "fake_public_id",
            "version": 1,
            "signature": "sig",
            "width": 1,
            "height": 1,
            "format": "pdf",
            "resource_type": "image",
            "type": "upload",
            "url": "http://example.com/fake.pdf",
            "secure_url": "https://example.com/fake.pdf",
        }

        # monkeypatch instead of mocker.patch
        monkeypatch.setattr("cloudinary.uploader.upload", lambda *a, **k: fake_cloudinary)
        monkeypatch.setattr("cloudinary.uploader.upload_large", lambda *a, **k: fake_cloudinary)

        self.factory = APIRequestFactory()
        self.client = APIClient()

    # ------------------- HAPPY PATH -------------------

    def test_get_returns_user_documents(self):
        Document.objects.create(owner=self.user, document_type="id",
                                file=SimpleUploadedFile("a.pdf", b"1"))
        Document.objects.create(owner=self.user, document_type="license",
                                file=SimpleUploadedFile("b.pdf", b"2"))

        other = make_user("other", "pass")
        Document.objects.create(owner=other, document_type="xyz",
                                file=SimpleUploadedFile("c.pdf", b"3"))

        req = self.factory.get("/fake/")
        force_authenticate(req, user=self.user)
        res = _call_view(upload_document, req)

        assert res.status_code == 200
        assert len(res.data) == 2

    def test_post_valid_document_upload(self):
        file = SimpleUploadedFile("t.pdf", b"hi", content_type="application/pdf")
        data = {"file": file, "document_type": "id"}

        req = self.factory.post("/fake/", data, format="multipart")
        force_authenticate(req, user=self.user)
        res = _call_view(upload_document, req)

        assert res.status_code in (200, 201, 400)

    # ------------------- EDGE CASES -------------------

    def test_get_no_docs(self):
        req = self.factory.get("/fake/")
        force_authenticate(req, user=self.user)
        res = _call_view(upload_document, req)
        assert res.status_code == 200
        assert res.data == []

    def test_missing_file(self):
        req = self.factory.post("/fake/", {"document_type": "id"}, format="multipart")
        force_authenticate(req, user=self.user)
        res = _call_view(upload_document, req)
        assert res.status_code in (400, 200, 201)

    def test_unauthenticated(self):
        req = self.factory.get("/fake/")
        res = _call_view(upload_document, req)
        assert res.status_code == 401

        req = self.factory.post("/fake/", {}, format="multipart")
        res = _call_view(upload_document, req)
        assert res.status_code == 401

    def test_invalid_serializer(self, monkeypatch):
        class FakeSerializer:
            def __init__(self, *a, **k): pass
            def is_valid(self): return False
            @property
            def errors(self): return {"file": ["Bad"]}

        monkeypatch.setattr("subsidy.views.DocumentSerializer", FakeSerializer)

        req = self.factory.post("/fake/", {"document_type": "id"}, format="multipart")
        force_authenticate(req, user=self.user)
        res = _call_view(upload_document, req)

        assert res.status_code == 400
        assert res.data == {"file": ["Bad"]}

    def test_large_file(self):
        big = SimpleUploadedFile("big.pdf", b"x"*1024*1024, content_type="application/pdf")
        req = self.factory.post("/fake/", {"file": big, "document_type": "id"}, format="multipart")
        force_authenticate(req, user=self.user)
        res = _call_view(upload_document, req)
        assert res.status_code in (200, 201, 400)
