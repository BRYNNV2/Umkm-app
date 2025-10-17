import React, { useEffect, useState } from 'react';
import { Flame, Clock, MapPin, Star, ChevronRight, ShoppingBag, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Flame,
      title: 'Sambal Pilihan',
      description: '5 level kepedasan sesuai seleramu',
      color: 'from-red-500 to-orange-500',
    },
    {
      icon: Clock,
      title: 'Cepat & Segar',
      description: 'Dimasak fresh setiap hari',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Star,
      title: 'Kualitas Premium',
      description: 'Ayam pilihan dengan bumbu spesial',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  const menuHighlights = [
    {
      name: 'Ayam Geprek Original',
      price: 'Rp 15.000',
      image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800',
      spicy: 2,
    },
    {
      name: 'Ayam Geprek Keju',
      price: 'Rp 20.000',
      image: 'https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800',
      spicy: 5,
    },
    {
      name: 'Ayam Geprek Mozarella',
      price: 'Rp 25.000',
      image: 'https://images.pexels.com/photos/5894142/pexels-photo-5894142.jpeg?_gl=1*1322kj1*_ga*NTQyNDMxMTk3LjE3NTk0MTY1MjY.*_ga_8JE65Q40S6*czE3NjA2NzcwNjAkbzMkZzEkdDE3NjA2Nzg1NjEkajU2JGwwJGgw',
      spicy: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-lg py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                  Ayam Geprek
                </h1>
                <p className={`text-xs ${scrolled ? 'text-gray-500' : 'text-white/80'}`}>
                  Pedas Mantap!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/about')}
                className={`hidden sm:block ${
                  scrolled
                    ? 'text-gray-600 hover:text-red-500'
                    : 'text-white hover:text-orange-200'
                } px-4 py-2 rounded-lg font-medium transition-all duration-300`}
              >
                Tentang Kami
              </button>
              <button
                onClick={() => navigate('/menu')}
                className="hidden md:block bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Lihat Menu
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className={`${
                  scrolled
                    ? 'text-gray-600 hover:text-red-500'
                    : 'text-white hover:text-orange-200'
                } px-4 py-2 rounded-lg font-medium transition-all duration-300`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-500 via-orange-500 to-red-600">
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center text-white pt-20">
          <div className="animate-slideUp">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">Rating 4.8 dari 1000+ Pelanggan</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Ayam Geprek
              <br />
              <span className="text-yellow-300">Paling Enak!</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Nikmati sensasi pedas yang bikin ketagihan dengan ayam crispy dan sambal geprek pilihan
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => navigate('/menu')}
                className="group bg-white hover:bg-gray-100 text-red-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl flex items-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Pesan Sekarang</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  document.getElementById('menu-preview')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 border-2 border-white/30"
              >
                Lihat Menu
              </button>
            </div>

            <div className="flex items-center justify-center space-x-8 text-white/80">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Buka 10:00 - 22:00</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Delivery Available</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Kenapa Pilih Kami?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Kami berkomitmen memberikan pengalaman kuliner terbaik untuk setiap pelanggan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="menu-preview" className="py-20 bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Menu Favorit Kami
            </h2>
            <p className="text-gray-600 text-lg">Pilihan terbaik yang paling disukai pelanggan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {menuHighlights.map((item, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-lg">
                    <Flame className="w-4 h-4" />
                    <span className="text-sm font-bold">{item.spicy}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                  <p className="text-2xl font-bold text-red-600 mb-4">{item.price}</p>
                  <button
                    onClick={() => navigate('/menu')}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    Pesan Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/menu')}
              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <span>Lihat Semua Menu</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-red-500 to-orange-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-2 border-white/20">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Siap Merasakan Sensasi Pedas?
                </h2>
                <p className="text-xl text-white/90">
                  Pesan sekarang dan nikmati promo spesial hari ini!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate('/menu')}
                  className="group w-full sm:w-auto bg-white hover:bg-gray-100 text-red-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Mulai Pesan</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-6 text-white/80">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Pembayaran Aman</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span className="text-sm">Kualitas Terjamin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Ayam Geprek</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Menyajikan ayam geprek terenak dengan berbagai pilihan level kepedasan
              </p>
              <button
                onClick={() => navigate('/about')}
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Tentang Kami →
              </button>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Jam Operasional</h4>
              <div className="space-y-2 text-gray-400">
                <p>Senin - Jumat: 10:00 - 22:00</p>
                <p>Sabtu - Minggu: 10:00 - 23:00</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Kontak</h4>
              <div className="space-y-2 text-gray-400">
                <p>WhatsApp: 0812-3456-7890</p>
                <p>Email: info@ayamgeprek.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Ayam Geprek. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
