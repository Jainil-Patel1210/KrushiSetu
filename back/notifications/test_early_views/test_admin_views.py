import pytest
from unittest.mock import patch, MagicMock

from django.contrib.admin.sites import AdminSite
from django.contrib.messages.storage.fallback import FallbackStorage
from django.test import RequestFactory

from loginSignup.models import User
from notifications.models import Notification
from notifications.admin import NotificationAdmin
from notifications.forms import BroadcastForm
from django.template.response import TemplateResponse


@pytest.mark.django_db
class TestNotificationBroadcastAdmin:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = RequestFactory()
        self.admin = NotificationAdmin(Notification, AdminSite())

        # Active farmer
        self.u1 = User.objects.create_user(
            full_name="A",
            mobile_number="+910000000001",
            email_address="a@example.com",
            password="pass",
            role="farmer",
        )
        self.u1.is_active = True
        self.u1.save()

        # Active officer
        self.u2 = User.objects.create_user(
            full_name="B",
            mobile_number="+910000000002",
            email_address="b@example.com",
            password="pass",
            role="officer",
        )
        self.u2.is_active = True
        self.u2.save()

        # Inactive farmer
        self.inactive = User.objects.create_user(
            full_name="C",
            mobile_number="+910000000003",
            email_address="c@example.com",
            password="pass",
            role="farmer",
        )
        self.inactive.is_active = False
        self.inactive.save()

    # --- Utility helper ---
    def attach_messages(self, request):
        request.user = MagicMock()
        request.user.is_active = True
        request.user.is_staff = True
        request.user.has_perm = lambda perm: True

        setattr(request, "session", {})
        messages = FallbackStorage(request)
        setattr(request, "_messages", messages)

    # ---------------- Test 2 ----------------
    @patch("notifications.admin.notify_user")
    def test_post_broadcast_all_active(self, mock_notify):
        data = {
            "target_group": "all",
            "subject": "Test Subject",
            "message": "Test Message",
        }

        request = self.factory.post("/admin/broadcast/", data)
        self.attach_messages(request)

        response = self.admin.broadcast_view(request)

        assert response.status_code == 302
        assert mock_notify.call_count == 2  # only active users

    # ---------------- Test 3 ----------------
    @patch("notifications.admin.notify_user")
    def test_post_broadcast_custom_users(self, mock_notify):
        data = {
            "target_group": "custom",
            "users": [self.u1.id, self.u2.id],
            "subject": "Hello",
            "message": "Message",
        }

        request = self.factory.post("/admin/broadcast/", data)
        self.attach_messages(request)

        response = self.admin.broadcast_view(request)

        assert response.status_code == 302
        assert mock_notify.call_count == 2

    # ---------------- Test 4 ----------------
    @patch("notifications.admin.notify_user")
    def test_post_broadcast_specific_role(self, mock_notify):
        data = {
            "target_group": "farmer",
            "subject": "Role Subject",
            "message": "Role Message",
        }

        request = self.factory.post("/admin/broadcast/", data)
        self.attach_messages(request)

        response = self.admin.broadcast_view(request)

        assert response.status_code == 302
        assert mock_notify.call_count == 1

    # ---------------- Test 5 ----------------
    @patch("notifications.admin.notify_user")
    def test_notify_user_called_with_correct_arguments(self, mock_notify):
        data = {
            "target_group": "all",
            "subject": "Subject X",
            "message": "Body Y",
        }

        request = self.factory.post("/admin/broadcast/", data)
        self.attach_messages(request)

        self.admin.broadcast_view(request)

        mock_notify.assert_any_call(
            user=self.u1,
            notif_type="system",
            subject="Subject X",
            message="Body Y"
        )

    # ---------------- Test 7 ----------------
    @patch("notifications.admin.notify_user")
    def test_broadcast_skips_inactive_users(self, mock_notify):
        data = {
            "target_group": "all",
            "subject": "S",
            "message": "M",
        }

        request = self.factory.post("/admin/broadcast/", data)
        self.attach_messages(request)

        self.admin.broadcast_view(request)

        assert mock_notify.call_count == 2  # inactive user excluded

    # ---------------- Test 8 ----------------
    @patch("notifications.admin.notify_user")
    def test_success_message_added(self, mock_notify):
        data = {
            "target_group": "all",
            "subject": "S",
            "message": "M",
        }

        request = self.factory.post("/admin/broadcast/", data)
        self.attach_messages(request)

        self.admin.broadcast_view(request)

        storage = list(request._messages)
        assert len(storage) == 1
        assert "Broadcast sent to" in str(storage[0])

    # ---------------- Test 10 ----------------
    @patch("notifications.admin.notify_user")
    def test_zero_users_selected(self, mock_notify):
        data = {
            "target_group": "custom",
            "users": [],
            "subject": "Empty",
            "message": "None",
        }

        request = self.factory.post("/admin/broadcast/", data)
        self.attach_messages(request)

        response = self.admin.broadcast_view(request)

        assert response.status_code == 302
        assert mock_notify.call_count == 0

    # ---------------- Test 11 ----------------
    def test_get_broadcast_form_renders_template(self):
        request = self.factory.get("/admin/broadcast/")
        self.attach_messages(request)
        print('route reached')

        response = self.admin.broadcast_view(request)

        # Should return a TemplateResponse
        assert isinstance(response, TemplateResponse)

        # Check correct template is used
        assert response.template_name == "admin/broadcast_form.html"

        # Check context contains a BroadcastForm instance
        assert isinstance(response.context_data["form"], BroadcastForm)

