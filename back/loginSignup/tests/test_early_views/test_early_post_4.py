"""
Unit tests for LogoutView.post in loginSignup/views.py

Covers:
- Happy paths: normal logout, cookie deletion
- Edge cases: missing cookies, repeated logout, unusual request objects

Markers:
- happy_path: for normal/expected scenarios
- edge_case: for boundary/unusual scenarios

Assumptions:
- Tests are located as a sibling file to loginSignup/views.py
- Django test client and pytest-django are available
- No authentication required for logout
"""

import pytest
from django.test import RequestFactory
from rest_framework.response import Response

from loginSignup.views import LogoutView

@pytest.mark.usefixtures("rf")
class TestLogoutViewPost:
    @pytest.fixture(autouse=True)
    def rf(self):
        self.factory = RequestFactory()

    # ------------------- Happy Path Tests -------------------

    @pytest.mark.happy_path
    def test_logout_successful_deletes_cookies(self):
        """
        Test that a POST to LogoutView returns success and deletes both access and refresh cookies.
        """
        request = self.factory.post("/logout/")
        # Simulate cookies present
        request.COOKIES = {
            "access_token": "dummy_access",
            "refresh_token": "dummy_refresh"
        }
        response = LogoutView().post(request)
        assert isinstance(response, Response)
        assert response.status_code == 200
        assert response.data == {"message": "Logged out successfully"}
        # Check that cookies are scheduled for deletion
        deleted = [c for c in response.cookies.values() if c.value == "" and c.key in ["access_token", "refresh_token"]]
        assert len(deleted) == 2

    @pytest.mark.happy_path
    def test_logout_successful_without_cookies(self):
        """
        Test logout when no cookies are present; should still succeed and not error.
        """
        request = self.factory.post("/logout/")
        request.COOKIES = {}
        response = LogoutView().post(request)
        assert response.status_code == 200
        assert response.data == {"message": "Logged out successfully"}
        # Cookies should still be scheduled for deletion (even if not present)
        deleted = [c for c in response.cookies.values() if c.value == "" and c.key in ["access_token", "refresh_token"]]
        assert len(deleted) == 2

    # ------------------- Edge Case Tests -------------------

    @pytest.mark.edge_case
    def test_logout_multiple_times(self):
        """
        Test logging out multiple times in a row; should always succeed and delete cookies.
        """
        request = self.factory.post("/logout/")
        request.COOKIES = {
            "access_token": "dummy_access",
            "refresh_token": "dummy_refresh"
        }
        view = LogoutView()
        for _ in range(3):
            response = view.post(request)
            assert response.status_code == 200
            assert response.data == {"message": "Logged out successfully"}
            deleted = [c for c in response.cookies.values() if c.value == "" and c.key in ["access_token", "refresh_token"]]
            assert len(deleted) == 2

    @pytest.mark.edge_case
    def test_logout_with_unexpected_request_object(self):
        """
        Test logout with a request object missing COOKIES attribute; should not raise error.
        """
        class DummyRequest:
            def __init__(self):
                self.method = "POST"
        request = DummyRequest()
        response = LogoutView().post(request)
        assert response.status_code == 200
        assert response.data == {"message": "Logged out successfully"}
        # Cookies should still be scheduled for deletion
        deleted = [c for c in response.cookies.values() if c.value == "" and c.key in ["access_token", "refresh_token"]]
        assert len(deleted) == 2

    @pytest.mark.edge_case
    def test_logout_with_extra_cookies(self):
        """
        Test logout when request contains extra unrelated cookies; only access/refresh should be deleted.
        """
        request = self.factory.post("/logout/")
        request.COOKIES = {
            "access_token": "dummy_access",
            "refresh_token": "dummy_refresh",
            "other_cookie": "value"
        }
        response = LogoutView().post(request)
        assert response.status_code == 200
        assert response.data == {"message": "Logged out successfully"}
        # Only access_token and refresh_token should be deleted
        deleted_keys = [c.key for c in response.cookies.values() if c.value == ""]
        assert "access_token" in deleted_keys
        assert "refresh_token" in deleted_keys
        assert "other_cookie" not in deleted_keys

    @pytest.mark.edge_case
    def test_logout_with_non_post_method(self):
        """
        Test calling post method with a request that is not a POST; should still succeed.
        """
        request = self.factory.get("/logout/")
        request.COOKIES = {
            "access_token": "dummy_access",
            "refresh_token": "dummy_refresh"
        }
        response = LogoutView().post(request)
        assert response.status_code == 200
        assert response.data == {"message": "Logged out successfully"}
        deleted = [c for c in response.cookies.values() if c.value == "" and c.key in ["access_token", "refresh_token"]]
        assert len(deleted) == 2