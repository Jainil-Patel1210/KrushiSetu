import pytest
from subsidy_provider.serializers import SimpleUserSerializer


# ----------------------- FIXTURE -----------------------
class DummyUser:
    """Generic dummy user object used for serializer tests."""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


@pytest.fixture
def dummy_user():
    # Returns a *fresh* dummy object every test
    return DummyUser()
# -------------------------------------------------------


# =================== TESTS BEGIN =======================

class TestSimpleUserSerializerGetUsername:

    @pytest.mark.happy_path
    def test_returns_username_when_present(self, dummy_user):
        dummy_user.username = "testuser"
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) == "testuser"

    @pytest.mark.happy_path
    def test_returns_email_when_username_missing(self, dummy_user):
        dummy_user.username = None
        dummy_user.email = "abc@example.com"
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) == "abc@example.com"

    @pytest.mark.happy_path
    def test_returns_full_name_when_username_and_email_missing(self, dummy_user):
        dummy_user.username = None
        dummy_user.email = None
        dummy_user.full_name = "John Doe"
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) == "John Doe"

    @pytest.mark.happy_path
    def test_returns_first_and_last_name_when_all_others_missing(self, dummy_user):
        dummy_user.username = None
        dummy_user.email = None
        dummy_user.full_name = None
        dummy_user.first_name = "John"
        dummy_user.last_name = "Smith"
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) == "John Smith"

    @pytest.mark.edge_case
    def test_returns_first_name_when_last_name_missing(self, dummy_user):
        dummy_user.first_name = "Alice"
        dummy_user.last_name = ""
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) == "Alice"

    @pytest.mark.edge_case
    def test_returns_last_name_when_first_name_missing(self, dummy_user):
        dummy_user.first_name = ""
        dummy_user.last_name = "Brown"
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) == "Brown"

    @pytest.mark.edge_case
    def test_returns_none_when_all_fields_missing(self, dummy_user):
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) is None

    @pytest.mark.edge_case
    def test_returns_none_when_all_fields_empty_strings(self, dummy_user):
        dummy_user.username = ""
        dummy_user.email = ""
        dummy_user.full_name = ""
        dummy_user.first_name = ""
        dummy_user.last_name = ""
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) is None

    @pytest.mark.edge_case
    def test_strips_whitespace_from_first_and_last_name(self, dummy_user):
        dummy_user.first_name = "  Jane "
        dummy_user.last_name = "  Doe  "
        serializer = SimpleUserSerializer()
        expected = "Jane    Doe"
        assert serializer.get_username(dummy_user) == expected
   

    @pytest.mark.edge_case
    def test_returns_none_when_first_and_last_name_are_spaces(self, dummy_user):
        dummy_user.first_name = "   "
        dummy_user.last_name = "   "
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) is None

    @pytest.mark.edge_case
    def test_handles_missing_attributes_gracefully(self, dummy_user):
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) is None

    @pytest.mark.edge_case
    def test_handles_none_values(self, dummy_user):
        dummy_user.username = None
        dummy_user.email = None
        dummy_user.full_name = None
        dummy_user.first_name = None
        dummy_user.last_name = None
        serializer = SimpleUserSerializer()
        assert serializer.get_username(dummy_user) is None
