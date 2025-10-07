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
