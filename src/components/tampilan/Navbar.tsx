export default function Navbar() {
  return (
   <nav className="bg-[#800000] text-white px-6 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">Progress Jogja</div>
      <div className="space-x-4">
        <a href="#" className="hover:text-[#800000]">Beranda</a>
        <a href="#visimisi" className="hover:text-[#800000]">Visi Misi</a>
        <a href="#produk" className="hover:text-[#800000]">Produk</a>
        <a href="#kontak" className="hover:text-[#800000]">Kontak</a>

      </div>
    </nav>
  );
}
