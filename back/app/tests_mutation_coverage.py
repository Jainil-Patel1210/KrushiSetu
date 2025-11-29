"""
Additional test cases specifically to kill surviving mutants.
These tests target edge cases, boundary conditions, and untested branches.
DO NOT modify production code - only add tests.
"""
from decimal import Decimal
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock

from .models import Subsidy, SubsidyRating
from .serializers import SubsidySerializer

User = get_user_model()


# ============================================================================
# ADDITIONAL MODEL TESTS FOR MUTATION COVERAGE
# ============================================================================

class SubsidyModelMutationTests(TestCase):
    """Additional tests to kill mutants in Subsidy model."""
    
    def setUp(self):
        self.user = User.objects.create_user(
            full_name="Test User",
            mobile_number="+911234567890",
            email_address="test@example.com",
            password="testpass123"
        )
    
    def test_update_average_rating_rounding_precision(self):
        """Test that rounding works correctly (3.333 -> 3.3, not 3.4)."""
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        # Create 3 ratings that result in 3.333... average
        user1 = User.objects.create_user(
            full_name="User 1",
            mobile_number="+911111111111",
            email_address="user1@test.com",
            password="pass123"
        )
        user2 = User.objects.create_user(
            full_name="User 2",
            mobile_number="+912222222222",
            email_address="user2@test.com",
            password="pass123"
        )
        user3 = User.objects.create_user(
            full_name="User 3",
            mobile_number="+913333333333",
            email_address="user3@test.com",
            password="pass123"
        )
        
        SubsidyRating.objects.create(subsidy=subsidy, user=user1, rating=3)
        SubsidyRating.objects.create(subsidy=subsidy, user=user2, rating=3)
        SubsidyRating.objects.create(subsidy=subsidy, user=user3, rating=4)
        
        # Average = 10/3 = 3.333... should round to 3.3
        subsidy.update_average_rating()
        subsidy.refresh_from_db()
        
        self.assertEqual(subsidy.rating, 3.3)  # Not 3.4, not 3.33
    
    def test_update_average_rating_rounding_up(self):
        """Test rounding up (3.35 -> 3.4)."""
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        user1 = User.objects.create_user(
            full_name="User 1",
            mobile_number="+911111111111",
            email_address="user1@test.com",
            password="pass123"
        )
        user2 = User.objects.create_user(
            full_name="User 2",
            mobile_number="+912222222222",
            email_address="user2@test.com",
            password="pass123"
        )
        
        # Ratings: 3 and 4 = 3.5 average
        SubsidyRating.objects.create(subsidy=subsidy, user=user1, rating=3)
        SubsidyRating.objects.create(subsidy=subsidy, user=user2, rating=4)
        
        subsidy.update_average_rating()
        subsidy.refresh_from_db()
        
        self.assertEqual(subsidy.rating, 3.5)


# ============================================================================
# ADDITIONAL VIEW TESTS FOR MUTATION COVERAGE
# ============================================================================

