from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Subsidy 
from .serializers import SubsidySerializer
import sys
import os

# Add SubsidyRecommandation to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'SubsidyRecommandation'))

# Create your views here.
def index(request):
    return render(request, "index.html")

class SubsidyViewSet(viewsets.ModelViewSet):
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