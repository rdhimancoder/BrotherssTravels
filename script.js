document.addEventListener('DOMContentLoaded', () => {
  const capsuleBtns = document.querySelectorAll('.bt-capsule-btn');
  const cardCols = document.querySelectorAll('.card-item-col');

  capsuleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 1. Update active states on buttons
      capsuleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedLocation = btn.getAttribute('data-location');

      // 2. Filter cards based on selected location
      cardCols.forEach(col => {
        const cardLocation = col.getAttribute('data-location');

        if (selectedLocation === 'all' || cardLocation === selectedLocation) {
          col.classList.remove('d-none');
          setTimeout(() => {
            col.style.opacity = '1';
            col.style.transform = 'translateY(0)';
          }, 10);
        } else {
          col.style.opacity = '0';
          col.style.transform = 'translateY(10px)';
          col.classList.add('d-none');
        }
      });
    });
  });
});
function handleInquirySubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('visitorName').value;
    const phone = document.getElementById('visitorPhone').value;
    const destination = document.getElementById('tourDestination').value;

    // Show a polite confirmation feedback
    alert(`Thank you ${name}! Your inquiry for ${destination} has been received. Our hill desk (+91 98160 24890) will reach out to ${phone} shortly.`);

  }
/* ==========================================================================
   Apple-Style Smooth Scroll Reveal Observer (Scroll Down & Scroll Up)
   ========================================================================== */
