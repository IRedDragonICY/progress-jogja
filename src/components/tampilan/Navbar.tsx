import Link from "next/link";

export default function Navbar() {
  return (
   <nav className="bg-[#800000] text-white px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link href="/" className="hover:text-red-300 transition-colors">
          Progress Jogja
        </Link>
      </div>
      <div className="space-x-4">
        <a href="/" className="hover:text-red-300 transition-colors">Beranda</a>
        <a href="#visimisi" className="hover:text-red-300 transition-colors">Visi Misi</a>
        <a href="#penghargaan" className="hover:text-red-300 transition-colors">Penghargaan</a>
        <a href="#event-internasional" className="hover:text-red-300 transition-colors">Event</a>
        <a href="#produk" className="hover:text-red-300 transition-colors">Produk</a>
        <a href="#kontak" className="hover:text-red-300 transition-colors">Kontak</a>
      </div>
    </nav>
  );
}
