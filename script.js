let openTabs = {};
let lastClicked = 0;
let currentChannelElement = null;
let currentLoadTimeout = null;

function autoPlayPlayDesi() {
  if (currentUser) {
    setTimeout(() => {
      const playdesiElement = document.querySelector('.channel[data-name="YuppTV"]');
      if (playdesiElement) {
        playdesiElement.click();
      }
    }, 100);
  }
}

const fsBtn = document.getElementById('launch-fullscreen-btn');
const fsIcon = fsBtn.querySelector('i');

fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fsIcon.classList.replace('fa-expand-arrows-alt', 'fa-compress-arrows-alt');
  } else {
    document.exitFullscreen();
    fsIcon.classList.replace('fa-compress-arrows-alt', 'fa-expand-arrows-alt');
  }
});

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

  if (currentChannelElement) currentChannelElement.classList.remove('active');
  element.classList.add('active');
  currentChannelElement = element;

  if (channel.openInNewTab) {
    handleNewTabOnly(channel.name, channel.url);
    return;
  }

  title.innerHTML = `<i class="fas fa-play-circle"></i> Now Playing: ${channel.name}`;
  loadingContainer.style.display = 'flex';
  frame.style.display = 'none';
  if (currentLoadTimeout) clearTimeout(currentLoadTimeout);
  frame.removeAttribute('srcdoc');
  frame.src = "";

  // Enhanced sandbox with popup blocking
  if (channel.sandboxLevel === "minimal") {
    frame.sandbox = "allow-scripts allow-presentation";
  } else {
    frame.sandbox = "allow-scripts allow-same-origin allow-forms allow-presentation";
  }

  // Enhanced for YouTube playlists
  if (isYouTubeChannel(channel)) {
    enhanceYouTubeChannel(channel, frame);
  }

  frame.onload = function () {
    if (currentLoadTimeout) clearTimeout(currentLoadTimeout);
    frame.style.display = 'block';
    loadingContainer.style.display = 'none';
    
    // Inject popup blocker into iframe if possible
    injectPopupBlockerToFrame(frame);
  };

  if (channel.isSpecialIframe) {
    const sanitizedUrl = channel.url;
    frame.removeAttribute('src');
    frame.srcdoc = `<!DOCTYPE html><html><head><style>html,body{margin:0;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:none}</style></head><body><iframe id='innerFrame' src='${sanitizedUrl}' sandbox='allow-scripts allow-same-origin allow-forms allow-presentation' allow='fullscreen'></iframe><script>const innerFrame=document.getElementById('innerFrame');const blockedDomains=['doubleclick.net','googlesyndication.com','popads.net'];window.addEventListener('message',e=>{const url=e.data;if(typeof url==='string'){const isBlocked=blockedDomains.some(domain=>url.includes(domain));if(isBlocked){console.log('🚫 Blocked popup from iframe:',url);return;}if(url.startsWith('https://starscopinsider.com'))window.open(url,'_blank')}});innerFrame.onload=()=>{try{const s=document.createElement('script');s.textContent=\`window.open=function(){console.log('🚫 Popup blocked in nested iframe');return null;};document.addEventListener('click',e=>{let el=e.target;while(el&&el.tagName!=='A')el=el.parentElement;if(el&&el.href){const href=el.href;if(href.includes('ad')||href.includes('popup')||href.includes('casino')){e.preventDefault();console.log('🚫 Blocked suspicious link');return;}if(href.includes('starscopinsider.com')){e.preventDefault();parent.postMessage(href,'*');}else{e.preventDefault();console.log('🚫 Blocked external link');}}})\`;innerFrame.contentWindow.document.body.appendChild(s);}catch{console.warn('Cross-origin script injection blocked')}};<\/script></body></html>`;
    return;
  }

  frame.src = channel.url;

  currentLoadTimeout = setTimeout(() => {
    loadingContainer.style.display = 'none';
    frame.style.display = 'block';
    currentLoadTimeout = null;
  }, 5000);
}

// Helper function to check if channel is YouTube
function isYouTubeChannel(channel) {
  return channel.url && (
    channel.url.includes('youtube.com') || 
    channel.url.includes('youtu.be')
  );
}

// Enhanced YouTube channel handling
function enhanceYouTubeChannel(channel, frame) {
  try {
    const url = new URL(channel.url);
    const params = new URLSearchParams(url.search);
    
    // Enable autoplay for YouTube
    params.set('autoplay', '1');
    params.set('rel', '0'); // Don't show related videos
    params.set('modestbranding', '1'); // Minimal YouTube branding
    params.set('iv_load_policy', '3'); // Hide annotations
    params.set('enablejsapi', '1'); // Enable JavaScript API
    params.set('origin', window.location.origin);
    
    // Enhanced playlist support
    if (url.pathname.includes('/playlist') || params.has('list')) {
      params.set('loop', '1');
      params.set('playlist', params.get('list') || '');
      console.log('🎵 Enhanced YouTube playlist for:', channel.name);
    }
    
    url.search = params.toString();
    channel.url = url.toString();
    
    // Set iframe attributes for YouTube
    frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
    
  } catch (e) {
    console.warn('Failed to enhance YouTube URL:', e);
  }
}

