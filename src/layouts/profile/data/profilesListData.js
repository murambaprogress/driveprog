/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: Market Maker Zw
* Copyright 2025 Market Maker Zw

Coded by Market Maker Softwares

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import { generateCustomerId } from '../../../utils/customerIdGenerator';

// Sample customer profiles based on loan application data structure
export default [
  {
    customerId: generateCustomerId(1, "2024-03-15"),
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    city: "San Francisco",
    state: "CA",
    joinDate: "2024-03-15",
    status: "Active",
    totalLoans: 1,  
    currentBalance: 7200,
    creditScore: 695,
    vehicleMake: "Honda",
    vehicleModel: "Civic"
  },
  {
    customerId: generateCustomerId(2, "2024-01-22"),
    name: "Michael Chen",
    email: "michael.chen@gmail.com", 
    phone: "+1 (555) 234-5678",
    city: "Los Angeles",
    state: "CA",
    joinDate: "2024-01-22",
    status: "Active",
    totalLoans: 1,
    currentBalance: 12500,
    creditScore: 672,
    vehicleMake: "Toyota",
    vehicleModel: "Camry"
  },
  {
    customerId: generateCustomerId(3, "2023-11-08"),
    name: "Jessica Martinez",
    email: "jessica.martinez@outlook.com",
    phone: "+1 (555) 345-6789", 
    city: "Phoenix",
    state: "AZ",
    joinDate: "2023-11-08",
    status: "Active",
    totalLoans: 2,
    currentBalance: 15800,
    creditScore: 628,
    vehicleMake: "Ford",
    vehicleModel: "Explorer"
  },
  {
    customerId: generateCustomerId(4, "2024-05-03"),
    name: "David Rodriguez",
    email: "david.rodriguez@yahoo.com",
    phone: "+1 (555) 456-7890",
    city: "Houston", 
    state: "TX",
    joinDate: "2024-05-03",
    status: "Active",
    totalLoans: 1,
    currentBalance: 9300,
    creditScore: 708,
    vehicleMake: "Chevrolet",
    vehicleModel: "Silverado"
  },
  {
    customerId: generateCustomerId(5, "2024-02-14"),
    name: "Amanda Wilson",
    email: "amanda.wilson@icloud.com",
    phone: "+1 (555) 567-8901",
    city: "Miami",
    state: "FL", 
    joinDate: "2024-02-14",
    status: "Paid Off",
    totalLoans: 1,
    currentBalance: 0,
    creditScore: 745,
    vehicleMake: "Nissan",
    vehicleModel: "Altima"
  }
];
