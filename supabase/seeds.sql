-- Seeds data for Progress Jogja
-- This file contains initial data for the application

-- Insert Product Types
INSERT INTO public.product_types (id, name) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Minuman Herbal'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Tepung Tradisional'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Suplemen Kesehatan'),
    ('550e8400-e29b-41d4-a716-446655440004', 'Makanan Ringan'),
    ('550e8400-e29b-41d4-a716-446655440005', 'Minuman Tradisional')
ON CONFLICT (name) DO NOTHING;

-- Insert Products with complete data
INSERT INTO public.products (id, name, product_type_id, description, price, image_urls, store_links, is_published) VALUES
    -- Minuman Herbal
    ('550e8400-e29b-41d4-a716-446655440101', 'Artisan Tea', '550e8400-e29b-41d4-a716-446655440001', 'Teh herbal premium yang dibuat dengan bahan-bahan alami pilihan. Memiliki rasa yang khas dan khasiat yang baik untuk kesehatan.', 25000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/artisantea.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440102', 'Ginger Tea', '550e8400-e29b-41d4-a716-446655440001', 'Teh jahe hangat yang membantu meningkatkan daya tahan tubuh. Cocok diminum saat cuaca dingin atau saat merasa tidak enak badan.', 20000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/gingertea.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440103', 'Herbs Tea', '550e8400-e29b-41d4-a716-446655440001', 'Campuran herbal alami yang memberikan efek relaksasi dan kesehatan. Terbuat dari berbagai jenis herbal pilihan.', 30000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/herbstea.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440104', 'Lemongrass Tea', '550e8400-e29b-41d4-a716-446655440001', 'Teh serai yang menyegarkan dengan aroma yang khas. Membantu meredakan stress dan memberikan efek tenang.', 22000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/lemongrasstea.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440105', 'Lime Tea', '550e8400-e29b-41d4-a716-446655440001', 'Teh jeruk nipis yang segar dan kaya vitamin C. Membantu meningkatkan sistem imun dan memberikan rasa segar.', 18000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/limetea.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    -- Tepung Tradisional
    ('550e8400-e29b-41d4-a716-446655440201', 'Tepung Gembili', '550e8400-e29b-41d4-a716-446655440002', 'Tepung gembili organik yang kaya akan karbohidrat dan serat. Cocok untuk membuat berbagai makanan tradisional.', 35000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/tepunggembili.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440202', 'Tepung Pati Garut', '550e8400-e29b-41d4-a716-446655440002', 'Tepung pati garut murni yang baik untuk pencernaan. Bebas gluten dan cocok untuk diet khusus.', 40000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/tepungpatigarut.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440203', 'Tepung Pisang', '550e8400-e29b-41d4-a716-446655440002', 'Tepung pisang yang kaya akan potasium dan vitamin. Memberikan rasa manis alami pada makanan.', 28000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/tepungpisang.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440204', 'Tepung Sorgum Merah', '550e8400-e29b-41d4-a716-446655440002', 'Tepung sorgum merah yang bebas gluten dan kaya antioksidan. Cocok untuk penderita diabetes.', 45000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/tepungsorgummerah.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440205', 'Tepung Talas', '550e8400-e29b-41d4-a716-446655440002', 'Tepung talas yang mudah dicerna dan kaya akan karbohidrat kompleks. Cocok untuk makanan bayi dan lansia.', 32000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/tepungtalas.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440206', 'Tepung Ubi Ungu', '550e8400-e29b-41d4-a716-446655440002', 'Tepung ubi ungu yang kaya akan anthocyanin dan antioksidan. Memberikan warna alami pada makanan.', 38000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/tepungubiungu.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    -- Suplemen Kesehatan
    ('550e8400-e29b-41d4-a716-446655440301', 'Bitovin', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen vitamin B kompleks yang membantu meningkatkan energi dan metabolisme tubuh.', 85000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/bitovin.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440302', 'Nenavin', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen khusus untuk kesehatan wanita dengan kandungan vitamin dan mineral penting.', 95000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/nenavin.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440303', 'Phi Boost', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen penambah stamina dan daya tahan tubuh dengan formula alami.', 125000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/phiboost.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440304', 'Phi D', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen vitamin D yang membantu penyerapan kalsium dan kesehatan tulang.', 75000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/phid.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440305', 'Phi Max', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen multivitamin lengkap untuk mendukung kesehatan optimal sehari-hari.', 150000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/phimax.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440306', 'Maag Care', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen herbal untuk membantu mengatasi masalah pencernaan dan maag.', 65000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/maagcare.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440307', 'Vinapple', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen dengan ekstrak apel yang kaya akan antioksidan dan vitamin C.', 90000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/vinapple.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440308', 'Vinenon', '550e8400-e29b-41d4-a716-446655440003', 'Suplemen herbal untuk meningkatkan vitalitas dan kesehatan reproduksi.', 110000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/vinenon.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    -- Makanan Ringan
    ('550e8400-e29b-41d4-a716-446655440401', 'Creamy Flakes', '550e8400-e29b-41d4-a716-446655440004', 'Keripik sereal yang renyah dengan rasa creamy yang lezat. Cocok untuk camilan sehat.', 15000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/creamyflakes.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440402', 'Helti Flakes', '550e8400-e29b-41d4-a716-446655440004', 'Keripik sehat dengan kandungan serat tinggi dan rasa yang gurih.', 18000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/heltiflakes.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440403', 'Indo Flakes', '550e8400-e29b-41d4-a716-446655440004', 'Keripik dengan cita rasa Indonesia yang autentik dan renyah.', 12000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/indoflakes.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440404', 'Jaken Cruk', '550e8400-e29b-41d4-a716-446655440004', 'Keripik jagung yang renyah dengan bumbu tradisional yang khas.', 10000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/jakencruk.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    -- Minuman Tradisional
    ('550e8400-e29b-41d4-a716-446655440501', 'Minuman Tradisional Rempah', '550e8400-e29b-41d4-a716-446655440005', 'Minuman tradisional dengan campuran rempah-rempah nusantara yang kaya akan manfaat kesehatan.', 25000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/minumantradisionalrempah.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440502', 'Wedang Uwuh', '550e8400-e29b-41d4-a716-446655440005', 'Minuman tradisional Jogja dengan campuran rempah yang menghangatkan tubuh.', 15000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/wdanguwuh.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true),

    ('550e8400-e29b-41d4-a716-446655440503', 'Wedang Telang', '550e8400-e29b-41d4-a716-446655440005', 'Minuman herbal dengan bunga telang yang memberikan warna biru alami dan khasiat antioksidan.', 20000.00, '["https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/products/wedangtelang.jpg"]', '[{"platform": "Tokopedia", "url": "https://tokopedia.com"}, {"platform": "Shopee", "url": "https://shopee.co.id"}]', true)
ON CONFLICT (id) DO NOTHING;

-- Update Organization Profile with complete information
UPDATE public.organization_profile SET
    slogan = 'Memberdayakan UMKM Jogja Menuju Kemajuan Bersama',
    email = 'info@progressjogja.com',
    vision = 'Menjadi wadah terdepan dalam memberdayakan dan mengembangkan UMKM di Yogyakarta untuk menciptakan ekonomi yang berkelanjutan dan inklusif.',
    mission = 'Memfasilitasi pertumbuhan UMKM melalui pelatihan, pendampingan, dan akses pasar yang lebih luas serta mempromosikan produk lokal Yogyakarta ke tingkat nasional dan internasional.',
    addresses = '[
        {
            "type": "Kantor Pusat",
            "address": "Jl. Malioboro No. 123, Yogyakarta 55213",
            "city": "Yogyakarta",
            "province": "Daerah Istimewa Yogyakarta",
            "postal_code": "55213",
            "country": "Indonesia"
        },
        {
            "type": "Gudang",
            "address": "Jl. Parangtritis Km 8, Bantul, Yogyakarta 55188",
            "city": "Bantul",
            "province": "Daerah Istimewa Yogyakarta",
            "postal_code": "55188",
            "country": "Indonesia"
        }
    ]'::jsonb,
    phone_numbers = '[
        {
            "type": "Kantor",
            "number": "+62 274 123456"
        },
        {
            "type": "WhatsApp",
            "number": "+62 812 3456 7890"
        }
    ]'::jsonb,
    social_media_links = '[
        {
            "platform": "Instagram",
            "url": "https://instagram.com/progressjogja",
            "username": "@progressjogja"
        },
        {
            "platform": "Facebook",
            "url": "https://facebook.com/progressjogja",
            "username": "Progress Jogja"
        },
        {
            "platform": "YouTube",
            "url": "https://youtube.com/progressjogja",
            "username": "Progress Jogja Official"
        },
        {
            "platform": "TikTok",
            "url": "https://tiktok.com/@progressjogja",
            "username": "@progressjogja"
        }
    ]'::jsonb,
    organizational_structure = '[
        {
            "position": "Ketua Umum",
            "name": "Ir. Budi Santoso, M.Si",
            "photo": "",
            "description": "Memimpin organisasi dan bertanggung jawab atas visi misi organisasi"
        },
        {
            "position": "Wakil Ketua",
            "name": "Dra. Siti Nurjanah, M.M",
            "photo": "",
            "description": "Membantu ketua dalam menjalankan program-program organisasi"
        },
        {
            "position": "Sekretaris",
            "name": "S.Kom Ahmad Wijaya",
            "photo": "",
            "description": "Mengelola administrasi dan dokumentasi organisasi"
        },
        {
            "position": "Bendahara",
            "name": "S.E. Rina Kusuma",
            "photo": "",
            "description": "Mengelola keuangan dan pelaporan keuangan organisasi"
        },
        {
            "position": "Koordinator Program",
            "name": "Drs. Agus Priyanto",
            "photo": "",
            "description": "Mengkoordinir program-program pemberdayaan UMKM"
        }
    ]'::jsonb,
    partnerships = '[
        {
            "type": "Pemerintah",
            "name": "Dinas Koperasi dan UKM DIY",
            "description": "Kerjasama dalam program pemberdayaan UMKM",
            "logo": "",
            "website": "https://diskopukm.jogjaprov.go.id"
        },
        {
            "type": "Swasta",
            "name": "Bank BRI",
            "description": "Kerjasama dalam pembiayaan UMKM",
            "logo": "",
            "website": "https://bri.co.id"
        },
        {
            "type": "Perguruan Tinggi",
            "name": "Universitas Gadjah Mada",
            "description": "Kerjasama dalam penelitian dan pengembangan produk",
            "logo": "",
            "website": "https://ugm.ac.id"
        },
        {
            "type": "E-commerce",
            "name": "Tokopedia",
            "description": "Platform penjualan online untuk produk UMKM",
            "logo": "",
            "website": "https://tokopedia.com"
        },
        {
            "type": "E-commerce",
            "name": "Shopee",
            "description": "Platform penjualan online untuk produk UMKM",
            "logo": "",
            "website": "https://shopee.co.id"
        }
    ]'::jsonb
