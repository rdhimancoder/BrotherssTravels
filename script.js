/**
 * Brotherss Travels - Alpine Expedition & Transit
 * Interactive Client-Side Application Logic (Vanilla JS + Bootstrap 5)
 */

document.addEventListener('DOMContentLoaded', () => {
  initViewRouting();
  initBookingWidgetTabs();
  initFareCalculator();
  initPackageFilters();
  initCustomItineraryConfigurator();
  initTariffTableFilters();
  initCounters();
  initTooltipsAndToasts();
});

// -----------------------------------------------------------------------------
// 1. Single Page View Routing (Home, Tour Packages, Mountain Taxi, Custom Planner)
// -----------------------------------------------------------------------------
function initViewRouting() {
  const navLinks = document.querySelectorAll('[data-target-view]');
  const dockLinks = document.querySelectorAll('.bt-dock-item[data-target-view]');

  function showView(viewId) {
    // Hide all view sections
    const views = document.querySelectorAll('.bt-view-section');
    views.forEach(v => {
      v.classList.remove('active');
    });

    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update Desktop Nav Links
    navLinks.forEach(link => {
      if (link.getAttribute('data-target-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update Mobile Dock Links
    dockLinks.forEach(link => {
      if (link.getAttribute('data-target-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Close Bootstrap mobile offcanvas/navbar if open
    const navbarCollapse = document.getElementById('navbarMain');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) bsCollapse.hide();
    }
  }

  // Bind click handlers to all view triggers
  document.querySelectorAll('[data-target-view]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = trigger.getAttribute('data-target-view');
      showView(viewId);
      history.pushState(null, null, `#${viewId}`);
    });
  });

  // Handle Initial Hash on Load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(initialHash)) {
    showView(initialHash);
  } else {
    showView('view-home');
  }

  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
      showView(hash);
    } else {
      showView('view-home');
    }
  });
}

// -----------------------------------------------------------------------------
// 2. Hero Widget Tab Switching (Tours vs Mountain Cab)
// -----------------------------------------------------------------------------
function initBookingWidgetTabs() {
  const toursTabBtn = document.getElementById('hero-tab-tours');
  const cabTabBtn = document.getElementById('hero-tab-cabs');
  const toursForm = document.getElementById('hero-form-tours');
  const cabForm = document.getElementById('hero-form-cabs');

  if (toursTabBtn && cabTabBtn && toursForm && cabForm) {
    toursTabBtn.addEventListener('click', () => {
      toursTabBtn.classList.add('btn-bt-primary');
      toursTabBtn.classList.remove('btn-bt-light');
      cabTabBtn.classList.add('btn-bt-light');
      cabTabBtn.classList.remove('btn-bt-primary');
      toursForm.classList.remove('d-none');
      cabForm.classList.add('d-none');
    });

    cabTabBtn.addEventListener('click', () => {
      cabTabBtn.classList.add('btn-bt-primary');
      cabTabBtn.classList.remove('btn-bt-light');
      toursTabBtn.classList.add('btn-bt-light');
      toursTabBtn.classList.remove('btn-bt-primary');
      cabForm.classList.remove('d-none');
      toursForm.classList.add('d-none');
    });
  }
}

