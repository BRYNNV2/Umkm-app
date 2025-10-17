import React, { useState } from 'react';
import { Plus, Flame } from 'lucide-react';
import { MenuItem } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface MenuCardProps {
  item: MenuItem;
}

const MenuCard: React.FC<MenuCardProps> = ({ item }) => {
  const { addToCart } = useCart();
  const [showSpicyModal, setShowSpicyModal] = useState(false);
  const [selectedSpicy, setSelectedSpicy] = useState(item.spicy_level);
  const [isAdding, setIsAdding] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (item.category === 'main') {
      setShowSpicyModal(true);
    } else {
      addToCartWithAnimation(0);
    }
  };

  const addToCartWithAnimation = (spicyLevel: number) => {
    setIsAdding(true);
    addToCart(item, spicyLevel);
    setTimeout(() => {
      setIsAdding(false);
      setShowSpicyModal(false);
    }, 500);
  };

  const spicyLevels = [
    { level: 0, label: 'Tidak Pedas', color: 'bg-gray-200' },
    { level: 1, label: 'Sedikit Pedas', color: 'bg-yellow-200' },
    { level: 2, label: 'Pedas Sedang', color: 'bg-orange-300' },
    { level: 3, label: 'Pedas', color: 'bg-orange-400' },
    { level: 4, label: 'Sangat Pedas', color: 'bg-red-400' },
    { level: 5, label: 'Extra Pedas', color: 'bg-red-600' },
  ];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className="relative overflow-hidden h-48">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {item.category === 'main' && item.spicy_level > 0 && (
            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg">
              <Flame className="w-3 h-3" />
              <span className="text-xs font-bold">{item.spicy_level}</span>
            </div>
          )}
          {!item.is_available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Habis</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{item.name}</h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-red-600 font-bold text-lg">{formatPrice(item.price)}</span>
            <button
              onClick={handleAddToCart}
              disabled={!item.is_available || isAdding}
              className={`${
                item.is_available
                  ? 'bg-red-500 hover:bg-red-600 active:scale-95'
                  : 'bg-gray-300 cursor-not-allowed'
              } text-white p-2 rounded-full transition-all duration-300 hover:scale-110 shadow-md ${
                isAdding ? 'animate-ping' : ''
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showSpicyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl transform transition-all duration-300 animate-slideUp">
            <div className="flex items-center space-x-2 mb-4">
              <Flame className="w-6 h-6 text-red-500" />
              <h3 className="text-xl font-bold text-gray-800">Pilih Level Kepedasan</h3>
            </div>

            <div className="space-y-3 mb-6">
              {spicyLevels.map(({ level, label, color }) => (
                <button
                  key={level}
                  onClick={() => setSelectedSpicy(level)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedSpicy === level
                      ? 'border-red-500 bg-red-50 scale-105'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${color}`} />
                      <span className="font-medium text-gray-700">{label}</span>
                    </div>
                    <div className="flex">
                      {[...Array(level)].map((_, i) => (
                        <Flame key={i} className="w-4 h-4 text-red-500" />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSpicyModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Batal
              </button>
              <button
                onClick={() => addToCartWithAnimation(selectedSpicy)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuCard;
