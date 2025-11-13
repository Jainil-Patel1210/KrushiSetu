from rest_framework import permissions


def _user_role(user):
    return getattr(user, "role", None)


class IsOfficerOrAdmin(permissions.BasePermission):
    message = "Officer or admin access required."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        role = _user_role(request.user)
        return role in {"officer", "admin"} or request.user.is_staff or request.user.is_superuser

    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class IsApplicantOfficerOrAdmin(permissions.BasePermission):
    message = "Limited to the applicant or an authorized officer."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(request.user, "is_staff", False) or getattr(request.user, "is_superuser", False):
            return True

        role = _user_role(request.user)
        if role in {"officer", "admin"}:
            return True

        return getattr(obj, "applicant_id", None) == request.user.id

