import pytest
from unittest.mock import MagicMock
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from django.utils import timezone
from subsidy.views import review_application


pytestmark = pytest.mark.django_db


class TestReviewApplication:

    @pytest.fixture(autouse=True)
    def setup(self, django_user_model):
        """
        Create valid users using your custom user model.
        """
        self.factory = APIRequestFactory()

        self.officer = django_user_model.objects.create_user(
            full_name="Officer One",
            mobile_number="+911234567890",
            email_address="officer@test.com",
            password="pass",
            role="officer"
        )

        self.other_user = django_user_model.objects.create_user(
            full_name="Not Officer",
            mobile_number="+911111111111",
            email_address="user@test.com",
            password="pass",
            role="farmer"
        )

    # -----------------------------------------
    # HAPPY PATH
    # -----------------------------------------

    def test_officer_can_review_assigned_application(self, mocker):

        mock_app = MagicMock()
        mock_app.status = "approved"
        mock_app.reviewed_at = None

        mocker.patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=mock_app
        )

        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mocker.patch(
            "subsidy.views.OfficerReviewSerializer",
            return_value=mock_serializer
        )

        now = timezone.now()
        mocker.patch("subsidy.views.timezone.now", return_value=now)

        request = self.factory.post("/fake", {"status": "approved"}, format="json")
        force_authenticate(request, self.officer)

        response = review_application(request, 1)

        assert response.status_code == 200
        assert response.data["message"] == "Application updated"
        assert response.data["status"] == "approved"
        assert mock_app.reviewed_at == now
        assert mock_app.save.called

    # -----------------------------------------
    # PARTIAL UPDATE
    # -----------------------------------------

    def test_officer_can_partial_update(self, mocker):

        mock_app = MagicMock()
        mock_app.status = "pending"

        mocker.patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=mock_app
        )

        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = True
        mocker.patch(
            "subsidy.views.OfficerReviewSerializer",
            return_value=mock_serializer
        )

        request = self.factory.post("/fake", {}, format="json")
        force_authenticate(request, self.officer)

        response = review_application(request, 2)

        assert response.status_code == 200
        assert "message" in response.data

    # -----------------------------------------
    # INVALID SERIALIZER
    # -----------------------------------------

    def test_serializer_invalid_returns_400(self, mocker):

        mocker.patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=MagicMock()
        )

        mock_serializer = MagicMock()
        mock_serializer.is_valid.return_value = False
        mock_serializer.errors = {"status": ["Invalid value"]}

        mocker.patch(
            "subsidy.views.OfficerReviewSerializer",
            return_value=mock_serializer
        )

        request = self.factory.post("/fake", {"status": "wrong"}, format="json")
        force_authenticate(request, self.officer)

        response = review_application(request, 3)

        assert response.status_code == 400
        assert "status" in response.data

    # -----------------------------------------
    # NON-OFFICER USER → 403
    # -----------------------------------------

    def test_non_officer_user_forbidden(self):

        request = self.factory.post("/fake", {"status": "approved"}, format="json")
        force_authenticate(request, self.other_user)

        response = review_application(request, 4)

        assert response.status_code == 403
        assert response.data["detail"] == "Not allowed"

    # -----------------------------------------
    # DOES NOT EXIST → 404
    # -----------------------------------------

    def test_application_not_found(self, mocker):

        mocker.patch(
            "subsidy.views.SubsidyApplication.objects.get",
            side_effect=mocker.patch(
                "subsidy.views.SubsidyApplication.DoesNotExist",
                new=type("DoesNotExist", (Exception,), {})
            )
        )

        request = self.factory.post("/fake", {"status": "approved"}, format="json")
        force_authenticate(request, self.officer)

        response = review_application(request, 5)

        assert response.status_code == 404
        assert response.data["detail"] == "Not found or not assigned to you"

    # -----------------------------------------
    # SERIALIZER EXCEPTION → raised
    # -----------------------------------------

    def test_serializer_raises_exception(self, mocker):

        mocker.patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=MagicMock()
        )

        mock_serializer = MagicMock()
        mock_serializer.is_valid.side_effect = Exception("Serializer error")

        mocker.patch(
            "subsidy.views.OfficerReviewSerializer",
            return_value=mock_serializer
        )

        request = self.factory.post("/fake", {"status": "approved"}, format="json")
        force_authenticate(request, self.officer)

        with pytest.raises(Exception) as exc:
            review_application(request, 6)

        assert "Serializer error" in str(exc.value)
