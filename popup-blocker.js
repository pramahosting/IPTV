/**
 * IPTV Agent Popup Blocker & YouTube Playlist Enhancer
 * Comprehensive script to block popup advertisements and enable YouTube playlist functionality
 */

class IPTVPopupBlocker {
  constructor() {
    this.stats = {
      popupsBlocked: 0,
      adsBlocked: 0,
      redirectsBlocked: 0,
      youtubeEnhanced: 0
    };
    
    this.blockedDomains = [
      // Common ad domains
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com',
      'adsystem.amazon.com',
      'amazon-adsystem.com',
      'facebook.com/plugins',
      'connect.facebook.net',
      'scorecardresearch.com',
      'outbrain.com',
      'taboola.com',
      'adscdn.com',
      'propellerads.com',
      'popads.net',
      'popcash.net',
      'adnxs.com',
      'adsafeprotected.com',
      'moatads.com',
      'adsrvr.org',
      'adform.net',
      'advertising.com',
      'adskeeper.co.uk',
      'mgid.com',
      'exoclick.com',
      'popunder.net',
      'zedo.com',
      'adsystem.net',
      'media.net',
      'adroll.com',
      'rlcdn.com',
      'criteo.com',
      'casalemedia.com',
      'rubiconproject.com',
      'pubmatic.com',
      'openx.net',
      'addthis.com',
      'sharethis.com'
    ];

    this.blockedPatterns = [
      /popup/i,
      /ad[\-_]?banner/i,
      /advertisement/i,
      /sponsor/i,
      /promo/i,
      /casino/i,
      /betting/i,
      /gambling/i,
      /dating/i,
      /adult/i,
      /porn/i,
      /xxx/i,
      /redirect/i,
      /landing/i,
      /click\.php/i,
      /go\.php/i,
      /out\.php/i,
      /exit/i,
      /interstitial/i
    ];

    this.youtubeDomains = [
      'youtube.com',
      'youtu.be',
      'm.youtube.com',
      'music.youtube.com'
    ];

    this.init();
  }

  init() {
    this.blockPopups();
    this.enhanceYouTube();
    this.blockAdElements();
    this.preventRedirects();
    this.setupMutationObserver();
    this.blockWindowOpen();
    this.setupCSPHeaders();
    this.createUI();
    console.log('🛡️ IPTV Popup Blocker initialized');
  }

