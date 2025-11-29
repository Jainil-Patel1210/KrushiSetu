# test_models_str.py
import pytest
from types import SimpleNamespace
from subsidy.models import Document, SubsidyApplication

##############################
# Helpers
##############################

def make_doc(owner_full_name="John Doe", document_type="Aadhaar Card", document_number="1234-5678-9012"):
    """
    Create a lightweight object that looks like a Document instance for the
    purpose of calling Document.__str__ without hitting Django's descriptor.
    """
    owner = SimpleNamespace(full_name=owner_full_name)
    return SimpleNamespace(owner=owner, document_type=document_type, document_number=document_number)

def make_subsidy(title="Farming Subsidy"):
    return SimpleNamespace(title=title)

def make_subsidy_app(user_full_name="John Doe", subsidy_title="Farming Subsidy"):
    user = SimpleNamespace(full_name=user_full_name)
    subsidy = SimpleNamespace(title=subsidy_title)
    # other fields are irrelevant for __str__
    return SimpleNamespace(user=user, subsidy=subsidy)

##############################
# Tests for Document.__str__ #
##############################

class TestDocumentStr:
    @pytest.mark.happy_path
    def test_str_returns_full_name_and_document_type(self):
        doc = make_doc(owner_full_name="John Doe", document_type="Aadhaar Card")
        # call the model __str__ unbound to avoid Django model machinery
        assert Document.__str__(doc) == "John Doe - Aadhaar Card"

    @pytest.mark.edge_case
    def test_str_owner_full_name_is_empty(self):
        doc = make_doc(owner_full_name="", document_type="Aadhaar Card")
        assert Document.__str__(doc) == " - Aadhaar Card"

    @pytest.mark.edge_case
    def test_str_document_type_is_empty(self):
        doc = make_doc(owner_full_name="John Doe", document_type="")
        assert Document.__str__(doc) == "John Doe - "

    @pytest.mark.edge_case
    def test_str_owner_full_name_is_none(self):
        doc = make_doc(owner_full_name=None, document_type="Aadhaar Card")
        # str(None) -> 'None'
        assert Document.__str__(doc) == "None - Aadhaar Card"

    @pytest.mark.edge_case
    def test_str_document_type_is_none(self):
        doc = make_doc(owner_full_name="John Doe", document_type=None)
        assert Document.__str__(doc) == "John Doe - None"

    @pytest.mark.edge_case
    def test_str_owner_has_no_full_name_attribute_raises_attribute_error(self):
        # owner is an object without full_name
        doc = SimpleNamespace(owner=object(), document_type="Aadhaar Card")
        with pytest.raises(AttributeError):
            Document.__str__(doc)

##############################
# Tests for SubsidyApplication.__str__
##############################

class TestSubsidyApplicationStr:
    @pytest.mark.happy_path
    def test_str_returns_user_full_name_and_subsidy_title(self):
        app = make_subsidy_app(user_full_name="John Doe", subsidy_title="Farming Subsidy")
        assert SubsidyApplication.__str__(app) == "John Doe - Farming Subsidy"

    @pytest.mark.edge_case
    def test_str_user_full_name_is_empty(self):
        app = make_subsidy_app(user_full_name="", subsidy_title="Farming Subsidy")
        assert SubsidyApplication.__str__(app) == " - Farming Subsidy"

    @pytest.mark.edge_case
    def test_str_subsidy_title_is_empty(self):
        app = make_subsidy_app(user_full_name="John Doe", subsidy_title="")
        assert SubsidyApplication.__str__(app) == "John Doe - "

    @pytest.mark.edge_case
    def test_str_user_full_name_is_none(self):
        app = make_subsidy_app(user_full_name=None, subsidy_title="Farming Subsidy")
        assert SubsidyApplication.__str__(app) == "None - Farming Subsidy"

    @pytest.mark.edge_case
    def test_str_subsidy_title_is_none(self):
        app = make_subsidy_app(user_full_name="John Doe", subsidy_title=None)
        assert SubsidyApplication.__str__(app) == "John Doe - None"

    @pytest.mark.edge_case
    def test_str_user_has_no_full_name_attribute_raises_attribute_error(self):
        app = SimpleNamespace(user=object(), subsidy=make_subsidy("X"))
        with pytest.raises(AttributeError):
            SubsidyApplication.__str__(app)

    @pytest.mark.edge_case
    def test_str_subsidy_has_no_title_attribute_raises_attribute_error(self):
        app = SimpleNamespace(user=make_doc(owner_full_name="John").owner, subsidy=object())
        with pytest.raises(AttributeError):
            SubsidyApplication.__str__(app)
