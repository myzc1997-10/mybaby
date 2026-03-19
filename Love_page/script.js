// Helper: safely query a DOM element
const $ = (selector) => document.querySelector(selector);

// Elements
const floatingHeartsContainer = $(".floating-hearts");
const loveLetterBtn = $("#loveLetterBtn");
const scrollToMomentsBtn = $("#scrollToMoments");
const surpriseBtn = $("#surpriseBtn");
const loveModal = $("#loveModal");
const modalBackdrop = $("#modalBackdrop");
const modalClose = $("#modalClose");
const yesBtn = $("#yesBtn");
const noBtn = $("#noBtn");
const gallerySection = document.querySelector(".gallery-section");

/**
 * Create a softly floating heart emoji in the background.
 * Hearts are removed automatically after their animation ends.
 */
function createFloatingHeart() {
  if (!floatingHeartsContainer) return;

  const heart = document.createElement("span");
  heart.classList.add("heart");
  heart.textContent = Math.random() > 0.6 ? "💘" : "💗";

  const size = 14 + Math.random() * 12; // px
  const left = Math.random() * 100; // vw
  const duration = 6 + Math.random() * 6; // seconds

  heart.style.left = `${left}vw`;
  heart.style.fontSize = `${size}px`;
  heart.style.animationDuration = `${duration}s`;

  floatingHeartsContainer.appendChild(heart);

  // Clean up after animation
  setTimeout(() => {
    heart.remove();
  }, duration * 1000 + 200);
}

/**
 * Gently spawn floating hearts at intervals.
 */
function startFloatingHearts() {
  // initial hearts
  for (let i = 0; i < 12; i += 1) {
    setTimeout(createFloatingHeart, i * 220);
  }
  // continuous spawn
  setInterval(createFloatingHeart, 850);
}

/**
 * Simple ripple effect for any button with class 'ripple'.
 */