// -----------------------------------------------------------------------------
// 3. Instant Fare Calculator Logic
// -----------------------------------------------------------------------------
function initFareCalculator() {
  const tripTabs = document.querySelectorAll('#calc-trip-type .bt-segmented-btn');
  const pickupSelect = document.getElementById('calc-pickup');
  const destSelect = document.getElementById('calc-dest');
  const vehicleSelect = document.getElementById('calc-vehicle');
  const fareDisplay = document.getElementById('calc-fare-display');
  const originalFareDisplay = document.getElementById('calc-original-fare');
  const confirmBtn = document.getElementById('btn-confirm-calculated-cab');

  let currentTripType = 'oneway';

  tripTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tripTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTripType = tab.getAttribute('data-trip') || 'oneway';
      updateFareEstimate();
    });
  });

  function updateFareEstimate() {
    if (!pickupSelect || !destSelect || !vehicleSelect || !fareDisplay) return;

    const pickup = pickupSelect.value;
    const dest = destSelect.value;
    const vehicle = vehicleSelect.value;

    let baseRate = 6499;

    // Route matrix
    if (pickup === 'delhi') {
      if (dest === 'manali') baseRate = 8500;
      else if (dest === 'shimla') baseRate = 5800;
      else if (dest === 'leh') baseRate = 34000;
      else if (dest === 'spiti') baseRate = 26000;
      else if (dest === 'rishikesh') baseRate = 3400;
      else if (dest === 'dharamshala') baseRate = 8900;
    } else if (pickup === 'chandigarh') {
      if (dest === 'manali') baseRate = 6499;
      else if (dest === 'shimla') baseRate = 2800;
      else if (dest === 'leh') baseRate = 29000;
      else if (dest === 'spiti') baseRate = 22000;
      else if (dest === 'dharamshala') baseRate = 4800;
      else if (dest === 'rishikesh') baseRate = 3900;
    } else if (pickup === 'kalka') {
      if (dest === 'shimla') baseRate = 2200;
      else if (dest === 'manali') baseRate = 5900;
      else baseRate = 4500;
    } else if (pickup === 'manali') {
      if (dest === 'leh') baseRate = 28000;
      else if (dest === 'spiti') baseRate = 18500;
      else baseRate = 4500;
    }

    // Vehicle Multipliers
    let multiplier = 1.0;
    if (vehicle === 'innova') multiplier = 1.45;
    else if (vehicle === 'thar') multiplier = 1.55;
    else if (vehicle === 'tempo') multiplier = 2.25;

    // Trip Type Multipliers
    let tripMultiplier = 1.0;
    if (currentTripType === 'round') tripMultiplier = 1.8;
    else if (currentTripType === 'circuit') tripMultiplier = 2.5;
    else if (currentTripType === 'sightseeing') tripMultiplier = 0.85;

    const finalFare = Math.round(baseRate * multiplier * tripMultiplier);
    const originalFare = Math.round(finalFare * 1.15);

    fareDisplay.textContent = '₹' + finalFare.toLocaleString('en-IN');
    if (originalFareDisplay) {
      originalFareDisplay.textContent = '₹' + originalFare.toLocaleString('en-IN');
    }
  }

  // Bind change listeners
  [pickupSelect, destSelect, vehicleSelect].forEach(el => {
    if (el) el.addEventListener('change', updateFareEstimate);
  });

  // Quick Hub Pill Buttons
  document.querySelectorAll('[data-set-hub]').forEach(btn => {
    btn.addEventListener('click', () => {
      const hubVal = btn.getAttribute('data-set-hub');
      if (pickupSelect && hubVal) {
        pickupSelect.value = hubVal;
        updateFareEstimate();
      }
    });
  });

  // Open Quick Book Modal from Calculator
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const pickupText = pickupSelect.options[pickupSelect.selectedIndex].text;
      const destText = destSelect.options[destSelect.selectedIndex].text;
      const vehicleText = vehicleSelect.options[vehicleSelect.selectedIndex].text;
      const estimatedFare = fareDisplay.textContent;

      openQuickBookModal({
        title: `${pickupText} to ${destText}`,
        category: `Mountain Cab (${vehicleText})`,
        price: estimatedFare,
        type: 'cab'
      });
    });
  }

  // Initial calculation
  updateFareEstimate();
}

