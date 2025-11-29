import pytest
from unittest.mock import patch, MagicMock
from subsidy.serializers import SubsidyApplicationSerializer


# ---------------- FIXTURES ----------------

@pytest.fixture
def fake_user():
    user = MagicMock()
    user.id = 1
    return user


@pytest.fixture
def fake_request(fake_user):
    req = MagicMock()
    req.user = fake_user
    return req


@pytest.fixture
def serializer_context(fake_request):
    return {"request": fake_request}


@pytest.fixture
def validated_data_base():
    return {
        'subsidy': MagicMock(),
        'full_name': 'Test User',
        'mobile': '1234567890',
        'email': 'test@example.com',
        'aadhaar': '123412341234',
        'address': 'Test Address',
        'state': 'Test State',
        'district': 'Test District',
        'taluka': 'Test Taluka',
        'village': 'Test Village',
        'land_area': 1.5,
        'land_unit': 'acre',
        'soil_type': 'clay',
        'ownership': 'owned',
        'bank_name': 'Test Bank',
        'account_number': '123456789',
        'ifsc': 'TEST0001',
    }


@pytest.fixture
def serializer(serializer_context):
    return SubsidyApplicationSerializer(context=serializer_context)


@pytest.fixture
def mock_subsidy_app_model():
    with patch("subsidy.serializers.SubsidyApplication") as mock_model:
        instance = MagicMock()
        instance.documents = MagicMock()
        instance.save = MagicMock()

        # default values
        instance.assigned_officer = None
        instance.status = None

        mock_model.objects.create.return_value = instance
        yield mock_model, instance


@pytest.fixture
def mock_document_model():
    with patch("subsidy.serializers.Document") as mock_doc:
        mock_doc.objects.filter.return_value = [MagicMock(), MagicMock()]
        yield mock_doc


# ---------------- HAPPY TESTS ----------------

@pytest.mark.happy
def test_create_with_documents_and_officer(
    serializer, validated_data_base, mock_subsidy_app_model, mock_document_model, fake_user
):
    mock_model, instance = mock_subsidy_app_model
    validated = dict(validated_data_base)
    validated["document_ids"] = [1, 2]

    with patch("subsidy.serializers.get_best_officer", return_value=MagicMock()) as best:
        result = serializer.create(validated)

    assert mock_model.objects.create.called
    mock_document_model.objects.filter.assert_called_once_with(id__in=[1, 2], owner=fake_user)
    assert instance.documents.set.called
    assert instance.assigned_officer == best.return_value
    assert instance.status == "Under Review"
    assert result == instance


@pytest.mark.happy
def test_create_without_documents_but_with_officer(
    serializer, validated_data_base, mock_subsidy_app_model
):
    mock_model, instance = mock_subsidy_app_model
    validated = dict(validated_data_base)

    with patch("subsidy.serializers.get_best_officer", return_value=MagicMock()) as best:
        result = serializer.create(validated)

    assert not instance.documents.set.called
    assert instance.assigned_officer == best.return_value
    assert instance.status == "Under Review"
    assert result == instance


@pytest.mark.happy
def test_create_with_empty_docs_but_with_officer(
    serializer, validated_data_base, mock_subsidy_app_model
):
    mock_model, instance = mock_subsidy_app_model
    validated = dict(validated_data_base)
    validated["document_ids"] = []

    with patch("subsidy.serializers.get_best_officer", return_value=MagicMock()) as best:
        result = serializer.create(validated)

    assert not instance.documents.set.called
    assert instance.assigned_officer == best.return_value
    assert instance.status == "Under Review"
    assert result == instance


@pytest.mark.happy
def test_create_with_docs_but_no_officer(
    serializer, validated_data_base, mock_subsidy_app_model, mock_document_model
):
    mock_model, instance = mock_subsidy_app_model
    validated = dict(validated_data_base)
    validated["document_ids"] = [1, 2]

    with patch("subsidy.serializers.get_best_officer", return_value=None):
        result = serializer.create(validated)

    assert instance.documents.set.called
    assert instance.assigned_officer is None
    assert instance.status == "Pending"
    assert result == instance


# ---------------- EDGE TESTS ----------------

@pytest.mark.edge
def test_create_without_user_in_context(validated_data_base, mock_subsidy_app_model):
    """
    Context has request but request.user is None → serializer should pass user=None
    into SubsidyApplication.objects.create.
    """
    mock_model, instance = mock_subsidy_app_model
    serializer = SubsidyApplicationSerializer(context={"request": MagicMock(user=None)})
    validated = dict(validated_data_base)

    # Avoid DB access from get_best_officer
    with patch("subsidy.serializers.get_best_officer", return_value=None):
        result = serializer.create(validated)

    assert mock_model.objects.create.call_args[1]["user"] is None
    assert result == instance


@pytest.mark.edge
def test_create_without_request_in_context(validated_data_base, mock_subsidy_app_model):
    """
    Context has no 'request' key at all → your serializer does `self.context['request']`
    so this should raise KeyError.
    """
    serializer = SubsidyApplicationSerializer(context={})
    validated = dict(validated_data_base)

    # KeyError is raised before get_best_officer is called
    with pytest.raises(KeyError):
        serializer.create(validated)


@pytest.mark.edge
def test_create_no_docs_no_officer(serializer, validated_data_base, mock_subsidy_app_model):
    mock_model, instance = mock_subsidy_app_model
    validated = dict(validated_data_base)

    with patch("subsidy.serializers.get_best_officer", return_value=None):
        result = serializer.create(validated)

    assert not instance.documents.set.called
    assert instance.assigned_officer is None
    assert instance.status == "Pending"
    assert result == instance


@pytest.mark.edge
def test_create_invalid_document_ids(serializer, validated_data_base, mock_subsidy_app_model):
    """
    document_ids=None → falsy → no Document.objects.filter, no documents.set.
    """
    mock_model, instance = mock_subsidy_app_model
    validated = dict(validated_data_base)
    validated["document_ids"] = None

    # Patch to avoid DB calls inside get_best_officer
    with patch("subsidy.serializers.get_best_officer", return_value=None):
        result = serializer.create(validated)

    assert not instance.documents.set.called
    assert result == instance


@pytest.mark.edge
def test_create_with_extra_fields(
    serializer, validated_data_base, mock_subsidy_app_model, mock_document_model
):
    mock_model, instance = mock_subsidy_app_model
    validated = dict(validated_data_base)
    validated["document_ids"] = [1]
    validated["extra_field"] = "should be ignored"

    with patch("subsidy.serializers.get_best_officer", return_value=None):
        result = serializer.create(validated)

    create_kwargs = mock_model.objects.create.call_args[1]
    # Your current serializer happily forwards extra_field to .objects.create
    assert "extra_field" in create_kwargs
    assert result == instance
