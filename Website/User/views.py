from django.shortcuts import get_object_or_404, redirect, render
from django.http import HttpResponse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.utils import timezone
from django.http import HttpResponseBadRequest, JsonResponse
from Game.models import CustomGame, Location
from .models import Report, Feature, Friendship
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

        return redirect('home')
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
        user_games = CustomGame.objects.filter(creator=request.user.username)
        context = {
            'my_games': user_games
        }
        return render(request, "mygames.html", context)
    else:
        return redirect('home')
    
    
def myaccount(request):
    if request.user.is_authenticated:
        return render(request, "myaccount.html")
    else:
        return redirect('home')
    
def myfriends(request):
    if request.user.is_authenticated:
        user = request.user

        sent_friendships = Friendship.objects.filter(sender=user, status='accepted')
        received_friendships = Friendship.objects.filter(receiver=user, status='accepted')
        
        blocked_requests = Friendship.objects.filter(receiver=user, status='blocked')

        received_requests = Friendship.objects.filter(receiver=user, status='pending')
        sent_requests = Friendship.objects.filter(sender=user, status='pending')

        context = {'sent_friends': sent_friendships,
                   'received_friends': received_friendships,
                   'blocked_requests': blocked_requests,
                   'received_requests': received_requests,
                   'sent_requests': sent_requests}
        
        return render(request, 'myfriends.html', context)
    else:
        return redirect('home')
    
def send_friend_request(request):
    if request.method == 'POST':
        friend_username = request.POST.get('friendUsername', None)

        if not friend_username:
            return HttpResponseBadRequest("Friend's username is required.")

        try:
            receiver = User.objects.get(username=friend_username)
        except:
            return HttpResponseBadRequest("User doesn't exist.")
        
        # Check if a friendship object already exists
        friendship1 = Friendship.objects.filter(sender=request.user, receiver=receiver).first()
        friendship2 = Friendship.objects.filter(sender=receiver, receiver=request.user).first()

        friendship = friendship1 if friendship1 else friendship2
        
        if friendship:
            # Check the status of the existing friendship
            if friendship.status == 'pending':
                return HttpResponseBadRequest("Request already sent.")
            elif friendship.status == 'accepted':
                return HttpResponseBadRequest("User is already a friend.")
            elif friendship.status == 'blocked':
                return HttpResponseBadRequest("You are blocked from sending this user requests.")
        else:
            # Create a new friendship object if it doesn't exist
            Friendship.objects.create(sender=request.user, receiver=receiver)

        return redirect('myfriends')
    
def cancel_friend_request(request, friendship_id):
    friendship = Friendship.objects.get(id=friendship_id)

    # Ensure that the request user is the sender of the friend request
    if request.user == friendship.sender:
        friendship.delete()

    return redirect('myfriends')
    
def accept_friend_request(request, friendship_id):
    friendship = Friendship.objects.get(id=friendship_id)

    # Ensure that the request user is the receiver of the friend request
    if request.user == friendship.receiver:
        friendship.status = 'accepted'
        friendship.save()

    return redirect('myfriends')

def deny_friend_request(request, friendship_id):
    friendship = Friendship.objects.get(id=friendship_id)

    # Ensure that the request user is the receiver of the friend request
    if request.user == friendship.receiver:
        friendship.delete()
        
    return redirect('myfriends')

def block_friend_request(request, friendship_id):
    friendship = Friendship.objects.get(id=friendship_id)

    # Ensure that the request user is the receiver of the friend request
    if request.user == friendship.receiver:
        friendship.status = 'blocked'
        friendship.save()

    return redirect('myfriends')

def unblock_friend_request(request, friendship_id):
    friendship = Friendship.objects.get(id=friendship_id)

    # Ensure that the request user is the blocker of the friend request
    if request.user == friendship.receiver:
        friendship.status = 'pending'
        friendship.save()

    return redirect('myfriends')

def remove_friend(request, friendship_id):
    friendship = Friendship.objects.get(id=friendship_id)

    friendship.delete()
        
    return redirect('myfriends')
    
def update_account_details(request):
    if request.user.is_authenticated:
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

        # Validate username
        if len(username) > 10:
            return JsonResponse({'success': False, 'error': 'Username must be under 10 characters.'})
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
    else:
        return redirect('home')

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

def edit_game(request, game_id):
    game = get_object_or_404(CustomGame, id=game_id)
    context = {'game': game}
    return render(request, 'edit_game.html', context)

def delete_game(request, game_id):
    game = get_object_or_404(CustomGame, id=game_id)
    game.delete()
    return redirect('mygames')

def update_game(request, game_id):
    if request.method == 'POST':
        game = get_object_or_404(CustomGame, id=game_id)
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
        
        # Update CustomGame instance
        game.map_title = mapTitle
        game.mobility = canMove == 'yes'
        game.difficulty = scoreCalc
        game.timer_status = timerActive == 'yes'
        game.timer_duration = int(timerDuration) if timerDuration else None
        game.map_description = mapDescription
        game.save()

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

        # Validate and create Location instances
        for lat, lon in zip(latitudes, longitudes):
            try:
                lat, lon = float(lat), float(lon)
                if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
                    return HttpResponseBadRequest("Invalid coordinates.")
                Location.objects.create(custom_game=game, latitude=lat, longitude=lon)
            except ValueError:
                return HttpResponseBadRequest("Invalid coordinate values.")

        return redirect('mygames')

def report_bug(request):
    print("report_bug view called.")
    if request.method == 'POST':
        bug_description = request.POST.get('description', '').strip()

        # Validate required fields
        if not bug_description:
            return HttpResponseBadRequest("Please fill in the bug description.")

        print("Creating Report instance...")
        # Create Report instance
        report = Report.objects.create(description=bug_description)
        print("Report instance created.")

        return redirect('home')

    return redirect('home')

def request_feature(request):
    print("request_feature view called.")
    if request.method == 'POST':
        request_description = request.POST.get('description', '').strip()

        # Validate required fields
        if not request_description:
            return HttpResponseBadRequest("Please fill in the request description.")

        print("Creating Request instance...")
        # Create Request instance
        report = Feature.objects.create(description=request_description)
        print("Request instance created.")

        return redirect('home')

    return redirect('home')