// Vinayak Studio Website JavaScript

const API_URL = window.API_URL || "https://ajit63500-vs-web.hf.space/api-proxy"; // HF Space API Proxy
// --- SCROLL LOGIC FOR HAMBURGER ---
window.addEventListener('scroll', function () {
    const heroHeight = document.getElementById('hero-container').offsetHeight;
    const hamburger = document.querySelector('.hamburger');
    if (!hamburger) return; // Safety check

    if (window.scrollY > (heroHeight - 100)) {
        hamburger.classList.add('hidden');
    } else {
        hamburger.classList.remove('hidden');
    }
});

// --- MENU TOGGLE LOGIC ---
function toggleMenu() {
    const nav = document.getElementById('navLinks');
    const burgerIcon = document.querySelector('.hamburger i');
    const hamburgerDiv = document.querySelector('.hamburger');

    nav.classList.toggle('active');

    if (nav.classList.contains('active')) {
        // Menu is Open -> Show Close Icon
        burgerIcon.classList.remove('fa-bars');
        burgerIcon.classList.add('fa-times');

        // Ensure button stays visible even if scrolled down
        if (hamburgerDiv) hamburgerDiv.classList.remove('hidden');
    } else {
        // Menu is Closed -> Show Bars Icon
        burgerIcon.classList.remove('fa-times');
        burgerIcon.classList.add('fa-bars');
    }
}

// --- GALLERY & LIGHTBOX LOGIC ---
let photos = [], idx = 0, sel = [], isSelMode = false, clientCode = "", clientName = "";
let touchS = 0, touchE = 0;

window.onscroll = () => {
    const n = document.getElementById('navbar');
    if (window.scrollY > 50) n.classList.add('scrolled'); else n.classList.remove('scrolled');

    // Trigger the hamburger scroll check
    const heroHeight = document.getElementById('hero-container').offsetHeight;
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        if (window.scrollY > (heroHeight - 100)) hamburger.classList.add('hidden');
        else hamburger.classList.remove('hidden');
    }
}

// --- CONTACT FORM ---
function submitToWA() {
    const n = document.getElementById('waName').value;
    const m = document.getElementById('waMobile').value;
    const d = document.getElementById('waDate').value;
    if (!n || !m) { alert("Name & Mobile are required."); return; }
    window.open(`https://wa.me/916350095221?text=*New Enquiry*%0A*Name:* ${n}%0A*Mobile:* ${m}%0A*Date:* ${d}`, '_blank');
}

// --- INVITE FUNCTIONS --- (handled by dynamic playInvite at bottom)

// --- VIDEO LIGHTBOX ---
function openLB(id) {
    document.getElementById('lbFrame').src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    document.getElementById('vidLB').style.display = 'flex';
}

function closeLB() {
    document.getElementById('lbFrame').src = "";
    document.getElementById('vidLB').style.display = 'none';
}

// --- IMAGE LIGHTBOX ---
function openImgLB(i, mode = 'sig') {
    idx = i;
    isSelMode = (mode === 'sel');
    updateImgView();
    document.getElementById('imgLB').style.display = 'flex';
}

function closeImgLB() {
    document.getElementById('imgLB').style.display = 'none';
}

function changePhoto(d) {
    idx += d;
    if (idx >= photos.length) idx = 0;
    if (idx < 0) idx = photos.length - 1;
    updateImgView();
}

function updateImgView() {
    const path = isSelMode ? `${API_URL}/api/image/selection/${clientCode}/` : `${API_URL}/api/gallery/`;
    const name = photos[idx];
    document.getElementById('lbImg').src = path + name;
    const area = document.getElementById('lbActions');
    if (isSelMode) {
        area.style.display = 'flex';
        const btn = document.getElementById('lbHeart');
        if (sel.includes(name)) {
            btn.classList.add('selected');
            document.getElementById('lbHeartTxt').innerText = "Selected";
        } else {
            btn.classList.remove('selected');
            document.getElementById('lbHeartTxt').innerText = "Select";
        }
    } else {
        area.style.display = 'none';
    }
}

function toggleHeart() {
    const name = photos[idx];
    const i = sel.indexOf(name);
    const gridEl = document.getElementById(`g-${idx}`);
    if (i > -1) {
        sel.splice(i, 1);
        if (gridEl) gridEl.classList.remove('selected-active');
    } else {
        sel.push(name);
        if (gridEl) gridEl.classList.add('selected-active');
    }
    updateImgView();
    updateFloat();
}

function updateFloat() {
    const btn = document.getElementById('sendFloat');
    document.getElementById('selCount').innerText = sel.length;
    btn.style.display = sel.length > 0 ? 'block' : 'none';
}

function sendSelection() {
    window.open(`https://wa.me/916350095221?text=*Selection for ${clientName}*%0ACount: ${sel.length}%0AFiles: ${sel.join(', ')}`, '_blank');
}

// --- TOUCH & KEYBOARD CONTROLS ---
const lb = document.getElementById('imgLB');
lb.addEventListener('touchstart', e => touchS = e.changedTouches[0].screenX);
lb.addEventListener('touchend', e => {
    touchE = e.changedTouches[0].screenX;
    if (touchE < touchS - 50) changePhoto(1);
    if (touchE > touchS + 50) changePhoto(-1);
});

