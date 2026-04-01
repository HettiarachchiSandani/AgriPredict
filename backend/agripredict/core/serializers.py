from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Role, User, Settings, Notifications

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ('roleid',)  

class UserSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.rolename', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    nic = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    dob = serializers.DateField(required=False, allow_null=True)
    roleid = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = '__all__'
        read_only_fields = ('userid', 'createat')

    def create(self, validated_data):
        password = validated_data.pop('password')
        roleid = validated_data.pop('roleid')

        validated_data.setdefault('firstname', 'User')

        role = Role.objects.get(roleid=roleid)
        validated_data['role'] = role

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        roleid = validated_data.pop('roleid', None)

        if roleid:
            try:
                instance.role = Role.objects.get(roleid=roleid)
            except Role.DoesNotExist:
                raise serializers.ValidationError({"roleid": "Invalid roleid"})

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = ['settingsid', 'user', 'sound_enabled', 'updateat']
        read_only_fields = ['user']

class NotificationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifications
        fields = '__all__'
        read_only_fields = ('notificationid', 'createdat')

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        if hasattr(user, "role") and user.role:
            token['role'] = user.role.roleid
        else:
            token['role'] = "buyer" 
        token['email'] = user.email

        return token