# test_early_assign_officer.py

import pytest
import uuid
from django.apps import apps
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from subsidy.views import assign_officer
from subsidy.models import SubsidyApplication

User = get_user_model()


def unique_suffix():
    return uuid.uuid4().hex[:8]


# -------------------------- USER FACTORY --------------------------

def make_user(prefix="user", role="user"):
    """
    Works with your actual CustomUser:
    required fields: full_name, mobile_number, email_address, aadhaar_number, role
    """
    suf = unique_suffix()

    u = User.objects.create_user(
        full_name=f"{prefix} {suf}",
        mobile_number=f"+91{suf[:10]}",
        email_address=f"{prefix}{suf}@mail.com",
        aadhaar_number=f"9999{suf[:8]}",
        password="pass",
    )

    if hasattr(u, "role"):
        u.role = role
        u.save()

    return u


# ----------------------- SUBSIDY APPLICATION FACTORY ------------------------

def create_application(user, status="Submitted", **overrides):
    Subsidy = apps.get_model("app", "Subsidy")

    subsidy = Subsidy.objects.create(
        title="Test Subsidy",
        description="Demo subsidy",
        amount=1000.0,
        eligibility="[]",
        documents_required="[]",
        application_start_date="2024-01-01",
        application_end_date="2025-01-01",
        created_by=user,
        rating=5.0,
    )

    base = {
        "user": user,
        "subsidy": subsidy,
        "status": status,
        "document_status": "Pending",
        "full_name": user.full_name,
        "mobile": user.mobile_number,
        "email": user.email_address,
        "aadhaar": "123412341234",
        "address": "Test Address",
        "state": "Test State",
        "district": "Test District",
        "taluka": "Test Taluka",
        "village": "Test Village",
        "land_area": 1.0,
        "land_unit": "Acre",
        "soil_type": "Clay",
        "ownership": "Owned",
        "bank_name": "Test Bank",
        "account_number": "111122223333",
        "ifsc": "TEST0001234",
    }

    base.update(overrides)
    return SubsidyApplication.objects.create(**base)



# ------------------------------- TESTS -------------------------------------

@pytest.mark.usefixtures("django_db_setup", "django_db_blocker")
class TestAssignOfficer:

    @pytest.fixture(autouse=True)
    def setup(self, db):
        self.admin_user = make_user("admin", role="admin")
        self.officer_user = make_user("officer", role="officer")
        self.regular_user = make_user("farmer", role="user")
        self.factory = APIRequestFactory()

    # ---------------- HAPPY PATH ----------------

    def test_assign_officer_success(self):
        app = create_application(self.regular_user)

        data = {"officer_id": self.officer_user.id}
        req = self.factory.post("/fake/", data, format="json")
        force_authenticate(req, user=self.admin_user)

        res = assign_officer(req, app.id)

        assert res.status_code == 200
        assert res.data["message"] == "Officer assigned successfully"

        app.refresh_from_db()
        assert app.assigned_officer == self.officer_user
        assert app.status == "Under Review"

    # ---------------- EDGE CASES ----------------

    def test_non_admin_cannot_assign(self):
        app = create_application(self.regular_user)

        data = {"officer_id": self.officer_user.id}
        req = self.factory.post("/fake/", data, format="json")
        force_authenticate(req, user=self.regular_user)

        res = assign_officer(req, app.id)

        assert res.status_code == 403
        assert res.data["detail"] == "Not allowed"

    def test_application_not_found(self):
        req = self.factory.post("/fake/", {"officer_id": self.officer_user.id}, format="json")
        force_authenticate(req, user=self.admin_user)

        res = assign_officer(req, 99999)

        assert res.status_code == 404
        assert res.data["detail"] == "Application not found"

    def test_invalid_officer_id(self):
        app = create_application(self.regular_user)

        req = self.factory.post("/fake/", {"officer_id": 99999}, format="json")
        force_authenticate(req, user=self.admin_user)

        res = assign_officer(req, app.id)

        assert res.status_code == 400
        assert res.data["detail"] == "Invalid officer"

    def test_officer_id_belongs_to_non_officer(self):
        app = create_application(self.regular_user)

        req = self.factory.post("/fake/", {"officer_id": self.regular_user.id}, format="json")
        force_authenticate(req, user=self.admin_user)

        res = assign_officer(req, app.id)

        assert res.status_code == 400
        assert res.data["detail"] == "Invalid officer"

    def test_missing_officer_id(self):
        app = create_application(self.regular_user)

        req = self.factory.post("/fake/", {}, format="json")
        force_authenticate(req, user=self.admin_user)

        res = assign_officer(req, app.id)

        assert res.status_code == 400
        assert res.data["detail"] == "Invalid officer"

    def test_officer_id_is_none(self):
        app = create_application(self.regular_user)

        req = self.factory.post("/fake/", {"officer_id": None}, format="json")
        force_authenticate(req, user=self.admin_user)

        res = assign_officer(req, app.id)

        assert res.status_code == 400
        assert res.data["detail"] == "Invalid officer"
