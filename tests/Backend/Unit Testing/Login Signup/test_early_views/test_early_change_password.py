"""
Unit tests for the `change_password` function in loginSignup.views.

Test Categories:
- Happy Path: Marked with @pytest.mark.happy_path
- Edge Case: Marked with @pytest.mark.edge_case

All tests are organized in the TestChangePassword class.
"""

import pytest
from rest_framework.test import APIRequestFactory, force_authenticate
from django.contrib.auth import get_user_model
from loginSignup.views import change_password

User = get_user_model()

@pytest.fixture
def user_factory(db):
    """
    Fixture to create a user matching the actual CustomUser fields.
    """
    def make_user(password="old_password123"):
        user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="testuser@example.com",
            password=password,
            aadhaar_number="123412341234",
            role="farmer"
        )
        return user
    return make_user

@pytest.fixture
def api_factory():
    """
    Fixture to provide DRF's APIRequestFactory.
    """
    return APIRequestFactory()

class TestChangePassword:
    # ------------------- Happy Path Tests -------------------

    @pytest.mark.happy_path
    def test_successful_password_change(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "new_password": "new_password456",
            "confirm_password": "new_password456"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 200
        assert response.data["message"] == "Password changed successfully!"

        user.refresh_from_db()
        assert user.check_password("new_password456")

    @pytest.mark.happy_path
    def test_successful_password_change_with_complex_password(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "new_password": "C0mpl3x!@#Passw0rd",
            "confirm_password": "C0mpl3x!@#Passw0rd"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 200
        assert response.data["message"] == "Password changed successfully!"

        user.refresh_from_db()
        assert user.check_password("C0mpl3x!@#Passw0rd")

    # ------------------- Edge Case Tests -------------------

    @pytest.mark.edge_case
    def test_missing_all_fields(self, api_factory, user_factory):
        user = user_factory()
        data = {}
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "All fields are required."

    @pytest.mark.edge_case
    def test_missing_old_password(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "new_password": "new_password456",
            "confirm_password": "new_password456"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "All fields are required."

    @pytest.mark.edge_case
    def test_missing_new_password(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "confirm_password": "new_password456"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "All fields are required."

    @pytest.mark.edge_case
    def test_missing_confirm_password(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "new_password": "new_password456"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "All fields are required."

    @pytest.mark.edge_case
    def test_incorrect_old_password(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "wrong_password",
            "new_password": "new_password456",
            "confirm_password": "new_password456"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "Old password is incorrect."

    @pytest.mark.edge_case
    def test_new_passwords_do_not_match(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "new_password": "new_password456",
            "confirm_password": "different_password"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "New passwords do not match."

    @pytest.mark.edge_case
    def test_new_password_same_as_old(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "new_password": "old_password123",
            "confirm_password": "old_password123"
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "New password cannot be same as old password."

    @pytest.mark.edge_case
    def test_blank_passwords(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "",
            "new_password": "",
            "confirm_password": ""
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "All fields are required."

    @pytest.mark.edge_case
    def test_authenticated_user_required(self, api_factory):
        """
        Test that unauthenticated requests are rejected.
        """
        data = {
            "old_password": "old_password123",
            "new_password": "new_password456",
            "confirm_password": "new_password456"
        }
        request = api_factory.post("/change-password/", data, format="json")

        # No force_authenticate()
        response = change_password(request)

        assert response.status_code in (401, 403)

    @pytest.mark.edge_case
    def test_new_password_with_whitespace(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "new_password": "  new_password456  ",
            "confirm_password": "  new_password456  "
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 200
        assert response.data["message"] == "Password changed successfully!"

        user.refresh_from_db()
        assert user.check_password("  new_password456  ")

    @pytest.mark.edge_case
    def test_new_password_is_empty_string(self, api_factory, user_factory):
        user = user_factory()
        data = {
            "old_password": "old_password123",
            "new_password": "",
            "confirm_password": ""
        }
        request = api_factory.post("/change-password/", data, format="json")
        force_authenticate(request, user=user)
        response = change_password(request)

        assert response.status_code == 400
        assert response.data["error"] == "All fields are required."
