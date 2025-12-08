import React, { useState } from 'react';
import { X, User, Phone, MessageSquare, CheckCircle, CreditCard, Wallet, Banknote } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ isOpen, onClose }) => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris' | 'transfer'>('qris');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,

          order_type: 'online',
          payment_method: paymentMethod,
          total_amount: getTotalPrice(),
          status: 'pending',
          notes: notes || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menu_item.id,
        quantity: item.quantity,
        price: item.menu_item.price,
        spicy_level: item.spicy_level,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const total = getTotalPrice();
      setLastOrderTotal(total);
      setShowSuccess(true);
      clearCart();

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
      }, 3000);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-slideUp">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h2>
          <p className="text-gray-600 mb-4">
            Terima kasih {customerName}! Pesanan Anda sedang diproses.
          </p>
          <p className="text-sm text-gray-500">
            Total: <span className="font-bold text-red-600">{formatPrice(lastOrderTotal)}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl animate-slideUp">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Checkout</h2>
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={`${item.menu_item.id}-${item.spicy_level}`}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.menu_item.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatPrice(item.menu_item.price)}
                    </p>
                  </div>
                  <p className="font-bold text-red-600">
                    {formatPrice(item.menu_item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-2xl font-bold text-red-600">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Nama Lengkap</span>
                </div>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all duration-300"
                placeholder="Masukkan nama Anda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Nomor WhatsApp</span>
                </div>
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all duration-300"
                placeholder="08xxxxxxxxxx"
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`flex items-center p-4 border-2 rounded-xl transition-all duration-300 ${paymentMethod === 'qris'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-200'
                  }`}
              >
                <div className={`p-2 rounded-full mr-3 ${paymentMethod === 'qris' ? 'bg-red-200' : 'bg-gray-100'}`}>
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">QRIS (Scan QR)</p>
                  <p className="text-xs text-gray-500">Dana, OVO, GoPay, ShopeePay, Mobile Banking</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center p-4 border-2 rounded-xl transition-all duration-300 ${paymentMethod === 'cash'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-200'
                  }`}
              >
                <div className={`p-2 rounded-full mr-3 ${paymentMethod === 'cash' ? 'bg-red-200' : 'bg-gray-100'}`}>
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Tunai (Cash)</p>
                  <p className="text-xs text-gray-500">Bayar di kasir saat pengambilan</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex items-center p-4 border-2 rounded-xl transition-all duration-300 ${paymentMethod === 'transfer'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-200'
                  }`}
              >
                <div className={`p-2 rounded-full mr-3 ${paymentMethod === 'transfer' ? 'bg-red-200' : 'bg-gray-100'}`}>
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Transfer Bank</p>
                  <p className="text-xs text-gray-500">BCA 1234567890 a.n. Ayam Geprek</p>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Catatan (Opsional)</span>
              </div>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all duration-300 resize-none"
              placeholder="Contoh: Jangan terlalu pedas"
            />
          </div>


          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Memproses...' : 'Konfirmasi Pesanan'}
          </button>
        </form>
      </div >
    </div >
  );
};

export default Checkout;
