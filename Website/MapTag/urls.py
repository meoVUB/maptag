"""
URL configuration for MapTag project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path
from Home import views as home_views
from User import views as user_views
from Game import views as game_views


urlpatterns = [
    path('', home_views.home, name='home'),
    path('register', user_views.register, name="register"),
    path('log_in', user_views.log_in, name="log_in"),
    path('log_out', user_views.log_out, name="log_out"),
    path('mygames', user_views.mygames, name="mygames"),
    path('mygames/create_game', user_views.create_game, name="create_game"),
    path('game', game_views.game, name="game"),
    path('gameselection', game_views.gameselection, name="gameselection"),
    path('custom_games', game_views.custom_games, name="custom_games"),
    re_path(r'^custom_game/(?P<game_id>[\w-]+)/$', game_views.custom_game_detail, name='custom_game_detail'),
    path("admin/", admin.site.urls),
]