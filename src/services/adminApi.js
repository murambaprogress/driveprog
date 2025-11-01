// Simple admin API wrapper with fetch and mock fallbacks
const API_BASE = process.env.REACT_APP_API_BASE || "";

async function safeFetch(path, opts = {}) {
  const url = API_BASE + path;
  try {
    const res = await fetch(url, opts);
    if (!res.ok) throw new Error(`API ${url} returned ${res.status}`);
    return await res.json();
  } catch (err) {
    // Fallback: return null to let callers handle mock data
    console.warn("adminApi safeFetch failed, falling back to mock:", err.message);
    return null;
  }
}

export async function getUsers({ page = 1, pageSize = 10, query = "" } = {}) {
  const qs = `?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(query)}`;
  const r = await safeFetch("/api/admin/users" + qs);
  if (r) return r; // expected shape: { items: [], total }
  // mock data (deterministic small generator)
  const base = [
    { id: "user_001", name: "John Doe", email: "john.doe@email.com", status: "active" },
    { id: "user_002", name: "Jane Smith", email: "jane.smith@email.com", status: "suspended" },
    { id: "user_003", name: "Alice Park", email: "alice.park@email.com", status: "active" },
    { id: "user_004", name: "Bob Lee", email: "bob.lee@email.com", status: "active" },
    { id: "user_005", name: "Carla Gomez", email: "carla.gomez@email.com", status: "active" },
  ];

  const all = Array.from({ length: 45 }).map((_, i) => base[i % base.length]).map((u, idx) => ({ ...u, id: `user_${100 + idx}`, name: `${u.name} ${idx}` }));
  const q = (query || "").toLowerCase();
  const filtered = q ? all.filter(u => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.id || "").toLowerCase().includes(q)) : all;
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, total };
}

export async function updateUser(id, patch) {
  const r = await safeFetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
  if (r) return r;
  // Mock: echo
  return { id, ...patch };
}

export async function getLoans(query = {}) {
  const r = await safeFetch(`/api/admin/loans`);
  if (r) return r;
  return [];
}

export async function approveLoan(id) {
  const r = await safeFetch(`/api/admin/loans/${id}/approve`, { method: "POST" });
  if (r) return r;
  return { id, status: "approved" };
}

export async function denyLoan(id, reason) {
  const r = await safeFetch(`/api/admin/loans/${id}/deny`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reason }) });
  if (r) return r;
  return { id, status: "denied", reason };
}

export async function refundPayment(paymentId, amount) {
  const r = await safeFetch(`/api/admin/payments/${paymentId}/refund`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount }) });
  if (r) return r;
  return { paymentId, refunded: true, amount };
}

export async function getAnalytics() {
  const r = await safeFetch(`/api/admin/analytics`);
  if (r) return r;
  // return mock KPIs
  return {
    totalUsers: 1240,
    activeLoans: 320,
    monthlyPayments: 45230,
    revenue: 1234500,
    paymentsByDay: Array.from({ length: 30 }, (_, i) => ({ date: `2025-08-${i + 1}`, amount: Math.floor(Math.random() * 5000) }))
  };
}

export async function getAuditLogs() {
  const r = await safeFetch(`/api/admin/audit`);
  if (r) return r;
  return [
    { id: "log_001", time: new Date().toISOString(), admin: "admin_1", action: "approve_loan", details: "loan_101" },
    { id: "log_002", time: new Date().toISOString(), admin: "admin_2", action: "refund_payment", details: "payment_202" },
  ];
}

export async function logAdminAction(entry) {
  const r = await safeFetch(`/api/admin/audit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) });
  if (r) return r;
  return { id: `log_${Date.now()}`, ...entry };
}

export default {
  getUsers,
  updateUser,
  getLoans,
  approveLoan,
  denyLoan,
  refundPayment,
  getAnalytics,
  getAuditLogs,
  logAdminAction,
};
