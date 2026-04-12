// Vinayak Studio Website JavaScript

const API_URL = "https://ajit63500-vinayakweb.hf.space";
let invitationCatalog = { '2d': [], '3d': [], 'teaser': [] };
let __invitationCatalogBackup = { '2d': [], '3d': [], 'teaser': [] };

// 💎 Naya state tracking


// 🎨 Premium inline SVG fallback — never fails, no external CDN dependency
const DEFAULT_THUMB = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="#1a1a1a"/><circle cx="300" cy="180" r="50" fill="#c5a059" opacity="0.9"/><polygon points="282,158 282,202 322,180" fill="white"/><text x="300" y="260" fill="rgba(197,160,89,0.5)" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle" letter-spacing="3">VINAYAK STUDIO</text></svg>')}`;

// ===================================================
// 📊 SILENT ANALYTICS TRACKER (Views, Plays, Explores)
// ===================================================
// ========== PERFORMANCE UTILS ==========
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
    };
}

function trackEvent(eventType) {
    // Determine source (master or guest)
    const vipSession = localStorage.getItem('vip_master');
    const isGuest = window.isGuestMode || document.body.classList.contains('is-vip-guest');
    const source = isGuest ? 'guest' : (vipSession ? 'master' : 'guest');

    // 🔥 CONTEXT-AWARE: Only track invitation shares for guests
    if (isGuest && !window._isInvitationShare) {
        return; // Don't track media vault shares
    }

    // Get client code from various sources
    const cCode = window.clientCode ||
        (vipSession ? JSON.parse(vipSession).code : null) ||
        localStorage.getItem('clientCode') ||
        new URLSearchParams(window.location.search).get('code');

    if (!cCode) return; // No client context, skip silently

    // Fire-and-forget request (non-blocking)
    const formData = new FormData();
    formData.append('client_code', cCode);
    formData.append('event_type', eventType);
    formData.append('source', source);

    fetch(`${API_URL}/api/stats/track`, {
        method: 'POST',
        body: formData
    }).catch(() => { }); // Silently ignore errors
}

// ===================================================
// 🖼️ CANVAS SHARE CARD GENERATOR (Fallback)
// ===================================================
async function generateCanvasShareCard(cName, thumbUrl) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;  // 4:5 ratio (best for WhatsApp)
        const ctx = canvas.getContext('2d');

        // Dark premium background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 1080, 1350);

        // Gold border
        const borderWidth = 12;
        ctx.strokeStyle = '#c5a059';
        ctx.lineWidth = borderWidth;
        ctx.strokeRect(borderWidth / 2, borderWidth / 2, 1080 - borderWidth, 1350 - borderWidth);

        // Inner gold line
        ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(30, 30, 1020, 1290);

        const loadImage = (url) => new Promise((res) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = () => res(null);
            img.src = url;
        });

        loadImage(thumbUrl || '').then((img) => {
            if (img) {
                // Draw thumbnail centered with cover fit
                const imgSize = 700;
                const x = (1080 - imgSize) / 2;
                const y = 120;

                // Rounded rectangle mask
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(x, y, imgSize, imgSize, [20]);
                ctx.clip();

                const scale = Math.max(imgSize / img.width, imgSize / img.height);
                const sw = img.width * scale;
                const sh = img.height * scale;
                ctx.drawImage(img, x - (sw - imgSize) / 2, y - (sh - imgSize) / 2, sw, sh);
                ctx.restore();

                // Gold frame around image
                ctx.strokeStyle = '#c5a059';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(x, y, imgSize, imgSize, [20]);
                ctx.stroke();
            }

            // Text: "YOU ARE INVITED"
            ctx.fillStyle = '#c5a059';
            ctx.font = '600 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('✦  Y O U   A R E   I N V I T E D  ✦', 540, 900);

            // Client name
            ctx.fillStyle = '#ffffff';
            ctx.font = '700 42px serif';
            ctx.fillText(cName || 'Our Special Celebration', 540, 980);

            // Divider line
            ctx.strokeStyle = '#c5a059';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(380, 1020);
            ctx.lineTo(700, 1020);
            ctx.stroke();

            // CTA
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '400 16px sans-serif';
            ctx.fillText('Tap the link below to enter the VIP Lounge', 540, 1070);

            // Studio branding
            ctx.fillStyle = 'rgba(197, 160, 89, 0.5)';
            ctx.font = '700 12px sans-serif';
            ctx.fillText('VINAYAK STUDIO', 540, 1260);

            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', 0.92);
        });
    });
}

// ========== FULLSCREEN HELPERS ==========
function enterFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen().catch(err => console.log(`Fullscreen error: ${err}`));
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.log(`Exit fullscreen error: ${err}`));
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

// Global State Management
window.isGuestMode = false;

