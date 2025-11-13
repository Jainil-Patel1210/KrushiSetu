from rest_framework import serializers
from .models import SubsidyApplication


class SubsidyApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubsidyApplication
        fields = '__all__'
        read_only_fields = ['application_id', 'date_applied', 'status']