function attachRippleEffects() {
  const rippleButtons = document.querySelectorAll(".ripple");
  rippleButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      const rect = btn.getBoundingClientRect();
      const circle = document.createElement("span");
      const diameter = Math.max(rect.width, rect.height);

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${event.clientX - rect.left - diameter / 2}px`;
      circle.style.top = `${event.clientY - rect.top - diameter / 2}px`;
      circle.classList.add("ripple-circle");

      // Remove any existing circles before adding a new one
      const existing = btn.querySelector(".ripple-circle");
      if (existing) existing.remove();

      btn.appendChild(circle);

      circle.addEventListener("animationend", () => {
        circle.remove();
      });
    });
  });
}

/**
 * IntersectionObserver to softly reveal sections on scroll.
 */
function attachScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !revealEls.length) {
    // Fallback: just mark them visible
    revealEls.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/**
 * Modal helpers
 */
function openModal() {
  if (!loveModal) return;
  loveModal.classList.add("show");
  loveModal.classList.remove("hidden");
  loveModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  if (!loveModal) return;
  loveModal.classList.remove("show");

  // Match CSS transition duration
  setTimeout(() => {
    loveModal.classList.add("hidden");
    loveModal.setAttribute("aria-hidden", "true");
  }, 220);
}

function attachModalEvents() {
  if (!loveModal || !loveLetterBtn) return;

  loveLetterBtn.addEventListener("click", () => {
    openModal();
  });

  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeModal);
  }
  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !loveModal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

/**
 * Attach playful behavior to Yes / No buttons inside the modal.
 * - Yes closes the modal with a little heart burst 💖
 * - No runs away so it is hard (and funny) to click 🙈
 */
function attachChoiceButtons() {
  if (yesBtn) {
    yesBtn.addEventListener("click", () => {
      const rect = yesBtn.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      createHeartBurst(x, y);
      closeModal();
    });
  }

  if (noBtn) {
    let moveCount = 0;

    const moveNoButton = () => {
      moveCount += 1;
      const maxOffset = 90;
      const offsetX = (Math.random() - 0.5) * 2 * maxOffset;
      const offsetY = (Math.random() - 0.5) * 2 * maxOffset;
      noBtn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    };

    ["mouseenter", "pointerdown"].forEach((eventName) => {
      noBtn.addEventListener(eventName, (event) => {
        event.preventDefault();
        moveNoButton();
      });
    });
  }
}

/**
 * Handle image uploads and display them in pink frames
 */
const STORAGE_KEY = "valentineGalleryImages";

function loadSavedImages() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const images = JSON.parse(saved);
      images.forEach((imageData) => {
        addImageToGallery(imageData.dataUrl, imageData.id);
      });
    }
  } catch (error) {
    console.error("Error loading saved images:", error);
  }
}

function saveImages() {
  try {
    const images = [];
    const galleryItems = document.querySelectorAll(".gallery-item");
    galleryItems.forEach((item) => {
      const img = item.querySelector("img");
      if (img && img.src) {
        images.push({
          id: item.dataset.imageId,
          dataUrl: img.src,
        });
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error("Error saving images:", error);
  }
}

function addImageToGallery(dataUrl, imageId = null) {
  const galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;

  // Remove empty state if exists
  const emptyState = galleryGrid.querySelector(".gallery-empty");
  if (emptyState) emptyState.remove();

  const id = imageId || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const galleryItem = document.createElement("div");
  galleryItem.className = "gallery-item";
  galleryItem.dataset.imageId = id;

  const pinkFrame = document.createElement("div");
  pinkFrame.className = "pink-frame";

  const ribbonTailLeft = document.createElement("div");
  ribbonTailLeft.className = "ribbon-tail-left";
  
  const ribbonTailRight = document.createElement("div");
  ribbonTailRight.className = "ribbon-tail-right";

  const frameInner = document.createElement("div");
  frameInner.className = "pink-frame-inner";

  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = "Your special memory";
  img.loading = "lazy";

  const cropBtn = document.createElement("button");
  cropBtn.className = "crop-image-btn";
  cropBtn.setAttribute("aria-label", "Crop image");
  cropBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="9" y1="3" x2="9" y2="21"></line>
    <line x1="15" y1="3" x2="15" y2="21"></line>
    <line x1="3" y1="9" x2="21" y2="9"></line>
    <line x1="3" y1="15" x2="21" y2="15"></line>
  </svg>`;
  cropBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openCropModal(img.src, (croppedDataUrl) => {
      img.src = croppedDataUrl;
      saveImages();
    }, id);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-image-btn";
  deleteBtn.innerHTML = "×";
  deleteBtn.setAttribute("aria-label", "Delete image");
  deleteBtn.addEventListener("click", () => {
    galleryItem.remove();
    saveImages();
    checkEmptyState();
  });

  frameInner.appendChild(img);
  pinkFrame.appendChild(ribbonTailLeft);
  pinkFrame.appendChild(ribbonTailRight);
  pinkFrame.appendChild(frameInner);
  galleryItem.appendChild(pinkFrame);
  galleryItem.appendChild(cropBtn);
  galleryItem.appendChild(deleteBtn);
  galleryGrid.appendChild(galleryItem);

  saveImages();
}

function checkEmptyState() {
  const galleryGrid = document.getElementById("galleryGrid");
  if (!galleryGrid) return;

  const hasImages = galleryGrid.querySelectorAll(".gallery-item").length > 0;
  
  if (!hasImages) {
    const emptyState = document.createElement("div");
    emptyState.className = "gallery-empty";
    emptyState.innerHTML = `
      <div class="gallery-empty-icon">📸</div>
      <p>No photos yet. Click "Add Photos" above to get started!</p>
    `;
    galleryGrid.appendChild(emptyState);
  }
}