function sanitizeUrl(url) {
    if (!url) return url;
    // Remove ?code=... or &code=... from URL
    return url.replace(/([?&])code=[^&]*&?/g, '$1').replace(/[?&]$/, '');
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function extractVideoId(url) {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : '';
}

// 🚀 CLIENT LOUNGE ENGINE: Backend se data fetch karne ke liye
/* -------------------------------------
   GUEST RSVP TRACKING LOGIC
------------------------------------- */
// 🎯 TRIGGER INTERCEPTION (Hold action until guest registers)
window._pendingGuestAction = null;

function checkGuestTrigger(actionFunc) {
    if (window.isGuestMode && !window._guestRSVPCompleted && window.currentGuestToken) {
        // 🔥 Check localStorage first (safety net)
        const storageKey = `guest_rsvp_${window.currentGuestToken}`;
        if (localStorage.getItem(storageKey)) {
            window._guestRSVPCompleted = true;
            return false; // Already registered, proceed normally
        }

        window._pendingGuestAction = actionFunc;
        const rsvpModal = document.getElementById('guestRSVPModal');
        if (rsvpModal) {
            rsvpModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            return true;
        }
    }
    return false;
}

/* -------------------------------------
   GUEST RSVP TRACKING LOGIC
------------------------------------- */
async function submitGuestRSVP() {
    const nameEl = document.getElementById('rsvpName');
    const phoneEl = document.getElementById('rsvpPhone');
    const arrEl = document.getElementById('rsvpArrival');

    if (!nameEl.value.trim()) {
        alert("Please enter your name to proceed.");
        nameEl.focus();
        return;
    }

    const payload = {
        token: window.currentGuestToken,
        name: nameEl.value.trim(),
        phone: phoneEl.value.trim(),
        city: arrEl ? arrEl.value.trim() : "" // Repurposing 'city' field in backend for 'arrival' to avoid backend changes
    };

    window._guestRSVPCompleted = true; // Mark as registered

    // Hide RSVP modal
    const rsvpModal = document.getElementById('guestRSVPModal');
    if (rsvpModal) rsvpModal.style.display = 'none';
    document.body.style.overflow = '';

    // Log the RSVP to the backend asynchronously
    try {
        fetch(`${API_URL}/api/invite/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error("RSVP Log Error:", err));
    } catch (err) { }

    // 🔥 SMART PERSISTENCE: Remember guest for this token
    if (window.currentGuestToken) {
        const storageKey = `guest_rsvp_${window.currentGuestToken}`;
        localStorage.setItem(storageKey, JSON.stringify({
            name: payload.name,
            phone: payload.phone,
            city: payload.city,
            timestamp: Date.now()
        }));
    }

    // Resume the intercepted action (play video, open gallery, etc.)
    if (window._pendingGuestAction) {
        const action = window._pendingGuestAction;
        window._pendingGuestAction = null;
        action();

        // Flash Luxury Welcome Message
        const welcomeEl = document.getElementById('rsvpWelcomeOverlay');
        const welcomeText = document.getElementById('rsvpWelcomeText');
        if (welcomeEl && welcomeText) {
            welcomeText.innerHTML = `Welcome, <span style="color:#c5a059;">${escapeHtml(payload.name)}</span>`;
            welcomeEl.style.display = 'flex';
            welcomeEl.style.opacity = '1';

            // Wait for 3.5 seconds before fading out smoothly
            setTimeout(() => {
                welcomeEl.style.opacity = '0';
                setTimeout(() => {
                    welcomeEl.style.display = 'none';
                    welcomeEl.style.opacity = '1'; // Reset for next time if needed
                }, 1500); // 1.5s fade transition defined in CSS
            }, 3500);
        }
    }
}

// 👑 PHASE 4: CLIENT LOUNGE ANALYTICS WIDGET
function viewClientGuestList() {
    const container = document.getElementById('inlineGuestListContainer');
    const contentDiv = document.getElementById('inlineGuestListContent');

    if (!container || !contentDiv) return;

    // Toggle visibility
    if (container.style.display === 'none') {
        // Populate the list
        if (!window.currentClientData || !window.currentClientData.guest_rsvps || window.currentClientData.guest_rsvps.length === 0) {
            contentDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">No guests have registered yet. Share your invitation link to see RSVPs here!</div>';
        } else {
            const rsvps = window.currentClientData.guest_rsvps;
            // Sort by most recent
            rsvps.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            contentDiv.innerHTML = rsvps.map(rsvp => {
                const dateStr = new Date(rsvp.timestamp).toLocaleDateString();
                return `
                    <div style="background: #1a1a1a; padding: 15px; margin-bottom: 10px; border-radius: 8px; border-left: 3px solid #c5a059;">
                        <div style="font-weight: bold; color: #fff; font-size: 16px;">${escapeHtml(rsvp.name)}</div>
                        ${rsvp.phone ? `<div style="font-size: 13px; margin-top: 5px;"><i class="fas fa-phone-alt" style="color:#888; width:15px;"></i> ${escapeHtml(rsvp.phone)}</div>` : ''}
                        ${rsvp.city ? `<div style="font-size: 13px; margin-top: 5px;"><i class="fas fa-calendar-check" style="color:#888; width:15px;"></i> Arr: <span style="color:#c5a059;">${escapeHtml(rsvp.city)}</span></div>` : ''}
                        <div style="font-size: 11px; color: #555; margin-top: 8px;">Registered: ${dateStr}</div>
                    </div>
                `;
            }).join('');
        }
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

function toggleInlineGuestList() {
    const container = document.getElementById('inlineGuestListContainer');
    if (container) {
        container.style.display = 'none';
    }
}

// ===================================================
// 👑 VIP CLIENT LOUNGE: SMART 2‑STAGE ENGINE
// ===================================================
// Helper to create Netflix card (no file explorer bug)
function createCard(imgSrc, title, onClickHandler, mediaType, mediaUrl) {
    const div = document.createElement('div');
    div.className = 'n-card';
    div.dataset.type = mediaType;
    div.dataset.url = sanitizeUrl(mediaUrl);
    div.dataset.title = title;

    let finalSrc = sanitizeUrl(imgSrc);
    if (imgSrc && imgSrc.includes('maxresdefault.jpg')) {
        finalSrc = imgSrc.replace('maxresdefault.jpg', 'hqdefault.jpg');
    }
    div.dataset.thumb = finalSrc;
    div.innerHTML = `
        <img src="${finalSrc}" onerror="this.src='${DEFAULT_THUMB}'">
        <div class="n-card-title">${escapeHtml(title)}</div>
    `;
    // Main click handler for playing video
    div.addEventListener('click', (e) => {
        if (isSelectionMode) {
            e.stopPropagation();
            div.classList.toggle('selected-for-guest');
            updateSelectionCount();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        onClickHandler();
    });
    return div;
}

function getThumbnail(url) {
    const vidId = extractVideoId(url);
    if (vidId) return `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
    return DEFAULT_THUMB;
}


function createVaultCard(iconClass, title, onClickHandler) {
    const div = document.createElement('div');
    div.className = 'vault-card';
    div.innerHTML = `
        <i class="${iconClass}"></i>
        <div class="vault-title">${escapeHtml(title)}</div>
    `;
    div.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClickHandler();
    });
    return div;
}

function playMainFeature() {
    // Find the first film/reel card in the cinema rail
    const firstCard = document.querySelector('#content-cinema .n-card');
    if (firstCard) {
        firstCard.click();
    } else {
        alert("Main feature is currently being processed.");
    }
}

function processClientLoungeData(clientData, clientCode) {
    if (document.body.classList.contains('guest-mode')) window.isGuestMode = true;
    console.log('Wedding films data:', clientData.wedding_films); // Debug log
    window.clientCode = clientCode;
    window.clientName = clientData.name;
    window.clientGalleries = clientData.galleries || {};

    // 1. Safety Checks (Essential)
    const modal = document.getElementById('vipNetflixModal');
    const railsContainer = document.getElementById('netflix-rails');
    const heroBg = document.getElementById('netflix-hero-bg');

    if (!modal) {
        console.error('vipNetflixModal element missing in HTML. Deployment out of sync?');
    }

    // 1. SET CUSTOM HERO IMAGE & TRIGGER ANIMATIONS
    const heroImgLayer = document.getElementById('hero-image-layer');
    if (heroImgLayer) {
        const heroUrl = sanitizeUrl(clientData.hero_image || 'assets/images/Client_hero_default.webp');
        const isVideo = heroUrl.match(/\.(mp4|mov|avi|webm|mov)$/i);

        if (isVideo) {
            heroImgLayer.innerHTML = `<video src="${heroUrl}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>`;
            heroImgLayer.style.backgroundImage = 'none';
        } else {
            heroImgLayer.innerHTML = '';
            heroImgLayer.style.backgroundImage = `url('${heroUrl}')`;
        }
    }

    const titleElem = document.getElementById('vipModalTitle');
    const descElem = document.getElementById('netflix-hero-desc');

    // Reset guest message if exists
    const existingMsg = document.querySelector('.modal-guest-msg');
    if (existingMsg) existingMsg.remove();

    if (titleElem) {
        if (window.isGuestMode) {
            // Direct execution for guest title customization
            const onlyInvitation = clientData.invitation_video &&
                (!clientData.films || !clientData.films.length) &&
                (!clientData.reels || !clientData.reels.length) &&
                (!clientData.wedding_films || !clientData.wedding_films.length) &&
                (!clientData.album_pages || !clientData.album_pages.length) &&
                (!clientData.galleries || !Object.keys(clientData.galleries).length);

            const clientName = clientData.name || "Our beloved couple";
            let mainTitleText = onlyInvitation ? "A Beautiful Beginning" : "An Exclusive Memory";
            let messageText = onlyInvitation
                ? `<strong>${clientName}</strong> cordially invite you to witness and celebrate the most magical day of their lives.`
                : `<strong>${clientName}</strong> have hand-picked these beautiful moments to share exclusively with you.`;

            titleElem.innerHTML = mainTitleText;
            if (descElem) descElem.style.display = 'none';

            // 🔥 Clear default hero buttons for guests
            const heroActions = document.querySelector('.premium-hero-actions');
            if (heroActions) heroActions.style.display = 'none';
            // Create and append guest message
            const msg = document.createElement('p');
            msg.className = 'guest-hero-msg modal-guest-msg';
            msg.innerHTML = messageText;
            titleElem.after(msg);
        } else {
            // 🔥 Guest mode active hai toh non-guest title set mat karo
            if (document.body.classList.contains('guest-mode')) {
                console.log("Guest mode active – skipping non-guest title");
            } else {
                titleElem.innerText = `${clientData.name.toUpperCase()}'S STORY`;
                if (descElem) descElem.style.display = 'block';
            }
        }

        // Smart Inject: Curate Button in the first available blank space
        function injectCurateButton() {
            if (document.querySelector('.curate-guest-btn')) return;

            const targetIds = ['content-invitation', 'content-album', 'content-cinema', 'content-reels', 'content-wedding'];
            let targetContainer = null;

            for (const id of targetIds) {
                const el = document.getElementById(id);
                const rail = document.getElementById(id.replace('content-', 'rail-'));
                if (el && el.children.length > 0 && rail && rail.style.display !== 'none') {
                    targetContainer = el;
                    break;
                }
            }

            if (targetContainer) {
                const btn = document.createElement('button');
                btn.className = 'curate-guest-btn';
                btn.innerHTML = '<i class="fab fa-whatsapp" style="font-size: 13px; color: #25D366;"></i> Share via WhatsApp';
                btn.style.marginLeft = '40px';
                btn.style.alignSelf = 'center';
                btn.onclick = () => {
                    const totalItems = (clientData.invitation_video ? 1 : 0) +
                        (clientData.films?.length || 0) +
                        (clientData.reels?.length || 0) +
                        (clientData.wedding_films?.length || 0) +
                        (clientData.album_pages?.length ? 1 : 0) +
                        (Object.keys(clientData.galleries || {}).length);

                    if (totalItems <= 1) {
                        let singleItem = null;
                        if (clientData.invitation_video) singleItem = { type: 'invitation', id: clientData.invitation_video, title: 'Invitation' };
                        else if (clientData.films?.length) singleItem = { type: 'film', id: clientData.films[0].url, title: clientData.films[0].title };
                        else if (clientData.reels?.length) singleItem = { type: 'reel', id: clientData.reels[0].url, title: clientData.reels[0].title };

                        if (singleItem) generateGuestLinkAndShareMulti([singleItem]);
                        else toggleConciergeMode(true);
                    } else {
                        toggleConciergeMode(true);
                    }
                };
                targetContainer.appendChild(btn);
            }
        }
        setTimeout(injectCurateButton, 500); // Small delay to ensure rail rendering
    }

    // 2. DYNAMIC STUDIO BADGE (Luxury Shield Engine)
    const monogramEl = document.getElementById('dynamic-monogram');
    const studioNameEl = document.getElementById('dynamic-studio-name');

    if (monogramEl && studioNameEl) {
        let fullName = clientData.studio_name || window.studioBadge || 'VINAYAK STUDIO';
        fullName = fullName.trim().toUpperCase();
        let firstLetter = fullName.length > 0 ? fullName.charAt(0) : 'V';
        monogramEl.innerText = firstLetter;
        studioNameEl.innerText = escapeHtml(fullName);
    }

    // 3. Trigger Animations & Clear Rails
    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach(item => {
        item.classList.remove('active');
        setTimeout(() => { item.classList.add('active'); }, 50);
    });

    const rails = ['invitation', 'cinema', 'album', 'gallery', 'vault', 'reels', 'wedding'];
    rails.forEach(r => {
        const contentEl = document.getElementById(`content-${r}`);
        if (contentEl) contentEl.innerHTML = '';
        const railEl = document.getElementById(`rail-${r}`);
        if (railEl) railEl.style.display = 'none';
    });

    // 4. Data Rendering
    // Invitation
    if (clientData.invitation_video) {
        const vidId = extractVideoId(clientData.invitation_video);
        const thumb = sanitizeUrl(clientData.invitation_thumb || (vidId ? `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg` : DEFAULT_THUMB));
        const card = createCard(thumb, 'Watch Invitation', () => playLuxuryVideo(sanitizeUrl(clientData.invitation_video), 'invitation'), 'invitation', clientData.invitation_video);
        const cont = document.getElementById('content-invitation');
        const rail = document.getElementById('rail-invitation');
        if (cont && rail) {
            cont.appendChild(card);

            // Clean up any old RSVP trackers
            const oldTracker = rail.querySelector('.rsvp-tracker');
            if (oldTracker) oldTracker.remove();

            // 👁️ Sleek RSVP Tracking Button (Replaces large table)
            const rsvps = clientData.guest_rsvps || [];

            const rsvpDiv = document.createElement('div');
            rsvpDiv.className = 'rsvp-tracker sleek-tracker-btn';
            rsvpDiv.style.marginTop = '20px';
            rsvpDiv.style.display = 'flex';
            rsvpDiv.style.justifyContent = 'center';

            rsvpDiv.innerHTML = `
                <button onclick="viewClientGuestList()" class="n-btn highlight" style="background: rgba(0,0,0,0.5); border: 1px solid rgba(197,160,89,0.3); color: #c5a059; border-radius: 30px; padding: 10px 20px; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease;">
                    <i class="fas fa-eye"></i> Tracker 
                    <span style="background: var(--accent-gold); color: black; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; margin-left: 5px;">${rsvps.length}</span>
                </button>
            `;

            // Add hover effect
            const btn = rsvpDiv.querySelector('button');
            btn.onmouseover = () => { btn.style.background = 'rgba(197,160,89,0.1)'; btn.style.transform = 'translateY(-2px)'; };
            btn.onmouseout = () => { btn.style.background = 'rgba(0,0,0,0.5)'; btn.style.transform = 'translateY(0)'; };

            rail.appendChild(rsvpDiv);

            rail.style.display = 'block';
        }
    }

    // Reels
    const reelsContainer = document.getElementById('content-reels');
    const reelsRail = document.getElementById('rail-reels');
    if (reelsContainer && reelsRail && clientData.reels && Array.isArray(clientData.reels) && clientData.reels.length) {
        clientData.reels.forEach((reel, idx) => {
            if (!reel) return;
            const isObj = typeof reel === 'object' && reel !== null;
            const url = sanitizeUrl(isObj ? reel.url : reel);
            const title = (isObj && reel.title) ? reel.title : `Highlight Reel ${idx + 1}`;
            const vidId = extractVideoId(url);
            let thumb = (isObj && reel.cover) ? sanitizeUrl(reel.cover) : null;
            if (!thumb) thumb = vidId ? `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` : DEFAULT_THUMB;
            const card = createCard(thumb, title, () => playLuxuryVideo(url, 'reel'), 'reel', url);
            reelsContainer.appendChild(card);
        });
        reelsRail.style.display = 'block';
    }

    // Cinema Films
    const cinemaContainer = document.getElementById('content-cinema');
    const cinemaRail = document.getElementById('rail-cinema');
    if (cinemaContainer && cinemaRail && clientData.films && Array.isArray(clientData.films) && clientData.films.length) {
        clientData.films.forEach((film, idx) => {
            if (!film) return;
            const isObj = typeof film === 'object' && film !== null;
            const url = sanitizeUrl(isObj ? film.url : film);
            const title = (isObj && film.title) ? film.title : `Cinematic Highlight ${idx + 1}`;
            const vidId = extractVideoId(url);
            let thumb = (isObj && film.cover) ? sanitizeUrl(film.cover) : null;
            if (!thumb) thumb = vidId ? `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg` : DEFAULT_THUMB;
            const card = createCard(thumb, title || "Untitled Film", () => playLuxuryVideo(url, 'film'), 'film', url);
            cinemaContainer.appendChild(card);
        });
        cinemaRail.style.display = 'block';
    }

    // Wedding Films
    const weddingContainer = document.getElementById('content-wedding');
    const weddingRail = document.getElementById('rail-wedding');
    if (weddingContainer && weddingRail && clientData.wedding_films && Array.isArray(clientData.wedding_films) && clientData.wedding_films.length) {
        clientData.wedding_films.forEach((film, idx) => {
            if (!film) return;
            const isObj = typeof film === 'object' && film !== null;
            const url = sanitizeUrl(isObj ? film.url : film);
            const title = (isObj && film.title) ? film.title : `Wedding Film ${idx + 1}`;
            const vidId = extractVideoId(url);
            let thumb = (isObj && film.cover) ? sanitizeUrl(film.cover) : null;
            if (!thumb) thumb = vidId ? `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg` : DEFAULT_THUMB;
            const card = createCard(thumb, title, () => playLuxuryVideo(url, 'wedding_film'), 'wedding_film', url);
            weddingContainer.appendChild(card);
        });
        weddingRail.style.display = 'block';
    }

    // Digital Album
    const albumCont = document.getElementById('content-album');
    const albumRail = document.getElementById('rail-album');
    if (albumCont && albumRail && clientData.album_pages && clientData.album_pages.length) {
        const thumb = sanitizeUrl(clientData.album_pages[0]);
        const card = document.createElement('div');
        card.className = 'n-card album-stack-card';
        card.dataset.type = 'digital_album';
        card.dataset.url = thumb;
        card.dataset.title = 'Digital Wedding Album';
        card.innerHTML = `
            <div class="n-card-img-container">
                <img src="${thumb}" onerror="this.src='${DEFAULT_THUMB}'">
            </div>
            <div class="album-card-overlay">
                <div class="album-label-content">
                    <span class="album-tag">DIGITAL EDITION</span>
                    <h4 class="album-title">Your Wedding Album</h4>
                    <div class="photo-count-pill">
                        <i class="fas fa-book-open"></i> ${clientData.album_pages.length} PAGES
                    </div>
                </div>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (isSelectionMode) {
                e.stopPropagation();
                card.classList.toggle('selected-for-guest');
                updateSelectionCount();
                return;
            }
            openFlipbook(clientData.album_pages);
        });
        albumCont.appendChild(card);
        albumRail.style.display = 'block';
    }

    // Galleries
    const galleryContainer = document.getElementById('content-gallery');
    const galleryRail = document.getElementById('rail-gallery');
    if (galleryContainer && galleryRail && window.clientGalleries && Object.keys(window.clientGalleries).length) {
        Object.entries(window.clientGalleries).forEach(([event, photos]) => {
            if (photos.length) {
                let thumb = clientData.gallery_covers?.[event] || photos[0];
                if (typeof thumb === 'object') thumb = thumb.url || photos[0];
                thumb = sanitizeUrl(thumb);

                const card = document.createElement('div');
                card.className = 'n-card album-stack-card';
                card.dataset.type = 'gallery_event';
                card.dataset.url = event;
                card.dataset.title = event;
                card.innerHTML = `
                    <div class="n-card-img-container">
                        <img src="${thumb}" onerror="this.src='${DEFAULT_THUMB}'">
                    </div>
                    <div class="album-card-overlay">
                        <div class="album-label-content">
                            <span class="album-tag">COLLECTION</span>
                            <h4 class="album-title">${escapeHtml(event)}</h4>
                            <div class="photo-count-pill">
                                <i class="fas fa-images"></i> ${photos.length} PHOTOS
                            </div>
                        </div>
                    </div>
                `;
                card.addEventListener('click', (e) => {
                    if (isSelectionMode) {
                        e.stopPropagation();
                        card.classList.toggle('selected-for-guest');
                        updateSelectionCount();
                        return;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    openGallery(event);
                });
                galleryContainer.appendChild(card);
            }
        });
        if (galleryContainer.children.length) galleryRail.style.display = 'block';
    }

    // Vault
    const vaultContainer = document.getElementById('content-vault');
    const vaultRail = document.getElementById('rail-vault');
    if (vaultContainer && vaultRail) {
        let vaultLinks = [...(clientData.vault || [])];
        if (clientData.download_link) vaultLinks.unshift({ title: 'Download Original Photos', url: clientData.download_link, type: 'download' });
        if (clientData.upload_link) vaultLinks.push({ title: 'Upload Your Clicks', url: clientData.upload_link, type: 'upload' });

        if (vaultLinks.length) {
            let vaultHtml = ``;
            vaultLinks.forEach(link => {
                const titleLower = (link.title || '').toLowerCase();
                const urlLower = (link.url || '').toLowerCase();
                const isUpload = link.type === 'upload' || titleLower.includes('upload');
                const isDrive = urlLower.includes('drive.google');
                const isDropbox = urlLower.includes('dropbox');
                let iconClass = 'fas fa-download';
                if (isUpload) iconClass = 'fas fa-cloud-upload-alt';
                else if (isDrive) iconClass = 'fab fa-google-drive';
                else if (isDropbox) iconClass = 'fab fa-dropbox';
                else if (titleLower.includes('video') || titleLower.includes('film')) iconClass = 'fas fa-film';
                const btnText = isUpload ? 'UPLOAD SECURELY' : 'ACCESS DATA';
                const badgeText = isUpload ? 'CLIENT UPLOAD' : 'SECURE VAULT';
                const descText = isUpload
                    ? 'Securely share guest photos and videos with our editing team.'
                    : 'Access and download your high-resolution uncompressed master files.';
                vaultHtml += `
                    <a href="${escapeHtml(link.url)}" target="_blank" class="vault-card">
                        <div class="vault-badge"><i class="fas fa-lock" style="font-size:9px;"></i> ${badgeText}</div>
                        <div style="margin-top:20px;">
                            <div class="vault-icon"><i class="${iconClass}"></i></div>
                            <h4 class="vault-title">${escapeHtml(link.title)}</h4>
                            <p class="vault-desc">${descText}</p>
                        </div>
                        <div class="vault-action">${btnText}</div>
                    </a>
                `;
            });
            vaultContainer.innerHTML = vaultHtml;
            vaultRail.style.display = 'block';
        }
    }

    // 5. Transitions
    document.body.classList.add('client-mode');   // 🏦 Force Client Mode for AI Camera
    if (modal) modal.style.display = 'block';

    // ✅ 100% GUARANTEE – फ़्लोटिंग कैमरा दिखाने के लिए
    const cam = document.getElementById('floatingCameraBtn');
    if (cam) {
        cam.style.opacity = '1';
        cam.style.pointerEvents = 'all';
    }
    // 🔥 Remove previous external page (like WhatsApp) from history once client session starts
    history.replaceState(null, null, window.location.href);
    if (railsContainer) railsContainer.style.display = 'block';
    if (heroBg) heroBg.style.display = 'block';

    const gate = document.getElementById('login-vault-gate');
    const selectionLounge = document.getElementById('client-lounge-section');
    if (gate) gate.style.display = 'none';
    if (selectionLounge) selectionLounge.style.display = 'none';

    setTimeout(() => { if (typeof enableOTTSync === 'function') enableOTTSync(); }, 150);

    const clientNameEl = document.getElementById('lounge-client-name');
    window.clientCode = clientCode;
    window.clientName = clientData.name;
    window.clientShareCard = clientData.share_card_image || clientData.share_card || null;
    if (clientNameEl) clientNameEl.innerText = clientData.name + "'s Special Day";

    window.currentClientData = clientData;
    document.body.classList.add('client-mode'); // 🏦 Client Mode Active

    // 📸 AI Camera visibility is now handled by CSS (.client-mode on body)

    // 📊 Track Master Lounge View
    trackEvent('view');

    // 🎬 Auto-scroll to Digital Invitation section after lounge loads
    setTimeout(() => {
        const inviteRail = document.getElementById('rail-invitation') || document.querySelector('.n-rail');
        if (inviteRail) {
            inviteRail.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 1200);

    // Disable native context menu (long press) on all client lounge cards to prevent code leakage
    function disableNativeContextMenu() {
        const container = document.getElementById('client-lounge-section');
        if (!container) return;

        // For all current and future cards, prevent context menu
        const preventContext = (e) => {
            const card = e.target.closest('.n-card, .album-stack-card, .film-card, .reel-frame, img');
            if (card) {
                e.preventDefault();
                return false;
            }
        };
        container.addEventListener('contextmenu', preventContext);
        // Also directly on images inside the container
        container.querySelectorAll('img').forEach(img => {
            img.addEventListener('contextmenu', preventContext);
        });
        // Use mutation observer to catch dynamically added images
        const observer = new MutationObserver(() => {
            container.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('data-context-disabled')) {
                    img.setAttribute('data-context-disabled', 'true');
                    img.addEventListener('contextmenu', preventContext);
                }
            });
        });
        observer.observe(container, { childList: true, subtree: true });
    }
    disableNativeContextMenu();
}

// 🖱️ PC Mouse Scroll & Drag for OTT Rails

// 👑 VIP CLIENT LOUNGE: Token-based fetch engine
async function fetchClientLoungeWithToken(clientCode, token) {
    try {
        const clientRes = await fetch(`${API_URL}/api/clients/${clientCode}?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        if (!clientRes.ok) throw new Error('Invalid VIP Code or Token expired');
        const clientData = await clientRes.json();
        processClientLoungeData(clientData, clientCode);
    } catch (error) {
        alert("⚠️ Session expired or invalid code. Please login again.");
        console.error(error);
    }
}


// 🚪 EXIT VAULT: Logout and return to login gate
function exitVault() {
    const isGuest = window.isGuestMode || document.body.classList.contains('guest-mode');
    document.body.classList.remove('client-mode');

    // ✅ कैमरा छुपाएँ
    const cam = document.getElementById('floatingCameraBtn');
    if (cam) {
        cam.style.opacity = '';
        cam.style.pointerEvents = '';
    }

    window.clientCode = null;
    localStorage.removeItem('clientToken');
    document.body.classList.remove('guest-mode');

    const gate = document.getElementById('login-vault-gate');
    const lounge = document.getElementById('client-lounge-section');
    const netflixModal = document.getElementById('vipNetflixModal');

    // Reset hero background (modernized)
    const heroImgLayer = document.getElementById('hero-image-layer');
    if (heroImgLayer) {
        heroImgLayer.style.backgroundImage = 'none';
        heroImgLayer.innerHTML = '';
    }

    // Hide lounge & modal
    if (lounge) lounge.style.display = 'none';
    if (netflixModal) netflixModal.style.display = 'none';

    if (isGuest) {
        // If it was guest mode, return to main public homepage
        window.location.href = window.location.origin + window.location.pathname;
    } else if (gate) {
        gate.style.display = 'block';
        gate.classList.remove('fade-out');
    }

    // Clear input
    const codeInput = document.getElementById('vip-code-input');
    if (codeInput) codeInput.value = '';

    window.scrollTo({ top: document.getElementById('client-portal').offsetTop - 50, behavior: 'smooth' });
}

// --- SCROLL LOGIC FOR HAMBURGER ---
// Throttled scroll handler for smooth 60fps
window.addEventListener('scroll', throttle(function () {
    const navbar = document.getElementById('navbar');
    const heroContainer = document.getElementById('hero-container');
    const hamburger = document.querySelector('.hamburger');

    if (navbar) {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }

    if (heroContainer && hamburger) {
        const heroHeight = heroContainer.offsetHeight;
        if (window.scrollY > (heroHeight - 100)) {
            hamburger.classList.add('hidden');
        } else {
            hamburger.classList.remove('hidden');
        }
    }
}, 16)); // ~60fps

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


function closeVipNetflixModal() {
    const modal = document.getElementById('vipNetflixModal');
    const heroBg = document.getElementById('netflix-hero-bg');
    const loungeSection = document.getElementById('client-lounge-section');

    // Fade out
    if (modal) {
        modal.style.animation = 'fadeOut 0.4s ease forwards';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.animation = 'fadeIn 0.4s ease-out'; // reset
            if (heroBg) heroBg.innerHTML = ''; // Kill audio/vid
            // Restore Selection Lounge UI
            if (loungeSection) loungeSection.style.display = 'block';
        }, 380);
    }
}

// Handle single content click
function handleSingleContent(url, type, eventName) {
    if (type === 'video') {
        playLuxuryVideo(sanitizeUrl(url));
    } else if (type === 'gallery') {
        openGallery(eventName);
    }
}

function downloadContent(url) {
    window.open(url, '_blank');
}

function shareContent(url, title) {
    const text = `Check out this premium content from Vinayak Studio: ${title}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}


// --- GALLERY & LIGHTBOX LOGIC ---
let photos = [], idx = 0, isSelMode = false, clientCode = "", clientName = "";
window.selectedPhotos = [];
let originalPhotos = null;      // 👈 moved here
let folderScrollListener = null; // 👈 moved here
let touchS = 0, touchE = 0;

let currentFolderName = '';
let currentPhotoList = [];
let currentPhotoNames = [];
let loadedCount = 0;
const BATCH_SIZE = 30;  // pehle 30 photos load

function openGallery(folderName) {
    if (checkGuestTrigger(() => openGallery(folderName))) return;

    // 📊 Track gallery exploration event
    trackEvent('explore');

    // Clear previous selections and folder context
    window.selectedPhotos = [];
    updateFloat(); // hide main send button
    window.currentFolderName = folderName;

    // Always save current portfolio photos before overriding with folder photos
    originalPhotos = [...photos];

    currentFolderName = folderName;
    const galleries = window.clientGalleries || {};

    // Convert objects to URLs
    const rawPhotos = galleries[folderName] || [];
    currentPhotoList = rawPhotos.map(photo => {
        return typeof photo === 'object' ? (photo.url || photo.image_url || '') : photo;
    });
    // Build parallel array of filenames
    currentPhotoNames = rawPhotos.map(photo => {
        if (typeof photo === 'object') {
            return photo.filename || (photo.image_url ? photo.image_url.split('/').pop() : '');
        } else {
            return photo.split('/').pop(); // fallback for string URLs
        }
    });

    // Set global photos array for lightbox
    photos = currentPhotoList;
    isSelMode = true; // enable heart button

    if (currentPhotoList.length === 0) {
        alert("No photos in this folder.");
        return;
    }

    // Create modal if not exists
    let modal = document.getElementById('folderGalleryModal');
    if (!modal) {
        const modalHTML = `
            <div id="folderGalleryModal" class="lightbox" onclick="closeFolderGallery()">
                <div class="lightbox-content" onclick="event.stopPropagation()" style="width: 95%; max-width: 1200px; border: 1px solid rgba(197,160,89,0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: rgba(5,5,5,0.95); z-index: 100; padding: 15px 25px; border-bottom: 1px solid rgba(197,160,89,0.2); backdrop-filter: blur(10px);">
                        <h3 id="folderTitle" style="color: #c5a059; margin: 0; font-family: var(--font-serif); font-size: 1.5rem;">Event Gallery</h3>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <button id="folderSendBtn" onclick="openSelectionSubmitModal()" style="background: linear-gradient(135deg, #c5a059, #e0c283); color: black; border: none; padding: 10px 24px; border-radius: 30px; font-weight: 800; cursor: pointer; display: none; box-shadow: 0 4px 15px rgba(197, 160, 89, 0.3); transition: all 0.3s ease; text-transform: uppercase; font-size: 0.8rem;">
                                <i class="fas fa-paper-plane"></i> Submit Selection (<span id="folderSelCount">0</span>)
                            </button>
                            <span class="close-lb" onclick="closeFolderGallery()" style="position: static; font-size: 28px; cursor: pointer; color: #fff;">✕</span>
                        </div>
                    </div>
                    <div id="folderGrid" class="masonry-grid" style="max-height: 75vh; overflow-y: auto; padding: 20px; padding-bottom: 120px;"></div>
                    <div id="loadingIndicator" style="text-align:center; padding:20px; color: #c5a059; font-style: italic;">Weaving memories...</div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('folderGalleryModal');
    }

    // Reset modal
    const grid = document.getElementById('folderGrid');
    grid.innerHTML = '';
    loadedCount = 0;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';   // 👈 ADD THIS LINE
    loadMorePhotos();

    // Remove previous scroll listener before adding new one
    if (folderScrollListener) {
        grid.removeEventListener('scroll', folderScrollListener);
    }
    folderScrollListener = function onScroll() {
        if (grid.scrollTop + grid.clientHeight >= grid.scrollHeight - 200) {
            loadMorePhotos();
        }
    };
    grid.addEventListener('scroll', folderScrollListener);
}

