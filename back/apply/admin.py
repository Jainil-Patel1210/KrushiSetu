from django.contrib import admin
from .models import SubsidyApplication


@admin.register(SubsidyApplication)
class SubsidyApplicationAdmin(admin.ModelAdmin):
    list_display = ('application_id', 'subsidy_name',
                    'full_name', 'email', 'status', 'date_applied')
    search_fields = ('application_id', 'full_name', 'email')
    list_filter = ('status', 'date_applied')
