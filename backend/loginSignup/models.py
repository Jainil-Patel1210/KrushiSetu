from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
    def create_user(self, full_name, mobile_email, password=None, aadhaar_number=None):
        if not mobile_email:
            raise ValueError("User must provide Mobile number or Email")
        user = self.model(
            full_name=full_name,
            mobile_email=mobile_email,
            aadhaar_number=aadhaar_number,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, full_name, mobile_email, password=None):
        user = self.create_user(full_name, mobile_email, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class CustomUser(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=100)
    mobile_email = models.CharField(max_length=100, unique=True)
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "mobile_email"
    REQUIRED_FIELDS = ["full_name"]

    def __str__(self):
        return self.full_name
