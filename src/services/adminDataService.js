/**
 * Advanced Admin Data Service
 * Provides comprehensive data management and manipulation tools for admins
 */

class AdminDataService {
  constructor() {
  this.storageKey = 'drivecash_admin_data';
  this.auditKey = 'drivecash_audit_logs';
    this.initializeData();
  }

  initializeData() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = this.generateSampleData();
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
    
    if (!localStorage.getItem(this.auditKey)) {
      localStorage.setItem(this.auditKey, JSON.stringify([]));
    }
    // ensure resolved counters exist
    if (!localStorage.getItem('drivecash_admin_resolved')) {
      localStorage.setItem('drivecash_admin_resolved', JSON.stringify({}));
    }
  }

  generateSampleData() {
    const users = [];
    const loans = [];
    const payments = [];
    
    return {
      users,
      loans, 
      payments,
      analytics: {
        totalUsers: 0,
        activeLoans: 0,
        totalRevenue: 0,
        pendingApplications: 0,
        monthlyGrowth: 0,
        averageLoanAmount: 0,
        defaultRate: 0,
        customerSatisfaction: 0
      }
    };
  }

  // Data retrieval methods
  getSettings() {
    try {
      const settings = localStorage.getItem("adminSettings");
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error("Error parsing admin settings:", error);
      return null;
    }
  }

  setSettings(settings = {}) {
    try {
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      this.logAction('set_admin_settings', { settings });
      // Notify other parts of the app (same window) that admin settings changed
      try {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('adminSettingsUpdated', { detail: settings }));
        }
      } catch (e) {
        // ignore event dispatch errors in non-browser environments
      }
      return true;
    } catch (error) {
      console.error('Error saving admin settings:', error);
      return false;
    }
  }

  getAllData() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
  }

  getUsers(filters = {}) {
    const { users } = this.getAllData();
    return this.applyFilters(users, filters);
  }

  getLoans(filters = {}) {
    const { loans } = this.getAllData();
    return this.applyFilters(loans, filters);
  }

  getPayments(filters = {}) {
    const { payments } = this.getAllData();
    return this.applyFilters(payments, filters);
  }

  // Advanced filtering
  applyFilters(data, filters) {
    let filtered = [...data];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        Object.values(item).some(value => 
          value && value.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(item => new Date(item.createdDate || item.date || item.applicationDate) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(item => new Date(item.createdDate || item.date || item.applicationDate) <= new Date(filters.dateTo));
    }

    if (filters.amountMin && (filters.amountMin > 0)) {
      filtered = filtered.filter(item => (item.amount || item.totalBorrowed || 0) >= filters.amountMin);
    }

    if (filters.amountMax && (filters.amountMax > 0)) {
      filtered = filtered.filter(item => (item.amount || item.totalBorrowed || 0) <= filters.amountMax);
    }

    // Sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aVal = a[filters.sortBy];
        const bVal = b[filters.sortBy];
        
        if (filters.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Pagination
    const total = filtered.length;
    if (filters.page && filters.pageSize) {
      const start = (filters.page - 1) * filters.pageSize;
      filtered = filtered.slice(start, start + filters.pageSize);
    }

    return {
      items: filtered,
      total,
      page: filters.page || 1,
      pageSize: filters.pageSize || filtered.length,
      totalPages: Math.ceil(total / (filters.pageSize || total))
    };
  }

  // Bulk operations
  bulkUpdateUsers(userIds, updates) {
    const data = this.getAllData();
    data.users = data.users.map(user => 
      userIds.includes(user.id) ? { ...user, ...updates, updatedDate: new Date().toISOString() } : user
    );
    this.saveData(data);
    this.logAction('bulk_update_users', { userIds, updates });
    return { success: true, updatedCount: userIds.length };
  }

  bulkUpdateLoans(loanIds, updates) {
    const data = this.getAllData();
    data.loans = data.loans.map(loan => 
      loanIds.includes(loan.id) ? { ...loan, ...updates, updatedDate: new Date().toISOString() } : loan
    );
    this.saveData(data);
    this.logAction('bulk_update_loans', { loanIds, updates });
    return { success: true, updatedCount: loanIds.length };
  }

  bulkDeleteUsers(userIds) {
    const data = this.getAllData();
    data.users = data.users.filter(user => !userIds.includes(user.id));
    // Also remove related loans and payments
    data.loans = data.loans.filter(loan => !userIds.includes(loan.userId));
    data.payments = data.payments.filter(payment => !userIds.includes(payment.userId));
    this.saveData(data);
    this.logAction('bulk_delete_users', { userIds });
    return { success: true, deletedCount: userIds.length };
  }

  // Individual operations
  updateUser(userId, updates) {
    const data = this.getAllData();
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      data.users[userIndex] = { ...data.users[userIndex], ...updates, updatedDate: new Date().toISOString() };
      this.saveData(data);
      this.logAction('update_user', { userId, updates });
      return data.users[userIndex];
    }
    return null;
  }

  approveLoans(loanIds) {
    const data = this.getAllData();
    data.loans = data.loans.map(loan => 
      loanIds.includes(loan.id) ? { 
        ...loan, 
        status: 'approved', 
        approvalDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      } : loan
    );
    this.saveData(data);
    this.logAction('approve_loans', { loanIds });
    return { success: true, approvedCount: loanIds.length };
  }

  denyLoans(loanIds, reason = '') {
    const data = this.getAllData();
    data.loans = data.loans.map(loan => 
      loanIds.includes(loan.id) ? { 
        ...loan, 
        status: 'denied', 
        denialReason: reason,
        denialDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      } : loan
    );
    this.saveData(data);
    this.logAction('deny_loans', { loanIds, reason });
    return { success: true, deniedCount: loanIds.length };
  }

  refundPayments(paymentIds) {
    const data = this.getAllData();
    data.payments = data.payments.map(payment => 
      paymentIds.includes(payment.id) ? { 
        ...payment, 
        refunded: true, 
        refundDate: new Date().toISOString(),
        updatedDate: new Date().toISOString()
      } : payment
    );
    this.saveData(data);
    this.logAction('refund_payments', { paymentIds });
    return { success: true, refundedCount: paymentIds.length };
  }

  // Analytics and reporting
  getAnalytics() {
    const data = this.getAllData();
    const { users, loans, payments } = data;

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const pendingLoans = loans.filter(l => l.status === 'pending').length;
    const totalPayments = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedPayments = payments.filter(p => p.status === 'completed').length;

    return {
      totalUsers,
      activeUsers,
      totalLoans,
      activeLoans,
      pendingLoans,
      totalPayments,
      completedPayments,
      averageLoanAmount: loans.length ? Math.round(loans.reduce((sum, l) => sum + l.amount, 0) / loans.length) : 0,
      averagePayment: completedPayments ? Math.round(totalPayments / completedPayments) : 0,
      userGrowth: this.calculateGrowth(users, 'createdDate'),
      loanGrowth: this.calculateGrowth(loans, 'applicationDate'),
      paymentsByMonth: this.groupByMonth(payments, 'date'),
      loansByStatus: this.groupByStatus(loans),
      usersByStatus: this.groupByStatus(users),
    };
  }

  calculateGrowth(items, dateField) {
    const thisMonth = new Date().getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    
    const thisMonthCount = items.filter(item => 
      new Date(item[dateField]).getMonth() === thisMonth
    ).length;
    
    const lastMonthCount = items.filter(item => 
      new Date(item[dateField]).getMonth() === lastMonth
    ).length;
    
    return lastMonthCount ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100) : 0;
  }

  groupByMonth(items, dateField) {
    const months = {};
    items.forEach(item => {
      const month = new Date(item[dateField]).toISOString().slice(0, 7);
      months[month] = (months[month] || 0) + (item.amount || 1);
    });
    return months;
  }

  groupByStatus(items) {
    const statuses = {};
    items.forEach(item => {
      statuses[item.status] = (statuses[item.status] || 0) + 1;
    });
    return statuses;
  }

  // Data export/import
  exportData(type = 'all') {
    const data = this.getAllData();
    let exportData = data;
    
    if (type !== 'all') {
      exportData = { [type]: data[type] };
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
  a.download = `drivecash_${type}_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.logAction('export_data', { type });
  }

  exportCSV(type, items) {
    if (!items.length) return;
    
    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(item => Object.values(item).map(val => `"${val}"`).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
  a.download = `drivecash_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    this.logAction('export_csv', { type, count: items.length });
  }

  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          const currentData = this.getAllData();
          
          // Merge data
          const mergedData = {
            users: [...(currentData.users || []), ...(importedData.users || [])],
            loans: [...(currentData.loans || []), ...(importedData.loans || [])],
            payments: [...(currentData.payments || []), ...(importedData.payments || [])]
          };
          
          this.saveData(mergedData);
          this.logAction('import_data', { imported: Object.keys(importedData) });
          resolve(mergedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsText(file);
    });
  }

  // Audit logging
  logAction(action, details = {}) {
    const logs = JSON.parse(localStorage.getItem(this.auditKey) || '[]');
    logs.unshift({
      id: `audit_${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      admin: 'admin_user', // Would be actual admin user in real app
    });
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.splice(1000);
    }
    
    localStorage.setItem(this.auditKey, JSON.stringify(logs));
  }

  // Resolved queries tracking per admin
  incrementResolvedCount(adminId = 'admin_user', by = 1) {
    try {
      const raw = JSON.parse(localStorage.getItem('drivecash_admin_resolved') || '{}');
      raw[adminId] = (raw[adminId] || 0) + by;
      localStorage.setItem('drivecash_admin_resolved', JSON.stringify(raw));
      this.logAction('increment_resolved', { adminId, by });
      return raw[adminId];
    } catch (e) { return null; }
  }

  getResolvedCounts() {
    try { return JSON.parse(localStorage.getItem('drivecash_admin_resolved') || '{}'); } catch (e) { return {}; }
  }

  getAuditLogs(limit = 100) {
    const logs = JSON.parse(localStorage.getItem(this.auditKey) || '[]');
    return logs.slice(0, limit);
  }

  // Utility methods
  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  resetData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.auditKey);
    this.initializeData();
    return true;
  }

  getSystemStats() {
    const data = this.getAllData();
    const auditLogs = this.getAuditLogs();
    
    // Calculate system health based on various factors
    const totalUsers = data.users.length;
    const activeUsers = data.users.filter(u => u.status === 'active').length;
    const totalLoans = data.loans.length;
    const pendingLoans = data.loans.filter(l => l.status === 'pending').length;
    const completedPayments = data.payments.filter(p => p.status === 'completed').length;
    const failedPayments = data.payments.filter(p => p.status === 'failed').length;
    
    // Simple health calculation
    const userHealthScore = activeUsers / totalUsers;
    const loanHealthScore = pendingLoans < totalLoans * 0.3 ? 1 : 0.7;
    const paymentHealthScore = completedPayments / (completedPayments + failedPayments);
    const overallHealth = (userHealthScore + loanHealthScore + paymentHealthScore) / 3;
    
    let systemHealth = 'Poor';
    if (overallHealth > 0.8) systemHealth = 'Excellent';
    else if (overallHealth > 0.6) systemHealth = 'Good';
    else if (overallHealth > 0.4) systemHealth = 'Fair';
    
    return {
      totalUsers,
      totalLoans,
      totalPayments: data.payments.length,
      systemHealth,
      activeUsers,
      pendingLoans,
      completedPayments,
      failedPayments,
      dataSize: `${Math.round(JSON.stringify(data).length / 1024)} KB`,
      lastBackup: localStorage.getItem('last_backup_date') || 'Never',
      auditLogCount: auditLogs.length,
      lastActivity: auditLogs[0]?.timestamp || 'No activity',
      uptime: '24/7', // Mock uptime
    };
  }
}

export default new AdminDataService();
