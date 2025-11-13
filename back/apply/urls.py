from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubsidyApplicationViewSet

router = DefaultRouter()
router.register(r'applications', SubsidyApplicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
