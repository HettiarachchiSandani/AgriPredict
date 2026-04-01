from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
import uuid
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings

FIXED_ROLES = [
    ('A001', 'Admin'),
    ('A002', 'Owner'),
    ('A003', 'Manager'),
    ('B001', 'Buyer'),
]

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        
        if password:
            user.set_password(password)
        
        user.save(using=self._db)

        send_mail(
            subject="Welcome to AgriPredict",
            message=f"Hello {user.firstname}, your account has been created.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,  
        )

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role_id', 'A001')  
        return self.create_user(email, password, **extra_fields)

class Role(models.Model):
    roleid = models.CharField(max_length=50, primary_key=True, choices=FIXED_ROLES)
    rolename = models.CharField(max_length=50)

    class Meta:
        db_table = 'role'

    def __str__(self):
        return self.rolename

class User(AbstractBaseUser):
    userid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.ForeignKey(
        'Role',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='roleid'
    )
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(unique=True)
    phonenumber = models.CharField(max_length=50, blank=True, null=True)
    note = models.TextField(blank=True, null=True)
    nic = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    createat = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['firstname']

    class Meta:
        db_table = '"User"'

    def __str__(self):
        return f"{self.firstname} {self.lastname} ({self.email})"

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser
    
    @property
    def id(self):
        return self.userid

class Settings(models.Model):
    settingsid = models.CharField(max_length=50, primary_key=True, editable=False)
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        db_column='userid'
    )

    sound_enabled = models.BooleanField(default=True)
    last_password_change = models.DateTimeField(blank=True, null=True)
    updateat = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'settings'

    def save(self, *args, **kwargs):
        if not self.settingsid:
            import uuid
            self.settingsid = f"SET{uuid.uuid4().hex[:8].upper()}"

        super().save(*args, **kwargs)

class Notifications(models.Model):
    class NotificationType(models.TextChoices):
        INFO = 'INFO', 'Info'
        ALERT = 'ALERT', 'Alert'
        WARNING = 'WARNING', 'Warning'

    notificationid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='userid',
        null=True,
        blank=True
    )
    buyer = models.ForeignKey(
        'orders.Buyer',
        on_delete=models.CASCADE,
        db_column='buyerid',
        null=True,
        blank=True
    )
    message = models.TextField()
    type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        blank=True,
        null=True,
        default=NotificationType.INFO
    )
    createdat = models.DateTimeField(auto_now_add=True)
    isread = models.BooleanField(default=False)
    referenceid = models.UUIDField(null=True, blank=True)

    class Meta:
        db_table = 'notifications'