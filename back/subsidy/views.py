from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import SubsidyApplicationSerializer, DocumentSerializer, OfficerReviewSerializer, OfficerSubsidyApplicationSerializer
from .models import SubsidyApplication, Document
from django.utils import timezone


# Upload single document (multipart/form-data)
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])  # OK to keep; parsers ignored for GET
def upload_document(request):
    if request.method == 'GET':
        # return documents for the current user (or change to all() if you want)
        qs = Document.objects.filter(owner=request.user).order_by('-uploaded_at')
        serializer = DocumentSerializer(qs, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # POST -> create a new Document (multipart/form-data expected)
    serializer = DocumentSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        doc = serializer.save(owner=request.user)  # pass owner if serializer doesn't set it
        return Response(DocumentSerializer(doc, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def apply_subsidy(request):

    if request.method == 'GET':
        apps = SubsidyApplication.objects.filter(
            user=request.user
        ).select_related('subsidy').prefetch_related('documents')

        out = []
        for app in apps:
            out.append({
                "id": app.id,
                "application_id": app.application_id,
                "subsidy_id": app.subsidy.id,
                "subsidy_name": app.subsidy.title,
                "amount":app.subsidy.amount,
                "status": app.status,
                "applied_on": app.submitted_at.isoformat(),
            })

        return Response(out, status=200)

    # POST
    data = request.data.copy()
    data.pop("user", None)  # Prevent frontend overwriting

    serializer = SubsidyApplicationSerializer(
        data=data,
        context={"request": request}
    )

    if serializer.is_valid():
        app = serializer.save()
        return Response(
            {"message": "Application submitted", "application_id": app.application_id},
            status=201
        )

    return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_officer(request, app_id):
    if request.user.role != "admin":
        return Response({"detail": "Not allowed"}, status=403)

    officer_id = request.data.get("officer_id")

    try:
        app = SubsidyApplication.objects.get(id=app_id)
    except SubsidyApplication.DoesNotExist:
        return Response({"detail": "Application not found"}, status=404)

    try:
        officer = User.objects.get(id=officer_id, role="officer")
    except User.DoesNotExist:
        return Response({"detail": "Invalid officer"}, status=400)

    app.assigned_officer = officer
    app.status = "Under Review"
    app.save()

    return Response({"message": "Officer assigned successfully"}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def officer_dashboard(request):
    if request.user.role != "officer":
        return Response({"detail": "Not allowed"}, status=403)

    apps = SubsidyApplication.objects.filter(
        assigned_officer=request.user
    ).select_related('subsidy')

    serializer = OfficerSubsidyApplicationSerializer(apps, many=True)
    return Response(serializer.data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def review_application(request, app_id):
    if request.user.role != "officer":
        return Response({"detail": "Not allowed"}, status=403)

    try:
        app = SubsidyApplication.objects.get(
            id=app_id,
            assigned_officer=request.user
        )
    except SubsidyApplication.DoesNotExist:
        return Response({"detail": "Not found or not assigned to you"}, status=404)

    serializer = OfficerReviewSerializer(app, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        app.reviewed_at = timezone.now()
        app.save()
        return Response({"message": "Application updated", "status": app.status})

    return Response(serializer.errors, status=400)


