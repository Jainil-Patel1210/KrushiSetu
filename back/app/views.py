from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes,action
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
import sys
import os

# Add SubsidyRecommandation to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'SubsidyRecommandation'))
from .models import Subsidy, SubsidyRating
from .serializers import SubsidySerializer, SubsidyRatingSerializer
from .permissions import IsSubsidyProviderOrAdmin 


def index(request):
    return render(request, "index.html")


class SubsidyViewSet(viewsets.ModelViewSet):
    """
    Main ViewSet for Subsidy management.

    Endpoints:
    - GET /subsidies/                → List all subsidies
    - POST /subsidies/               → Create subsidy (provider/admin only)
    - GET /subsidies/<id>/           → Get single subsidy
    - POST /subsidies/<id>/rate/     → Add/update rating for a subsidy
    - GET /subsidies/<id>/ratings/   → Get all ratings for a subsidy
    - GET /subsidies/top-rated/      → List top 5 rated subsidies
    - GET /subsidies/my-subsidies/   → List subsidies created by logged-in provider
    """

    queryset = Subsidy.objects.all().order_by('-created_at')
    serializer_class = SubsidySerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def get_subsidy_recommendations(request):
    """API endpoint to get personalized subsidy recommendations"""
    try:
        from SubsidyRecommander import SubsidyRecommander
        
        farmer_profile = request.data.get('farmer_profile')
        
        if not farmer_profile:
            return Response(
                {"error": "farmer_profile is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize recommender and get recommendations
        recommender = SubsidyRecommander()
        recommendations = recommender.recommend_subsidies(farmer_profile)
        
        return Response(
            {
                "success": True,
                "data": recommendations
            },
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {
                "success": False,
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    # Permissions handling
    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated(), IsSubsidyProviderOrAdmin()]
        elif self.action in ['rate', 'my_subsidies']:
            return [IsAuthenticated()]
        else:
            return [AllowAny()]

    # Auto-assign the creator when subsidy is created
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # RATE a subsidy
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def rate(self, request, pk=None):
        subsidy = self.get_object()
        user = request.user
        rating_value = request.data.get('rating')
        review_text = request.data.get('review', '')

        if not rating_value:
            return Response({'error': 'Rating value is required.'}, status=400)
        try:
            rating_value = int(rating_value)
        except ValueError:
            return Response({'error': 'Rating must be an integer between 1 and 5.'}, status=400)

        if not (1 <= rating_value <= 5):
            return Response({'error': 'Rating must be between 1 and 5.'}, status=400)

        rating_obj, created = SubsidyRating.objects.update_or_create(
            subsidy=subsidy,
            user=user,
            defaults={'rating': rating_value, 'review': review_text}
        )

        serializer = SubsidyRatingSerializer(rating_obj)
        message = "Rating submitted successfully!" if created else "Rating updated successfully!"

        return Response({
            'message': message,
            'subsidy_average': subsidy.rating,
            'rating': serializer.data
        }, status=status.HTTP_200_OK)

    # Get all RATINGS for a subsidy
    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        subsidy = self.get_object()
        ratings = SubsidyRating.objects.filter(subsidy=subsidy).order_by('-created_at')
        serializer = SubsidyRatingSerializer(ratings, many=True)
        return Response(serializer.data)

    # Get TOP 5 RATED subsidies
    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        top_subsidies = Subsidy.objects.all().order_by('-rating')[:5]
        serializer = SubsidySerializer(top_subsidies, many=True)
        return Response(serializer.data)

    # Get MY SUBSIDIES (for the logged-in provider)
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_subsidies(self, request):
        user = request.user
        subsidies = Subsidy.objects.filter(created_by=user).order_by('-created_at')
        serializer = self.get_serializer(subsidies, many=True)
        return Response(serializer.data)
