import pytest
from django.test import RequestFactory
from notifications.models import NotificationPreference
from notifications.views import NotificationPreferenceView
from loginSignup.models import User


@pytest.mark.django_db
class TestNotificationPreferenceView:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123"
        )

    def authenticate(self, request):
        """
        Important:
        DRF authentication requires setting both .user and ._force_auth_user
        for RequestFactory-made Django HttpRequest objects.
        """
        request.user = self.user
        request._force_auth_user = self.user
        return request

    def test_get_creates_preference(self):
        request = self.factory.get("/prefs/")
        request = self.authenticate(request)

        response = NotificationPreferenceView.as_view()(request)

        assert response.status_code == 200
        assert "notify_general" in response.data
        assert NotificationPreference.objects.filter(user=self.user).exists()

    def test_patch_updates_preference(self):
        NotificationPreference.objects.create(user=self.user, notify_general=False)

        request = self.factory.patch(
            "/prefs/",
            {"notify_general": True},
            content_type="application/json"
        )
        request = self.authenticate(request)

        response = NotificationPreferenceView.as_view()(request)

        assert response.status_code == 200
        assert response.data["notify_general"] is True

        pref = NotificationPreference.objects.get(user=self.user)
        assert pref.notify_general is True

    def test_patch_missing_value_does_not_change(self):
        pref = NotificationPreference.objects.create(user=self.user, notify_general=False)

        request = self.factory.patch("/prefs/", {}, content_type="application/json")
        request = self.authenticate(request)

        response = NotificationPreferenceView.as_view()(request)

        assert response.status_code == 200
        assert response.data["notify_general"] is False  # unchanged
