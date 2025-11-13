from django.db import models
from django.utils import timezone
from datetime import date


class SubsidyApplication(models.Model):
    STATUS_CHOICES = [
        ('Under Review', 'Under Review'),
        ('Approved', 'Approved'),
        ('Pending', 'Pending'),
    ]

    # Existing
    subsidy_name = models.CharField(max_length=150)
    full_name = models.CharField(max_length=100)
    mobile_number = models.CharField(max_length=15)
    email = models.EmailField()
    aadhar_number = models.CharField(max_length=12)
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    taluka = models.CharField(max_length=50)
    village = models.CharField(max_length=50)
    address = models.TextField()

    # Step 2 — Land Info
    land_area = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True)
    land_area_unit = models.CharField(max_length=50, null=True, blank=True)
    soil_type = models.CharField(max_length=50, null=True, blank=True)
    ownership_type = models.CharField(max_length=50, null=True, blank=True)

    # Step 3 — Bank Info
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)
    account_number = models.CharField(max_length=30, null=True, blank=True)

    # Step 4 — Documents (optional)
    uploaded_documents = models.FileField(
        upload_to='documents/', null=True, blank=True)

    # System fields
    application_id = models.CharField(max_length=20, unique=True)
    date_applied = models.DateField(auto_now_add=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='Under Review')

    def save(self, *args, **kwargs):
        if not self.application_id:
            last = SubsidyApplication.objects.all().order_by('id').last()
            next_id = 1 if not last else last.id + 1
            self.application_id = f"APP{timezone.now().year}{next_id:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.subsidy_name} - {self.full_name}"
