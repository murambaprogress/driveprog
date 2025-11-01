// Simple chat API with safeFetch and localStorage fallback to simulate 24/7 messaging
import adminApi from './adminApi';

const STORAGE_KEY = 'drivecash_mock_chats_v1';

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; }
}

function writeStore(store) { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }

async function safeFetch(path, opts = {}) {
  // try to leverage adminApi.safeFetch indirectly; adminApi exposes safeFetch internally but we reuse endpoints via fetch
  try {
    const res = await fetch(path, opts);
    if (!res.ok) throw new Error('bad');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function getConversations() {
  const r = await safeFetch('/api/chat/conversations');
  if (r) return r;
  const store = readStore();
  const convs = Object.values(store).map(c => ({ id: c.id, userId: c.userId, unread: c.messages.some(m=>m.direction==='user' && !m.readByAdmin), lastMessage: c.messages[c.messages.length-1] }));
  return convs;
}

export async function getMessages(conversationId) {
  const r = await safeFetch(`/api/chat/${conversationId}/messages`);
  if (r) return r;
  const store = readStore();
  return store[conversationId]?.messages || [];
}

export async function startConversation(userId, meta={}) {
  const r = await safeFetch(`/api/chat/start`, { method: 'POST', body: JSON.stringify({ userId, meta }) });
  if (r) return r;
  const store = readStore();
  const id = `conv_${Date.now()}`;
  store[id] = { id, userId, meta, messages: [] };
  writeStore(store);
  return store[id];
}

export async function sendMessage(conversationId, { text, from = 'user' }) {
  const r = await safeFetch(`/api/chat/${conversationId}/send`, { method: 'POST', body: JSON.stringify({ text, from }) });
  if (r) return r;
  const store = readStore();
  const conv = store[conversationId] || { id: conversationId, userId: 'unknown', messages: [] };
  const msg = { id: `m_${Date.now()}`, text, time: new Date().toISOString(), direction: from === 'user' ? 'user' : 'admin', readByAdmin: from === 'admin', readByUser: from === 'user' };
  conv.messages.push(msg);
  store[conversationId] = conv;
  writeStore(store);
  // log admin actions when admin sends
  if (from === 'admin') await adminApi.logAdminAction({ time: new Date().toISOString(), admin: 'system', action: 'admin_message', details: `${conversationId}:${msg.id}` });
  return msg;
}

export async function markRead(conversationId, forWhom = 'admin') {
  const r = await safeFetch(`/api/chat/${conversationId}/read`, { method: 'POST', body: JSON.stringify({ forWhom }) });
  if (r) return r;
  const store = readStore();
  const conv = store[conversationId];
  if (!conv) return null;
  conv.messages = conv.messages.map(m => ({ ...m, ...(forWhom === 'admin' ? { readByAdmin: true } : { readByUser: true }) }));
  store[conversationId] = conv;
  writeStore(store);
  return true;
}

export async function markResolved(conversationId, resolvedBy = 'admin') {
  // try server endpoint first
  const r = await safeFetch(`/api/chat/${conversationId}/resolve`, { method: 'POST', body: JSON.stringify({ resolvedBy }) });
  if (r) return r;

  const store = readStore();
  const conv = store[conversationId];
  if (!conv) return null;
  conv.resolved = true;
  conv.resolvedAt = new Date().toISOString();
  conv.resolvedBy = resolvedBy;
  store[conversationId] = conv;
  writeStore(store);

  // increment admin resolved counter via adminApi if available
  try { await (await import('./adminApi')).default.incrementResolvedCount && (await (await import('./adminApi')).default.incrementResolvedCount(resolvedBy)); } catch (e) { /* ignore */ }

  return true;
}

export default { getConversations, getMessages, startConversation, sendMessage, markRead };
