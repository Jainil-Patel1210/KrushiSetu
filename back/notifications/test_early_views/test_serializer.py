import pytest
from notifications.serializers import NotificationSerializer
from notifications.models import Notification
from loginSignup.models import User


@pytest.mark.django_db
class TestNotificationSerializer:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.user = User.objects.create_user(
            full_name="Tester",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123",
            role="farmer"
        )

    # 1️⃣ Payment → type = success
    def test_type_payment(self):
        notif = Notification.objects.create(
            receiver=self.user,
            notif_type="payment",
            subject="Payment completed",
        )
        data = NotificationSerializer(notif).data
        assert data["type"] == "success"

    # 2️⃣ Application approved → type = approved
    def test_type_application_approved(self):
        notif = Notification.objects.create(
            receiver=self.user,
            notif_type="application",
            subject="Your application has been approved",
        )
        data = NotificationSerializer(notif).data
        assert data["type"] == "approved"

    # 3️⃣ Application submitted → type = submitted
    def test_type_application_submitted(self):
        notif = Notification.objects.create(
            receiver=self.user,
            notif_type="application",
            subject="Application submitted successfully",
        )
        data = NotificationSerializer(notif).data
        assert data["type"] == "submitted"

    # 4️⃣ Keyword-based match → “grievance approved” → approved
    def test_type_keyword_mapping(self):
        notif = Notification.objects.create(
            receiver=self.user,
            notif_type="grievance",
            subject="Your grievance approved by officer",
        )
        data = NotificationSerializer(notif).data
        assert data["type"] == "approved"

    # 5️⃣ Keyword "officer assigned" → type = info
    def test_type_keyword_info(self):
        notif = Notification.objects.create(
            receiver=self.user,
            notif_type="system",
            subject="New officer assigned to your application",
        )
        data = NotificationSerializer(notif).data
        assert data["type"] == "info"

    # 6️⃣ Fallback: notif_type in info group → type = info
    def test_type_fallback_notif_type_info_group(self):
        notif = Notification.objects.create(
            receiver=self.user,
            notif_type="subsidy",
            subject="New subsidy available",
        )
        data = NotificationSerializer(notif).data
        assert data["type"] == "info"

    # 7️⃣ Final fallback DEFAULT → type = info
    def test_type_default(self):
        notif = Notification.objects.create(
            receiver=self.user,
            notif_type="unknown",
            subject="Something random with no mapping",
        )
        data = NotificationSerializer(notif).data
        assert data["type"] == "info"

    # 8️⃣ is_new = True when unread
    def test_is_new_true(self):
        notif = Notification.objects.create(
            receiver=self.user,
            is_read=False
        )
        data = NotificationSerializer(notif).data
        assert data["is_new"] is True

    # 9️⃣ is_new = False when read
    def test_is_new_false(self):
        notif = Notification.objects.create(
            receiver=self.user,
            is_read=True
        )
        data = NotificationSerializer(notif).data
        assert data["is_new"] is False

    # 🔟 Title = subject (via source="subject")
    def test_title_uses_subject(self):
        notif = Notification.objects.create(
            receiver=self.user,
            subject="My Title Test"
        )
        data = NotificationSerializer(notif).data
        assert data["title"] == "My Title Test"
