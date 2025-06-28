// Global variables
let openTabs = {};
let lastClicked = 0;
let currentChannelElement = null;
let currentLoadTimeout = null;

// Auto-play PlayDesi1 on load
function autoPlayPlayDesi() {
  if (currentUser) {
    setTimeout(() => {
      const playdesiElement = document.querySelector(`.channel[data-name="PlayDesi1"]`);
      if (playdesi1Element) {
        playdesi1Element.click();
      }
    }, 100);
  }
}

const fsBtn = document.getElementById('launch-fullscreen-btn');
const fsIcon = fsBtn.querySelector('i');

fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fsIcon.classList.remove('fa-expand-arrows-alt');
    fsIcon.classList.add('fa-compress-arrows-alt'); // Collapse symbol
  } else {
    document.exitFullscreen();
    fsIcon.classList.remove('fa-compress-arrows-alt');
    fsIcon.classList.add('fa-expand-arrows-alt'); // Expand symbol
  }
});

// Play channel function with optimizations
function playChannel(channel, element) {
  if (!currentUser) {
    loginModal.style.display = 'flex';
    return;
  }

  const now = Date.now();
  if (now - lastClicked < 500) return;
  lastClicked = now;

  const frame = document.getElementById('player-frame');
  const title = document.getElementById('playerTitle');
  const loadingContainer = document.getElementById('loading-container');
  const nameLC = channel.name.toLowerCase();

  // Clear old active channel
  if (currentChannelElement) {
    currentChannelElement.classList.remove('active');
  }
  element.classList.add('active');
  currentChannelElement = element;

// Special handling for external tab channels
if (nameLC.includes("yomovies") || nameLC.includes("einthusan") || nameLC.includes("playdesi2")) {
  handleNewTabOnly(channel.name, channel.url);
  return;
}
  // Set title
  title.innerHTML = `<i class="fas fa-play-circle"></i> Now Playing: ${channel.name}`;

  // Show loading
  loadingContainer.style.display = 'flex';
  frame.style.display = 'none';

  // Clear any existing load timeout
  if (currentLoadTimeout) {
    clearTimeout(currentLoadTimeout);
    currentLoadTimeout = null;
  }

  // Reset iframe
  frame.removeAttribute('srcdoc');
  frame.src = "";

 // if (nameLC.includes("playdesi1")) {
    // Restrict everything: no popups, no forms, no same-origin
  //  frame.sandbox = "allow-scripts";
// } else 
    if (nameLC.includes("abzy")) {
       frame.sandbox = "allow-scripts allow-popups";
    } else {
      frame.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";
    }

  // Unified onload handler
  frame.onload = function() {
    // Clear the timeout if it exists
    if (currentLoadTimeout) {
      clearTimeout(currentLoadTimeout);
      currentLoadTimeout = null;
    }
    frame.style.display = 'block';
    loadingContainer.style.display = 'none';
  };

if (nameLC.includes("playdesi1")) {
  frame.srcdoc = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    </style>
    <script>
      document.addEventListener("click", function(e) {
        let target = e.target;
        while (target && target.tagName !== "A") {
          target = target.parentElement;
        }
        if (target && target.href) {
          const url = target.href;
          if (url.includes("starscopinsider.com")) {
            window.open(url, "_blank", "noopener");
          } else {
            e.preventDefault();
            alert("Blocked: Only starscopinsider.com is allowed.");
          }
        }
      }, true);
    <\/script>
    <iframe src="${channel.url}" allow="allow-scripts allow-popups allow-top-navigation-by-user-activation"></iframe>
  `;
  return;
}
  // Start loading the channel
  frame.src = channel.url;

function injectLinkFilter() {
  const frame = document.getElementById("player-frame");

  if (!frame) return;

  frame.onload = () => {
    try {
      const iframeDoc = frame.contentDocument || frame.contentWindow.document;

      iframeDoc.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;

        const href = link.href;

        if (href.includes("starscopinsider.com")) {
          e.preventDefault();
          window.open(href, "_blank");
        } else {
          // Block all other popups/navigation
          e.preventDefault();
          console.warn("Blocked popup:", href);
        }
      });
    } catch (err) {
      console.warn("Could not access iframe content due to cross-origin policy.");
    }
  };
}


  // Set a timeout to handle iframe loading issues
  currentLoadTimeout = setTimeout(() => {
    // Hide loading after timeout regardless of status
    loadingContainer.style.display = 'none';
    frame.style.display = 'block';
    currentLoadTimeout = null;
  }, 5000);
}

// Handle channels that open in new tab
function handleNewTabOnly(name, url) {
  const tabKey = name.toLowerCase().includes("yomovies") ? "yomovies" :
                 name.toLowerCase().includes("einthusan") ? "einthusan" :
                 name.toLowerCase().includes("playdesi2") ? "playdesi2" :
                 "external";

  // Close previous tab if still open
  if (openTabs[tabKey] && !openTabs[tabKey].closed) {
    openTabs[tabKey].close();
  }

  // Open new tab
  openTabs[tabKey] = window.open(url, "_blank");

  // Display iframe message
  const frame = document.getElementById('player-frame');
  const title = document.getElementById('playerTitle');

  frame.srcdoc = `
  <html>
    <head>
      <style>
        body {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: #f0f0f0;
          color: #2c3e50;
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 20px;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
      <script>
        document.addEventListener("DOMContentLoaded", function () {
          document.querySelectorAll("a").forEach(link => {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
          });
        });
      </script>
    </head>
    <body>
      <h2 style="font-size:1.8rem; margin-bottom:20px;">\${name} is Playing in Another Tab</h2>
      <p style="font-size:1.1rem; margin-bottom:30px;">Close the \${name} tab to return to the player</p>
      <div style="font-size:4rem; color:#3498db; animation:pulse 2s infinite;">📺</div>
    </body>
  </html>
`;


  title.innerHTML = `<i class="fas fa-play-circle"></i> ${name} opened in another tab`;


// Clear srcdoc when tab closes
const checkClosed = setInterval(() => {
  if (openTabs[tabKey].closed) {
    clearInterval(checkClosed);
    frame.removeAttribute("srcdoc");
    frame.src = "";
    title.innerHTML = `<i class="fas fa-play-circle"></i> Select a channel to start streaming`;

    // ✅ INSERT THIS LINE
    loadingContainer.style.display = 'none';  // Hides spinner when idle

    openTabs[tabKey] = null;

    // Remove active channel highlighting
    document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
  }
}, 1000);
}

// Refresh button
document.getElementById('refresh-btn').addEventListener('click', () => {
  const frame = document.getElementById('player-frame');
  if (frame.src && !frame.src.includes('about:blank')) {
    frame.src = frame.src;
    document.getElementById('loading-container').style.display = 'flex';
  }
});

// Enhanced expansion controls
document.getElementById('expand-btn').addEventListener('click', () => {
  const playerContent = document.getElementById('player-content');
  playerContent.classList.toggle('expanded');
  
  // Create expanded controls if they don't exist
  if (playerContent.classList.contains('expanded') && !document.getElementById('expanded-controls')) {
    const expandedControls = document.createElement('div');
    expandedControls.id = 'expanded-controls';
    expandedControls.className = 'expanded-controls';
    expandedControls.innerHTML = `
      <button class="control-btn" id="contract-btn" title="Contract Player">
        <i class="fas fa-compress"></i>
      </button>
    `;
    playerContent.appendChild(expandedControls);
    
    document.getElementById('contract-btn').addEventListener('click', () => {
      playerContent.classList.remove('expanded');
      document.querySelector('#expand-btn i').className = 'fas fa-expand';
      expandedControls.remove();
    });
  }
  
  // Update icon
  const icon = document.querySelector('#expand-btn i');
  if (playerContent.classList.contains('expanded')) {
    icon.className = 'fas fa-compress';
  } else {
    icon.className = 'fas fa-expand';
    document.getElementById('expanded-controls')?.remove();
  }
});

// MODIFIED: Fullscreen button using native Fullscreen API
document.getElementById('fullscreen-btn').addEventListener('click', () => {
  const playerContent = document.getElementById('player-content');
  
  if (!document.fullscreenElement) {
    playerContent.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err}`);
    });
  } else {
    document.exitFullscreen();
  }
});

// MODIFIED: Handle fullscreen change to update icon
document.addEventListener('fullscreenchange', () => {
  const icon = document.querySelector('#fullscreen-btn i');
  icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
});
