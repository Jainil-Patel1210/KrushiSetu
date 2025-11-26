import pytest
from loginSignup.models import User
from notifications.models import Notification, NotificationPreference
from notifications.utils import notify_user   # adjust path if needed


@pytest.mark.django_db
class TestNotifyUser:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.user = User.objects.create_user(
            full_name="Tester",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123",
            role="farmer"
        )

    # 1️⃣ Critical notifications: must always be created
    def test_critical_notifications_always_created(self):
        notify_user(self.user, "application", "App Update", "Your application is approved")

        assert Notification.objects.count() == 1
        n = Notification.objects.first()
        assert n.notif_type == "application"
        assert n.receiver == self.user

    # 2️⃣ General notification allowed when preference does NOT exist
    def test_general_without_preferences_is_created(self):
        notify_user(self.user, "system", "System Update", "Maintenance scheduled")

        assert Notification.objects.count() == 1

    # 3️⃣ General notifications blocked when notify_general=False
    def test_general_notifications_blocked(self):
        NotificationPreference.objects.create(user=self.user, notify_general=False)

        notify_user(self.user, "system", "System Update", "You should NOT receive this")

        assert Notification.objects.count() == 0  # blocked

    # 4️⃣ General notifications allowed when notify_general=True
    def test_general_notifications_allowed(self):
        NotificationPreference.objects.create(user=self.user, notify_general=True)

        notify_user(self.user, "subsidy", "Subsidy Info", "New subsidy available")

        assert Notification.objects.count() == 1
        n = Notification.objects.first()
        assert n.notif_type == "subsidy"

    # 5️⃣ Critical notifications ignore preferences (even if disabled)
    def test_critical_ignores_preferences(self):
        NotificationPreference.objects.create(user=self.user, notify_general=False)

        notify_user(self.user, "payment", "Payment Update", "Payment completed")

        assert Notification.objects.count() == 1
        n = Notification.objects.first()
        assert n.notif_type == "payment"
