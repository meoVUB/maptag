from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from django.http import JsonResponse
from .models import CustomGame, Location  
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

# Create your views here.
def game(request):
    return render(request, "game.html")

def gameselection(request):
    return render(request, "gameselection.html")

def custom_games(request):
    game_list = CustomGame.objects.all()
    paginator = Paginator(game_list, 5)  # Split game list into pages of 5
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)  # Get current page
    context = {
        'all_games': game_list,
        'current_games': page_obj,
    }
    return render(request, "custom_games.html", context)

def custom_game_detail(request, game_id):
    game = get_object_or_404(CustomGame, pk=game_id)
    return render(request, 'custom_game_detail.html', {'game': game})