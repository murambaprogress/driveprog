
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StatCard from './StatCard';
import LineChart from './charts/LineChart';
import DonutChart from './charts/DonutChart';
import Loan from './Loan';
// import Payments from './Payments';
import Documents from './Documents';
import Calculator from './Calculator';
import Support from './Support';
import { mockLoans, mockPayments, mockDocuments } from '../data/mockData';
import { userPaymentHistory, loanProgressData } from '../data/chartData';
// import { exportToCsv } from '../../../../utils/exportCSV';
import { CreditCard, Clock, FileText, Home } from 'lucide-react';

interface UserDashboardProps {
	activeView?: string;
	userId?: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ activeView: propActiveView }) => {
	const navigate = useNavigate();
	const params = useParams();
	const activeView = propActiveView || (params.view as string | undefined) || 'dashboard';

	const myLoan = mockLoans.find(l => l.status === 'active') || mockLoans[0];

	const monthlyPayment = myLoan?.monthlyPayment ?? 0;
	const remaining = myLoan?.remainingBalance ?? 0;

	return (
		<div className="p-6" data-active-view={activeView}>
	<div className="mb-6">
				<h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome back</h2>
				<p className="text-gray-600">Overview of your loans, payments and documents</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
				<StatCard title="Active Loan" value={myLoan ? myLoan.id : ''} change={`${myLoan?.status ?? ''}`} icon={CreditCard as unknown as React.ComponentType} color="blue" />
				<StatCard title="Monthly Payment" value={`$${monthlyPayment.toLocaleString()}`} change="Next due soon" icon={Clock as unknown as React.ComponentType} color="green" />
				<StatCard title="Remaining Balance" value={`$${remaining.toLocaleString()}`} change="Updated" icon={Home as unknown as React.ComponentType} color="purple" />
				<StatCard title="Documents" value={mockDocuments.length} change="Upload new docs" icon={FileText as unknown as React.ComponentType} color="yellow" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				<div className="lg:col-span-2">
					<LineChart data={userPaymentHistory} title="Payment History" color="#3B82F6" height={260} />
				</div>
				<div>
					<DonutChart data={loanProgressData} title="Loan Progress" size={220} />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
				<div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
					<div className="flex items-center justify-between mb-4">
						<h3 className="text-lg font-semibold text-gray-900">Recent Payments</h3>
						<div className="flex items-center space-x-3">
							<button onClick={() => navigate('/dashboard/payments')} className="text-sm text-blue-600 hover:underline">View all</button>
							<button onClick={() => {
								// const stored = localStorage.getItem('drivecash_user_payments');
								// const payments = stored ? JSON.parse(stored) : [];
					{/*
					<button onClick={() => {
						const stored = localStorage.getItem('drivecash_user_payments');
						const payments = stored ? JSON.parse(stored) : [];
						exportToCsv('my-payments.csv', payments);
					}} className="text-sm px-3 py-1 bg-gray-100 rounded-md">Export My Payments</button>
					*/}
							}} className="text-sm px-3 py-1 bg-gray-100 rounded-md">Export My Payments</button>
						</div>
					</div>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
									<th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
									<th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Method</th>
									<th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{mockPayments.slice(0, 6).map(p => (
									<tr key={p.id} className="hover:bg-gray-50">
										<td className="py-3 px-4 text-sm text-gray-700">{new Date(p.date).toLocaleDateString()}</td>
										<td className="py-3 px-4 text-sm font-medium text-gray-900">${p.amount.toLocaleString()}</td>
										<td className="py-3 px-4 text-sm text-gray-700 capitalize">{p.method}</td>
										<td className="py-3 px-4">
											<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
												p.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
											}`}>{p.status}</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				<div className="space-y-6">
					<Documents />
					<Calculator />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="bg-white rounded-xl p-6 border border-gray-200 lg:col-span-2">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Your Loan</h3>
					<Loan />
				</div>
				<div className="bg-white rounded-xl p-6 border border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
					<Support />
				</div>
			</div>
		</div>
	);
};

export default UserDashboard;