// Inject popup blocker into iframe
function injectPopupBlockerToFrame(frame) {
  setTimeout(() => {
    try {
      if (frame.contentWindow && frame.contentDocument) {
        const script = frame.contentDocument.createElement('script');
        script.textContent = `
          // Popup blocker for iframe
          window.open = function(url, target, features) {
            const blockedPatterns = [/popup/i, /ad/i, /casino/i, /betting/i, /adult/i];
            if (url && blockedPatterns.some(pattern => pattern.test(url))) {
              console.log('🚫 Popup blocked in iframe:', url);
              return null;
            }
            return null; // Block all popups by default
          };
          
          // Block suspicious clicks
          document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
              const href = e.target.href;
              if (href && (href.includes('ad') || href.includes('popup') || href.includes('casino'))) {
                e.preventDefault();
                console.log('🚫 Blocked suspicious link in iframe');
              }
            }
          });
          
          // Remove ad elements
          function removeAds() {
            const adSelectors = ['[id*="ad"]', '[class*="ad"]', '[class*="popup"]'];
            adSelectors.forEach(selector => {
              try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                  if (el.textContent && el.textContent.toLowerCase().includes('advertisement')) {
                    el.style.display = 'none';
                  }
                });
              } catch (e) {}
            });
          }
          removeAds();
          setInterval(removeAds, 2000);
        `;
        frame.contentDocument.head.appendChild(script);
        console.log('✅ Popup blocker injected into iframe');
      }
    } catch (e) {
      // Cross-origin iframe, cannot inject script
      console.log('ℹ️ Cannot inject popup blocker into cross-origin iframe');
    }
  }, 1000);
}

function handleNewTabOnly(name, url) {
  const tabKey = name.toLowerCase().replace(/\s+/g, '-');
  const frame = document.getElementById('player-frame');
  const title = document.getElementById('playerTitle');
  const loadingContainer = document.getElementById('loading-container');

  if (openTabs[tabKey] && !openTabs[tabKey].closed) {
    openTabs[tabKey].close();
  }

  const newTab = window.open(url, '_blank');
  if (!newTab) {
    alert("Popup blocked! Please allow popups for this site.");
    return;
  }

  openTabs[tabKey] = newTab;

  frame.srcdoc = `
    <html>
      <head>
        <style>
          body {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            height: 100vh;
            font-family: sans-serif;
            text-align: center;
            background: #000;
            color: #fff;
          }
          button {
            margin-top: 10px;
            padding: 10px 20px;
            font-size: 16px;
            background: #28a745;
            border: none;
            border-radius: 6px;
            color: white;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h2 style='font-size:1.8rem;'>${name} is Playing in Another Tab</h2>
        <p>Close the ${name} tab or click below to return.</p>
        <button onclick="parent.postMessage('return-player', '*')">Return to Player</button> 
      </body>
    </html>
  `;

  title.innerHTML = `<i class="fas fa-play-circle"></i> ${name} opened in another tab`;
  document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));

  const checkClosed = setInterval(() => {
    if (openTabs[tabKey] && openTabs[tabKey].closed) {
      clearInterval(checkClosed);
      resetPlayer();
    }
  }, 1000);

  window.addEventListener('message', function handler(e) {
    if (e.data === 'return-player') {
      clearInterval(checkClosed);
      window.removeEventListener('message', handler);
      resetPlayer();
    }
  });

  function resetPlayer() {
    openTabs[tabKey] = null;
    frame.removeAttribute("srcdoc");
    frame.src = '';
    title.innerHTML = `<i class="fas fa-play-circle"></i> Select a channel to start streaming`;
    if (loadingContainer) loadingContainer.style.display = 'none';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderChannels();
  autoPlayPlayDesi();
});

// ✅ Moved outside any function: Refresh and Expand buttons
document.getElementById('refresh-btn').addEventListener('click', () => {
  const frame = document.getElementById('player-frame');
  if (frame.src && !frame.src.includes('about:blank')) {
    frame.src = frame.src;
    document.getElementById('loading-container').style.display = 'flex';
  }
});

document.getElementById('expand-btn').addEventListener('click', () => {
  const playerContent = document.getElementById('player-content');
  playerContent.classList.toggle('expanded');

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

  const icon = document.querySelector('#expand-btn i');
  if (playerContent.classList.contains('expanded')) {
    icon.className = 'fas fa-compress';
  } else {
    icon.className = 'fas fa-expand';
    document.getElementById('expanded-controls')?.remove();
  }
});
