from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, OTP

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'first_name', 'last_name', 'email', 'user_type', 'phone_number', 'date_of_birth', 'is_verified', 'created_at')
        read_only_fields = ('id', 'is_verified', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone_number', 'date_of_birth', 'password', 'password2')
        extra_kwargs = {
            'phone_number': {'required': False, 'allow_blank': True},
            'date_of_birth': {'required': False, 'allow_null': True}
        }
        
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
            
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['username'] = validated_data.get('email')
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    class Meta:
        fields = ('email', 'password')

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTP
        fields = ('otp_code', 'expires_at')
        read_only_fields = ('expires_at',)

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp_code = serializers.CharField(required=True, max_length=6)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs