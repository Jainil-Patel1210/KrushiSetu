# subsidy/test_early_views/test_early_officer_application_detail.py

import pytest
from unittest.mock import patch, MagicMock
from types import SimpleNamespace
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from subsidy.views import officer_application_detail
from subsidy.models import SubsidyApplication


class DummyUser:
    @property
    def is_authenticated(self):
        return True

    def __init__(self, role="user", pk=1):
        self.role = role
        self.id = pk
        self.pk = pk
        self.full_name = f"User {pk}"   # <-- FIXED


@pytest.fixture
def api_rf():
    return APIRequestFactory()


@pytest.fixture
def officer_user():
    return DummyUser(role="officer", pk=10)


@pytest.fixture
def non_officer_user():
    return DummyUser(role="user", pk=11)


@pytest.fixture
def application_obj(officer_user):
    app = MagicMock(spec=SubsidyApplication)
    app.id = 1
    app.application_id = "APP123"
    app.subsidy = SimpleNamespace(title="Mock Subsidy", amount=5000)
    app.assigned_officer = officer_user
    app.full_name = "John"
    app.email = "a@b.com"
    app.mobile = "99999"
    app.aadhaar = "1111"
    app.address = "address"
    app.state = "Gujarat"
    app.district = "A"
    app.taluka = "B"
    app.village = "C"
    app.land_area = 10
    app.land_unit = "Acres"
    app.soil_type = "Black"
    app.ownership = "Owned"
    app.bank_name = "SBI"
    app.account_number = "123"
    app.ifsc = "SBIN"
    app.status = "Pending"
    app.document_status = "Pending"
    app.officer_comment = None
    app.submitted_at = None
    app.reviewed_at = None

    docs = MagicMock()
    docs.all.return_value = []
    app.documents = docs

    return app


class TestOfficerApplicationDetail:

    def prepare_request(self, api_rf, user):
        req = api_rf.get("/fake-url/")
        force_authenticate(req, user=user)
        return req

    def test_officer_can_view_assigned_application(self, api_rf, officer_user, application_obj):
        req = self.prepare_request(api_rf, officer_user)

        with patch.object(SubsidyApplication.objects, "select_related") as mock_sel:
            step = MagicMock()
            mock_sel.return_value = step
            step.prefetch_related.return_value = step
            step.get.return_value = application_obj

            response = officer_application_detail(req, app_id=1)

        assert response.status_code == status.HTTP_200_OK

    def test_officer_cannot_view_if_not_assigned(self, api_rf, officer_user):
        req = self.prepare_request(api_rf, officer_user)

        with patch.object(SubsidyApplication.objects, "select_related") as mock_sel:
            step = MagicMock()
            mock_sel.return_value = step
            step.prefetch_related.return_value = step
            step.get.side_effect = SubsidyApplication.DoesNotExist

            response = officer_application_detail(req, app_id=1)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_non_officer_user_forbidden(self, api_rf, non_officer_user):
        req = self.prepare_request(api_rf, non_officer_user)

        response = officer_application_detail(req, app_id=1)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_application_not_found_returns_404(self, api_rf, officer_user):
        req = self.prepare_request(api_rf, officer_user)

        with patch.object(SubsidyApplication.objects, "select_related") as mock_sel:
            step = MagicMock()
            mock_sel.return_value = step
            step.prefetch_related.return_value = step
            step.get.side_effect = SubsidyApplication.DoesNotExist

            response = officer_application_detail(req, app_id=999)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_optional_fields_do_not_break_response(self, api_rf, officer_user, application_obj):
        application_obj.subsidy.title = None
        application_obj.subsidy.amount = None
        application_obj.officer_comment = None
        application_obj.reviewed_at = None

        req = self.prepare_request(api_rf, officer_user)

        with patch.object(SubsidyApplication.objects, "select_related") as mock_sel:
            step = MagicMock()
            mock_sel.return_value = step
            step.prefetch_related.return_value = step
            step.get.return_value = application_obj

            response = officer_application_detail(req, app_id=1)

        assert response.status_code == status.HTTP_200_OK
