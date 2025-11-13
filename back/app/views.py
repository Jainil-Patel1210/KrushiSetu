from django.shortcuts import render
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Subsidy, SubsidyApplication, ApplicationDocument
from .serializers import (
    SubsidySerializer,
    SubsidyApplicationSerializer,
    ApplicationDocumentSerializer,
    OfficerDecisionSerializer,
    DocumentVerificationSerializer,
    DocumentUploadSerializer,
)
from .permissions import IsApplicantOfficerOrAdmin, IsOfficerOrAdmin


BASE_APPLICATION_QS = SubsidyApplication.objects.select_related(
    "subsidy",
    "applicant",
    "assigned_officer",
)


def index(request):
    return render(request, "index.html")


class SubsidyViewSet(viewsets.ModelViewSet):
    queryset = Subsidy.objects.all().order_by("-created_at")
    serializer_class = SubsidySerializer
    permission_classes = [permissions.AllowAny]


class SubsidyApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = SubsidyApplicationSerializer
    permission_classes = [permissions.IsAuthenticated, IsApplicantOfficerOrAdmin]
    parser_classes = [JSONParser, FormParser, MultiPartParser]

    def get_queryset(self):
        queryset = BASE_APPLICATION_QS

        if self.action in {"retrieve", "documents", "mark_under_review", "verify_documents", "approve", "reject"}:
            queryset = queryset.prefetch_related("documents")

        user = self.request.user
        user_role = getattr(user, "role", None)

        if user_role in {"officer", "admin"} or user.is_staff:
            return queryset

        return queryset.filter(applicant=user)

    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated, IsApplicantOfficerOrAdmin],
    )
    def documents(self, request, pk=None):
        application = self.get_object()
        serializer = ApplicationDocumentSerializer(application.documents.all(), many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsApplicantOfficerOrAdmin],
        parser_classes=[FormParser, MultiPartParser],
        url_path="upload-document",
    )
    def upload_document(self, request, pk=None):
        application = self.get_object()
        if application.applicant_id != request.user.id:
            return Response(
                {"detail": "Only the applicant can upload documents."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = DocumentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        document = ApplicationDocument.objects.create(
            application=application,
            document_type=serializer.validated_data["document_type"],
            file=serializer.validated_data["file"],
        )
        application.document_status = SubsidyApplication.DOCUMENT_PENDING
        application.document_verified_at = None
        application.save(update_fields=["document_status", "document_verified_at", "updated_at"])

        return Response(
            ApplicationDocumentSerializer(document).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsOfficerOrAdmin],
        url_path="mark-under-review",
    )
    def mark_under_review(self, request, pk=None):
        application = self.get_object()
        serializer = OfficerDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.mark_under_review(officer=request.user, note=serializer.validated_data.get("officer_note", ""))
        application.save(update_fields=["status", "officer_note", "assigned_officer", "updated_at"])

        return Response(SubsidyApplicationSerializer(application, context={"request": request}).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsOfficerOrAdmin],
        url_path="verify-documents",
    )
    def verify_documents(self, request, pk=None):
        application = self.get_object()
        serializer = DocumentVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.mark_documents_verified(
            officer=request.user,
            note=serializer.validated_data.get("officer_note", ""),
            verified=serializer.validated_data["verified"],
        )
        application.save(update_fields=["document_status", "document_verified_at", "officer_note", "assigned_officer", "updated_at"])

        return Response(SubsidyApplicationSerializer(application, context={"request": request}).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsOfficerOrAdmin],
        url_path="approve",
    )
    def approve(self, request, pk=None):
        application = self.get_object()
        serializer = OfficerDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.mark_approved(
            officer=request.user,
            note=serializer.validated_data.get("officer_note", ""),
        )
        application.save(update_fields=["status", "approved_at", "officer_note", "assigned_officer", "updated_at"])

        return Response(SubsidyApplicationSerializer(application, context={"request": request}).data)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAuthenticated, IsOfficerOrAdmin],
        url_path="reject",
    )
    def reject(self, request, pk=None):
        application = self.get_object()
        serializer = OfficerDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.mark_rejected(
            officer=request.user,
            note=serializer.validated_data.get("officer_note", ""),
        )
        application.save(update_fields=["status", "rejected_at", "document_status", "officer_note", "assigned_officer", "updated_at"])

        return Response(
            SubsidyApplicationSerializer(application, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )