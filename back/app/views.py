from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings

# Create your views here.
def index(request):
    print(settings.TWILIO_ACCOUNT_SID)
    return render(request, "index.html")