import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Users, Truck, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

import StatCard from '../../components/dashboard/StatCard';
import RecentActivityCard from '../../components/dashboard/RecentActivityCard';
import ProductAlertCard from '../../components/dashboard/ProductAlertCard';

import { RevenueChart, ProductDistributionChart } from '../../components/dashboard/DashboardCharts';

const DashboardPage = () => {
     const [stats, setStats] = useState({
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          totalCustomers: 0,
          totalSuppliers: 0,
          lowStockItems: []
     });
     const [activities, setActivities] = useState([]);
     const [loading, setLoading] = useState(true);

     const fetchDashboardData = async () => {
          try {
               setLoading(true);
               
               const [statsResponse, activitiesResponse] = await Promise.all([
                    fetch('http://localhost:5000/api/dashboard/stats'),
                    fetch('http://localhost:5000/api/dashboard/activities')
               ]);

               if (!statsResponse.ok || !activitiesResponse.ok) {
                    throw new Error('Failed to fetch dashboard data');
               }

               const statsData = await statsResponse.json();
               const activitiesData = await activitiesResponse.json();

               setStats(statsData.data);
               setActivities(activitiesData.data);
          } catch (error) {
               console.error('Error fetching dashboard data:', error);
               toast.error('Failed to load dashboard data');
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchDashboardData();
          
          // Set up polling for real-time updates
          const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
          
          return () => clearInterval(interval);
     }, []);

     if (loading) {
          return (
               <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
               </div>
          );
     }

     return (
          <div className="space-y-6">
               <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                         title="Total Products"
                         value={stats.totalProducts.toString()}
                         icon={<Package size={24} />}
                    />
                    <StatCard
                         title="Total Sales"
                         value={stats.totalSales.toString()}
                         icon={<ShoppingBag size={24} />}
                    />
                    <StatCard
                         title="Customers"
                         value={stats.totalCustomers.toString()}
                         icon={<Users size={24} />}
                    />
                    <StatCard
                         title="Suppliers"
                         value={stats.totalSuppliers.toString()}
                         icon={<Truck size={24} />}
                    />
                    <StatCard
                         title="Total Revenue"
                         value={`$${stats.totalRevenue.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                         })}`}
                         icon={<DollarSign size={24} />}
                    />
                    <StatCard
                         title="Low Stock Items"
                         value={stats.lowStockItems.length.toString()}
                         icon={<Package size={24} />}
                    />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                         <RevenueChart />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                         <ProductDistributionChart />
                    </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProductAlertCard products={stats.lowStockItems.map(item => ({
                         id: item.id,
                         name: item.name,
                         quantity: item.quantity,
                         status: item.quantity === 0 ? 'out-of-stock' : 'low-stock'
                    }))} />
                    <RecentActivityCard activities={activities} />
               </div>
          </div>
     );
};

export default DashboardPage;