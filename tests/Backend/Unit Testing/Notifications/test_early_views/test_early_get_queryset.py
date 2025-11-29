import pytest
from rest_framework.test import APIRequestFactory, force_authenticate

from notifications.views import MyNotificationsView
from notifications.models import Notification
from loginSignup.models import User


@pytest.mark.django_db
class TestMyNotificationsView:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            full_name="Test User",
            email_address="test@example.com",
            mobile_number="9999999999",
            password="testpass",
            aadhaar_number="123412341234",
            role="farmer"
        )

    @pytest.fixture
    def other_user(self):
        return User.objects.create_user(
            full_name="Other User",
            email_address="other@example.com",
            mobile_number="8888888888",
            password="testpass",
            aadhaar_number="999999999999",
            role="farmer"
        )

    @pytest.fixture
    def notifications(self, user, other_user):
        """
        n1 = unread for user
        n2 = read for user
        n3 = unread for another user (should not appear)
        """
        n1 = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="system",
            subject="Unread Notification",
            message="Hello1",
            is_read=False,
        )

        n2 = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="system",
            subject="Read Notification",
            message="Hello2",
            is_read=True,
        )

        Notification.objects.create(  # should never appear in results
            receiver=other_user,
            receiver_role="farmer",
            notif_type="system",
            subject="Other User",
            message="Hello3",
            is_read=False,
        )

        return n1, n2

    def perform_request(self, user, params=None):
        factory = APIRequestFactory()
        request = factory.get("/notifications/", params or {})
        force_authenticate(request, user=user)

        view = MyNotificationsView.as_view()
        return view(request)

    # --------------------------
    # TEST 1: unread=true
    # --------------------------
    def test_unread_true(self, user, notifications):
        n1, n2 = notifications

        response = self.perform_request(user, {"unread": "true"})

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["id"] == n1.id

    # --------------------------
    # TEST 2: all=true
    # --------------------------
    def test_all_true(self, user, notifications):
        n1, n2 = notifications

        response = self.perform_request(user, {"all": "true"})

        returned_ids = [item["id"] for item in response.data]

        assert response.status_code == 200
        assert len(response.data) == 2
        assert set(returned_ids) == {n1.id, n2.id}

    # --------------------------
    # TEST 3: default (no params)
    # --------------------------
    def test_default_unread_only(self, user, notifications):
        n1, n2 = notifications

        response = self.perform_request(user)

        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["id"] == n1.id

    # --------------------------
    # TEST 4: ordering is descending
    # --------------------------
    def test_ordering_desc(self, user, notifications):
        n1, n2 = notifications

        # Make n2 newer
        n2.created_at = n1.created_at.replace(second=n1.created_at.second + 5)
        n2.save(update_fields=["created_at"])

        response = self.perform_request(user, {"all": "true"})
        ids = [item["id"] for item in response.data]

        # Newer one should be first
        assert ids[0] == n2.id

    def test_invalid_query_param_uses_default(self, user, notifications):
        n1, n2 = notifications
        response = self.perform_request(user, {"something": "random"})
        assert response.status_code == 200
        assert len(response.data) == 1
        assert response.data[0]["id"] == n1.id

    def test_unread_true_with_no_unread(self, user):
        Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="system",
            subject="Read1",
            message="msg",
            is_read=True,
        )
        response = self.perform_request(user, {"unread": "true"})
        assert response.status_code == 200
        assert len(response.data) == 0

    def test_no_notifications_for_user(self, user):
            response = self.perform_request(user)
            assert response.status_code == 200
            assert response.data == []

import pytest
from notifications.serializers import NotificationSerializer
from notifications.models import Notification
from loginSignup.models import User


@pytest.mark.django_db
class TestNotificationSerializer:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            full_name="Tester",
            email_address="tester@example.com",
            mobile_number="9999999999",
            password="pass123",
            aadhaar_number="123456789012",
            role="farmer"
        )

    def serialize(self, obj):
        return NotificationSerializer(obj).data

    def test_type_path_payment(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="payment",
            subject="Payment Received",
            message="msg",
            is_read=False,
        )
        data = self.serialize(n)
        assert data["type"] == "success"

    def test_type_path_application_approved(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="application",
            subject="Your application approved",
            message="msg",
            is_read=True,
        )
        data = self.serialize(n)
        assert data["type"] == "approved"

    def test_type_path_application_submitted(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="application",
            subject="Application submitted successfully",
            message="msg",
            is_read=False,
        )
        data = self.serialize(n)
        assert data["type"] == "submitted"

    def test_type_path_keyword_match(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="custom",
            subject="Officer assigned to your case",
            message="msg",
            is_read=False,
        )
        data = self.serialize(n)
        assert data["type"] == "info"

    def test_type_path_fallback_notif_type(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="system",
            subject="Random message",
            message="msg",
            is_read=False,
        )
        data = self.serialize(n)
        assert data["type"] == "info"

    def test_type_final_default_fallback(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="unknown_type",
            subject="nothing matches",
            message="msg",
            is_read=False,
        )
        data = self.serialize(n)
        assert data["type"] == "info"

    def test_is_new_field(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="system",
            subject="Test",
            message="msg",
            is_read=False,
        )
        data = self.serialize(n)
        assert data["is_new"] is True

    def test_title_field_mapping(self, user):
        n = Notification.objects.create(
            receiver=user,
            receiver_role="farmer",
            notif_type="system",
            subject="My Subject",
            message="msg",
            is_read=True,
        )
        data = self.serialize(n)
        assert data["title"] == "My Subject"