function loadMorePhotos() {
    const nextBatch = currentPhotoList.slice(loadedCount, loadedCount + BATCH_SIZE);
    if (nextBatch.length === 0) {
        document.getElementById('loadingIndicator').style.display = 'none';
        return;
    }
    const grid = document.getElementById('folderGrid');
    nextBatch.forEach((photo, batchIdx) => {
        const globalIdx = loadedCount + batchIdx;
        const fullUrl = photo;
        const imgDiv = document.createElement('div');
        imgDiv.className = 'm-item n-card';
        imgDiv.id = `g-${globalIdx}`;
        imgDiv.onclick = (e) => {
            e.stopPropagation();
            openLightboxForFolderPhoto(globalIdx);
        };

        // Add heart button overlay
        const heartBtn = document.createElement('div');
        heartBtn.className = 'selection-heart-btn';
        heartBtn.innerHTML = '<i class="fas fa-heart"></i>';
        heartBtn.onclick = (e) => {
            e.stopPropagation();
            toggleHeartFromGrid(globalIdx, heartBtn, imgDiv);
        };

        imgDiv.innerHTML = `<img src="${fullUrl}" loading="lazy" class="skeleton" onload="this.classList.remove('skeleton')">`;
        imgDiv.appendChild(heartBtn);
        // If this photo is already selected (from previous batches), highlight it
        // Check selection using the stored filename
        const thisFileName = currentPhotoNames[globalIdx];
        if (thisFileName && window.selectedPhotos.includes(thisFileName)) {
            imgDiv.classList.add('selected-active');
            heartBtn.classList.add('selected');
        }
        grid.appendChild(imgDiv);
    });
    loadedCount += nextBatch.length;
    document.getElementById('loadingIndicator').style.display =
        loadedCount < currentPhotoList.length ? 'block' : 'none';
    updateFolderSendButton();
}

function updateFolderSendButton() {
    const btn = document.getElementById('folderSendBtn');
    const countEl = document.getElementById('folderSelCount');
    if (btn) {
        if (window.selectedPhotos.length > 0) {
            btn.style.display = 'block';
            if (countEl) countEl.innerText = window.selectedPhotos.length;
        } else {
            btn.style.display = 'none';
        }
    }
}

function openLightboxForFolderPhoto(index) {
    // Use the unified lightbox opener for consistent behavior
    openImgLB(index);
}

function closeFolderGallery() {
    // exitFullscreen(); // ❌ REMOVED
    const modal = document.getElementById('folderGalleryModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';   // 👈 ADD THIS LINE
    // Remove scroll listener
    if (folderScrollListener) {
        const grid = document.getElementById('folderGrid');
        if (grid) grid.removeEventListener('scroll', folderScrollListener);
        folderScrollListener = null;
    }
    // Only restore original gallery photos if the lightbox is closed
    const imgLightbox = document.getElementById('imgLB');
    if (originalPhotos && (!imgLightbox || imgLightbox.style.display !== 'flex')) {
        photos = originalPhotos;
        originalPhotos = null;
        isSelMode = false;
    }
    // Clear selection array to avoid polluting next folder
    window.selectedPhotos = [];
    updateFloat(); // hide main send button
    window.currentFolderName = null;
    currentPhotoNames = [];
}

// Share a folder via WhatsApp (IMPROVED MESSAGE)
function shareFolder(event, folderName) {
    event.stopPropagation();
    // Share via guest link (don't leak client code directly)
    const shareUrl = `${window.location.origin}?folder=${encodeURIComponent(folderName)}`;
    const message = `✨ You are invited! ✨\n\nCheck out the beautiful ${folderName} memories of ${clientName || "our event"}.\n\nClick here to view the VIP Gallery: \n🔗 ${shareUrl}\n\n📸 Moments elegantly captured by Vinayak Studio.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
}

// ===================================================


// ===================================================
// 🎬 THE PRIVATE MOVIE PREMIERE (VIDEO ENGINE)
// ===================================================

let videoIdleTimer;
let originalBgMusicVolume = 0;

// Helper: Smoothly fade audio volume
function fadeAudio(audioElement, targetVolume, duration) {
    if (!audioElement) return;
    const stepTime = 50; // ms
    const steps = duration / stepTime;
    const volumeStep = (targetVolume - audioElement.volume) / steps;

    const fadeInterval = setInterval(() => {
        let newVolume = audioElement.volume + volumeStep;
        if ((volumeStep > 0 && newVolume >= targetVolume) || (volumeStep < 0 && newVolume <= targetVolume)) {
            audioElement.volume = targetVolume;
            if (targetVolume === 0) audioElement.pause();
            clearInterval(fadeInterval);
        } else {
            audioElement.volume = newVolume;
        }
    }, stepTime);
}

// Phase 1 & 3: Play Video with Audio Cross-fade + HLS Support
async function playLuxuryVideo(url, type = null) {
    if (checkGuestTrigger(() => playLuxuryVideo(url, type))) return;

    // Lazy load HLS.js only when needed
    if (url && url.includes('.m3u8') && typeof Hls === 'undefined') {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    const modal = document.getElementById('videoModal');
    const playerIframe = document.getElementById('universalPlayerIframe');
    const bgMusic = document.getElementById('albumMusic');

    if (!modal) return;

    // 📊 Track video play event
    trackEvent('play');

    // Phase 1: Cross-fade background music out (1 second)
    if (bgMusic && !bgMusic.paused) {
        originalBgMusicVolume = bgMusic.volume;
        fadeAudio(bgMusic, 0, 1000);
    }

    const wrapper = document.getElementById('videoWrapper');
    const isHLS = url && url.includes('.m3u8');

    if (isHLS && typeof Hls !== 'undefined') {
        // ===== 🎬 HLS STREAMING MODE (Cloudflare R2 CDN) =====
        // Hide iframe, create native <video> element
        if (playerIframe) playerIframe.style.display = 'none';

        // Remove old HLS video if exists
        let hlsVideo = document.getElementById('hlsVideoPlayer');
        if (hlsVideo) hlsVideo.remove();

        // Destroy old HLS instance
        if (window._activeHls) {
            window._activeHls.destroy();
            window._activeHls = null;
        }

        // Create premium video element
        hlsVideo = document.createElement('video');
        hlsVideo.id = 'hlsVideoPlayer';
        hlsVideo.controls = true;
        hlsVideo.autoplay = true;
        hlsVideo.playsInline = true;
        hlsVideo.controlsList = 'nodownload';
        hlsVideo.disablePictureInPicture = true;
        hlsVideo.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;border-radius:12px;position:relative;z-index:3;';

        wrapper.appendChild(hlsVideo);

        // Initialize HLS.js
        if (Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                startLevel: -1,  // Auto quality selection
            });
            hls.loadSource(url);
            hls.attachMedia(hlsVideo);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                hlsVideo.play().catch(() => { });
            });
            hlsVideo.onended = () => {
                if (window.isGuestMode) {
                    triggerThankYouOverlay();
                }
            };
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.warn('HLS fatal error, falling back to iframe');
                    hlsVideo.remove();
                    if (playerIframe) {
                        playerIframe.style.display = '';
                        playerIframe.src = url;
                    }
                }
            });
            window._activeHls = hls;
        } else if (hlsVideo.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS support
            hlsVideo.src = url;
            hlsVideo.play().catch(() => { });
            hlsVideo.onended = () => {
                if (window.isGuestMode) {
                    triggerThankYouOverlay();
                }
            };
        }

    } else {
        // ===== 📺 IFRAME MODE (YouTube / Drive / Legacy) =====
        // Remove HLS video if exists
        const hlsVideo = document.getElementById('hlsVideoPlayer');
        if (hlsVideo) hlsVideo.remove();
        if (window._activeHls) {
            window._activeHls.destroy();
            window._activeHls = null;
        }

        if (playerIframe) {
            playerIframe.style.display = '';

            let finalUrl = "";
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                let videoId = extractVideoId(url);
                finalUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0&vq=hd1080`;
            } else {
                finalUrl = url;
            }
            playerIframe.src = finalUrl;
        }
    }

    // 🛡️ Inject Transparent Shield (right-click block only — NOT pointer-events blocking for HLS controls)
    if (wrapper && !document.getElementById('videoShieldOverlay')) {
        const shield = document.createElement('div');
        shield.id = 'videoShieldOverlay';
        shield.className = 'video-shield-overlay';
        // CRITICAL: pointer-events:none so HLS video controls are clickable
        shield.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;';
        shield.addEventListener('contextmenu', e => e.preventDefault());
        wrapper.appendChild(shield);
    }
    // Move swipe detection to the modal backdrop (not the shield)
    const videoModalEl = document.getElementById('videoModal');
    if (videoModalEl && !videoModalEl.dataset.swipeInited) {
        videoModalEl.dataset.swipeInited = 'true';
        videoModalEl.addEventListener('touchstart', resetVideoIdleTimer, { passive: true });
    }

    // Show modal and trigger 0.8s CSS fade-in
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // HIDE AI CAMERA BUTTON DURING VIDEO
    const aiBtn = document.getElementById('floatingCameraBtn');
    if (aiBtn) aiBtn.style.display = 'none';

    // 🎬 FULLSCREEN for immersive video experience
    enterFullscreen(modal);

    setTimeout(() => {
        modal.classList.add('is-active');
        resetVideoIdleTimer();
    }, 10);
}

// Cinematic VIP Thank You Overlay Generator
function triggerThankYouOverlay() {
    const thankYouEl = document.getElementById('rsvpThankYouOverlay');
    if (thankYouEl) {
        thankYouEl.style.display = 'flex';
        // Force reflow for CSS transition
        void thankYouEl.offsetWidth;
        thankYouEl.style.opacity = '1';

        // Pause underlying video gracefully
        const hlsVideo = document.getElementById('hlsVideoPlayer');
        if (hlsVideo) hlsVideo.pause();
        const iframe = document.getElementById('universalPlayerIframe');
        if (iframe && iframe.src) {
            let src = iframe.src;
            iframe.src = '';
            iframe.src = src; // Reloading stops playback
        }
    }
}

// Phase 4: Fluid Dismiss and Audio Restoration
function closeVideoModal(force = false) {
    if (!force && window.isGuestMode && window._guestRSVPCompleted) {
        const ty = document.getElementById('rsvpThankYouOverlay');
        // If haven't shown thank you yet, intercept and show it
        if (ty && ty.style.display !== 'flex') {
            triggerThankYouOverlay();
            return; // Wait for the user to explicitly close it from the Thank You screen
        }
    }

    // 🎬 EXIT FULLSCREEN before closing modal
    exitFullscreen();

    const modal = document.getElementById('videoModal');
    if (!modal) return;
    modal.style.display = 'none';

    // Reset Thank You / Welcome Overlays
    const ty = document.getElementById('rsvpThankYouOverlay');
    if (ty) { ty.style.display = 'none'; ty.style.opacity = '0'; }
    const we = document.getElementById('rsvpWelcomeOverlay');
    if (we) { we.style.display = 'none'; we.style.opacity = '0'; }

    // Stop iframe video
    const iframe = document.getElementById('universalPlayerIframe');
    if (iframe) {
        iframe.src = '';
        iframe.style.display = '';  // Restore visibility
    }

    // 🎬 Cleanup HLS player if active
    if (window._activeHls) {
        window._activeHls.destroy();
        window._activeHls = null;
    }
    const hlsVideo = document.getElementById('hlsVideoPlayer');
    if (hlsVideo) {
        hlsVideo.pause();
        hlsVideo.removeAttribute('src');
        hlsVideo.load();
        hlsVideo.remove();
    }

    // Remove shield overlay
    const shield = document.getElementById('videoShieldOverlay');
    if (shield) shield.remove();

    // Restore body scroll
    document.body.style.overflow = '';
    modal.classList.remove('is-active');

    // RESTORE AI CAMERA BUTTON
    const aiBtn = document.getElementById('floatingCameraBtn');
    if (aiBtn) aiBtn.style.display = 'flex';
}

// Phase 2: "Clean Room" Idle Timer
function resetVideoIdleTimer() {
    const modal = document.getElementById('videoModal');
    if (!modal || modal.style.display !== 'flex') return;

    modal.classList.remove('ui-hidden');
    clearTimeout(videoIdleTimer);

    // Fade out UI after 2.5s of no movement
    videoIdleTimer = setTimeout(() => {
        modal.classList.add('ui-hidden');
    }, 2500);
}

// Attach idle listeners
document.getElementById('videoModal')?.addEventListener('mousemove', resetVideoIdleTimer);
document.getElementById('videoModal')?.addEventListener('touchstart', resetVideoIdleTimer, { passive: true });

// Phase 4: Mobile Swipe-to-Dismiss Physics
let vTouchStartY = 0;
let vTouchCurrentY = 0;
let isVideoSwiping = false;

// 🔄 Mobile Swipe-to-Dismiss — attached to the dark BACKDROP (not the shield)
// This allows HLS video controls to work unobstructed
setTimeout(() => {
    const vModal = document.getElementById('videoModal');
    const vWrapper = document.getElementById('videoWrapper');

    if (vModal && vWrapper) {
        vModal.addEventListener('touchstart', (e) => {
            // Only swipe from outside the video box (the dark area)
            if (e.target.closest('#luxury-video-box')) return;
            vTouchStartY = e.touches[0].clientY;
            isVideoSwiping = true;
            vWrapper.style.transition = 'none';
            resetVideoIdleTimer();
        }, { passive: true });

        vModal.addEventListener('touchmove', (e) => {
            if (!isVideoSwiping) return;
            vTouchCurrentY = e.touches[0].clientY - vTouchStartY;

            if (vTouchCurrentY > 0) {
                let pullScale = Math.max(0.6, 1 - (vTouchCurrentY / window.innerHeight));
                vWrapper.style.transform = `translateY(${vTouchCurrentY}px) scale(${pullScale})`;
                let bgOpacity = Math.max(0, 1 - (vTouchCurrentY / window.innerHeight));
                vModal.style.backgroundColor = `rgba(0, 0, 0, ${bgOpacity})`;
                vModal.classList.add('ui-hidden');
            }
        }, { passive: true });

        vModal.addEventListener('touchend', () => {
            if (!isVideoSwiping) return;
            isVideoSwiping = false;
            vWrapper.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            vModal.style.transition = 'background-color 0.6s ease';

            if (vTouchCurrentY > 150) {
                closeVideoModal();
            } else {
                vWrapper.style.transform = 'translate(0px, 0px) scale(1)';
                vModal.style.backgroundColor = '#000000';
                resetVideoIdleTimer();
            }
            vTouchCurrentY = 0;
        });
    }
}, 500);

// --- CONTACT FORM ---
function submitToWA() {
    const n = document.getElementById('waName').value;
    const m = document.getElementById('waMobile').value;
    const d = document.getElementById('waDate').value;
    if (!n || !m) { alert("Name & Mobile are required."); return; }
    window.open(`https://wa.me/916350095221?text=*New Enquiry*%0A*Name:* ${n}%0A*Mobile:* ${m}%0A*Date:* ${d}`, '_blank');
}

// --- VIDEO LIGHTBOX (Updated to handle more than just YouTube IDs) ---
function openLB(idOrUrl) {
    if (!idOrUrl) return;
    // If it's a full URL, use playLuxuryVideo's logic
    if (idOrUrl.includes('://') || idOrUrl.includes('.')) {
        playLuxuryVideo(idOrUrl);
        return;
    }
    document.getElementById('lbFrame').src = `https://www.youtube.com/embed/${idOrUrl}?autoplay=1`;
    document.getElementById('vidLB').style.display = 'flex';
}

function closeLB() {
    document.getElementById('lbFrame').src = "";
    document.getElementById('vidLB').style.display = 'none';
}

// --- IMAGE LIGHTBOX ---
// ===================================================
// 🎬 THE PRIVATE VIEWING ROOM (LIGHTBOX ENGINE)
// ===================================================

let lightboxIdleTimer;

function openImgLB(index) {
    if (checkGuestTrigger(() => openImgLB(index))) return;

    idx = index;
    const lb = document.getElementById('imgLB');
    if (!lb) return;

    // Use updateImgView to set source and show/hide heart actions
    updateImgView();

    lb.style.display = 'flex';
    setTimeout(() => {
        lb.classList.add('is-active');
        resetLightboxIdleTimer();
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeImgLB() {
    const lb = document.getElementById('imgLB');
    if (!lb) return;
    lb.classList.remove('is-active');
    setTimeout(() => {
        lb.style.display = 'none';
        document.body.style.overflow = '';
        clearTimeout(lightboxIdleTimer);
        const wrapper = document.getElementById('lbImgWrapper');
        if (wrapper) wrapper.style.transform = '';
    }, 600);
}

function changePhoto(direction) {
    idx += direction;
    if (idx >= photos.length) idx = 0;
    if (idx < 0) idx = photos.length - 1;

    const img = document.getElementById('lbImg');
    img.style.opacity = '0.5';
    setTimeout(() => {
        updateImgView();
        img.style.opacity = '1';
    }, 150);
    resetLightboxIdleTimer();
}

function resetLightboxIdleTimer() {
    const lb = document.getElementById('imgLB');
    if (!lb) return;
    lb.classList.remove('ui-hidden');
    clearTimeout(lightboxIdleTimer);
    lightboxIdleTimer = setTimeout(() => {
        lb.classList.add('ui-hidden');
    }, 2500);
}

document.getElementById('imgLB')?.addEventListener('mousemove', resetLightboxIdleTimer);
document.getElementById('imgLB')?.addEventListener('touchstart', resetLightboxIdleTimer);

let touchStartY = 0, touchStartX = 0, currentY = 0, currentX = 0, isSwiping = false;
const lbWrapper = document.getElementById('lbImgWrapper');

if (lbWrapper) {
    lbWrapper.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isSwiping = true;
        lbWrapper.style.transition = 'none';
        resetLightboxIdleTimer();
    }, { passive: true });

    lbWrapper.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        const touchY = e.touches[0].clientY;
        const touchX = e.touches[0].clientX;
        currentY = touchY - touchStartY;
        currentX = touchX - touchStartX;

        if (Math.abs(currentY) > Math.abs(currentX) && currentY > 0) {
            let pullScale = Math.max(0.6, 1 - (currentY / window.innerHeight));
            lbWrapper.style.transform = `translateY(${currentY}px) scale(${pullScale})`;
            let bgOpacity = Math.max(0, 0.95 - (currentY / window.innerHeight));
            document.getElementById('imgLB').style.backgroundColor = `rgba(5, 5, 5, ${bgOpacity})`;
            document.getElementById('imgLB').classList.add('ui-hidden');
        } else if (Math.abs(currentX) > Math.abs(currentY)) {
            lbWrapper.style.transform = `translateX(${currentX}px)`;
        }
    }, { passive: true });

    lbWrapper.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        lbWrapper.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        document.getElementById('imgLB').style.transition = 'background-color 0.5s ease';

        if (currentY > 120) {
            closeImgLB();
        } else if (currentX > 80) {
            changePhoto(-1);
            resetPosition();
        } else if (currentX < -80) {
            changePhoto(1);
            resetPosition();
        } else {
            resetPosition();
        }
    });

    function resetPosition() {
        lbWrapper.style.transform = 'translate(0px, 0px) scale(1)';
        document.getElementById('imgLB').style.backgroundColor = 'rgba(5, 5, 5, 0.95)';
        currentY = 0;
        currentX = 0;
        resetLightboxIdleTimer();
    }
}

