# How to Test Real-Time Chat - Quick Start Guide

## Step 1: Start the Servers

### Terminal 1 - Backend
```powershell
cd "c:\Users\HP\OneDrive\Desktop\New Compression (3)\driveprog-cleaned\backend"
python manage.py runserver
```

### Terminal 2 - Frontend
```powershell
cd "c:\Users\HP\OneDrive\Desktop\New Compression (3)\driveprog-cleaned"
npm start
```

## Step 2: Login

The 401 errors you're seeing mean you're not logged in. You have two options:

### Option A: Login via UI (Recommended)
1. Go to http://localhost:3000
2. Click "Sign In"
3. Use one of these accounts:

**Admin Account:**
- Email: `r2210294w@students.msu.ac.zw`
- Password: (the password you set for this admin)

**Test User Account:**
- Email: `test@example.com`
- Password: `test123`

**Regular User Account:**
- Email: `murambaprogress@gmail.com`
- Phone: `0772966966`
- Password: (the password you set)

### Option B: Set Token Manually (Quick Test)
If you can't remember passwords, open browser console (F12) and run:

**For Test User:**
```javascript
localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzNzczNTEwLCJpYXQiOjE3NjM3MzAzMTAsImp0aSI6IjkxMTgwM2U4NTQ5NTRhZGI5Y2QyZDliMWVmZjE2NDVhIiwidXNlcl9pZCI6IjIifQ.-Upfhquza2mmPdhcg_bmSu7kTZFJV11aG903G9-8XU0');
window.location.reload();
```

**For Admin User:**
```javascript
localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzYzNzczNTU0LCJpYXQiOjE3NjM3MzAzNTQsImp0aSI6ImQ5MWNlYThhM2M2NDQzOGI5ODMxNzAyNjNjNTYyYzNjIiwidXNlcl9pZCI6IjEifQ.BFwxFF64PjuQmC7jgVWybOuzwm2LByrxuOSuAd_hqXc');
window.location.reload();
```

## Step 3: Test Real-Time Chat

### As a Regular User:
1. Login with test user credentials
2. Navigate to **Chat** page from the sidebar
3. Type a message and send it
4. The message will be sent via WebSocket in real-time

### As Admin:
1. Login with admin credentials
2. Navigate to **Admin Chat** from the sidebar
3. You'll see all user conversations
4. Click on a user's conversation
5. Type and send a response
6. The user will receive it instantly via WebSocket!

## Step 4: Test Real-Time Features

### Test Message Delivery:
1. Open two browser windows/tabs
2. Login as User in one, Admin in the other
3. Send messages from both sides
4. Watch them appear instantly without refreshing!

### Test Typing Indicators:
1. Start typing in the message box
2. The other party will see "typing..." indicator

### Test Read Receipts:
1. Send a message as user
2. When admin opens the conversation, message shows "✓ Read"

### Test Reconnection:
1. Send a message
2. Close and reopen the browser
3. Messages are persisted and WebSocket reconnects automatically

## Troubleshooting

### Still Getting 401 Errors?
- Make sure you completed Step 2 (Login)
- Check browser console for the token: `localStorage.getItem('authToken')`
- If token is missing or says "null", you need to login

### WebSocket Not Connecting?
- Check browser console for connection errors
- Make sure backend is running on port 8000
- Token must be valid (not expired)

### Messages Not Appearing?
- Check if WebSocket is connected (browser console shows "[WebSocket] Connected")
- Verify you're in the correct chat room
- Check Django terminal for any errors

## Expected Console Output

### When Connected Successfully:
```
[WebSocket] Connecting to: ws://localhost:8000/ws/chat/1/?token=...
[WebSocket] Connected to room: 1
💬 Fetching user chat room...
✅ Chat room fetched successfully
```

### When Sending Messages:
```
[WebSocket] Message sent: {type: 'chat_message', message: 'Hello!'}
[WebSocket] Message received: {type: 'chat_message', ...}
```

## Demo Flow

1. **User sends message** → Shows instantly in their UI
2. **WebSocket transmits** → Real-time to server
3. **Server broadcasts** → To all connected clients in that room
4. **Admin receives** → Message appears without refresh
5. **Admin responds** → User sees reply instantly
6. **Read receipt sent** → Admin sees "✓ Read"

That's it! Real-time chat is working. Just make sure you're logged in first! 🚀
