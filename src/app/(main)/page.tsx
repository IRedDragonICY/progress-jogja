'use client';

import React, { useState, useEffect, useRef, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { clsx } from 'clsx';
import dynamic from 'next/dynamic';
import InteractiveMap from '@/components/InteractiveMap';
import {
  ArrowDownIcon,
  ChevronRightIcon,
  EyeIcon,
  RocketLaunchIcon,
  TrophyIcon,
  GlobeAltIcon,
  ShoppingBagIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: number;
  image_url: string | null;
}

interface InternationalEvent {
  id: string;
  country: string;
  country_code: string;
  image_url: string | null;
}

interface Address {
  id: string;
  text: string;
  latitude: number;
  longitude: number;
  notes: string;
}

interface OrganizationData {
  vision: string | null;
  mission: string | null;
  achievements: Achievement[];
  international_events: InternationalEvent[];
  addresses: Address[];
}

const AnimatedWords = ({ text, className, stagger = 0.05 }: { text: string, className: string, stagger?: number }) => {
  const words = text.split(" ");
  const container = { hidden: { opacity: 0 }, visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: stagger, delayChildren: i * 0.04 } }) };
  const child = { visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } }, hidden: { opacity: 0, y: 20, transition: { type: "spring", damping: 12, stiffness: 100 } } };
  return (
    <motion.h1 className={clsx(className, "flex flex-wrap justify-center")} variants={container} initial="hidden" animate="visible">
      {words.map((word, index) => (
        <motion.span variants={child} className="mr-[0.25em]" key={index}>{word}</motion.span>
      ))}
    </motion.h1>
  );
};

