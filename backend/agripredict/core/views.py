from django.shortcuts import render, redirect
from django.contrib import messages
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()  

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")  
        password = request.POST.get("password")

        response = supabase.table("User") \
            .select("*") \
            .eq("email", username) \
            .eq("passwordhash", password) \
            .execute()

        if response.data and len(response.data) > 0:
            request.session['username'] = username
            return redirect("dashboard")
        else:
            messages.error(request, "Invalid email or password")

    return render(request, "login.html")


def dashboard_view(request):
    if 'username' not in request.session:
        return redirect('login')
    return render(request, "dashboard.html", {"username": request.session['username']})


def logout_view(request):
    request.session.flush()
    return redirect('login')
