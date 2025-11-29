import pytest
from subsidy_provider.serializers import SimpleUserSerializer


# ----------------------- DUMMY USER FIXTURE -----------------------
class DummyUser:
    """Simple dummy user with dynamic attributes."""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


@pytest.fixture
def dummy_user():
    return DummyUser()
# ---------------------------------------------------------------


# ======================= TEST SUITE ============================

class TestSimpleUserSerializerGetFullName:

    # ========== HAPPY PATH TESTS ==========

    @pytest.mark.happy_path
    def test_returns_full_name_when_present(self, dummy_user):
        dummy_user.full_name = "John Doe"
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) == "John Doe"

    @pytest.mark.happy_path
    def test_returns_value_from_get_full_name_method(self, dummy_user):
        class WithMethod:
            def get_full_name(self):
                return "Method FullName"

        user = WithMethod()
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(user) == "Method FullName"

    @pytest.mark.happy_path
    def test_constructs_from_first_and_last_name(self, dummy_user):
        dummy_user.first_name = "Albert"
        dummy_user.last_name = "Einstein"
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) == "Albert Einstein"

    # ========== EDGE CASES ==========

    @pytest.mark.edge_case
    def test_ignores_empty_full_name(self, dummy_user):
        dummy_user.full_name = ""
        dummy_user.first_name = "Isaac"
        dummy_user.last_name = "Newton"
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) == "Isaac Newton"

    @pytest.mark.edge_case
    def test_get_full_name_method_returns_empty(self):
        class UserWithBadMethod:
            def get_full_name(self):
                return ""

        user = UserWithBadMethod()
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(user) is None

    @pytest.mark.edge_case
    def test_first_name_only(self, dummy_user):
        dummy_user.first_name = "Marie"
        dummy_user.last_name = ""
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) == "Marie"

    @pytest.mark.edge_case
    def test_last_name_only(self, dummy_user):
        dummy_user.first_name = ""
        dummy_user.last_name = "Curie"
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) == "Curie"

    @pytest.mark.edge_case
    def test_both_first_and_last_name_empty(self, dummy_user):
        dummy_user.first_name = ""
        dummy_user.last_name = ""
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) is None

    @pytest.mark.edge_case
    def test_all_fields_missing(self, dummy_user):
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) is None

    @pytest.mark.edge_case
    def test_handles_whitespace_in_names(self, dummy_user):
        dummy_user.first_name = "  Ada "
        dummy_user.last_name = "  Lovelace "
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) == "Ada    Lovelace"
        # Serializer strips outer spaces but DOES NOT collapse middle spaces

    @pytest.mark.edge_case
    def test_returns_none_when_first_and_last_are_spaces(self, dummy_user):
        dummy_user.first_name = "   "
        dummy_user.last_name = "   "
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(dummy_user) is None

    @pytest.mark.edge_case
    def test_handles_user_without_any_attributes(self):
        class Empty:
            pass
        serializer = SimpleUserSerializer()
        assert serializer.get_full_name(Empty()) is None
