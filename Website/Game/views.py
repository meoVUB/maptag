from django.shortcuts import render
from django.http import JsonResponse
from .models import CustomGame, Location  
from django.core import serializers
from django.shortcuts import get_object_or_404
import json

def get_game(request, game_id):
    game = CustomGame.objects.get(id=game_id)
    serialized_game = serializers.serialize('json', [game])
    return JsonResponse({'game': serialized_game}, safe=False)

def get_locations_for_game(request, game_id): 
    custom_game = get_object_or_404(CustomGame, id=game_id)
    locations = Location.objects.filter(custom_game=custom_game)
    serialized_locations = serializers.serialize('json', locations)
    print(json.loads(serialized_locations))
    return JsonResponse({'locations': serialized_locations}, safe=False)

# Create your views here.
def game(request):
    return render(request, "game.html")

def gameselection(request):
    return render(request, "gameselection.html")