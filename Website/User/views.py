from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.utils import timezone
from django.http import HttpResponseBadRequest, JsonResponse
from Game.models import CustomGame, Location
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

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
            return redirect('home')
        if pass1 != pass2:
            messages.error(request, "Passwords do not match!")
            return redirect('home')
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
            return render(request, "home.html")

        else:
            messages.error(request, "Bad Credentials!")
            return redirect('home')


    return render(request, "authentication/login.html")

def log_out(request):
    logout(request)
    return redirect('home')

def mygames(request):
    if request.user.is_authenticated:
        return render(request, "profile/mygames.html")
    else:
        return redirect('home')
    
def myaccount(request):
    if request.user.is_authenticated:
        return render(request, "profile/myaccount.html")
    else:
        return redirect('home')
    
def update_account_details(request):
    if request.method == 'POST':
        # Get the user and the submitted data
        user = request.user
        username = request.POST.get('username')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        email = request.POST.get('email')

        # Server-side validation
        if not username or not first_name or not last_name or not email:
            return JsonResponse({'success': False, 'error': 'All fields are required.'})

        # Validate email
        try:
            validate_email(email)
        except ValidationError:
            return JsonResponse({'success': False, 'error': 'Invalid email address.'})

        # Update user details
        user.username = username
        user.first_name = first_name
        user.last_name = last_name
        user.email = email
        user.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
def create_game(request):
    if request.method == 'POST':
        creator_username = request.user.username if request.user.is_authenticated else None
        mapTitle = request.POST.get('mapTitle', '').strip()
        canMove = request.POST.get('canMove', '').strip()
        scoreCalc = request.POST.get('scoreCalc', '').strip()
        timerActive = request.POST.get('timerActive', '').strip()
        timerDuration = request.POST.get('timerDuration', '').strip()
        mapDescription = request.POST.get('mapDescription', '').strip()

        # Validate required fields
        if not all([mapTitle, canMove, scoreCalc, timerActive, mapDescription]):
            return HttpResponseBadRequest("Please fill in all required fields.")

        # If Timer is set to "Yes," ensure Timer Duration is filled
        if timerActive == 'yes' and not timerDuration:
            return HttpResponseBadRequest("Please fill the Timer Duration.")

        # Validate timer duration range
        if timerDuration and int(timerDuration) > 600:
            return HttpResponseBadRequest("Timer duration cannot exceed 10 minutes.")

        # Validate difficulty level
        valid_difficulty_levels = ['Impossible', 'Very Hard', 'Hard', 'Normal', 'Easy']
        if scoreCalc not in valid_difficulty_levels:
            return HttpResponseBadRequest("Invalid difficulty level.")

        print("Creating CustomGame instance...")
        # Create CustomGame instance
        custom_game = CustomGame.objects.create(
            creator = creator_username,
            map_title = mapTitle,
            mobility = (canMove == 'yes'),
            difficulty = scoreCalc,
            timer_status = (timerActive == 'yes'),
            timer_duration = int(timerDuration) if timerDuration else None,
            map_description = mapDescription
        )
        print("CustomGame instance created.")
        # Collect coordinates dynamically
        latitudes = []
        longitudes = []
        location_index = 1

        while True:
            lat_key = f'lat{location_index}'
            lon_key = f'long{location_index}'

            if lat_key in request.POST and lon_key in request.POST:
                latitudes.append(request.POST[lat_key])
                longitudes.append(request.POST[lon_key])
                location_index += 1
            else:
                break

        # Validate coordinate values
        for lat, lon in zip(latitudes, longitudes):
            try:
                lat, lon = float(lat), float(lon)
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    return HttpResponseBadRequest("Invalid coordinates.")
            except ValueError:
                return HttpResponseBadRequest("Invalid coordinate values.")

        print(latitudes)
        print(longitudes)
        # Create Location instances
        for lat, lon in zip(latitudes, longitudes):
            Location.objects.create(custom_game=custom_game, latitude=lat, longitude=lon)
        print("Location instances created.")
        
        return redirect ('mygames')
    return render(request, "mygames.html")