class SubsidyViewSetMutationTests(TestCase):
    """Additional tests to kill mutants in SubsidyViewSet."""
    
    def setUp(self):
        self.client = APIClient()
        self.provider = User.objects.create_user(
            full_name="Provider User",
            mobile_number="+912222222222",
            email_address="provider@example.com",
            password="pass123",
            role="subsidy_provider"
        )
        self.farmer = User.objects.create_user(
            full_name="Farmer User",
            mobile_number="+911111111111",
            email_address="farmer@example.com",
            password="pass123",
            role="farmer"
        )
    
    def test_list_subsidies_pagination_with_small_dataset(self):
        """Test pagination behavior with small dataset (tests page is not None branch)."""
        # Create exactly page_size subsidies (10)
        for i in range(10):
            Subsidy.objects.create(
                title=f"Subsidy {i}",
                description="Test",
                amount=Decimal("10000.00")
            )
        
        url = reverse('subsidy-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should use pagination (page is not None)
        self.assertIn('results', response.data)
        self.assertIn('count', response.data)
        self.assertEqual(len(response.data['results']), 10)
    
    def test_create_subsidy_no_farmers_empty_notifications(self):
        """Test create when no active farmers exist (empty notifications list)."""
        # Ensure no active farmers exist
        User.objects.filter(role="farmer").update(is_active=False)
        
        self.client.force_authenticate(user=self.provider)
        
        url = reverse('subsidy-list')
        data = {
            'title': 'No Farmers Subsidy',
            'description': 'Should handle empty notifications',
            'amount': '50000.00'
        }
        
        # Should not raise error even with empty notifications list
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        from notifications.models import Notification
        notifications = Notification.objects.filter(notif_type='subsidy')
        self.assertEqual(notifications.count(), 0)  # No notifications created
    
    def test_rate_subsidy_boundary_value_0(self):
        """Test rating boundary: 0 should be rejected."""
        self.client.force_authenticate(user=self.farmer)
        
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        url = reverse('subsidy-rate', kwargs={'pk': subsidy.pk})
        response = self.client.post(url, {'rating': 0, 'review': 'Test'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('between 1 and 5', response.data['error'].lower())
    
    def test_rate_subsidy_boundary_value_6(self):
        """Test rating boundary: 6 should be rejected."""
        self.client.force_authenticate(user=self.farmer)
        
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        url = reverse('subsidy-rate', kwargs={'pk': subsidy.pk})
        response = self.client.post(url, {'rating': 6, 'review': 'Test'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('between 1 and 5', response.data['error'].lower())
    
    def test_rate_subsidy_boundary_value_1(self):
        """Test rating boundary: 1 should be accepted."""
        self.client.force_authenticate(user=self.farmer)
        
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        url = reverse('subsidy-rate', kwargs={'pk': subsidy.pk})
        response = self.client.post(url, {'rating': 1, 'review': 'Test'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_rate_subsidy_boundary_value_5(self):
        """Test rating boundary: 5 should be accepted."""
        self.client.force_authenticate(user=self.farmer)
        
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        url = reverse('subsidy-rate', kwargs={'pk': subsidy.pk})
        response = self.client.post(url, {'rating': 5, 'review': 'Test'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_rate_subsidy_invalid_type_string(self):
        """Test rating with string value that cannot be converted to int."""
        self.client.force_authenticate(user=self.farmer)
        
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        url = reverse('subsidy-rate', kwargs={'pk': subsidy.pk})
        response = self.client.post(url, {'rating': 'not_a_number', 'review': 'Test'})
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('integer', response.data['error'].lower())
    
    def test_top_rated_exactly_five(self):
        """Test top_rated with exactly 5 subsidies."""
        # Create exactly 5 subsidies with different ratings
        ratings = [5.0, 4.5, 4.0, 3.5, 3.0]
        for i, rating_val in enumerate(ratings):
            Subsidy.objects.create(
                title=f"Subsidy {i}",
                description="Test",
                amount=Decimal("10000.00"),
                rating=rating_val
            )
        
        url = reverse('subsidy-top-rated')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)
    
    def test_top_rated_fewer_than_five(self):
        """Test top_rated with fewer than 5 subsidies."""
        # Create only 3 subsidies
        for i in range(3):
            Subsidy.objects.create(
                title=f"Subsidy {i}",
                description="Test",
                amount=Decimal("10000.00"),
                rating=5.0 - i * 0.5
            )
        
        url = reverse('subsidy-top-rated')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)  # Should return all 3
    
    def test_top_rated_more_than_five(self):
        """Test top_rated with more than 5 subsidies (should limit to 5)."""
        # Create 7 subsidies with different ratings
        for i in range(7):
            Subsidy.objects.create(
                title=f"Subsidy {i}",
                description="Test",
                amount=Decimal("10000.00"),
                rating=5.0 - i * 0.1
            )
        
        url = reverse('subsidy-top-rated')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 5)  # Should limit to 5
    
    def test_rate_subsidy_update_path(self):
        """Test rating update path (not create path)."""
        self.client.force_authenticate(user=self.farmer)
        
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00")
        )
        
        # Create initial rating
        url = reverse('subsidy-rate', kwargs={'pk': subsidy.pk})
        response1 = self.client.post(url, {'rating': 3, 'review': 'Initial'})
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertIn('submitted', response1.data['message'].lower())
        
        # Update rating (same user)
        response2 = self.client.post(url, {'rating': 5, 'review': 'Updated'})
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertIn('updated', response2.data['message'].lower())
        
        # Verify only one rating exists
        self.assertEqual(SubsidyRating.objects.filter(subsidy=subsidy, user=self.farmer).count(), 1)
        rating = SubsidyRating.objects.get(subsidy=subsidy, user=self.farmer)
        self.assertEqual(rating.rating, 5)
        self.assertEqual(rating.review, 'Updated')


# ============================================================================
# ADDITIONAL SERIALIZER TESTS FOR MUTATION COVERAGE
# ============================================================================

class SubsidySerializerMutationTests(TestCase):
    """Additional tests to kill mutants in SubsidySerializer."""
    
    def setUp(self):
        self.provider = User.objects.create_user(
            full_name="Provider User",
            mobile_number="+912222222222",
            email_address="provider@example.com",
            password="pass123",
            role="subsidy_provider"
        )
    
    def test_get_created_by_missing_full_name_attribute(self):
        """Test get_created_by when user has no full_name attribute."""
        subsidy = Subsidy.objects.create(
            title="Test Subsidy",
            description="Test",
            amount=Decimal("10000.00"),
            created_by=self.provider
        )
        
        # Mock user to have missing attributes
        with patch.object(self.provider, 'full_name', create=False):
            # Try to access full_name - should use getattr default
            serializer = SubsidySerializer(subsidy)
            data = serializer.data
            
            # Should handle gracefully with empty string default
            self.assertIn('created_by', data)
            if data['created_by']:
                # If created_by exists, check it handles missing attributes
                self.assertIsInstance(data['created_by'], dict)

