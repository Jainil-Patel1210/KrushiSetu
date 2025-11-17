from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from .SubsidyRecommander import SubsidyRecommander
from app.models import Subsidy
import os
import hashlib
import json

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def recommend_subsidies(request):
    try:
        # Extract farmer_profile from request
        request_data = request.data.get('farmer_profile', request.data)
        
        farmer_profile = {
            "income": request_data.get("income", ""),
            "farmer_type": request_data.get("farmer_type", ""),
            "land_size": request_data.get("land_size", ""),
            "crop_type": request_data.get("crop_type", ""),
            "season": request_data.get("season", ""),
            "soil_type": request_data.get("soil_type", ""),
            "water_sources": request_data.get("water_sources", []),
            "state": request_data.get("state", ""),
            "district": request_data.get("district", ""),
            "rainfall_region": request_data.get("rainfall_region", ""),
            "temperature_zone": request_data.get("temperature_zone", ""),
            "past_subsidies": request_data.get("past_subsidies", []),
        }
        
        required_field = ["income", "farmer_type", "land_size", "crop_type", "state"]
        missing_fields = [field for field in required_field if not farmer_profile.get(field)]
        
        if missing_fields:
            return Response({
                "success": False,
                "error": f"Missing required fields: {', '.join(missing_fields)}",
                "error_type": "validation_error"
            }, status=status.HTTP_400_BAD_REQUEST)
            
        # ------------------------ Load Subsidy From Backend (with caching) ---------------------
        # Try to get subsidies from cache first
        subsidies_cache_key = "all_subsidies_data"
        subsidies = cache.get(subsidies_cache_key)
        
        if subsidies is None:
            subsidies = Subsidy.objects.all().values(
                'id', 'title', 'description', 'amount', 'eligibility', 'documents_required', 
                'application_start_date', 'application_end_date'
            )
            # Cache subsidies for 30 minutes (they don't change frequently)
            cache.set(subsidies_cache_key, list(subsidies), 1800)
            print("Loaded subsidies from database")
        else:
            print("Loaded subsidies from cache")
        
        if not subsidies:
            return Response({
                "success": False,
                "error": "No subsidies available in the system.",
                "error_type": "no_data"
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Convert to list and format for recommender
        subsidies_list = []
        for subsidy in subsidies:
            subsidies_list.append({
                'id': subsidy['id'],
                'title': subsidy['title'],
                'description': subsidy['description'],
                'amount': float(subsidy['amount']),
                'eligibility_criteria': subsidy['eligibility'] if subsidy['eligibility'] else [],
                'documents_required': subsidy['documents_required'] if subsidy['documents_required'] else [],
                'application_start_date': subsidy['application_start_date'].isoformat() if subsidy['application_start_date'] else None,
                'application_end_date': subsidy['application_end_date'].isoformat() if subsidy['application_end_date'] else None,
            })
        
        # Create cache key for this specific farmer profile
        cache_key_data = {
            'farmer_profile': farmer_profile,
            'subsidy_count': len(subsidies_list)
        }
        cache_key = f"subsidy_rec_{hashlib.md5(json.dumps(cache_key_data, sort_keys=True).encode()).hexdigest()}"
        
        # Try to get from cache first (5-minute cache)
        recommendation_result = cache.get(cache_key)
        
        if recommendation_result is None:
            # Get recommendations using SubsidyRecommander
            try:
                recommender = SubsidyRecommander()
                recommendation_result = recommender.recommend_subsidies(farmer_profile, subsidies_list)
                
                # Cache the result for 5 minutes
                cache.set(cache_key, recommendation_result, 300)
                print(f"Generated new recommendations for farmer profile")
            except ValueError as ve:
                # API key or configuration error
                print(f"Configuration error: {ve}")
                return Response({
                    "success": False,
                    "error": str(ve),
                    "error_type": "configuration_error",
                    "help": "Please contact administrator to configure GROQ_API_KEY in the backend deployment environment."
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            except Exception as e:
                print(f"Error creating or using recommender: {e}")
                import traceback
                traceback.print_exc()
                return Response({
                    "success": False,
                    "error": f"AI recommendation service error: {str(e)}",
                    "error_type": "ai_service_error"
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        else:
            print(f"Retrieved recommendations from cache")
        
        # Format response to match frontend expectations
        formatted_response = {
            "success": True,
            "recommendations": recommendation_result.get("recommended_subsidies", []),
            "total_found": recommendation_result.get("total_recommended", 0),
            "summary": f"Based on your profile as a {farmer_profile.get('farmer_type', 'farmer')} with {farmer_profile.get('land_size', 'unknown')} acres growing {farmer_profile.get('crop_type', 'crops')} in {farmer_profile.get('district', 'your area')}, {farmer_profile.get('state', '')}, we found {recommendation_result.get('total_recommended', 0)} eligible subsidies tailored to your needs."
        }
        
        return Response(formatted_response, status=status.HTTP_200_OK)
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Unexpected error in recommend_subsidies: {e}")
        print(error_trace)
        
        # Provide helpful error message
        error_message = str(e)
        if "GROQ_API_KEY" in error_message:
            error_type = "configuration_error"
            help_text = "Backend AI service not configured. Contact administrator."
        elif "timeout" in error_message.lower():
            error_type = "timeout_error"
            help_text = "Request took too long. Please try again."
        else:
            error_type = "server_error"
            help_text = "An unexpected error occurred. Please try again later."
        
        return Response({
            "success": False,
            "error": error_message,
            "error_type": error_type,
            "help": help_text
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def recommendation_status(request):
    return Response({
        "success": True,
        "message": "Subsidy Recommendation Service is operational."
    }, status=status.HTTP_200_OK)    
        