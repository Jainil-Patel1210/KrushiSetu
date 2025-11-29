#!/usr/bin/env python
"""
Test script to verify login/signup functionality fixes.
Run with: python manage.py shell < test_login_signup.py
Or use: python manage.py test loginSignup
"""
from django.contrib.auth import get_user_model
from django.test import TestCase, Client
from django.urls import reverse
import json

User = get_user_model()

def test_signup_flow():
    """Test the complete signup flow"""
    client = Client()
    
    print("\n=== Testing Signup Flow ===")
    
    # Step 1: Signup
    signup_data = {
        "full_name": "Test User",
        "email_address": "test@example.com",
        "mobile_number": "+1234567890",
        "password": "testpass123",
        "confirm_password": "testpass123",
        "aadhaar_number": "123456789012"
    }
    
    response = client.post('/api/signup/', data=json.dumps(signup_data), 
                          content_type='application/json')
    print(f"1. Signup Response: {response.status_code}")
    print(f"   Data: {response.json()}")
    
    if response.status_code == 201:
        user_id = response.json().get('user_id')
        print(f"   ✓ User created with ID: {user_id}")
        
        # Verify user is inactive
        user = User.objects.get(id=user_id)
        assert not user.is_active, "User should be inactive after signup"
        print("   ✓ User is inactive (expected)")
        
        return user_id, signup_data['email_address']
    
    return None, None

def test_login_with_inactive_user():
    """Test login with inactive user should fail"""
    client = Client()
    
    print("\n=== Testing Login with Inactive User ===")
    
    # Try to login with inactive user
    login_data = {
        "email_address": "test@example.com",
        "password": "testpass123",
        "role": "farmer"
    }
    
    response = client.post('/api/token/', data=json.dumps(login_data),
                          content_type='application/json')
    print(f"Login Response: {response.status_code}")
    print(f"Data: {response.json()}")
    
    if response.status_code == 403:
        print("   ✓ Correctly rejected inactive user")
        assert "not activated" in response.json().get('error', '').lower()
        return True
    else:
        print("   ✗ Should have rejected inactive user with 403")
        return False

def test_cookie_settings():
    """Test cookie secure flag setting"""
    from django.conf import settings
    from loginSignup.views import get_secure_cookie
    
    print("\n=== Testing Cookie Settings ===")
    secure = get_secure_cookie()
    print(f"DEBUG setting: {settings.DEBUG}")
    print(f"Secure cookie flag: {secure}")
    print(f"Expected: {not settings.DEBUG}")
    
    if secure == (not settings.DEBUG):
        print("   ✓ Cookie secure flag is correct")
        return True
    else:
        print("   ✗ Cookie secure flag mismatch")
        return False

def run_quick_checks():
    """Run quick verification checks"""
    print("\n" + "="*60)
    print("QUICK VERIFICATION CHECKS")
    print("="*60)
    
    # Check 1: Cookie function exists
    try:
        from loginSignup.views import get_secure_cookie
        print("✓ get_secure_cookie() function exists")
    except ImportError as e:
        print(f"✗ Missing get_secure_cookie: {e}")
        return
    
    # Check 2: is_active check in login
    import inspect
    from loginSignup.views import CustomTokenObtainPairView
    
    source = inspect.getsource(CustomTokenObtainPairView.post)
    if 'is_active' in source:
        print("✓ is_active check present in login")
    else:
        print("✗ is_active check missing in login")
    
    # Check 3: Cookie secure flag usage
    from loginSignup.views import CustomTokenObtainPairView
    source = inspect.getsource(CustomTokenObtainPairView.post)
    if 'secure_cookie' in source or 'get_secure_cookie' in source:
        print("✓ Dynamic secure cookie flag used in login")
    else:
        print("✗ Static secure=True still in login")
    
    # Check 4: verify_mobile_otp error handling
    from loginSignup.views import verify_mobile_otp
    source = inspect.getsource(verify_mobile_otp)
    if 'user_id' in source and 'int(user_id)' in source or 'int(' in source:
        print("✓ verify_mobile_otp has user_id validation")
    else:
        print("⚠ verify_mobile_otp might need user_id validation")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    print("\n" + "="*60)
    print("LOGIN/SIGNUP FIXES VERIFICATION")
    print("="*60)
    
    run_quick_checks()
    
    # Note: Full tests require Django test environment
    print("\nFor full testing, run:")
    print("  python manage.py test loginSignup")

