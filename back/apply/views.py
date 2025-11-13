from rest_framework import viewsets
from .models import SubsidyApplication
from .serializers import SubsidyApplicationSerializer


class SubsidyApplicationViewSet(viewsets.ModelViewSet):
    queryset = SubsidyApplication.objects.all().order_by('-date_applied')
    serializer_class = SubsidyApplicationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        email = self.request.query_params.get('email')
        if email:
            queryset = queryset.filter(email=email)
        return queryset
