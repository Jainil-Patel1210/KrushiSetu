import pytest
from django.test import RequestFactory

from loginSignup.models import User
from notifications.models import Notification
from notifications.views import MarkNotificationReadView


@pytest.mark.django_db
class TestMarkNotificationReadView:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = RequestFactory()

        self.user = User.objects.create_user(
            full_name="Tester",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123",
        )

    def make_request(self, pk):
        """
        Creates a Django HttpRequest and sets authentication attributes
        so DRF treats it as authenticated.
        """
        request = self.factory.patch(f"/notif/{pk}/")
        request.user = self.user
        request._force_auth_user = self.user
        return request

    def test_marks_notification_read(self):
        notif = Notification.objects.create(receiver=self.user, is_read=False)

        request = self.make_request(notif.id)
        response = MarkNotificationReadView.as_view()(request, pk=notif.id)

        notif.refresh_from_db()

        assert response.status_code == 200
        assert response.data == {"success": True}
        assert notif.is_read is True

    def test_notification_not_found(self):
        request = self.make_request(pk=999)
        response = MarkNotificationReadView.as_view()(request, pk=999)

        assert response.status_code == 404
        assert response.data == {"error": "Notification not found"}
