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
// Track whether the user has manually clicked calculate at least once
let hasCalculatedBefore = false;

// Extensive database of major Indian cities, hill stations, and transit hubs
const INDIAN_CITIES_DATABASE = [
  // Punjab & Haryana
  { display_name: "Chandigarh, Punjab", lat: "30.7333", lon: "76.7794" },
  { display_name: "Ludhiana, Punjab", lat: "30.9010", lon: "75.8573" },
  { display_name: "Amritsar, Punjab", lat: "31.6340", lon: "74.8723" },
  { display_name: "Jalandhar, Punjab", lat: "31.3260", lon: "75.5762" },
  { display_name: "Patiala, Punjab", lat: "30.3398", lon: "76.3869" },
  { display_name: "Bathinda, Punjab", lat: "30.2110", lon: "74.9455" },
  { display_name: "Mohali, Punjab", lat: "30.7046", lon: "76.7179" },
  { display_name: "Pathankot, Punjab", lat: "32.2686", lon: "75.6488" },
  { display_name: "Hoshiarpur, Punjab", lat: "31.5143", lon: "75.9115" },
  { display_name: "Ambala, Haryana", lat: "30.3782", lon: "76.7767" },
  { display_name: "Hisar, Haryana", lat: "29.1492", lon: "75.7217" },
  { display_name: "Karnal, Haryana", lat: "29.6857", lon: "76.9905" },
  { display_name: "Panipat, Haryana", lat: "29.3909", lon: "76.9635" },
  { display_name: "Rohtak, Haryana", lat: "28.8955", lon: "76.6066" },
  { display_name: "Sonipat, Haryana", lat: "28.9931", lon: "77.0151" },
  { display_name: "Yamunanagar, Haryana", lat: "30.1290", lon: "77.2674" },
  { display_name: "Panchkula, Haryana", lat: "30.6942", lon: "76.8606" },
  //NCR
  {display_name: "Old Delhi, Delhi", lat: "28.6139", lon: "77.2090"},
  { display_name: "New Delhi, Delhi", lat: "28.6139", lon: "77.2090" },
  { display_name: "Gurugram, Haryana", lat: "28.4595", lon: "77.0266" },
  { display_name: "Gurgaon, Haryana", lat: "28.4595", lon: "77.0266" },
  { display_name: "Noida, Uttar Pradesh", lat: "28.5355", lon: "77.3910" },
  { display_name: "Faridabad, Haryana", lat: "28.4089", lon: "77.3178" },
  { display_name: "Ghaziabad, Uttar Pradesh", lat: "28.6692", lon: "77.4538" },
  { display_name: "Greater Noida, Uttar Pradesh", lat: "28.4744", lon: "77.5039" },

  // Himachal Pradesh & Uttarakhand
  { display_name: "Shimla, Himachal Pradesh", lat: "31.1048", lon: "77.1734" },
  { display_name: "Dharamshala, Himachal Pradesh", lat: "32.2190", lon: "76.3234" },
  { display_name: "Solan, Himachal Pradesh", lat: "30.9045", lon: "77.0967" },
  { display_name: "Mandi, Himachal Pradesh", lat: "31.7087", lon: "76.9320" },
  { display_name: "Kullu, Himachal Pradesh", lat: "31.9579", lon: "77.1095" },
  { display_name: "Palampur, Himachal Pradesh", lat: "32.1109", lon: "76.5363" },
  { display_name: "Chamba, Himachal Pradesh", lat: "32.5534", lon: "76.1258" },
  { display_name: "Hamirpur, Himachal Pradesh", lat: "31.6862", lon: "76.5213" },
  { display_name: "Una, Himachal Pradesh", lat: "31.4685", lon: "76.2708" },
  { display_name: "Bilaspur, Himachal Pradesh", lat: "31.3302", lon: "76.7562" },
  { display_name: "Dehradun, Uttarakhand", lat: "30.3165", lon: "78.0322" },
  { display_name: "Haridwar, Uttarakhand", lat: "29.9457", lon: "78.1642" },
  { display_name: "Rishikesh, Uttarakhand", lat: "30.0869", lon: "78.2676" },
  { display_name: "Roorkee, Uttarakhand", lat: "29.8543", lon: "77.8880" },
  { display_name: "Haldwani, Uttarakhand", lat: "29.2183", lon: "79.5130" },
  { display_name: "Rudrapur, Uttarakhand", lat: "28.9800", lon: "79.4000" },
  { display_name: "Kashipur, Uttarakhand", lat: "29.2100", lon: "78.9500" },

  // Jammu & Kashmir & Ladakh
  { display_name: "Srinagar, Jammu & Kashmir", lat: "34.0837", lon: "74.7973" },
  { display_name: "Jammu, Jammu & Kashmir", lat: "32.7266", lon: "74.8570" },
  { display_name: "Anantnag, Jammu & Kashmir", lat: "33.7311", lon: "75.1488" },
  { display_name: "Baramulla, Jammu & Kashmir", lat: "34.2018", lon: "74.3436" },
  { display_name: "Udhampur, Jammu & Kashmir", lat: "32.9262", lon: "75.1417" },
  { display_name: "Kathua, Jammu & Kashmir", lat: "32.3716", lon: "75.5182" },
  { display_name: "Leh, Ladakh", lat: "34.1526", lon: "77.5771" },

  // Uttar Pradesh
  { display_name: "Lucknow, Uttar Pradesh", lat: "26.8467", lon: "80.9462" },
  { display_name: "Kanpur, Uttar Pradesh", lat: "26.4499", lon: "80.3319" },
  { display_name: "Varanasi, Uttar Pradesh", lat: "25.3176", lon: "83.0062" },
  { display_name: "Agra, Uttar Pradesh", lat: "27.1767", lon: "78.0081" },
  { display_name: "Prayagraj, Uttar Pradesh", lat: "25.4358", lon: "81.8463" },
  { display_name: "Meerut, Uttar Pradesh", lat: "28.9845", lon: "77.7064" },
  { display_name: "Bareilly, Uttar Pradesh", lat: "28.3670", lon: "79.4304" },
  { display_name: "Aligarh, Uttar Pradesh", lat: "27.8974", lon: "78.0880" },
  { display_name: "Moradabad, Uttar Pradesh", lat: "28.8386", lon: "78.7733" },
  { display_name: "Saharanpur, Uttar Pradesh", lat: "29.9640", lon: "77.5460" },
  { display_name: "Gorakhpur, Uttar Pradesh", lat: "26.7606", lon: "83.3732" },
  { display_name: "Ayodhya, Uttar Pradesh", lat: "26.7922", lon: "82.1998" },
  { display_name: "Jhansi, Uttar Pradesh", lat: "25.4484", lon: "78.5685" },
  { display_name: "Mathura, Uttar Pradesh", lat: "27.4924", lon: "77.6737" },
  { display_name: "Muzaffarnagar, Uttar Pradesh", lat: "29.4727", lon: "77.7085" },
  { display_name: "Firozabad, Uttar Pradesh", lat: "27.1593", lon: "78.3957" },
  { display_name: "Rampur, Uttar Pradesh", lat: "28.8154", lon: "79.0250" },
  { display_name: "Shahjahanpur, Uttar Pradesh", lat: "27.8804", lon: "79.9050" },

  // Rajasthan
  { display_name: "Jaipur, Rajasthan", lat: "26.9124", lon: "75.7873" },
  { display_name: "Jodhpur, Rajasthan", lat: "26.2389", lon: "73.0243" },
  { display_name: "Udaipur, Rajasthan", lat: "24.5854", lon: "73.7125" },
  { display_name: "Kota, Rajasthan", lat: "25.2138", lon: "75.8648" },
  { display_name: "Bikaner, Rajasthan", lat: "28.0229", lon: "73.3119" },
  { display_name: "Ajmer, Rajasthan", lat: "26.4499", lon: "74.6399" },
  { display_name: "Bhilwara, Rajasthan", lat: "25.3407", lon: "74.6313" },
  { display_name: "Alwar, Rajasthan", lat: "27.5530", lon: "76.6346" },
  { display_name: "Bharatpur, Rajasthan", lat: "27.2152", lon: "77.4930" },
  { display_name: "Sikar, Rajasthan", lat: "27.6119", lon: "75.1397" },
  { display_name: "Pali, Rajasthan", lat: "25.7711", lon: "73.3234" },
  { display_name: "Sri Ganganagar, Rajasthan", lat: "29.9038", lon: "73.8772" },
  { display_name: "Jaisalmer, Rajasthan", lat: "26.9157", lon: "70.9083" },
  { display_name: "Chittorgarh, Rajasthan", lat: "24.8887", lon: "74.6269" },

  // Maharashtra
  { display_name: "Mumbai, Maharashtra", lat: "19.0760", lon: "72.8777" },
  { display_name: "Pune, Maharashtra", lat: "18.5204", lon: "73.8567" },
  { display_name: "Nagpur, Maharashtra", lat: "21.1458", lon: "79.0882" },
  { display_name: "Thane, Maharashtra", lat: "19.2183", lon: "72.9781" },
  { display_name: "Pimpri-Chinchwad, Maharashtra", lat: "18.6298", lon: "73.7997" },
  { display_name: "Nashik, Maharashtra", lat: "20.0059", lon: "73.7898" },
  { display_name: "Kalyan-Dombivli, Maharashtra", lat: "19.2403", lon: "73.1305" },
  { display_name: "Vasai-Virar, Maharashtra", lat: "19.3919", lon: "72.8397" },
  { display_name: "Chhatrapati Sambhajinagar, Maharashtra", lat: "19.8762", lon: "75.3433" },
  { display_name: "Navi Mumbai, Maharashtra", lat: "19.0330", lon: "73.0297" },
  { display_name: "Solapur, Maharashtra", lat: "17.6599", lon: "75.9064" },
  { display_name: "Amravati, Maharashtra", lat: "20.9374", lon: "77.7796" },
  { display_name: "Nanded, Maharashtra", lat: "19.1383", lon: "77.3210" },
  { display_name: "Kolhapur, Maharashtra", lat: "16.7050", lon: "74.2433" },
  { display_name: "Akola, Maharashtra", lat: "20.7002", lon: "77.0082" },
  { display_name: "Ulhasnagar, Maharashtra", lat: "19.2215", lon: "73.1644" },
  { display_name: "Sangli, Maharashtra", lat: "16.8524", lon: "74.5815" },
  { display_name: "Latur, Maharashtra", lat: "18.4088", lon: "76.5604" },
  { display_name: "Dhule, Maharashtra", lat: "20.9042", lon: "74.7749" },
  { display_name: "Ahmednagar, Maharashtra", lat: "19.0948", lon: "74.7480" },
  { display_name: "Chandrapur, Maharashtra", lat: "19.9615", lon: "79.2961" },
  { display_name: "Parbhani, Maharashtra", lat: "19.2686", lon: "76.7708" },
  { display_name: "Jalgaon, Maharashtra", lat: "21.0077", lon: "75.5626" },

  // Gujarat & Goa
  { display_name: "Ahmedabad, Gujarat", lat: "23.0225", lon: "72.5714" },
  { display_name: "Surat, Gujarat", lat: "21.1702", lon: "72.8311" },
  { display_name: "Vadodara, Gujarat", lat: "22.3072", lon: "73.1812" },
  { display_name: "Rajkot, Gujarat", lat: "22.3039", lon: "70.8022" },
  { display_name: "Bhavnagar, Gujarat", lat: "21.7645", lon: "72.1519" },
  { display_name: "Jamnagar, Gujarat", lat: "22.4707", lon: "70.0577" },
  { display_name: "Junagadh, Gujarat", lat: "21.5222", lon: "70.4579" },
  { display_name: "Gandhinagar, Gujarat", lat: "23.2156", lon: "72.6369" },
  { display_name: "Gandhidham, Gujarat", lat: "23.0753", lon: "70.1337" },
  { display_name: "Anand, Gujarat", lat: "22.5645", lon: "72.9289" },
  { display_name: "Navsari, Gujarat", lat: "20.9467", lon: "72.9520" },
  { display_name: "Morbi, Gujarat", lat: "22.8173", lon: "70.8370" },
  { display_name: "Nadiad, Gujarat", lat: "22.6916", lon: "72.8634" },
  { display_name: "Bharuch, Gujarat", lat: "21.7051", lon: "72.9959" },
  { display_name: "Mehsana, Gujarat", lat: "23.5880", lon: "72.3693" },
  { display_name: "Bhuj, Gujarat", lat: "23.2420", lon: "69.6669" },
  { display_name: "Panaji, Goa", lat: "15.4909", lon: "73.8278" },
  { display_name: "Margao, Goa", lat: "15.2832", lon: "73.9862" },
  { display_name: "Vasco da Gama, Goa", lat: "15.3959", lon: "73.8157" },

  // Karnataka
  { display_name: "Bengaluru, Karnataka", lat: "12.9716", lon: "77.5946" },
  { display_name: "Mysuru, Karnataka", lat: "12.2958", lon: "76.6394" },
  { display_name: "Hubballi-Dharwad, Karnataka", lat: "15.3647", lon: "75.1240" },
  { display_name: "Mangaluru, Karnataka", lat: "12.9141", lon: "74.8560" },
  { display_name: "Belagavi, Karnataka", lat: "15.8497", lon: "74.4977" },
  { display_name: "Kalaburagi, Karnataka", lat: "17.3297", lon: "76.8343" },
  { display_name: "Davanagere, Karnataka", lat: "14.4644", lon: "75.9218" },
  { display_name: "Ballari, Karnataka", lat: "15.1394", lon: "76.9214" },
  { display_name: "Vijayapura, Karnataka", lat: "16.8302", lon: "75.7100" },
  { display_name: "Shivamogga, Karnataka", lat: "13.9299", lon: "75.5681" },
  { display_name: "Tumakuru, Karnataka", lat: "13.3379", lon: "77.1173" },
  { display_name: "Raichur, Karnataka", lat: "16.2076", lon: "77.3463" },
  { display_name: "Bidar, Karnataka", lat: "17.9104", lon: "77.5199" },
  { display_name: "Udupi, Karnataka", lat: "13.3409", lon: "74.7421" },

  // Tamil Nadu & Kerala
  { display_name: "Chennai, Tamil Nadu", lat: "13.0827", lon: "80.2707" },
  { display_name: "Coimbatore, Tamil Nadu", lat: "11.0168", lon: "76.9558" },
  { display_name: "Madurai, Tamil Nadu", lat: "9.9252", lon: "78.1198" },
  { display_name: "Tiruchirappalli, Tamil Nadu", lat: "10.7905", lon: "78.7047" },
  
  // Madhya Pradesh & Chhattisgarh
  { display_name: "Indore, Madhya Pradesh", lat: "22.7196", lon: "75.8577" },
  { display_name: "Bhopal, Madhya Pradesh", lat: "23.2599", lon: "77.4126" },
  { display_name: "Gwalior, Madhya Pradesh", lat: "26.2183", lon: "78.1828" },
  { display_name: "Raipur, Chhattisgarh", lat: "21.2514", lon: "81.6296" },

  // East & North-East
  { display_name: "Kolkata, West Bengal", lat: "22.5726", lon: "88.3639" },
  { display_name: "Siliguri, West Bengal", lat: "26.7271", lon: "88.3953" },
  { display_name: "Bhubaneswar, Odisha", lat: "20.2961", lon: "85.8245" },
  { display_name: "Ranchi, Jharkhand", lat: "23.3441", lon: "85.3096" },
  { display_name: "Guwahati, Assam", lat: "26.1445", lon: "91.7362" },
  { display_name: "Shillong, Meghalaya", lat: "25.5788", lon: "91.8933" },
  { display_name: "Gangtok, Sikkim", lat: "27.3389", lon: "88.6065" }
];

