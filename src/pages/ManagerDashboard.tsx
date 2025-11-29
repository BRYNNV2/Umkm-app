import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Flame, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
                .select(`
          *,
          created_by_user:created_by (email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to include email flattened if possible, or just use as is
            // Supabase join returns object structure, we can map it
            const formattedRecaps = data?.map(recap => ({
                ...recap,
                created_by_email: recap.created_by_user?.email
            })) || [];

            setRecaps(formattedRecaps);
        } catch (error) {
            console.error('Error fetching recaps:', error);
        } finally {
            setLoading(false);
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

                                <div className="flex items-center gap-3">
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
        </div>
    );
};

export default ManagerDashboard;
