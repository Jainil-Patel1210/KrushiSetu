from rest_framework import permissions


def _is_authenticated(user):
    return bool(user and user.is_authenticated)


def _user_is_staff_like(user):
    return getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)


def user_is_officer_or_admin(user):
    role = getattr(user, "role", None)
    return role in {"officer", "admin"} or _user_is_staff_like(user)


def user_is_applicant_or_officer(user, obj):
    if not _is_authenticated(user):
        return False
    if _user_is_staff_like(user):
        return True
    if user_is_officer_or_admin(user):
        return True
    applicant_id = getattr(obj, "applicant_id", None)
    return applicant_id == getattr(user, "id", None)


class IsOfficerOrAdmin(permissions.BasePermission):
    message = "Officer or admin access required."

    def has_permission(self, request, view):
        return _is_authenticated(request.user) and user_is_officer_or_admin(request.user)

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsApplicantOfficerOrAdmin(permissions.BasePermission):
    message = "Limited to the applicant or an authorized officer."

    def has_permission(self, request, view):
        return _is_authenticated(request.user)

    def has_object_permission(self, request, view, obj):
        return user_is_applicant_or_officer(request.user, obj)

