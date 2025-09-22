import random
from twilio.rest import Client
from django.conf import settings
from decouple import config, Csv

TWILIO_ACCOUNT_SID = config('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = config('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = config('TWILIO_PHONE_NUMBER')

def generate_otp():
    return random.randint(100000, 999999)

otps = {

}

def send_otp_sms(user):
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    otp = generate_otp()  # Implement your OTP generation 
    number = str(user.mobile_number)
    message = client.messages.create(
        body=f"Your OTP is {otp}",
        from_=TWILIO_PHONE_NUMBER,
        to=number,
    )
    otps[number] = otp
    return otp  # Store this OTP securely for later verification

def verify_otp_sms(user, token):
    if str(otps[user.mobile_number]) == str(token):
        return True
    return False

