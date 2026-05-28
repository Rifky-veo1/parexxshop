/**
 * Main Client-Side Controller (c:\xampp\htdocs\api 3\app.js)
 * Manages the application lifecycle, dynamic catalog rendering, search,
 * dynamic theme/skin swappers, WebGL interaction hookups, and GSAP overlays.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  let catalogGames = [];
  let filteredGames = [];
  let activeSkin = 'kof';

  // DOM Elements
  const appHeader = document.getElementById('appHeader');
  const catalogGrid = document.getElementById('catalogGrid');
  const gameSearch = document.getElementById('gameSearch');
  const catalogCount = document.getElementById('catalogCount');
  
  // Modal Elements
  const checkoutModal = document.getElementById('checkoutModal');
  const modalClose = document.getElementById('modalClose');
  const modalBody = document.getElementById('modalBody');

  // Gusion Skin Buttons & Overlays
  const skinButtons = document.querySelectorAll('.skin-btn');
  const skinImages = document.querySelectorAll('.gusion-img');

  // Skin description templates to update hero banners contextually
  const HERO_DESCRIPTIONS = {
    default: "Cari game favorit Anda dan lakukan top-up voucher, kredit game, atau diamond langsung melalui gateway aman Codashop Indonesia yang disinkronisasikan secara real-time.",
    cosmic: "Keluarkan kekuatan kosmik tak terbatas! Portal PAREXX SHOP diselimuti energi magis 'Cosmic Gleam' legendaris. Dapatkan penawaran top-up terbaik di alam semesta.",
    kof: "Rasakan ledakan api vulkanik membara! Tema King of Fighters K' diaktifkan. Kecepatan transaksi secepat tebasan daggers berapi Gusion siap melayani Anda."
  };

  const HERO_TAGLINES = {
    default: "<i class=\"fa-solid fa-bolt\"></i> Live Scraper API Online",
    cosmic: "<i class=\"fa-solid fa-moon\"></i> Cosmic Theme Activated",
    kof: "<i class=\"fa-solid fa-fire\"></i> Volcanic Theme Activated"
  };

  // ==========================================================================
  // SCROLL EFFECTS & NAVBAR GRAPHICS
  // ==========================================================================
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      appHeader.classList.add('scrolled');
    } else {
      appHeader.classList.remove('scrolled');
    }
  });

  // ==========================================================================
  // DYNAMIC 3D MOUSE PARALLAX ON GUSION INTERACTIVE GRAPHICS
  // ==========================================================================
  document.addEventListener('mousemove', (e) => {
    const depthX = (e.clientX - window.innerWidth / 2) * 0.04;
    const depthY = (e.clientY - window.innerHeight / 2) * 0.04;
    const rotateY = (e.clientX - window.innerWidth / 2) * 0.015;

    // Fluid luxury skew utilizing GSAP animation
    if (typeof gsap !== 'undefined') {
      gsap.to('#gusionParallax', {
        x: -depthX,
        y: -depthY,
        rotateY: rotateY,
        duration: 0.8,
        ease: 'power2.out'
      });
    } else {
      // Fallback: direct CSS change
      const el = document.getElementById('gusionParallax');
      if (el) {
        el.style.transform = `translate3d(${-depthX}px, ${-depthY}px, 0) rotateY(${rotateY}deg)`;
      }
    }
  });

  // ==========================================================================
  // SKIN THEME SWAPPER CONTROLLER
  // ==========================================================================
  skinButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedSkin = btn.getAttribute('data-skin');
      if (selectedSkin === activeSkin) return;

      // 1. Update active button classes
      skinButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 2. Swivel body classes to trigger CSS custom variables transitions
      document.body.className = `skin-${selectedSkin}`;

      // 3. Fade out old Gusion image and crossfade the new skin
      const oldImg = document.getElementById(`skin-img-${activeSkin}`);
      const newImg = document.getElementById(`skin-img-${selectedSkin}`);

      if (oldImg && newImg) {
        if (typeof gsap !== 'undefined') {
          gsap.to(oldImg, {
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            ease: 'power2.inOut',
            onComplete: () => oldImg.classList.remove('active')
          });

          newImg.classList.add('active');
          gsap.fromTo(newImg, 
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }
          );
        } else {
          oldImg.classList.remove('active');
          newImg.classList.add('active');
          oldImg.style.opacity = '0';
          newImg.style.opacity = '1';
        }
      }

      // 4. Update Three.js 3D WebGL particle colors
      if (typeof updateThreeTheme === 'function') {
        updateThreeTheme(selectedSkin);
      }

      // 5. Contextual hero text update for premium immersion
      const taglineBadge = document.getElementById('tagline-badge');
      const mainDescription = document.getElementById('main-description');
      const mainTitle = document.getElementById('main-title');

      if (taglineBadge) {
        taglineBadge.innerHTML = HERO_TAGLINES[selectedSkin];
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(taglineBadge, { scale: 0.9, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.4 });
        }
      }

      if (mainDescription) {
        mainDescription.textContent = HERO_DESCRIPTIONS[selectedSkin];
        if (typeof gsap !== 'undefined') {
          gsap.fromTo(mainDescription, { opacity: 0.4, y: 10 }, { opacity: 1, y: 0, duration: 0.6 });
        }
      }

      // Record active skin state
      activeSkin = selectedSkin;
    });
  });

  // ==========================================================================
  // FETCH & PARSE INTEGRATION WITH API.PHP
  // ==========================================================================
  async function fetchCatalog() {
    try {
      const response = await fetch('api.php');
      if (!response.ok) {
        throw new Error("Proxy API returned error response.");
      }

      const result = await response.json();
      catalogGames = result.data || [];
      filteredGames = [...catalogGames];

      // Render the catalog items
      renderCatalog(filteredGames);

    } catch (err) {
      console.error("Failed to load catalog data:", err);
      renderErrorState();
    }
  }

  function renderCatalog(games) {
    // Clear grid
    catalogGrid.innerHTML = '';
    
    // Update stats counter
    catalogCount.textContent = games.length;

    if (games.length === 0) {
      renderEmptyState();
      return;
    }

    games.forEach((game, idx) => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="card-banner">
          <img src="${game.image}" alt="${game.title} Logo" loading="lazy" onerror="this.src='https://cdn1.codashop.com/S/content/mobile/images/product-tiles/MLBB-2025-tiles-178x178.jpg'">
        </div>
        <h3 class="card-title">${game.title}</h3>
        <button class="card-btn">Top-Up</button>
      `;

      // Trigger Checkout popup modal on click
      card.addEventListener('click', () => openCheckoutModal(game));

      catalogGrid.appendChild(card);

      // Smooth cascading entry animation for cards using GSAP
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(card, 
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, delay: Math.min(idx * 0.03, 0.6), ease: 'power2.out' }
        );
      } else {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }
    });
  }

  // ==========================================================================
  // SEARCH & FILTER LOGIC
  // ==========================================================================
  gameSearch.addEventListener('input', () => {
    const query = gameSearch.value.toLowerCase().trim();
    
    filteredGames = catalogGames.filter(game => 
      game.title.toLowerCase().includes(query) || 
      game.slug.toLowerCase().includes(query)
    );

    renderCatalog(filteredGames);
  });

  // ==========================================================================
  // EMPTY & ERROR STATES RENDERERS
  // ==========================================================================
  function renderEmptyState() {
    catalogGrid.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-face-frown"></i>
        <h3>Game Tidak Ditemukan</h3>
        <p>Maaf, kami tidak dapat menemukan game atau voucher dengan kata kunci tersebut.</p>
        <p style="font-size:0.85rem; margin-top:10px;">Coba ketik kata kunci lain (misalnya: "Mobile Legends" atau "Genshin").</p>
      </div>
    `;
  }

  function renderErrorState() {
    catalogGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; max-width: 600px; margin: 0 auto;">
        <i class="fa-solid fa-triangle-exclamation" style="color: var(--primary);"></i>
        <h3>Koneksi API Gagal</h3>
        <p>Gagal memuat katalog dari server Codashop. Mohon periksa apakah server Apache XAMPP Anda aktif dan file api.php berjalan dengan benar.</p>
        <button class="btn btn-secondary" id="retryFetchBtn" style="margin-top:20px; font-size:0.8rem; padding:10px 20px;">
          <i class="fa-solid fa-rotate-right"></i> Coba Lagi
        </button>
      </div>
    `;

    document.getElementById('retryFetchBtn')?.addEventListener('click', () => {
      catalogGrid.innerHTML = `
        <div class="shimmer-card"><div class="shimmer-banner"></div><div class="shimmer-line"></div><div class="shimmer-line short"></div><div class="shimmer-btn"></div></div>
        <div class="shimmer-card"><div class="shimmer-banner"></div><div class="shimmer-line"></div><div class="shimmer-line short"></div><div class="shimmer-btn"></div></div>
        <div class="shimmer-card"><div class="shimmer-banner"></div><div class="shimmer-line"></div><div class="shimmer-line short"></div><div class="shimmer-btn"></div></div>
      `;
      fetchCatalog();
    });
  }

  // ==========================================================================
  // DETAILED MODAL GENERATION & ENGINE
  // ==========================================================================
  
  // Custom hash seed based on game slug to generate robust dynamic stats
  function getHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }

  function generateGameDetails(game) {
    const seed = getHashCode(game.slug);
    
    // Generate active players statistic (range 20K - 1M)
    const activePlayers = ((seed % 98) + 2) * 10000;
    
    // Generate mock safety rating (range 4.6 - 4.9)
    const rating = (4.5 + ((seed % 5) / 10)).toFixed(1);

    // Generate custom descriptions based on game genres
    let genre = "Kredit & Voucher Game";
    let desc = `Lakukan isi ulang kredit, diamond, atau voucher ${game.title} dengan mudah, cepat, dan aman hanya di Codashop. Tanpa registrasi akun!`;

    const titleLower = game.title.toLowerCase();
    if (titleLower.includes('legend') || titleLower.includes('mlbb')) {
      genre = "MOBA / Strategy";
      desc = "Beli Diamond Mobile Legends: Bang Bang secara instan dalam hitungan detik! Cukup masukkan User ID dan Zone ID Anda, pilih jumlah Diamond yang diinginkan, selesaikan pembayaran, dan Diamond akan langsung dikirimkan ke akun MLBB Anda.";
    } else if (titleLower.includes('fire') || titleLower.includes('pubg') || titleLower.includes('valorant') || titleLower.includes('point blank') || titleLower.includes('codm') || titleLower.includes('call of duty')) {
      genre = "FPS / Battle Royale";
      desc = `Dapatkan Diamond, UC, Points, atau Cash untuk game shooter terpopuler ${game.title} sekarang juga. Isi ID akun Anda, pilih metode pembayaran lokal terpercaya, dan selesaikan transaksi dengan instan tanpa delay.`;
    } else if (titleLower.includes('genshin') || titleLower.includes('star rail') || titleLower.includes('impact') || titleLower.includes('zenless')) {
      genre = "Action RPG / Anime";
      desc = `Lakukan top-up Genesis Crystals atau Oneiric Shards untuk ${game.title} dengan cepat. Cukup isi UID Anda beserta regional server, pilih nominal crystals, dan nikmati petualangan tak terbatas Anda dengan karakter premium baru!`;
    }

    return {
      genre,
      desc,
      activePlayers: activePlayers.toLocaleString('id-ID'),
      rating
    };
  }

  function openCheckoutModal(game) {
    const details = generateGameDetails(game);

    // Populate checkout modal HTML dynamically
    modalBody.innerHTML = `
      <div class="modal-product-identity">
        <div class="modal-logo">
          <img src="${game.image}" alt="${game.title} Logo">
        </div>
        <div class="modal-meta-desc">
          <span>${details.genre}</span>
          <h2 class="modal-title">${game.title}</h2>
        </div>
      </div>

      <div class="modal-desc-box">
        <h4>Deskripsi Layanan</h4>
        <p>${details.desc}</p>
      </div>

      <div class="modal-stats-grid">
        <div class="modal-stat-card">
          <div class="modal-stat-label">Keamanan</div>
          <div class="modal-stat-value"><i class="fa-solid fa-shield-halved"></i> 100% Aman</div>
        </div>
        <div class="modal-stat-card">
          <div class="modal-stat-label">Rating Pengguna</div>
          <div class="modal-stat-value"><i class="fa-solid fa-star"></i> ${details.rating} / 5.0</div>
        </div>
        <div class="modal-stat-card">
          <div class="modal-stat-label">Aktif Transaksi</div>
          <div class="modal-stat-value"><i class="fa-solid fa-bolt"></i> ${details.activePlayers}</div>
        </div>
      </div>

      <div class="modal-action-row">
        <button class="btn btn-primary" id="btn-modal-topup" data-url="${game.url}">
          <i class="fa-solid fa-cart-shopping"></i> Top-Up Sekarang
        </button>
        <button class="btn btn-secondary" id="btn-modal-close">
          Kembali
        </button>
      </div>
    `;

    // Connect top-up button redirect event
    document.getElementById('btn-modal-topup').addEventListener('click', (e) => {
      const checkoutUrl = e.currentTarget.getAttribute('data-url');
      if (checkoutUrl) {
        window.open(checkoutUrl, '_blank');
      }
    });

    // Connect back/cancel button event
    document.getElementById('btn-modal-close').addEventListener('click', closeCheckoutModal);

    // Open Modal Overlay with GSAP Animation
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock scrolling
  }

  function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scrolling
    
    // Clear content after animation completes
    setTimeout(() => {
      modalBody.innerHTML = '';
    }, 400);
  }

  // Bind close buttons events
  modalClose.addEventListener('click', closeCheckoutModal);
  
  // Close modal when clicking backdrop mask overlay
  checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      closeCheckoutModal();
    }
  });

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && checkoutModal.classList.contains('active')) {
      closeCheckoutModal();
    }
  });

  // ==========================================================================
  // INITIALIZE APP
  // ==========================================================================
  fetchCatalog();
});