// Debounce helper to limit function calls during typing
function debounce(func, delay = 300) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Safely clamped Haversine distance formula (in KM)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  let a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;

  a = Math.min(1, Math.max(0, a));

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 1.3); // 1.3x multiplier for approximate road distance
}

// Fetch live location search for Pickup
async function searchPickupLocations(query) {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = encodeURIComponent(query.trim().toLowerCase());
  const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${cleanQuery}&addressdetails=1&limit=6`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const formatted = data.map((item) => {
      const addr = item.address || {};
      const placeName = item.name || (item.display_name ? item.display_name.split(",")[0] : "");
      const city = addr.city || addr.town || addr.village || addr.district || "";
      const state = addr.state || "";

      let displayName = placeName;
      if (city && !placeName.toLowerCase().includes(city.toLowerCase())) {
        displayName += `, ${city}`;
      }
      if (state && !displayName.toLowerCase().includes(state.toLowerCase())) {
        displayName += `, ${state}`;
      }

      return {
        display_name: displayName.trim(),
        lat: item.lat,
        lon: item.lon
      };
    });

    const seenNames = new Set();
    return formatted.filter((item) => {
      if (!item.display_name) return false;
      const key = item.display_name.toLowerCase();
      if (seenNames.has(key)) return false;
      seenNames.add(key);
      return true;
    });
  } catch (err) {
    console.error("Pickup location search error:", err);
    return [];
  }
}

// Search destination from dynamic local database
function searchDestinationLocations(query) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();

  return INDIAN_CITIES_DATABASE.filter((city) =>
    city.display_name.toLowerCase().includes(q)
  );
}

// Detect user GPS location and set to Pickup input
function applyCurrentLocationToInput(inputEl, hiddenLatEl, hiddenLngEl, callback) {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  inputEl.value = "Detecting location...";

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      hiddenLatEl.value = lat;
      hiddenLngEl.value = lng;

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();

        if (data && data.address) {
          const addr = data.address;
          const districtName = addr.state_district || addr.district || addr.county || addr.city || addr.state;

          if (districtName) {
            inputEl.value = `${districtName}, ${addr.state || ''}`;
          } else if (data.display_name) {
            inputEl.value = data.display_name;
          }
        }
      } catch (err) {
        console.log("Failed to reverse geocode current location.", err);
        inputEl.value = "Current Location";
      }

      if (typeof callback === "function") callback();
    },
    (err) => {
      alert("Geolocation permission denied or timed out.");
      inputEl.value = "";
    },
    { timeout: 8000, enableHighAccuracy: true }
  );
}

// Position suggestions menu dynamically
function positionSuggestions(inputEl, suggestionsEl) {
  const rect = inputEl.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  if (rect.bottom < 0 || rect.top > windowHeight) {
    suggestionsEl.classList.add("d-none");
    return;
  }

  if (suggestionsEl.parentNode !== document.body) {
    document.body.appendChild(suggestionsEl);
  }

  suggestionsEl.classList.add("bt-suggestions-menu", "position-fixed", "shadow-lg");
  
  // FIX: z-index set to 999 to stay below header and mobile navigation docks
  suggestionsEl.style.cssText = `
    position: fixed !important;
    top: ${rect.bottom + 4}px !important;
    left: ${rect.left}px !important;
    width: ${rect.width}px !important;
    z-index: 999 !important;
    max-height: 240px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    isolation: isolate !important;
    overscroll-behavior: contain !important; 
    -webkit-overflow-scrolling: touch !important; 
  `;
}

// Automatically update live only if the user has manually calculated at least once
function checkAndCalculateLive() {
  if (!hasCalculatedBefore) return;

  const pickupText = document.getElementById("taxiPickupInput").value.trim();
  const dropText = document.getElementById("taxiDropInput").value.trim();

  if (pickupText && dropText && pickupText !== "Detecting location...") {
    calculateTaxiFare();
  }
}

// Setup live autocomplete
function setupAutocomplete(inputEl, hiddenLatEl, hiddenLngEl, suggestionsEl, excludeInputEl, showCurrentLocation = true) {
  const handleInput = debounce(async () => {
    const query = inputEl.value.trim();

    if (query.length < 2) {
      suggestionsEl.classList.add("d-none");
      return;
    }

    let results = [];
    if (showCurrentLocation) {
      results = await searchPickupLocations(query);
    } else {
      results = searchDestinationLocations(query);
    }

    suggestionsEl.innerHTML = "";

    const excludeName = excludeInputEl ? excludeInputEl.value.trim().toLowerCase() : "";
    const filteredResults = results.filter(item => item.display_name.toLowerCase() !== excludeName);

    if (showCurrentLocation) {
      const currentLocationBtn = document.createElement("div");
      currentLocationBtn.className = "bt-suggestion-item bt-suggestion-action";
      currentLocationBtn.innerHTML = `<i class="bi bi-geo-alt-fill me-1"></i><span>Use Current Location</span>`;

      currentLocationBtn.addEventListener("click", () => {
        applyCurrentLocationToInput(inputEl, hiddenLatEl, hiddenLngEl, () => {
          checkAndCalculateLive();
        });
        suggestionsEl.classList.add("d-none");
      });

      suggestionsEl.appendChild(currentLocationBtn);
    }

    filteredResults.forEach(item => {
      const itemRow = document.createElement("div");
      itemRow.className = "bt-suggestion-item";
      itemRow.innerHTML = `<i class="bi bi-pin-map text-muted opacity-75 small"></i><span class="text-truncate">${item.display_name}</span>`;

      itemRow.addEventListener("click", () => {
        inputEl.value = item.display_name;
        hiddenLatEl.value = item.lat;
        hiddenLngEl.value = item.lon;
        suggestionsEl.classList.add("d-none");
        
        checkAndCalculateLive();
      });

      suggestionsEl.appendChild(itemRow);
    });

    if (filteredResults.length > 0 || showCurrentLocation) {
      positionSuggestions(inputEl, suggestionsEl);
      suggestionsEl.classList.remove("d-none");
    } else {
      suggestionsEl.classList.add("d-none");
    }
  }, 300);

  inputEl.addEventListener("input", () => {
    hiddenLatEl.value = "";
    hiddenLngEl.value = "";
    handleInput();
  });

  inputEl.addEventListener("focus", () => {
    if (inputEl.value.trim().length >= 2) {
      handleInput();
    }
  });
  
  suggestionsEl.addEventListener("touchmove", (e) => {
    e.stopPropagation();
  }, { passive: true });

  window.addEventListener("scroll", (e) => {
    if (e.target === suggestionsEl || suggestionsEl.contains(e.target)) {
      return;
    }
    
    if (!suggestionsEl.classList.contains("d-none")) {
      positionSuggestions(inputEl, suggestionsEl);
    }
  }, { capture: true, passive: true });

  window.addEventListener("resize", () => {
    if (!suggestionsEl.classList.contains("d-none")) {
      positionSuggestions(inputEl, suggestionsEl);
    }
  });

  document.addEventListener("click", (e) => {
    if (!inputEl.contains(e.target) && !suggestionsEl.contains(e.target)) {
      suggestionsEl.classList.add("d-none");
    }
  });
}

// Calculate taxi fare (marks hasCalculatedBefore as true upon invocation)
async function calculateTaxiFare() {
  const pickupText = document.getElementById("taxiPickupInput").value.trim();
  const dropText = document.getElementById("taxiDropInput").value.trim();
  let lat1 = parseFloat(document.getElementById("pickupLat").value);
  let lng1 = parseFloat(document.getElementById("pickupLng").value);
  let lat2 = parseFloat(document.getElementById("dropLat").value);
  let lng2 = parseFloat(document.getElementById("dropLng").value);
  const vehicleSelect = document.getElementById("taxiVehicle");

  if (!pickupText || !dropText) {
    alert("Please enter both pickup and destination drop locations.");
    return;
  }

  if (pickupText.toLowerCase() === dropText.toLowerCase()) {
    alert("Pickup and Destination drop cannot be the same location.");
    return;
  }

  if (isNaN(lat1) || isNaN(lng1)) {
    const pickupGeo = await searchPickupLocations(pickupText);
    if (pickupGeo.length > 0) {
      lat1 = parseFloat(pickupGeo[0].lat);
      lng1 = parseFloat(pickupGeo[0].lon);
    } else {
      alert("Could not locate the pickup place. Please select from live suggestions.");
      return;
    }
  }

  if (isNaN(lat2) || isNaN(lng2)) {
    const dropGeo = searchDestinationLocations(dropText);
    if (dropGeo.length > 0) {
      lat2 = parseFloat(dropGeo[0].lat);
      lng2 = parseFloat(dropGeo[0].lon);
    } else {
      const onlineDropGeo = await searchPickupLocations(dropText);
      if (onlineDropGeo.length > 0) {
        lat2 = parseFloat(onlineDropGeo[0].lat);
        lng2 = parseFloat(onlineDropGeo[0].lon);
      } else {
        alert("Could not locate the drop destination. Please select from suggestions.");
        return;
      }
    }
  }

  // Mark that the user has successfully triggered calculation at least once
  hasCalculatedBefore = true;

  const ratePerKm = parseFloat(vehicleSelect.value);
  const distance = calculateHaversineDistance(lat1, lng1, lat2, lng2);
  const totalFare = distance * ratePerKm;

  const fareDisplay = document.getElementById("fareAmountDisplay");
  const resultBox = document.getElementById("fareResultBox");

  if (fareDisplay && resultBox) {
    fareDisplay.textContent = `₹${totalFare.toLocaleString("en-IN")} (${distance} km @ ₹${ratePerKm}/km)`;
    resultBox.classList.remove("d-none");
  }
}

// Modal helper functions
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
  const pickupText = document.getElementById("taxiPickupInput").value.trim();
  const dropText = document.getElementById("taxiDropInput").value.trim();
  const fareText = document.getElementById("fareAmountDisplay").textContent;

  if (!fareText || document.getElementById("fareResultBox").classList.contains("d-none")) {
    alert("Please calculate or select pickup and drop locations first.");
    return;
  }

  openQuickBookModal(`${pickupText} to ${dropText}`, "Taxi Service", fareText);
}

// Initialize fare calculator components
function initFareCalculator() {
  const pickupInput = document.getElementById("taxiPickupInput");
  const pickupLat = document.getElementById("pickupLat");
  const pickupLng = document.getElementById("pickupLng");
  const pickupSuggestions = document.getElementById("pickupSuggestions");

  const dropInput = document.getElementById("taxiDropInput");
  const dropLat = document.getElementById("dropLat");
  const dropLng = document.getElementById("dropLng");
  const dropSuggestions = document.getElementById("dropSuggestions");
  const vehicleSelect = document.getElementById("taxiVehicle");

  if (pickupInput && dropInput) {
    setupAutocomplete(pickupInput, pickupLat, pickupLng, pickupSuggestions, dropInput, true);
    setupAutocomplete(dropInput, dropLat, dropLng, dropSuggestions, pickupInput, false);

    applyCurrentLocationToInput(pickupInput, pickupLat, pickupLng);
  }

  // Live update when vehicle type changes (only if calculation has happened before)
  if (vehicleSelect) {
    vehicleSelect.addEventListener("change", () => {
      checkAndCalculateLive();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFareCalculator);
} else {
  initFareCalculator();
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

// hotel filtering for unique hotels (only affects the unique hotel grid, not other hotel grids on the page)

document.addEventListener('DOMContentLoaded', function () {
  const filterWrapper = document.getElementById('uniqueHotelFiltersWrapper');
  const hotelGrid = document.getElementById('uniqueHotelGrid');

  if (!filterWrapper || !hotelGrid) return;

  // Target ONLY the unique hotel buttons
  const filterButtons = filterWrapper.querySelectorAll('.hotel-pill');
  const hotelCards = hotelGrid.querySelectorAll(':scope > div');

  filterButtons.forEach(button => {
    button.addEventListener('click', function (e) {
      // CRITICAL: Stop all other scripts on the page from hearing this click
      e.stopImmediatePropagation();
      e.stopPropagation();

      // Update active state only within the hotel wrapper
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Get selected location using the new attribute name
      const selectedLocation = this.getAttribute('data-hotel-filter');

      // Filter only the cards inside #uniqueHotelGrid
      hotelCards.forEach(card => {
        // Check standard location attributes inside the card
        const cardLocation = card.getAttribute('data-hb-loc') || card.getAttribute('data-hotel-loc');

        if (cardLocation) {
          if (selectedLocation === 'all' || cardLocation === selectedLocation) {
            card.style.display = ''; // Show
          } else {
            card.style.display = 'none'; // Hide
          }
        }
      });
    }, true); // Use capture phase to intercept the click before global listeners
  });
});