function updateImgView() {
    const photo = photos[idx];
    let imgUrl, name;

    if (isSelMode && photo && typeof photo === 'object') {
        imgUrl = photo.url;
        name = photo.filename;
    } else {
        if (photo && photo.startsWith('http')) {
            imgUrl = photo;
            // Use the stored filename if we're in folder gallery mode
            if (isSelMode && currentPhotoNames && currentPhotoNames[idx]) {
                name = currentPhotoNames[idx];
            } else {
                name = photo;
            }
        } else {
            const path = isSelMode ? `${API_URL}/api/image/selection/${clientCode}/` : `assets/gallery/`;
            imgUrl = path + photo;
            name = photo;
        }
    }

    document.getElementById('lbImg').src = imgUrl;
    const area = document.getElementById('lbActions');
    if (!area) return;  // Element may not exist in all contexts
    if (isSelMode) {
        area.style.display = 'flex';
        const btn = document.getElementById('lbHeart');
        if (window.selectedPhotos.includes(name)) {
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
    const photo = photos[idx];
    let name;

    if (isSelMode && currentPhotoNames && currentPhotoNames[idx]) {
        name = currentPhotoNames[idx];
    } else if (isSelMode && typeof photo === 'object') {
        name = photo.filename;
    } else {
        name = photo;
    }

    const i = window.selectedPhotos.indexOf(name);
    const gridEl = document.getElementById(`g-${idx}`);
    if (i > -1) {
        window.selectedPhotos.splice(i, 1);
        if (gridEl) {
            gridEl.classList.remove('selected-active');
            const heart = gridEl.querySelector('.selection-heart-btn');
            if (heart) heart.classList.remove('selected');
        }
    } else {
        window.selectedPhotos.push(name);
        if (gridEl) {
            gridEl.classList.add('selected-active');
            const heart = gridEl.querySelector('.selection-heart-btn');
            if (heart) heart.classList.add('selected');
        }
    }
    updateImgView();
    updateFloat();
    updateFolderSendButton();
}

function toggleHeartFromGrid(globalIdx, heartBtn, imgDiv) {
    let name;
    if (currentPhotoNames && currentPhotoNames[globalIdx]) {
        name = currentPhotoNames[globalIdx];
    } else {
        name = currentPhotoList[globalIdx];
    }

    const i = window.selectedPhotos.indexOf(name);
    if (i > -1) {
        window.selectedPhotos.splice(i, 1);
        imgDiv.classList.remove('selected-active');
        heartBtn.classList.remove('selected');
    } else {
        window.selectedPhotos.push(name);
        imgDiv.classList.add('selected-active');
        heartBtn.classList.add('selected');
    }
    // Update lightbox if open
    if (idx === globalIdx) updateImgView();
    updateFloat();
    updateFolderSendButton();
}

function updateFloat() {
    const selectionStatusBar = document.getElementById('selectionStatusBar');
    if (selectionStatusBar) {
        if (window.selectedPhotos.length > 0) {
            selectionStatusBar.style.display = 'flex';
            document.getElementById('selectionCountText').innerText = `${window.selectedPhotos.length} Photos Selected`;
        } else {
            selectionStatusBar.style.display = 'none';
        }
    }

    const btn = document.getElementById('sendFloat');
    if (btn) {
        if (window.currentFolderName) {
            btn.style.display = 'none';
        } else {
            document.getElementById('selCount').innerText = window.selectedPhotos.length;
            btn.style.display = window.selectedPhotos.length > 0 ? 'block' : 'none';
        }
    }
}

function openSelectionSubmitModal() {
    if (window.selectedPhotos.length === 0) {
        alert("Please select some photos first!");
        return;
    }

    // Populate preview grid
    const grid = document.getElementById('selectionPreviewGrid');
    grid.innerHTML = '';

    // We max show 15 thumbnails inside modal to avoid lag
    const displayCount = Math.min(window.selectedPhotos.length, 15);
    for (let j = 0; j < displayCount; j++) {
        const name = window.selectedPhotos[j];
        // find url from currentPhotoNames or fallback
        let url = name;
        if (currentPhotoNames) {
            const ind = currentPhotoNames.indexOf(name);
            if (ind > -1) url = currentPhotoList[ind];
        }

        const img = document.createElement('img');
        img.src = url;
        grid.appendChild(img);
    }

    if (window.selectedPhotos.length > 15) {
        const moreDiv = document.createElement('div');
        moreDiv.style.display = 'flex';
        moreDiv.style.alignItems = 'center';
        moreDiv.style.justifyContent = 'center';
        moreDiv.style.width = '60px';
        moreDiv.style.height = '60px';
        moreDiv.style.borderRadius = '8px';
        moreDiv.style.background = 'rgba(255,255,255,0.1)';
        moreDiv.style.border = '1px solid rgba(197, 160, 89, 0.5)';
        moreDiv.style.color = '#c5a059';
        moreDiv.style.fontWeight = 'bold';
        moreDiv.style.fontSize = '0.9rem';
        moreDiv.innerText = '+' + (window.selectedPhotos.length - 15);
        grid.appendChild(moreDiv);
    }

    document.getElementById('finalSelectionCount').innerText = window.selectedPhotos.length;
    document.getElementById('selectionSubmitModal').style.display = 'flex';
}

function closeSelectionSubmitModal() {
    document.getElementById('selectionSubmitModal').style.display = 'none';
}

async function confirmSubmitSelection() {
    const nameInput = document.getElementById('selectionGuestName').value.trim() || 'Client';
    const phoneInput = document.getElementById('selectionGuestPhone').value.trim();
    const btn = document.getElementById('confirmSubmitSelectionBtn');
    const photoCount = window.selectedPhotos.length;

    if (photoCount === 0) { showVSToast('⚠️ Please select at least one photo first!'); return; }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    // Build WhatsApp message NOW (before any await — keeps user-gesture alive for anchor.click())
    const photoListLines = window.selectedPhotos.slice(0, 20).map((p, i) => `${i + 1}. ${p.split('/').pop()}`).join('\n');
    const hasMore = photoCount > 20 ? `\n...and ${photoCount - 20} more` : '';
    const prebuiltMsg = `📸 *New Photo Selection — Vinayak Studio*\n\n` +
        `👤 *Name:* ${nameInput}\n` +
        `📱 *Phone:* ${phoneInput || 'Not provided'}\n` +
        `🎪 *Event:* ${clientName || 'Wedding'}\n` +
        `🖼️ *Photos Selected:* ${photoCount}\n\n` +
        `*Selected Files:*\n${photoListLines}${hasMore}\n\n` +
        `Please check the admin panel for full details. ✨`;

    try {
        const res = await fetch(`${API_URL}/api/clients/${clientCode}/submit-selection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                selected_urls: window.selectedPhotos,
                submitted_by: nameInput,
                guest_phone: phoneInput || null
            })
        });

        const data = await res.json();

        if (data.success) {
            // ✅ Close modal first for clean UX
            closeSelectionSubmitModal();

            // ✅ WhatsApp redirect — use window.location for reliable mobile redirect
            const finalMsg = prebuiltMsg.replace('check the admin panel for full details.',
                `check admin panel. Selection ID: ${data.selection_id || 'N/A'}`);
            const waUrl = `https://wa.me/916350095221?text=${encodeURIComponent(finalMsg)}`;
            // Use setTimeout to bypass gesture-chain restrictions on mobile
            setTimeout(() => { window.open(waUrl, '_blank') || (window.location.href = waUrl); }, 100);

            // ✅ Show luxury success toast
            showVSToast('✅ Selection sent to Studio! WhatsApp opening...');

            // ✅ Reset UI
            window.selectedPhotos = [];
            closeFolderGallery();
            document.querySelectorAll('.selection-heart-btn').forEach(el => el.classList.remove('selected'));
            document.querySelectorAll('.selected-active').forEach(el => el.classList.remove('selected-active'));
            updateFloat();
        } else {
            showVSToast('❌ Submission failed. Please try again.');
            btn.innerHTML = `Confirm & Send (<span id="finalSelectionCount">${photoCount}</span>)`;
            btn.disabled = false;
        }
    } catch (err) {
        console.error('Selection submit error:', err);
        showVSToast('❌ Network error. Check your connection.');
        btn.innerHTML = `Confirm & Send (<span id="finalSelectionCount">${photoCount}</span>)`;
        btn.disabled = false;
    }
}

// ── Luxury Toast Notification ──
function showVSToast(message, duration = 3500) {
    let toast = document.getElementById('vsGlobalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'vsGlobalToast';
        toast.className = 'vs-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.classList.remove('visible'); }, duration);
}

// Ensure body gets class for selection styling globally
document.body.classList.add('selection-mode-active');

function sendSelection() {
    openSelectionSubmitModal();
}

// --- TOUCH & KEYBOARD CONTROLS ---
const lb = document.getElementById('imgLB');
if (lb) {
    lb.addEventListener('touchstart', e => touchS = e.changedTouches[0].screenX);
    lb.addEventListener('touchend', e => {
        touchE = e.changedTouches[0].screenX;
        if (touchE < touchS - 50) changePhoto(1);
        if (touchE > touchS + 50) changePhoto(-1);
    });
}

// --- KEYBOARD CONTROLS FOR LIGHTBOX ---
document.addEventListener('keydown', e => {
    const imgLB = document.getElementById('imgLB');
    if (imgLB && (imgLB.style.display === 'flex' || imgLB.classList.contains('is-active'))) {
        if (e.key === 'ArrowRight') changePhoto(1);
        if (e.key === 'ArrowLeft') changePhoto(-1);
        if (e.key === 'Escape') closeImgLB();
    }
});

// --- MOUSE WHEEL NAVIGATION FOR LIGHTBOX (placed at top level) ---
(function initWheelNavigation() {
    const imgLB = document.getElementById('imgLB');
    if (!imgLB) return;
    let wheelThrottle = false;

    function handleWheel(e) {
        // Only act if lightbox is visible
        if (imgLB.style.display !== 'flex' && !imgLB.classList.contains('is-active')) return;
        if (wheelThrottle) return;
        e.preventDefault();
        e.stopPropagation();
        wheelThrottle = true;
        if (e.deltaY > 0) {
            changePhoto(1);   // scroll down → next
        } else {
            changePhoto(-1);  // scroll up → previous
        }
        setTimeout(() => wheelThrottle = false, 300);
    }

    // Attach to lightbox container
    imgLB.addEventListener('wheel', handleWheel, { passive: false });

    // Also attach to image wrapper so wheel works over the photo itself
    const wrapper = document.getElementById('lbImgWrapper');
    if (wrapper) wrapper.addEventListener('wheel', handleWheel, { passive: false });
})();

// ===================================================
// 🧩 OLD CLIENT GALLERY (backward compatibility)
// ===================================================
async function unlockClientGallery() {
    const codeInputArea = document.getElementById('clientCodeInput');
    const resultArea = document.getElementById('clientResultArea');
    const code = codeInputArea.value.trim().toUpperCase();
    if (!code) { alert("Please enter your access code."); return; }

    try {
        // Step 1: Login to get token
        const formData = new FormData();
        formData.append('code', code);
        const tokenRes = await fetch(`${API_URL}/api/client/login`, { method: 'POST', body: formData });
        const tokenData = await tokenRes.json();
        if (!tokenRes.ok || !tokenData.access_token) throw new Error('Invalid code');
        const token = tokenData.access_token;
        localStorage.setItem('clientToken', token);
        localStorage.setItem('clientCode', code);

        // Step 2: Fetch client data
        const clientRes = await fetch(`${API_URL}/api/clients/${code}?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        if (!clientRes.ok) throw new Error('Failed to fetch client info');
        const c = await clientRes.json();

        clientCode = code;
        clientName = c.name;
        window.selectedPhotos = [];
        updateFloat();

        // Step 3: Fetch photos
        const photosRes = await fetch(`${API_URL}/api/clients/${code}/photos?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store'
        });
        const photoData = await photosRes.json();
        photos = photoData.photos || [];

        let h = `<div style="padding:40px; background:white; border-radius:10px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">`;
        h += `<h3 style="font-family:'Playfair Display'; margin-bottom:8px;">Welcome, ${c.name} 👋</h3>`;
        h += `<p style="color:#777; margin-bottom:20px;">${photos.length} photo(s) ready for selection</p>`;

        // 1. Invitation
        if (c.invitation_video) {
            h += `<div class="client-module"><h4>🎟️ Digital Invitation</h4>`;
            h += `<video src="${c.invitation_video}" controls width="100%" style="max-width:400px;"></video>`;
            h += `</div>`;
        }

        // 2. Cinema Room
        if ((c.films && c.films.length) || (c.reels && c.reels.length)) {
            h += `<div class="client-module"><h4>🍿 Cinema Room</h4>`;
            if (c.films && c.films.length) {
                h += `<div><strong>Films</strong><div class="films-grid">`;
                c.films.forEach(url => {
                    h += `<div class="film-card" onclick="playLuxuryVideo('${url}')">
                        <div class="film-info"><button class="film-btn">Watch Film</button></div>
                      </div>`;
                });
                h += `</div></div>`;
            }
            if (c.reels && c.reels.length) {
                h += `<div><strong>Reels</strong><div class="reels-strip">`;
                c.reels.forEach(url => {
                    h += `<div class="reel-frame"><iframe src="${url}" width="100%" height="100%" frameborder="0"></iframe></div>`;
                });
                h += `</div></div>`;
            }
            h += `</div>`;
        }

        // 3. 3D Digital Album
        if (c.album_pages && c.album_pages.length) {
            h += `<div class="client-module"><h4>📖 3D Digital Album</h4>`;
            h += `<div style="display:flex; flex-wrap:wrap; gap:10px;">`;
            c.album_pages.forEach(page => {
                h += `<img src="${page}" width="100" style="border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">`;
            });
            h += `</div></div>`;
        }

        // 4. Smart Selection Gallery
        if (c.galleries && Object.keys(c.galleries).length) {
            h += `<div class="client-module"><h4>📸 Event Galleries</h4>`;
            for (const [event, eventPhotos] of Object.entries(c.galleries)) {
                h += `<div><strong>${event}</strong><div class="masonry-grid" style="margin-top:10px;">`;
                eventPhotos.forEach((url) => {
                    h += `<div class="m-item"><img src="${url}" loading="lazy" class="skeleton" onload="this.classList.remove('skeleton')"></div>`;
                });
                h += `</div></div>`;
            }
            h += `</div>`;
        }

        // 5. Data Vault
        if (c.download_link || c.upload_link) {
            h += `<div class="client-module"><h4>📦 Data Vault</h4>`;
            if (c.download_link) h += `<p><a href="${c.download_link}" target="_blank" class="c-btn" style="display:inline-block; margin:5px;">⬇️ Download Original Files</a></p>`;
            if (c.upload_link) h += `<p><a href="${c.upload_link}" target="_blank" class="c-btn" style="display:inline-block; margin:5px;">📤 Upload Your Photos</a></p>`;
            h += `</div>`;
        }

        // 6. Photo Grid
        h += `<div class="masonry-grid" style="margin-top:30px;">`;
        if (photos.length > 0) {
            photos.forEach((photo, i) => {
                const url = (typeof photo === 'object') ? photo.url : `${API_URL}/api/image/selection/${code}/${photo}`;
                h += `<div class="m-item" id="g-${i}" onclick="openImgLB(${i},'sel')"><img src="${url}" loading="lazy" class="skeleton" onload="this.classList.remove('skeleton')"></div>`;
            });
        } else {
            h += `<p style="color:#999; text-align:center; padding:40px;">No photos uploaded yet.</p>`;
        }
        h += `</div></div>`;

        resultArea.innerHTML = h;
    } catch (err) {
        alert("❌ Galat VIP Code! Shadi ka sahi code daalein.");
        console.error(err);
    }
}

function loadWebsiteContent(d) {
    // 🔥 Load Studio Badge for Client Lounge
    if (d.studio_badge) window.studioBadge = d.studio_badge;
    else window.studioBadge = "ORIGINAL";

    // Hero Media — loaded from static assets/hero/ (Vercel CDN, restart-safe)
    const hc = document.querySelector('.hero');
    const heroVid = document.getElementById('heroVideo');
    if (heroVid) {
        if (d.hero_images && d.hero_images.length && d.hero_images[0]) {
            const heroUrl = d.hero_images[0];
            if (heroUrl.startsWith('http')) {
                heroVid.src = heroUrl;                // use directly
            } else {
                heroVid.src = `${API_URL}/api/hero/${encodeURIComponent(heroUrl)}`;
            }
            heroVid.onloadeddata = () => {
                heroVid.style.opacity = 1;
                heroVid.play().catch(e => console.log("Hero auto-play blocked:", e));
            };
        } else {
            heroVid.style.display = 'none';
        }
    }

    // Films
    if (d.films) {
        // Placeholder SVG for non‑YouTube videos
        const placeholderSvg = encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 220">
            <rect width="350" height="220" fill="#1a1a1a"/>
            <circle cx="175" cy="110" r="35" fill="#c5a059" opacity="0.9"/>
            <polygon points="160,90 160,130 190,110" fill="white"/>
        </svg>
    `);
        const placeholderUrl = `data:image/svg+xml,${placeholderSvg}`;

        let filmsHtml = '';
        d.films.forEach((item, filmIdx) => {
            let videoUrl = typeof item === 'object' ? item.url : item;
            let thumbUrl = '';
            let coupleTitle = (typeof item === 'object' && item.title) ? item.title : `A Cinematic Film`;
            let videoId = '';

            if (typeof item === 'object' && item.thumb_url) {
                thumbUrl = item.thumb_url;
            } else {
                if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    let match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#/]+)/);
                    if (match) videoId = match[1];
                    // Using hqdefault as primary to avoid 404 logs
                    thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : placeholderUrl;
                } else {
                    thumbUrl = placeholderUrl;
                }
            }

            filmsHtml += `
            <div class="film-card hover-play-card" onclick="playLuxuryVideo('${escapeHtml(videoUrl)}')">
                <img src="${thumbUrl}" class="film-thumb" alt="${coupleTitle}" onerror="this.src='${placeholderUrl}'">
                <video loop muted playsinline class="preview-vid">
                    <source src="${escapeHtml(videoUrl)}" type="video/mp4">
                </video>
                <div class="film-overlay"></div>
                <span class="film-badge">A Vinayak Studio Film</span>
                <div class="film-couple-name">${coupleTitle}</div>
                <div class="film-info">
                    <button class="film-btn">Watch Film</button>
                </div>
            </div>
        `;
        });
        document.getElementById('films-dynamic').innerHTML = filmsHtml;
    }

    // Reels
    if (d.reels) {
        // Placeholder SVG for non‑YouTube videos
        const placeholderSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 390">
        <rect width="220" height="390" fill="#1a1a1a"/>
        <circle cx="110" cy="195" r="35" fill="#c5a059" opacity="0.9"/>
        <polygon points="95,175 95,215 125,195" fill="white"/>
    </svg>
`);
        const placeholderUrl = `data:image/svg+xml,${placeholderSvg}`;

        let reelsHtml = '';
        d.reels.forEach(item => {
            const url = typeof item === 'object' ? item.url : item;
            const customThumb = typeof item === 'object' && item.thumb_url ? item.thumb_url : null;

            // Check if it's an Instagram reel
            if (url.includes('instagram.com/reel/')) {
                // Use a clickable card that opens the Instagram page directly
                const finalThumb = customThumb || placeholderUrl;
                reelsHtml += `
            <div class="cine-card" onclick="window.open('${escapeHtml(url)}', '_blank')">
                <img src="${finalThumb}" style="object-fit: cover; width: 100%; height: 100%;" alt="Reel">
                <div class="play-btn-overlay"><i class="fab fa-instagram"></i></div>
                <div class="card-info"><h3>Instagram Reel</h3></div>
            </div>
        `;
            } else {
                // For non‑Instagram, create a clickable card that plays in luxury modal
                let thumbUrl = customThumb || placeholderUrl;
                if (!customThumb && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/);
                    if (match) thumbUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
                }

                reelsHtml += `
            <div class="reel-frame hover-play-card" style="cursor: pointer; position: relative;" onclick="playLuxuryVideo('${escapeHtml(url)}')">
                <img src="${thumbUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                <video loop muted playsinline class="preview-vid">
                    <source src="${escapeHtml(url)}" type="video/mp4">
                </video>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 10px; text-align: center;">
                    <i class="fas fa-play-circle" style="font-size: 2rem; color: #c5a059;"></i>
                </div>
            </div>
        `;
            }
        });
        document.getElementById('reels-dynamic').innerHTML = reelsHtml;
    }

    // Gallery Photos — loaded from static assets/gallery/ (Vercel CDN, restart-safe)
    if (d.photos) {
        photos = d.photos;
        document.getElementById('photo-grid-dynamic').innerHTML = d.photos.map((p, i) => `
        <div class="m-item" onclick="openImgLB(${i})">
            <img src="${p.startsWith('http') ? p : 'assets/gallery/' + p}" loading="lazy">
        </div>`).join('');
    }

    // Invites – store single links for backward compatibility
    if (d.invites) {
        window.inviteLinks = d.invites;
    }

    // Store invitation catalog for later use
    if (d.invitation_catalog) {
        invitationCatalog = d.invitation_catalog;
        __invitationCatalogBackup = d.invitation_catalog;   // keep backup
    } else {
        invitationCatalog = { '2d': [], '3d': [], 'teaser': [] };
        __invitationCatalogBackup = { '2d': [], '3d': [], 'teaser': [] };
    }

    // --- FALLBACK: If catalog is empty but old 'invites' exist, convert them ---
    console.log("Invitation catalog before fallback:", invitationCatalog);
    const hasEmptyCatalog = !d.invitation_catalog || Object.keys(invitationCatalog).every(k => invitationCatalog[k].length === 0);
    if (hasEmptyCatalog && d.invites) {
        console.log("🔄 Using legacy invites as fallback for invitation catalog");
        for (let type of ['2d', '3d', 'teaser']) {
            const legacyUrl = d.invites[type];
            if (legacyUrl && legacyUrl.trim() !== "") {
                let thumbUrl = '';
                // Generate YouTube thumbnail if it's a YouTube link
                if (legacyUrl.includes('youtu.be') || legacyUrl.includes('youtube.com')) {
                    const videoId = extractVideoId(legacyUrl);
                    if (videoId) {
                        thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    } else {
                        thumbUrl = 'https://via.placeholder.com/250x444?text=Invite';
                    }
                } else {
                    thumbUrl = 'https://via.placeholder.com/250x444?text=Invite';
                }
                invitationCatalog[type] = [{
                    video_url: legacyUrl,
                    thumb_url: thumbUrl
                }];
                console.log(`✅ Added ${type} invitation:`, invitationCatalog[type]);
            } else {
                console.log(`⚠️ No legacy URL for ${type}`);
            }
        }
        // Update phone mockup thumbnails immediately after fallback
        for (const type of ['2d', '3d', 'teaser']) {
            const thumbImg = document.getElementById(`thumb-${type}`);
            if (thumbImg && invitationCatalog[type] && invitationCatalog[type].length > 0) {
                thumbImg.src = invitationCatalog[type][0].thumb_url;
            }
        }
    } else {
        console.log("No fallback needed, catalog already has items or invites missing");
    }
    console.log("Invitation catalog after fallback:", invitationCatalog);

    // Update phone mockup thumbnails to use first video from catalog
    for (const type of ['2d', '3d', 'teaser']) {
        const thumbImg = document.getElementById(`thumb-${type}`);
        if (thumbImg && invitationCatalog[type] && invitationCatalog[type].length > 0) {
            thumbImg.src = invitationCatalog[type][0].thumb_url;
        } else if (thumbImg) {
            thumbImg.src = 'https://via.placeholder.com/250x444?text=No+Video';
        }
    }

    // About & Contact Dynamic Backgrounds
    if (d.about_image) {
        const aboutEl = document.querySelector('.about-image');
        if (aboutEl) aboutEl.style.backgroundImage = `url(${API_URL}/api/profile/${d.about_image})`;
        const footerEl = document.querySelector('footer');
        if (footerEl) footerEl.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.95)), url(${API_URL}/api/profile/${d.about_image})`;
    }

    if (d.contact_image) {
        const contactEl = document.querySelector('.contact-img');
        if (contactEl) contactEl.style.backgroundImage = `url(${API_URL}/api/contact/${d.contact_image})`;
    }

    // Attach hover-play logic and horizontal scroll to newly created rails
    attachHoverPlayLogic();
    initPublicHorizontalScroll();
}

const autoLogin = async () => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // 🔐 CASE 1: Master VIP Token in URL (One-Time Burn Key)
    const vipToken = params.get('vip');
    if (vipToken) {
        try {
            const res = await fetch(`${API_URL}/api/master-token/verify/${vipToken}`);
            if (res.ok) {
                const data = await res.json();
                // Save MASTER session permanently in browser
                localStorage.setItem('vip_master', JSON.stringify({
                    code: data.client_code,
                    name: data.client_name,
                    role: 'MASTER',
                    ts: Date.now()
                }));
                localStorage.setItem('clientCode', data.client_code);

                // Clean URL immediately (remove token so it can't be forwarded)
                window.history.replaceState({}, document.title, window.location.pathname);

                // Auto-login with the verified code
                const input = document.getElementById('vip-code-input');
                const loginBtn = document.getElementById('vip-login-btn');
                if (input && loginBtn) {
                    input.value = data.client_code;
                    const portal = document.getElementById('client-portal');
                    if (portal) portal.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    performClientLogin(data.client_code, loginBtn);
                }
                return; // Stop further processing
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.detail || 'This VIP key is expired or already used. Contact studio for a new one.');
            }
        } catch (err) {
            console.error('VIP Token verification failed:', err);
        }
    }

    // 🔐 CASE 2: Returning user with saved MASTER session (auto-login on revisit)
    const savedSession = localStorage.getItem('vip_master');
    if (savedSession && !params.get('code')) {
        try {
            const session = JSON.parse(savedSession);
            if (session.code && session.role === 'MASTER') {
                const input = document.getElementById('vip-code-input');
                const loginBtn = document.getElementById('vip-login-btn');
                if (input && loginBtn) {
                    input.value = session.code.toUpperCase();
                    performClientLogin(session.code, loginBtn);
                }
                return;
            }
        } catch (e) {
            localStorage.removeItem('vip_master');
        }
    }

    // 🔐 CASE 3: ?code= Master Link (Anti-Forwarding Device Binding)
    let code = params.get('code');
    if (!code) {
        const match = path.match(/\/(?:share\/client|vip)\/([A-Z0-9]+)/i);
        if (match) code = match[1];
    }

    if (code) {
        // --- ANTI-FORWARDING VAULT ---
        // Generate a unique device fingerprint using screen + navigator properties
        const deviceSig = btoa([
            navigator.userAgent,
            screen.width, screen.height, screen.colorDepth,
            navigator.language, navigator.hardwareConcurrency || 0
        ].join('|')).slice(0, 32);

        const bindingKey = `vip_device_${code.toUpperCase()}`;
        const existingBinding = localStorage.getItem(bindingKey);

        if (existingBinding && existingBinding !== deviceSig) {
            // ⛔ This is a FORWARDED link opened on a different device!
            // Clean URL and show access denied
            history.replaceState({}, '', window.location.origin + window.location.pathname);
            document.body.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center; min-height:100vh; background:#0a0a0a; color:#fff; flex-direction:column; font-family:sans-serif; text-align:center; padding:40px;">
                <div style="font-size:60px; margin-bottom:20px;">🔒</div>
                <h1 style="color:#c5a059; font-size:28px; margin-bottom:15px;">Access Restricted</h1>
                <p style="color:#888; font-size:16px; max-width:400px;">This exclusive link is bound to the original device.<br>Please contact <strong style="color:#c5a059;">Vinayak Studio</strong> for your personal access link.</p>
            </div>`;
            return;
        }

        // ✅ First-time open OR same device re-open: Bind this device permanently
        localStorage.setItem(bindingKey, deviceSig);
        localStorage.setItem('vip_master', JSON.stringify({
            code: code.toUpperCase(),
            role: 'MASTER',
            ts: Date.now()
        }));

        // Immediately clean URL to prevent copy-paste forwarding
        history.replaceState({}, '', window.location.origin + window.location.pathname);

        const input = document.getElementById('vip-code-input');
        const loginBtn = document.getElementById('vip-login-btn');
        if (input && loginBtn) {
            input.value = code.toUpperCase();
            performClientLogin(code.toUpperCase(), loginBtn);
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Toggle password visibility for client login
    const eyeIcon = document.getElementById('togglePasswordEye');
    const passwordInput = document.getElementById('vip-code-input');
    if (eyeIcon && passwordInput) {
        eyeIcon.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            // Toggle FontAwesome icons
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // --- 🚀 VIP GUEST PREMIERE ROUTING (NETFLIX STYLE) ---
    let guestToken = new URLSearchParams(window.location.search).get('guest');
    // Token extraction logic from URL path (fallback)
    if (!guestToken) {
        const pathParts = window.location.pathname.split('/').filter(p => p);
        for (let i = 0; i < pathParts.length; i++) {
            if (pathParts[i] && pathParts[i].length > 5) {
                // Only extract token if preceded by known prefix
                if (i > 0 && ['share', 'guest', 'vip', 'invite'].includes(pathParts[i - 1].toLowerCase())) {
                    guestToken = pathParts[i]; break;
                }
                // Removed aggressive fallback: pathParts[i].length > 8 was too broad
            }
        }
    }

    if (guestToken) {
        document.body.classList.add('is-vip-guest');
        window.isGuestMode = true;

        // 📸 AI Camera visibility is now handled by CSS (.is-vip-guest on body)

        // 🔥 SMART CHECK: Already registered?
        const storageKey = `guest_rsvp_${guestToken}`;
        const existingRSVP = localStorage.getItem(storageKey);
        if (existingRSVP) {
            window._guestRSVPCompleted = true;
            try {
                const saved = JSON.parse(existingRSVP);
                window._savedGuestName = saved.name;
            } catch (e) { }
        }

        try {
            const res = await fetch(`${API_URL}/api/share/${guestToken}`);
            if (!res.ok) throw new Error('Invalid or expired link');
            const guestData = await res.json();
            window.currentClientData = guestData; // 🔥 Set this for aspect ratio support in albums

            // 1. Setup Hero Premiere Section & Branding
            const clientName = guestData.client_name || "Our beloved couple";
            document.title = `${clientName} | VIP Pass`;

            // Set name in the Royal Guest Book modal
            const coupleNameEl = document.getElementById('rsvpCoupleName');
            if (coupleNameEl) coupleNameEl.innerText = clientName;

            // Text Setup
            const onlyInvitation = guestData.items.length === 1 && guestData.items[0].type === 'invitation';

            // 💎 The Elite Invitation Copywriting
            document.getElementById('g-eyebrow').textContent = onlyInvitation ? "✦ YOU ARE INVITED ✦" : "✦ THE EXCLUSIVE COLLECTION ✦";
            document.getElementById('g-title').textContent = onlyInvitation ? "The Royal Union" : "A Timeless Legacy";

            // Added class 'cap-name' back for capitalization
            document.getElementById('g-message').innerHTML = onlyInvitation
                ? `A celebration of love, family, and forever. <strong class="cap-name">${clientName}</strong> request the pleasure of your company to share in the joy of their wedding festivities.`
                : `Some memories are woven with pure magic. <strong class="cap-name">${clientName}</strong> exclusively invite you to step back in time and relive the most beautiful moments of their celebration.`;

            // Inject the Luxury Scroll Indicator dynamically if not present
            const heroContent = document.querySelector('.premium-hero-content');
            if (heroContent && !document.querySelector('.luxury-scroll-indicator')) {
                const scrollHint = document.createElement('div');
                scrollHint.className = 'luxury-scroll-indicator reveal-item active';
                scrollHint.style.setProperty('--delay', '1s');
                scrollHint.innerHTML = `<span>DISCOVER</span><div class="scroll-line"></div>`;
                heroContent.appendChild(scrollHint);
            }

            // 2. Sort Items into Rails
            const portraitVidRail = document.getElementById('g-content-portrait-vids');
            const cinemaRail = document.getElementById('g-content-cinema');
            const weddingRail = document.getElementById('g-content-wedding');
            const galleryRail = document.getElementById('g-content-gallery');
            const albumRail = document.getElementById('g-content-album');

            // Clear all rails
            if (portraitVidRail) portraitVidRail.innerHTML = '';
            if (cinemaRail) cinemaRail.innerHTML = '';
            if (weddingRail) weddingRail.innerHTML = '';
            if (galleryRail) galleryRail.innerHTML = '';
            if (albumRail) albumRail.innerHTML = '';

            const elegantFallback = 'https://raw.githubusercontent.com/Kumar-Vinayak/VinayakStudio-Assets/main/placeholder_cinematic.webp';

            guestData.items.forEach(item => {
                const card = document.createElement('div');
                const title = item.title || "Untitled";

                // Smart Fallback strategy
                const isUrlVideo = item.url && item.url.match(/\.(mp4|mov|avi|webm)$/i);

                // Pehli photo nikalne ka robust tarika (Guest Data structure ke mutabik)
                let firstPhoto = null;
                if (item.photos && item.photos.length > 0) {
                    const p = item.photos[0];
                    firstPhoto = (typeof p === 'object') ? (p.url || p.image_url || p) : p;
                }

                // Agar gallery hai, toh pehli photo ko hi direct priority do!
                let thumb;
                const vidId = extractVideoId(item.url);
                if (item.type === 'gallery_event' && firstPhoto) {
                    thumb = firstPhoto;
                } else {
                    thumb = item.thumb || item.thumbnail || (vidId ? `https://img.youtube.com/vi/${vidId}/maxresdefault.jpg` : null) || (!isUrlVideo ? item.url : null) || firstPhoto || elegantFallback;
                }

                thumb = sanitizeUrl(thumb);

                if (item.type === 'invitation') {
                    card.className = 'n-card portrait-mode';
                    card.innerHTML = `
                    <div class="cine-card-inner VIP-invite-layer" onclick="playLuxuryVideo('${item.url}')">
                        <img src="${thumb}" onerror="this.src='${elegantFallback}'">
                        <div class="invite-gradient-bottom"></div>
                        <div class="invite-text-overlay">✦ YOU ARE INVITED ✦</div>
                        <div class="play-btn-overlay gold-glow"><i class="fas fa-play"></i></div>
                    </div>
                `;
                    if (portraitVidRail) portraitVidRail.appendChild(card);
                    const parent = document.getElementById('g-rail-portrait-vids');
                    if (parent) parent.style.display = 'block';

                } else if (item.type === 'film') {
                    card.className = 'n-card landscape-mode';
                    card.innerHTML = `
                    <div class="cine-card-inner" onclick="playLuxuryVideo('${item.url}')">
                        <img src="${thumb}" onerror="this.src='${elegantFallback}'">
                        <div class="play-btn-overlay"><i class="fas fa-play"></i></div>
                        <div class="card-info"><h3>${escapeHtml(title)}</h3></div>
                    </div>
                `;
                    if (cinemaRail) cinemaRail.appendChild(card);
                    const parent = document.getElementById('g-rail-cinema');
                    if (parent) parent.style.display = 'block';

                } else if (item.type === 'reel') {
                    // Reels render in the cinema rail alongside films
                    card.className = 'n-card portrait-mode';
                    card.innerHTML = `
                    <div class="cine-card-inner" onclick="playLuxuryVideo('${item.url}')">
                        <img src="${thumb}" onerror="this.src='${elegantFallback}'">
                        <div class="play-btn-overlay"><i class="fas fa-play"></i></div>
                        <div class="card-info"><h3>${escapeHtml(title)}</h3></div>
                    </div>
                `;
                    if (cinemaRail) cinemaRail.appendChild(card);
                    const parentReel = document.getElementById('g-rail-cinema');
                    if (parentReel) parentReel.style.display = 'block';

                } else if (item.type === 'wedding_film') {
                    card.className = 'n-card landscape-mode';
                    card.innerHTML = `
                    <div class="cine-card-inner" onclick="playLuxuryVideo('${item.url}')">
                        <img src="${thumb}" onerror="this.src='${elegantFallback}'">
                        <div class="play-btn-overlay"><i class="fas fa-play"></i></div>
                        <div class="card-info"><h3>${escapeHtml(title)}</h3></div>
                    </div>
                `;
                    if (weddingRail) weddingRail.appendChild(card);
                    const parent = document.getElementById('g-rail-wedding');
                    if (parent) parent.style.display = 'block';

                } else if (item.type === 'gallery_event') {
                    card.className = 'n-card album-stack-card';
                    card.innerHTML = `
                    <div class="n-card-img-container"><img src="${thumb}" onerror="this.src='${elegantFallback}'"></div>
                    <div class="album-card-overlay">
                        <div class="album-label-content">
                            <span class="album-tag">COLLECTION</span>
                            <h4 class="album-title">${escapeHtml(title)}</h4>
                            <div class="photo-count-pill"><i class="fas fa-images"></i> VIEW</div>
                        </div>
                    </div>
                `;
                    card.addEventListener('click', () => {
                        window.clientGalleries = {};
                        window.clientGalleries[item.id] = item.photos || [];
                        openGallery(item.id);
                    });
                    if (galleryRail) galleryRail.appendChild(card);
                    const parent = document.getElementById('g-rail-gallery');
                    if (parent) parent.style.display = 'block';

                } else if (item.type === 'digital_album') {
                    card.className = 'n-card book-mode';
                    card.innerHTML = `
                    <div class="cine-card-inner">
                        <img src="${thumb}" onerror="this.src='${elegantFallback}'">
                        <div class="n-card-title">${escapeHtml(title)} <br> <span class="flipbook-badge">OPEN BOOK</span></div>
                    </div>
                `;
                    card.addEventListener('click', () => {
                        const pages = item.album_pages || guestData.album_pages || [];
                        if (pages.length) openFlipbook(pages);
                        else alert("Album pages not available.");
                    });
                    if (albumRail) albumRail.appendChild(card);
                    const parent = document.getElementById('g-rail-album');
                    if (parent) parent.style.display = 'block';
                }
            });

            // 🔥 SMART: Check if this is an invitation share
            const hasInvitationItem = guestData.items.some(item => item.type === 'invitation');
            window._isInvitationShare = hasInvitationItem;

            // ✅ BUG 7 FIX: Show the exclusive guest lounge container
            const guestLoungeEl = document.getElementById('exclusive-guest-lounge');
            if (guestLoungeEl) {
                guestLoungeEl.style.display = 'block';
            }

            // ✅ Set guest hero background from client's hero image
            const gHeroBg = document.getElementById('g-hero-bg');
            if (gHeroBg && guestData.hero_image) {
                gHeroBg.style.backgroundImage = `url('${guestData.hero_image}')`;
            }

            // ✅ Hide all main site sections so only the guest lounge shows
            document.querySelectorAll('main.main-content > section, main.main-content > div:not(#exclusive-guest-lounge)').forEach(el => {
                if (!el.closest('#exclusive-guest-lounge')) el.style.display = 'none';
            });

            // Also hide nav for cleaner immersive experience
            const mainNav = document.getElementById('navbar');
            if (mainNav) mainNav.style.display = 'none';

            setTimeout(() => { if (typeof enableOTTSync === 'function') enableOTTSync(); }, 150);

            // 📊 Track Guest Lounge view
            trackEvent('view');

            // Store guest context for trigger-based RSVP
            window.currentGuestToken = guestToken;
            window.currentInvitationItem = hasInvitationItem || null;  // ✅ Reuse existing variable (already declared above)
            window._guestRSVPCompleted = false; // Track if guest already registered

            // 🎬 SMART AUTO-SCROLL: Always scroll to invitation/content section
            // No instant popup — let guest explore freely first
            setTimeout(() => {
                const scrollTarget = document.getElementById('g-rail-portrait-vids')
                    || document.querySelector('[id^="g-rail-"][style*="display: block"]')
                    || document.querySelector('#exclusive-guest-lounge footer');
                if (scrollTarget) {
                    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }, 800);

            // WhatsApp wali history entry ko override karo
            history.replaceState(null, null, location.href);
            // Naya state push karo taaki back button par popstate fire ho
            history.pushState(null, null, location.href);
            return; // 🛑 Stop main site loading
        } catch (err) {
            console.error(err);
            alert("This VIP Pass is invalid or has expired.");
            document.body.classList.remove('is-vip-guest');
            window.isGuestMode = false;
        }
    }
    fetch(`${API_URL}/api/website-content?t=${Date.now()}`, { cache: 'no-store' })
        .then(r => { if (!r.ok) throw new Error('Backend unavailable'); return r.json(); })
        .then(d => loadWebsiteContent(d))
        .catch(() => {
            console.warn('Backend unreachable — please refresh.');
            // 🔥 Fallback disabled to prevent showing deleted photos
            // fetch(`website-content.json?t=${Date.now()}`, { cache: 'no-store' })
            //     .then(r => r.json())
            //     .then(d => loadWebsiteContent(d))
            //     .catch(e => console.error('Failed to load website-content.json:', e));

            // Optionally show a friendly message
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.innerHTML = '<h2>Unable to load content. Please refresh.</h2>';
            }
        });


    // VIP Login Button with JWT authentication
    const loginBtn = document.getElementById('vip-login-btn');
    const codeInput = document.getElementById('vip-code-input');

    // VIP Login Button Logic Extracted to function
    window.performClientLogin = async function (code, loginBtn) {
        if (!code) return;
        const originalText = loginBtn ? loginBtn.innerHTML : 'LOGIN';
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin-slow"></i> &nbsp; UNLOCKING...';
            loginBtn.classList.add('is-loading');
        }

        try {
            const formData = new FormData();
            formData.append('code', code);
            const tokenRes = await fetch(`${API_URL}/api/client/login`, {
                method: 'POST',
                body: formData
            });

            const tokenData = await tokenRes.json();
            if (!tokenRes.ok || !tokenData.access_token) {
                throw new Error(tokenData.detail || 'Invalid code');
            }

            const token = tokenData.access_token;
            localStorage.setItem('clientToken', token);
            localStorage.setItem('clientCode', code);

            await fetchClientLoungeWithToken(code, token);

            const gate = document.getElementById('login-vault-gate');
            if (gate) {
                gate.classList.add('fade-out');
                setTimeout(() => {
                    gate.style.display = 'none';
                    if (loginBtn) {
                        loginBtn.innerHTML = originalText;
                        loginBtn.classList.remove('is-loading');
                    }
                    // 🔥 Clear history state after login
                    history.replaceState(null, null, window.location.origin + window.location.pathname);
                }, 500);
            }

        } catch (err) {
            if (loginBtn) {
                loginBtn.innerHTML = originalText;
                loginBtn.classList.remove('is-loading');
            }
            alert("❌ Incorrect Access Code. Please check your invitation and try again.");
            console.error(err);
        }
    };

    if (loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const code = codeInput.value.trim().toUpperCase();
            if (!code) {
                alert("Please enter your Access Code!");
                return;
            }
            await window.performClientLogin(code, loginBtn);
        });
    }

    // ✅ AUTO-LOGIN AFTER BUTTON LISTENER IS ATTACHED
    autoLogin();

    // ✅ Touch device detection for adaptive interactions
    if ('ontouchstart' in window) {
        document.body.classList.add('is-touch-device');
    }

    // ===== SCROLL FADE-IN OBSERVER =====
    const fadeTargets = document.querySelectorAll(
        '.narrative-section, .coffee-band, .motion-section, .gallery-section, .invite-section, .contact-section'
    );
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    fadeTargets.forEach(el => {
        el.classList.add('fade-up');
        fadeObserver.observe(el);
    });

    // ===== SMART SCROLL PERSISTENCE =====
    let scrollSaveTimer;
    function saveCurrentSection() {
        if (typeof isFlipbookOpen !== 'undefined' && isFlipbookOpen) return;
        const sections = document.querySelectorAll('section[id]');
        let visibleSection = null;
        let maxVisible = 0;
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            if (visibleHeight > maxVisible) {
                maxVisible = visibleHeight;
                visibleSection = section.id;
            }
        });
        if (visibleSection) localStorage.setItem('lastVisitedSection', visibleSection);
    }

    window.addEventListener('scroll', throttle(() => {
        if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
        scrollSaveTimer = setTimeout(saveCurrentSection, 200);
    }, 100));

    function restoreLastSection() {
        const last = localStorage.getItem('lastVisitedSection');
        if (last) {
            const el = document.getElementById(last);
            if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }
    restoreLastSection();
});

