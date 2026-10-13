    window.addEventListener('scroll', function() {
      const stickyHeader = document.getElementById('scrollStickyHeader');
      const heroHeader = document.getElementById('heroHeader');
      
      if (heroHeader) {
        const heroBottom = heroHeader.getBoundingClientRect().bottom;
        // Triggers sticky header only when user has scrolled past the hero section
        if (heroBottom <= 0) {
          stickyHeader.classList.add('visible');
        } else {
          stickyHeader.classList.remove('visible');
        }
      }
    });

    // 2. Horizontal Related Packages Slider Scroll Controls
    const slider = document.getElementById('pkgSlider');
    if (slider) {
      document.getElementById('slideLeft').addEventListener('click', () => {
        slider.scrollBy({ left: -300, behavior: 'smooth' });
      });
      document.getElementById('slideRight').addEventListener('click', () => {
        slider.scrollBy({ left: 300, behavior: 'smooth' });
      });
    }

    // 3. Gallery Lightbox Modal Logic
    const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));
    const modalImageDisplay = document.getElementById('modalImageDisplay');
    modalCaption = document.getElementById('modalCaption');
    
    // Gallery dataset
    const galleryItems = [
      { src: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1600&q=80", title: "Snow Peaks View" },
      { src: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1600&q=80", title: "Mountain Pass Drive" },
      { src: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=1600&q=80", title: "Solang Valley Snow Point" },
      { src: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80", title: "Parvati River Kasol" },
      { src: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1600&q=80", title: "Valley Panoramic Skyline" }
    ];

    let currentImgIndex = 0;

    function updateModalImage(index) {
      currentImgIndex = (index + galleryItems.length) % galleryItems.length;
      modalImageDisplay.src = galleryItems[currentImgIndex].src;
      modalCaption.textContent = `${galleryItems[currentImgIndex].title} (${currentImgIndex + 1} of ${galleryItems.length})`;
    }

    // Attach click listeners to all gallery marquee images
    document.querySelectorAll('.hero-gallery-marquee .marquee-img').forEach(img => {
      img.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        updateModalImage(index);
        galleryModal.show();
      });
    });

    // Next / Prev button events inside modal
    document.getElementById('prevModalImg').addEventListener('click', () => {
      updateModalImage(currentImgIndex - 1);
    });

    document.getElementById('nextModalImg').addEventListener('click', () => {
      updateModalImage(currentImgIndex + 1);
    });

    // Keyboard navigation (Left/Right Arrow Key support)
    document.addEventListener('keydown', (e) => {
      const modalEl = document.getElementById('galleryModal');
      if (modalEl.classList.contains('show')) {
        if (e.key === 'ArrowLeft') {
          updateModalImage(currentImgIndex - 1);
        } else if (e.key === 'ArrowRight') {
          updateModalImage(currentImgIndex + 1);
        }
      }
    });