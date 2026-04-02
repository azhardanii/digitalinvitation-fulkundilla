// ===== FIREBASE INITIALIZATION =====
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

// ===== GLOBAL STATE =====
let isAudioPlaying = false;
let isAutoScrolling = false;
let autoScrollInterval = null;
const audio = document.getElementById('bg-audio');

// ===== URL PARAMS =====
function getRecipientName() {
    const params = new URLSearchParams(window.location.search);
    return params.get('kpd') || 'Tamu Undangan';
}

// ===== COVER PAGE =====
function initCoverPage() {
    const recipientEl = document.getElementById('recipient-name');
    if (recipientEl) {
        recipientEl.textContent = getRecipientName();
    }
    createParticles();
}

function createParticles() {
    const container = document.querySelector('.cover-particles');
    if (!container) return;

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 8 + 6}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(particle);
    }
}

// ===== OPEN INVITATION =====
function openInvitation() {
    const coverPage = document.getElementById('cover-page');
    const mainContent = document.getElementById('main-content');
    const floatingControls = document.querySelector('.floating-controls');
    const btnOpen = document.getElementById('btn-open-invitation');
    const btnImg = btnOpen.querySelector('img');

    // Hide recipient text
    const recipientText = document.getElementById('recipient-name')?.parentElement;
    if (recipientText) {
        recipientText.style.transition = 'opacity 0s ease';
        recipientText.style.opacity = '0';
    }

    // Set button container margin-left to 0
    if (btnOpen.parentElement.classList.contains('ml-4')) {
        btnOpen.parentElement.style.transition = 'margin 0.3s ease';
        btnOpen.parentElement.classList.remove('ml-4');
        btnOpen.parentElement.classList.add('ml-0');
    }

    // Change image to opened envelope
    btnImg.src = 'img/envelop-open.webp';
    // Freeze current hover/shake animation and reset transform as origin point for scale
    btnOpen.style.animation = 'none';
    btnOpen.style.transform = 'scale(1)';

    // Start audio
    if (audio) {
        audio.volume = 0.5;
        audio.play().then(() => {
            isAudioPlaying = true;
            updateAudioButton();
        }).catch(err => {
            console.warn('Audio autoplay blocked:', err);
        });
    }

    // Transition logic: short delay to show "open" envelope, then massive zoom
    setTimeout(() => {
        // Enlarge envelope dramatically
        btnOpen.style.transition = 'transform 1.2s cubic-bezier(0.7, 0, 0.3, 1), opacity 1s ease-in';
        btnOpen.style.transform = 'scale(50)';
        btnOpen.style.opacity = '0';

        // Cover page fades out shortly after envelope zoom begins
        setTimeout(() => {
            coverPage.classList.add('hidden-cover');
        }, 300);

        // Show main content once cover is visually gone
        setTimeout(() => {
            coverPage.style.display = 'none';
            mainContent.classList.add('visible');
            document.body.style.overflow = 'auto';

            setTimeout(() => {
                floatingControls.classList.add('visible');
            }, 300);

            initScrollAnimations();
        }, 1200);
    }, 400); // Brief 400ms pause to let user see 'envelop-open.webp'
}

// ===== AUDIO CONTROLS =====
function toggleAudio() {
    if (!audio) return;

    if (isAudioPlaying) {
        audio.pause();
        isAudioPlaying = false;
        updateAudioButton();
    } else {
        audio.play().then(() => {
            isAudioPlaying = true;
            updateAudioButton();
        }).catch(err => console.warn('Audio play failed:', err));
    }
}

function updateAudioButton() {
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const audioBtn = document.getElementById('btn-audio');

    if (iconPlay && iconPause) {
        if (isAudioPlaying) {
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
            audioBtn?.classList.add('active');
        } else {
            iconPlay.style.display = 'block';
            iconPause.style.display = 'none';
            audioBtn?.classList.remove('active');
        }
    }
}

// ===== AUTO SCROLL =====
function toggleAutoScroll() {
    const btn = document.getElementById('btn-scroll');
    isAutoScrolling = !isAutoScrolling;

    if (isAutoScrolling) {
        btn?.classList.add('active');
        autoScrollInterval = setInterval(() => {
            window.scrollBy({ top: 1, behavior: 'auto' });
            // Stop at bottom
            if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
                toggleAutoScroll();
            }
        }, 30);
    } else {
        btn?.classList.remove('active');
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }
}

