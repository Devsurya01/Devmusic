const songList = document.getElementById("songList");
const player = document.getElementById("player");
const search = document.getElementById("search");
const themeSelector = document.getElementById("themeSelector");
const showLoader = () => document.getElementById('globalLoader').style.display = 'flex';
const hideLoader = () => document.getElementById('globalLoader').style.display = 'none';

// Player card elements
const profileTrigger = document.getElementById('profileTrigger');
const playerCard = document.getElementById("playerCard");
const playerTitle = document.querySelector(".player-song-title");
const playerArtist = document.querySelector(".player-artist");
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.querySelector(".current-time");
const durationEl = document.querySelector(".duration");

let songs = [];
let currentSongIndex = -1;

// Play very soft hover sound for card
function playCardHoverSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 500;
  oscillator.type = "sine";
  
  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

// Play softest smooth click sound
function playClickSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Create multiple oscillators for a richer, smoother sound
  const osc1 = audioContext.createOscillator();
  const osc2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Lower frequencies for smoothness
  osc1.frequency.value = 300;
  osc2.frequency.value = 250;
  osc1.type = "sine";
  osc2.type = "sine";
  
  // Very smooth envelope
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
  
  osc1.start(audioContext.currentTime);
  osc2.start(audioContext.currentTime);
  osc1.stop(audioContext.currentTime + 0.5);
  osc2.stop(audioContext.currentTime + 0.5);
}

// Create random music symbols in background
// Create random music images in background
function createRandomSymbols() {
  // Array of your image filenames
  const imageSources = [
    "assets/icons/music (1).png", 
    "assets/icons/music (2).png",
    "assets/icons/music (3).png",
    "assets/icons/music.png",
    "assets/icons/musical-note.png"
    // Add more image filenames here as needed
  ];
  const neonFilters = [
    "invert(72%) sepia(95%) saturate(400%) hue-rotate(120deg)", // Cyan
    "invert(27%) sepia(91%) saturate(2352%) hue-rotate(346deg)", // Red
    "invert(80%) sepia(50%) saturate(1000%) hue-rotate(280deg)", // Purple
    "invert(90%) sepia(80%) saturate(500%) hue-rotate(60deg)",  // Yellow
    "invert(60%) sepia(90%) saturate(3000%) hue-rotate(90deg)"   // Green
  ];
  
  const imageCount = 150; // Reduced count because images take more memory than text
  
  for (let i = 0; i < imageCount; i++) {
    const img = document.createElement("img");
    img.className = "symbol"; // Keeping the class name for CSS styling
    
    // Pick a random image from your list
    img.src = imageSources[Math.floor(Math.random() * imageSources.length)];
    
    // Random positioning
    img.style.left = Math.random() * 95 + "%";
    img.style.top = Math.random() * 100 + "%";
    
    // Random sizing
    const size = Math.random() * 30 + 20; // Size between 20px and 50px
    img.style.width = size + "px";
    img.style.height = "auto";
    
    // Random rotation for variety
    img.style.transform = `rotate(${Math.random() * 180}deg)`;
    
    document.body.appendChild(img);
  }
}

// Call on page load
window.addEventListener("load", createRandomSymbols);

// Update player card display
function updatePlayerCard(song) {
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  
  // Update the image in the player card
  const playerArt = document.getElementById("playerAlbumArt");
  playerArt.src = song.image || 'assets/icons/music.png';
  
  playBtn.textContent = "⏸";
  player.play();
}

// Format time (seconds to mm:ss)
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Player controls
playBtn.addEventListener("click", () => {
  if (player.src) {
    if (player.paused) {
      player.play();
      playBtn.textContent = "⏸";
    } else {
      player.pause();
      playBtn.textContent = "▶";
    }
  }
});

// Progress bar seek
progressBar.addEventListener("input", (e) => {
  if (player.src) {
    player.currentTime = (player.duration / 100) * e.target.value;
  }
});

// Update progress bar and time
player.addEventListener("timeupdate", () => {
  if (player.duration) {
    progressBar.value = (player.currentTime / player.duration) * 100;
    currentTimeEl.textContent = formatTime(player.currentTime);
    durationEl.textContent = formatTime(player.duration);
  }
});

// Next song
nextBtn.addEventListener("click", () => {
  if (currentSongIndex < songs.length - 1) {
    currentSongIndex++;
    playSong(songs[currentSongIndex]);
  }
});

// Previous song
prevBtn.addEventListener("click", () => {
  if (currentSongIndex > 0) {
    currentSongIndex--;
    playSong(songs[currentSongIndex]);
  }
});

