from django.conf import settings
from django.db import models
from django.utils import timezone
from cloudinary.models import CloudinaryField


class Subsidy(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    eligibility = models.JSONField(default=list, blank=True)
    documents_required = models.JSONField(default=list, blank=True)
    application_start_date = models.DateField(blank=True, null=True)
    application_end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name_plural = "Subsidies"


class SubsidyApplication(models.Model):
    STATUS_SUBMITTED = "submitted"
    STATUS_UNDER_REVIEW = "under_review"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"

    DOCUMENT_PENDING = "pending"
    DOCUMENT_VERIFIED = "verified"
    DOCUMENT_REJECTED = "rejected"

    STATUS_CHOICES = [
        (STATUS_SUBMITTED, "Submitted"),
        (STATUS_UNDER_REVIEW, "Under Review"),
        (STATUS_APPROVED, "Approved"),
        (STATUS_REJECTED, "Rejected"),
    ]

    DOCUMENT_STATUS_CHOICES = [
        (DOCUMENT_PENDING, "Pending"),
        (DOCUMENT_VERIFIED, "Verified"),
        (DOCUMENT_REJECTED, "Rejected"),
    ]

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subsidy_applications",
    )
    subsidy = models.ForeignKey(
        Subsidy,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    assigned_officer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_subsidy_applications",
        limit_choices_to={"role": "officer"},
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_SUBMITTED,
    )
    document_status = models.CharField(
        max_length=20,
        choices=DOCUMENT_STATUS_CHOICES,
        default=DOCUMENT_PENDING,
    )
    application_note = models.TextField(blank=True)
    officer_note = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
    document_verified_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-submitted_at"]
        unique_together = ("applicant", "subsidy")

    def __str__(self):
        return f"{self.subsidy.title} - {self.applicant.full_name}"

    def mark_under_review(self, officer=None, note=""):
        self.status = self.STATUS_UNDER_REVIEW
        if officer is not None:
            self.assigned_officer = officer
        if note:
            self.officer_note = note

    def mark_approved(self, officer=None, note=""):
        self.status = self.STATUS_APPROVED
        self.approved_at = timezone.now()
        self.rejected_at = None
        if officer is not None:
            self.assigned_officer = officer
        if note:
            self.officer_note = note

    def mark_rejected(self, officer=None, note=""):
        self.status = self.STATUS_REJECTED
        self.rejected_at = timezone.now()
        self.approved_at = None
        self.document_status = self.DOCUMENT_REJECTED
        if officer is not None:
            self.assigned_officer = officer
        if note:
            self.officer_note = note

    def mark_documents_verified(self, officer=None, note="", verified=True):
        self.document_status = (
            self.DOCUMENT_VERIFIED if verified else self.DOCUMENT_REJECTED
        )
        self.document_verified_at = timezone.now() if verified else None
        if officer is not None:
            self.assigned_officer = officer
        if note:
            self.officer_note = note


class ApplicationDocument(models.Model):
    application = models.ForeignKey(
        SubsidyApplication,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_type = models.CharField(max_length=100)
    file = CloudinaryField("document", resource_type="auto")
    verified = models.BooleanField(default=False)
    verification_note = models.TextField(blank=True)
    verified_at = models.DateTimeField(blank=True, null=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_documents",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.document_type} - {self.application}"

    def mark_verified(self, officer, note="", verified=True):
        self.verified = bool(verified)
        self.verified_at = timezone.now()
        self.verified_by = officer
        if note:
            self.verification_note = note