function playInvite(type) {
    if (window.inviteLinks && window.inviteLinks[type] && window.inviteLinks[type].length > 0) {
        playLuxuryVideo(window.inviteLinks[type], 'invitation');   // use luxury modal instead of new tab
    } else {
        alert("Invitation link not set by Admin yet.");
    }
}

/* ---------------------------------------------------
    📱 INVITATION CATALOG LOGIC (Interaction)
--------------------------------------------------- */

// --- Unified Modal for Invitations ---

function openCineModal(category) {
    const modal = document.getElementById('cineModal');
    const container = document.getElementById('cineCardContainer');
    const titleEl = document.getElementById('modalDynamicTitle');

    const titles = {
        '2d': '2D CINEMATIC INVITATIONS',
        '3d': '3D IMMERSIVE INVITATIONS',
        'teaser': 'CINEMATIC TEASERS'
    };
    titleEl.innerText = titles[category] || 'THE COLLECTION';

    let items = (invitationCatalog?.[category] || []).length > 0
        ? invitationCatalog[category]
        : __invitationCatalogBackup[category] || [];

    if (items.length === 0 && window.inviteLinks && window.inviteLinks[category]) {
        const legacyUrl = window.inviteLinks[category];
        const videoId = extractVideoId(legacyUrl);
        const thumbUrl = videoId
            ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            : 'https://placehold.co/400x600/1a1a1a/c5a059?text=Invite';
        items = [{ video_url: legacyUrl, thumb_url: thumbUrl, title: `${category.toUpperCase()} PREMIERE` }];
    }

    if (!items.length) {
        container.innerHTML = `<div style="color:#888; text-align:center; padding:80px 20px; width:100%;"><p>No content available yet.</p></div>`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        return;
    }

    const isTeaser = category === 'teaser';
    container.innerHTML = '';

    items.forEach((item, idx) => {
        const videoUrl = item.video_url || item.url || '';
        const videoTitle = item.title || 'Cinematic Feature';

        let thumbUrl = item.thumb_url || item.thumbnail;
        if (!thumbUrl || thumbUrl === '') {
            const ytId = extractVideoId(videoUrl);
            thumbUrl = ytId
                ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                : 'https://placehold.co/400x600/1a1a1a/c5a059?text=Preview';
        }

        const sizeClass = isTeaser ? 'landscape-mode' : 'portrait-mode';
        const animDelay = idx * 0.15;

        const cardHTML = `
<div class="cine-card ${sizeClass}" onclick="playLuxuryVideo('${videoUrl}', 'invitation')">
<img src="${thumbUrl}" alt="${videoTitle}" onerror="this.src='https://placehold.co/400x600/1a1a1a/c5a059?text=Preview'">
<div class="card-info"><h3>${videoTitle}</h3></div>
<div class="play-btn-overlay"><i class="fas fa-play"></i></div>
</div>`;
        container.innerHTML += cardHTML;
    });

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCineModal() {
    const modal = document.getElementById('cineModal');
    if (modal) {
        modal.style.animation = 'none';
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
            modal.style.animation = 'modalFadeIn 0.5s ease forwards';
        }, 300);
    }
    document.body.style.overflow = '';
}