// Play a specific song
function playSong(song) {
    if (typeof playClickSound === 'function') playClickSound();
    currentSongIndex = songs.indexOf(song);
    player.src = song.file;

    // --- NEW HIGHLIGHT LOGIC ---
    // 1. Remove highlight from ALL other song containers
    document.querySelectorAll('.song-item-container').forEach(card => {
        card.classList.remove('playing-highlight');
    });

    // 2. Add highlight to the specific song container just clicked
    // We target the parent element of the wrapper that was clicked
    const activeCard = document.getElementById(`card-${song.id}`);
    if (activeCard) {
        activeCard.classList.add('playing-highlight');
    }
    // ---------------------------

    const playerArt = document.getElementById("playerAlbumArt");
    if (playerArt) {
        playerArt.src = song.image || 'assets/icons/music.png';
    }

    updatePlayerCard(song);
}
fetch("https://devmusic-a4hy.onrender.com/songs")
  .then(res => res.json())
  .then(data => {
    songs = data;
    displaySongs(songs);
  });

// --- Updated displaySongs to check for existing likes ---
// --- Updated displaySongs with functional Like button and Syncing ---
async function displaySongs(songArray) {
    // 1. Fetch current library state to mark already liked songs
    let likedIds = [];
    try {
        const response = await fetch("http://devmusic-a4hy.onrender.com/liked");
        const likedSongs = await response.json();
        likedIds = likedSongs.map(s => s.id);
    } catch (err) {
        console.error("Could not fetch library status:", err);
    }

    songList.innerHTML = "";
    songArray.forEach(song => {
    const container = document.createElement("div");
    container.className = "song-item-container";
    // ADD THIS LINE: Assign unique ID to each card for highlighting
    container.id = `card-${song.id}`; 
    
    // ... rest of your existing innerHTML code ...
        
        // 2. Check if this song's ID exists in the liked list
        const isSongLiked = likedIds.includes(song.id);

        container.innerHTML = `
            <div class="song-info-wrapper" style="display: flex; align-items: center; flex: 1; cursor: pointer;">
                <img src="${song.image || 'assets/icons/music.png'}" class="song-list-img">
                <div class="song-details">
                    <strong>${song.title}</strong><br>
                    <span style="font-size: 12px; color: #888;">${song.artist}</span>
                </div>
            </div>
            <button class="like-btn ${isSongLiked ? 'liked' : ''}" id="like-${song.id}">
                <img src="assets/icons/like.png" alt="Like" class="action-icon">
            </button>
        `;

        // 3. Attach play function to the song info
        container.querySelector('.song-info-wrapper').onclick = () => playSong(song);

        // 4. FIX: Attach click listener to the like button
       // --- Updated Like Button Logic in displaySongs ---
const likeBtn = container.querySelector('.like-btn');
likeBtn.onclick = async (e) => {
    e.stopPropagation();
    const willLike = !likeBtn.classList.contains('liked');
    
    likeBtn.classList.toggle('liked');
    await toggleLikeStatus(song, willLike);
    
    // Trigger specific toast based on the new state
    if (willLike) {
        showToast("Added to Library ❤️");
    } else {
        showToast("Removed from Library");
    }
};

        songList.appendChild(container);
    });
}
// Close overlay on submit or skip
// Updated Auth Logic to talk to Backend
// Auth Logic
// --- Spotify-Style Auth Logic ---
// --- Unified Spotify-Style Logic ---
// --- Persistent Login & Authentication Logic ---
const checkAuth = () => {
  const savedUser = localStorage.getItem('devmusics_user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    
    // If a local image was saved, apply it to the icons
    if (currentUser.profilePic) {
      const profileImgElements = document.querySelectorAll('.profile-icon img');
      profileImgElements.forEach(img => img.src = currentUser.profilePic);
    }
    
    authPage.style.display = 'none';
    mainApp.style.display = 'block';
  }
};

