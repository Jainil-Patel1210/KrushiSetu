# subsidy/serializers.py
from rest_framework import serializers
from .models import SubsidyApplication, Document
from app.models import Subsidy as AppSubsidy  # IMPORTANT: import the real Subsidy model

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'document_type', 'document_number', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class SubsidyApplicationSerializer(serializers.ModelSerializer):
    # Force DRF to validate subsidy against the AppSubsidy (from app.models)
    subsidy = serializers.PrimaryKeyRelatedField(queryset=AppSubsidy.objects.all())
    document_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = SubsidyApplication
        fields = [
            'subsidy', 'document_ids',
            'full_name', 'mobile', 'email', 'aadhaar',
            'address', 'state', 'district', 'taluka', 'village',
            'land_area', 'land_unit', 'soil_type', 'ownership',
            'bank_name', 'account_number', 'ifsc',
        ]

    def validate(self, attrs):
        # Prevent duplicate applications
        user = self.context['request'].user
        subsidy = attrs.get('subsidy')
        if SubsidyApplication.objects.filter(user=user, subsidy=subsidy).exists():
            raise serializers.ValidationError({"detail": "You have already applied for this subsidy."})
        return attrs

    def create(self, validated_data):
        doc_ids = validated_data.pop('document_ids', [])
        # Ensure the request user is used as owner
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        validated_data['user'] = user

        # Use instance creation + save() so model.save() runs (auto application_id)
        app = SubsidyApplication(**validated_data)
        app.save()

        # Attach documents (only those belonging to the user)
        if doc_ids:
            docs = Document.objects.filter(id__in=doc_ids, owner=user)
            app.documents.set(docs)

        return app