// Close modal when clicking outside (overlay)
document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('cineModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeCineModal();
        });
    }
});

/* ===================================================
   🎬 CINEMATIC HOVER AUTO-PLAY LOGIC
=================================================== */
function attachHoverPlayLogic() {
    const hoverCards = document.querySelectorAll('.hover-play-card');
    hoverCards.forEach(card => {
        const previewVid = card.querySelector('.preview-vid');
        if (previewVid) {
            // Remove previous listeners if any 
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);

            const newVid = newCard.querySelector('.preview-vid');
            newCard.addEventListener('mouseenter', () => {
                newVid.muted = true;
                const promise = newVid.play();
                if (promise !== undefined) {
                    promise.catch(e => console.log("Autoplay blocked:", e));
                }
            });
            newCard.addEventListener('mouseleave', () => {
                newVid.pause();
                newVid.currentTime = 0;
            });
        }
    });
}
// =========================================
// 📖 FLIPBOOK – FINAL MOBILE LANDSCAPE FIX (WITH MIN LIMITS)
// =========================================

let flipbookResizeListener = null;
let flipbookResizeTimer = null;
let currentPagesArray = null;
let currentPageIndex = 0;
let isFlipbookOpen = false;
let isMusicEnabled = true;
let waitingForOrientation = false;

function toggleMusic() {
    const bgMusic = document.getElementById('albumMusic');
    const btn = document.getElementById('musicToggleBtn');
    if (!bgMusic || !btn) return;

    if (isMusicEnabled) {
        bgMusic.pause();
        isMusicEnabled = false;
        btn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        btn.classList.add('muted');
    } else {
        bgMusic.play().catch(e => { });
        isMusicEnabled = true;
        btn.innerHTML = '<i class="fas fa-volume-up"></i>';
        btn.classList.remove('muted');
    }
}

function checkFlipbookOrientation() {
    if (!isFlipbookOpen) return;
    const overlay = document.getElementById('rotateDeviceOverlay');
    if (!overlay) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile && window.innerHeight > window.innerWidth) {
        overlay.style.display = 'flex';
        return true; // Is in Portrait
    } else {
        overlay.style.display = 'none';
        if (screen.orientation && screen.orientation.lock && isMobile) {
            screen.orientation.lock('landscape').catch(() => { });
        }
        return false; // Is in Landscape
    }
}

function syncAmbientBranding(clientData) {
    if (!clientData) return;
    const monoEl = document.getElementById('ambient-monogram');
    const nameEl = document.getElementById('ambient-studio-name');
    let studioName = clientData.studio_name || window.studioBadge || '';
    studioName = studioName.trim().toUpperCase();
    const firstChar = studioName.charAt(0);
    if (monoEl) monoEl.innerText = firstChar;
    if (nameEl) nameEl.innerText = studioName;
}

// Helper to load image and return a Promise
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        // Bypasses non-CORS cached versions from browser
        img.src = src;
    });
}

async function openFlipbook(pagesArray) {
    if (checkGuestTrigger(() => openFlipbook(pagesArray))) return;

    if (isFlipbookOpen) return;
    if (!pagesArray || pagesArray.length === 0) return;

    // 📊 Track album exploration event
    trackEvent('explore');

    isFlipbookOpen = true;
    const isPortrait = checkFlipbookOrientation();

    if (typeof syncAmbientBranding === 'function') syncAmbientBranding(window.currentClientData);

    // --- 1. Decide if we need to split every page (panoramic spread) ---
    const ratioStr = window.currentClientData?.album_aspect_ratio;

    // Auto-detect if spread is needed based on image dims
    const detectAutoSpread = async (firstPageUrl) => {
        if (!firstPageUrl) return false;
        try {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve((img.naturalWidth / img.naturalHeight) >= 2.2);
                img.onerror = () => resolve(false);
                img.src = firstPageUrl;
            });
        } catch (e) { return false; }
    };

    let isSpread = false;
    if (ratioStr && ratioStr !== 'custom') {
        const [v1, v2] = ratioStr.split(':').map(Number);
        const r = Math.max(v1, v2) / Math.min(v1, v2);
        if (r >= 2.5) isSpread = true;
    } else {
        isSpread = await detectAutoSpread(pagesArray[0]);
    }



    // --- 2. Process pages (split if needed) - but DON'T build yet if portrait ---
    const processPages = async () => {
        let finalArr = [];
        for (let src of pagesArray) {
            if (isSpread) {
                try {
                    const img = await loadImage(src);
                    const w = img.naturalWidth / 2;
                    const h = img.naturalHeight;
                    const canvasL = document.createElement('canvas');
                    canvasL.width = w; canvasL.height = h;
                    canvasL.getContext('2d').drawImage(img, 0, 0, w, h, 0, 0, w, h);
                    finalArr.push(canvasL.toDataURL('image/jpeg', 0.9));
                    const canvasR = document.createElement('canvas');
                    canvasR.width = w; canvasR.height = h;
                    canvasR.getContext('2d').drawImage(img, w, 0, w, h, 0, 0, w, h);
                    finalArr.push(canvasR.toDataURL('image/jpeg', 0.9));
                } catch (e) {
                    console.warn('Canvas split failed, using duplicate:', src);
                    finalArr.push(src, src);
                }
            } else {
                finalArr.push(src);
            }
        }
        if (finalArr.length % 2 !== 0) {
            finalArr.push('https://placehold.co/600x800/0a0a0a/c5a059?text=The+End');
        }
        return finalArr;
    };

    currentPagesArray = await processPages();

    // --- 3. Target ratio calculation ---
    let targetRatio = null;
    if (ratioStr && ratioStr !== 'custom') {
        let [w, h] = ratioStr.split(':').map(Number);
        if (isSpread) w = w / 2;
        targetRatio = w / h;
    } else if (window.currentClientData?.album_custom_width && window.currentClientData?.album_custom_height) {
        let w = window.currentClientData.album_custom_width;
        let h = window.currentClientData.album_custom_height;
        if (isSpread) w = w / 2;
        targetRatio = w / h;
    }

    // --- 4. If portrait on mobile, wait for orientation change ---
    const modal = document.getElementById('flipbookModal');
    const wrapper = document.getElementById('fbContainerWrapper');
    let container = document.getElementById('flipbook');

    if (!container && wrapper) {
        container = document.createElement('div');
        container.id = 'flipbook';
        container.className = 'magazine';
        wrapper.appendChild(container);
    }
    if (!container) {
        alert('Unable to open album. Please refresh.');
        closeFlipbook();
        return;
    }

    document.body.classList.add('album-is-open');
    modal.style.display = 'flex';
    history.pushState({ modal: 'flipbook' }, null, location.href); // 🔥 Push state for back button exit
    enterFullscreen(modal); // 🔥 ADD THIS
    setTimeout(() => { modal.style.opacity = '1'; }, 50);

    if (isPortrait && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        waitingForOrientation = true;
        // Show overlay is already handled by checkFlipbookOrientation()

        const orientationHandler = async () => {
            if (!isFlipbookOpen) return;
            const nowPortrait = checkFlipbookOrientation();
            if (!nowPortrait && waitingForOrientation) {
                waitingForOrientation = false;
                await buildFlipbookNow(container, wrapper, targetRatio, false);
                window.removeEventListener('orientationchange', orientationHandler);
                window.removeEventListener('resize', orientationHandler);
            }
        };
        window.addEventListener('orientationchange', orientationHandler);
        window.addEventListener('resize', orientationHandler);

        // Fallback timeout
        setTimeout(() => {
            if (waitingForOrientation) {
                waitingForOrientation = false;
                buildFlipbookNow(container, wrapper, targetRatio, false);
            }
        }, 5000);
        return;
    }

    // --- 5. Landscape or desktop – build immediately ---
    await buildFlipbookNow(container, wrapper, targetRatio, false);

    // Add periodic resize listener for desktop or orientation shifts after initial load
    if (flipbookResizeListener) window.removeEventListener('resize', flipbookResizeListener);
    flipbookResizeListener = debounce(async () => {
        if (!isFlipbookOpen) return;
        const isNowPortrait = checkFlipbookOrientation();
        if (!isNowPortrait) {
            await buildFlipbookNow(container, wrapper, targetRatio, true);
        }
    }, 200);
    window.addEventListener('resize', flipbookResizeListener);
    window.addEventListener('orientationchange', flipbookResizeListener);
}

