import React, { useEffect, useState, useRef } from 'react';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import { VhoozhtInput } from 'components/VhoozhtForms';
import chatService from '../../services/chatService';
import { connectSocket, onSocketMessage, emitMessage } from '../../services/socket';
import { registerServiceWorker, subscribeToPush } from '../../services/push';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.value = 0.05;
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 120);
  } catch (e) { /* ignore */ }
}

export default function ChatSupport({ userId }) {
  const [convId, setConvId] = useState(null);
  const [text, setText] = useState('');
  const isAdmin = !!userId;
  const qc = useQueryClient();
  const containerRef = useRef();
  const prevLastId = useRef(null);

  useEffect(() => { // request notification permission once
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => { // ensure a conversation exists for demo user
    let mounted = true;
    (async () => {
    const fetchRoom = async () => {
      let c;
      if (isAdmin) {
        c = await chatService.getRoomByUserId(userId);
      } else {
        c = await chatService.getMyRoom();
      }
      if (mounted && c) {
        setConvId(c.id);
      }
    };
    fetchRoom();
    })();
    return () => mounted = false;
  }, [userId]);

  useEffect(() => {
    // connect to socket for real-time updates
    const s = connectSocket();
    const off = onSocketMessage((msg) => {
      // if message belongs to this conversation, invalidate query so it updates instantly
      if (msg && msg.conversationId === convId) {
        qc.invalidateQueries(['chat','messages',convId]);
      }
      chatService.getRoomMessages(convId).then(() => qc.invalidateQueries(['chat','messages',convId]));
    });

    // try to register service worker and subscribe to push if VAPID provided
    (async () => {
      try {
        const reg = await registerServiceWorker();
        const vapid = process.env.REACT_APP_VAPID_PUBLIC;
        if (reg && vapid) {
          const sub = await subscribeToPush(reg, vapid);
          if (sub && convId) {
            await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: convId, subscription: sub }) });
          }
        }
      } catch (e) { console.warn('push/register failed', e); }
    })();

    return () => { off(); };
  }, [convId]);

  const { data: messages } = useQuery(['chat','messages',convId], () => chatService.getRoomMessages(convId), { enabled: !!convId, refetchInterval: 2000 });

  // auto-scroll and notifications for admin replies
  useEffect(() => {
    if (!messages || !messages.length) return;
    // scroll to bottom
    try { const el = containerRef.current; if (el) el.scrollTop = el.scrollHeight; } catch (e) {}

    const last = messages[messages.length - 1];
    if (!last) return;
    // only notify when the last message is from admin and is new
    if (last.direction === 'admin' && last.id !== prevLastId.current) {
      prevLastId.current = last.id;
      // mark as read for the user
      chatService.markRoomAsRead(convId).catch(() => {});
      // show browser notification if permission granted and user not focused
      const shouldNotify = ('Notification' in window && Notification.permission === 'granted' && document.hidden) || ('Notification' in window && Notification.permission === 'granted' && !document.hasFocus());
      if (shouldNotify) {
        try {
          const n = new Notification('Support Reply', { body: last.text, tag: convId });
          n.onclick = () => { window.focus(); n.close(); };
        } catch (e) { /* ignore */ }
      }
      playBeep();
    }
  }, [messages, convId]);

  async function send() {
    if (!text.trim() || !convId) return;
    const msg = await chatService.sendMessage(convId, text);
    setText('');
    qc.invalidateQueries(['chat','messages',convId]);
  }

  return (
    <MDBox p={3}>
      <MDTypography variant="h5">Support Chat</MDTypography>
      <MDBox mt={2} sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, height: 420, overflow: 'auto' }} ref={containerRef}>
        {messages && messages.length ? messages.map(m => (
          <MDBox key={m.id} sx={{ mb: 1, display: 'flex', flexDirection: m.direction === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            <MDBox sx={{ maxWidth: '75%', display: 'inline-block' }}>
              <MDBox sx={{ bgcolor: m.direction === 'user' ? '#5664d2' : '#f2f4f7', color: m.direction === 'user' ? '#fff' : '#111', px: 2, py: 1, borderRadius: 2 }}>
                <MDTypography sx={{ wordBreak: 'break-word' }}>{m.text}</MDTypography>
              </MDBox>
              <MDTypography variant="caption" sx={{ display: 'block', textAlign: m.direction === 'user' ? 'right' : 'left' }}>{new Date(m.time).toLocaleString()} - {m.status}</MDTypography>
            </MDBox>
          </MDBox>
        )) : <MDTypography variant="caption">No messages yet. Use the box below to start the conversation.</MDTypography>}
      </MDBox>
      <MDBox mt={2} display="flex" gap={1}>
        <VhoozhtInput 
          fullWidth 
          placeholder="Type a message" 
          value={text} 
          onChange={e => setText(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} 
        />
        <MDButton variant="contained" onClick={send}>Send</MDButton>
      </MDBox>
    </MDBox>
  );
}
