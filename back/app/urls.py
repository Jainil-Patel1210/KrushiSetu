from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubsidyViewSet, index

router = DefaultRouter()
router.register(r'subsidies', SubsidyViewSet, basename='subsidy')

urlpatterns = [
    path('', index, name="index"),
    path('', include(router.urls)),
]