// -----------------------------------------------------------------------------
// 4. Tour Packages Search, Filter & Sort
// -----------------------------------------------------------------------------
function initPackageFilters() {
  const searchInput = document.getElementById('packageSearchInput');
  const regionCheckboxes = document.querySelectorAll('input[name="region"]');
  const categoryPills = document.querySelectorAll('.category-pill');
  const durationSlider = document.getElementById('durationRange');
  const durationDisplay = document.getElementById('durationDisplayVal');
  const budgetSlider = document.getElementById('budgetRange');
  const budgetDisplay = document.getElementById('budgetDisplayVal');
  const sortSelect = document.getElementById('packageSort');
  const resetBtn = document.getElementById('resetFiltersBtn');
  const packagesContainer = document.getElementById('packagesGrid');
  const packageCounter = document.getElementById('packageCounter');

  let currentCategory = 'all';

  if (!packagesContainer) return;

  const packageCards = Array.from(packagesContainer.querySelectorAll('.package-item-card'));

  function filterAndSortPackages() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedRegions = Array.from(regionCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value.toLowerCase());

    const maxDuration = durationSlider ? parseInt(durationSlider.value, 10) : 15;
    const maxBudget = budgetSlider ? parseInt(budgetSlider.value, 10) : 60000;

    let visibleCount = 0;

    packageCards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const region = (card.getAttribute('data-region') || '').toLowerCase();
      const category = (card.getAttribute('data-category') || '').toLowerCase();
      const duration = parseInt(card.getAttribute('data-duration') || '0', 10);
      const price = parseInt(card.getAttribute('data-price') || '0', 10);

      const matchesSearch = !query || title.includes(query) || region.includes(query);
      const matchesRegion = selectedRegions.length === 0 || selectedRegions.some(r => region.includes(r));
      const matchesCategory = currentCategory === 'all' || category === currentCategory.toLowerCase();
      const matchesDuration = duration <= maxDuration;
      const matchesBudget = price <= maxBudget;

      if (matchesSearch && matchesRegion && matchesCategory && matchesDuration && matchesBudget) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Update Counter
    if (packageCounter) {
      packageCounter.textContent = `${visibleCount} Mountain Expeditions Found`;
    }

    // Sort visible cards
    sortCards();
  }

  function sortCards() {
    if (!sortSelect) return;
    const sortBy = sortSelect.value;

    const visibleCards = packageCards.filter(c => c.style.display !== 'none');

    visibleCards.sort((a, b) => {
      const priceA = parseInt(a.getAttribute('data-price') || '0', 10);
      const priceB = parseInt(b.getAttribute('data-price') || '0', 10);
      const durationA = parseInt(a.getAttribute('data-duration') || '0', 10);
      const durationB = parseInt(b.getAttribute('data-duration') || '0', 10);
      const ratingA = parseFloat(a.getAttribute('data-rating') || '0');
      const ratingB = parseFloat(b.getAttribute('data-rating') || '0');

      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'duration') return durationB - durationA;
      return ratingB - ratingA; // default popular
    });

    visibleCards.forEach(card => packagesContainer.appendChild(card));
  }

  // Event Listeners
  if (searchInput) searchInput.addEventListener('input', filterAndSortPackages);
  regionCheckboxes.forEach(cb => cb.addEventListener('change', filterAndSortPackages));

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-cat') || 'all';
      filterAndSortPackages();
    });
  });

  if (durationSlider && durationDisplay) {
    durationSlider.addEventListener('input', (e) => {
      durationDisplay.textContent = `3 – ${e.target.value} Days`;
      filterAndSortPackages();
    });
  }

  if (budgetSlider && budgetDisplay) {
    budgetSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      budgetDisplay.textContent = `₹${val.toLocaleString('en-IN')}`;
      filterAndSortPackages();
    });
  }

  if (sortSelect) sortSelect.addEventListener('change', sortCards);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      regionCheckboxes.forEach(cb => { cb.checked = true; });
      if (durationSlider) {
        durationSlider.value = 15;
        if (durationDisplay) durationDisplay.textContent = '3 – 15 Days';
      }
      if (budgetSlider) {
        budgetSlider.value = 60000;
        if (budgetDisplay) budgetDisplay.textContent = '₹60,000+';
      }
      categoryPills.forEach(p => p.classList.remove('active'));
      if (categoryPills[0]) categoryPills[0].classList.add('active');
      currentCategory = 'all';
      filterAndSortPackages();
      showToast('Filters reset successfully');
    });
  }
}