const Section = memo(({ children, className = '', id = '' }: { children: React.ReactNode, className?: string, id?: string }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={clsx("py-20 lg:py-32 px-4 sm:px-6 lg:px-8", className)}
  >
    <div className="max-w-7xl mx-auto">{children}</div>
  </motion.section>
));
Section.displayName = 'Section';

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const productScale = useTransform(scrollYProgress, [0, 1], [1, 0.5]);
  const productY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const logoOpacity = useTransform(scrollYProgress, [0.05, 0.1], [0, 1]);
  const logoY = useTransform(scrollYProgress, [0.05, 0.1], ["-100%", "0%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-50%"]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const checkScroll = () => { if (window.scrollY > 50) setShowScrollIndicator(false); };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <div ref={heroRef} className="relative h-screen">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900 -z-10" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(180,50,50,0.25),rgba(255,255,255,0))]"
        />
        <motion.header style={{ y: logoY, opacity: logoOpacity }} className="fixed top-0 left-0 right-0 z-30 p-6">
          <div className="max-w-7xl mx-auto">
            <Image src="/progressjogja-logo.webp" alt="Progress Jogja Logo" width={170} height={40} priority className="w-auto h-10" />
          </div>
        </motion.header>
        <motion.div style={{ opacity: contentOpacity, y: contentY }} className="absolute inset-x-0 top-[15vh] sm:top-[20vh] z-10 p-4">
            <div className="text-center">
              <Image src="/progressjogja-logo.webp" alt="Progress Jogja Logo" width={300} height={75} className="mx-auto mb-4" />
              <AnimatedWords text="Inovasi Pangan Lokal untuk Pasar Global" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tighter" />
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.7 }} className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
                Menghadirkan produk berkualitas tinggi dari Yogyakarta ke panggung dunia melalui teknologi dan kreativitas.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }} className="mt-10 flex flex-wrap justify-center gap-4">
                <Link href="/produk" className="group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium text-white bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-700 via-red-800 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2"><ShoppingBagIcon className="w-5 h-5" />Lihat Produk</span>
                </Link>
                <Link href="#kontak" className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white bg-white/10 border border-white/20 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-105 active:scale-95 hover:bg-white/20">
                  <span className="relative flex items-center gap-2"><PhoneIcon className="w-5 h-5" />Hubungi Kami</span>
                </Link>
              </motion.div>
            </div>
        </motion.div>
        <motion.div style={{ y: productY, scale: productScale }} className="absolute inset-x-0 bottom-0 z-0">
          <div className="relative w-full h-[50vh] sm:h-[60vh]">
            <Image src="/produk1.webp" alt="Produk Unggulan Progress Jogja" fill priority className="object-contain object-bottom drop-shadow-[0_35px_35px_rgba(0,0,0,0.6)]" />
          </div>
        </motion.div>
        {showScrollIndicator && (
          <motion.div style={{ opacity: scrollIndicatorOpacity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
              <ArrowDownIcon className="w-6 h-6 text-gray-400" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const VisionMissionSection = ({ data, isLoading }: { data: OrganizationData, isLoading: boolean }) => {
  const parseMissionText = (missionText: string | null): string[] => {
    if (!missionText) return [];
    return missionText.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map(line => line.trim()).filter(line => line.length > 0).map(line => line.replace(/^[-•*]\s*/, '')).filter(line => line.length > 0);
  };
  const defaultMission = ["Mengembangkan produk lokal melalui teknologi tepat guna.", "Meningkatkan kapasitas produksi secara bertahap.", "Memperluas jaringan pemasaran.", "Melakukan diversifikasi produk.", "Promosi produk ke tingkat internasional."];
  const missionItems = data.mission ? parseMissionText(data.mission) : defaultMission;
  const cardVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

  return (
    <Section id="visimisi" className="bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">Visi & Misi</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Landasan kami dalam berinovasi dan bertumbuh untuk pasar global.</p>
      </div>
      {isLoading ? (
        <div className="text-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto"></div><p className="mt-6 text-gray-400 text-lg">Memuat visi & misi...</p></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={cardVariants}>
            <div className="group h-full bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-lg transition-all duration-300 hover:border-red-500/50 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20"><EyeIcon className="w-6 h-6 text-red-400" /></div><h3 className="text-2xl font-bold text-white">Visi</h3></div>
              <p className="text-gray-300 text-lg leading-relaxed">{data.vision || "Menjadikan produk lokal sebagai komoditas unggulan yang berkualitas di pasar global."}</p>
            </div>
          </motion.div>
          <motion.div variants={cardVariants}>
            <div className="group h-full bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-lg transition-all duration-300 hover:border-red-500/50 hover:-translate-y-2">
              <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20"><RocketLaunchIcon className="w-6 h-6 text-red-400" /></div><h3 className="text-2xl font-bold text-white">Misi</h3></div>
              <ul className="space-y-4">
                {missionItems.map((item, index) => ( <li key={index} className="flex items-start gap-3"><ChevronRightIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" /><span className="text-gray-300 leading-relaxed">{item}</span></li>))}
              </ul>
            </div>
          </motion.div>
        </div>
      )}
    </Section>
  );
};

const AwardsSection = ({ data, isLoading }: { data: OrganizationData, isLoading: boolean }) => {
  const awardsToShow = data.achievements.length > 0 ? data.achievements : [ { id: '1', title: 'Juara Wirausaha Muda Mandiri', issuer: 'Bank Mandiri', year: 2019, image_url: '/penghargaan1.jpg' }, { id: '2', title: 'Penghargaan Industri Kreatif', issuer: 'Kementerian Pariwisata', year: 2021, image_url: '/penghargaan2.jpg' } ];
  return (
    <Section id="penghargaan" className="bg-black">
      <div className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Penghargaan Kami</h2><p className="text-gray-400 max-w-2xl mx-auto">Pengakuan atas dedikasi dan inovasi kami dalam industri pangan.</p></div>
      {isLoading ? (<div className="text-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto"></div><p className="mt-6 text-gray-400 text-lg">Memuat penghargaan...</p></div>) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {awardsToShow.slice(0, 2).map((achievement, index) => (
              <motion.div key={achievement.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.2 }} className="group relative rounded-2xl overflow-hidden shadow-2xl shadow-red-900/20">
                <Image src={achievement.image_url || '/placeholder.jpg'} alt={achievement.title} width={400} height={500} className="w-full h-80 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6"><h3 className="text-lg font-bold text-white">{achievement.title}</h3><p className="text-sm text-red-300">{achievement.issuer} - {achievement.year}</p></div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-white">Komitmen pada Kualitas</h3>
            <p className="text-gray-400 text-lg leading-relaxed">Penghargaan ini memotivasi kami untuk terus berinovasi dan mempertahankan standar tertinggi dalam setiap produk yang kami hasilkan.</p>
            <ul className="space-y-4">
              {awardsToShow.map((achievement) => (
                <li key={`list-${achievement.id}`} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10"><div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20"><TrophyIcon className="w-5 h-5 text-red-400" /></div><div><h4 className="font-semibold text-white">{achievement.title}</h4><p className="text-sm text-gray-400">{achievement.issuer}</p></div></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Section>
  );
};

const InternationalEventsSection = ({ data, isLoading }: { data: OrganizationData, isLoading: boolean }) => {
    const eventsToShow = data.international_events || [];
  return (
    <Section id="event-internasional" className="bg-gradient-to-b from-black to-gray-950">
      <div className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Jejak Internasional</h2><p className="text-gray-400 max-w-3xl mx-auto">Membawa cita rasa Indonesia ke berbagai pameran dan acara bergengsi di seluruh dunia.</p></div>
      {isLoading ? (<div className="text-center py-20"><div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto"></div><p className="mt-6 text-gray-400 text-lg">Memuat event...</p></div>) : (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-20 pointer-events-none before:absolute before:left-0 before:top-0 before:w-1/4 before:h-full before:bg-gradient-to-r before:from-black before:to-transparent before:filter before:blur-3 after:absolute after:right-0 after:top-0 after:w-1/4 after:h-full after:bg-gradient-to-l after:from-black after:to-transparent after:filter after:blur-3"></div>
          <motion.div 
            className="flex"
            animate={{ 
              x: ['0%', '-50%'], 
              transition: { 
                ease: 'linear', 
                duration: 30, 
                repeat: Infinity 
              } 
            }}
          >
            {[...eventsToShow, ...eventsToShow].map((event, index) => (
              <div key={index} className="flex-shrink-0 mx-4" style={{ minWidth: '20%' }}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.5 }} 
                  className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black/30"
                >
                  <Image src={event.image_url || '/placeholder.jpg'} alt={`Event di ${event.country}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-5"><h3 className="text-2xl font-bold text-white">{event.country_code}</h3><p className="text-lg font-medium text-white">{event.country}</p></div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      )}
    </Section>
  );
};

const FeaturedProductsSection = () => {
  const products = [ { name: "Wedang Uwuh", image: "/produk1.webp", description: "Minuman rempah khas Yogyakarta yang menghangatkan dan menyehatkan." }, { name: "Wedang Telang", image: "/produk2.webp", description: "Teh bunga telang dengan manfaat antioksidan tinggi dan warna biru alami." }, { name: "Jakencruk", image: "/produk3.webp", description: "Minuman jahe kencur jeruk nikmat, kaya akan manfaat untuk imunitas." }];
  return (
    <Section id="produk" className="bg-gray-950">
      <div className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Produk Unggulan</h2><p className="text-gray-400 max-w-2xl mx-auto">Pilihan terbaik dari ramuan tradisional yang diolah secara modern.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {products.map((product, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.2 }} className="group bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-lg text-center transition-all duration-300 hover:border-red-500/50 hover:bg-red-900/10 hover:-translate-y-2">
            <div className="relative h-56 mx-auto mb-6"><Image src={product.image} alt={product.name} width={250} height={224} className="w-full h-full object-contain drop-shadow-[0_15px_15px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110" /></div>
            <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>
            <p className="text-gray-400 mb-6">{product.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <Link href="/produk" className="group relative inline-flex items-center justify-center px-8 py-4 overflow-hidden font-bold text-white bg-red-700 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative flex items-center gap-2">Jelajahi Semua Produk<ChevronRightIcon className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" /></span>
        </Link>
      </div>
    </Section>
  );
};



const LocationsSection = ({ data, isLoading }: { data: OrganizationData, isLoading: boolean }) => {
  const locationsToShow = data.addresses.length > 0 ? data.addresses : [
    {
      id: '1',
      text: 'Jalan Mawar I/207 Perumnas Condongcatur, Depok, Sleman, Yogyakarta 55283',
      latitude: -7.7559,
      longitude: 110.407,
      notes: 'Kantor & Produksi Utama'
    },
    {
      id: '2', 
      text: 'Dusun Petir RT 01, Srimartani, Piyungan, Bantul, Yogyakarta',
      latitude: -7.848,
      longitude: 110.457,
      notes: 'Tempat Produksi Tambahan'
    }
  ];

  return (
    <Section id="lokasi" className="bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">Lokasi Kami</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">Temukan kantor dan fasilitas produksi Progress Jogja di berbagai lokasi strategis.</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto"></div>
          <p className="mt-6 text-gray-400 text-lg">Memuat lokasi...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Location Cards */}
          <div className="space-y-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <BuildingOfficeIcon className="w-8 h-8 text-red-400" />
                Fasilitas Kami
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Progress Jogja beroperasi dari dua lokasi strategis di Yogyakarta dengan fasilitas modern untuk produksi dan distribusi.
              </p>
            </div>
            
            {locationsToShow.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="group bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-lg transition-all duration-300 hover:border-red-500/50 hover:bg-white/10 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                    <MapPinIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{location.notes}</h4>
                    <p className="text-gray-300 mb-3 leading-relaxed">{location.text}</p>
                    <div className="flex items-center gap-2 text-sm text-red-300">
                      <span>📍</span>
                      <span>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-lg">
              {/* Interactive OpenStreetMap */}
              <InteractiveMap locations={locationsToShow} />
              
              {/* Map Info */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Lokasi Progress Jogja</span>
                </div>
                <div className="text-xs text-gray-500">
                  Klik marker untuk detail lokasi
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Section>
  );
};

const ContactSection = () => {
  const contactInfo = [ { icon: MapPinIcon, title: "Lokasi", content: "Jalan Mawar I/207, Condongcatur, Sleman, Yogyakarta" }, { icon: PhoneIcon, title: "Telepon", content: "+62 812-1573-7328 / +62 815-7888-1432", href: "tel:+6281215737328" }, { icon: ChatBubbleBottomCenterTextIcon, title: "Email", content: "progressjogjaofficial@gmail.com", href: "mailto:progressjogjaofficial@gmail.com" }, { icon: UserGroupIcon, title: "Instagram", content: "@progress.jogja", href: "https://instagram.com/progress.jogja" }];
  return (
    <Section id="kontak" className="bg-gradient-to-t from-black to-gray-950">
      <div className="text-center mb-16"><h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Hubungi Kami</h2><p className="text-gray-400 max-w-2xl mx-auto">Kami siap membantu Anda. Jangan ragu untuk menghubungi kami.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {contactInfo.map((item, index) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.15 }}>
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="group block h-full bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-lg transition-all duration-300 hover:border-red-500/50 hover:bg-white/10 hover:-translate-y-2">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20"><item.icon className="w-6 h-6 text-red-400" /></div>
                <div><h3 className="text-lg font-bold text-white mb-1">{item.title}</h3><p className="text-gray-300 group-hover:text-white transition-colors">{item.content}</p></div>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default function HomePage() {
  const [organizationData, setOrganizationData] = useState<OrganizationData>({ vision: null, mission: null, achievements: [], international_events: [], addresses: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await fetch('/api/organization');
        if (response.ok) setOrganizationData(await response.json());
      } catch (error) { console.error('Error fetching organization data:', error); }
      finally { setIsLoading(false); }
    };
    fetchOrganizationData();
  }, []);

  return (
    <div className="bg-black">
      <HeroSection />
      <div className="relative z-10 bg-black">
        <main>
          <VisionMissionSection data={organizationData} isLoading={isLoading} />
          <AwardsSection data={organizationData} isLoading={isLoading} />
          <InternationalEventsSection data={organizationData} isLoading={isLoading} />
          <FeaturedProductsSection />
          <LocationsSection data={organizationData} isLoading={isLoading} />
          <ContactSection />
        </main>
      </div>
    </div>
  );
}