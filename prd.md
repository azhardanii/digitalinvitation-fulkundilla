# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Product Name:** Dynamic Personal Mini-Site & Greeting Engine
**Document Version:** 1.2 (React Architecture - Dynamic Flow)
**Architecture:** Mobile-First Web Application
**Primary Reference:** `arya-ayufam.ucapanlebaran`, `for.jaypark`, `pesandaripinut`

---

## 1. PRODUCT OVERVIEW
**Dynamic Personal Mini-Site** adalah sebuah *framework* *landing page* *mobile-first* yang dirancang untuk kebutuhan personalisasi tingkat tinggi, seperti: Kartu Ucapan Hari Raya, Surat Romantis, Undangan Digital, atau Portofolio Personal. 

Sistem ini didesain secara dinamis. AI akan menyusun isi konten (teks, gambar, tombol) secara modular sesuai *brief* pengguna, namun dengan mematuhi satu *User Flow* utama yang baku: **Mulai dari Cover (Opening) menuju Halaman Isi (Main Content).**

---

## 2. TECHNICAL SPECIFICATIONS & TECH STACK
* **Core Framework:** **React.js** (Sangat direkomendasikan menggunakan **Next.js** untuk memanfaatkan fitur bawaan Image Optimization).
* **Image & Asset Optimization (CRITICAL):**
    * Penggunaan komponen `<Image />` bawaan Next.js untuk optimasi format otomatis (konversi ke WebP/AVIF).
    * Implementasi *Lazy Loading* secara *default* untuk semua media.
    * Pengaturan dimensi gambar (*width* & *height*) harus eksplisit untuk mencegah *Cumulative Layout Shift* (CLS).
* **Styling:** Tailwind CSS.
* **State Management:** React Hooks (`useState`, `useEffect`, `useRef`) untuk mengontrol interaksi, *audio*, dan *auto-scroll*.

---

## 3. DESIGN SYSTEM & DYNAMIC VARIABLES (AI INSTRUCTIONS)
*Ini adalah panduan utama bagi AI. Setiap kali User memberikan brief, AI WAJIB memetakan brief tersebut ke dalam variabel sistem di bawah ini sebelum men-generate kode.*

### A. Theming & Branding (Tailwind Config / CSS Root Variables)
AI harus mengonversi *brief* desain menjadi palet warna dan tipografi global:
* `--font-primary`: Font untuk Heading dan Cover.
* `--font-secondary`: Font untuk Paragraf dan Body.
* `--color-bg`: Warna latar belakang utama.
* `--color-primary`: Warna aksen utama untuk elemen interaktif (tombol, ikon).
* `--color-text-dark` & `--color-text-light`: Warna tipografi utama dan sekunder.

### B. Global Configurations
* `audioUrl`: Tautan aset musik utama (MP3/WAV).
* `scrollSpeed`: Kecepatan *auto-scroll* dalam satuan *pixel/second* atau interval.

---

## 4. ARCHITECTURE & USER FLOW (HIGH-LEVEL)
Aplikasi ini berjalan dalam 2 tahapan layar (State) yang saling berkesinambungan:

### A. The Cover (Opening Gate)
Ini adalah impresi pertama saat pengguna membuka tautan.
* **Tampilan:** Memenuhi layar (*Full-screen viewport*) dengan visual utama (Judul Acara, Nama Penerima, Latar Belakang).
* **Fungsi Kritis:** Halaman ini bertindak sebagai "Penahan" (*Gate*). Terdapat **Tombol Utama** (misal: "Buka Pesan").
* **Logika Interaksi:** Saat tombol ditekan, aplikasi akan memutar musik latar (*trigger audio* untuk *bypass browser autoplay policy*), membuka gembok halaman, dan membawa pengguna masuk ke area Halaman Isi.

### B. Halaman Isi (Main Content)
Area utama tempat AI menyusun konten (cerita, foto, tautan) sesuai *brief*.
* **Floating Controls (Utilitas Wajib):** Saat berada di halaman isi, wajib ada tombol yang melayang (*sticky/fixed* di pojok layar) untuk kontrol interaksi pengguna:
    1.  **Toggle Audio:** Tombol On/Off untuk mematikan atau menyalakan musik latar.
    2.  **Toggle Auto-Scroll:** Tombol On/Off. Jika diaktifkan, halaman akan bergerak turun perlahan secara otomatis untuk kenyamanan membaca (*hands-free*).

---

## 5. UI/UX & ANIMATION GUIDELINES
**Aturan Animasi (CRITICAL):** Animasi harus natural, elegan, dan **tidak berlebihan** (*tidak lebay* seperti putaran 360 derajat atau efek *bounce* yang ekstrim).

1.  **Scroll-Triggered Animations:** Elemen konten di Halaman Isi hanya boleh menggunakan efek transisi berikut saat pengguna men-*scroll* layar (terlihat/masuk ke dalam *viewport*):
    * *Fade-in* (Muncul perlahan).
    * *Slide-in from Left* (Muncul perlahan dari kiri ke kanan).
    * *Slide-in from Right* (Muncul perlahan dari kanan ke kiri).
    * *Slide-up* (Muncul perlahan dari bawah ke atas).
2.  **Micro-interactions:** Setiap area sentuh (tombol/ikon) harus memiliki efek *hover* yang lembut (perubahan warna minor) dan efek *active* saat ditekan (skala sedikit mengecil / `scale-95`).
3.  **Responsiveness:** Mengutamakan kenyamanan di perangkat *mobile* (Mobile-First). Ukuran *font*, *padding*, dan area tombol harus ergonomis untuk ibu jari.

---

## 6. INSTRUCTION FOR AI: HOW TO USE THIS PRD
*Prompt ini adalah instruksi mandiri untuk AI di sesi selanjutnya.*

**JIKA USER MEMBERIKAN BRIEF, LAKUKAN HAL BERIKUT:**
1.  Baca *brief* User untuk mendeteksi: **Tema/Acara**, **Palet Warna**, **Font**, dan **Isi Konten** yang diminta.
2.  Gunakan **PRD ini** sebagai cetak biru arsitektur React.
3.  Bangun struktur aplikasi dengan 2 area utama: **Cover** (dengan tombol pembuka) dan **Halaman Isi** (lengkap dengan *Floating Controls* untuk Audio & Auto-Scroll).
4.  Susun area *Halaman Isi* menggunakan elemen teks, gambar (dengan Next.js `<Image>`), dan komponen lain sesuai narasi *brief*, dengan menerapkan aturan animasi *fade/slide* natural saat di-*scroll*.
5.  Langsung eksekusi buat menggunakan tech React/Next.js yang fungsional dan siap di-*deploy*.