  // Create UI elements for notifications and stats
  createUI() {
    // Create security indicator
    const securityIndicator = document.createElement('div');
    securityIndicator.className = 'security-indicator';
    securityIndicator.innerHTML = '<i class="fas fa-shield-alt shield-icon"></i>Protected';
    document.body.appendChild(securityIndicator);

    // Create stats panel (initially hidden)
    const statsPanel = document.createElement('div');
    statsPanel.className = 'popup-blocker-stats';
    statsPanel.style.display = 'none';
    statsPanel.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Popups Blocked:</span>
        <span class="stat-value" id="popups-blocked">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Ads Blocked:</span>
        <span class="stat-value" id="ads-blocked">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Redirects Blocked:</span>
        <span class="stat-value" id="redirects-blocked">0</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">YouTube Enhanced:</span>
        <span class="stat-value success" id="youtube-enhanced">0</span>
      </div>
    `;
    document.body.appendChild(statsPanel);

    // Toggle stats on security indicator click
    securityIndicator.addEventListener('click', () => {
      statsPanel.style.display = statsPanel.style.display === 'none' ? 'block' : 'none';
    });

    this.statsPanel = statsPanel;
    this.securityIndicator = securityIndicator;
  }

  // Show notification
  showNotification(message, type = 'blocked') {
    const notification = document.createElement('div');
    notification.className = `popup-blocker-notification ${type}`;
    
    const icon = type === 'blocked' ? 'fa-ban' : 
                 type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
      <i class="fas ${icon} icon"></i>
      ${message}
      <button class="close-btn">&times;</button>
    `;
    
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }
    }, 3000);

    // Manual close
    notification.querySelector('.close-btn').addEventListener('click', () => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    });

    // Flash effect for blocked content
    if (type === 'blocked') {
      this.flashBlockedEffect();
    }
  }

  // Flash effect when content is blocked
  flashBlockedEffect() {
    const flash = document.createElement('div');
    flash.className = 'popup-block-flash';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
  }

  // Update stats
  updateStats(type) {
    this.stats[type]++;
    const element = document.getElementById(type.replace(/([A-Z])/g, '-$1').toLowerCase());
    if (element) {
      element.textContent = this.stats[type];
    }
  }

  // Block popup windows
  blockPopups() {
    const originalOpen = window.open;
    window.open = (url, target, features) => {
      if (this.shouldBlockURL(url)) {
        console.log('🚫 Blocked popup:', url);
        this.updateStats('popupsBlocked');
        this.showNotification(`Blocked popup: ${new URL(url).hostname}`, 'blocked');
        return null;
      }
      
      // Allow YouTube in new tabs/popups
      if (this.isYouTubeURL(url)) {
        console.log('✅ Allowing YouTube popup:', url);
        return originalOpen.call(window, url, target, features);
      }

      console.log('🚫 Blocked suspicious popup:', url);
      this.updateStats('popupsBlocked');
      this.showNotification('Blocked suspicious popup', 'blocked');
      return null;
    };
  }

  // Enhance YouTube functionality
  enhanceYouTube() {
    // Enable YouTube autoplay and playlist features
    document.addEventListener('DOMContentLoaded', () => {
      this.processYouTubeIframes();
    });

    // Monitor for new iframes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IFRAME') {
              this.enhanceIframe(node);
            }
            // Check for iframes in added subtree
            const iframes = node.querySelectorAll && node.querySelectorAll('iframe');
            if (iframes) {
              iframes.forEach(iframe => this.enhanceIframe(iframe));
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processYouTubeIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => this.enhanceIframe(iframe));
  }

  enhanceIframe(iframe) {
    if (!iframe.src) return;

    const url = new URL(iframe.src);
    
    // YouTube enhancement
    if (this.isYouTubeDomain(url.hostname)) {
      this.enhanceYouTubeIframe(iframe, url);
    }

    // Add security attributes to all iframes
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
    iframe.setAttribute('allowfullscreen', '');
    
    // Block ad-related iframes
    if (this.shouldBlockURL(iframe.src)) {
      iframe.style.display = 'none';
      iframe.src = 'about:blank';
      iframe.setAttribute('data-popup-blocked', 'true');
      this.updateStats('adsBlocked');
      this.showNotification('Blocked ad iframe', 'blocked');
      console.log('🚫 Blocked ad iframe:', iframe.src);
    }
  }

  enhanceYouTubeIframe(iframe, url) {
    const params = new URLSearchParams(url.search);
    
    // Enable autoplay, playlist, and other features
    params.set('autoplay', '1');
    params.set('rel', '0'); // Don't show related videos
    params.set('modestbranding', '1'); // Remove YouTube logo
    params.set('iv_load_policy', '3'); // Hide annotations
    params.set('enablejsapi', '1'); // Enable JavaScript API
    params.set('origin', window.location.origin);
    
    // Allow playlists to continue
    if (url.pathname.includes('/playlist') || params.has('list')) {
      params.set('loop', '1');
      console.log('🎵 Enhanced YouTube playlist:', iframe.src);
      this.showNotification('YouTube playlist enhanced!', 'success');
    }

    // Update iframe src with enhanced parameters
    url.search = params.toString();
    iframe.src = url.toString();
    
    // Mark iframe as YouTube enhanced
    iframe.setAttribute('data-youtube-enhanced', 'true');
    
    this.updateStats('youtubeEnhanced');
    console.log('📺 Enhanced YouTube iframe with playlist support');
  }

  // Block ad elements in DOM
  blockAdElements() {
    const adSelectors = [
      '[id*="ad"]',
      '[class*="ad"]',
      '[id*="banner"]',
      '[class*="banner"]',
      '[id*="popup"]',
      '[class*="popup"]',
      '[id*="overlay"]',
      '[class*="overlay"]',
      'ins[class="adsbygoogle"]',
      'div[id^="google_ads"]',
      'div[class*="advertisement"]',
      'div[class*="sponsored"]',
      'iframe[src*="doubleclick"]',
      'iframe[src*="googlesyndication"]',
      'iframe[src*="googleadservices"]'
    ];

    adSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (this.isLikelyAd(element)) {
            element.style.display = 'none';
            element.remove();
          }
        });
      } catch (e) {
        // Ignore invalid selectors
      }
    });
  }

  isLikelyAd(element) {
    const text = (element.textContent || '').toLowerCase();
    const className = (element.className || '').toLowerCase();
    const id = (element.id || '').toLowerCase();
    
    const adKeywords = ['advertisement', 'sponsored', 'promoted', 'ad', 'banner', 'popup'];
    
    return adKeywords.some(keyword => 
      text.includes(keyword) || 
      className.includes(keyword) || 
      id.includes(keyword)
    );
  }

  // Prevent redirects
  preventRedirects() {
    // Block meta refresh redirects to ad pages
    const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
    if (metaRefresh && this.shouldBlockURL(metaRefresh.content)) {
      metaRefresh.remove();
      console.log('🚫 Blocked meta redirect');
    }

    // Override location changes
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      get: () => originalLocation,
      set: (value) => {
        if (this.shouldBlockURL(value)) {
          console.log('🚫 Blocked location redirect:', value);
          return;
        }
        originalLocation.assign(value);
      }
    });
  }

  // Setup mutation observer for dynamic content
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check for ad elements
            if (this.isLikelyAd(node)) {
              node.style.display = 'none';
              node.remove();
            }
            
            // Check for ad elements in subtree
            if (node.querySelectorAll) {
              const adElements = node.querySelectorAll('[id*="ad"], [class*="ad"], [class*="popup"]');
              adElements.forEach(element => {
                if (this.isLikelyAd(element)) {
                  element.style.display = 'none';
                  element.remove();
                }
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src', 'href']
    });
  }

  // Block window.open calls
  blockWindowOpen() {
    // Also block document.write with ad content
    const originalWrite = document.write;
    document.write = function(content) {
      if (content && typeof content === 'string') {
        const blockedPatterns = [
          /advertisement/i,
          /doubleclick/i,
          /googlesyndication/i,
          /popup/i,
          /casino/i,
          /betting/i
        ];
        
        if (blockedPatterns.some(pattern => pattern.test(content))) {
          console.log('🚫 Blocked document.write with ad content');
          return;
        }
      }
      return originalWrite.call(this, content);
    };
  }

  // Setup Content Security Policy headers
  setupCSPHeaders() {
    // Add CSP meta tag if not present
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.youtube.com *.ytimg.com *.gstatic.com; " +
        "frame-src 'self' *.youtube.com *.youtu.be; " +
        "connect-src 'self' *.youtube.com; " +
        "img-src 'self' data: *.ytimg.com *.youtube.com; " +
        "style-src 'self' 'unsafe-inline'"
      );
      document.head.appendChild(cspMeta);
    }
  }

  // Helper methods
  shouldBlockURL(url) {
    if (!url || typeof url !== 'string') return false;
    
    try {
      const urlObj = new URL(url, window.location.origin);
      
      // Check blocked domains
      if (this.blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return true;
      }
      
      // Check blocked patterns
      if (this.blockedPatterns.some(pattern => pattern.test(url))) {
        return true;
      }
      
      return false;
    } catch (e) {
      return true; // Block invalid URLs
    }
  }

  isYouTubeURL(url) {
    if (!url) return false;
    try {
      const urlObj = new URL(url, window.location.origin);
      return this.isYouTubeDomain(urlObj.hostname);
    } catch (e) {
      return false;
    }
  }

  isYouTubeDomain(hostname) {
    return this.youtubeDomains.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  }

  // Public methods for manual blocking
  blockElement(element) {
    if (element) {
      element.style.display = 'none';
      element.remove();
      console.log('🚫 Manually blocked element');
    }
  }

  allowURL(url) {
    // Method to whitelist specific URLs if needed
    console.log('✅ Manually allowed URL:', url);
  }
}

