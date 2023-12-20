from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home, name="home"),
    path('signup', views.signup, name="signup"),
    path('signin', views.signin, name="signin"),
    path('signout', views.signout, name="signout"),
    path('mygames', views.mygames, name="mygames"),
    path('myfriends', views.myfriends, name="myfriends"),
    path('game', views.game, name="game"),
    path('gameselection', views.gameselection, name="gameselection"),
]