function attachImageUpload() {
  const uploadInput = document.getElementById("imageUpload");
  if (!uploadInput) return;

  uploadInput.addEventListener("change", (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file. Please select an image.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        addImageToGallery(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    uploadInput.value = "";
  });
}

/**
 * Smooth scroll to the "Sweet moments" section.
 */
function attachScrollToMoments() {
  if (!scrollToMomentsBtn) return;
  const target = document.querySelector("#moments");
  if (!target) return;

  scrollToMomentsBtn.addEventListener("click", () => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

/**
 * Spawn cute heart burst around the click position.
 */
function createHeartBurst(x, y) {
  const hearts = ["💖", "💘", "💗", "💞"];

  for (let i = 0; i < 9; i += 1) {
    const heart = document.createElement("span");
    heart.classList.add("burst-heart");
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

    // Slight random offset so they don't overlap perfectly
    const dx = (Math.random() - 0.5) * 80;
    const dy = (Math.random() - 0.5) * 50;

    heart.style.left = `${x + dx}px`;
    heart.style.top = `${y + dy}px`;

    document.body.appendChild(heart);

    heart.addEventListener("animationend", () => heart.remove());
  }
}

/**
 * Attach surprise button behavior.
 * Shows a mini burst of hearts and also opens the love modal.
 */
function attachSurpriseButton() {
  if (!surpriseBtn) return;

  surpriseBtn.addEventListener("click", (event) => {
    const x = event.clientX;
    const y = event.clientY;
    createHeartBurst(x, y);
    openModal();
  });
}

/**
 * Create custom cursor trail with hearts and sparkles
 */
let cursorTrailTimeout;
let lastCursorTime = 0;

function createCursorTrail(x, y) {
  const now = Date.now();
  // Throttle to avoid too many elements
  if (now - lastCursorTime < 50) return;
  lastCursorTime = now;

  // Randomly choose between heart and sparkle
  const isHeart = Math.random() > 0.4;
  const element = document.createElement("span");
  element.classList.add(isHeart ? "cursor-heart" : "cursor-sparkle");
  element.textContent = isHeart 
    ? ["💖", "💗", "💘", "💕", "💞"][Math.floor(Math.random() * 5)]
    : ["✨", "⭐", "💫", "🌟"][Math.floor(Math.random() * 4)];
  
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  
  document.body.appendChild(element);
  
  // Remove after animation
  setTimeout(() => {
    if (element.parentNode) {
      element.remove();
    }
  }, 1000);
}

function attachCursorTrail() {
  document.addEventListener("mousemove", (e) => {
    createCursorTrail(e.clientX, e.clientY);
  });
}

/**
 * Crop Modal Functions
 */
let cropperInstance = null;
let currentCropCallback = null;

function openCropModal(imageSrc, callback, imageId) {
  const cropModal = document.getElementById("cropModal");
  const cropImage = document.getElementById("cropImage");
  const cropModalBackdrop = document.getElementById("cropModalBackdrop");
  const cropModalClose = document.getElementById("cropModalClose");
  const cropCancelBtn = document.getElementById("cropCancelBtn");
  const cropApplyBtn = document.getElementById("cropApplyBtn");
  
  if (!cropModal || !cropImage) return;
  
  currentCropCallback = callback;
  cropImage.src = imageSrc;
  
  // Show modal
  cropModal.classList.add("show");
  cropModal.classList.remove("hidden");
  cropModal.setAttribute("aria-hidden", "false");
  
  // Initialize Cropper.js
  if (cropperInstance) {
    cropperInstance.destroy();
  }
  
  cropperInstance = new Cropper(cropImage, {
    aspectRatio: NaN, // Free aspect ratio
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.8,
    restore: false,
    guides: true,
    center: true,
    highlight: false,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleable: false,
    responsive: true,
    minCropBoxWidth: 50,
    minCropBoxHeight: 50,
  });
  
  // Close handlers
  function closeCropModal() {
    if (cropperInstance) {
      cropperInstance.destroy();
      cropperInstance = null;
    }
    cropModal.classList.remove("show");
    setTimeout(() => {
      cropModal.classList.add("hidden");
      cropModal.setAttribute("aria-hidden", "true");
    }, 220);
    currentCropCallback = null;
  }
  
  if (cropModalBackdrop) {
    cropModalBackdrop.onclick = closeCropModal;
  }
  if (cropModalClose) {
    cropModalClose.onclick = closeCropModal;
  }
  if (cropCancelBtn) {
    cropCancelBtn.onclick = closeCropModal;
  }
  
  // Apply crop
  if (cropApplyBtn) {
    cropApplyBtn.onclick = () => {
      if (cropperInstance && currentCropCallback) {
        const canvas = cropperInstance.getCroppedCanvas({
          width: 800,
          height: 800,
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });
        
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        currentCropCallback(croppedDataUrl);
        closeCropModal();
      }
    };
  }
  
  // ESC key to close
  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape" && !cropModal.classList.contains("hidden")) {
      closeCropModal();
      document.removeEventListener("keydown", escHandler);
    }
  });
}