WHERE id = 'e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f';



-- Create some sample events and achievements data for future use
-- (These would be added to separate tables when implemented)

COMMENT ON TABLE public.products IS 'Tabel produk UMKM yang dijual melalui platform';
COMMENT ON TABLE public.product_types IS 'Kategori produk seperti Minuman Herbal, Tepung Tradisional, dll';
COMMENT ON TABLE public.organization_profile IS 'Profil organisasi Progress Jogja';
COMMENT ON TABLE public.profiles IS 'Profil pengguna termasuk admin dan member';


-- Inser organization profile
UPDATE public.organization_profile
SET
    slogan = 'Innovative local food and beverage',
    email = 'ProgressJogjaOfficial@gmail.com',
    vision = 'Menjadikan produk lokal sebagai komoditas unggulan yang berkualitas di pasar global.',
    mission = 'Sebuah kelompok wirausaha muda yang mengembangkan produk lokal melalui sentuhan teknologi tepat guna.\nMeningkatkan kapasitas produksi dari waktu ke waktu secara bertahap dengan tetap menjaga kualitas produk yang terbaik.\nMeningkatkan jaringan pemasaran.\nMembuat diversifikasi produk\nBersama pihak lain mempromosikan produk Go International',
    addresses = '[
        {
            "id": "e7a9f2d8-0001-4f1e-8d0f-6c7a3b9e1d2f",
            "text": "Jalan Mawar I/207 Perumnas Condongcatur, Depok, Sleman, Yogyakarta 55283",
            "latitude": -7.7559,
            "longitude": 110.407,
            "notes": "Kantor & Produksi Utama"
        },
        {
            "id": "e7a9f2d8-0002-4f1e-8d0f-6c7a3b9e1d2f",
            "text": "Dusun Petir RT 01, Srimartani, Piyungan, Bantul, Yogyakarta",
            "latitude": -7.848,
            "longitude": 110.457,
            "notes": "Tempat Produksi Tambahan"
        }
    ]'::jsonb,
    phone_numbers = '[
        {
            "id": "e7a9f2d8-0003-4f1e-8d0f-6c7a3b9e1d2f",
            "number": "+6281215737328",
            "label": "HP/WA 1"
        },
        {
            "id": "e7a9f2d8-0004-4f1e-8d0f-6c7a3b9e1d2f",
            "number": "+6281578881432",
            "label": "HP/WA 2"
        }
    ]'::jsonb,
    social_media_links = '[
        {
            "id": "e7a9f2d8-0005-4f1e-8d0f-6c7a3b9e1d2f",
            "platform": "Instagram",
            "url": "https://instagram.com/progress.jogja"
        }
    ]'::jsonb,
    organizational_structure = '[
        {
            "id": "e7a9f2d8-0006-4f1e-8d0f-6c7a3b9e1d2f",
            "position": "Direktur",
            "name": "Retnosyari Septiyani, S.T.P, M.Sc"
        },
        {
            "id": "e7a9f2d8-0007-4f1e-8d0f-6c7a3b9e1d2f",
            "position": "Manajer Operasional dan Produksi",
            "name": "Mursyanif, S.Sos"
        },
        {
            "id": "e7a9f2d8-0008-4f1e-8d0f-6c7a3b9e1d2f",
            "position": "Manajer Research and Development (RnD)",
            "name": "Diyah Ari Isnaini, S.T,P"
        },
        {
            "id": "e7a9f2d8-0009-4f1e-8d0f-6c7a3b9e1d2f",
            "position": "Manajer Keuangan",
            "name": "Ridwan Budi Prasetyo, S.T, M.Eng"
        },
        {
            "id": "e7a9f2d8-0010-4f1e-8d0f-6c7a3b9e1d2f",
            "position": "Manajer Pemasaran",
            "name": "Noor Rahmat Erwiyanto, SE"
        }
    ]'::jsonb,
    partnerships = '[
        {
            "id": "e7a9f2d8-p001-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Universitas Gadjah Mada",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p002-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Universitas Ahmad Dahlan",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p003-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Universitas Jenderal Ahmad Yani",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p004-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Universitas Pembangunan Nasional Veteran Yogyakarta",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p005-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Universitas Amikom Yogyakarta",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p006-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Dinas Koperasi, UKM, Perindustrian dan Perdagangan Kab Bantul",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p007-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Dinas Pertanian DI Yogyakarta",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p008-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Dinas Koperasi dan UMKM DI Yogyakarta",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p009-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "PLUT Yogyakarta",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p010-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "ABDSI",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p011-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "Koperasi Wahana Mandiri Indonesia",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p012-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "SMK N 1 Cangkringan Sleman",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p013-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "SMKN 1 Nanggulan Kulon Progo",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p014-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "SMKN 1 Pacitan Jawa Timur",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p015-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "SMK Muhammadiyah Salaman Magelang Jateng",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p016-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "SMK N 1 Kalasan",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p017-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "education_government",
            "name": "LSM PUPUK",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p018-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "industry",
            "name": "PT Gawe Becik Nadhah Anugrah",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p019-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "industry",
            "name": "PT Yukayoga Karya Persada",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p020-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "industry",
            "name": "PT Citarasa Food Nusantara",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p021-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "industry",
            "name": "PT Rahasia Wasiat Alam",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p022-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "industry",
            "name": "PT Ebliethos",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p023-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "industry",
            "name": "PT Bagaskara Semesraya Internasional",
            "logo_url": null
        },
        {
            "id": "e7a9f2d8-p024-4f1e-8d0f-6c7a3b9e1d2f",
            "category": "industry",
            "name": "PT Sundhul Langit Jalan Kami",
            "logo_url": null
        }
    ]'::jsonb,
    "achievements" = '[
        {
            "id": "achieve-001",
            "title": "Juara 1 Wirausaha Usaha Pangan",
            "issuer": "Kementerian Pemuda dan Olahraga RI",
            "year": 2006,
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/achiavement/achiavement-piagam.jpg"
        },
        {
            "id": "achieve-002",
            "title": "Juara 1 Industri Ketahanan Pangan",
            "issuer": "Kabupaten Bantul",
            "year": 2016,
            "image_url": null
        },
        {
            "id": "achieve-003",
            "title": "Juara 1 Industri Ketahanan Pangan",
            "issuer": "D.I. Yogyakarta",
            "year": 2016,
            "image_url": null
        },
        {
            "id": "achieve-004",
            "title": "Penghargaan Adikarya Pangan Nusantara",
            "issuer": "Presiden RI",
            "year": 2016,
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/achiavement/achiavement-jokowi.jpg"
        }
    ]'::jsonb,
    "international_events" = '[
        {
            "id": "event-001",
            "country": "Singapura",
            "country_code": "🇸🇬",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-singapore.jpg"
        },
        {
            "id": "event-002",
            "country": "Saudi Arabia",
            "country_code": "🇸🇦",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-saudi.jpg"
        },
        {
            "id": "event-003",
            "country": "Azerbaijan",
            "country_code": "🇦🇿",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-Azerbaijan.jpg"
        },
        {
            "id": "event-004",
            "country": "Jepang",
            "country_code": "🇯🇵",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-jepang.jpg"
        },
        {
            "id": "event-005",
            "country": "China",
            "country_code": "🇨🇳",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-china.jpg"
        },
        {
            "id": "event-006",
            "country": "Malaysia",
            "country_code": "🇲🇾",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-malaysia.jpg"
        },
        {
            "id": "event-007",
            "country": "Australia",
            "country_code": "🇦🇺",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-australia.jpg"
        },
        {
            "id": "event-008",
            "country": "Jerman",
            "country_code": "🇩🇪",
            "image_url": "https://snpygntfpumljzhikwym.supabase.co/storage/v1/object/public/progress-jogja-bucket/event/event-jerman.jpg"
        }
    ]'::jsonb,
    updated_at = NOW()
WHERE id = 'e7a9f2d8-5b8c-4f1e-8d0f-6c7a3b9e1d2f';


-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Seeds data berhasil diinsert! Total produk: 25, Kategori: 5, Admin: 1';
END $$;