// Initialize the popup blocker
const iptvPopupBlocker = new IPTVPopupBlocker();

// Global functions for manual control
window.blockPopupElement = (element) => iptvPopupBlocker.blockElement(element);
window.allowPopupURL = (url) => iptvPopupBlocker.allowURL(url);

// Additional event listeners for iframe management
document.addEventListener('DOMContentLoaded', () => {
  // Enhanced iframe sandbox for better security
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    iframe.addEventListener('load', () => {
      try {
        // Try to inject popup blocker into iframe (same-origin only)
        if (iframe.contentWindow && iframe.contentDocument) {
          const script = iframe.contentDocument.createElement('script');
          script.textContent = `
            window.open = function() { 
              console.log('🚫 Popup blocked in iframe'); 
              return null; 
            };
            document.addEventListener('click', function(e) {
              if (e.target.tagName === 'A' && e.target.target === '_blank') {
                const href = e.target.href;
                if (href && (href.includes('ad') || href.includes('popup'))) {
                  e.preventDefault();
                  console.log('🚫 Blocked suspicious link in iframe');
                }
              }
            });
          `;
          iframe.contentDocument.head.appendChild(script);
        }
      } catch (e) {
        // Cross-origin iframe, can't inject script
      }
    });
  });
});

console.log('🛡️ IPTV Popup Blocker and YouTube Enhancer loaded successfully!');