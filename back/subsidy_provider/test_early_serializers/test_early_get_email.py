import pytest
from subsidy_provider.serializers import SimpleUserSerializer


# -------------------- FIXED FIXTURE --------------------
class DummyUser:
    """Simple dummy object to test serializer methods."""
    pass


@pytest.fixture
def dummy_user():
    """Return an INSTANCE, not the class."""
    return DummyUser()
# -------------------------------------------------------


class TestSimpleUserSerializerGetEmail:
    """
    Unit tests for SimpleUserSerializer.get_email method.
    """

    @pytest.fixture
    def serializer(self):
        """
        Returns an instance of SimpleUserSerializer with a dummy _safe method.
        """
        class DummySerializer(SimpleUserSerializer):
            def _safe(self, obj, attr):
                # Simulate real _safe logic
                try:
                    return getattr(obj, attr, None)
                except Exception:
                    return None
        return DummySerializer()

    # ------------------- Happy Path Tests -------------------

    @pytest.mark.happy_path
    def test_get_email_returns_email_when_present(self, serializer, dummy_user):
        dummy_user.email = "test@example.com"
        result = serializer.get_email(dummy_user)
        assert result == "test@example.com"

    @pytest.mark.happy_path
    def test_get_email_returns_none_when_email_is_none(self, serializer, dummy_user):
        dummy_user.email = None
        result = serializer.get_email(dummy_user)
        assert result is None

    # ------------------- Edge Case Tests -------------------

    @pytest.mark.edge_case
    def test_get_email_returns_none_when_email_missing(self, serializer, dummy_user):
        # no email attribute
        result = serializer.get_email(dummy_user)
        assert result is None

    @pytest.mark.edge_case
    def test_get_email_with_non_string_email(self, serializer, dummy_user):
        dummy_user.email = 12345
        result = serializer.get_email(dummy_user)
        assert result == 12345

    @pytest.mark.edge_case
    def test_get_email_with_empty_string_email(self, serializer, dummy_user):
        dummy_user.email = ""
        result = serializer.get_email(dummy_user)
        assert result == ""

    @pytest.mark.edge_case
    def test_get_email_with_object_having__safe_method(self):
        """
        Object itself has a `_safe` method — should not break serializer.
        """

        class UserWithSafe:
            def _safe(self, obj, attr):
                return "should_not_be_used"

        user = UserWithSafe()
        user.email = "user@safe.com"

        serializer = SimpleUserSerializer()
        serializer._safe = lambda obj, attr: getattr(obj, attr, None)

        result = serializer.get_email(user)
        assert result == "user@safe.com"

    @pytest.mark.edge_case
    def test_get_email_with_obj_is_none(self, serializer):
        result = serializer.get_email(None)
        assert result is None

    @pytest.mark.edge_case
    def test_get_email_with_obj_is_not_user_like(self, serializer):
        result = serializer.get_email(42)
        assert result is None

    @pytest.mark.edge_case
    def test_get_email_with_obj_is_dict(self, serializer):
        # getattr on dict → fails → serializer returns None
        result = serializer.get_email({"email": "dict@example.com"})
        assert result is None
