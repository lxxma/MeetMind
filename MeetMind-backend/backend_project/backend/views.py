from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from .models import Room, Topic
from .serializers import RoomSerializer

from django.conf import settings
from django.shortcuts import get_object_or_404

from .serializers import UserSerializer

from .serializers import TopicSerializer

User = get_user_model()  # Dynamically get the user model

from .models import Room, Message
from .serializers import MessageSerializer


from .models import Activity

class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get recent activities for the authenticated user
        activities = Activity.objects.filter(user=request.user).order_by('-timestamp')[:5]  # Limit to 5 recent activities
        activity_data = [
            {
                "type": activity.type,
                "description": activity.description,
                "timestamp": activity.timestamp.strftime('%Y-%m-%d %H:%M')
            }
            for activity in activities
        ]
        return Response(activity_data)


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):
        room = Room.objects.get(id=room_id)
        messages = Message.objects.filter(room=room)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, room_id):
        room = Room.objects.get(id=room_id)
        message_content = request.data.get('content')

        if not message_content:
            return Response({'detail': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        message = Message.objects.create(
            room=room,
            author=request.user,
            content=message_content
        )

        serializer = MessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)




class RoomListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            topic_id = request.query_params.get('topic')
            if topic_id:
                rooms = Room.objects.filter(topic_id=topic_id)
            else:
                rooms = Room.objects.all()
            
            if not rooms.exists():
                return Response([], status=status.HTTP_200_OK)
            
            serializer = RoomSerializer(rooms, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            print(f"Error in RoomListView: {str(e)}")
            print(traceback.format_exc())
            return Response({
                "error": "Failed to fetch rooms. Please try again later.",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class TopicListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            topics = Topic.objects.all()
            print("Fetched topics:", topics)
            serializer = TopicSerializer(topics, many=True)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            print(f"Error in TopicListView: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": "Failed to fetch topics. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TopicDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            topic = Topic.objects.get(id=pk)
            serializer = TopicSerializer(topic)
            return Response(serializer.data)
        except Topic.DoesNotExist:
            return Response({
                'error': 'Topic not found',
                'message': 'The requested topic could not be found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"Error in TopicDetailView get: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'Internal server error',
                'message': 'An unexpected error occurred while fetching the topic.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        try:
            topic = Topic.objects.get(id=pk)
            serializer = TopicSerializer(topic, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response({
                'error': 'Validation error',
                'message': 'Invalid data provided.',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Topic.DoesNotExist:
            return Response({
                'error': 'Topic not found',
                'message': 'The requested topic could not be found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"Error in TopicDetailView put: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'Internal server error',
                'message': 'An unexpected error occurred while updating the topic.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            topic = Topic.objects.get(id=pk)
            topic.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Topic.DoesNotExist:
            return Response({
                'error': 'Topic not found',
                'message': 'The requested topic could not be found.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            print(f"Error in TopicDetailView delete: {str(e)}")
            print(traceback.format_exc())
            return Response({
                'error': 'Internal server error',
                'message': 'An unexpected error occurred while deleting the topic.',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            
            return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'profile': {
                    'avatar': user.profile.avatar.url if hasattr(user, 'profile') and user.profile.avatar else '',
                    'bio': user.profile.bio if hasattr(user, 'profile') else '',
                    'full_name': user.profile.full_name if hasattr(user, 'profile') else ''
                }
            })
        except Exception as e:
            print(f"Error in UserProfileView: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": "Failed to fetch user profile. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, *args, **kwargs):
        user = request.user
        
        # Get the profile if it exists, or create a new one
        profile, created = Profile.objects.get_or_create(user=user)
        
        # Update the profile with the provided data
        if 'avatar' in request.data:
            profile.avatar = request.data['avatar']
        if 'bio' in request.data:
            profile.bio = request.data['bio']
        if 'full_name' in request.data:
            profile.full_name = request.data['full_name']
        
        # Update the user model with the provided data
        user_data = {
            'username': request.data.get('username', user.username),
            'email': request.data.get('email', user.email)
        }
        
        try:
            # Update user fields
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()
            
            # Save profile changes
            profile.save()
            
            # Serialize and return the updated user data
            serializer = UserSerializer(user)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            return Response({
                'detail': 'Error updating profile',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        user = request.user
        try:
            # Delete all related models first
            if hasattr(user, 'profile'):
                user.profile.delete()
            if hasattr(user, 'participants'):
                user.participants.clear()
            
            # Delete the user
            user.delete()
            
            return Response({
                'success': True,
                'message': 'Account successfully deleted'
            }, status=status.HTTP_204_NO_CONTENT)
            
        except Exception as e:
            print(f"Error deleting account: {str(e)}")
            return Response({
                'detail': 'Error deleting account',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description')
        topic_name = request.data.get('topic')

        if not name or not description or not topic_name:
            return Response({'detail': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        # Get and create the topic
        topic, created = Topic.objects.get_or_create(name=topic_name)

        # Create the room
        room = Room.objects.create(
            creator=request.user,
            topic=topic,
            name=name,
            description=description
        )

        return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

    


class RoomDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
            return Response({
                'id': room.id,
                'name': room.name,
                'description': room.description,
                'topic': room.topic.name if room.topic else None,
                'creator': room.creator.id if room.creator else None,
                'participants': list(room.participants.values('id'))
            }, status=status.HTTP_200_OK)
        except Room.DoesNotExist:
            print(f"Room with ID {pk} does not exist")
            return Response({'detail': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
        

    def put(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
            user = request.user
            
            # Check if user is authenticated
            if not user.is_authenticated:
                return Response(
                    {'detail': 'Authentication credentials were not provided'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check if user is the room creator
            if room.creator != user:
                print(f"User {user.username} tried to edit room {room.id} but is not the creator")
                return Response(
                    {'detail': 'Only the room creator can edit the room'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update room details
            room.name = request.data.get('name', room.name)
            room.description = request.data.get('description', room.description)
            
            # Update topic if provided
            topic_name = request.data.get('topic')
            if topic_name:
                try:
                    topic, created = Topic.objects.get_or_create(name=topic_name)
                    room.topic = topic
                except Exception as e:
                    print(f"Error updating topic: {str(e)}")
                    return Response({'detail': 'Error updating topic'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            room.save()

            # Create activity log
            Activity.objects.create(
                user=user,
                type='EDIT_ROOM',
                description=f'Edited room: {room.name}'
            )
            
            serializer = RoomSerializer(room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Room.DoesNotExist:
            return Response({'detail': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Edit room error: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
            user = request.user
            
            # Check if user is authenticated
            if not user.is_authenticated:
                return Response(
                    {'detail': 'Authentication credentials were not provided'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Check if user is the room creator
            if room.creator != user:
                return Response(
                    {'detail': 'Only the room creator can delete the room'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Create activity log
            Activity.objects.create(
                user=user,
                type='DELETE_ROOM',
                description=f'Deleted room: {room.name}'
            )
            
            # Delete the room
            room.delete()
            
            return Response({'detail': 'Room deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
            
        except Room.DoesNotExist:
            return Response({'detail': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Delete room error: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request, pk):
        try:
            room = Room.objects.get(pk=pk)
            user = request.user
            
            if not user.is_authenticated:
                return Response(
                    {'detail': 'Authentication credentials were not provided'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get the action from URL kwargs
            action = request.parser_context['kwargs'].get('action')
            
            if action == 'join':
                # Add user as participant
                room.participants.add(user)
                room.save()
                
                # Create activity log
                Activity.objects.create(
                    user=user,
                    type='JOIN_ROOM',
                    description=f'Joined room: {room.name}'
                )
                
                return Response(
                    {
                        'message': 'Successfully joined room',
                        'room': {
                            'id': room.id,
                            'name': room.name,
                            'description': room.description,
                            'participants': list(room.participants.values('id'))
                        }
                    },
                    status=status.HTTP_200_OK
                )
            
            elif action == 'leave':
                # Remove user as participant
                room.participants.remove(user)
                room.save()
                
                # Create activity log
                Activity.objects.create(
                    user=user,
                    type='LEAVE_ROOM',
                    description=f'Left room: {room.name}'
                )
                
                return Response(
                    {
                        'message': 'Successfully left room',
                        'room': {
                            'id': room.id,
                            'name': room.name,
                            'description': room.description,
                            'participants': list(room.participants.values('id'))
                        }
                    },
                    status=status.HTTP_200_OK
                )
            
            else:
                return Response(
                    {'detail': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except Room.DoesNotExist:
            return Response(
                {'detail': 'Room not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Room action error: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            user = request.user
            
            return Response({
                'avatar': user.profile.avatar.url if hasattr(user, 'profile') and user.profile.avatar else '',
                'username': user.username,
                'email': user.email,
                'bio': user.profile.bio if hasattr(user, 'profile') else '',
                'full_name': user.profile.full_name if hasattr(user, 'profile') else ''
            })
        except Exception as e:
            print(f"Profile error: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, *args, **kwargs):
        try:
            user = request.user
            
            # Update user profile
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                
                # Create activity log
                Activity.objects.create(
                    user=user,
                    type='UPDATE_PROFILE',
                    description='Updated profile information'
                )
                
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Profile update error: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, *args, **kwargs):
        try:
            user = request.user
            
            # Delete user
            user.delete()
            
            # Create activity log
            Activity.objects.create(
                user=user,
                type='DELETE_ACCOUNT',
                description='Deleted account'
            )
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            print(f"Account delete error: {str(e)}")
            return Response(
                {'detail': 'An unexpected error occurred'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SignUpView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        try:
            # Validate password
            validate_password(data['password'])
            
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password']
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": e.messages[0]}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'detail': 'Email and password are required'}, status=400)

        try:
            # Get user by email
            user = User.objects.get(email=email)
            if user.check_password(password):
                # Create JWT tokens
                refresh = RefreshToken.for_user(user)
                
                # Get user data
                user_data = {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'profile': {
                        'avatar': user.profile.avatar.url if hasattr(user, 'profile') and user.profile.avatar else '',
                        'bio': user.profile.bio if hasattr(user, 'profile') else '',
                        'full_name': user.profile.full_name if hasattr(user, 'profile') else ''
                    }
                }

                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': user_data
                }, status=200)
            else:
                return Response({'detail': 'Invalid credentials'}, status=401)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=404)
        except Exception as e:
            print(f"Login error: {str(e)}")
            return Response({'detail': 'An error occurred during login'}, status=500)
