from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import SubsidyApplicationSerializer, DocumentSerializer
from .models import SubsidyApplication, Document


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
