from django.urls import path
from .views import (
    upload_document, apply_subsidy,
    assign_officer, officer_dashboard, review_application
)

urlpatterns = [
    path('documents/', upload_document),
    path('apply/', apply_subsidy),

    # Officer
    path('officer/dashboard/', officer_dashboard),
    path('officer/review/<int:app_id>/', review_application),

    # Admin
    path('assign/<int:app_id>/', assign_officer),
]

