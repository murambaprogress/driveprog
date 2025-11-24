/**
 * WebSocket Service for Real-time Chat
 * Uses native WebSocket API to connect to Django Channels backend
 */

class ChatWebSocket {
  constructor() {
    this.ws = null;
    this.roomId = null;
    this.listeners = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
  }

  connect(roomId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.roomId === roomId) {
      console.log('[WebSocket] Already connected to room:', roomId);
      return this.ws;
    }

    // Close existing connection if switching rooms
    if (this.ws && this.roomId !== roomId) {
      this.disconnect();
    }

    this.roomId = roomId;
    this.isConnecting = true;

    // Get token from localStorage (same as apiClient)
    let token = localStorage.getItem('authToken');
    if (token) {
      try {
        const maybeJson = JSON.parse(token);
        if (maybeJson && typeof maybeJson === 'object') {
          token = maybeJson.access 
            || maybeJson.token 
            || (maybeJson.tokens && maybeJson.tokens.access) 
            || null;
        }
      } catch (_) {
        // token is a plain string, use as-is
      }
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.REACT_APP_WS_HOST || 'localhost:8000';
    const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${roomId}/?token=${token}`;

    console.log('[WebSocket] Connecting to:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to room:', roomId);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyListeners({ type: 'connection', status: 'connected', roomId });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.notifyListeners({ type: 'error', error });
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.notifyListeners({ type: 'connection', status: 'disconnected' });

        // Auto-reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`[WebSocket] Reconnecting... Attempt ${this.reconnectAttempts}`);
          setTimeout(() => {
            if (this.roomId) {
              this.connect(this.roomId);
            }
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

      return this.ws;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.isConnecting = false;
      return null;
    }
  }

  disconnect() {
    if (this.ws) {
      console.log('[WebSocket] Disconnecting from room:', this.roomId);
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.roomId = null;
    }
  }

  sendMessage(message) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send message - not connected');
      return false;
    }

    const payload = {
      type: 'chat_message',
      message: message
    };

    this.ws.send(JSON.stringify(payload));
    console.log('[WebSocket] Message sent:', payload);
    return true;
  }

  sendTyping(isTyping) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const payload = {
      type: 'typing',
      is_typing: isTyping
    };

    this.ws.send(JSON.stringify(payload));
    return true;
  }

  sendReadReceipt(messageId) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    const payload = {
      type: 'read_receipt',
      message_id: messageId
    };

    this.ws.send(JSON.stringify(payload));
    return true;
  }

  onMessage(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('[WebSocket] Listener error:', error);
      }
    });
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const chatWebSocket = new ChatWebSocket();

// Legacy compatibility exports
export function connectSocket(roomId) {
  return chatWebSocket.connect(roomId);
}

export function onSocketMessage(fn) {
  return chatWebSocket.onMessage(fn);
}

export function emitMessage(roomId, msg) {
  // For legacy compatibility - connect if needed
  if (!chatWebSocket.isConnected() || chatWebSocket.roomId !== roomId) {
    chatWebSocket.connect(roomId);
  }
  chatWebSocket.sendMessage(msg.text || msg.message || msg);
}

export function emitTyping(roomId, isTyping) {
  if (!chatWebSocket.isConnected() || chatWebSocket.roomId !== roomId) {
    chatWebSocket.connect(roomId);
  }
  chatWebSocket.sendTyping(isTyping);
}

export default chatWebSocket;