// --- Helper function to build flipbook (shared) ---
async function buildFlipbookNow(container, wrapper, targetRatio, restorePage) {
    if (!isFlipbookOpen) return;

    // 🔥 Safety Delay: Give browser time to settle (esp. after fullscreen)
    await new Promise(r => setTimeout(r, 500));

    if (window.currentFlip) {
        try { window.currentFlip.destroy(); } catch (e) { }
        window.currentFlip = null;
    }
    if (container) container.innerHTML = '';

    currentPagesArray.forEach((src, idx) => {
        const page = document.createElement('div');
        page.className = 'stf__item luxury-page';
        if (idx === 0 || idx === currentPagesArray.length - 1) page.classList.add('cover-page');
        page.innerHTML = `<img src="${src}" loading="lazy" onerror="this.src='https://placehold.co/600x800/1a1a1a/c5a059?text=Page+Not+Found'">`;
        container.appendChild(page);
    });

    const calculateFitSize = () => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = currentPagesArray[0];
            img.onload = () => {
                const imgRatio = targetRatio || (img.naturalWidth / img.naturalHeight);
                const containerRect = wrapper.getBoundingClientRect();
                const availableWidth = containerRect.width;
                const availableHeight = containerRect.height;

                const maxPageWidth = availableWidth * 0.45;
                const maxPageHeight = availableHeight * 0.9;

                let pageWidth, pageHeight;
                pageHeight = maxPageHeight;
                pageWidth = pageHeight * imgRatio;
                if (pageWidth > maxPageWidth) {
                    pageWidth = maxPageWidth;
                    pageHeight = pageWidth / imgRatio;
                }
                pageWidth = Math.max(pageWidth, 150);
                pageHeight = Math.max(pageHeight, 150);

                resolve({ width: Math.floor(pageWidth), height: Math.floor(pageHeight) });
            };
            img.onerror = () => resolve({ width: 300, height: 400 });
        });
    };

    const { width, height } = await calculateFitSize();

    try {
        const flip = new St.PageFlip(container, {
            width: width, height: height,
            size: "fixed",
            minWidth: 150, minHeight: 150,
            maxWidth: 2500, maxHeight: 2500,
            showCover: true, drawShadow: true,
            flippingTime: 800, usePortrait: false,
            mobileScrollSupport: false
        });
        flip.loadFromHTML(container.querySelectorAll('.stf__item'));
        window.currentFlip = flip;
        if (restorePage && currentPageIndex > 0) {
            try { flip.flip(currentPageIndex); } catch (e) { }
        }
        const bgMusic = document.getElementById('albumMusic');
        const musicBtn = document.getElementById('musicToggleBtn');
        if (bgMusic) {
            bgMusic.volume = 0.3;
            if (isMusicEnabled) {
                bgMusic.play().catch(e => { });
                if (musicBtn) {
                    musicBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    musicBtn.classList.remove('muted');
                }
            } else {
                bgMusic.pause();
                if (musicBtn) {
                    musicBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
                    musicBtn.classList.add('muted');
                }
            }
        }
        flip.on('flip', () => {
            if (window.currentFlip) currentPageIndex = window.currentFlip.getCurrentPageIndex();
            const flipSound = document.getElementById('pageFlipSound');
            if (flipSound) { flipSound.currentTime = 0; flipSound.volume = 0.5; flipSound.play().catch(e => { }); }
        });
    } catch (err) {
        console.error('Flipbook init failed:', err);
        closeFlipbook();
    }
}

// closeFlipbook remains the same as before (already correct)

function closeFlipbook() {
    exitFullscreen(); // 🔥 ADD THIS
    const modal = document.getElementById('flipbookModal');
    const bgMusic = document.getElementById('albumMusic');

    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            if (window.currentFlip) {
                try { window.currentFlip.destroy(); } catch (e) { }
                window.currentFlip = null;
            }
            // 🔥 Also cleanup any active HLS video
            if (window._activeHls) {
                try { window._activeHls.destroy(); } catch (e) { }
                window._activeHls = null;
            }
            const hlsVideo = document.getElementById('hlsVideoPlayer');
            if (hlsVideo) {
                hlsVideo.pause();
                hlsVideo.removeAttribute('src');
                hlsVideo.load();
            }
            const container = document.getElementById('flipbook');
            if (container) container.innerHTML = '';
        }, 500);
    }

    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }

    document.body.style.overflow = '';
    document.body.classList.remove('album-is-open');
    isFlipbookOpen = false;
    waitingForOrientation = false;
    const overlay = document.getElementById('rotateDeviceOverlay');
    if (overlay) overlay.style.display = 'none';

    if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
    }
    currentPagesArray = null;
    currentPageIndex = 0;

    if (flipbookResizeListener) {
        window.removeEventListener('resize', flipbookResizeListener);
        flipbookResizeListener = null;
    }
    if (flipbookResizeTimer) {
        clearTimeout(flipbookResizeTimer);
        flipbookResizeTimer = null;
    }
}



// =========================================
// 🚀 NETFLIX‑STYLE SCROLL (VERTICAL + HORIZONTAL)
// =========================================
function enableOTTSync() {
    const rails = document.querySelectorAll('.netflix-rail-scroll');

    rails.forEach(rail => {
        if (rail.dataset.scrollInited) return;
        rail.dataset.scrollInited = "true";

        // 1. Horizontal scroll with mouse wheel (like Netflix)
        rail.addEventListener('wheel', (e) => {
            if (rail.scrollWidth > rail.clientWidth) {
                e.preventDefault();
                rail.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        // 2. Drag‑to‑scroll (professional touch)
        let isDown = false;
        let startX;
        let scrollLeft;

        rail.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // left click only
            isDown = true;
            rail.style.cursor = 'grabbing';
            startX = e.pageX - rail.offsetLeft;
            scrollLeft = rail.scrollLeft;
            e.preventDefault();
        });

        rail.addEventListener('mouseleave', () => {
            isDown = false;
            rail.style.cursor = 'pointer';
        });

        rail.addEventListener('mouseup', () => {
            isDown = false;
            rail.style.cursor = 'pointer';
        });

        rail.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - rail.offsetLeft;
            const walk = (x - startX) * 1.5;
            rail.scrollLeft = scrollLeft - walk;
        });
    });
}

/* =========================================
   🎬 HORIZONTAL SCROLL ENGINE (Public Rails)
========================================= */
function initPublicHorizontalScroll() {
    const rails = document.querySelectorAll('.films-grid, .reels-strip');

    rails.forEach(rail => {
        if (rail.dataset.scrollInited) return;
        rail.dataset.scrollInited = "true";

        // 1. Mouse Wheel Scroll (Vertical to Horizontal)
        rail.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                // Only intercept if we have actual horizontal overflow
                if (rail.scrollWidth > rail.clientWidth) {
                    e.preventDefault();
                    // Direct movement vs smooth-scroll calculation
                    rail.scrollLeft += e.deltaY * 1.2;
                }
            }
        }, { passive: false });

        // 2. Pro Drag‑to‑scroll (Professional Touch)
        let isDown = false;
        let startX;
        let scrollLeftPos;

        rail.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Left click only
            isDown = true;
            rail.style.cursor = 'grabbing';
            startX = e.pageX - rail.offsetLeft;
            scrollLeftPos = rail.scrollLeft;
            e.preventDefault();
        });

        const stopDragging = () => {
            isDown = false;
            rail.style.cursor = 'pointer';
        };

        rail.addEventListener('mouseleave', stopDragging);
        rail.addEventListener('mouseup', stopDragging);

        rail.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - rail.offsetLeft;
            const walk = (x - startX) * 1.5; // Drag speed
            rail.scrollLeft = scrollLeftPos - walk;
        });
    });
}
// Final Close Listener
document.addEventListener('click', function (e) {
    if (e.target.classList && e.target.classList.contains('close-flipbook')) {
        closeFlipbook();
    }
    if (e.target.id === 'flipbookModal') {
        closeFlipbook();
    }
});

let isSelectionMode = false;
let selectedGuestItems = [];

function toggleConciergeMode(activate) {
    isSelectionMode = activate;
    document.body.classList.toggle('selection-mode-active', activate);

    let actionBar = document.getElementById('guestActionBar');
    if (activate) {
        if (!actionBar) {
            actionBar = document.createElement('div');
            actionBar.id = 'guestActionBar';
            actionBar.className = 'guest-action-bar visible';
            actionBar.style.zIndex = '2147483647';
            actionBar.innerHTML = `
            <div class="guest-action-text"><span id="guestSelCount">0</span> Memories Selected</div>
            <div class="flex gap-4" style="display:flex; gap:15px; align-items:center;">
                <button class="generate-pass-btn" onclick="finalizeGuestSelection()">CREATE GUEST PASS ✦</button>
                <button onclick="toggleConciergeMode(false)" style="background:transparent; border:1px solid rgba(255,255,255,0.3); color:#fff; padding:8px 20px; border-radius:30px; cursor:pointer;">CANCEL</button>
            </div>
        `;
            document.body.appendChild(actionBar);
        }
        document.querySelectorAll('.n-card, .album-stack-card').forEach(card => {
            card.classList.remove('selected-for-guest');
        });
        selectedGuestItems = [];
        updateSelectionCount();
    } else {
        document.querySelectorAll('.n-card, .album-stack-card').forEach(card => {
            card.classList.remove('selected-for-guest');
        });
        selectedGuestItems = [];
        if (actionBar) actionBar.remove();
    }
}

function updateSelectionCount() {
    const selected = document.querySelectorAll('.n-card.selected-for-guest, .album-stack-card.selected-for-guest');
    const countEl = document.getElementById('guestSelCount');
    if (countEl) countEl.innerText = selected.length;

    selectedGuestItems = Array.from(selected).map(card => ({
        type: card.dataset.type,
        id: card.dataset.url,
        title: card.dataset.title,
        thumb: card.dataset.thumb
    }));
}

async function finalizeGuestSelection() {
    console.log('📦 selectedGuestItems length:', selectedGuestItems.length);
    console.log('📦 selectedGuestItems content:', JSON.parse(JSON.stringify(selectedGuestItems)));
    if (selectedGuestItems.length === 0) {
        alert("Please select at least one memory first!");
        return;
    }
    // Filter out any item with missing id
    const validItems = selectedGuestItems.filter(item => item.id && item.id !== 'undefined');
    if (validItems.length === 0) {
        alert("Selected items are invalid (missing URL). Please try selecting again.");
        return;
    }
    if (validItems.length !== selectedGuestItems.length) {
        console.warn('Removed invalid items:', selectedGuestItems.filter(item => !item.id || item.id === 'undefined'));
    }
    await generateGuestLinkAndShareMulti(validItems);
    toggleConciergeMode(false);
}