document.addEventListener('keydown', e => {
    if (document.getElementById('imgLB').style.display == 'flex') {
        if (e.key == 'ArrowRight') changePhoto(1);
        if (e.key == 'ArrowLeft') changePhoto(-1);
        if (e.key == 'Escape') closeImgLB();
    }
});

// --- CLIENT GALLERY ---
function unlockClientGallery() {
    const code = document.getElementById('clientCodeInput').value.trim().toUpperCase();
    if (!code) { alert("Please enter your access code."); return; }

    // Step 1: Verify client exists
    fetch(`${API_URL}/api/clients`)
        .then(r => r.json())
        .then(d => {
            if (!d || !d[code]) { alert("Invalid Code. Please try again."); return; }
            const c = d[code];
            clientCode = code;
            clientName = c.name;
            sel = [];
            updateFloat();

            // Step 2: Load photos from selection folder via dedicated endpoint
            fetch(`${API_URL}/api/clients/${code}/photos`)
                .then(r => r.json())
                .then(photoData => {
                    photos = photoData.photos || [];

                    let h = `<div style="padding:40px; background:white; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">`;
                    h += `<h3 style="font-family:'Playfair Display'; margin-bottom:8px;">Welcome, ${c.name} 👋</h3>`;
                    h += `<p style="color:#777; margin-bottom:20px;">${photos.length} photo(s) ready for selection</p>`;
                    if (c.zip_link) h += `<button onclick="window.open('${c.zip_link}')" class="c-btn" style="width:auto; margin:10px; background:#d32f2f;">⬇️ Download All</button>`;
                    if (c.upload_link) h += `<button onclick="window.open('${c.upload_link}')" class="c-btn" style="width:auto; margin:10px; background:#25d366;">📤 Upload Photos</button>`;
                    h += `<div class="masonry-grid" style="margin-top:30px;">`;
                    if (photos.length > 0) {
                        photos.forEach((p, i) => h += `<div class="m-item" id="g-${i}" onclick="openImgLB(${i},'sel')"><img src="${API_URL}/api/image/selection/${code}/${p}" loading="lazy"></div>`);
                    } else {
                        h += `<p style="color:#999; text-align:center; padding:40px;">No photos uploaded yet. Check back soon!</p>`;
                    }
                    h += `</div></div>`;
                    document.getElementById('clientResultArea').innerHTML = h;
                })
                .catch(() => {
                    document.getElementById('clientResultArea').innerHTML = `<p style="color:red;">Error loading photos. Please try again.</p>`;
                });
        })
        .catch(() => alert("Could not connect to server. Please try again."));
}

// --- DATA LOADING & DYNAMIC CONTENT ---
document.addEventListener('DOMContentLoaded', () => {
    fetch(`${API_URL}/api/website-content`).then(r => r.json()).then(d => {
        // Hero Media
        const hc = document.getElementById('hero-container');
        if (d.hero_images && d.hero_images.length) {
            d.hero_images.forEach((f, i) => {
                let el = f.match(/\.(mp4|webm)$/i) ? document.createElement('video') : document.createElement('img');
                el.src = `${API_URL}/api/hero/${f}`;
                el.className = 'hero-media';
                if (el.tagName == 'VIDEO') {
                    el.autoplay = true;
                    el.muted = true;
                    el.loop = true;
                    el.setAttribute('playsinline', '');
                    el.setAttribute('preload', 'auto');
                    // Poster fallback
                    el.setAttribute('poster', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80');
                }
                if (i === 0) el.classList.add('active');
                hc.prepend(el);
            });

            if (d.hero_images.length > 1) {
                let c = 0;
                const items = document.querySelectorAll('.hero-media');
                setInterval(() => {
                    items[c].classList.remove('active');
                    c = (c + 1) % items.length;
                    items[c].classList.add('active');
                }, 5000);
            }
        }

        // Films
        if (d.films) {
            document.getElementById('films-dynamic').innerHTML = d.films.map(id => `
                <div class="film-card">
                    <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" class="film-thumb" onclick="openLB('${id}')">
                    <div class="film-info">
                        <button class="film-btn" onclick="openLB('${id}')">Watch Film</button>
                    </div>
                </div>`).join('');
        }

        // Reels
        if (d.reels) {
            document.getElementById('reels-dynamic').innerHTML = d.reels.map(id => `
                <div class="reel-frame">
                    <iframe src="https://www.instagram.com/reels/${id}/embed" width="100%" height="100%" frameborder="0"></iframe>
                </div>`).join('');
        }

        // Gallery Photos
        if (d.photos) {
            photos = d.photos;
            document.getElementById('photo-grid-dynamic').innerHTML = d.photos.map((p, i) => `
                <div class="m-item" onclick="openImgLB(${i})">
                    <img src="${API_URL}/api/gallery/${p}">
                </div>`).join('');
        }

        // Invites (bind onclick manually if dynamic, but keeping structure per original)
        if (d.invites) {
            window.inviteLinks = d.invites;
        }
    }).catch(e => console.error("Error loading data from API:", e));
});

// Update playInvite to use dynamic invite links
function playInvite(type) {
    if (window.inviteLinks && window.inviteLinks[type] && window.inviteLinks[type].length > 0) {
        window.open(window.inviteLinks[type], '_blank');
    } else {
        alert("Invitation link not set by Admin yet.");
    }
}
