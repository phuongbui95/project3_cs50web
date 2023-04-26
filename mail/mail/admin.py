from django.contrib import admin
from .models import User, Email
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ("id","email","username")

class EmailAdmin(admin.ModelAdmin):
    list_display = ("id","sender","subject","body","timestamp","read","archived")

admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)
