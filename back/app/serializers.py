from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Subsidy, SubsidyRating

User = get_user_model()


# ------------------- Rating Serializer -------------------
class SubsidyRatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = SubsidyRating
        fields = ['id', 'user_name', 'rating', 'review', 'created_at']


# ------------------- Subsidy Serializer -------------------
class SubsidySerializer(serializers.ModelSerializer):
    # 🔹 FIX: Changed from source='ratings.count' to just IntegerField
    ratings_count = serializers.IntegerField(read_only=True) 
    
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = Subsidy
        fields = [
            'id',
            'title',
            'description',
            'amount',
            'eligibility',
            'documents_required',
            'application_start_date',
            'application_end_date',

            # ⭐ IMPORTANT FIELDS
            'rating',             # average rating
            'ratings_count',      # ⭐ number of reviews (now efficient!)
             
            'created_by',
        ]

    def get_created_by(self, obj):
        if not obj.created_by:
            return None
        return {
            "id": obj.created_by.pk,
            "full_name": getattr(obj.created_by, "full_name", ""),
            "email": getattr(obj.created_by, "email_address", ""),
            "role": getattr(obj.created_by, "role", ""),
        }