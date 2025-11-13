from django.contrib import admin

from .models import Subsidy, SubsidyApplication, ApplicationDocument


@admin.register(Subsidy)
class SubsidyAdmin(admin.ModelAdmin):
    list_display = ("title", "amount", "application_start_date", "application_end_date", "created_at")
    search_fields = ("title", "description", "eligibility")
    list_filter = ("application_start_date", "application_end_date")


@admin.register(SubsidyApplication)
class SubsidyApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "subsidy",
        "applicant",
        "assigned_officer",
        "status",
        "document_status",
        "submitted_at",
        "updated_at",
    )
    list_filter = ("status", "document_status", "submitted_at", "approved_at")
    search_fields = (
        "subsidy__title",
        "applicant__full_name",
        "applicant__email_address",
        "assigned_officer__full_name",
    )
    autocomplete_fields = ("subsidy", "applicant", "assigned_officer")


@admin.register(ApplicationDocument)
class ApplicationDocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "application", "document_type", "verified", "verified_by", "uploaded_at")
    list_filter = ("verified", "uploaded_at", "document_type")
    search_fields = (
        "application__subsidy__title",
        "application__applicant__full_name",
        "document_type",
    )
    autocomplete_fields = ("application", "verified_by")
