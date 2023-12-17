from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages

def register(request):
    if request.method == "POST":
        username = request.POST['username']
        fname = request.POST['fname']
        lname = request.POST['lname']
        email = request.POST['email']
        pass1 = request.POST['pass1']
        pass2 = request.POST['pass2']

        if User.objects.filter(username=username):
            messages.error(request, "Username already exists!")
            return redirect('home')
        if User.objects.filter(email=email):
            messages.error(request, "Email already registered!")
            return redirect('home')
        if len(username) > 10:
            messages.error(request, "Username must be under 10 characters!")
        if pass1 != pass2:
            messages.error(request, "Passwords do not match!")
        if not username.isalnum():
            messages.error(request, "Username must be Alpha-Numeric!")
            return redirect('home')

        myuser = User.objects.create_user(username, email, pass1)
        myuser.first_name = fname
        myuser.last_name = lname
        myuser.save()
        messages.success(request, "Your account has been successfully created.")

        return redirect('log_in')
    return render(request, "authentication/register.html")

def log_in(request):
    if request.method == "POST":
        username = request.POST['username']
        pass1 = request.POST['pass1']

        user = authenticate(username=username, password=pass1)

        if user is not None:
            login(request, user)
            fname = user.first_name
            return render(request, "home.html", {'fname': fname})

        else:
            messages.error(request, "Bad Credentials!")
            return redirect('home')


    return render(request, "authentication/login.html")

def log_out(request):
    logout(request)
    return redirect('home')

def mygames(request):
    if request.user.is_authenticated:
        fname = request.user.first_name
        return render(request, "profile/mygames.html", {'fname' : fname})
    else:
        return redirect('home') 