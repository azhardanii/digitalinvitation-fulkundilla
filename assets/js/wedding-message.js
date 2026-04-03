// Firebase configuration (Sama seperti halaman utama)
const firebaseConfig = {
    apiKey: "AIzaSyBmEQyoKcgMDeLG8dKvKkl2othO-nWB2eE",
    authDomain: "eid-card-wfa.firebaseapp.com",
    projectId: "eid-card-wfa",
    storageBucket: "eid-card-wfa.firebasestorage.app",
    messagingSenderId: "329449967294",
    appId: "1:329449967294:web:ef047dcdd6a8ecd0bd58ef"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let allMessages = [];

// Formatter Tanggal (Format simpel yang diminta: 04 Apr 2026, 12:30)
const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    
    // Firestore timestamp to JS Date
    const date = timestamp.toDate();
    
    const day = date.getDate().toString().padStart(2, '0');
    
    // Array nama bulan singkat
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const month = monthNames[date.getMonth()];
    
    const year = date.getFullYear();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

// Listen to Firestore Realtime Updates
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('table-body');
    const btnExport = document.getElementById('btn-export');

    db.collection('fulkundilla-wishes')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            allMessages = [];
            let html = '';

            if (snapshot.empty) {
                tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-maroon-dark opacity-60 bg-white">Tidak ada pesan yang tersimpan di sistem saat ini.</td></tr>`;
                return;
            }

            snapshot.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;
                
                // Track for CSV export
                allMessages.push({ id, ...data });

                const dateStr = formatDate(data.createdAt);
                
                // Badge color based on attendance
                let badgeClass = 'bg-cream text-maroon-dark';
                let attendanceText = escapeHtml(data.attendance || '-');

                if (attendanceText.toLowerCase().includes('belom bisa') || attendanceText.toLowerCase().includes('tidak hadir')) {
                    badgeClass = 'bg-red-100 text-red-800 border border-red-200';
                } else if (attendanceText.toLowerCase().includes('hadir')) {
                    badgeClass = 'bg-green-100 text-green-800 border border-green-200';
                }

                html += `
                    <tr class="hover:bg-cream/20 transition-colors bg-white">
                        <td class="px-6 py-4 text-sm opacity-80 whitespace-nowrap align-top">${dateStr}</td>
                        <td class="px-6 py-4 text-sm font-bold text-maroon align-top">${escapeHtml(data.name || 'Tanpa Nama')}</td>
                        <td class="px-6 py-4 text-sm align-top">
                            <span class="px-3 py-1.5 rounded-full text-[0.7rem] font-bold tracking-wide ${badgeClass}">
                                ${attendanceText}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-[0.85rem] leading-relaxed align-top">${escapeHtml(data.message || '')}</td>
                        <td class="px-6 py-4 text-sm text-center align-top">
                            <button onclick="deleteWish('${id}')" class="text-maroon/60 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-200 shadow-sm" title="Hapus pesan ini">
                                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </td>
                    </tr>
                `;
            });

            tableBody.innerHTML = html;
        }, (error) => {
            console.error('Error fetching data:', error);
            tableBody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-red-500 bg-white">Gagal memuat data. Periksa koneksi internetmu.</td></tr>`;
        });

    btnExport.addEventListener('click', exportToCSV);
});

// Delete Function
window.deleteWish = async (id) => {
    if (confirm('Yakin ingin menghapus pesan ini? Data yang terhapus tidak dapat dikembalikan dan akan hilang dari layar undangan utama.')) {
        try {
            await db.collection('fulkundilla-wishes').doc(id).delete();
            // No need to manually refresh the table since onSnapshot will detect the deletion and re-render
        } catch (error) {
            console.error('Error deleting doc:', error);
            alert('Gagal menghapus pesan. Coba lagi kelak.');
        }
    }
};

// Export to CSV Function
function exportToCSV() {
    if (allMessages.length === 0) {
        alert('Tidak ada data undangan untuk diekspor!');
        return;
    }

    // CSV Header (Wajib sesuai standar comma-separated)
    let csvContent = "Tanggal,Nama,Kehadiran,Pesan\n";

    allMessages.forEach(item => {
        // Prepare CSV fields and escape quotes properly
        const date = `"${formatDate(item.createdAt)}"`;
        const name = `"${(item.name || 'Tanpa Nama').replace(/"/g, '""')}"`;
        const attendance = `"${(item.attendance || '').replace(/"/g, '""')}"`;
        const message = `"${(item.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;

        csvContent += `${date},${name},${attendance},${message}\n`;
    });

    // Create a Blob and trigger Download
    // \ufeff is the BOM (Byte Order Mark) which helps Excel recognize the file as UTF-8
    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    
    // Generate clean filename
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `Daftar_Tamu_FulkunDilla_${dateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Cleanup
}

// XSS Sanitizer untuk mencegah serangan inject saat me-render HTML dari DB
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