function initAppleScrollObserver() {
  const targets = document.querySelectorAll('.apple-reveal');
  if (!('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('is-visible')); return; }
  if (!window.__revealObserver) {
    // One shared observer; toggles the class on scroll down and scroll up
    window.__revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { root: null, threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    window.__revealSeen = new WeakSet();
  }
  targets.forEach(el => {
    if (!window.__revealSeen.has(el)) { window.__revealSeen.add(el); window.__revealObserver.observe(el); }
  });
}

/* ==========================================================================
   SPA Navigation Switcher & View Management
   ========================================================================== */
function closeMobileNav() {
  const menu = document.getElementById('navbarMain');
  if (menu && menu.classList.contains('show')) {
    bootstrap.Collapse.getOrCreateInstance(menu, { toggle: false }).hide();
  }
}

function syncHeaderHeight() {
  const header = document.querySelector('header.bt-navbar');
  if (header) document.documentElement.style.setProperty('--bt-header-h', header.offsetHeight + 'px');
}

function switchView(targetViewId) {
  closeMobileNav();   // any navigation (navbar, dock, buttons) folds the mobile menu away
  const sections = document.querySelectorAll('.bt-view-section');
  sections.forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSection = document.getElementById(targetViewId);
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update active status in Navbar & Dock
  document.querySelectorAll('[data-target-view]').forEach(link => {
    if (link.getAttribute('data-target-view') === targetViewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Re-trigger scroll reveal for newly visible elements
  setTimeout(initAppleScrollObserver, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu: fold away after any link/button inside it is used, and when tapping outside the header
  const navMenu = document.getElementById('navbarMain');
  if (navMenu) navMenu.addEventListener('click', (e) => { if (e.target.closest('a, button')) closeMobileNav(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('header.bt-navbar')) closeMobileNav(); });

  // Keep sticky offsets in sync with the real header height
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);
  window.addEventListener('load', syncHeaderHeight);
  const hdr = document.querySelector('header.bt-navbar');
  if (hdr && 'ResizeObserver' in window) new ResizeObserver(syncHeaderHeight).observe(hdr);

  // Navigation Click Handlers
  document.querySelectorAll('[data-target-view]').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = element.getAttribute('data-target-view');
      switchView(viewId);
    });
  });

  // Hero Form Switcher
  const tabTours = document.getElementById('hero-tab-tours');
  const tabCabs = document.getElementById('hero-tab-cabs');
  const formTours = document.getElementById('hero-form-tours');
  const formCabs = document.getElementById('hero-form-cabs');

  if (tabTours && tabCabs) {
    tabTours.addEventListener('click', () => {
      tabTours.className = 'btn btn-sm btn-bt-primary';
      tabCabs.className = 'btn btn-sm btn-bt-light';
      formTours.classList.remove('d-none');
      formCabs.classList.add('d-none');
    });

    tabCabs.addEventListener('click', () => {
      tabCabs.className = 'btn btn-sm btn-bt-primary';
      tabTours.className = 'btn btn-sm btn-bt-light';
      formCabs.classList.remove('d-none');
      formTours.classList.add('d-none');
    });
  }

  // Initialize Apple Scroll Reveal
  initAppleScrollObserver();

  // Package Filter Event Listeners
  initPackageFilters();
});

/* ==========================================================================
   Package Search, Filtering & Sorting
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('packageSearchInput');
  const regionChecks = document.querySelectorAll('.region-check');
  const categoryPills = document.querySelectorAll('.category-pill');
  const durationRange = document.getElementById('durationRange');
  const durationDisplay = document.getElementById('durationDisplayVal');
  const budgetRange = document.getElementById('budgetRange');
  const budgetDisplay = document.getElementById('budgetDisplayVal');
  const sortSelect = document.getElementById('packageSort');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const packageCounter = document.getElementById('packageCounter');
  const packagesGrid = document.getElementById('packagesGrid');
  const packageCards = document.querySelectorAll('.package-item-card');

  let activeCategory = 'all';

  // Format currency display
  const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN');

  // Filter & Sort Logic Function
  function filterAndSortPackages() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedRegions = Array.from(regionChecks)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    const maxDuration = parseInt(durationRange.value, 10);
    const maxBudget = parseInt(budgetRange.value, 10);

    let visibleCount = 0;
    let cardsArray = Array.from(packageCards);

    // 1. Filtering Phase
    cardsArray.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const region = card.dataset.region || '';
      const category = card.dataset.category || '';
      const duration = parseInt(card.dataset.duration || '0', 10);
      const price = parseInt(card.dataset.price || '0', 10);

      const matchesSearch = !searchTerm || title.includes(searchTerm);
      const matchesRegion = selectedRegions.includes(region);
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesDuration = duration <= maxDuration;
      const matchesBudget = price <= maxBudget;

      if (matchesSearch && matchesRegion && matchesCategory && matchesDuration && matchesBudget) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update results counter
    if (packageCounter) {
      packageCounter.textContent = `${visibleCount} Mountain Expedition${visibleCount !== 1 ? 's' : ''} Found`;
    }

    // 2. Sorting Phase
    const sortVal = sortSelect ? sortSelect.value : 'popular';
    cardsArray.sort((a, b) => {
      const priceA = parseInt(a.dataset.price || '0', 10);
      const priceB = parseInt(b.dataset.price || '0', 10);
      const durA = parseInt(a.dataset.duration || '0', 10);
      const durB = parseInt(b.dataset.duration || '0', 10);

      if (sortVal === 'price-low') return priceA - priceB;
      if (sortVal === 'price-high') return priceB - priceA;
      if (sortVal === 'duration') return durB - durA;
      return 0; // default order ('popular')
    });

    cardsArray.forEach(card => packagesGrid.appendChild(card));
  }

  // Event Listeners for Filters
  if (searchInput) {
    searchInput.addEventListener('input', filterAndSortPackages);
  }

  regionChecks.forEach(cb => {
    cb.addEventListener('change', filterAndSortPackages);
  });

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.cat;
      filterAndSortPackages();
    });
  });

  if (durationRange) {
    durationRange.addEventListener('input', (e) => {
      durationDisplay.textContent = `Up to ${e.target.value} Days`;
      filterAndSortPackages();
    });
  }

  if (budgetRange) {
    budgetRange.addEventListener('input', (e) => {
      budgetDisplay.textContent = formatCurrency(e.target.value);
      filterAndSortPackages();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', filterAndSortPackages);
  }

  // Reset Filters Handler
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      regionChecks.forEach(cb => cb.checked = true);
      categoryPills.forEach(p => p.classList.remove('active'));
      categoryPills[0].classList.add('active');
      activeCategory = 'all';

      durationRange.value = 12;
      durationDisplay.textContent = 'Up to 12 Days';

      budgetRange.value = 35000;
      budgetDisplay.textContent = '₹35,000';

      if (sortSelect) sortSelect.value = 'popular';

      filterAndSortPackages();
    });
  }

  // Initial Run
  filterAndSortPackages();
});

/* ==========================================================================
   Mountain Taxi Calculator
   ========================================================================== */
  // Major cities covering every Indian state capital, major hubs, and Delhi NCR
const majorCities = [
  // --- Delhi NCR Hubs ---
  { name: "Delhi_IGI", label: "Delhi - IGI Airport", lat: 28.5562, lng: 77.1000 },
  { name: "Delhi_NDLS", label: "Delhi - New Delhi Railway Station", lat: 28.6431, lng: 77.2197 },
  { name: "Noida", label: "Noida / Greater Noida (NCR)", lat: 28.5355, lng: 77.3910 },
  { name: "Gurugram", label: "Gurugram Cyber City (NCR)", lat: 28.4595, lng: 77.0266 },
  { name: "Faridabad", label: "Faridabad (NCR)", lat: 28.4089, lng: 77.3178 },
  { name: "Ghaziabad", label: "Ghaziabad (NCR)", lat: 28.6692, lng: 77.4538 },

  // --- Northern & Himalayan Region ---
  { name: "Chandigarh", label: "Chandigarh Airport / Station", lat: 30.7333, lng: 76.7794 },
  { name: "Kalka", label: "Kalka Station", lat: 30.8383, lng: 76.9358 },
  { name: "Shimla", label: "Shimla / Kufri", lat: 31.1048, lng: 77.1734 },
  { name: "Manali", label: "Manali / Solang", lat: 32.2432, lng: 77.1892 },
  { name: "Spiti", label: "Spiti Valley (Kaza)", lat: 32.2276, lng: 78.0710 },
  { name: "Leh", label: "Leh Ladakh Transit", lat: 34.1526, lng: 77.5771 },
  { name: "Srinagar", label: "Srinagar (Jammu & Kashmir)", lat: 34.0837, lng: 74.7973 },
  { name: "Dehradun", label: "Dehradun / Mussoorie (Uttarakhand)", lat: 30.3165, lng: 78.0322 },

  // --- North & Central India ---
  { name: "Jaipur", label: "Jaipur (Rajasthan)", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", label: "Lucknow (Uttar Pradesh)", lat: 26.8467, lng: 80.9462 },
  { name: "Patna", label: "Patna (Bihar)", lat: 25.5941, lng: 85.1376 },
  { name: "Ranchi", label: "Ranchi (Jharkhand)", lat: 23.3441, lng: 85.3096 },
  { name: "Bhopal", label: "Bhopal (Madhya Pradesh)", lat: 23.2599, lng: 77.4126 },
  { name: "Raipur", label: "Raipur (Chhattisgarh)", lat: 21.2514, lng: 81.6296 },

  // --- Western India ---
  { name: "Ahmedabad", label: "Ahmedabad (Gujarat)", lat: 23.0225, lng: 72.5714 },
  { name: "Mumbai", label: "Mumbai (Maharashtra)", lat: 19.0760, lng: 72.8777 },
  { name: "Panaji", label: "Panaji (Goa)", lat: 15.4909, lng: 73.8278 },

  // --- Southern India ---
  { name: "Bengaluru", label: "Bengaluru (Karnataka)", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", label: "Chennai (Tamil Nadu)", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", label: "Hyderabad (Telangana)", lat: 17.3850, lng: 78.4867 },
  { name: "Amaravati", label: "Amaravati / Vijayawada (Andhra Pradesh)", lat: 16.5131, lng: 80.5165 },
  { name: "Thiruvananthapuram", label: "Thiruvananthapuram (Kerala)", lat: 8.5241, lng: 76.9366 },

  // --- Eastern & North-Eastern India ---
  { name: "Kolkata", label: "Kolkata (West Bengal)", lat: 22.5726, lng: 88.3639 },
  { name: "Bhubaneswar", label: "Bhubaneswar (Odisha)", lat: 20.2961, lng: 85.8245 },
  { name: "Gangtok", label: "Gangtok (Sikkim)", lat: 27.3389, lng: 88.6065 },
  { name: "Guwahati", label: "Guwahati (Assam)", lat: 26.1445, lng: 91.7362 },
  { name: "Shillong", label: "Shillong (Meghalaya)", lat: 25.5788, lng: 91.8933 },
  { name: "Itanagar", label: "Itanagar (Arunachal Pradesh)", lat: 27.0844, lng: 93.6053 },
  { name: "Imphal", label: "Imphal (Manipur)", lat: 24.8170, lng: 93.9368 },
  { name: "Kohima", label: "Kohima (Nagaland)", lat: 25.6751, lng: 94.1086 },
  { name: "Aizawl", label: "Aizawl (Mizoram)", lat: 23.7271, lng: 92.7176 },
  { name: "Agartala", label: "Agartala (Tripura)", lat: 23.8315, lng: 91.2868 }
];

// Terrain-adjusted manual overrides for specific routes
const customRouteOverrides = {
  "Chandigarh-Manali": 310,
  "Chandigarh-Shimla": 115,
  "Chandigarh-Spiti": 450,
  "Chandigarh-Leh": 700,
  "Delhi_IGI-Manali": 540,
  "Delhi_IGI-Shimla": 340,
  "Delhi_IGI-Spiti": 700,
  "Delhi_IGI-Leh": 950,
  "Manali-Spiti": 180,
  "Manali-Leh": 430
};

// Calculate driving distance dynamically via Haversine + road winding multiplier
function getRouteDistance(fromName, toName) {
  if (fromName === toName) return 0;

  const key1 = `${fromName}-${toName}`;
  const key2 = `${toName}-${fromName}`;
  if (customRouteOverrides[key1]) return customRouteOverrides[key1];
  if (customRouteOverrides[key2]) return customRouteOverrides[key2];

  const cityA = majorCities.find(c => c.name === fromName);
  const cityB = majorCities.find(c => c.name === toName);

  if (!cityA || !cityB) return 300;

  const R = 6371;
  const dLat = (cityB.lat - cityA.lat) * (Math.PI / 180);
  const dLng = (cityB.lng - cityA.lng) * (Math.PI / 180);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(cityA.lat * (Math.PI / 180)) * Math.cos(cityB.lat * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3);
}

// Populate Pickup and Destination selects
function initFareCalculator() {
  const pickupSelect = document.getElementById("taxiPickup");
  const dropSelect = document.getElementById("taxiDrop");

  if (!pickupSelect || !dropSelect) return;

  pickupSelect.innerHTML = "";

  // Populate Pickup options
  majorCities.forEach(city => {
    const opt = document.createElement("option");
    opt.value = city.name;
    opt.textContent = city.label;
    pickupSelect.appendChild(opt);
  });

  // Filter and populate Destination options without current Pickup location
  function updateDestinationOptions() {
    const selectedPickup = pickupSelect.value;
    const previousDrop = dropSelect.value;

    dropSelect.innerHTML = "";

    majorCities.forEach(city => {
      if (city.name !== selectedPickup) {
        const distance = getRouteDistance(selectedPickup, city.name);
        const opt = document.createElement("option");
        opt.value = city.name;
        opt.textContent = `${city.label} (${distance} km)`;
        dropSelect.appendChild(opt);
      }
    });

    if (previousDrop && previousDrop !== selectedPickup) {
      dropSelect.value = previousDrop;
    }
  }

  // Event listener when pickup changes
  pickupSelect.addEventListener("change", updateDestinationOptions);

  // Initial population call
  updateDestinationOptions();
}

// Fare calculation logic triggered on button click
function calculateTaxiFare() {
  const pickup = document.getElementById("taxiPickup").value;
  const drop = document.getElementById("taxiDrop").value;
  const vehicleSelect = document.getElementById("taxiVehicle");

  if (!pickup || !drop || !vehicleSelect) {
    alert("Please select pickup location, destination drop, and vehicle type.");
    return;
  }

  const ratePerKm = parseFloat(vehicleSelect.value);
  const distance = getRouteDistance(pickup, drop);
  const totalFare = distance * ratePerKm;

  const fareDisplay = document.getElementById("fareAmountDisplay");
  const resultBox = document.getElementById("fareResultBox");

  if (fareDisplay && resultBox) {
    fareDisplay.textContent = `₹${totalFare.toLocaleString("en-IN")} (${distance} km @ ₹${ratePerKm}/km)`;
    resultBox.classList.remove("d-none");
  }
}

// Helper to open quick booking modal with selected details
function openQuickBookModal(title, category, price) {
  const modalTitle = document.getElementById("modalItemTitle");
  const modalPrice = document.getElementById("modalItemPrice");

  if (modalTitle) modalTitle.textContent = title;
  if (modalPrice) modalPrice.textContent = price;

  const modalEl = document.getElementById("quickBookModal");
  if (modalEl && window.bootstrap) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

function bookCalculatedTaxi() {
  const pickupEl = document.getElementById("taxiPickup");
  const dropEl = document.getElementById("taxiDrop");

  const pickupText = pickupEl.options[pickupEl.selectedIndex].text;
  const dropText = dropEl.options[dropEl.selectedIndex].text;
  const fareText = document.getElementById("fareAmountDisplay").textContent;

  openQuickBookModal(`${pickupText} to ${dropText}`, "Taxi Service", fareText);
}

// DOM Ready Safety Hook
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFareCalculator);
} else {
  initFareCalculator();
}

/* ==========================================================================
   Quick Booking Modal Function
   ========================================================================== */
function openQuickBookModal(title, category, price) {
  document.getElementById('modalItemTitle').innerText = title;
  document.getElementById('modalItemPrice').innerText = price;
  const el = document.getElementById('quickBookModal');
  const show = () => bootstrap.Modal.getOrCreateInstance(el).show();
  const open = document.querySelector('.modal.show');
  if (open && open !== el) {            // wait for the itinerary modal to finish closing so the backdrop/scroll lock stay clean
    open.addEventListener('hidden.bs.modal', show, { once: true });
    bootstrap.Modal.getOrCreateInstance(open).hide();
  } else show();
}

/* ==========================================================================
   Itinerary Modals: scroll-driven dotted route (fills on scroll down, empties on scroll up)
   ========================================================================== */
(function () {
  function setup(modal) {
    const body = modal.querySelector('.modal-body');
    const tl = modal.querySelector('.itin-timeline');
    if (!body || !tl) return;
    const nodes = Array.from(tl.querySelectorAll('.itin-node'));
    const days = Array.from(tl.querySelectorAll('.itin-day'));
    if (!nodes.length) return;
    const rail = document.createElement('div'); rail.className = 'itin-rail'; rail.setAttribute('aria-hidden', 'true');
    const fill = document.createElement('div'); fill.className = 'itin-rail-fill'; fill.setAttribute('aria-hidden', 'true');
    tl.prepend(rail, fill);
    let ticking = false;

    function update() {
      ticking = false;
      const t = tl.getBoundingClientRect(), b = body.getBoundingClientRect();
      const centers = nodes.map(n => { const r = n.getBoundingClientRect(); return r.top - t.top + r.height / 2; });
      const first = centers[0], last = centers[centers.length - 1], total = Math.max(last - first, 0);
      rail.style.top = fill.style.top = first + 'px';
      rail.style.height = total + 'px';
      const atEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;
      const marker = (b.top + b.height * 0.5) - t.top;       // reading line: middle of the modal body
      const h = atEnd ? total : Math.min(Math.max(marker - first, 0), total);
      fill.style.height = h + 'px';
      days.forEach((d, i) => d.classList.toggle('is-reached', atEnd || marker >= centers[i]));
    }
    const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

    body.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    tl.addEventListener('load', queue, true);                  // lazy images change card heights
    if ('ResizeObserver' in window) new ResizeObserver(queue).observe(tl);
    modal.addEventListener('show.bs.modal', () => { body.scrollTop = 0; });
    modal.addEventListener('shown.bs.modal', update);
  }
  function init() { document.querySelectorAll('.itinerary-modal').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
