import pytest
from unittest.mock import MagicMock, patch
from rest_framework.test import APIRequestFactory, force_authenticate
from django.utils import timezone

from subsidy.views import review_application
from subsidy.models import SubsidyApplication

pytestmark = pytest.mark.django_db


class TestReviewApplication:

    @pytest.fixture(autouse=True)
    def setup(self, django_user_model):
        """Create officer + normal user."""
        self.factory = APIRequestFactory()

        self.officer = django_user_model.objects.create_user(
            full_name="Officer One",
            mobile_number="+911234567890",
            email_address="officer@test.com",
            password="pass",
            role="officer",
        )

        self.other_user = django_user_model.objects.create_user(
            full_name="Other User",
            mobile_number="+919999999999",
            email_address="other@test.com",
            password="pass",
            role="farmer",
        )

    # ----------------------------------------
    # HAPPY PATH
    # ----------------------------------------

    def test_officer_can_review_assigned_application(self):
        mock_app = MagicMock()
        mock_app.status = "approved"
        mock_app.reviewed_at = None

        now = timezone.now()

        with patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=mock_app,
        ), patch(
            "subsidy.views.OfficerReviewSerializer"
        ) as MockSerializer, patch(
            "subsidy.views.timezone.now",
            return_value=now,
        ):
            serializer_instance = MockSerializer.return_value
            serializer_instance.is_valid.return_value = True
            serializer_instance.save.return_value = None

            request = self.factory.post(
                "/fake", {"status": "approved"}, format="json"
            )
            force_authenticate(request, self.officer)

            # direct call to the decorated view
            response = review_application(request, 1)

        assert response.status_code == 200
        assert response.data["message"] == "Application updated"
        assert response.data["status"] == "approved"
        assert mock_app.reviewed_at == now
        assert mock_app.save.called

    # ----------------------------------------
    # PARTIAL UPDATE
    # ----------------------------------------

    def test_officer_can_partial_update(self):
        mock_app = MagicMock()
        mock_app.status = "pending"

        with patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=mock_app,
        ), patch(
            "subsidy.views.OfficerReviewSerializer"
        ) as MockSerializer:
            serializer_instance = MockSerializer.return_value
            serializer_instance.is_valid.return_value = True
            serializer_instance.save.return_value = None

            request = self.factory.post("/fake", {}, format="json")
            force_authenticate(request, self.officer)

            response = review_application(request, 2)

        assert response.status_code == 200
        assert response.data["message"] == "Application updated"

    # ----------------------------------------
    # INVALID SERIALIZER
    # ----------------------------------------

    def test_serializer_invalid_returns_400(self):
        with patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=MagicMock(),
        ), patch(
            "subsidy.views.OfficerReviewSerializer"
        ) as MockSerializer:
            serializer_instance = MockSerializer.return_value
            serializer_instance.is_valid.return_value = False
            serializer_instance.errors = {"status": ["Invalid"]}

            request = self.factory.post(
                "/fake", {"status": "wrong"}, format="json"
            )
            force_authenticate(request, self.officer)

            response = review_application(request, 3)

        assert response.status_code == 400
        assert response.data == {"status": ["Invalid"]}

    # ----------------------------------------
    # NOT OFFICER -> 403
    # ----------------------------------------

    def test_non_officer_user_forbidden(self):
        request = self.factory.post(
            "/fake", {"status": "approved"}, format="json"
        )
        force_authenticate(request, self.other_user)

        response = review_application(request, 4)

        assert response.status_code == 403
        assert response.data["detail"] == "Not allowed"

    # ----------------------------------------
    # 404
    # ----------------------------------------

    def test_application_not_found(self):
        with patch(
            "subsidy.views.SubsidyApplication.objects.get",
            side_effect=SubsidyApplication.DoesNotExist,
        ):
            request = self.factory.post(
                "/fake", {"status": "approved"}, format="json"
            )
            force_authenticate(request, self.officer)

            response = review_application(request, 5)

        assert response.status_code == 404
        assert response.data["detail"] == "Not found or not assigned to you"

    # ----------------------------------------
    # SERIALIZER EXCEPTION → error
    # ----------------------------------------

    def test_serializer_raises_exception(self):
        with patch(
            "subsidy.views.SubsidyApplication.objects.get",
            return_value=MagicMock(),
        ), patch(
            "subsidy.views.OfficerReviewSerializer"
        ) as MockSerializer:
            serializer_instance = MockSerializer.return_value
            serializer_instance.is_valid.side_effect = Exception(
                "Serializer error"
            )

            request = self.factory.post(
                "/fake", {"status": "approved"}, format="json"
            )
            force_authenticate(request, self.officer)

            with pytest.raises(Exception) as exc:
                review_application(request, 6)

        assert "Serializer error" in str(exc.value)
