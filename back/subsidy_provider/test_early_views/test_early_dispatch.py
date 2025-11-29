"""
Unit tests for MySubsidiesAPIView.dispatch in subsidy_provider/views.py

Covers:
- Happy paths: normal requests, authenticated/unauthenticated users, various request attributes.
- Edge cases: missing attributes, exceptions in debug print block, unusual request objects.

pytest markers:
- @pytest.mark.happy_path
- @pytest.mark.edge_case
"""

import pytest
from unittest import mock
from subsidy_provider.views import MySubsidiesAPIView

@pytest.fixture
def mock_super_dispatch():
    """Patch super().dispatch to avoid actual DRF logic and to track calls."""
    with mock.patch("subsidy_provider.views.APIView.dispatch", return_value="super-dispatch-result") as patched:
        yield patched

@pytest.fixture
def make_request():
    """Factory to create a mock request with customizable attributes."""
    def _make_request(
        user=None,
        cookies=None,
        meta=None,
    ):
        req = mock.Mock()
        req.user = user if user is not None else mock.Mock()
        req.COOKIES = cookies if cookies is not None else {}
        req.META = meta if meta is not None else {}
        return req
    return _make_request

class TestMySubsidiesAPIViewDispatch:
    @pytest.mark.happy_path
    def test_dispatch_authenticated_user(self, mock_super_dispatch, make_request):
        """Test dispatch with a typical authenticated user and standard request attributes."""
        user = mock.Mock()
        user.is_authenticated = True
        request = make_request(user=user, cookies={"sessionid": "abc"}, meta={"HTTP_AUTHORIZATION": "Token xyz"})
        view = MySubsidiesAPIView()
        result = view.dispatch(request, 1, foo="bar")
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request, 1, foo="bar")

    @pytest.mark.happy_path
    def test_dispatch_unauthenticated_user(self, mock_super_dispatch, make_request):
        """Test dispatch with an unauthenticated user."""
        user = mock.Mock()
        user.is_authenticated = False
        request = make_request(user=user)
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.happy_path
    def test_dispatch_user_without_is_authenticated(self, mock_super_dispatch, make_request):
        """Test dispatch with a user object lacking is_authenticated attribute."""
        user = object()  # No is_authenticated attribute
        request = make_request(user=user)
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.happy_path
    def test_dispatch_request_with_no_cookies(self, mock_super_dispatch, make_request):
        """Test dispatch with request.COOKIES missing or empty."""
        request = make_request(cookies={})
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.happy_path
    def test_dispatch_request_with_no_http_authorization(self, mock_super_dispatch, make_request):
        """Test dispatch with request.META missing HTTP_AUTHORIZATION."""
        request = make_request(meta={})
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.edge_case
    def test_dispatch_request_missing_user(self, mock_super_dispatch):
        """Test dispatch when request has no user attribute."""
        request = mock.Mock()
        delattr(request, "user")
        request.COOKIES = {}
        request.META = {}
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.edge_case
    def test_dispatch_request_missing_cookies(self, mock_super_dispatch, make_request):
        """Test dispatch when request has no COOKIES attribute."""
        request = make_request()
        delattr(request, "COOKIES")
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.edge_case
    def test_dispatch_request_missing_meta(self, mock_super_dispatch, make_request):
        """Test dispatch when request has no META attribute."""
        request = make_request()
        delattr(request, "META")
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.edge_case
    def test_dispatch_debug_print_raises_exception(self, mock_super_dispatch, make_request):
        """Test dispatch when debug print block raises an exception (e.g., __repr__ fails)."""
        class BadUser:
            def __repr__(self):
                raise ValueError("fail repr")
        user = BadUser()
        request = make_request(user=user)
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)

    @pytest.mark.edge_case
    def test_dispatch_request_is_not_mock(self, mock_super_dispatch):
        """Test dispatch with a minimal object as request (not a mock)."""
        class SimpleRequest:
            pass
        request = SimpleRequest()
        request.user = object()
        request.COOKIES = {}
        request.META = {}
        view = MySubsidiesAPIView()
        result = view.dispatch(request)
        assert result == "super-dispatch-result"
        mock_super_dispatch.assert_called_once_with(request)