# subsidy/test_early_utils/test_early_get_best_officer.py

import pytest
from django.contrib.auth import get_user_model
from subsidy.utils import get_best_officer
from subsidy.models import SubsidyApplication
from app.models import Subsidy as AppSubsidy

User = get_user_model()
pytestmark = pytest.mark.django_db


class TestGetBestOfficer:
    def make_officer(self, idx, role="officer"):
        """
        Helper: creates a user using CustomUserManager signature.
        """
        return User.objects.create_user(
            full_name=f"User {idx}",
            mobile_number=f"+91111111{1000 + idx}",
            email_address=f"user{idx}@example.com",
            password="pass123",
            role=role
        )

    def make_subsidy(self, title="Test Subsidy"):
        # Create a minimal subsidy; adjust if your app.Subsidy requires more fields.
        return AppSubsidy.objects.create(title=title, amount=1000)

    def assign_app(self, subsidy, assigned_officer, status="Pending", applicant_idx=None):
        """
        Create a SubsidyApplication row referencing a unique applicant user.
        Because SubsidyApplication has unique_together(user, subsidy), use
        a distinct applicant each time (unless caller supplies applicant).
        """
        if applicant_idx is None:
            # generate a fresh applicant index using python's id() as fallback uniqueness
            applicant_idx = id(object()) % 100000

        applicant = self.make_officer(applicant_idx, role="farmer")

        return SubsidyApplication.objects.create(
            user=applicant,
            subsidy=subsidy,
            full_name="Test",
            mobile="9999999999",
            email="a@b.com",
            aadhaar="111111111111",
            address="addr",
            state="S",
            district="D",
            taluka="T",
            village="V",
            land_area=1.0,
            land_unit="Acres",
            soil_type="Loam",
            ownership="Owned",
            bank_name="SBI",
            account_number="000",
            ifsc="IFSC000",
            assigned_officer=assigned_officer,
            status=status
        )

    def test_returns_officer_with_least_pending_applications(self):
        subsidy = self.make_subsidy()
        # Create two officers
        o1 = self.make_officer(1)
        o2 = self.make_officer(2)

        # o1 has 2 pending, o2 has 1 pending
        self.assign_app(subsidy, assigned_officer=o1, status="Pending", applicant_idx=101)
        self.assign_app(subsidy, assigned_officer=o1, status="Pending", applicant_idx=102)
        self.assign_app(subsidy, assigned_officer=o2, status="Pending", applicant_idx=103)

        best = get_best_officer()
        assert best.pk == o2.pk

    def test_returns_officer_with_least_total_when_pending_tied(self):
        subsidy = self.make_subsidy()
        o1 = self.make_officer(3)
        o2 = self.make_officer(4)

        # create distinct applicants per application (unique user per subsidy)
        self.assign_app(subsidy, assigned_officer=o1, status="Pending", applicant_idx=201)
        self.assign_app(subsidy, assigned_officer=o2, status="Pending", applicant_idx=202)
        # give o1 one more total application (non-pending)
        self.assign_app(subsidy, assigned_officer=o1, status="Approved", applicant_idx=203)

        best = get_best_officer()
        # o2 should be chosen because same pending_count but smaller total_count
        assert best.pk == o2.pk

    def test_returns_officer_with_no_applications(self):
        o1 = self.make_officer(5)
        o2 = self.make_officer(6)
        best = get_best_officer()
        assert best.pk in {o1.pk, o2.pk}

    def test_returns_first_officer_when_all_equal(self):
        o1 = self.make_officer(7)
        o2 = self.make_officer(8)
        subsidy = self.make_subsidy("S2")
        # distinct applicants for each application
        self.assign_app(subsidy, assigned_officer=o1, status="Approved", applicant_idx=301)
        self.assign_app(subsidy, assigned_officer=o2, status="Approved", applicant_idx=302)

        best = get_best_officer()
        assert best is not None

    def test_ignores_non_officer_users(self):
        non_officer = self.make_officer(13, role="farmer")
        officer = self.make_officer(14, role="officer")
        best = get_best_officer()
        assert best.role == "officer"

    def test_officer_with_only_non_pending_applications(self):
        subsidy = self.make_subsidy("S3")
        o1 = self.make_officer(15)
        self.assign_app(subsidy, assigned_officer=o1, status="Approved", applicant_idx=401)
        best = get_best_officer()
        assert best is not None

    def test_officer_with_no_assigned_subsidy_applications_relation(self):
        o = self.make_officer(17)
        best = get_best_officer()
        assert best is not None

    def test_case_sensitive_role_filtering(self):
        o_lower = self.make_officer(18, role="officer")
        o_upper = self.make_officer(19, role="Officer")  # different string
        best = get_best_officer()
        assert best.role == "officer"

    def test_multiple_officers_with_no_applications(self):
        o1 = self.make_officer(20)
        o2 = self.make_officer(21)
        o3 = self.make_officer(22)
        best = get_best_officer()
        assert best.pk in {o1.pk, o2.pk, o3.pk}
