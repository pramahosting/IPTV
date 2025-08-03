let openTabs = {};
let lastClicked = 0;
let currentChannelElement = null;
let currentLoadTimeout = null;
let popupAllowedOnce = false; // 🔒 Allow only one popup (e.g., Hindi Movies)

function autoPlay() {
  if (currentUser) {
    setTimeout(() => {
      showLandingPageMessage();
    }, 100);
  }
}

function showLandingPageMessage() {
  const frame = document.getElementById('player-frame');
  const title = document.getElementById('playerTitle');
  const loadingContainer = document.getElementById('loading-container');

  const userName = currentUser?.name || '';
  const capitalized = userName.charAt(0).toUpperCase() + userName.slice(1);

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
        <h1 style="color: lightblue;">
          Welcome to Free IPTV Streaming${capitalized ? `, <span style='color: deepskyblue;'>${capitalized}</span>` : ''}!
        </h1>
        <h2>Please select a channel from the left sidebar to begin watching.</h2> 
        <br><br><br><br>
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

function isUnsafe(channel) {
  return channel.blockUnsafe === true;
}

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
    if (isUnsafe(channel)) {
      channel.openInNewTab = false;
    } else {
      handleNewTabOnly(channel.name, channel.url);
      return;
    }
  }

  title.innerHTML = `<i class="fas fa-play-circle"></i> Now Playing: ${channel.name}`;
  loadingContainer.style.display = 'flex';
  frame.style.display = 'none';

  document.getElementById('channel-hint-bar')?.remove();
  document.getElementById('channel-info-bar')?.remove();

  const name = channel.name.trim().toLowerCase();
  let message = null;

  if (name === 'abzy tv') {
    message = 'ℹ️ Please right-click on ABZY Channel and select "Open link in new tab".';
  } else if (name === 'indian tv') {
    message = 'ℹ️ Please right-click on the CLICK HERE button and select "Open link in new tab".';
  } else if (name === 'play desi') {
    message = 'ℹ️ Please right-click on the watch online video and select "Open link in new tab".';
  }

  if (message) {
    const bar = document.createElement('div');
    bar.id = 'channel-info-bar';
    bar.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: rgba(30, 30, 30, 0.95);
      color: #fff;
      font-size: 14px;
      padding: 8px 12px;
      text-align: center;
      font-family: sans-serif;
      z-index: 9999;
    `;
    bar.innerText = message;

    const container = document.getElementById('player-content') || document.body;
    container.appendChild(bar);
  }

  if (currentLoadTimeout) clearTimeout(currentLoadTimeout);
  frame.removeAttribute('srcdoc');
  frame.removeAttribute('src');

  frame.sandbox = channel.sandboxLevel === "minimal"
    ? "allow-scripts"
    : "allow-scripts allow-same-origin allow-forms";

  frame.onload = function () {
    if (currentLoadTimeout) clearTimeout(currentLoadTimeout);
    frame.style.display = 'block';
    loadingContainer.style.display = 'none';
  };

  if (channel.isSpecialIframe) {
    const sanitizedUrl = channel.url;
    frame.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body { margin:0; height:100%; overflow:hidden }
            iframe { width:100%; height:100%; border:none }
          </style>
        </head>
        <body>
          <iframe id='innerFrame' src='${sanitizedUrl}' sandbox='allow-scripts allow-popups allow-same-origin allow-forms' allow='fullscreen'></iframe>
          <script>
            const innerFrame = document.getElementById('innerFrame');
            window.addEventListener('message', e => {
              const url = e.data;
              if (typeof url === 'string' && url.startsWith('starscopinsider.com')) window.open(url, '_blank');
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
                      if (el.href.includes('starscopinsider.com') || el.href.includes('youtube.com')) parent.postMessage(el.href, '*');
                      else alert('Blocked: Only starscopinsider.com and youtube.com are allowed.');
                    }
                  });
                \`;
                innerFrame.contentWindow.document.body.appendChild(s);
              } catch {
                console.warn('Cross-origin script injection blocked');
              }
            };
          </script>
        </body>
      </html>`;
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

  try {
    const newTab = window.open(url, '_blank');
    openTabs[tabKey] = newTab;
    popupAllowedOnce = true;
  } catch (e) {
    console.error(e);
  }

  if (!openTabs[tabKey]) {
    frame.srcdoc = `
      <html><body style="color:white;background:black;text-align:center;display:flex;flex-direction:column;justify-content:center;height:100vh">
      <h2>Popup Blocked</h2><p>Please allow popups for this site and try again.</p></body></html>`;
    frame.style.display = 'block';
    title.innerHTML = `<i class="fas fa-play-circle"></i> Popup Blocked for ${name}`;
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
}

document.addEventListener("DOMContentLoaded", () => {
  renderChannels();
  setTimeout(autoPlay, 100);
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
  icon.className = playerContent.classList.contains('expanded') ? 'fas fa-compress' : 'fas fa-expand';
  if (!playerContent.classList.contains('expanded')) {
    document.getElementById('expanded-controls')?.remove();
  }
});

window.addEventListener('message', (event) => {
  const url = event.data;
  if (typeof url === 'string' && url.includes('starscopinsider.com')) {
    window.open(url, '_blank');
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  let isBrave = false;
  if (navigator.brave) {
    try {
      isBrave = await navigator.brave.isBrave();
    } catch (err) {
      isBrave = false;
    }
  }

  if (!isBrave) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#111;color:white;text-align:center;font-family:sans-serif">
        <h1>🚫 Unsupported Browser</h1>
        <p>This IPTV player only works on the <strong>Brave Browser</strong>.</p>
        <p>Please download and install Brave, and ensure <strong>Shields</strong> are set to <strong>Aggressive</strong>.</p>
        <p><a href="https://brave.com/download/" target="_blank" style="color:deepskyblue;font-weight:bold">Download Brave Browser</a></p>
      </div>`;
    return;
  }

  // Show Shields Reminder Only Once
  if (!sessionStorage.getItem("braveShieldsReminderShown")) {
    showShieldsReminder();
    sessionStorage.setItem("braveShieldsReminderShown", "true");
  }
});

function showShieldsReminder() {
  const popup = document.createElement('div');
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #222;
      color: white;
      border-radius: 10px;
      padding: 20px;
      max-width: 400px;
      z-index: 9999;
      text-align: center;
      font-family: sans-serif;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    ">
      <h2 style="margin-top:0;color:orange;">🛡️ Brave Shields Reminder</h2>
      <p>For best experience, please ensure <strong>Brave Shields</strong> are set to <strong>Aggressive</strong> mode.</p>
      <button style="margin-top:10px;padding:10px 20px;border:none;background:#28a745;color:white;border-radius:5px;cursor:pointer;" onclick="this.parentElement.remove()">Got it</button>
    </div>`;
  document.body.appendChild(popup);
}

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.requestFullscreen?.().catch(() => {});
});