// Stop auto-scroll on user interaction
window.addEventListener('wheel', () => {
    if (isAutoScrolling) toggleAutoScroll();
}, { passive: true });
window.addEventListener('touchmove', () => {
    if (isAutoScrolling) toggleAutoScroll();
}, { passive: true });

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Don't unobserve so it can trigger again if desired, or unobserve for one-time
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Lower threshold triggers sooner
        rootMargin: '0px 0px 50px 0px' // Positive margin triggers BEFORE it enters viewport
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ===== FIRESTORE WISHES =====
async function submitWish(e) {
    e.preventDefault();

    const nameInput = document.getElementById('wish-name');
    const messageInput = document.getElementById('wish-message');
    const attendanceInput = document.getElementById('wish-attendance');
    const submitBtn = document.getElementById('btn-submit-wish');

    const name = nameInput.value.trim();
    const message = messageInput.value.trim();
    const attendance = attendanceInput.value;

    if (!name || !message || !attendance) {
        showToast('Mohon lengkapi semua field ya 🙏');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    try {
        await db.collection('fulkundilla-wishes').add({
            name,
            message,
            attendance,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        nameInput.value = '';
        messageInput.value = '';
        attendanceInput.value = '';

        submitBtn.textContent = 'Terkirim! ✓';
        submitBtn.classList.add('success');

        showToast('Doa & harapanmu terkirim! Terima kasih 💕');

        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Kirim Harapan & Doa';
            submitBtn.classList.remove('success');
        }, 3000);

    } catch (error) {
        console.error('Error submitting wish:', error);
        showToast('Gagal mengirim. Coba lagi ya.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Kirim Harapan & Doa';
    }
}

function loadWishes() {
    const wishesContainer = document.getElementById('wishes-list');
    if (!wishesContainer) return;

    db.collection('fulkundilla-wishes')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            wishesContainer.innerHTML = '';

            if (snapshot.empty) {
                wishesContainer.innerHTML = '<p class="wishes-loading">Belum ada pesan. Jadilah yang pertama! 💌</p>';
                return;
            }

            snapshot.forEach((doc) => {
                const data = doc.data();
                const card = createWishCard(data);
                wishesContainer.appendChild(card);
            });
        }, (error) => {
            console.error('Error loading wishes:', error);
            wishesContainer.innerHTML = '<p class="wishes-loading">Gagal memuat pesan.</p>';
        });
}

function createWishCard(data) {
    const card = document.createElement('div');
    card.className = 'wish-card';

    const badgeText = data.attendance === 'Di Jepara' ? '📍 Jepara'
        : data.attendance === 'Di Lamongan' ? '📍 Lamongan'
            : '🙏 Doa';

    card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-secondary text-[0.95rem] font-bold text-cream">${escapeHtml(data.name)}</span>
            <span class="text-[0.7rem] px-2.5 py-1 rounded-full bg-cream/20 text-cream/90 font-secondary">${badgeText}</span>
        </div>
        <p class="font-secondary text-[0.88rem] text-cream/90 leading-[1.6]">${escapeHtml(data.message)}</p>
    `;
    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        const original = btn.innerHTML;
        btn.innerHTML = '✓ Tersalin!';
        showToast('Nomor rekening tersalin!');

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = original;
        }, 2000);
    }).catch(() => {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        btn.classList.add('copied');
        btn.innerHTML = '✓ Tersalin!';
        showToast('Nomor rekening tersalin!');

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '📋 Salin No. Rekening';
        }, 2000);
    });
}

// ===== TOAST =====
function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Prevent scroll when cover is showing
    document.body.style.overflow = 'hidden';

    initCoverPage();

    // Open button
    const btnOpen = document.getElementById('btn-open-invitation');
    if (btnOpen) {
        btnOpen.addEventListener('click', openInvitation);
    }

    // Audio toggle
    const btnAudio = document.getElementById('btn-audio');
    if (btnAudio) {
        btnAudio.addEventListener('click', toggleAudio);
    }

    // Auto-scroll toggle
    const btnScroll = document.getElementById('btn-scroll');
    if (btnScroll) {
        btnScroll.addEventListener('click', toggleAutoScroll);
    }

    // Wishes form
    const wishForm = document.getElementById('wish-form');
    if (wishForm) {
        wishForm.addEventListener('submit', submitWish);
    }

    // Load wishes
    loadWishes();

    // Copy buttons
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const accountNumber = btn.dataset.account;
            copyToClipboard(accountNumber, btn);
        });
    });

    // Audio ended - loop
    if (audio) {
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            audio.play();
        });
    }
});
