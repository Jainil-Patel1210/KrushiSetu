from rest_framework import serializers
from .models import User

class UserSignupSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "email_address",
            "mobile_number",
            "aadhaar_number",
            "password",
            "confirm_password"
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, data):
        if not data.get("email_address") or not data.get("mobile_number"):
            raise serializers.ValidationError("Email and mobile number are required")

        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match")

        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        return User.objects.create_user(**validated_data)
