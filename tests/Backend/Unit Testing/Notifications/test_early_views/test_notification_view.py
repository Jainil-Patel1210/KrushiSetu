import pytest
from rest_framework.test import APIRequestFactory
from rest_framework.request import Request

from loginSignup.models import User
from notifications.models import Notification
from notifications.views import MyNotificationsView


@pytest.mark.django_db
class TestMyNotificationsView:

    @pytest.fixture(autouse=True)
    def setup(self):
        self.factory = APIRequestFactory()

        # Create a valid user for your custom user model
        self.user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="pass123"
        )

    def get_request(self, params=None, set_user=True):
        """
        IMPORTANT:
        DRF Request overrides request.user.
        So we MUST patch BOTH:
          - drf_request.user
          - drf_request._request.user
        """
        wsgi = self.factory.get("/notifications/", params or {})

        drf_request = Request(wsgi)

        if set_user:
            drf_request.user = self.user
            drf_request._request.user = self.user
        else:
            drf_request.user = None
            drf_request._request.user = None

        return drf_request

    # -------------------- TESTS -------------------------

    def test_unread_param_true(self):
        n1 = Notification.objects.create(receiver=self.user, is_read=False)
        Notification.objects.create(receiver=self.user, is_read=True)
        n3 = Notification.objects.create(receiver=self.user, is_read=False)

        request = self.get_request({"unread": "true"})
        view = MyNotificationsView()
        view.request = request

        qs = list(view.get_queryset())

        assert {n1.id, n3.id} == {n.id for n in qs}

    def test_all_param_true(self):
        n1 = Notification.objects.create(receiver=self.user, is_read=False)
        n2 = Notification.objects.create(receiver=self.user, is_read=True)

        request = self.get_request({"all": "true"})
        view = MyNotificationsView()
        view.request = request

        qs = list(view.get_queryset())

        assert {n1.id, n2.id} == {n.id for n in qs}

    def test_default_unread_only(self):
        n1 = Notification.objects.create(receiver=self.user, is_read=False)
        Notification.objects.create(receiver=self.user, is_read=True)

        request = self.get_request()
        view = MyNotificationsView()
        view.request = request

        qs = list(view.get_queryset())

        assert [n1.id] == [n.id for n in qs]

    def test_wrong_case_defaults_to_unread(self):
        n1 = Notification.objects.create(receiver=self.user, is_read=False)
        Notification.objects.create(receiver=self.user, is_read=True)

        request = self.get_request({"unread": "TRUE"})
        view = MyNotificationsView()
        view.request = request

        qs = list(view.get_queryset())

        assert [n1.id] == [n.id for n in qs]

    def test_no_user_returns_empty(self):
        request = self.get_request(set_user=False)
        view = MyNotificationsView()
        view.request = request

        qs = list(view.get_queryset())

        assert qs == []
