/**
 * Admin Chat Inbox
 * Minimal admin UI to view conversations and reply to users.
 */
import React, { useEffect, useState, useRef } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { VhoozhtTextarea } from 'components/VhoozhtForms';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';

import chatService from '../../services/chatService';
import socketService from '../../services/socket';
import adminDataService from '../../services/adminDataService';
import { registerServiceWorker, subscribeToPush } from '../../services/push';

export default function ChatAdmin() {
	const [conversations, setConversations] = useState([]);
	const [activeConv, setActiveConv] = useState(null);
	const [messages, setMessages] = useState([]);
	const [text, setText] = useState('');
	const messagesEndRef = useRef(null);

	useEffect(() => {
		let mounted = true;
		async function load() {
			const convs = await chatService.getAllRooms();
			if (mounted) setConversations(convs || []);
		}
		load();

		// subscribe to socket messages (noop fallback available)
		const off = socketService.onSocketMessage((msg) => {
			// if message belongs to active conversation append
			if (msg && msg.conversationId && msg.message) {
				if (activeConv && msg.conversationId === activeConv.id) {
					setMessages((m) => [...m, { id: `socket_${Date.now()}`, text: msg.message.message || msg.message, direction: 'user', time: new Date().toISOString() }]);
				}
				// reload conversations to update lastMessage/unread
				chatService.getAllRooms().then(c => setConversations(c || []));
			}
		});

    return () => { mounted = false; off && off(); };
  }, [activeConv]);

  useEffect(() => { // request notification permission once
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => {
    // try to register service worker and subscribe to push if VAPID provided
    (async () => {
      try {
        const reg = await registerServiceWorker();
        const vapid = process.env.REACT_APP_VAPID_PUBLIC;
        if (reg && vapid) {
          const sub = await subscribeToPush(reg, vapid);
          if (sub && activeConv) {
            await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: activeConv.id, subscription: sub }) });
          }
        }
      } catch (e) { console.warn('push/register failed', e); }
    })();
  }, [activeConv]);

  useEffect(() => {
    if (!activeConv) return;
    // subscribe to socket message status updates
    const off = socketService.onSocketMessage((msg) => {
      if (msg && msg.conversationId === activeConv.id && msg.status && msg.messageId) {
        setMessages((m) => m.map(message => message.id === msg.messageId ? { ...message, status: msg.status } : message));
      } else if (msg && msg.conversationId === activeConv.id && msg.message) {
    setMessages((m) => [...m, { id: `socket_${Date.now()}`, text: msg.message.message || msg.message, direction: 'user', time: new Date().toISOString() }]);
   }
    chatService.getRoomMessages(activeConv.id).then(msgs => setMessages(msgs || []));
    });
    return () => off && off();
  }, [activeConv]);

	useEffect(() => { scrollToBottom(); }, [messages]);
	async function openConversation(conv) {
		setActiveConv(conv);
		const msgs = await chatService.getRoomMessages(conv.id);
		setMessages(msgs || []);
		// mark read for admin
		chatService.markRoomAsRead(conv.id).catch(() => {});
	}

	function scrollToBottom() {
		try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch (e) {}
	}

	async function sendReply() {
		if (!activeConv || !text.trim()) return;
		const msg = await chatService.sendMessage(activeConv.id, text.trim());
		setMessages((m) => [...m, { id: msg.id, text: msg.message || text.trim(), direction: 'admin', time: msg.created_at || new Date().toISOString(), status: msg.status }]);
		setText('');
		// emit via socket
		socketService.emitMessage(activeConv.id, { id: msg.id, text: msg.message || text.trim(), from: 'admin' });
		// refresh conv list
		const convs = await chatService.getAllRooms();
		setConversations(convs || []);
	}

	async function resolveConversation() {
		if (!activeConv) return;
		// increment local admin resolved counter
		try { adminDataService.incrementResolvedCount('admin_user', 1); } catch (e) {}
		// try to trigger server push notify for the conversation (if subscription present)
		try {
			await fetch('/api/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationId: activeConv.id, payload: { title: 'Conversation resolved', body: `Your support conversation ${activeConv.id} was resolved by admin.` } }) });
		} catch (e) { console.warn('push/send failed', e); }
		// refresh conv list and clear active
		const convs = await chatService.getAllRooms();
		setConversations(convs || []);
		setActiveConv(null);
		setMessages([]);
	}

	return (
		<DashboardLayout>
			<DashboardNavbar />
			<MDBox py={3}>
				<MDTypography variant="h4" fontWeight="bold" mb={1}>Admin Chat Inbox</MDTypography>
				<Grid container spacing={3}>
					<Grid item xs={12} md={4}>
						<Card sx={{ p: 2, height: '600px', overflowY: 'auto' }}>
							<MDTypography variant="h6">Conversations</MDTypography>
							<List>
								{conversations.length === 0 && <ListItem><ListItemText primary="No conversations" /></ListItem>}
								{conversations.map((c) => (
									<ListItem key={c.id} button selected={activeConv?.id === c.id} onClick={() => openConversation(c)}>
										<Avatar sx={{ mr: 2, bgcolor: c.is_online ? 'success.main' : 'grey.500' }}>{String(c.user || 'U').charAt(0)}</Avatar>
										<ListItemText primary={c.name || c.id} secondary={c.last_message?.message || '—'} />
									</ListItem>
								))}
							</List>
						</Card>
					</Grid>

					<Grid item xs={12} md={8}>
						<Card sx={{ p: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
							<MDTypography variant="h6">{activeConv ? `Conversation: ${activeConv.id}` : 'Select a conversation'}</MDTypography>
							<MDBox sx={{ flex: 1, overflowY: 'auto', my: 2, p: 1, borderRadius: 1, backgroundColor: '#fafafa' }}>
								{messages.map((m) => (
									<MDBox key={m.id} display="flex" justifyContent={m.direction === 'admin' ? 'flex-end' : 'flex-start'} mb={1}>
										<MDBox bgcolor={m.direction === 'admin' ? 'primary.main' : 'grey.200'} color={m.direction === 'admin' ? 'white' : 'text.primary'} px={2} py={1} borderRadius={2} maxWidth="70%">
											<MDTypography variant="body2">{m.text}</MDTypography>
												<MDTypography variant="caption" display="block" mt={0.5}>{new Date(m.time).toLocaleString()} - {m.status}</MDTypography>
											</MDBox>
										</MDBox>
								))}
								<div ref={messagesEndRef} />
							</MDBox>

							<MDBox display="flex" gap={1} alignItems="center">
								<VhoozhtTextarea 
									fullWidth 
									multiline 
									maxRows={4} 
									minRows={1} 
									placeholder="Type a reply..." 
									value={text} 
									onChange={(e) => setText(e.target.value)} 
									onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }} 
								/>
								<Button variant="contained" color="primary" onClick={sendReply}>Send</Button>
								<Button variant="outlined" color="success" onClick={resolveConversation} disabled={!activeConv}>Resolve</Button>
							</MDBox>
						</Card>
					</Grid>
				</Grid>
			</MDBox>
			<Footer />
		</DashboardLayout>
	);
}
