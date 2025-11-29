# test_early_get.py

import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status

from subsidy_provider.views import SubsidyApplicationsAPIView


pytestmark = pytest.mark.django_db


class TestSubsidyApplicationsAPIViewGet:

    @pytest.fixture
    def factory(self):
        return APIRequestFactory()

    @pytest.fixture
    def user(self, django_user_model):
        """Valid subsidy provider user"""
        return django_user_model.objects.create_user(
            full_name="Provider",
            mobile_number="+911234567890",
            email_address="provider@example.com",
            password="pass",
            role="subsidy_provider"
        )

    @pytest.fixture
    def other_user(self, django_user_model):
        """Another user who does NOT own the subsidy"""
        return django_user_model.objects.create_user(
            full_name="Other User",
            mobile_number="+911234567891",
            email_address="other@example.com",
            password="pass",
            role="subsidy_provider"
        )

    @pytest.fixture
    def view(self):
        return SubsidyApplicationsAPIView.as_view()

    # -------------------------------------------------------------------
    # SUCCESS CASE: Owner can see applications
    # -------------------------------------------------------------------
    def test_owner_can_get_applications(self, factory, user, view):

        subsidy_mock = MagicMock()
        subsidy_mock.created_by_id = user.id

        apps_qs = [MagicMock(), MagicMock()]

        with patch("subsidy_provider.views.get_object_or_404", return_value=subsidy_mock), \
             patch("subsidy_provider.views.SubsidyApplication.objects.filter") as filter_mock, \
             patch("subsidy_provider.views.SubsidyApplicationForProviderSerializer") as serializer_mock:

            filter_mock.return_value.order_by.return_value = apps_qs

            serializer_instance = MagicMock()
            serializer_instance.data = [{"id": 1}, {"id": 2}]
            serializer_mock.return_value = serializer_instance

            request = factory.get("/fake-url/")
            force_authenticate(request, user=user)

            response = view(request, pk=123)

            assert response.status_code == status.HTTP_200_OK
            assert response.data == [{"id": 1}, {"id": 2}]

    # -------------------------------------------------------------------
    # 403 CASE: Non-owner CANNOT access
    # -------------------------------------------------------------------
    def test_non_owner_gets_403(self, factory, user, other_user, view):
        subsidy_mock = MagicMock()
        subsidy_mock.created_by_id = other_user.id  # ownership mismatch

        with patch("subsidy_provider.views.get_object_or_404", return_value=subsidy_mock):

            request = factory.get("/fake-url/")
            force_authenticate(request, user=user)

            response = view(request, pk=123)

            assert response.status_code == status.HTTP_403_FORBIDDEN
            assert response.data == {
                "detail": "Forbidden - you are not the owner of this subsidy."
            }

    # -------------------------------------------------------------------
    # 404 CASE: Subsidy ID does not exist
    # -------------------------------------------------------------------
    def test_subsidy_not_found_returns_404(self, factory, user, view):
        from django.http import Http404

        with patch("subsidy_provider.views.get_object_or_404", side_effect=Http404):

            request = factory.get("/fake-url/")
            force_authenticate(request, user=user)

            response = view(request, pk=999)

            assert response.status_code == status.HTTP_404_NOT_FOUND