/**
 * Handle editable images in love-note section
 */
function attachEditableImages() {
  const editableImages = document.querySelectorAll(".editable-image");
  
  editableImages.forEach((block) => {
    const input = block.querySelector(".image-upload-input");
    const img = block.querySelector(".editable-img");
    const replaceBtn = block.querySelector(".replace-image-btn");
    const cropBtn = block.querySelector(".crop-image-btn");
    const deleteBtn = block.querySelector(".delete-editable-image-btn");
    const imageId = input.dataset.imageId;
    
    // Load saved image if exists
    try {
      const saved = localStorage.getItem(`loveNoteImage_${imageId}`);
      if (saved) {
        img.src = saved;
        block.classList.add("has-image");
      }
    } catch (error) {
      console.error("Error loading saved image:", error);
    }
    
    // Click placeholder to upload
    const placeholder = block.querySelector(".image-placeholder");
    if (placeholder) {
      placeholder.addEventListener("click", (e) => {
        e.stopPropagation();
        input.click();
      });
    }
    
    // Replace button - trigger file input
    if (replaceBtn) {
      replaceBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        input.click();
      });
    }
    
    // Crop button - open crop modal
    if (cropBtn) {
      cropBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (img.src && block.classList.contains("has-image")) {
          openCropModal(img.src, (croppedDataUrl) => {
            img.src = croppedDataUrl;
            // Save to localStorage
            try {
              localStorage.setItem(`loveNoteImage_${imageId}`, croppedDataUrl);
            } catch (error) {
              console.error("Error saving cropped image:", error);
            }
          }, imageId);
        }
      });
    }
    
    // Delete button - remove image
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        img.src = "";
        block.classList.remove("has-image");
        
        // Remove from localStorage
        try {
          localStorage.removeItem(`loveNoteImage_${imageId}`);
        } catch (error) {
          console.error("Error removing image:", error);
        }
      });
    }
    
    // Click image area to upload (only if no image)
    block.addEventListener("click", (e) => {
      // Don't trigger if clicking buttons
      if (e.target === replaceBtn || e.target === deleteBtn || 
          replaceBtn?.contains(e.target) || deleteBtn?.contains(e.target)) {
        return;
      }
      
      // Only trigger upload if no image is present
      if (!block.classList.contains("has-image")) {
        input.click();
      }
    });
    
    // Handle file selection
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target.result;
        block.classList.add("has-image");
        
        // Save to localStorage
        try {
          localStorage.setItem(`loveNoteImage_${imageId}`, event.target.result);
        } catch (error) {
          console.error("Error saving image:", error);
        }
      };
      reader.readAsDataURL(file);
      
      // Reset input
      input.value = "";
    });
  });
}

/**
 * Handle name input and personalize greeting
 */
