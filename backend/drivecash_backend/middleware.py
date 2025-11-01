"""
Custom middleware for debugging authentication
"""
import logging

logger = logging.getLogger(__name__)


class AuthDebugMiddleware:
    """
    Middleware to debug authentication headers and user state
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only log for my_applications endpoint
        if 'my_applications' in request.path:
            print(f"\n[AUTH DEBUG] ========== Request to {request.path} ==========")
            print(f"[AUTH DEBUG] HTTP Headers:")
            auth_header = request.headers.get('Authorization', 'NOT SET')
            print(f"[AUTH DEBUG]   Authorization: {auth_header[:100] if auth_header != 'NOT SET' else 'NOT SET'}...")
            print(f"[AUTH DEBUG]   Content-Type: {request.headers.get('Content-Type', 'NOT SET')}")
            print(f"[AUTH DEBUG]   Origin: {request.headers.get('Origin', 'NOT SET')}")
            
            # Process request
            response = self.get_response(request)
            
            print(f"[AUTH DEBUG] After authentication:")
            print(f"[AUTH DEBUG]   request.user: {request.user}")
            print(f"[AUTH DEBUG]   request.user.is_authenticated: {request.user.is_authenticated}")
            print(f"[AUTH DEBUG]   Response status: {response.status_code}")
            print(f"[AUTH DEBUG] ========================================\n")
            
            return response
        
        return self.get_response(request)
