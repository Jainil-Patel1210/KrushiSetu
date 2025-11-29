# test_early_save.py
import pytest
from django.utils import timezone
from subsidy.models import SubsidyApplication, Document
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from unittest import mock

@pytest.mark.django_db
class TestSubsidyApplicationSave:
    """
    Unit tests for the save method of SubsidyApplication model.
    """

    @pytest.fixture
    def user(self, django_user_model):
        # Create a user for use in tests using the custom manager signature
        return django_user_model.objects.create_user(
            full_name='testuser',
            mobile_number='+911000000001',
            email_address='testuser@example.com',
            password='pass',
            role='farmer'
        )

    @pytest.fixture
    def officer(self, django_user_model):
        # Create an officer user for assignment
        return django_user_model.objects.create_user(
            full_name='officer',
            mobile_number='+911000000002',
            email_address='officer@example.com',
            password='pass',
            role='officer'
        )

    @pytest.fixture
    def subsidy(self, db):
        # Minimal stub for the related Subsidy model
        from django.apps import apps
        Subsidy = apps.get_model('app', 'Subsidy')
        # adapt to your Subsidy model fields: here I use title/name or similar — adjust if needed
        # Try both field names for safety — prefer `title`, fallback to `name`.
        try:
            return Subsidy.objects.create(title='Test Subsidy', amount=1000)
        except Exception:
            return Subsidy.objects.create(name='Test Subsidy')

    @pytest.fixture
    def document(self, user):
        # Create a Document instance
        return Document.objects.create(
            owner=user,
            document_type='ID Proof'
        )

    @pytest.fixture
    def valid_application_data(self, user, subsidy):
        # Provide all required fields for a valid SubsidyApplication
        return {
            'user': user,
            'subsidy': subsidy,
            'full_name': 'John Doe',
            'mobile': '1234567890',
            'email': 'john@example.com',
            'aadhaar': '123412341234',
            'address': '123 Main St',
            'state': 'StateX',
            'district': 'DistrictY',
            'taluka': 'TalukaZ',
            'village': 'VillageA',
            'land_area': 1.5,
            'land_unit': 'Acre',
            'soil_type': 'Loamy',
            'ownership': 'Owned',
            'bank_name': 'BankX',
            'account_number': '000111222333',
            'ifsc': 'BANK0001',
        }

    # ------------------- Happy Path Tests -------------------

    @pytest.mark.happy_path
    def test_save_assigns_ulid_on_create(self, valid_application_data):
        """
        Test that save() assigns a ULID to application_id when creating a new instance.
        """
        app = SubsidyApplication(**valid_application_data)
        assert not app.application_id  # Should be empty before save
        app.save()
        assert app.application_id is not None
        assert len(app.application_id) == 26  # ULID length

    @pytest.mark.happy_path
    def test_save_does_not_overwrite_existing_application_id(self, valid_application_data):
        """
        Test that save() does not overwrite application_id if already set.
        """
        valid_application_data['application_id'] = '01H7Y6KQJ8ZQK7V6QK7Y6KQJ8Z'
        app = SubsidyApplication(**valid_application_data)
        app.save()
        assert app.application_id == '01H7Y6KQJ8ZQK7V6QK7Y6KQJ8Z'

    @pytest.mark.happy_path
    def test_save_on_update_does_not_change_application_id(self, valid_application_data):
        """
        Test that updating an existing instance does not change application_id.
        """
        app = SubsidyApplication(**valid_application_data)
        app.save()
        original_id = app.application_id
        app.full_name = "Jane Doe"
        app.save()
        app.refresh_from_db()
        assert app.application_id == original_id

    @pytest.mark.happy_path
    def test_save_with_documents_m2m(self, valid_application_data, document):
        """
        Test that documents can be added to the application and saved.
        """
        app = SubsidyApplication(**valid_application_data)
        app.save()
        app.documents.add(document)
        assert app.documents.count() == 1
        assert app.documents.first() == document

    @pytest.mark.happy_path
    def test_save_with_assigned_officer(self, valid_application_data, officer):
        """
        Test that assigned_officer can be set and saved.
        """
        valid_application_data['assigned_officer'] = officer
        app = SubsidyApplication(**valid_application_data)
        app.save()
        assert app.assigned_officer == officer

    # ------------------- Edge Case Tests -------------------

    @pytest.mark.edge_case
    def test_save_with_blank_optional_fields(self, valid_application_data):
        """
        Test that save() works when optional fields are left blank or null.
        """
        valid_application_data['officer_comment'] = ''
        valid_application_data['reviewed_at'] = None
        valid_application_data['status'] = None
        app = SubsidyApplication(**valid_application_data)
        app.save()
        assert app.officer_comment == ''
        assert app.reviewed_at is None
        assert app.status is None

    @pytest.mark.edge_case
    def test_save_with_long_strings(self, valid_application_data):
        """
        Test that save() works with maximum allowed string lengths.
        """
        valid_application_data['full_name'] = 'A' * 255
        valid_application_data['email'] = 'a' * 247 + '@x.com'  # 255 chars
        valid_application_data['mobile'] = '9' * 20
        valid_application_data['aadhaar'] = '1' * 20
        valid_application_data['state'] = 'S' * 100
        valid_application_data['district'] = 'D' * 100
        valid_application_data['taluka'] = 'T' * 100
        valid_application_data['village'] = 'V' * 100
        valid_application_data['land_unit'] = 'U' * 50
        valid_application_data['soil_type'] = 'S' * 50
        valid_application_data['ownership'] = 'O' * 50
        valid_application_data['bank_name'] = 'B' * 255
        valid_application_data['account_number'] = '1' * 50
        valid_application_data['ifsc'] = 'I' * 20
        app = SubsidyApplication(**valid_application_data)
        app.save()
        assert app.full_name == 'A' * 255
        assert app.email.endswith('@x.com')
        assert app.mobile == '9' * 20

    @pytest.mark.edge_case
    def test_save_with_zero_and_negative_land_area(self, valid_application_data, django_user_model, db):
        """
        Test that save() works with zero and negative land_area (if allowed).
        Avoids UNIQUE constraint by using a different user and a different subsidy for the second insert.
        """
        # First application: zero land_area
        valid_application_data['land_area'] = 0.0
        app = SubsidyApplication(**valid_application_data)
        app.save()
        assert app.land_area == 0.0

        # Second application: negative land_area — use a different user and different subsidy to avoid unique_together conflict
        user2 = django_user_model.objects.create_user(
            full_name='testuser2',
            mobile_number='+911000000003',
            email_address='testuser2@example.com',
            password='pass',
            role='farmer'
        )

        # create a fresh subsidy model instance to ensure (user2, subsidy2) is different
        from django.apps import apps
        Subsidy = apps.get_model('app', 'Subsidy')
        try:
            subsidy2 = Subsidy.objects.create(title='Test Subsidy 2', amount=2000)
        except Exception:
            subsidy2 = Subsidy.objects.create(name='Test Subsidy 2')

        # Build a fresh data dict for the second application so we don't mutate the original
        valid_application_data2 = {
            'user': user2,
            'subsidy': subsidy2,
            'full_name': valid_application_data['full_name'],
            'mobile': valid_application_data['mobile'],
            'email': valid_application_data['email'],
            'aadhaar': valid_application_data['aadhaar'],
            'address': valid_application_data['address'],
            'state': valid_application_data['state'],
            'district': valid_application_data['district'],
            'taluka': valid_application_data['taluka'],
            'village': valid_application_data['village'],
            'land_area': -5.0,
            'land_unit': valid_application_data['land_unit'],
            'soil_type': valid_application_data['soil_type'],
            'ownership': valid_application_data['ownership'],
            'bank_name': valid_application_data['bank_name'],
            'account_number': valid_application_data['account_number'],
            'ifsc': valid_application_data['ifsc'],
        }

        app2 = SubsidyApplication(**valid_application_data2)
        app2.save()
        assert app2.land_area == -5.0

    @pytest.mark.edge_case
    def test_save_raises_integrity_error_on_duplicate_user_subsidy(self, valid_application_data):
        """
        Test that unique_together constraint on (user, subsidy) is enforced.
        """
        app1 = SubsidyApplication(**valid_application_data)
        app1.save()
        app2 = SubsidyApplication(**valid_application_data)
        with pytest.raises(IntegrityError):
            app2.save()

    @pytest.mark.edge_case
    def test_save_raises_integrity_error_on_duplicate_application_id(self, valid_application_data):
        """
        Test that unique constraint on application_id is enforced.
        """
        valid_application_data['application_id'] = '01H7Y6KQJ8ZQK7V6QK7Y6KQJ8Z'
        app1 = SubsidyApplication(**valid_application_data)
        app1.save()
        # Change user to avoid unique_together, but keep same application_id
        User = get_user_model()
        user2 = User.objects.create_user(
            full_name='user2',
            mobile_number='+911000000004',
            email_address='user2@example.com',
            password='pass',
            role='farmer'
        )
        valid_application_data['user'] = user2
        app2 = SubsidyApplication(**valid_application_data)
        with pytest.raises(IntegrityError):
            app2.save()

    @pytest.mark.edge_case
    def test_save_ulid_generation_failure(self, valid_application_data, monkeypatch):
        """
        Test that save() raises if ulid.new() fails (simulate exception).
        """
        with mock.patch('subsidy.models.ulid.new', side_effect=Exception("ULID error")):
            app = SubsidyApplication(**valid_application_data)
            with pytest.raises(Exception, match="ULID error"):
                app.save()