function attachNameInput() {
  const nameInput = document.getElementById("nameInput");
  const personalizedGreeting = document.getElementById("personalizedGreeting");
  
  if (!nameInput || !personalizedGreeting) return;
  
  // Load saved name
  try {
    const savedName = localStorage.getItem("valentineUserName");
    if (savedName) {
      nameInput.value = savedName;
      updateGreeting(savedName, personalizedGreeting);
    }
  } catch (error) {
    console.error("Error loading saved name:", error);
  }
  
  // Update greeting on input
  nameInput.addEventListener("input", (e) => {
    const name = e.target.value.trim();
    updateGreeting(name, personalizedGreeting);
    
    // Save to localStorage
    try {
      if (name) {
        localStorage.setItem("valentineUserName", name);
      } else {
        localStorage.removeItem("valentineUserName");
      }
    } catch (error) {
      console.error("Error saving name:", error);
    }
  });
  
  // Update on blur (when user finishes typing)
  nameInput.addEventListener("blur", () => {
    const name = nameInput.value.trim();
    if (!name) {
      nameInput.value = "";
      updateGreeting("You", personalizedGreeting);
    }
  });
}

function updateGreeting(name, element) {
  if (!element) return;
  
  if (name && name.length > 0) {
    // Capitalize first letter
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    element.textContent = capitalizedName;
  } else {
    element.textContent = "You";
  }
}

/**
 * Handle Spotify track input - allow users to change the song
 */
function attachSpotifyTrackInput() {
  const trackInput = document.getElementById("spotifyTrackInput");
  const spotifyPlayer = document.getElementById("spotifyPlayer");
  
  if (!trackInput || !spotifyPlayer) return;
  
  // Load saved track ID
  try {
    const savedTrackId = localStorage.getItem("spotifyTrackId");
    if (savedTrackId) {
      trackInput.value = savedTrackId;
      updateSpotifyPlayer(savedTrackId, spotifyPlayer);
    }
  } catch (error) {
    console.error("Error loading saved track:", error);
  }
  
  // Update player when user types
  let updateTimeout;
  trackInput.addEventListener("input", (e) => {
    clearTimeout(updateTimeout);
    const trackId = e.target.value.trim();
    
    // Wait for user to stop typing (500ms delay)
    updateTimeout = setTimeout(() => {
      if (trackId && trackId.length > 0) {
        updateSpotifyPlayer(trackId, spotifyPlayer);
        
        // Save to localStorage
        try {
          localStorage.setItem("spotifyTrackId", trackId);
        } catch (error) {
          console.error("Error saving track:", error);
        }
      }
    }, 500);
  });
  
  // Update on Enter key
  trackInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const trackId = trackInput.value.trim();
      if (trackId && trackId.length > 0) {
        updateSpotifyPlayer(trackId, spotifyPlayer);
        try {
          localStorage.setItem("spotifyTrackId", trackId);
        } catch (error) {
          console.error("Error saving track:", error);
        }
      }
    }
  });
}

function updateSpotifyPlayer(trackId, player) {
  // Clean the track ID (remove any URL parts)
  const cleanTrackId = trackId.replace(/https?:\/\/open\.spotify\.com\/track\//, "").split("?")[0].trim();
  
  if (cleanTrackId && cleanTrackId.length > 0) {
    const newSrc = `https://open.spotify.com/embed/track/${cleanTrackId}?utm_source=generator`;
    player.src = newSrc;
  }
}

// Initialize once DOM content is ready
document.addEventListener("DOMContentLoaded", () => {
  startFloatingHearts();
  attachRippleEffects();
  attachScrollReveal();
  attachModalEvents();
  attachScrollToMoments();
  attachSurpriseButton();
  attachChoiceButtons();
  attachImageUpload();
  attachCursorTrail();
  attachEditableImages();
  attachNameInput();
  attachSpotifyTrackInput();
  loadSavedImages();
  checkEmptyState();
});