const handleAuth = async (e, type) => {
  e.preventDefault();
  showLoader();
  fetch("https://devmusic-a4hy.onrender.com/songs")
  .then(res => res.json())
  .then(data => {
    songs = data;
    displaySongs(songs);
  })
  .finally(() => hideLoader()); // Show loader on Login/Signup

  const inputs = e.target.querySelectorAll('input');
  const payload = type === 'signup' 
    ? { email: inputs[0].value, password: inputs[1].value, name: inputs[2].value }
    : { email: inputs[0].value, password: inputs[1].value };

  try {
    const response = await fetch(`http://devmusic-a4hy.onrender.com/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      currentUser = { email: payload.email, name: result.user?.name || payload.name || "User" };
      localStorage.setItem('devmusics_user', JSON.stringify(currentUser));
      document.getElementById('authPage').style.display = 'none';
      document.getElementById('mainApp').style.display = 'block';
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.warn("Backend offline, entering local session mode.");
    currentUser = { email: payload.email, name: payload.name || "User" };
    localStorage.setItem('devmusics_user', JSON.stringify(currentUser));
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
  } finally {
    hideLoader(); // Always hide loader when done
  }
};
// Event Listeners for Auth
loginForm.addEventListener('submit', (e) => handleAuth(e, 'login'));
signupForm.addEventListener('submit', (e) => handleAuth(e, 'signup'));

document.getElementById('skipAuth').onclick = () => {
  authPage.style.display = 'none';
  mainApp.style.display = 'block';
};

// Navigation between Login and Signup screens
document.getElementById('toSignup').onclick = () => {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('signupSection').style.display = 'block';
};

document.getElementById('toLogin').onclick = () => {
  document.getElementById('signupSection').style.display = 'none';
  document.getElementById('loginSection').style.display = 'block';
};

// --- Profile & Logout Logic ---
profileTrigger.onclick = () => {
  profileModal.style.display = 'flex';
  document.getElementById('displayUserName').innerText = currentUser?.name || 'Guest';
  document.getElementById('displayUserEmail').innerText = currentUser?.email || 'Not logged in';
};

document.getElementById('closeProfile').onclick = () => {
  profileModal.style.display = 'none';
};

logoutBtn.onclick = () => {
  localStorage.removeItem('devmusics_user'); // Clear saved session
  window.location.reload();
};
// --- Corrected Player Logic for Text Icons ---
function updatePlayerCard(song) {
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  // Set to pause icon immediately when a song starts playing
  playBtn.textContent = "⏸"; 
  player.play();
}

playBtn.addEventListener("click", () => {
  if (player.src) {
    if (player.paused) {
      player.play();
      playBtn.textContent = "⏸";
    } else {
      player.pause();
      playBtn.textContent = "▶";
    }
  }
});

// --- Search Logic ---
search.addEventListener("input", () => {
  const value = search.value.toLowerCase();
  const filtered = songs.filter(song => song.title.toLowerCase().includes(value));
  displaySongs(filtered);
});

// Run session check immediately when script loads
checkAuth();
// --- Auto-play Next Song ---
player.addEventListener("ended", () => {
  // Check if there is a next song in the list
  if (currentSongIndex < songs.length - 1) {
    currentSongIndex++;
    playSong(songs[currentSongIndex]);
  } else {
    // If it's the last song, reset to play icon
    playBtn.textContent = "▶";
  }
});
// --- Corrected Player Logic for Text Icons ---
// This ensures that when a song is first clicked, the icon updates immediately
function updatePlayerCard(song) {
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  playBtn.textContent = "⏸"; // Music started, show pause icon
  player.play();
}

// Manages the manual play/pause button clicks
playBtn.addEventListener("click", () => {
  if (player.src) {
    if (player.paused) {
      player.play();
      playBtn.textContent = "⏸"; // Switch to pause icon
    } else {
      player.pause();
      playBtn.textContent = "▶"; // Switch back to play icon
    }
  }
});

// Monitors when a song finishes to trigger the next one
player.addEventListener("ended", () => {
  if (currentSongIndex < songs.length - 1) {
    currentSongIndex++;
    playSong(songs[currentSongIndex]); // Play the next track in the list
  } else {
    playBtn.textContent = "▶"; // Reset icon if it was the last song
  }
});

// Run session check immediately when script loads
checkAuth();
// --- Responsive View Switcher ---
const navHome = document.getElementById('navHome');
const navLibrary = document.getElementById('navLibrary');
const homeView = document.getElementById('homeView');
const libraryView = document.getElementById('libraryView');

// --- Smoothest & Softest Navigation Sound ---
function playNavSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // 'sine' is the smoothest possible waveform
  osc.type = 'sine'; 
  
  // A lower frequency (250Hz) feels softer than a high beep
  osc.frequency.setValueAtTime(250, audioCtx.currentTime); 
  
  // --- Soft Volume Envelope ---
  // Start at zero volume
  gain.gain.setValueAtTime(0, audioCtx.currentTime); 
  // Fade in quickly but smoothly (0.05s)
  gain.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.05); 
  // Fade out gently (0.4s)
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4); 

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

navHome.onclick = () => {
  playNavSound();
  homeView.style.display = 'block';
  libraryView.style.display = 'none';
  navHome.classList.add('active');
  navLibrary.classList.remove('active');
};

navLibrary.onclick = () => {
  playNavSound();
  homeView.style.display = 'none';
  libraryView.style.display = 'block';
  navLibrary.classList.add('active');
  navHome.classList.remove('active');
  loadLibrary(); 
};

// --- Updated Library Management ---
// --- Updated Library Management with Automatic Home Sync ---
function loadLibrary() {
  fetch("http://devmusic-a4hy.onrender.com/liked")
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('likedSongList');
      list.innerHTML = data.length ? "" : "<p style='color:#888'>Your library is empty.</p>";
      
      data.forEach(song => {
        const div = document.createElement("div");
        div.className = "song-item-container";
        div.innerHTML = `
          <div style="flex:1; cursor:pointer;">
            <strong>${song.title}</strong><br>
            <small>${song.artist}</small>
          </div>
          <button class="remove-btn">
            <img src="assets/icons/x.png" alt="Delete" class="action-icon">
          </button>
        `;

        div.onclick = () => playSong(song);

        // --- Updated Remove Button Logic in loadLibrary ---
div.querySelector('.remove-btn').onclick = async (e) => {
    e.stopPropagation();
    
    await toggleLikeStatus(song, false); // Backend removal
    div.remove(); // UI removal from library list
    displaySongs(songs); // UI sync for home hearts
    
    // Trigger removal toast
    showToast("Removed from Library");
};
        list.appendChild(div);
      });
    });
}
async function toggleLikeStatus(song, shouldAdd) {
  const endpoint = shouldAdd ? "like" : "unlike"; 
  try {
    const response = await fetch(`http://devmusic-a4hy.onrender.com/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(song)
    });
    const result = await response.json();
    console.log("Library status:", result.message);
  } catch (err) {
    console.error("Connection failed:", err);
  }
}
// --- Close Profile Modal when clicking outside the card ---
window.addEventListener("click", (event) => {
  const modal = document.getElementById('profileModal');
  
  // If the user clicks the dark overlay background, close the modal
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
// --- Handle Profile Updates (Name & Local Image) ---
document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const newName = document.getElementById('editName').value;
  const imageInput = document.getElementById('editImage');
  const profileImgElements = document.querySelectorAll('.profile-icon img'); // Selects all profile images

  // 1. Update Name
  if (newName) {
    currentUser.name = newName;
    document.getElementById('displayUserName').innerText = newName;
  }

  // 2. Update Image from Local Storage
  if (imageInput.files && imageInput.files[0]) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      const imageData = event.target.result; // This is the local file as a string
      
      // Update all profile images on the page immediately
      profileImgElements.forEach(img => img.src = imageData);
      
      // Save image to currentUser object
      currentUser.profilePic = imageData;
      
      // Save everything to localStorage so it stays after refresh
      localStorage.setItem('devmusics_user', JSON.stringify(currentUser));
    };
    
    reader.readAsDataURL(imageInput.files[0]); // Start reading the local file
  }

  // Save name/password changes to local session
  localStorage.setItem('devmusics_user', JSON.stringify(currentUser));
  
  alert("Profile updated locally! 🎉");
  document.getElementById('profileModal').style.display = 'none';
});
// --- Function to update all profile image tags on the page ---
// --- Updated Image Sync & Button Visibility Logic ---
const updateAllProfileImages = (src) => {
  const defaultIcon = 'assets/icons/profile.png';
  const finalSrc = src || defaultIcon;
  
  // Update all profile image elements
  document.querySelectorAll('.profile-icon img, #modalProfilePreview').forEach(img => {
    img.src = finalSrc;
  });

  // LOGIC: Only show "Remove Photo" if the current image is NOT the default icon
  const removeBtn = document.getElementById('removePhotoBtn');
  if (removeBtn) {
    if (finalSrc === defaultIcon) {
      removeBtn.style.display = 'none'; // Hide if default
    } else {
      removeBtn.style.display = 'block'; // Show if custom
    }
  }
};

