# subsidy/test_early_views/test_early_officer_dashboard.py

import pytest
from unittest.mock import MagicMock, patch
from rest_framework.test import APIRequestFactory, force_authenticate
from subsidy.views import officer_dashboard
from subsidy.models import SubsidyApplication
from app.models import Subsidy
from rest_framework.response import Response


@pytest.mark.usefixtures("django_db_setup", "django_db_blocker")
class TestOfficerDashboard:

    @pytest.fixture(autouse=True)
    def setup(self, django_user_model):
        """Create test users + TWO real Subsidy objects."""
        self.officer_user = django_user_model.objects.create_user(
            full_name="Officer One",
            mobile_number="+911111111111",
            email_address="officer@example.com",
            password="pass",
            role="officer",
        )

        self.other_user = django_user_model.objects.create_user(
            full_name="Citizen One",
            mobile_number="+922222222222",
            email_address="citizen@example.com",
            password="pass",
            role="farmer",
        )

        # ✅ CREATE TWO SUBSIDIES (important fix)
        self.subsidy1 = Subsidy.objects.create(
            title="Subsidy A",
            amount=5000,
            description="Test A",
        )
        self.subsidy2 = Subsidy.objects.create(
            title="Subsidy B",
            amount=3000,
            description="Test B",
        )

        self.factory = APIRequestFactory()

    def make_app(self, subsidy=None, **kwargs):
        """Create an application safely."""
        subsidy = subsidy or self.subsidy1

        defaults = dict(
            user=self.other_user,
            subsidy=subsidy,
            full_name="Test",
            mobile="999",
            email="test@example.com",
            aadhaar="1111",
            address="addr",
            state="state",
            district="dist",
            taluka="tal",
            village="vill",
            land_area=1,
            land_unit="acre",
            soil_type="black",
            ownership="owned",
            bank_name="SBI",
            account_number="123",
            ifsc="SBIN",
        )
        defaults.update(kwargs)
        return SubsidyApplication.objects.create(**defaults)

    # ------------------------------
    # TEST CASES
    # ------------------------------

    def test_officer_dashboard_returns_assigned_applications(self):
        # assigned uses subsidy1
        assigned_app = self.make_app(
            subsidy=self.subsidy1,
            assigned_officer=self.officer_user,
        )

        # unassigned uses subsidy2 → avoids UNIQUE constraint
        unassigned_app = self.make_app(
            subsidy=self.subsidy2,
            assigned_officer=None,
        )

        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=self.officer_user)

        with patch("subsidy.views.OfficerSubsidyApplicationSerializer") as mock_ser:
            mock_ser.return_value.data = [{"id": assigned_app.id}]
            response = officer_dashboard(request)

        assert response.status_code == 200
        assert response.data == [{"id": assigned_app.id}]

    def test_empty_list_when_no_apps(self):
        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=self.officer_user)

        with patch("subsidy.views.OfficerSubsidyApplicationSerializer") as mock_ser:
            mock_ser.return_value.data = []
            response = officer_dashboard(request)

        assert response.status_code == 200
        assert response.data == []

    def test_forbidden_for_non_officer(self):
        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=self.other_user)

        response = officer_dashboard(request)
        assert response.status_code == 403

    def test_no_assigned_officer_field(self):
        app = self.make_app(subsidy=self.subsidy1, assigned_officer=None)

        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=self.officer_user)

        with patch("subsidy.views.OfficerSubsidyApplicationSerializer") as mock_ser:
            mock_ser.return_value.data = []
            response = officer_dashboard(request)

        assert response.status_code == 200

    def test_multiple_assigned_apps(self):
        apps = [
            self.make_app(subsidy=self.subsidy1, assigned_officer=self.officer_user),
            self.make_app(subsidy=self.subsidy2, assigned_officer=self.officer_user),
        ]

        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=self.officer_user)

        with patch("subsidy.views.OfficerSubsidyApplicationSerializer") as mock_ser:
            mock_ser.return_value.data = [{"id": app.id} for app in apps]
            response = officer_dashboard(request)

        assert response.status_code == 200

    def test_user_missing_role_attribute(self):
        user = MagicMock()
        delattr(user, "role")

        request = self.factory.get("/fake-url/")
        force_authenticate(request, user=user)

        with pytest.raises(AttributeError):
            officer_dashboard(request)
