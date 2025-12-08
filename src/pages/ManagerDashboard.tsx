import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Flame, FileText, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import ConfirmModal from '../components/ConfirmModal';

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
        setConfirmModal({
            isOpen: true,
            title: newStatus === 'approved' ? 'Setujui Rekap' : 'Tolak Rekap',
            message: `Apakah Anda yakin ingin mengubah status menjadi ${newStatus}?`,
            variant: newStatus === 'approved' ? 'info' : 'warning',
            onConfirm: async () => {
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
                } catch (error) {
                    console.error('Error updating status:', error);
                    alert('Gagal mengupdate status');
                }
            }
        });
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
                    if (selectedRecap?.id === recapId) {
                        setSelectedRecap(null);
                    }
                    alert('Rekap berhasil dihapus!');
                } catch (error) {
                    console.error('Error deleting recap:', error);
                    alert('Terjadi kesalahan saat menghapus rekap');
                }
            }
        });
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
                                    <button
                                        onClick={() => handleDeleteRecap(recap.id)}
                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h3 className="text-xl font-bold text-gray-800">Detail Rekap Penjualan</h3>
                            <button
                                onClick={() => setSelectedRecap(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Periode</h4>
                                    <p className="font-semibold text-gray-800">
                                        {new Date(selectedRecap.period_start).toLocaleDateString('id-ID')} - {new Date(selectedRecap.period_end).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl">
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Total Pendapatan</h4>
                                    <p className="font-semibold text-gray-800">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(selectedRecap.total_revenue)}
                                    </p>
                                </div>
                            </div>

                            <h4 className="text-lg font-bold text-gray-800 mb-4">Daftar Pesanan</h4>
                            {loadingDetails ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 mx-auto mb-2" />
                                    <p className="text-gray-500 text-sm">Memuat data pesanan...</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Waktu</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Pelanggan</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Metode</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recapOrders.map((order) => (
                                                <tr key={order.id} className="border-b border-gray-100">
                                                    <td className="py-3 px-4 text-sm text-gray-600">
                                                        {new Date(order.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-medium text-gray-800">
                                                        {order.customer_name}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm font-bold text-gray-800">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(order.total_amount)}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${order.payment_method === 'qris'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : order.payment_method === 'transfer'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-green-100 text-green-700'
                                                            }`}>
                                                            {order.payment_method === 'qris' ? 'QRIS' :
                                                                order.payment_method === 'transfer' ? 'Transfer' : 'Tunai'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {recapOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-4 text-gray-500">
                                                        Tidak ada data pesanan untuk periode ini
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                                {selectedRecap.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedRecap.id, 'rejected')}
                                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                                        >
                                            Tolak
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(selectedRecap.id, 'approved')}
                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                                        >
                                            Setujui
                                        </button>
                                    </>
                                )}
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

export default ManagerDashboard;

