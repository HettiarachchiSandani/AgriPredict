from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role and request.user.role.roleid == "A002")


class IsManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role and request.user.role.roleid == "A003")


class IsBuyer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role and request.user.role.roleid == "B001")


class IsOwnerOrManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.role
            and request.user.role.roleid in ["A002", "A003"]
        )