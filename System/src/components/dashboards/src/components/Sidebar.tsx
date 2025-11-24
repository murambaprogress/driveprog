import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  CreditCard, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  HelpCircle,
  Car,
  DollarSign,
  Calendar,
  Shield
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  userRole: 'user' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, userRole }) => {
  const userMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'loan', label: 'My Loan', icon: Car },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'calculator', label: 'Calculator', icon: DollarSign },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ];

  const adminMenuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'loans', label: 'Loan Management', icon: Car },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'risk', label: 'Risk Management', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;
  const navigate = useNavigate();

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                try { onViewChange && onViewChange(item.id); } catch {}
                const base = userRole === 'admin' ? '/admin' : '/dashboard';
                const target = item.id === (userRole === 'admin' ? 'overview' : 'dashboard') ? base : `${base}/${item.id}`;
                navigate(target);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 shadow-lg' 
                    : 'hover:bg-gray-800'
                }`}
            >
                <Icon className="w-5 h-5 text-drivecash-primary" />
                <span className="font-medium text-drivecash-primary">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};