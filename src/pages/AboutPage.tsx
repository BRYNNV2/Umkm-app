import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  MapPin,
  Clock,
  Phone,
  Mail,
  Users,
  Award,
  Heart,
  Target,
  ChevronRight,
  ArrowLeft,
  Instagram,
  Facebook,
  MessageCircle,
} from 'lucide-react';

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 hover:text-red-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-2 rounded-xl shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Ayam Geprek</h1>
                <p className="text-xs text-gray-500">Pedas Mantap!</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/menu')}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105"
            >
              Pesan Sekarang
            </button>
          </div>
        </div>
      </header>

      <div className="pt-20">
        <section className="relative bg-gradient-to-br from-red-500 via-orange-500 to-red-600 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Tentang Kami</h1>
              <p className="text-xl md:text-2xl text-white/90">
                Menyajikan Ayam Geprek Terlezat dengan Cita Rasa Autentik
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-6">
                  Cerita <span className="text-red-600">Kami</span>
                </h2>
                <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                  <p>
                    Ayam Geprek kami dimulai dari passion untuk menghadirkan kuliner pedas yang
                    berkualitas tinggi dengan harga terjangkau. Sejak tahun 2021, kami telah
                    melayani ratusan pelanggan setia dengan resep rahasia yang terus dijaga
                    kualitasnya.
                  </p>
                  <p>
                    Setiap ayam yang kami sajikan dipilih dengan teliti, dimarinasi dengan bumbu
                    spesial, dan digoreng hingga crispy sempurna. Sambal geprek kami dibuat fresh
                    setiap hari dengan bahan-bahan pilihan untuk memberikan sensasi pedas yang pas
                    di lidah.
                  </p>
                  <p>
                    Kami percaya bahwa makanan enak tidak harus mahal. Dengan komitmen memberikan
                    kualitas terbaik, kami terus berinovasi menghadirkan varian menu yang menarik
                    sambil tetap mempertahankan cita rasa khas kami.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Ayam Geprek"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
                <img
                  src="https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Ayam Geprek Keju"
                  className="rounded-2xl shadow-lg w-full h-64 object-cover hover:scale-105 transition-transform duration-300 mt-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl text-center">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Misi Kami</h3>
                <p className="text-gray-600">
                  Menghadirkan pengalaman kuliner pedas yang memuaskan dengan kualitas terjamin
                  dan harga terjangkau untuk semua kalangan.
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl text-center">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Nilai Kami</h3>
                <p className="text-gray-600">
                  Kualitas, kebersihan, dan kepuasan pelanggan adalah prioritas utama dalam
                  setiap hidangan yang kami sajikan.
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl text-center">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Prestasi</h3>
                <p className="text-gray-600">
                  Rating 4.8 dari 1000+ pelanggan setia dengan berbagai review positif di
                  platform online dan media sosial.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 md:p-12 text-white mb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <Users className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-4xl font-bold mb-2">1000+</p>
                  <p className="text-orange-100">Pelanggan Setia</p>
                </div>
                <div>
                  <Award className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-4xl font-bold mb-2">4.8</p>
                  <p className="text-orange-100">Rating Pelanggan</p>
                </div>
                <div>
                  <Flame className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-4xl font-bold mb-2">5</p>
                  <p className="text-orange-100">Level Kepedasan</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Lokasi & Kontak</h2>
              <p className="text-gray-600 text-lg">
                Kunjungi kami atau hubungi untuk pemesanan dan informasi lebih lanjut
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-3 rounded-xl">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Alamat</h3>
                      <p className="text-gray-600">
                        Tj. Pinang Timur, Kec. Bukit Bestari, Kota Tanjung Pinang, Kepulauan Riau
                        <br />
                        Kepulauan Riau, 29122
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Jam Operasional</h3>
                      <div className="space-y-1 text-gray-600">
                        <p>Senin - Jumat: 11.00 - 23.00 WIB</p>
                        <p>Minggu: 11.00 - 23.00 WIB</p>
                        <p className="text-green-600 font-medium mt-2">Buka Setiap Hari Kecuali Sabtu dan Hari Besar</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Telepon & WhatsApp</h3>
                      <p className="text-gray-600">+62 812-6141-2599</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Hubungi kami untuk pemesanan & delivery
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Email</h3>
                      <p className="text-gray-600">royucokhova@gmail.com</p>
                      <p className="text-sm text-gray-500 mt-1">Untuk pertanyaan & kerjasama</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-lg p-6 text-white">
                  <h3 className="font-bold mb-4">Media Sosial</h3>
                  <div className="flex space-x-4">
                    <a
                      href="https://www.instagram.com/geprekmasucok?igsh=dTFoamlmcmRvb3A3"
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                    >
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a
                      href="#"
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                    >
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a
                      href="mailto:royucokhova@gmail.com?subject=Pertanyaan%20dari%20Website"
                      className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-300 hover:scale-110"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </a>
                  </div>
                  <p className="text-sm text-white/80 mt-3">@ayamgeprek_official</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[600px]">
               <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.3023130044394!2d104.4546869!3d0.9214964999999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d973db1fa91cab%3A0xb72cef38ed6aa21b!2sAyam%20Geprek%20Mas%20Ucok!5e0!3m2!1sid!2sid!4v1760362777612!5m2!1sid!2sid" width="800" height="600" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div> 
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-red-500 to-orange-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Siap Mencoba?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Kunjungi outlet kami atau pesan online sekarang juga dan rasakan sensasi pedasnya!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/menu')}
                className="group bg-white hover:bg-gray-100 text-red-600 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl flex items-center space-x-2"
              >
                <span>Pesan Online</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="https://wa.me/6281261412599"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-2xl flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat WhatsApp</span>
              </a>
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
                <p className="text-gray-400">
                  Menyajikan ayam geprek terenak dengan berbagai pilihan Menu Terbaik
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Jam Operasional</h4>
                <div className="space-y-2 text-gray-400">
                  <p>Senin - Jumat: 10:00 - 22:00</p>
                  <p>Minggu: 10:00 - 23:00</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Kontak</h4>
                <div className="space-y-2 text-gray-400">
                  <p>WhatsApp: 0812-6141-2599</p>
                  <p>Email: info@ayamgeprek.com</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>&copy; 2021 Ayam Geprek. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;
