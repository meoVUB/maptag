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
    path('report_bug', user_views.report_bug, name="report_bug"),
    path('request_feature', user_views.request_feature, name="request_feature"),
    path('log_in', user_views.log_in, name="log_in"),
    path('log_out', user_views.log_out, name="log_out"),
    path('mygames', user_views.mygames, name="mygames"),
    path('myaccount', user_views.myaccount, name="myaccount"),
    path('myfriends', user_views.myfriends, name="myfriends"),
    path('myfriends/send_friend_request', user_views.send_friend_request, name='send_friend_request'),
    path('myfriends/cancel_friend_request/<int:friendship_id>/', user_views.cancel_friend_request, name='cancel_friend_request'),
    path('myfriends/accept_friend_request/<int:friendship_id>/', user_views.accept_friend_request, name='accept_friend_request'),
    path('myfriends/deny_friend_request/<int:friendship_id>/', user_views.deny_friend_request, name='deny_friend_request'),
    path('myfriends/block_friend_request/<int:friendship_id>/', user_views.block_friend_request, name='block_friend_request'),
    path('myfriends/unblock_friend_request/<int:friendship_id>/', user_views.unblock_friend_request, name='unblock_friend_request'),
    path('myfriends/remove_friend/<int:friendship_id>/', user_views.remove_friend, name='remove_friend'),
    path('update_account_details', user_views.update_account_details, name="update_account_details"),
    path('mygames/create_game', user_views.create_game, name="create_game"),
    path('mygames/edit_game/<uuid:game_id>/', user_views.edit_game, name='edit_game'),
    path('update_game/<uuid:game_id>/', user_views.update_game, name='update_game'),
    path('mygames/delete_game/<uuid:game_id>/', user_views.delete_game, name='delete_game'),
    path('rate_game/<uuid:game_id>/<str:action>/', game_views.rate_game, name='rate_game'),
    path('game', game_views.game, name="game"),
    path('gameselection', game_views.gameselection, name="gameselection"),
    path('custom_games', game_views.custom_games, name="custom_games"),
    re_path(r'^custom_game/(?P<game_id>[\w-]+)/$', game_views.custom_game_detail, name='custom_game_detail'),
    path("admin/", admin.site.urls),
    path('get_game/<uuid:game_id>/', game_views.get_game, name='get_game'),
    path('get_locations_for_game/<uuid:game_id>/', game_views.get_locations_for_game, name='get_locations_for_game'),
]