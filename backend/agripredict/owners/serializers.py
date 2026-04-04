from rest_framework import serializers
from .models import Owner, Manager
from core.serializers import UserSerializer

class OwnerSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='userid', read_only=True)

    class Meta:
        model = Owner
        fields = ['ownerid', 'userid', 'farmname', 'address', 'user_details']
        read_only_fields = ('ownerid', 'userid')

class ManagerSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='userid', read_only=True)

    class Meta:
        model = Manager
        fields = ['managerid', 'userid', 'user_details']
        read_only_fields = ('managerid', 'userid')