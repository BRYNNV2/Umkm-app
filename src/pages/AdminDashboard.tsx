import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  LogOut,
  Flame,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  User,
  Phone,
  MessageSquare,
  Calendar,
  Package,
  LayoutDashboard,
  UtensilsCrossed,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, MenuItem } from '../types';
import MenuManagement from '../components/admin/MenuManagement';
import ConfirmModal from '../components/ConfirmModal';

interface OrderWithItems extends Order {
  order_items: (OrderItem & { menu_item?: MenuItem })[];
}

interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  totalOrders: number;
  todayOrders: number;
  weeklyOrders: number;
  monthlyOrders: number;
  pendingOrders: number;
  completedOrders: number;
  avgOrderValue: number;
}

interface Recap {
  id: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_orders: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes: string;
  rejection_reason?: string;
}

const AdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
    totalOrders: 0,
    todayOrders: 0,
    weeklyOrders: 0,
    monthlyOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    avgOrderValue: 0,
  });
  const [recaps, setRecaps] = useState<Recap[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportDateRange, setExportDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    notes: '',
    items: [] as { menu_item_id: string; quantity: number; spicy_level: number }[],
  });


  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'danger' as 'danger' | 'warning' | 'info'
  });

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
    } else {
      fetchOrders();
      fetchMenuItems();
      fetchRecaps();
    }
  }, [user, navigate]);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const calculateStats = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedOrders = orders.filter((o) => o.status === 'completed');

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0);

    const todayRevenue = completedOrders
      .filter((o) => o.created_at.startsWith(today))
      .reduce((sum, order) => sum + order.total_amount, 0);

    const weeklyRevenue = completedOrders
      .filter((o) => new Date(o.created_at) >= weekAgo)
      .reduce((sum, order) => sum + order.total_amount, 0);

    const monthlyRevenue = completedOrders
      .filter((o) => new Date(o.created_at) >= monthAgo)
      .reduce((sum, order) => sum + order.total_amount, 0);

    const todayOrders = orders.filter((o) => o.created_at.startsWith(today)).length;
    const weeklyOrders = orders.filter((o) => new Date(o.created_at) >= weekAgo).length;
    const monthlyOrders = orders.filter((o) => new Date(o.created_at) >= monthAgo).length;

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

    setStats({
      totalRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      totalOrders: orders.length,
      todayOrders,
      weeklyOrders,
      monthlyOrders,
      pendingOrders,
      completedOrders: completedOrders.length,
      avgOrderValue,
    });
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (
            *,
            menu_item:menu_items (*)
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('category')
        .order('name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchRecaps = async () => {
    try {
      const { data, error } = await supabase
        .from('recaps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecaps(data || []);
    } catch (error) {
      console.error('Error fetching recaps:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { menu_item_id: menuItems[0]?.id || '', quantity: 1, spicy_level: 2 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Tambahkan minimal 1 item');
      return;
    }

    try {
      const totalAmount = formData.items.reduce((sum, item) => {
        const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
        return sum + (menuItem?.price || 0) * item.quantity;
      }, 0);

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          order_type: 'offline',
          total_amount: totalAmount,
          status: 'completed',
          notes: formData.notes || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = formData.items.map((item) => {
        const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
        return {
          order_id: orderData.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price: menuItem?.price || 0,
          spicy_level: item.spicy_level,
        };
      });

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      setShowAddOrderModal(false);
      setFormData({ customer_name: '', customer_phone: '', notes: '', items: [] });
      fetchOrders();
      alert('Pesanan berhasil ditambahkan!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Terjadi kesalahan saat menambahkan pesanan');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Pesanan',
      message: 'Yakin ingin menghapus pesanan ini?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('orders').delete().eq('id', orderId);

          if (error) throw error;
          fetchOrders();

        } catch (error) {
          console.error('Error deleting order:', error);
          alert('Terjadi kesalahan saat menghapus pesanan');
        }
      }
    });
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat mengupdate status');
    }
  };

  const handleRequestRecap = async (period: 'all' | 'today' | 'week' | 'month' | 'custom') => {
    let filteredOrders = orders.filter((o) => o.status === 'completed');
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    let startDate = '';
    let endDate = today;

    if (period === 'today') {
      filteredOrders = filteredOrders.filter((o) => o.created_at.startsWith(today));
      startDate = today;
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = filteredOrders.filter((o) => new Date(o.created_at) >= weekAgo);
      startDate = weekAgo.toISOString().split('T')[0];
    } else if (period === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredOrders = filteredOrders.filter((o) => new Date(o.created_at) >= monthAgo);
      startDate = monthAgo.toISOString().split('T')[0];
    } else if (period === 'custom' && exportDateRange.startDate && exportDateRange.endDate) {
      filteredOrders = filteredOrders.filter(
        (o) =>
          o.created_at >= exportDateRange.startDate && o.created_at <= exportDateRange.endDate + 'T23:59:59'
      );
      startDate = exportDateRange.startDate;
      endDate = exportDateRange.endDate;
    } else {
      // All time
      startDate = '2020-01-01';
    }

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = filteredOrders.length;

    try {
      const { error } = await supabase.from('recaps').insert({
        period_start: startDate,
        period_end: endDate,
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        status: 'pending',
        created_by: user?.id,
        notes: `Rekap ${period}`
      });

      if (error) throw error;

      alert('Permintaan rekap berhasil dikirim ke Manager!');
      setShowExportModal(false);
      fetchRecaps();
    } catch (error) {
      console.error('Error requesting recap:', error);
      alert('Gagal mengirim permintaan rekap');
    }
  };

  const handleDownloadRecap = (recap: Recap) => {
    let filteredOrders = orders.filter((o) => o.status === 'completed');

    // Filter by date range of the recap
    filteredOrders = filteredOrders.filter(
      (o) =>
        o.created_at.split('T')[0] >= recap.period_start &&
        o.created_at.split('T')[0] <= recap.period_end
    );

    const excelData = filteredOrders.map((order) => ({
      Tanggal: new Date(order.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      'Nama Pelanggan': order.customer_name,
      Telepon: order.customer_phone,
      'Tipe Pesanan': order.order_type === 'online' ? 'Online' : 'Offline',
      'Total Pesanan': order.total_amount,
      Status: order.status,
      Catatan: order.notes || '-',
    }));

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = filteredOrders.length;

    excelData.push({
      Tanggal: '',
      'Nama Pelanggan': '',
      Telepon: '',
      'Tipe Pesanan': '',
      'Total Pesanan': 0,
      Status: 'pending',
      Catatan: '',
    });

    excelData.push({
      Tanggal: 'RINGKASAN',
      'Nama Pelanggan': `Total Pesanan: ${totalOrders}`,
      Telepon: '',
      'Tipe Pesanan': '',
      'Total Pesanan': totalRevenue,
      Status: 'completed',
      Catatan: '',
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 12 },
      { wch: 30 },
    ];

    const fileName = `Laporan_Penjualan_${recap.period_start}_${recap.period_end}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleDeleteRecap = async (recapId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Rekap',
      message: 'Yakin ingin menghapus rekap ini?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('recaps').delete().eq('id', recapId);

          if (error) throw error;
          fetchRecaps();
          alert('Rekap berhasil dihapus!');
        } catch (error) {
          console.error('Error deleting recap:', error);
          alert('Terjadi kesalahan saat menghapus rekap');
        }
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-xs text-gray-500">Ayam Geprek Management</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'dashboard'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'orders'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Pesanan</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${activeTab === 'menu'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>Menu</span>
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                <span>Request Rekap</span>
              </button>
            </div>

            {/* Recaps List */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Status Rekap Penjualan</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Periode</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recaps.map((recap) => (
                      <tr key={recap.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(recap.period_start).toLocaleDateString('id-ID')} - {new Date(recap.period_end).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-800">
                          {formatPrice(recap.total_revenue)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${recap.status === 'approved' ? 'bg-green-100 text-green-700' :
                              recap.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {recap.status === 'approved' ? 'Disetujui' :
                                recap.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                            </span>
                            {recap.status === 'rejected' && recap.rejection_reason && (
                              <span className="text-xs text-red-600 italic mt-1 max-w-[200px] break-words">
                                "{recap.rejection_reason}"
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {recap.status === 'approved' && (
                              <button
                                onClick={() => handleDownloadRecap(recap)}
                                className="text-green-600 hover:text-green-800 font-medium text-sm flex items-center space-x-1 bg-green-50 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteRecap(recap.id)}
                              className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center justify-center bg-red-50 p-1.5 rounded hover:bg-red-100 transition-colors"
                              title="Hapus Rekap"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {recaps.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-500">Belum ada request rekap</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-green-100 text-sm mb-1">Total Pemasukan</p>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-blue-100 text-sm mb-1">Pemasukan Hari Ini</p>
                <p className="text-2xl font-bold">{formatPrice(stats.todayRevenue)}</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-indigo-100 text-sm mb-1">Pemasukan Minggu Ini</p>
                <p className="text-2xl font-bold">{formatPrice(stats.weeklyRevenue)}</p>
                <p className="text-xs text-indigo-200 mt-1">Pesanan: {stats.weeklyOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-pink-100 text-sm mb-1">Pemasukan Bulan Ini</p>
                <p className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</p>
                <p className="text-xs text-pink-200 mt-1">Pesanan: {stats.monthlyOrders}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-purple-100 text-sm mb-1">Total Pesanan</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
                <p className="text-xs text-purple-200 mt-1">Hari ini: {stats.todayOrders}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Package className="w-8 h-8" />
                </div>
                <p className="text-orange-100 text-sm mb-1">Status Pesanan</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                <p className="text-xs text-orange-200 mt-1">Pending</p>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8" />
                </div>
                <p className="text-teal-100 text-sm mb-1">Rata-rata Pesanan</p>
                <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
                <p className="text-xs text-teal-200 mt-1">Per transaksi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Statistik Penjualan</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Pesanan Selesai</span>
                    <span className="text-2xl font-bold text-green-600">{stats.completedOrders}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Rata-rata Nilai Pesanan</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(stats.avgOrderValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">Pesanan Pending</span>
                    <span className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</span>
                  </div>
                </div>
              </div>

              {/* Sales Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Grafik Pendapatan (7 Hari Terakhir)</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={Array.from({ length: 7 }, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        return d.toISOString().split('T')[0];
                      }).reverse().map(date => {
                        const dayOrders = orders.filter(o =>
                          o.created_at.startsWith(date) && o.status !== 'cancelled'
                        );
                        return {
                          date: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
                          total: dayOrders.reduce((sum, order) => sum + order.total_amount, 0)
                        };
                      })}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [formatPrice(value), 'Pendapatan']}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, fill: '#ef4444' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Pesanan Terbaru</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-800">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatPrice(order.total_amount)}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h2>
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Tambah Pesanan Offline</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pelanggan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Telepon</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipe</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Pembayaran</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800">{order.customer_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{order.customer_phone}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${order.order_type === 'online'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                            }`}
                        >
                          {order.order_type === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${order.payment_method === 'qris' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.payment_method === 'transfer' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}>
                          {order.payment_method === 'qris' ? 'QRIS' :
                            order.payment_method === 'transfer' ? 'Transfer' : 'Tunai'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-red-600">
                        {formatPrice(order.total_amount)}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-2 cursor-pointer ${order.status === 'completed'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : order.status === 'cancelled'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Selesai</option>
                          <option value="cancelled">Dibatalkan</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowEditModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {orders.length === 0 && (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada pesanan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'menu' && <MenuManagement />}
      </div>

      {showAddOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 shadow-2xl">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tambah Pesanan Offline</h2>
                <button
                  onClick={() => setShowAddOrderModal(false)}
                  className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Nama Pelanggan</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    placeholder="Nama pelanggan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Nomor Telepon</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Catatan</span>
                  </div>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                  placeholder="Catatan pesanan (opsional)"
                />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800">Item Pesanan</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Item</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-xl">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Menu
                          </label>
                          <select
                            value={item.menu_item_id}
                            onChange={(e) => handleItemChange(index, 'menu_item_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                          >
                            {menuItems.map((menuItem) => (
                              <option key={menuItem.id} value={menuItem.id}>
                                {menuItem.name} - {formatPrice(menuItem.price)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Jumlah
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none text-sm"
                          />
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.items.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Belum ada item. Klik "Tambah Item" untuk menambahkan.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-xl">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(
                    formData.items.reduce((sum, item) => {
                      const menuItem = menuItems.find((m) => m.id === item.menu_item_id);
                      return sum + (menuItem?.price || 0) * item.quantity;
                    }, 0)
                  )}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105"
              >
                Simpan Pesanan
              </button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Detail Pesanan</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Nama Pelanggan</p>
                  <p className="font-bold text-gray-800">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">No. Telepon</p>
                  <p className="font-bold text-gray-800">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipe Pesanan</p>
                  <p className="font-bold text-gray-800 capitalize">{selectedOrder.order_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-bold text-gray-800">
                    {new Date(selectedOrder.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Catatan</p>
                  <p className="bg-gray-50 p-3 rounded-lg text-gray-800">{selectedOrder.notes}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Item Pesanan</h3>
                <div className="space-y-2">
                  {selectedOrder.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{item.menu_item?.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-bold text-red-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                <span className="font-bold text-gray-800 text-lg">Total</span>
                <span className="text-2xl font-bold text-red-600">
                  {formatPrice(selectedOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Export Laporan Excel</h2>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Pilih periode laporan yang ingin diexport ke Excel
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleRequestRecap('all')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 p-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold">Semua Data</p>
                    <p className="text-sm text-gray-500">Request rekap semua pesanan completed</p>
                  </div>
                  <Download className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>

                <button
                  onClick={() => handleRequestRecap('today')}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-800 p-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold">Laporan Harian</p>
                    <p className="text-sm text-blue-600">
                      Pemasukan: {formatPrice(stats.todayRevenue)}
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-blue-400 group-hover:text-blue-600" />
                </button>

                <button
                  onClick={() => handleRequestRecap('week')}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 p-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold">Laporan Mingguan</p>
                    <p className="text-sm text-indigo-600">
                      Pemasukan: {formatPrice(stats.weeklyRevenue)}
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600" />
                </button>

                <button
                  onClick={() => handleRequestRecap('month')}
                  className="w-full bg-pink-50 hover:bg-pink-100 text-pink-800 p-4 rounded-xl text-left transition-all duration-300 flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold">Laporan Bulanan</p>
                    <p className="text-sm text-pink-600">
                      Pemasukan: {formatPrice(stats.monthlyRevenue)}
                    </p>
                  </div>
                  <Download className="w-5 h-5 text-pink-400 group-hover:text-pink-600" />
                </button>

                <div className="border-t-2 border-gray-200 pt-4 mt-4">
                  <p className="font-bold text-gray-800 mb-3">Custom Date Range</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Dari Tanggal
                      </label>
                      <input
                        type="date"
                        value={exportDateRange.startDate}
                        onChange={(e) =>
                          setExportDateRange({ ...exportDateRange, startDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Sampai Tanggal
                      </label>
                      <input
                        type="date"
                        value={exportDateRange.endDate}
                        onChange={(e) =>
                          setExportDateRange({ ...exportDateRange, endDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRequestRecap('custom')}
                    disabled={!exportDateRange.startDate || !exportDateRange.endDate}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Export Custom Range</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
    </div>
  );
};

export default AdminDashboard;
