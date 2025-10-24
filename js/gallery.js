/* ===================================
   Gallery Lightbox Functionality
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxCounter = document.getElementById('lightbox-counter');

  let currentIndex = 0;
  const images = [];

  // Collect all gallery images
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    images.push({
      src: img.src,
      alt: img.alt
    });

    // Click handler for gallery items
    item.addEventListener('click', function() {
      openLightbox(index);
    });

    // Keyboard accessibility
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Open image ${index + 1} in lightbox`);

    item.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  // Open lightbox
  function openLightbox(index) {
    currentIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Trap focus within lightbox
    lightboxClose.focus();
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';

    // Return focus to the gallery item that was clicked
    if (galleryItems[currentIndex]) {
      galleryItems[currentIndex].focus();
    }
  }

  // Update lightbox image
  function updateLightboxImage() {
    if (images[currentIndex]) {
      const img = images[currentIndex];
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightboxCounter.textContent = `${currentIndex + 1} / ${images.length}`;

      // Add fade effect
      lightboxImage.style.opacity = '0';
      setTimeout(() => {
        lightboxImage.style.opacity = '1';
      }, 50);
    }
  }

  // Navigate to previous image
  function showPrevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightboxImage();
  }

  // Navigate to next image
  function showNextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightboxImage();
  }

  // Event Listeners
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrevImage);
  lightboxNext.addEventListener('click', showNextImage);

  // Close on background click
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('active')) return;

    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPrevImage();
        break;
      case 'ArrowRight':
        showNextImage();
        break;
    }
  });

  // Touch swipe support for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next image
        showNextImage();
      } else {
        // Swipe right - previous image
        showPrevImage();
      }
    }
  }

  // Preload adjacent images for better performance
  function preloadImages() {
    const preloadIndexes = [
      (currentIndex + 1) % images.length,
      (currentIndex - 1 + images.length) % images.length
    ];

    preloadIndexes.forEach(index => {
      if (images[index]) {
        const img = new Image();
        img.src = images[index].src;
      }
    });
  }

  // Call preload when lightbox opens or navigates
  lightbox.addEventListener('transitionend', function() {
    if (lightbox.classList.contains('active')) {
      preloadImages();
    }
  });

  // Add smooth transition to lightbox image
  lightboxImage.style.transition = 'opacity 0.3s ease';

  // ===================================
  // Gallery Animation on Scroll
  // ===================================
  const galleryObserver = new IntersectionObserver(function(entries) {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
        }, index * 50); // Stagger animation
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Apply animation to gallery items
  galleryItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px) scale(0.95)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    galleryObserver.observe(item);
  });

  // ===================================
  // Gallery Grid Auto-layout Enhancement
  // ===================================
  function optimizeGalleryLayout() {
    const gallery = document.querySelector('.gallery-grid');
    if (!gallery) return;

    const items = Array.from(galleryItems);
    const containerWidth = gallery.offsetWidth;
    const itemMinWidth = 300;
    const gap = 24;

    // Calculate optimal columns
    const columns = Math.floor((containerWidth + gap) / (itemMinWidth + gap));
    gallery.style.gridTemplateColumns = `repeat(${Math.max(1, columns)}, 1fr)`;
  }

  // Optimize on load and resize
  window.addEventListener('load', optimizeGalleryLayout);
  window.addEventListener('resize', debounce(optimizeGalleryLayout, 250));

  // ===================================
  // Utility: Debounce function
  // ===================================
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ===================================
  // Accessibility: Announce image changes to screen readers
  // ===================================
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
  document.body.appendChild(announcement);

  function announceImageChange() {
    if (images[currentIndex]) {
      announcement.textContent = `Image ${currentIndex + 1} of ${images.length}: ${images[currentIndex].alt}`;
    }
  }

  // Update announcement when image changes
  const originalUpdateLightboxImage = updateLightboxImage;
  updateLightboxImage = function() {
    originalUpdateLightboxImage();
    announceImageChange();
  };

  console.log('🖼️ Gallery initialized with', images.length, 'images');
});
