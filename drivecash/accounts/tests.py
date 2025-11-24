from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import User

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpassword123',
            'password2': 'testpassword123',
            'user_type': 'user'
        }
        
    def test_user_registration(self):
        """Test user registration endpoint"""
        response = self.client.post('/api/auth/register/user/', self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        
    def test_user_login(self):
        """Test user login endpoint"""
        # First create a user
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123',
            user_type='user'
        )
        
        # Test login
        login_data = {
            'email': 'test@example.com',
            'password': 'testpassword123'
        }
        response = self.client.post('/api/auth/login/', login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        
    def test_admin_registration(self):
        """Test admin registration endpoint"""
        admin_data = self.user_data.copy()
        admin_data['user_type'] = 'admin'
        admin_data['email'] = 'admin@example.com'
        
        response = self.client.post('/api/auth/register/admin/', admin_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user_id', response.data)