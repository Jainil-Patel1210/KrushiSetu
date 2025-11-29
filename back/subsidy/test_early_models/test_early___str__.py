# test_models_str.py
import pytest
from types import SimpleNamespace
from subsidy.models import Document, SubsidyApplication

def build_model_instance_without_init(model_cls, **attrs):
    """
    Create an instance of model_cls without calling its __init__ and set attributes
    directly in __dict__. Also set a minimal _state with fields_cache so Django's
    related descriptors won't raise AttributeError when accessing FK fields.

    Additionally, if attrs contains common FK names (owner, user, subsidy,
    assigned_officer), we add them to fields_cache and set <name>_id to a dummy
    integer to keep Django's deferred checks happy.
    """
    inst = model_cls.__new__(model_cls)
    # minimal _state expected by Django internals (fields_cache used by related descriptors)
    inst._state = SimpleNamespace(fields_cache={})

    # put provided attrs into __dict__
    inst.__dict__.update(attrs)

    # If foreign-key-like names present, pre-cache them and set dummy ids
    fk_names = ("owner", "user", "subsidy", "assigned_officer")
    for name in fk_names:
        if name in attrs:
            inst._state.fields_cache[name] = attrs[name]
            # set a corresponding id value to avoid other deferred checks
            id_attr = f"{name}_id"
            if id_attr not in inst.__dict__:
                inst.__dict__[id_attr] = 1

    return inst

@pytest.fixture
def mock_user():
    """Simple lightweight user-like object with full_name attribute."""
    return SimpleNamespace(full_name="John Doe")

@pytest.fixture
def mock_subsidy():
    """Simple lightweight subsidy-like object with title attribute."""
    return SimpleNamespace(title="Farming Subsidy")

@pytest.fixture
def document_instance(mock_user):
    """Construct a Document instance without calling __init__ (no DB needed)."""
    return build_model_instance_without_init(
        Document,
        owner=mock_user,
        document_type="Aadhaar Card",
        document_number="1234-5678-9012"
    )

@pytest.fixture
def subsidy_application_instance(mock_user, mock_subsidy):
    """Construct a SubsidyApplication instance without calling __init__ (no DB needed)."""
    return build_model_instance_without_init(
        SubsidyApplication,
        application_id="APP1234567890",
        user=mock_user,
        subsidy=mock_subsidy,
        full_name="John Doe",
        mobile="9999999999",
        email="john@example.com",
        aadhaar="123456789012",
        address="123 Main St",
        state="StateX",
        district="DistrictY",
        taluka="TalukaZ",
        village="VillageA",
        land_area=1.5,
        land_unit="Acres",
        soil_type="Loamy",
        ownership="Owned",
        bank_name="BankX",
        account_number="000111222333",
        ifsc="IFSC0001"
    )

##############################
# Tests for Document.__str__ #
##############################

class TestDocumentStr:
    def test_str_returns_full_name_and_document_type(self, document_instance, mock_user):
        """Happy path: owner.full_name and document_type present."""
        expected = f"{mock_user.full_name} - {document_instance.document_type}"
        assert str(document_instance) == expected

    def test_str_owner_full_name_is_empty(self, document_instance, mock_user):
        """Edge: owner's full_name is empty string."""
        mock_user.full_name = ""
        expected = f" - {document_instance.document_type}"
        assert str(document_instance) == expected

    def test_str_document_type_is_empty(self, document_instance, mock_user):
        """Edge: document_type empty string."""
        document_instance.document_type = ""
        expected = f"{mock_user.full_name} - "
        assert str(document_instance) == expected

    def test_str_owner_full_name_is_none(self, document_instance, mock_user):
        """Edge: owner's full_name is None -> string 'None' expected."""
        mock_user.full_name = None
        expected = f"None - {document_instance.document_type}"
        assert str(document_instance) == expected

    def test_str_document_type_is_none(self, document_instance, mock_user):
        """Edge: document_type is None -> string 'None' expected."""
        document_instance.document_type = None
        expected = f"{mock_user.full_name} - None"
        assert str(document_instance) == expected

    def test_str_owner_has_no_full_name_attribute(self, document_instance):
        """
        Edge: owner has no full_name attribute -> __str__ tries to access owner.full_name
        and should raise AttributeError (this mimics a badly-formed owner object).
        """
        # replace owner with an object lacking full_name
        document_instance.__dict__['owner'] = object()
        # also update the cache so the descriptor returns this object
        document_instance._state.fields_cache['owner'] = document_instance.__dict__['owner']
        with pytest.raises(AttributeError):
            str(document_instance)

#########################################
# Tests for SubsidyApplication.__str__  #
#########################################

class TestSubsidyApplicationStr:
    def test_str_returns_user_full_name_and_subsidy_title(self, subsidy_application_instance, mock_user, mock_subsidy):
        """Happy path: user.full_name and subsidy.title present."""
        expected = f"{mock_user.full_name} - {mock_subsidy.title}"
        assert str(subsidy_application_instance) == expected

    def test_str_user_full_name_is_empty(self, subsidy_application_instance, mock_user):
        """Edge: user.full_name is empty string."""
        mock_user.full_name = ""
        expected = f" - {subsidy_application_instance.subsidy.title}"
        assert str(subsidy_application_instance) == expected

    def test_str_subsidy_title_is_empty(self, subsidy_application_instance, mock_subsidy):
        """Edge: subsidy.title is empty string."""
        mock_subsidy.title = ""
        expected = f"{subsidy_application_instance.user.full_name} - "
        assert str(subsidy_application_instance) == expected

    def test_str_user_full_name_is_none(self, subsidy_application_instance, mock_user):
        """Edge: user.full_name is None -> string 'None' expected."""
        mock_user.full_name = None
        expected = f"None - {subsidy_application_instance.subsidy.title}"
        assert str(subsidy_application_instance) == expected

    def test_str_subsidy_title_is_none(self, subsidy_application_instance, mock_subsidy):
        """Edge: subsidy.title is None -> string 'None' expected."""
        mock_subsidy.title = None
        expected = f"{subsidy_application_instance.user.full_name} - None"
        assert str(subsidy_application_instance) == expected

    def test_str_user_has_no_full_name_attribute(self, subsidy_application_instance):
        """Edge: user missing full_name -> should raise AttributeError."""
        subsidy_application_instance.__dict__['user'] = object()
        subsidy_application_instance._state.fields_cache['user'] = subsidy_application_instance.__dict__['user']
        with pytest.raises(AttributeError):
            str(subsidy_application_instance)

    def test_str_subsidy_has_no_title_attribute(self, subsidy_application_instance):
        """Edge: subsidy missing title -> should raise AttributeError."""
        subsidy_application_instance.__dict__['subsidy'] = object()
        subsidy_application_instance._state.fields_cache['subsidy'] = subsidy_application_instance.__dict__['subsidy']
        with pytest.raises(AttributeError):
            str(subsidy_application_instance)
