from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import uuid

# Custom user manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)


class Role(models.Model):
    roleid = models.CharField(max_length=50, primary_key=True)
    rolename = models.CharField(max_length=50)

    class Meta:
        db_table = 'role'

    def __str__(self):
        return self.rolename


class User(AbstractBaseUser):
    userid = models.UUIDField(primary_key=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, db_column='roleid')
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    phonenumber = models.CharField(max_length=50, blank=True, null=True)
    password = models.TextField()
    createat = models.DateTimeField()
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstname', 'lastname']

    class Meta:
        db_table = '"User"'

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.email})"


class Settings(models.Model):
    settingsid = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    parametername = models.CharField(max_length=100, blank=True, null=True)
    parametervalue = models.CharField(max_length=100, blank=True, null=True)
    updateat = models.DateTimeField()

    class Meta:
        db_table = 'settings'

    def __str__(self):
        return f"{self.parametername or 'Setting'} ({self.settingsid})"


class Notifications(models.Model):
    class NotificationType(models.TextChoices):
        INFO = 'INFO', 'Info'
        ALERT = 'ALERT', 'Alert'
        WARNING = 'WARNING', 'Warning'

    notificationid = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    message = models.TextField()
    type = models.CharField(max_length=20, choices=NotificationType.choices, blank=True, null=True)
    createat = models.DateTimeField()
    isread = models.BooleanField(default=False)

    class Meta:
        db_table = 'notifications'

    def __str__(self):
        return f"Notification {self.notificationid} for {self.user.email}"
