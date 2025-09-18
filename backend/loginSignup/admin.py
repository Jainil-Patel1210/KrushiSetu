from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("full_name", "mobile_email", "aadhaar_number", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")
    search_fields = ("full_name", "mobile_email", "aadhaar_number")
    ordering = ("mobile_email",)

    # Define the fieldsets (for editing users in admin)
    fieldsets = (
        (None, {"fields": ("full_name", "mobile_email", "aadhaar_number", "password")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
    )

    # For creating a new user in admin
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("full_name", "mobile_email", "aadhaar_number", "password1", "password2", "is_staff", "is_active")}
        ),
    )


admin.site.register(CustomUser, CustomUserAdmin)
