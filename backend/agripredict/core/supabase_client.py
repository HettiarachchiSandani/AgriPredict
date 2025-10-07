from supabase import create_client
from django.conf import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def login_user(email, password):

    try:
        user = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return user
    except Exception as e:
        print("Login failed:", e)
        return None

def get_user_by_email(email):
    
    data = supabase.table("User").select("*").eq("email", email).execute()
    if data.data:
        return data.data[0]
    return None
