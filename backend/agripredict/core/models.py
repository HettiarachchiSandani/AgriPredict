from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class Role(models.Model):
    RoleID = models.CharField(max_length=50, primary_key=True)
    RoleName = models.CharField(max_length=50)

    def __str__(self):
        return self.RoleName

class UserManager(BaseUserManager):
    def create_user(self, UserID, FirstName, LastName, RoleID, password=None):
        if not UserID:
            raise ValueError('Users must have a UserID')
        user = self.model(
            UserID=UserID,
            FirstName=FirstName,
            LastName=LastName,
            RoleID=RoleID
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

class User(AbstractBaseUser):
    UserID = models.CharField(max_length=50, primary_key=True)
    FirstName = models.CharField(max_length=100)
    LastName = models.CharField(max_length=100)
    RoleID = models.ForeignKey(Role, on_delete=models.CASCADE)

    objects = UserManager()

    USERNAME_FIELD = 'UserID'
    REQUIRED_FIELDS = ['FirstName', 'LastName', 'RoleID']

    def __str__(self):
        return f'{self.FirstName} {self.LastName}'

class Settings(models.Model):
    settingsid = models.CharField(max_length=50, primary_key=True)
    userid = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    parametername = models.CharField(max_length=100, null=True, blank=True)
    parametervalue = models.CharField(max_length=100, null=True, blank=True)
    updateat = models.DateTimeField(auto_now=True)

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
    userid = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    message = models.TextField()
    type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        null=True,
        blank=True
    )
    createat = models.DateTimeField(auto_now_add=True)
    isread = models.BooleanField(default=False)

    class Meta:
        db_table = 'notifications'

    def __str__(self):
        return f"Notification {self.notificationid} for {self.userid.UserID}"
