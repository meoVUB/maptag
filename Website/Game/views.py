from django.shortcuts import render, get_object_or_404
from django.core.paginator import Paginator
from .models import CustomGame

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