async function generateGuestLinkAndShareMulti(selectedItems) {
    const token = localStorage.getItem('clientToken');
    if (!token) { alert("Please login again to share."); return; }

    const validItems = selectedItems.filter(item => item.id && item.id !== 'undefined');
    if (validItems.length === 0) {
        alert("No valid items to share.");
        return;
    }

    console.log('🔍 Sending JSON:', validItems);

    try {
        const res = await fetch(`${API_URL}/api/share/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selected_items: validItems })
        });

        const data = await res.json();
        if (res.ok && data.guest_url) {
            const count = validItems.length;
            const safeGuestUrl = sanitizeUrl(data.guest_url);
            const clientDisplayName = window.clientName || 'Our beloved couple';

            const firstItem = validItems[0];
            const isSingleInvitation = count === 1 && firstItem.type === 'invitation';

            if (isSingleInvitation) {
                // 🌟 BEAUTIFUL MESSAGE WITH LINK
                const msg = `✨ *${clientDisplayName}* cordially invite you! ✨\n\n` +
                    `We request the pleasure of your company at our wedding celebration.\n\n` +
                    `👇 *Tap the link below to view the Digital Invitation:*\n` +
                    `${safeGuestUrl}\n\n` +
                    `_With love, ${clientDisplayName}_\n` +
                    `_Crafted by Vinayak Studio_`;

                // 🖼️ Generate or fetch the invitation image
                let imageBlob;
                try {
                    if (window.clientShareCard) {
                        const r = await fetch(window.clientShareCard);
                        imageBlob = await r.blob();
                    } else {
                        const thumbUrlToUse = firstItem.thumb || undefined;
                        imageBlob = await generateCanvasShareCard(clientDisplayName, thumbUrlToUse);
                    }
                } catch (err) {
                    console.warn("Image generation failed, fallback to text only", err);
                    imageBlob = null;
                }

                const fileName = `${clientDisplayName.replace(/\s+/g, '_')}_Invitation.jpg`;
                const file = imageBlob ? new File([imageBlob], fileName, { type: "image/jpeg" }) : null;

                // 📱 Mobile: Use Web Share API (image + text)
                if (navigator.share && navigator.canShare && file && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Wedding Invitation',
                            text: msg.replace(/\*/g, '') // remove markdown for plain text
                        });
                        return; // Success, nothing else needed
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            console.warn("Web Share failed, fallback to WhatsApp Web", err);
                        } else {
                            return; // User cancelled
                        }
                    }
                }

                // 💻 Desktop / Fallback: Open WhatsApp Web + Download Image
                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');

                if (file) {
                    // Auto-download image with instructions
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(imageBlob);
                    link.download = fileName;
                    link.click();

                    // Show friendly toast/alert
                    alert(`✨ VIP Link Created!\n\n` +
                        `📌 *NEXT STEP:*\n` +
                        `1. WhatsApp Web khul gaya hoga.\n` +
                        `2. "Attachment" (📎) icon click karein.\n` +
                        `3. Abhi download hui *${fileName}* image select karein.\n` +
                        `4. Send karein! ❤️`);
                } else {
                    // If image failed, just open WhatsApp
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                }
            } else {
                // Multiple items / media vault message
                const contentLabel = count === 1
                    ? (firstItem.title && firstItem.title !== 'undefined' ? firstItem.title : 'A precious memory from our celebration')
                    : `${count} exclusive media items`;

                const whatsappMsg =
                    `🔐 *VIP ACCESS GRANTED* 🔐\n\n` +
                    `*${clientDisplayName}* have shared exclusive data from their private media vault.\n\n` +
                    `📁 *Contents:* ${contentLabel}\n\n` +
                    `Tap below to securely access the high-res gallery & core films:\n` +
                    `👇\n${safeGuestUrl}\n\n` +
                    `_Hosted on Vinayak Studio Private Server Engine_`;

                window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
            }
        } else {
            console.error('Backend error:', data);
            alert("Failed to generate curated pass. Check console for details.");
        }
    } catch (err) {
        console.error('Fetch error:', err);
        alert("Error generating curated link.");
    }
}

// 🚫 PDF SHARE CARD GENERATOR REMOVED in favor of Direct Image Sharing

/**
 * 🚪 Guest Lounge Exit Logic
 * Removes the guest session and redirects to the main website
 */


function exitGuestLounge() {
    // 📸 AI Camera visibility is now handled by CSS (automatic on page exit)
    window.location.replace(window.location.origin);
}

window.addEventListener('popstate', function () {
    const videoModal = document.getElementById('videoModal');
    const isVideoOpen = videoModal && videoModal.style.display === 'flex';
    const imgLightbox = document.getElementById('imgLB');
    const isImgOpen = imgLightbox && imgLightbox.style.display === 'flex';
    const folderModal = document.getElementById('folderGalleryModal');
    const isFolderOpen = folderModal && folderModal.style.display === 'flex';
    const flipbookModal = document.getElementById('flipbookModal');
    const isFlipbookOpen = flipbookModal && flipbookModal.style.display === 'flex';

    // Pehle koi modal open ho to use close karo
    if (isVideoOpen) {
        closeVideoModal();
        history.pushState(null, null, location.href);
    }
    else if (isImgOpen) {
        closeImgLB();
        history.pushState(null, null, location.href);
    }
    else if (isFolderOpen) {
        closeFolderGallery();
        history.pushState(null, null, location.href);
    }
    else if (isFlipbookOpen) {
        closeFlipbook();
        history.pushState(null, null, location.href);
    }
    // Agar koi modal nahi hai aur guest mode active hai to main website par jao
    else if (document.body.classList.contains('is-vip-guest')) {
        // Current history entry ko main website se replace kar do
        window.location.replace(window.location.origin);
    }
});


// =====================================================
// 📸 AI CAMERA ENGINE — v3.0 (Full Luxury + Bug-Free)
// =====================================================
let currentStream = null;
let facingMode = 'user';

// ── BUG #5: Multi-angle state ──
const AI_CAPTURE_STEPS = [
    { label: 'LOOK STRAIGHT', icon: '⬆' },
    { label: 'TURN LEFT', icon: '◀' },
    { label: 'TURN RIGHT', icon: '▶' },
    { label: 'TILT UP', icon: '↑' },
    { label: 'TILT DOWN', icon: '↓' }
];
let _aiCaptureStep = 0;
let _aiCapturedBlobs = [];

async function openAICamera() {
    const modal = document.getElementById('aiCameraModal');
    const video = document.getElementById('aiCameraVideo');
    const switchBtn = document.getElementById('switchCameraBtn');

    // Reset multi-angle state
    _aiCaptureStep = 0;
    _aiCapturedBlobs = [];

    // Reset UI panels
    document.getElementById('aiResultsContainer').style.display = 'none';
    document.getElementById('aiSearchLoader').style.display = 'none';
    document.getElementById('aiPendingContainer').style.display = 'none';
    document.querySelector('.ai-camera-preview-wrapper').style.display = 'block';
    document.querySelector('.ai-camera-controls').style.display = 'flex';
    const guestFields = document.querySelector('.ai-guest-fields');
    if (guestFields) guestFields.style.display = 'block';

    // Inject step progress bar & direction guide (once)
    _injectMultiAngleUI();

    modal.style.display = 'flex';

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (switchBtn) switchBtn.style.display = isMobile ? 'block' : 'none';

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        video.srcObject = currentStream;
    } catch (err) {
        showVSToast('📷 Camera access denied. Please allow permissions.');
        closeAICamera();
    }
}

function _injectMultiAngleUI() {
    const previewWrapper = document.querySelector('.ai-camera-preview-wrapper');
    if (!previewWrapper) return;

    // Inject animated SVG scanner ring
    if (!document.getElementById('aiScannerSvg')) {
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.id = 'aiScannerSvg';
        svg.classList.add('ai-scanner-svg');
        svg.setAttribute('viewBox', '0 0 220 220');
        const defs = document.createElementNS(svgNS, 'defs');
        defs.innerHTML = `<linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#c5a059;stop-opacity:1"/>
            <stop offset="100%" style="stop-color:#f5d792;stop-opacity:1"/>
        </linearGradient>`;
        svg.appendChild(defs);
        const track = document.createElementNS(svgNS, 'circle');
        track.setAttribute('cx', '110'); track.setAttribute('cy', '110'); track.setAttribute('r', '100');
        track.classList.add('ai-scanner-ring-track');
        svg.appendChild(track);
        const arc = document.createElementNS(svgNS, 'circle');
        arc.id = 'aiScannerArc';
        arc.setAttribute('cx', '110'); arc.setAttribute('cy', '110'); arc.setAttribute('r', '100');
        arc.classList.add('ai-scanner-ring-arc');
        svg.appendChild(arc);
        previewWrapper.appendChild(svg);
    }

    // Inject direction guide overlay
    if (!document.getElementById('aiDirectionGuide')) {
        const guide = document.createElement('div');
        guide.id = 'aiDirectionGuide';
        guide.className = 'ai-direction-guide';
        guide.textContent = AI_CAPTURE_STEPS[0].label;
        previewWrapper.appendChild(guide);
    } else {
        document.getElementById('aiDirectionGuide').textContent = AI_CAPTURE_STEPS[0].label;
    }

    // Inject step progress bar (above camera controls)
    if (!document.getElementById('aiCaptureStepsBar')) {
        const bar = document.createElement('div');
        bar.id = 'aiCaptureStepsBar';
        bar.className = 'ai-capture-steps';
        AI_CAPTURE_STEPS.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.className = 'ai-capture-step' + (i === 0 ? ' active' : '');
            dot.id = `aiCaptureStepDot${i}`;
            bar.appendChild(dot);
        });
        const controls = document.querySelector('.ai-camera-controls');
        if (controls) controls.parentNode.insertBefore(bar, controls);
    } else {
        document.querySelectorAll('.ai-capture-step').forEach((el, i) => {
            el.className = 'ai-capture-step' + (i === 0 ? ' active' : '');
        });
    }
}

function closeAICamera() {
    const modal = document.getElementById('aiCameraModal');
    if (modal) modal.style.display = 'none';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    _aiCaptureStep = 0;
    _aiCapturedBlobs = [];
}

function switchCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    openAICamera();
}

async function captureAndSearch() {
    const video = document.getElementById('aiCameraVideo');
    const canvas = document.getElementById('aiCameraCanvas');
    const loader = document.getElementById('aiSearchLoader');
    const controls = document.querySelector('.ai-camera-controls');
    const preview = document.querySelector('.ai-camera-preview-wrapper');
    const guestFields = document.querySelector('.ai-guest-fields');
    const captureBtn = document.querySelector('.ai-capture-btn');

    // ── Capture current frame ──
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    _aiCapturedBlobs.push(blob);

    // ── Flash effect ──
    const flash = document.createElement('div');
    flash.className = 'ai-capture-flash';
    preview.appendChild(flash);
    setTimeout(() => flash.remove(), 500);

    // ── Update step progress ──
    const stepDot = document.getElementById(`aiCaptureStepDot${_aiCaptureStep}`);
    if (stepDot) { stepDot.classList.remove('active'); stepDot.classList.add('done'); }

    _aiCaptureStep++;

    // ── More steps? ──
    if (_aiCaptureStep < AI_CAPTURE_STEPS.length) {
        const nextStep = AI_CAPTURE_STEPS[_aiCaptureStep];
        const guide = document.getElementById('aiDirectionGuide');
        if (guide) { guide.style.opacity = '0'; setTimeout(() => { guide.textContent = nextStep.label; guide.style.opacity = '1'; }, 300); }
        const nextDot = document.getElementById(`aiCaptureStepDot${_aiCaptureStep}`);
        if (nextDot) nextDot.classList.add('active');
        if (captureBtn) captureBtn.innerHTML = `<i class="fas fa-camera"></i> Capture ${_aiCaptureStep + 1}/${AI_CAPTURE_STEPS.length}`;
        return; // Wait for next tap
    }

    // ── All 5 captures done → show arc as complete ──
    const arc = document.getElementById('aiScannerArc');
    if (arc) arc.classList.add('complete');

    // ── Get guest info ──
    const guestName = document.getElementById('aiGuestName')?.value.trim() || '';
    const guestPhone = document.getElementById('aiGuestPhone')?.value.trim() || '';
    const clientCodeForSearch = window.clientCode || localStorage.getItem('clientCode') || '';

    // ── Show loader, hide controls ──
    loader.style.display = 'block';
    if (document.getElementById('aiSearchLoader') && document.querySelector('.ai-search-loader p')) {
        document.querySelector('.ai-search-loader p').textContent = 'Scanning your face...';
    }
    controls.style.display = 'none';
    preview.style.display = 'none';
    if (guestFields) guestFields.style.display = 'none';
    const stepsBar = document.getElementById('aiCaptureStepsBar');
    if (stepsBar) stepsBar.style.display = 'none';

    // ── Stop camera ──
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }

    // ── Send ALL captured blobs as multi-part form ──
    const formData = new FormData();
    // Primary image = first (front-facing)
    formData.append('file', _aiCapturedBlobs[0], 'selfie_front.jpg');
    // Additional angles
    _aiCapturedBlobs.slice(1).forEach((b, i) => formData.append('extra_angles', b, `selfie_angle_${i + 1}.jpg`));
    if (clientCodeForSearch) formData.append('client_code', clientCodeForSearch);
    if (guestName) formData.append('guest_name', guestName);
    if (guestPhone) formData.append('guest_phone', guestPhone);

    try {
        const response = await fetch(`${API_URL}/api/search/sync`, {
            method: 'POST', body: formData
        });
        const data = await response.json();
        if (data.pending) {
            showPendingState();
        } else {
            displaySearchResults(data.matches || []);
        }
    } catch (error) {
        console.error('Face search failed:', error);
        showVSToast('❌ Face search failed. Please try again.');
        resetAICamera();
    } finally {
        loader.style.display = 'none';
    }
}

// ── BUG #1 + #2 FIX: displaySearchResults — Large Gallery + Download + Working Lightbox ──
let _aiMatchPhotos = []; // stores matched photo URLs for lightbox

function displaySearchResults(matches) {
    const resultsContainer = document.getElementById('aiResultsContainer');
    const grid = document.getElementById('aiResultsGrid');

    grid.innerHTML = '';
    _aiMatchPhotos = [];

    if (!matches || matches.length === 0) {
        grid.innerHTML = `<div class="ai-no-results">
            <span class="no-results-icon">🔍</span>
            <strong style="color:#c5a059; display:block; margin-bottom:8px;">No matches found yet</strong>
            Photos may still be processing. Please try again shortly!
        </div>`;
        resultsContainer.style.display = 'block';
        return;
    }

    // Build photo URL array for lightbox
    _aiMatchPhotos = matches.map(m => {
        const u = m.url || m.path || '';
        return u.startsWith('http') ? u : (u ? `${API_URL}/api/image/${u}` : '');
    }).filter(Boolean);

    // Show count badge above grid
    const header = resultsContainer.querySelector('h3');
    if (header) {
        header.innerHTML = `Your Magical Moments
            <div class="ai-results-count-badge" style="display:inline-flex; flex-wrap:wrap; align-items:center; gap:12px; margin-left:12px; margin-top:8px;">
                <span><i class="fas fa-images"></i>&nbsp;${_aiMatchPhotos.length} Photos Found</span>
                <button class="ai-download-all-btn" onclick="downloadAllAIMatches()" style="background: linear-gradient(135deg, #c5a059, #e0c283); color: black; border: none; border-radius: 20px; padding: 6px 14px; font-weight: bold; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 10px rgba(197,160,89,0.3); transition: transform 0.2s;">
                    <i class="fas fa-download"></i> Download All
                </button>
            </div>`;
    }

    // Render each photo as a luxury card (BUG #2 FIX)
    _aiMatchPhotos.forEach((imgUrl, cardIdx) => {
        const card = document.createElement('div');
        card.className = 'ai-result-card';

        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = `Memory ${cardIdx + 1}`;
        img.loading = 'lazy';

        // BUG #1 FIX: Open lightbox with CORRECT index into _aiMatchPhotos
        const expandBtn = document.createElement('button');
        expandBtn.className = 'ai-result-expand-btn';
        expandBtn.innerHTML = '<i class="fas fa-expand-alt"></i>';
        expandBtn.title = 'View full size';
        expandBtn.onclick = (e) => {
            e.stopPropagation();
            _openAILightbox(cardIdx);
        };

        // Download button (BUG #2 FIX) - Upgraded to force download
        const fname = imgUrl.split('/').pop().split('?')[0] || `memory_${cardIdx + 1}.jpg`;
        const dlBtn = document.createElement('button');
        dlBtn.className = 'ai-result-download-btn';
        dlBtn.innerHTML = '<i class="fas fa-download"></i>';
        dlBtn.title = 'Download';
        dlBtn.style.cssText = 'position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.6); color:white; padding:8px; border-radius:50%; font-size:12px; cursor:pointer; z-index:2147483647; text-decoration:none; display:flex; justify-content:center; align-items:center; width:30px; height:30px; transition:transform 0.2s; backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.2);';
        dlBtn.onclick = (e) => {
            e.stopPropagation();
            forceDownloadImage(imgUrl, fname);
        };

        card.appendChild(img);
        card.appendChild(expandBtn);
        card.appendChild(dlBtn);

        // Click card to open lightbox
        card.onclick = () => _openAILightbox(cardIdx);
        grid.appendChild(card);
    });

    resultsContainer.style.display = 'block';
}

// Dedicated AI lightbox opener — sets photos array and opens standard lightbox
function _openAILightbox(startIdx) {
    if (!_aiMatchPhotos.length) return;

    // 🔧 BUG FIX: Hide AI Camera Modal so lightbox appears on top
    const aiModal = document.getElementById('aiCameraModal');
    if (aiModal) aiModal.style.display = 'none';

    // Temporarily assign matched photos to global photos array
    const prevPhotos = photos.slice();
    const prevIsSelMode = isSelMode;
    photos = _aiMatchPhotos;
    isSelMode = false; // AI result photos are view-only (no heart selection)
    idx = startIdx;

    const lb = document.getElementById('imgLB');
    if (!lb) return;
    updateImgView();
    lb.style.display = 'flex';
    setTimeout(() => { lb.classList.add('is-active'); resetLightboxIdleTimer(); }, 10);
    document.body.style.overflow = 'hidden';

    // Add download button to lightbox if not already there
    _injectLightboxDownloadBtn(prevPhotos, prevIsSelMode);
}

function _injectLightboxDownloadBtn(prevPhotos, prevIsSelMode) {
    let dlBtn = document.getElementById('lbDownloadBtn');
    if (!dlBtn) {
        dlBtn = document.createElement('a');
        dlBtn.id = 'lbDownloadBtn';
        dlBtn.innerHTML = '<i class="fas fa-download"></i> Download';
        dlBtn.style.cssText = `
            position:absolute; bottom:20px; right:20px; z-index:2147483647;
            background:linear-gradient(135deg,#c5a059,#e0c283); color:#000;
            padding:9px 18px; border-radius:30px; font-family:'Montserrat',sans-serif;
            font-size:0.75rem; font-weight:700; letter-spacing:1px;
            text-decoration:none; display:flex; align-items:center; gap:7px;
            box-shadow:0 4px 15px rgba(0,0,0,0.4); cursor:pointer;
            transition:transform 0.2s ease,box-shadow 0.2s ease;
        `;
        dlBtn.onmouseover = () => { dlBtn.style.transform = 'translateY(-2px)'; dlBtn.style.boxShadow = '0 8px 25px rgba(0,0,0,0.5)'; };
        dlBtn.onmouseout = () => { dlBtn.style.transform = ''; dlBtn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)'; };
        dlBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            // 🔧 BUG FIX: Always read current photo from global state at click time
            const currentUrl = photos[idx];
            if (currentUrl) {
                const fname = currentUrl.split('/').pop().split('?')[0] || 'memory.jpg';
                forceDownloadImage(currentUrl, fname);
            }
        };
        const lbContent = document.querySelector('.lightbox-content');
        if (lbContent) lbContent.appendChild(dlBtn);
    }

    // Update download href on every photo change — hook into changePhoto
    function syncDownload() {
        const currentUrl = photos[idx];
        if (currentUrl && dlBtn) {
            // We use onclick instead of href to force download via JS blob
            dlBtn.dataset.url = currentUrl;
        }
    }
    syncDownload();

    // Patch closeImgLB to restore photos and remove download button
    const _origCloseImgLB = window._origCloseImgLBSet ? closeImgLB : closeImgLB;
    if (!window._origCloseImgLBSet) {
        window._origCloseImgLBSet = true;
        const _realClose = closeImgLB;
        window._patchedCloseForAI = function () {
            // Restore previous photos if AI lightbox was open
            if (document.getElementById('lbDownloadBtn')) {
                photos = prevPhotos;
                isSelMode = prevIsSelMode;
                const btn = document.getElementById('lbDownloadBtn');
                if (btn) btn.remove();
                window._origCloseImgLBSet = false;
            }
            _realClose();
        };
        // Override the close button to use patched version
        const closeSpan = document.querySelector('#imgLB .close-lb');
        if (closeSpan) closeSpan.onclick = (e) => { e.stopPropagation(); window._patchedCloseForAI(); };
        const lb = document.getElementById('imgLB');
        if (lb) lb.onclick = () => window._patchedCloseForAI();
    }

    // Also sync on arrow navigation (patch changePhoto temporarily)
    const _addSyncListener = () => {
        document.addEventListener('keydown', function syncDlOnKey(e) {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setTimeout(syncDownload, 160);
            if (e.key === 'Escape') document.removeEventListener('keydown', syncDlOnKey);
        });
        document.querySelector('.lb-prev')?.addEventListener('click', () => setTimeout(syncDownload, 160));
        document.querySelector('.lb-next')?.addEventListener('click', () => setTimeout(syncDownload, 160));
    };
    _addSyncListener();
}

function showPendingState() {
    document.getElementById('aiResultsContainer').style.display = 'none';
    document.getElementById('aiPendingContainer').style.display = 'block';
}

function resetAICamera() {
    document.getElementById('aiResultsContainer').style.display = 'none';
    document.getElementById('aiPendingContainer').style.display = 'none';
    const stepsBar = document.getElementById('aiCaptureStepsBar');
    if (stepsBar) stepsBar.remove();
    const guide = document.getElementById('aiDirectionGuide');
    if (guide) guide.remove();
    const svgRing = document.getElementById('aiScannerSvg');
    if (svgRing) svgRing.remove();
    openAICamera();
}

// Mobile-friendly force download (Synchronous to bypass Safari popup blockers)
function forceDownloadImage(url, fname) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fname;
    a.target = '_blank'; // Failsafe for CORS / iOS Safari
    
    // Crucial: Append, click, and clean up synchronously
    // This allows the browser to maintain the user's "gesture chain"
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
    }, 100);
}

// Download all AI matched photos robustly via loop + Smart Sync to prevent duplicates
async function downloadAllAIMatches(forceAll = false) {
    if (!_aiMatchPhotos || _aiMatchPhotos.length === 0) return;
    
    // SMART SYNC: Check local storage for previously downloaded photos
    let downloadedPhotos = [];
    try {
        downloadedPhotos = JSON.parse(localStorage.getItem('vs_downloaded_ai') || '[]');
    } catch(e) {}
    
    const newPhotos = forceAll ? _aiMatchPhotos : _aiMatchPhotos.filter(url => !downloadedPhotos.includes(url));
    
    if (newPhotos.length === 0 && !forceAll) {
        const toast = document.createElement('div');
        toast.className = 'vs-toast';
        toast.innerHTML = `All photos already downloaded! <button onclick="downloadAllAIMatches(true); this.parentNode.remove()" style="margin-left:10px; padding:6px 12px; background:white; color:black; border:none; border-radius:12px; cursor:pointer; font-weight:bold;">Download Anyway</button>`;
        toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.9); color:#c5a059; padding:12px 20px; border-radius:30px; font-weight:bold; z-index:2147483647; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-family:"Montserrat", sans-serif; font-size:12px; border:1px solid #c5a059; display:flex; align-items:center; gap:8px;';
        document.body.appendChild(toast);
        setTimeout(() => { if (toast && toast.parentNode) toast.parentNode.removeChild(toast); }, 8000);
        return;
    }
    
    // Using simple toast inside the public guest space
    const toast = document.createElement('div');
    toast.className = 'vs-toast';
    toast.innerHTML = `Downloading 1 of ${newPhotos.length}...`;
    toast.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.9); color:white; padding:12px 20px; border-radius:30px; font-weight:bold; z-index:2147483647; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5); font-family:"Montserrat", sans-serif; font-size:12px; border:1px solid #c5a059; min-width:200px; transition:all 0.2s;';
    document.body.appendChild(toast);
    
    let downloadedCount = 0;
    for (let i = 0; i < newPhotos.length; i++) {
        const url = newPhotos[i];
        const fname = url.split('/').pop().split('?')[0] || `vinayak_memory_${Date.now()}_${i + 1}.jpg`;
        
        toast.innerHTML = `Downloading ${i + 1} of ${newPhotos.length}...`;

        try {
            // Use fetch and blob for "Download All" to bundle them cleanly without 50 tabs
            const response = await fetch(url);
            if (!response.ok) throw new Error('CORS or Network Error');
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = fname;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
            
            // Track downloaded
            if (!downloadedPhotos.includes(url)) downloadedPhotos.push(url);
            localStorage.setItem('vs_downloaded_ai', JSON.stringify(downloadedPhotos));
            downloadedCount++;
            
            // Wait slightly between downloads to prevent hanging the browser
            await new Promise(r => setTimeout(r, 400));
        } catch (e) {
            console.error('Download All batch failed for', url, e);
            // Fallback for CORS blocks during fetch: Force open silently (might get blocked by strict popups)
            window.open(url, '_blank');
            await new Promise(r => setTimeout(r, 600));
        }
    }

    toast.innerHTML = `✅ Successfully downloaded ${downloadedCount} photos!`;
    setTimeout(() => { if (toast && toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
}

// Attach to global scope
window.openAICamera = openAICamera;
window.closeAICamera = closeAICamera;
window.switchCamera = switchCamera;
window.captureAndSearch = captureAndSearch;
window.resetAICamera = resetAICamera;
window.downloadAllAIMatches = downloadAllAIMatches;
window.forceDownloadImage = forceDownloadImage;
