# back/subsidy/views.py
from django.db import IntegrityError
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import DocumentSerializer, SubsidyApplicationSerializer
from .models import Document, SubsidyApplication


# Upload single document (multipart/form-data)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # OK to keep; parsers ignored for GET
def upload_document(request):
    if request.method == 'GET':
        qs = Document.objects.filter(owner=request.user).order_by('-uploaded_at')
        serializer = DocumentSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST -> create a new Document (multipart/form-data expected)
    serializer = DocumentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        doc = serializer.save(owner=request.user)  # pass owner if serializer doesn't set it
        return Response(DocumentSerializer(doc, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Submit application (GET lists user's applications, POST creates one)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def apply_subsidy(request):
    """
    GET:
        Returns list of subsidy applications for the logged-in user in frontend-friendly shape.

    POST:
        Accepts JSON payload for creating an application. The server enforces `user=request.user`.
        Example expected JSON (your serializer may accept additional fields):
        {
          "subsidy": 1,
          "full_name": "...",
          "mobile": "...",
          "email": "...",
          "aadhaar": "...",
          "address": "...",
          "state": "...",
          "district": "...",
          "taluka": "...",
          "village": "...",
          "land_area": 1.5,
          "land_unit": "acre",
          "soil_type": "loamy",
          "ownership": "owned",
          "bank_name": "...",
          "account_number": "...",
          "ifsc": "...",
          "documents": [1,2]   # optional, M2M document ids depending on serializer
        }
    """
    # -----------------------
    # GET -> list applications
    # -----------------------
    if request.method == 'GET':
        qs = SubsidyApplication.objects.filter(user=request.user).select_related('subsidy').order_by('-submitted_at', '-id')
        out = []
        for app in qs:
            subsidy = getattr(app, 'subsidy', None)
            out.append({
                "id": app.id,
                "application_id": getattr(app, 'application_id', None) or f"APP{app.id:06}",
                "subsidy_id": getattr(subsidy, 'id', None),
                "subsidy_name": getattr(subsidy, 'title', None) or getattr(subsidy, 'name', None) or "Untitled Subsidy",
                # prefer application amount (if you store approved/expected amount on application),
                # otherwise fall back to subsidy.amount if it exists on Subsidy model
                "amount": getattr(app, 'amount', None) if hasattr(app, 'amount') and app.amount is not None else getattr(subsidy, 'amount', None),
                "status": getattr(app, 'status', "Pending"),
                "applied_on": app.submitted_at.isoformat() if getattr(app, 'submitted_at', None) else None,
            })
        return Response(out, status=status.HTTP_200_OK)

    # ------------------------
    # POST -> create an application
    # ------------------------
    if request.method == 'POST':
        # Prevent client from setting user field
        data = request.data.copy() if hasattr(request, 'data') else {}
        data.pop('user', None)
        # If your serializer expects "subsidy_id" instead of "subsidy", adapt accordingly.
        # Here we assume serializer expects "subsidy" FK field.
        serializer = SubsidyApplicationSerializer(data=data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # enforce server-side user association
            app = serializer.save(user=request.user)
        except IntegrityError as e:
            # likely unique_together ('user','subsidy') violation or other DB constraint
            return Response({"detail": "You have already applied for this subsidy or integrity error occurred."},
                            status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"Failed to create application: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Build response in the same frontend-friendly shape as GET
        subsidy = getattr(app, 'subsidy', None)
        result = {
            "id": app.id,
            "application_id": getattr(app, 'application_id', None) or f"APP{app.id:06}",
            "subsidy_id": getattr(subsidy, 'id', None),
            "subsidy_name": getattr(subsidy, 'title', None) or getattr(subsidy, 'name', None) or "Untitled Subsidy",
            "amount": getattr(app, 'amount', None) if hasattr(app, 'amount') and app.amount is not None else getattr(subsidy, 'amount', None),
            "status": getattr(app, 'status', "Pending"),
            "applied_on": app.submitted_at.isoformat() if getattr(app, 'submitted_at', None) else timezone.now().isoformat(),
        }
        return Response(result, status=status.HTTP_201_CREATED)
