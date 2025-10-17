import React, { useState } from 'react';
import { X, Minus, Plus, Flame, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slideInRight">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-6 h-6" />
              <h2 className="text-xl font-bold">Keranjang Belanja</h2>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-20 h-20 mb-4" />
              <p className="text-lg font-medium">Keranjang masih kosong</p>
              <p className="text-sm">Yuk, pesan ayam geprek favorit kamu!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.menu_item.id}-${item.spicy_level}`}
                  className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex space-x-4">
                    <img
                      src={item.menu_item.image_url}
                      alt={item.menu_item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.menu_item.name}</h3>
                      {item.menu_item.category === 'main' && item.spicy_level > 0 && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Flame className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-gray-500">Level {item.spicy_level}</span>
                        </div>
                      )}
                      <p className="text-red-600 font-bold mt-1">
                        {formatPrice(item.menu_item.price)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-full p-1">
                          <button
                            onClick={() => updateQuantity(item.menu_item.id, item.quantity - 1)}
                            className="bg-white hover:bg-red-500 hover:text-white text-gray-700 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold text-gray-800 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.menu_item.id, item.quantity + 1)}
                            className="bg-white hover:bg-red-500 hover:text-white text-gray-700 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.menu_item.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-300"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t-2 border-gray-100 p-6 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-2xl font-bold text-red-600">
                {formatPrice(getTotalPrice())}
              </span>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              Checkout Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
