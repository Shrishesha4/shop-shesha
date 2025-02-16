'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Order } from '@/types/product';

const ADMIN_UID = 'wTBlAksY1bhZyfYTqA6OGgxP8qG3';

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockItems: 0
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user && user.uid === ADMIN_UID) {
      loadOrders();
      calculateMetrics();
    }
  }, []);

  const loadOrders = async () => {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== ADMIN_UID) {
        throw new Error('Unauthorized access');
      }

      const ordersQuery = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(ordersQuery);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const calculateMetrics = async () => {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== ADMIN_UID) {
        throw new Error('Unauthorized access');
      }

      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const productsSnapshot = await getDocs(collection(db, 'products'));

      const totalOrders = ordersSnapshot.size;
      const totalRevenue = ordersSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().total,
        0
      );
      const pendingOrders = ordersSnapshot.docs.filter(
        doc => doc.data().status === 'pending'
      ).length;
      const lowStockItems = productsSnapshot.docs.filter(
        doc => doc.data().stock < 10
      ).length;

      setMetrics({
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockItems
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{metrics.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold">{metrics.pendingOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Low Stock Items</h3>
          <p className="text-3xl font-bold">{metrics.lowStockItems}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-xl font-semibold p-6 border-b dark:border-gray-700">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{order.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-green-100 text-green-800';
    case 'delivered':
      return 'bg-green-200 text-green-900';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}