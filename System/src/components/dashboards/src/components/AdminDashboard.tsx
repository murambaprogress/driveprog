import React, { useState, useEffect } from 'react';
// import { StatCard } from './StatCard';
// import { LineChart } from './charts/LineChart';
// import { BarChart } from './charts/BarChart';
// import { DonutChart } from './charts/DonutChart';
// import { MetricCard } from './charts/MetricCard';
// import { Users, DollarSign, TrendingUp, AlertTriangle, Car, CreditCard, FileText, CheckCircle, XCircle, Clock, Eye, Edit, Trash2, Calendar, Shield, Settings, Plus, Search, Filter, Download, Upload, Phone, Mail, MapPin } from 'lucide-react';
// import { mockStats, mockLoans, mockUsers, mockPayments, mockApplications, mockCalendarEvents } from '../data/mockData';
// import { exportToCsv } from '../../../utils/exportCSV';
// import { paymentTrendData, loanStatusData, monthlyRevenueData, riskDistributionData, adminMetricsTrends, paymentMethodData, applicationStatusData, monthlyApplicationsData, portfolioPerformanceData } from '../data/chartData';
// import { useParams } from 'react-router-dom';

interface AdminDashboardProps {
  activeView?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeView: propActiveView }) => {
  const params = useParams();
  const activeView = propActiveView || (params.view as string | undefined) || 'overview';
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // Use stateful copies of mock data so admin actions persist to localStorage
  const [loans, setLoans] = useState(() => {
  try { return JSON.parse(localStorage.getItem('drivecash_admin_loans') || 'null') || mockLoans; } catch { return mockLoans; }
  });
  const [users, setUsers] = useState(() => {
  try { return JSON.parse(localStorage.getItem('drivecash_admin_users') || 'null') || mockUsers; } catch { return mockUsers; }
  });
  const [payments, setPayments] = useState(() => {
  try { return JSON.parse(localStorage.getItem('drivecash_admin_payments') || 'null') || mockPayments; } catch { return mockPayments; }
  });
  const [applications, setApplications] = useState(() => {
  try { return JSON.parse(localStorage.getItem('drivecash_admin_applications') || 'null') || mockApplications; } catch { return mockApplications; }
  });
  // const [calendarEvents, setCalendarEvents] = useState(() => {
  //   try { return JSON.parse(localStorage.getItem('drivecash_admin_calendar') || 'null') || mockCalendarEvents; } catch { return mockCalendarEvents; }
  // });

  useEffect(() => {
  try { localStorage.setItem('drivecash_admin_loans', JSON.stringify(loans)); } catch {}
  }, [loans]);
  useEffect(() => {
  try { localStorage.setItem('drivecash_admin_users', JSON.stringify(users)); } catch {}
  }, [users]);
  useEffect(() => {
  try { localStorage.setItem('drivecash_admin_applications', JSON.stringify(applications)); } catch {}
  }, [applications]);
  useEffect(() => {
  try { localStorage.setItem('drivecash_admin_payments', JSON.stringify(payments)); } catch {}
  }, [payments]);

  if (activeView === 'overview') {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Overview</h2>
          <p className="text-gray-600">Monitor your loan portfolio and business metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${(mockStats.totalRevenue / 1000000).toFixed(1)}M`}
            change="+8.5% from last month"
            changeType="positive"
            icon={DollarSign}
            color="#10B981"
            trend={adminMetricsTrends.totalRevenue}
          />
          <MetricCard
            title="Active Loans"
            value={mockStats.activeLoans}
            change="+12 this month"
            changeType="positive"
            icon={Car}
            color="#3B82F6"
            trend={adminMetricsTrends.activeLoans}
          />
          <MetricCard
            title="Avg Loan Amount"
            value={`$${mockStats.avgLoanAmount.toLocaleString()}`}
            change="+5.2% from last month"
            changeType="positive"
            icon={TrendingUp}
            color="#8B5CF6"
            trend={adminMetricsTrends.avgLoanAmount}
          />
          <MetricCard
            title="Default Rate"
            value={`${mockStats.defaultRate}%`}
            change="-0.8% from last month"
            changeType="positive"
            icon={AlertTriangle}
            color="#F59E0B"
            trend={adminMetricsTrends.defaultRate}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LineChart 
            data={paymentTrendData}
            title="Monthly Payment Collections"
            color="#10B981"
            height={250}
          />
          
          <DonutChart
            data={loanStatusData}
            title="Loan Portfolio Status"
            size={200}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <BarChart
            data={monthlyRevenueData}
            title="Quarterly Revenue"
            height={200}
          />
          
          <DonutChart
            data={paymentMethodData}
            title="Payment Methods"
            size={180}
          />
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Collection Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">96%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Satisfaction</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-blue-600">94%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing Time</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-purple-600">2.3 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Loan Applications</h3>
            <div className="space-y-4">
              {mockLoans.slice(0, 3).map((loan) => {
                const user = mockUsers.find(u => u.id === loan.userId);
                return (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-600">${loan.amount.toLocaleString()} - {loan.vehicleInfo.year} {loan.vehicleInfo.make}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {loan.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">On Time Payments</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">85%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Late Payments</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '12%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">12%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Missed Payments</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-red-600">3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">New Loan</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Add User</span>
            </button>
            <button onClick={() => exportToCsv('loans.csv', loans)} className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Download className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Export Loans</span>
            </button>
            <button onClick={() => exportToCsv('payments.csv', payments)} className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Download className="w-5 h-5 text-indigo-600" />
              <span className="font-medium text-indigo-900">Export Payments</span>
            </button>
            <button onClick={() => exportToCsv('users.csv', users)} className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <FileText className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">Export Users</span>
            </button>
            <button onClick={() => exportToCsv('applications.csv', applications)} className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-emerald-900">Export Applications</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal for selected loan or user
  const SelectedModal: React.FC = () => {
    if (!selectedLoan && !selectedUser) return null;
    const loan = loans.find((l: any) => l.id === selectedLoan);
    const user = users.find((u: any) => u.id === selectedUser);

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{loan ? `Loan ${loan.id}` : `User ${user?.name}`}</h3>
            <button onClick={() => { setSelectedLoan(null); setSelectedUser(null); }} className="text-gray-500">Close</button>
          </div>
          {loan && (
            <div className="space-y-3">
              <div><strong>Amount:</strong> ${loan.amount.toLocaleString()}</div>
              <div><strong>Status:</strong> {loan.status}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => {
                  setLoans((prev: any[]) => prev.map((l: any) => l.id === loan.id ? { ...l, status: 'active' } : l));
                  setSelectedLoan(null);
                }} className="px-3 py-2 bg-green-600 text-white rounded">Mark Active</button>
                <button onClick={() => {
                  setLoans((prev: any[]) => prev.map((l: any) => l.id === loan.id ? { ...l, status: 'paid_off' } : l));
                  setSelectedLoan(null);
                }} className="px-3 py-2 bg-blue-600 text-white rounded">Mark Paid</button>
                <button onClick={() => {
                  setLoans((prev: any[]) => prev.map((l: any) => l.id === loan.id ? { ...l, status: 'defaulted' } : l));
                  setSelectedLoan(null);
                }} className="px-3 py-2 bg-red-600 text-white rounded">Mark Defaulted</button>
              </div>
            </div>
          )}
          {user && (
            <div className="space-y-3">
              <div><strong>Name:</strong> {user.name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setUsers((prev: any[]) => prev.map((u: any) => u.id === user.id ? { ...u, status: 'active' } : u)); setSelectedUser(null); }} className="px-3 py-2 bg-green-600 text-white rounded">Activate</button>
                <button onClick={() => { setUsers((prev: any[]) => prev.map((u: any) => u.id === user.id ? { ...u, status: 'inactive' } : u)); setSelectedUser(null); }} className="px-3 py-2 bg-yellow-600 text-white rounded">Set Inactive</button>
                <button onClick={() => { setUsers((prev: any[]) => prev.filter((u: any) => u.id !== user.id)); setSelectedUser(null); }} className="px-3 py-2 bg-red-600 text-white rounded">Delete User</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Details modal for applications and payments
  const SelectedDetailModal: React.FC = () => {
    if (!selectedApplication && !selectedPayment) return null;
    const application = applications.find((a: any) => a.id === selectedApplication);
    const payment = payments.find((p: any) => p.id === selectedPayment);

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{application ? `Application ${application.id}` : `Payment ${payment?.id}`}</h3>
            <button onClick={() => { setSelectedApplication(null); setSelectedPayment(null); }} className="text-gray-500">Close</button>
          </div>
          {application && (
            <div className="space-y-3">
              <div><strong>Name:</strong> {application.applicantName}</div>
              <div><strong>Email:</strong> {application.email}</div>
              <div><strong>Requested:</strong> ${application.requestedAmount.toLocaleString()}</div>
              <div><strong>Credit Score:</strong> {application.creditScore}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setApplications((prev: any[]) => prev.map((a: any) => a.id === application.id ? { ...a, status: 'approved' } : a))} className="px-3 py-2 bg-green-600 text-white rounded">Approve</button>
                <button onClick={() => setApplications((prev: any[]) => prev.map((a: any) => a.id === application.id ? { ...a, status: 'rejected' } : a))} className="px-3 py-2 bg-red-600 text-white rounded">Reject</button>
              </div>
            </div>
          )}
          {payment && (
            <div className="space-y-3">
              <div><strong>Payment ID:</strong> {payment.id}</div>
              <div><strong>Loan ID:</strong> {payment.loanId}</div>
              <div><strong>Amount:</strong> ${payment.amount.toLocaleString()}</div>
              <div><strong>Date:</strong> {new Date(payment.date).toLocaleDateString()}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setPayments((prev: any[]) => prev.map((p: any) => p.id === payment.id ? { ...p, status: 'completed' } : p))} className="px-3 py-2 bg-green-600 text-white rounded">Mark Completed</button>
                <button onClick={() => setPayments((prev: any[]) => prev.map((p: any) => p.id === payment.id ? { ...p, status: 'refunded' } : p))} className="px-3 py-2 bg-red-600 text-white rounded">Refund</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (activeView === 'loans') {
    const filteredLoans = mockLoans.filter(loan => {
      const matchesSearch = searchTerm === '' || 
        loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mockUsers.find(u => u.id === loan.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || loan.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Loan Management</h2>
              <p className="text-gray-600">Manage all active and pending loans</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Loan Application</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search loans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="paid_off">Paid Off</option>
                  <option value="defaulted">Defaulted</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Loan ID</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Borrower</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Vehicle</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Balance</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-6 text-center text-gray-500 align-middle">
                      No loans found
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => {
                  const user = mockUsers.find(u => u.id === loan.userId);
                  return (
                    <tr key={loan.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 align-middle">{loan.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 align-middle">{user?.name || 'Unknown User'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-middle">
                        {loan.vehicleInfo?.year} {loan.vehicleInfo?.make} {loan.vehicleInfo?.model}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 align-middle">
                        ${loan.amount?.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                        ${loan.remainingBalance?.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          loan.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : loan.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : loan.status === 'paid_off'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {loan.status?.replace('_', ' ') || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedLoan(loan.id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'users') {
    const filteredUsers = mockUsers.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesFilter && user.role === 'user';
    });

    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">User Management</h2>
              <p className="text-gray-600">Manage customer accounts and profiles</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={mockUsers.filter(u => u.role === 'user').length}
            icon={Users}
            color="#3B82F6"
          />
          <MetricCard
            title="Active Users"
            value={mockUsers.filter(u => u.status === 'active' && u.role === 'user').length}
            icon={CheckCircle}
            color="#10B981"
          />
          <MetricCard
            title="New This Month"
            value="5"
            icon={TrendingUp}
            color="#8B5CF6"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
            <LineChart 
              data={[
                { label: 'Jan', value: 45 },
                { label: 'Feb', value: 52 },
                { label: 'Mar', value: 48 },
                { label: 'Apr', value: 61 },
                { label: 'May', value: 55 },
                { label: 'Jun', value: 67 }
              ]}
              title=""
              color="#8B5CF6"
              height={180}
            />
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibent text-gray-900 mb-4">User Status Distribution</h3>
            <DonutChart
              data={[
                { label: 'Active', value: mockUsers.filter(u => u.status === 'active' && u.role === 'user').length, color: '#10B981' },
                { label: 'Pending', value: mockUsers.filter(u => u.status === 'pending' && u.role === 'user').length, color: '#F59E0B' },
                { label: 'Inactive', value: mockUsers.filter(u => u.status === 'inactive' && u.role === 'user').length, color: '#6B7280' }
              ]}
              title=""
              size={150}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Name</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Email</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Phone</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Join Date</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-gray-500 align-middle">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 align-middle">{user.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-middle">{user.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-middle">{user.phone}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-middle">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 align-middle">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 align-middle">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => setSelectedUser(user.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:bg-gray-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'payments') {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h2>
          <p className="text-gray-600">Monitor and manage all loan payments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Payments"
            value={mockPayments.length}
            icon={CreditCard}
            color="#3B82F6"
          />
          <MetricCard
            title="This Month"
            value={`$${mockPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`}
            icon={DollarSign}
            color="#10B981"
          />
          <MetricCard
            title="Pending"
            value={mockPayments.filter(p => p.status === 'pending').length}
            icon={Clock}
            color="#F59E0B"
          />
          <MetricCard
            title="Failed"
            value={mockPayments.filter(p => p.status === 'failed').length}
            icon={XCircle}
            color="#EF4444"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LineChart 
            data={paymentTrendData}
            title="Payment Volume Trend"
            color="#3B82F6"
            height={200}
          />
          
          <DonutChart
            data={paymentMethodData}
            title="Payment Method Distribution"
            size={180}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Payment ID</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Loan ID</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Date</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Method</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-6 text-center text-gray-500 align-middle">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  mockPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 align-middle">{payment.id}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-middle">{payment.loanId}</td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 align-middle">
                        ${payment.amount?.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-middle">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 capitalize align-middle">{payment.method}</td>
                      <td className="py-4 px-6 align-middle">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setSelectedPayment(payment.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'completed' } : p))} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPayments(prev => prev.map(p => p.id === payment.id ? { ...p, status: 'refunded' } : p))} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'applications') {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Loan Applications</h2>
          <p className="text-gray-600">Review and process new loan applications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Applications"
            value={mockApplications.length}
            icon={FileText}
            color="#3B82F6"
          />
          <MetricCard
            title="Under Review"
            value={mockApplications.filter(a => a.status === 'under_review').length}
            icon={Clock}
            color="#F59E0B"
          />
          <MetricCard
            title="Approved"
            value={mockApplications.filter(a => a.status === 'approved').length}
            icon={CheckCircle}
            color="#10B981"
          />
          <MetricCard
            title="Rejected"
            value={mockApplications.filter(a => a.status === 'rejected').length}
            icon={XCircle}
            color="#EF4444"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LineChart 
            data={monthlyApplicationsData}
            title="Monthly Application Volume"
            color="#8B5CF6"
            height={200}
          />
          
          <DonutChart
            data={applicationStatusData}
            title="Application Status Distribution"
            size={180}
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Applicant</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Amount</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Vehicle</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Credit Score</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Income</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Status</th>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase align-middle">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockApplications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-6 text-center text-gray-500 align-middle">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  mockApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6 align-middle">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{application.applicantName}</p>
                          <p className="text-sm text-gray-600">{application.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 align-middle">
                        ${application.requestedAmount?.toLocaleString() || '0'}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 align-middle">
                        {application.vehicleYear} {application.vehicleMake} {application.vehicleModel}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 align-middle">{application.creditScore}</td>
                      <td className="py-4 px-6 text-sm text-gray-900 align-middle">
                      ${application.monthlyIncome.toLocaleString()}/mo
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        application.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : application.status === 'under_review'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setSelectedApplication(application.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setApplications(prev => prev.map(a => a.id === application.id ? { ...a, status: 'approved' } : a))} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setApplications(prev => prev.map(a => a.id === application.id ? { ...a, status: 'rejected' } : a))} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'calendar') {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Calendar & Events</h2>
          <p className="text-gray-600">Track important dates and scheduled events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">December 2024</h3>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <span className="sr-only">Previous month</span>
                    ←
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <span className="sr-only">Next month</span>
                    →
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                  const hasEvent = mockCalendarEvents.some(event => 
                    new Date(event.date).getDate() === day
                  );
                  return (
                    <div key={day} className={`p-2 text-center text-sm hover:bg-gray-100 rounded cursor-pointer ${
                      hasEvent ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Overall Risk Score</span>
                  <span className="text-lg font-bold text-yellow-600">7.2/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div className="space-y-3">
                {mockCalendarEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${
                      event.type === 'payment' ? 'bg-green-500' : 
                      event.type === 'review' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{event.title}</p>
                      <p className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                      {event.amount && (
                        <p className="text-xs text-green-600">${event.amount}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Event</h3>
              <form className="space-y-3">
                <input
                  type="text"
                  placeholder="Event title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Payment</option>
                  <option>Review</option>
                  <option>Inspection</option>
                  <option>Meeting</option>
                </select>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Add Event
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'risk') {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Risk Management</h2>
          <p className="text-gray-600">Monitor and assess portfolio risk factors</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Portfolio Risk Score"
            value="7.2/10"
            icon={Shield}
            color="#F59E0B"
          />
          <MetricCard
            title="High Risk Loans"
            value="12"
            icon={AlertTriangle}
            color="#EF4444"
          />
          <MetricCard
            title="Default Probability"
            value="3.2%"
            icon={TrendingUp}
            color="#F59E0B"
          />
          <MetricCard
            title="Recovery Rate"
            value="78%"
            icon={CheckCircle}
            color="#10B981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LineChart 
            data={portfolioPerformanceData}
            title="Portfolio Performance (%)"
            color="#10B981"
            height={200}
          />
          
          <DonutChart
            data={riskDistributionData}
            title="Risk Distribution"
            size={180}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Low Risk (Score 1-3)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-green-600">65%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Medium Risk (Score 4-6)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">25%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">High Risk (Score 7-10)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-red-600">10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Factors</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-900">Late Payments Increasing</span>
                </div>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">High</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-900">Economic Indicators</span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Medium</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-900">Collateral Values Stable</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'settings') {
    return (
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">System Settings</h2>
          <p className="text-gray-600">Configure system preferences and business rules</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Parameters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Loan Amount</label>
                  <input
                    type="number"
                    defaultValue={25000}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Credit Score</label>
                  <input
                    type="number"
                    defaultValue={550}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum LTV Ratio (%)</label>
                  <input
                    type="number"
                    defaultValue={80}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-2">Quick Presets for testing</div>
                  <div className="flex gap-2">
                    <button onClick={() => { /* preset: 8% / 12 */ }} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">8% · 12mo</button>
                    <button onClick={() => { /* preset: 11.5% / 36 */ }} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">11.5% · 36mo</button>
                    <button onClick={() => { /* preset: 25% / 60 */ }} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm">25% · 60mo</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Rates</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Interest Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue="12.5"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Adjustment Range (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    defaultValue="5.0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Payment Reminders</p>
                    <p className="text-sm text-gray-600">Send automatic payment reminders</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Late Payment Alerts</p>
                    <p className="text-sm text-gray-600">Alert when payments are overdue</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Application Updates</p>
                    <p className="text-sm text-gray-600">Notify on new applications</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Require 2FA for admin access</p>
                  </div>
                  <input type="checkbox" defaultChecked className="rounded" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Session Timeout</p>
                    <p className="text-sm text-gray-600">Auto-logout after inactivity</p>
                  </div>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600">The requested page could not be found.</p>
      </div>
    </div>
  );
};