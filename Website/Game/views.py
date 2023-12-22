from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import CustomGame, Location, Rating
from django.core import serializers
import json

def get_game(request, game_id):
    game = CustomGame.objects.get(id=game_id)
    serialized_game = serializers.serialize('json', [game])
    return JsonResponse({'game': serialized_game}, safe=False)

def get_locations_for_game(request, game_id):
    custom_game = get_object_or_404(CustomGame, id=game_id)
    locations = Location.objects.filter(custom_game=custom_game)
    serialized_locations = serializers.serialize('json', locations)
    return JsonResponse({'locations': serialized_locations}, safe=False)

def game(request):
    if request.user.is_authenticated:
        return render(request, "game.html")
    else:
        return redirect('home')

def gameselection(request):
    if request.user.is_authenticated:
        return render(request, "gameselection.html")
    else:
        return redirect('home')

def custom_games(request):
    if request.user.is_authenticated:
        game_list = CustomGame.objects.all()
        paginator = Paginator(game_list, 5)
        page_number = request.GET.get('page')
        page_obj = paginator.get_page(page_number)
        context = {
            'all_games': game_list,
            'current_games': page_obj,
        }
        return render(request, "custom_games.html", context)
    else:
        return redirect('home')
    
def custom_game_detail(request, game_id):
    if request.user.is_authenticated:
        game = get_object_or_404(CustomGame, pk=game_id)
        return render(request, 'custom_game_detail.html', {'game': game})
    else:
        return redirect('home')

def rate_game(request, game_id, action):
    game = get_object_or_404(CustomGame, id=game_id)
    user = request.user

    existing_rating = Rating.objects.filter(user=user, game=game).first()

    if existing_rating:
        old_rating = existing_rating.rating
        if old_rating and action == 'dislike':
            game.likes -= 1
            game.dislikes += 1
            existing_rating.rating = (action == 'like')
            existing_rating.save()
        elif not old_rating and action == 'like':
            game.dislikes -= 1
            game.likes += 1
            existing_rating.rating = (action == 'like')
            existing_rating.save()
        elif old_rating and action == 'like':
            game.likes -= 1
            existing_rating.delete()
        elif not old_rating and action == 'dislike':
            game.dislikes -= 1
            existing_rating.delete()
    
    else:
        Rating.objects.create(user=user, game=game, rating=(action == 'like'))
        if action == 'like':
            game.likes += 1
        elif action == 'dislike':
            game.dislikes += 1
    
    game.save()

    return JsonResponse({'id': game.id, 'action': action, 'likes': game.likes, 'dislikes': game.dislikes})