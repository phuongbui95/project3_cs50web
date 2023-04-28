from django.contrib import admin
from .models import User, Email
# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ("id","email","username")

class EmailAdmin(admin.ModelAdmin):
    list_display = ("id","sender","subject","body","timestamp","read","archived")
    filter_horizontal = ('recipients',) #present a ManyToManyField in Django Admin Interface

admin.site.register(User, UserAdmin)
admin.site.register(Email, EmailAdmin)