// -----------------------------------------------------------------------------
// 5. Interactive Custom Itinerary Route Configurator
// -----------------------------------------------------------------------------
function initCustomItineraryConfigurator() {
  // Step 1: Destination Chips Multi-Select
  const destChips = document.querySelectorAll('.bt-dest-chip');
  destChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const icon = chip.querySelector('i');
      if (chip.classList.contains('active')) {
        if (icon) icon.className = 'bi bi-check-circle-fill text-warning';
      } else {
        if (icon) icon.className = 'bi bi-geo-alt';
      }
    });
  });

  // Step 2: Travel Style Selector
  const styleCards = document.querySelectorAll('.bt-style-card');
  styleCards.forEach(card => {
    card.addEventListener('click', () => {
      styleCards.forEach(c => {
        c.classList.remove('active');
        const radio = c.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
      });
      card.classList.add('active');
      const currentRadio = card.querySelector('input[type="radio"]');
      if (currentRadio) currentRadio.checked = true;
    });
  });

  // Step 3: Duration Selection Pills
  const durationBtns = document.querySelectorAll('#planner-duration-group .bt-segmented-btn');
  durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      durationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Step 4: Submission Handler
  const plannerForm = document.getElementById('customItineraryForm');
  if (plannerForm) {
    plannerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = plannerForm.querySelector('button[type="submit"]');
      if (!submitBtn) return;

      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Compiling Route Elevation Map...`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;

        const nameInput = document.getElementById('planner-name');
        const phoneInput = document.getElementById('planner-phone');
        const customerName = nameInput ? nameInput.value : 'Explorer';

        // Trigger Confirmation Modal
        const successModalEl = document.getElementById('bookingSuccessModal');
        if (successModalEl) {
          document.getElementById('successModalName').textContent = customerName;
          document.getElementById('successModalRef').textContent = 'BT-' + Math.floor(100000 + Math.random() * 900000);
          const modal = new bootstrap.Modal(successModalEl);
          modal.show();
        } else {
          showToast(`Thank you, ${customerName}! Your custom itinerary has been queued.`);
        }
      }, 1000);
    });
  }
}

// -----------------------------------------------------------------------------
// 6. Tariff Table Filtering
// -----------------------------------------------------------------------------
function initTariffTableFilters() {
  const filterButtons = document.querySelectorAll('[data-tariff-filter]');
  const rows = document.querySelectorAll('.bt-tariff-row');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-tariff-filter');
      filterButtons.forEach(b => b.classList.remove('active', 'btn-bt-primary'));
      filterButtons.forEach(b => b.classList.add('btn-bt-light'));
      btn.classList.add('active', 'btn-bt-primary');
      btn.classList.remove('btn-bt-light');

      rows.forEach(row => {
        const cat = row.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });
}

// -----------------------------------------------------------------------------
// 7. Adult & Child Counters Helper
// -----------------------------------------------------------------------------
function initCounters() {
  window.adjustCounter = function(elementId, delta) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let val = parseInt(el.textContent, 10) || 0;
    val += delta;
    if (elementId.includes('adult') && val < 1) val = 1;
    if (elementId.includes('child') && val < 0) val = 0;
    el.textContent = val;
  };
}

// -----------------------------------------------------------------------------
// 8. Modals & Interactive Actions (Quick Book & Itinerary Details)
// -----------------------------------------------------------------------------
window.openQuickBookModal = function(data) {
  const modalEl = document.getElementById('quickBookModal');
  if (!modalEl) return;

  document.getElementById('modalBookTitle').textContent = data.title || 'Himalayan Expedition';
  document.getElementById('modalBookCategory').textContent = data.category || 'Curated Tour';
  document.getElementById('modalBookPrice').textContent = data.price || 'Contact for Quote';

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

window.openItineraryModal = function(pkgKey) {
  const modalEl = document.getElementById('itineraryDetailModal');
  if (!modalEl) return;

  const itineraryData = {
    ladakh: {
      title: 'Complete Ladakh Odyssey with Pangong Lake & Nubra',
      duration: '7 Days / 6 Nights',
      peak: '5,359m Khardung La',
      days: [
        { day: 'Day 1', title: 'Arrival at Leh Kushok Bakula Airport (Acclimatization Rest)', desc: 'Transfer to heated heritage hotel, strict full-day hydration and resting. Pulse oximeter checks.' },
        { day: 'Day 2', title: 'Leh Local: Shanti Stupa, Hall of Fame & Magnetic Hill', desc: 'Acclimatization excursion along the Indus-Zanskar confluence at Nimmu.' },
        { day: 'Day 3', title: 'Leh to Nubra Valley via World’s Highest Motorable Pass Khardung La', desc: 'Crossing 17,982 ft pass. Descend into Diskit Gompa and Hunder sand dunes.' },
        { day: 'Day 4', title: 'Nubra to Pangong Tso via Shyok River Canyon', desc: 'Rugged riverbed route directly to the turquoise Pangong Lake. Deluxe glamping by lake.' },
        { day: 'Day 5', title: 'Pangong Sunrise to Leh via Chang La Pass (5,360m)', desc: 'Early morning photography session at water’s edge. Return drive to Leh.' },
        { day: 'Day 6', title: 'Hemis, Thiksey & Shey Palace Heritage Tour', desc: 'Explore 11th-century monastic treasures and local Leh Tibetan market.' },
        { day: 'Day 7', title: 'Airport Departure with Scenic High-Altitude Flight', desc: 'Assisted boarding with memorable Himalayan vistas.' }
      ]
    },
    spiti: {
      title: 'Spiti Valley Extreme Road Trip (Full Kaza Circuit)',
      duration: '8 Nights / 9 Days',
      peak: '4,550m Kunzum Pass & Chandratal',
      days: [
        { day: 'Day 1', title: 'Shimla to Narkanda & Sangla Valley', desc: 'Ascend through pine forests into Kinnaur. Riverside wood cottages in Sangla.' },
        { day: 'Day 2', title: 'Chitkul (Last Indian Village) to Kalpa', desc: 'View the sacred Kinner Kailash peak at golden sunrise.' },
        { day: 'Day 3', title: 'Kalpa to Nako & Tabo Monastery (1,000-year-old Ajanta of Himalayas)', desc: 'Enter cold desert terrain. Explore ancient mud monasteries and meditation caves.' },
        { day: 'Day 4', title: 'Tabo to Dhankar Gompa & Kaza HQ', desc: 'Perched cliffside monastery overlooking Pin-Spiti river confluence.' },
        { day: 'Day 5', title: 'High Village Circuit: Key Monastery, Kibber, Chicham Bridge & Hikkim', desc: 'Send a postcard from the world’s highest post office at 14,567 ft.' },
        { day: 'Day 6', title: 'Kaza to Sacred Chandratal Lake via Kunzum La (4,550m)', desc: 'Camp under billion stars in the crescent-shaped turquoise lake valley.' },
        { day: 'Day 7', title: 'Chandratal through Batal & Rohtang/Atal Tunnel to Manali', desc: 'Cross boulder water crossings (nullahs) safely in verified 4x4 Thar/Innova.' },
        { day: 'Day 8', title: 'Manali Leisure & Old Manali Cafe Rest', desc: 'Hot sulphur springs at Vashisht and relaxation.' },
        { day: 'Day 9', title: 'Return Drop to Chandigarh / Delhi', desc: 'Descent via 4-lane expressway.' }
      ]
    },
    himachal: {
      title: '7 Days Himachal Paradise: Shimla, Kullu & Manali',
      duration: '6 Nights / 7 Days',
      peak: '3,978m Rohtang Pass',
      days: [
        { day: 'Day 1', title: 'Delhi/Chandigarh to Shimla Arrival', desc: 'Scenic climb through Himalayan Expressway. Evening stroll on The Mall & Ridge.' },
        { day: 'Day 2', title: 'Shimla & Kufri Pine Forest Excursion', desc: 'Visit Himalayan Nature Park, horse trail in Mahasu peak.' },
        { day: 'Day 3', title: 'Shimla to Manali via Pandoh Dam & Kullu Valley', desc: 'En-route stop at Kullu shawl craft factories and river rafting point.' },
        { day: 'Day 4', title: 'Solang Valley & Atal Tunnel to Sissu Waterfall', desc: 'Transit through the 9km marvel into Lahaul snow valleys.' },
        { day: 'Day 5', title: 'Rohtang Pass Snow Crest Excursion (Permit Guaranteed)', desc: 'Explore panoramic glacial viewpoints and snow activities.' },
        { day: 'Day 6', title: 'Old Manali, Hadimba Temple & Vashisht Baths', desc: 'Cultural day with traditional Himachali trout lunch recommendations.' },
        { day: 'Day 7', title: 'Manali to Chandigarh / Delhi Drop', desc: 'Smooth return with comfortable airport/railway connection.' }
      ]
    }
  };

  const data = itineraryData[pkgKey] || itineraryData.ladakh;

  document.getElementById('itineraryModalTitle').textContent = data.title;
  document.getElementById('itineraryModalDuration').textContent = data.duration;
  document.getElementById('itineraryModalPeak').textContent = data.peak;

  const container = document.getElementById('itineraryDaysContainer');
  if (container) {
    container.innerHTML = data.days.map((item, idx) => `
      <div class="d-flex gap-3 mb-3 pb-3 ${idx < data.days.length - 1 ? 'border-bottom' : ''}">
        <div class="flex-shrink-0">
          <span class="badge bg-bt-primary px-2.5 py-1.5 rounded-pill font-monospace">${item.day}</span>
        </div>
        <div>
          <h6 class="fw-bold mb-1 text-bt-primary">${item.title}</h6>
          <p class="small text-muted mb-0">${item.desc}</p>
        </div>
      </div>
    `).join('');
  }

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
};

// -----------------------------------------------------------------------------
// 9. Toast Helper
// -----------------------------------------------------------------------------
function showToast(message) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white bg-bt-primary border-0 show shadow-lg mb-2';
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi bi-info-circle-fill text-warning"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  setTimeout(() => {
    toastEl.remove();
  }, 4000);
}

function initTooltipsAndToasts() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}
