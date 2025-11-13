from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import Subsidy, SubsidyApplication, ApplicationDocument

User = get_user_model()


class SubsidySerializer(serializers.ModelSerializer):
    class Meta:
        model = Subsidy
        fields = "__all__"


class ApplicationDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField(read_only=True)
    verified_by_name = serializers.CharField(
        source="verified_by.full_name",
        read_only=True,
    )

    class Meta:
        model = ApplicationDocument
        fields = [
            "id",
            "document_type",
            "file",
            "file_url",
            "verified",
            "verification_note",
            "verified_at",
            "verified_by_name",
            "uploaded_at",
        ]
        extra_kwargs = {
            "file": {"write_only": True},
        }

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None


class SubsidyApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source="applicant.full_name", read_only=True)
    applicant_email = serializers.EmailField(source="applicant.email_address", read_only=True)
    subsidy_title = serializers.CharField(source="subsidy.title", read_only=True)
    assigned_officer_name = serializers.CharField(
        source="assigned_officer.full_name",
        read_only=True,
    )
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    document_status_display = serializers.CharField(
        source="get_document_status_display",
        read_only=True,
    )
    documents = ApplicationDocumentSerializer(many=True, required=False)

    class Meta:
        model = SubsidyApplication
        fields = [
            "id",
            "subsidy",
            "subsidy_title",
            "applicant",
            "applicant_name",
            "applicant_email",
            "assigned_officer",
            "assigned_officer_name",
            "status",
            "status_display",
            "document_status",
            "document_status_display",
            "application_note",
            "officer_note",
            "submitted_at",
            "updated_at",
            "approved_at",
            "rejected_at",
            "document_verified_at",
            "documents",
        ]
        read_only_fields = [
            "applicant",
            "applicant_name",
            "applicant_email",
            "assigned_officer_name",
            "status_display",
            "document_status_display",
            "submitted_at",
            "updated_at",
            "approved_at",
            "rejected_at",
            "document_verified_at",
        ]

    def create(self, validated_data):
        documents_data = validated_data.pop("documents", [])
        request = self.context["request"]
        validated_data["applicant"] = request.user

        with transaction.atomic():
            application = SubsidyApplication.objects.create(**validated_data)
            self._sync_documents(application, documents_data, request.user, allow_verify=False)

        return application

    def update(self, instance, validated_data):
        documents_data = validated_data.pop("documents", None)
        request = self.context["request"]
        role = getattr(request.user, "role", None)

        if role == "farmer":
            for field in ("status", "document_status", "assigned_officer", "officer_note"):
                validated_data.pop(field, None)

        with transaction.atomic():
            instance = super().update(instance, validated_data)

            if documents_data is not None:
                allow_verify = role in {"officer", "admin"}
                self._sync_documents(instance, documents_data, request.user, allow_verify=allow_verify)

        return instance

    def _sync_documents(self, application, documents_data, acting_user, allow_verify):
        if not documents_data:
            return

        user_role = getattr(acting_user, "role", None)
        for doc_payload in documents_data:
            document_id = doc_payload.get("id")

            if document_id:
                document = application.documents.get(id=document_id)

                verified_provided = "verified" in doc_payload
                note_provided = "verification_note" in doc_payload

                if verified_provided or note_provided:
                    if not allow_verify:
                        raise PermissionDenied("Only officers or admins can verify documents.")
                    verified_flag = bool(doc_payload.get("verified", document.verified))
                    note = doc_payload.get("verification_note", document.verification_note)
                    document.mark_verified(
                        officer=acting_user,
                        note=note,
                        verified=verified_flag,
                    )
                    document.save(update_fields=["verified", "verification_note", "verified_at", "verified_by"])

                continue

            if user_role != "farmer" and not allow_verify:
                raise PermissionDenied("Only applicants can upload new documents.")

            try:
                document_type = doc_payload["document_type"]
                file_obj = doc_payload["file"]
            except KeyError as exc:
                raise serializers.ValidationError(
                    "Document uploads require both 'document_type' and 'file'."
                ) from exc

            ApplicationDocument.objects.create(
                application=application,
                document_type=document_type,
                file=file_obj,
            )


class OfficerDecisionSerializer(serializers.Serializer):
    officer_note = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class DocumentVerificationSerializer(serializers.Serializer):
    verified = serializers.BooleanField(required=True)
    officer_note = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class DocumentUploadSerializer(serializers.Serializer):
    document_type = serializers.CharField(max_length=100)
    file = serializers.FileField()
