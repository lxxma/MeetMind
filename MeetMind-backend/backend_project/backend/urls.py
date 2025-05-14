from django.urls import path
from .views import LoginView, SignUpView, CreateRoomView, RoomListView, RoomDetailView, UserProfileView, MessageListView, UserActivityView
from .views import TopicListView, TopicDetailView

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/signup/', SignUpView.as_view(), name='signup'),
    path('api/rooms/create/', CreateRoomView.as_view(), name='create-room'),
    path('api/rooms/', RoomListView.as_view(), name='list-rooms'),
    path('api/rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
    path('api/rooms/<int:pk>/join/', RoomDetailView.as_view(), {'action': 'join'}, name='join-room'),
    path('api/rooms/<int:pk>/leave/', RoomDetailView.as_view(), {'action': 'leave'}, name='leave-room'),
    path('api/users/me/', UserProfileView.as_view(), name='user-profile'),
    path('api/topics/', TopicListView.as_view(), name='topic-list'),
    path('api/rooms/<int:room_id>/messages/', MessageListView.as_view(), name='message-list'),
    path('api/recent-activities/', UserActivityView.as_view(), name='recent-activities'),
    path('api/topics/<int:pk>/', TopicDetailView.as_view(), name='topic-detail')
]