// --- Updated Remove Photo Logic ---
document.getElementById('removePhotoBtn').onclick = () => {
  updateAllProfileImages(null); // Reverts to default and hides the button
  
  if (currentUser) {
    delete currentUser.profilePic; // Clear from memory
    localStorage.setItem('devmusics_user', JSON.stringify(currentUser)); // Clear from storage
  }
  showToast("Profile photo removed.");
};

// --- Updated Profile Trigger ---
profileTrigger.onclick = () => {
  profileModal.style.display = 'flex';
  
  // Set text
  document.getElementById('displayUserName').innerText = currentUser?.name || 'Guest';
  document.getElementById('displayUserEmail').innerText = currentUser?.email || 'Not logged in';
  
  // Ensure the button state matches the current photo when opening
  updateAllProfileImages(currentUser?.profilePic);
};

// --- Edit Icon File Input Handler ---
document.getElementById('editImage').addEventListener('change', function(e) {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target.result;
      updateAllProfileImages(imageData); 
      if (!currentUser) currentUser = { name: "Guest" }; // Handle guest uploads
      currentUser.profilePic = imageData;
      localStorage.setItem('devmusics_user', JSON.stringify(currentUser));
    };
    reader.readAsDataURL(this.files[0]);
  }
});
// Add this to prevent the "playProfileSound is not defined" error
function playProfileSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, audioContext.currentTime);
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.3);

}


