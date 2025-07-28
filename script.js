let openTabs = {};
let lastClicked = 0;
let currentChannelElement = null;
let currentLoadTimeout = null;

// 🔒 Allow only one popup (e.g., Hindi Movies)
let popupAllowedOnce = false;

function autoPlay() {
  if (currentUser) {
    // Optionally change this delay or remove it
    setTimeout(() => {
      // By default, don't autoplay anything, just show welcome
      showLandingPageMessage();

      // Uncomment this if you want to auto-select a default channel like Yupp TV
      /*
      const autoPlayElement = document.querySelector('.channel[data-name="Yupp TV"]');
      if (autoPlayElement) {
        autoPlayElement.click();
      }
      */
    }, 100);
  }
}

function showLandingPageMessage() {
  const frame = document.getElementById('player-frame');
  const title = document.getElementById('playerTitle');
  const loadingContainer = document.getElementById('loading-container');

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
            background: #000;
            color: white;
            font-family: sans-serif;
            text-align: center;
          }
          h2 {
            font-size: 1.6rem;
            margin: 0;
          }
        </style>
      </head>
      <body>
        <h1 style="color: lightblue;">Welcome to Free IPTV Streaming</h1>
        <h2>Please select a channel from the left sidebar to begin watching.</h2> <br><br><br><br>
        <h2 style="color: orange;">Note</h2> 
	<p>Some channels may open a popup tab containing advertisements. Simply close that tab and continue watching here.</p>
      </body>
    </html>`;
  
  frame.style.display = 'block';
  if (loadingContainer) loadingContainer.style.display = 'none';
  if (title) title.innerHTML = `<i class="fas fa-info-circle"></i> Welcome`;
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
  frame.removeAttribute('src');

  if (channel.sandboxLevel === "minimal") {
    frame.sandbox = "allow-scripts allow-popups";
  } else {
    frame.sandbox = "allow-scripts allow-same-origin allow-forms allow-popups";
  }

  frame.onload = function () {
    if (currentLoadTimeout) clearTimeout(currentLoadTimeout);
    frame.style.display = 'block';
    loadingContainer.style.display = 'none';
  };

  if (channel.isSpecialIframe) {
    const sanitizedUrl = channel.url;
    frame.removeAttribute('src');
    frame.srcdoc = `<!DOCTYPE html><html><head><style>html,body{margin:0;height:100%;overflow:hidden}iframe{width:100%;height:100%;border:none}</style></head><body><iframe id='innerFrame' src='${sanitizedUrl}' sandbox='allow-scripts allow-popups allow-same-origin allow-forms' allow='fullscreen'></iframe><script>
const innerFrame=document.getElementById('innerFrame');
window.addEventListener('message', e => {
  const url = e.data;
  if (typeof url === 'string' && url.startsWith('https://starscopinsider.com')) window.open(url, '_blank');
});
innerFrame.onload = () => {
  try {
    const s = document.createElement('script');
    s.textContent = \`
      document.addEventListener('click', e => {
        let el = e.target;
        while (el && el.tagName !== 'A') el = el.parentElement;
        if (el && el.href) {
          e.preventDefault();
          if (el.href.includes('starscopinsider.com')) parent.postMessage(el.href, '*');
          else alert('Blocked: Only starscopinsider.com is allowed.');
        }
      });
    \`;
    innerFrame.contentWindow.document.body.appendChild(s);
  } catch {
    console.warn('Cross-origin script injection blocked');
  }
};
</script></body></html>`;
    return;
  }

  frame.src = channel.url;

  currentLoadTimeout = setTimeout(() => {
    loadingContainer.style.display = 'none';
    frame.style.display = 'block';
    currentLoadTimeout = null;
  }, 5000);
}

function handleNewTabOnly(name, url) {
  const tabKey = name.toLowerCase().replace(/\s+/g, '-');
  const frame = document.getElementById('player-frame');
  const title = document.getElementById('playerTitle');
  const loadingContainer = document.getElementById('loading-container');

  frame.removeAttribute('src');
  frame.removeAttribute('srcdoc');
  frame.src = 'about:blank';
  frame.style.display = 'none';
  if (loadingContainer) loadingContainer.style.display = 'none';

  // 🔒 Block all popups after first popup has been opened
  if (popupAllowedOnce) {
    alert("Popups are blocked after opening first tab.");
    console.warn("Popup blocked for:", name);
    return;
  }

  try {
    if (openTabs[tabKey] && !openTabs[tabKey].closed) {
      openTabs[tabKey].close();
    }

    const newTab = window.open(url, '_blank');

    if (!newTab) {
      console.error(`Failed to open new tab for ${name}. Popup may be blocked.`);
      frame.srcdoc = `
        <html><body style="color:white;background:black;text-align:center;display:flex;flex-direction:column;justify-content:center;height:100vh">
        <h2>Popup Blocked</h2><p>Please allow popups for this site and try again.</p></body></html>`;
      frame.style.display = 'block';
      title.innerHTML = `<i class="fas fa-play-circle"></i> Popup Blocked for ${name}`;
      return;
    }

    openTabs[tabKey] = newTab;

    //🔒 Block all popups after the first new tab is opened
    if (popupAllowedOnce) {
      alert(`Only one popup is allowed per session. '${name}' was blocked.`);
      popupAllowedOnce = true;
      return;
    }

    setTimeout(() => {
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
        </html>`;
      frame.style.display = 'block';
      title.innerHTML = `<i class="fas fa-play-circle"></i> ${name} opened in another tab`;
    }, 100);

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
      frame.removeAttribute('srcdoc');
      frame.removeAttribute('src');
      frame.src = 'about:blank';
      frame.style.display = 'none';
      title.innerHTML = `<i class="fas fa-play-circle"></i> Select a channel to start streaming`;
      if (loadingContainer) loadingContainer.style.display = 'none';
    }
  } catch (e) {
    console.error(`Error in handleNewTabOnly for ${name}:`, e);
    frame.srcdoc = `
      <html>
        <body style="color:white;background:black;text-align:center;display:flex;flex-direction:column;justify-content:center;height:100vh">
          <h2>Error</h2>
          <p>Failed to load ${name}. Please try again.</p>
        </body>
      </html>`;
    frame.style.display = 'block';
    title.innerHTML = `<i class="fas fa-play-circle"></i> Error loading ${name}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderChannels();
  autoPlay();
});

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
      </button>`;
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

window.addEventListener('message', (event) => {
  const url = event.data;
  if (typeof url === 'string' && url.includes('starscopinsider.com')) {
    window.open(url, '_blank');
  }
});
