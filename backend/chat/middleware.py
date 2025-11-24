"""
JWT Authentication Middleware for WebSocket Connections
"""
from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_string):
    """
    Get user from JWT token
    """
    try:
        # Validate and decode the token
        access_token = AccessToken(token_string)
        user_id = access_token.payload.get('user_id')
        
        if user_id:
            user = User.objects.get(id=user_id)
            return user
    except (TokenError, InvalidToken, User.DoesNotExist) as e:
        print(f"[WebSocket Auth] Token validation failed: {e}")
        return AnonymousUser()
    
    return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware to authenticate WebSocket connections using JWT tokens
    """
    
    async def __call__(self, scope, receive, send):
        # Get token from query string
        query_string = scope.get('query_string', b'').decode()
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]
        
        if token:
            # Authenticate user with token
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """
    Convenience function to wrap the auth middleware
    """
    return JWTAuthMiddleware(inner)
