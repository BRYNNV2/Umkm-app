import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Flame, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

interface Recap {
    id: string;
    period_start: string;
    period_end: string;
    total_revenue: number;
    total_orders: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    notes: string;
    created_by_email?: string;
}

const ManagerDashboard: React.FC = () => {
    const { user, role, signOut } = useAuth();
    const navigate = useNavigate();
    const [recaps, setRecaps] = useState<Recap[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecap, setSelectedRecap] = useState<Recap | null>(null);
    const [recapOrders, setRecapOrders] = useState<Order[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else if (role !== 'manager') {
            navigate('/admin');
        } else {
            fetchRecaps();
        }
    }, [user, role, navigate]);

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
        } finally {
            setLoading(false);
        }
    };

    const fetchRecapDetails = async (recap: Recap) => {
        setLoadingDetails(true);
        setSelectedRecap(recap);
        try {
            // Fetch orders within the recap period
            // Note: We need to handle the end date to include the full day (23:59:59)
            const endDate = new Date(recap.period_end);
            endDate.setHours(23, 59, 59, 999);

            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .gte('created_at', recap.period_start)
                .lte('created_at', endDate.toISOString())
                .eq('status', 'completed') // Only completed orders count towards revenue
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRecapOrders(data || []);
        } catch (error) {
            console.error('Error fetching recap details:', error);
            alert('Gagal mengambil detail pesanan');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleUpdateStatus = async (recapId: string, newStatus: 'approved' | 'rejected') => {
        if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`)) return;

        try {
            const { error } = await supabase
                .from('recaps')
                .update({
                    status: newStatus,
                    approved_by: user?.id
                })
                .eq('id', recapId);

            if (error) throw error;

            fetchRecaps();
            if (selectedRecap?.id === recapId) {
                setSelectedRecap(null); // Close modal if open
            }
            alert(`Rekap berhasil di-${newStatus === 'approved' ? 'setujui' : 'tolak'}!`);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Terjadi kesalahan saat mengupdate status');
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-xl">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Manager Dashboard</h1>
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

            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Permintaan Persetujuan Rekap</h2>

                <div className="grid gap-6">
                    {recaps.map((recap) => (
                        <div key={recap.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-l-transparent hover:border-l-blue-500 transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center space-x-2 mb-2">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        <h3 className="font-bold text-lg text-gray-800">
                                            Periode: {formatDate(recap.period_start)} - {formatDate(recap.period_end)}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
                                        <p>Total Pendapatan: <span className="font-semibold text-green-600">{formatPrice(recap.total_revenue)}</span></p>
                                        <p>Total Pesanan: <span className="font-semibold">{recap.total_orders}</span></p>
                                        <p>Dibuat: {formatDate(recap.created_at)}</p>
                                        {recap.notes && <p>Catatan: {recap.notes}</p>}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <button
                                        onClick={() => fetchRecapDetails(recap)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm underline"
                                    >
                                        Lihat Detail
                                    </button>

                                    {recap.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(recap.id, 'approved')}
                                                className="flex items-center space-x-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Setujui</span>
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(recap.id, 'rejected')}
                                                className="flex items-center space-x-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                <span>Tolak</span>
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${recap.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {recap.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                            <span className="font-medium capitalize">{recap.status === 'approved' ? 'Disetujui' : 'Ditolak'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {recaps.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Belum ada data rekap</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedRecap && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl max-h-[90vh] flex flex-col">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-t-2xl flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">Detail Rekap Penjualan</h2>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Periode: {formatDate(selectedRecap.period_start)} - {formatDate(selectedRecap.period_end)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecap(null)}
                                    className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                                >
                                    <XCircle className="w-8 h-8" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-grow">
                            {loadingDetails ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mx-auto mb-4" />
                                    <p className="text-gray-600">Memuat data pesanan...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                            <p className="text-sm text-green-600 mb-1">Total Pendapatan</p>
                                            <p className="text-2xl font-bold text-green-700">{formatPrice(selectedRecap.total_revenue)}</p>
                                        </div>
                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <p className="text-sm text-blue-600 mb-1">Total Pesanan</p>
                                            <p className="text-2xl font-bold text-blue-700">{selectedRecap.total_orders}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <p className="text-sm text-gray-600 mb-1">Status</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold capitalize ${selectedRecap.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                selectedRecap.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {selectedRecap.status === 'approved' ? 'Disetujui' :
                                                    selectedRecap.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-gray-800 mb-4 text-lg">Daftar Transaksi</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="p-3 font-semibold text-gray-600">Tanggal</th>
                                                    <th className="p-3 font-semibold text-gray-600">Pelanggan</th>
                                                    <th className="p-3 font-semibold text-gray-600">Tipe</th>
                                                    <th className="p-3 font-semibold text-gray-600 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recapOrders.map((order) => (
                                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="p-3 text-sm text-gray-600">
                                                            {new Date(order.created_at).toLocaleString('id-ID')}
                                                        </td>
                                                        <td className="p-3 font-medium text-gray-800">
                                                            {order.customer_name}
                                                            <div className="text-xs text-gray-500">{order.customer_phone}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${order.order_type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                                                {order.order_type}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 font-bold text-gray-800 text-right">
                                                            {formatPrice(order.total_amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {recapOrders.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="text-center py-8 text-gray-500">
                                                            Tidak ada data pesanan detail yang ditemukan.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
                            <button
                                onClick={() => setSelectedRecap(null)}
                                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Tutup
                            </button>
                            {selectedRecap.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRecap.id, 'rejected')}
                                        className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-colors"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRecap.id, 'approved')}
                                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors shadow-lg shadow-green-200"
                                    >
                                        Setujui Rekap
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
