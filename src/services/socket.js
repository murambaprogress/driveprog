// Socket service using socket.io-client when available.
// Falls back to a safe no-op implementation if socket.io-client or server is not reachable.

let socket = null;
const listeners = new Set();

export function connectSocket(url = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000') {
  if (socket && socket.connected) return socket;

  try {
    // dynamically require to avoid hard crash if module missing in some environments
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { io } = require('socket.io-client');

    const opts = {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    };

    socket = io(url, opts);

    socket.on('connect', () => {
      console.info('[socket] connected', socket.id, 'transport=', socket.io.engine.transport.name);
    });

    socket.on('disconnect', (reason) => {
      console.info('[socket] disconnected', reason);
    });

    socket.on('connect_error', (err) => {
      console.error('[socket] connect_error', err && (err.message || err));
      // attempt fallback to 127.0.0.1 if url used localhost
      if (url.includes('localhost') && !url.includes('127.0.0.1')) {
        try {
          console.info('[socket] retrying with 127.0.0.1 fallback');
          socket.close && socket.close();
        } catch (e) { /* ignore */ }
        socket = io(url.replace('localhost', '127.0.0.1'), opts);
      }
    });

    socket.on('chat:message', (payload) => {
      // forward to local listeners
      listeners.forEach((fn) => {
        try {
          // Extract message and conversation ID from payload
          const message = payload.message;
          const conversationId = payload.room_id;
          fn({ conversationId, message });
        } catch (e) { /* ignore listener errors */ }
      });
    });

    socket.on('chat:typing', (payload) => {
      listeners.forEach((fn) => {
        try { fn({ typing: true, ...payload }); } catch (e) { /* ignore */ }
      });
    });

    socket.on('chat:message_status', (payload) => {
      listeners.forEach((fn) => {
        try { fn(payload); } catch (e) { /* ignore */ }
      });
    });

    return socket;
  } catch (err) {
    // graceful fallback
    console.info('[socket] socket.io-client not available or failed to connect, socket features disabled.', err && (err.message || err));
    socket = {
      id: null,
      connected: false,
      emit: () => {},
      on: () => {},
      close: () => {},
    };
    return socket;
  }
}

export function onSocketMessage(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitMessage(convId, msg) {
  if (!socket) connectSocket();
  try {
  socket.emit && socket.emit('chat:message', { room_id: convId, message: msg });
  } catch (e) {
    /* ignore */
  }
}

export function emitTyping(convId, userId) {
  if (!socket) connectSocket();
  try {
    socket.emit && socket.emit('chat:typing', { conversationId: convId, userId });
  } catch (e) {
    /* ignore */
  }
}

export default { connectSocket, onSocketMessage, emitMessage, emitTyping };
