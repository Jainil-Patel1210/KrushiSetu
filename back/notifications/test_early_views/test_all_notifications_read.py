import pytest
from django.test import RequestFactory

from loginSignup.models import User
from notifications.models import Notification
from notifications.views import MarkAllNotificationsReadView


@pytest.mark.django_db
class TestMarkAllNotificationsReadView:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = RequestFactory()

        self.user = User.objects.create_user(
            full_name="Tester",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123",
        )

    def make_request(self):
        """
        Create a Django HttpRequest and force authentication.
        """
        request = self.factory.patch("/notif/read-all/")
        request.user = self.user
        request._force_auth_user = self.user
        return request

    def test_marks_all_as_read(self):
        n1 = Notification.objects.create(receiver=self.user, is_read=False)
        n2 = Notification.objects.create(receiver=self.user, is_read=False)

        request = self.make_request()
        response = MarkAllNotificationsReadView.as_view()(request)

        n1.refresh_from_db()
        n2.refresh_from_db()

        assert response.status_code == 200
        assert response.data == {"success": True}
        assert n1.is_read is True
        assert n2.is_read is True
