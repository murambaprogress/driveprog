import React from 'react';
import { Home, FileText, CreditCard, Users, LifeBuoy, Settings, PieChart, Calendar } from 'lucide-react';

interface SidebarProps {
  userRole?: 'user' | 'admin';
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = 'user', activeView, onViewChange }) => {
  const isAdmin = userRole === 'admin';
  const common = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
  ];

  const userItems = [
    { id: 'loan', label: 'My Loans', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'calculator', label: 'Calculator', icon: PieChart },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  const adminItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'loans', label: 'Loans', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'risk', label: 'Risk', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const items = isAdmin ? [...adminItems] : [...common, ...userItems];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-full p-6">
      <div className="mb-8 flex flex-col items-center justify-center text-center">
  <div className="text-4xl font-extrabold text-drivecash-primary">DriveCash</div>
        
      </div>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${activeView === item.id ? 'bg-green-100 font-semibold' : 'hover:bg-gray-50'}`}>
            <item.icon className={`w-4 h-4 text-drivecash-primary`} />
            <span className="text-sm text-drivecash-primary">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

