from django.shortcuts import render
from django.http import JsonResponse
from .models import CustomGame
from django.core import serializers

def get_game(request, game_id):
    game = CustomGame.objects.get(id=game_id)
    serialized_game = serializers.serialize('json', [game])
    return JsonResponse({'game': serialized_game}, safe=False)

# Create your views here.
def game(request):
    return render(request, "game.html")

def gameselection(request):
    return render(request, "gameselection.html")