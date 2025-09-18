from django.urls import path
from .views import UserSignupView
from django.urls import path
from .views import CustomTokenObtainPairView
urlpatterns = [
    path("signup/", UserSignupView.as_view(), name="signup"),
     path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
]

