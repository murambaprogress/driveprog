// Data formatting utilities for consistent display across all components

export const formatters = {
  // Currency formatting
  currency: (value, currency = 'USD', locale = 'en-US') => {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  // Percentage formatting
  percentage: (value, decimals = 1) => {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return `${Number(value).toFixed(decimals)}%`;
  },

  // Number formatting with commas
  number: (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // Date formatting
  date: (value, options = { year: 'numeric', month: 'short', day: 'numeric' }) => {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString('en-US', options);
  },

  // DateTime formatting
  datetime: (value) => {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Time-only formatting
  time: (value, options = { hour: '2-digit', minute: '2-digit' }) => {
    if (!value) return '--';
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleTimeString('en-US', options);
  },

  // Text truncation
  truncate: (text, maxLength = 50) => {
    if (!text || typeof text !== 'string') return '--';
    return text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
  },

  // Phone number formatting
  phone: (value) => {
    if (!value) return '--';
    const cleaned = value.toString().replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return value;
  },

  // Status formatting with color
  status: (value) => {
    if (!value) return { text: '--', color: 'default' };
    
    const statusMap = {
      active: { color: 'success', text: 'Active' },
      inactive: { color: 'error', text: 'Inactive' },
      pending: { color: 'warning', text: 'Pending' },
      approved: { color: 'success', text: 'Approved' },
      rejected: { color: 'error', text: 'Rejected' },
      suspended: { color: 'error', text: 'Suspended' },
      completed: { color: 'success', text: 'Completed' },
      processing: { color: 'info', text: 'Processing' },
      draft: { color: 'default', text: 'Draft' },
    };

    const status = statusMap[value.toLowerCase()];
    return status || { text: value, color: 'default' };
  },

  // Credit score formatting
  creditScore: (value) => {
    if (value === null || value === undefined || isNaN(value)) return '--';
    const score = Number(value);
    let rating = '';
    let color = 'default';

    if (score >= 800) {
      rating = 'Excellent';
      color = 'success';
    } else if (score >= 740) {
      rating = 'Very Good';
      color = 'info';
    } else if (score >= 670) {
      rating = 'Good';
      color = 'primary';
    } else if (score >= 580) {
      rating = 'Fair';
      color = 'warning';
    } else {
      rating = 'Poor';
      color = 'error';
    }

    return { score, rating, color };
  },

  // File size formatting
  fileSize: (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  // Term formatting (months to years)
  loanTerm: (months) => {
    if (!months || isNaN(months)) return '--';
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${months} months`;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
  },

  // Risk level formatting
  riskLevel: (value) => {
    if (!value) return { text: '--', color: 'default' };
    
    const riskMap = {
      low: { color: 'success', text: 'Low Risk' },
      medium: { color: 'warning', text: 'Medium Risk' },
      high: { color: 'error', text: 'High Risk' },
      minimal: { color: 'info', text: 'Minimal Risk' },
    };

    const risk = riskMap[value.toLowerCase()];
    return risk || { text: value, color: 'default' };
  },
};

// Column width configurations for different data types
export const columnWidths = {
  id: 100,
  checkbox: 60,
  avatar: 80,
  name: 200,
  email: 250,
  phone: 150,
  status: 120,
  date: 130,
  datetime: 180,
  currency: 140,
  percentage: 100,
  creditScore: 120,
  actions: 120,
  description: 300,
  address: 250,
};

// Responsive breakpoints for column visibility
export const responsiveColumns = {
  // Hide these columns on mobile (xs)
  hiddenXs: ['createdAt', 'updatedAt', 'description', 'address'],
  
  // Hide these columns on small tablets (sm)
  hiddenSm: ['description', 'address'],
  
  // Show only essential columns on mobile
  mobileEssential: ['name', 'status', 'actions'],
  
  // Show key columns on tablet
  tabletCore: ['name', 'email', 'status', 'date', 'actions'],
};

// Utility function to get responsive columns based on screen size
export const getResponsiveColumns = (allColumns, screenSize) => {
  switch (screenSize) {
    case 'xs':
      return allColumns.filter(col => !responsiveColumns.hiddenXs.includes(col.id));
    case 'sm':
      return allColumns.filter(col => !responsiveColumns.hiddenSm.includes(col.id));
    default:
      return allColumns;
  }
};

// Utility function to apply formatters to data
export const applyFormatters = (data, columnFormatters = {}) => {
  return data.map(row => {
    const formattedRow = { ...row };
    
    Object.keys(columnFormatters).forEach(key => {
      if (row.hasOwnProperty(key) && columnFormatters[key]) {
        formattedRow[key] = columnFormatters[key](row[key], row);
      }
    });
    
    return formattedRow;
  });
};

// Standard table configurations
export const tableConfigs = {
  users: {
    columns: [
      { id: 'name', label: 'Name', width: columnWidths.name, minWidth: 150 },
      { id: 'email', label: 'Email', width: columnWidths.email, minWidth: 200 },
      { id: 'status', label: 'Status', width: columnWidths.status, align: 'center' },
      { id: 'creditScore', label: 'Credit Score', width: columnWidths.creditScore, align: 'center' },
      { id: 'totalBorrowed', label: 'Total Borrowed', width: columnWidths.currency, align: 'right' },
      { id: 'createdDate', label: 'Created', width: columnWidths.date, align: 'center' },
      { id: 'actions', label: 'Actions', width: columnWidths.actions, align: 'center' },
    ],
    formatters: {
      totalBorrowed: formatters.currency,
      createdDate: formatters.date,
      status: formatters.status,
      creditScore: formatters.creditScore,
    },
  },

  loans: {
    columns: [
      { id: 'id', label: 'Loan ID', width: columnWidths.id, minWidth: 100 },
      { id: 'borrowerName', label: 'Borrower', width: columnWidths.name, minWidth: 150 },
      { id: 'amount', label: 'Amount', width: columnWidths.currency, align: 'right' },
      { id: 'interestRate', label: 'Rate', width: columnWidths.percentage, align: 'center' },
      { id: 'term', label: 'Term', width: 100, align: 'center' },
      { id: 'status', label: 'Status', width: columnWidths.status, align: 'center' },
      { id: 'applicationDate', label: 'Applied', width: columnWidths.date, align: 'center' },
      { id: 'actions', label: 'Actions', width: columnWidths.actions, align: 'center' },
    ],
    formatters: {
      amount: formatters.currency,
      interestRate: formatters.percentage,
      term: formatters.loanTerm,
      applicationDate: formatters.date,
      status: formatters.status,
    },
  },

  payments: {
    columns: [
      { id: 'id', label: 'Payment ID', width: columnWidths.id, minWidth: 120 },
      { id: 'loanId', label: 'Loan ID', width: columnWidths.id, minWidth: 100 },
      { id: 'amount', label: 'Amount', width: columnWidths.currency, align: 'right' },
      { id: 'method', label: 'Method', width: 120, align: 'center' },
      { id: 'status', label: 'Status', width: columnWidths.status, align: 'center' },
      { id: 'date', label: 'Date', width: columnWidths.date, align: 'center' },
      { id: 'actions', label: 'Actions', width: columnWidths.actions, align: 'center' },
    ],
    formatters: {
      amount: formatters.currency,
      date: formatters.date,
      status: formatters.status,
    },
  },
};

export default formatters;
