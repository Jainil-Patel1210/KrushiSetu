# test_my_subsidies_get.py

import pytest
from unittest.mock import patch
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from subsidy_provider.views import MySubsidiesAPIView

User = get_user_model()

pytestmark = pytest.mark.django_db


def create_subsidy(user, title="Sub", amount=1000):
    """
    Helper to create a valid Subsidy with all required fields.
    """
    from app.models import Subsidy as AppSubsidy
    return AppSubsidy.objects.create(
        title=title,
        description="",
        amount=amount,
        eligibility=[],
        documents_required=[],
        application_start_date=None,
        application_end_date=None,
        created_by=user,
    )


class TestMySubsidiesAPIViewGet:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            full_name="Provider Test",
            mobile_number="+911111111111",
            email_address="provider@example.com",
            password="pass",
            role="subsidy_provider",
        )

    # -----------------------------------------------------------
    def test_returns_subsidies_for_authenticated_provider(self):
        # Create subsidies for this user
        create_subsidy(self.user, title="Sub1")
        create_subsidy(self.user, title="Sub2")

        # Create subsidy for another user
        other = User.objects.create_user(
            full_name="Other",
            mobile_number="+911111111112",
            email_address="other@example.com",
            password="pass",
            role="subsidy_provider",
        )
        create_subsidy(other, title="OtherSub")

        request = self.factory.get("/api/my-subsidies/")
        force_authenticate(request, user=self.user)

        with patch("subsidy_provider.views.SubsidySerializer") as MockSerializer:
            MockSerializer.return_value.data = [
                {"title": "Sub2"},
                {"title": "Sub1"},
            ]
            view = MySubsidiesAPIView.as_view()
            response = view(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == [{"title": "Sub2"}, {"title": "Sub1"}]

    # -----------------------------------------------------------
    def test_returns_empty_list_when_no_subsidies(self):
        request = self.factory.get("/api/my-subsidies/")
        force_authenticate(request, user=self.user)

        with patch("subsidy_provider.views.AppSubsidy.objects.filter") as mock_filter, \
             patch("subsidy_provider.views.SubsidySerializer") as MockSerializer:

            mock_filter.return_value.order_by.return_value = []
            MockSerializer.return_value.data = []

            view = MySubsidiesAPIView.as_view()
            response = view(request)

        assert response.status_code == status.HTTP_200_OK
        assert response.data == []

    # -----------------------------------------------------------
    def test_returns_401_for_unauthenticated_user(self):
        request = self.factory.get("/api/my-subsidies/")

        view = MySubsidiesAPIView.as_view()
        response = view(request)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    # -----------------------------------------------------------
    def test_serializer_context_includes_request(self):
        request = self.factory.get("/api/my-subsidies/")
        force_authenticate(request, user=self.user)

        with patch("subsidy_provider.views.AppSubsidy.objects.filter") as mock_filter, \
             patch("subsidy_provider.views.SubsidySerializer") as MockSerializer:

            mock_qs = mock_filter.return_value.order_by.return_value

            view = MySubsidiesAPIView()
            request.user = self.user  # FIXED
            view.request = request
            view.args = ()
            view.kwargs = {}

            view.get(request)

            MockSerializer.assert_called_once_with(
                mock_qs, many=True, context={"request": request}
            )

    # -----------------------------------------------------------
    def test_handles_large_number_of_subsidies(self):
        from app.models import Subsidy as AppSubsidy

        for i in range(100):
            create_subsidy(self.user, title=f"Sub{i}")

        request = self.factory.get("/api/my-subsidies/")
        force_authenticate(request, user=self.user)

        with patch("subsidy_provider.views.SubsidySerializer") as MockSerializer:
            MockSerializer.return_value.data = [
                {"title": f"Sub{i}"} for i in reversed(range(100))
            ]

            view = MySubsidiesAPIView.as_view()
            response = view(request)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 100
        assert response.data[0]["title"] == "Sub99"
