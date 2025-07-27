# IPTV Agent Popup Blocker & YouTube Playlist Enhancer

## Overview

This comprehensive popup blocker has been integrated into your IPTV agent to provide a secure and enhanced viewing experience. It blocks unwanted advertisements, popups, and malicious redirects while enabling seamless YouTube playlist functionality.

## Features

### 🛡️ Popup Blocking
- **Comprehensive Domain Blocking**: Blocks known advertising domains including DoubleClick, Google Ad Services, PopAds, ExoClick, and many more
- **Pattern-Based Blocking**: Identifies and blocks URLs containing suspicious patterns (popup, ad, casino, betting, adult content, etc.)
- **Real-time Protection**: Continuously monitors for new popup attempts and blocks them instantly
- **Cross-frame Protection**: Injects popup blockers into iframes when possible

### 📺 YouTube Playlist Enhancement
- **Autoplay Support**: Automatically enables autoplay for YouTube content
- **Playlist Continuity**: Ensures YouTube playlists play continuously without interruption
- **Enhanced Parameters**: Optimizes YouTube embed parameters for better viewing experience
- **Minimal Branding**: Reduces YouTube branding for cleaner interface
- **Full-screen Support**: Enables full-screen viewing capabilities

### 🔒 Security Features
- **Content Security Policy**: Implements CSP headers to prevent malicious script injection
- **Sandbox Protection**: Enhanced iframe sandboxing with restricted permissions
- **Redirect Prevention**: Blocks malicious redirects and meta refresh attacks
- **Ad Element Removal**: Dynamically removes advertisement elements from the DOM

### 📊 Monitoring & Feedback
- **Real-time Stats**: Track blocked popups, ads, redirects, and enhanced YouTube content
- **Visual Notifications**: Get instant feedback when content is blocked or enhanced
- **Security Indicator**: Always-visible security status indicator
- **Debug Console**: Optional debugging information for troubleshooting

## How It Works

### Automatic Protection

The popup blocker starts automatically when you load the IPTV agent. You'll see:

1. **Security Indicator**: A green shield icon in the bottom-left corner showing "Protected" status
2. **Notifications**: Pop-up notifications (top-right) when content is blocked or enhanced
3. **Stats Panel**: Click the security indicator to view blocking statistics

### Manual Controls

#### Global Functions Available:
```javascript
// Block a specific element manually
window.blockPopupElement(element);

// Allow a specific URL (whitelist)
window.allowPopupURL('https://example.com');
```

### YouTube Playlist Features

When you select a YouTube playlist channel:
- ✅ Autoplay will be automatically enabled
- ✅ Related videos will be hidden
- ✅ Playlist will loop continuously
- ✅ YouTube branding will be minimized
- ✅ You'll see a success notification confirming enhancement

## Channel Configuration

### Enhanced YouTube Channels

The following YouTube playlist channels have been added with enhanced functionality:

- **Old Movies Playlist**: Classic films playlist with autoplay
- **Bollywood Hits**: Popular Bollywood music videos
- **Pakistani Dramas**: Collection of Pakistani drama episodes
- **Islamic Songs**: Religious music playlist
- **Quran Recitation**: Continuous Quran recitation

### Adding New YouTube Playlists

To add new YouTube playlists:

1. Get the YouTube playlist URL
2. Convert it to embed format: `https://www.youtube.com/embed/playlist?list=PLAYLIST_ID&autoplay=1`
3. Add to `channels.js`:

```javascript
{
  name: "Your Playlist Name",
  url: "https://www.youtube.com/embed/playlist?list=YOUR_PLAYLIST_ID&autoplay=1",
  icon: "fa-play-circle",
  category: "entertainment"
}
```

## Blocked Content Types

### Domains Blocked:
- DoubleClick advertising networks
- Google Ad Services
- Facebook advertising plugins
- PopAds and PopCash networks
- Adult content advertisers
- Casino and betting sites
- Outbrain and Taboola content recommendations
- Many more advertising networks

### URL Patterns Blocked:
- URLs containing "popup", "ad", "banner"
- Casino and gambling URLs
- Adult content URLs
- Redirect and landing pages
- Interstitial advertisements

## Visual Feedback

### Notification Types:
- 🚫 **Red Notifications**: Content blocked (popups, ads, redirects)
- ✅ **Green Notifications**: YouTube playlists enhanced
- ℹ️ **Blue Notifications**: General information

### Visual Indicators:
- **Red Border**: Blocked iframes
- **Green Border**: Enhanced YouTube iframes
- **Flash Effect**: Brief red flash when content is blocked

## Troubleshooting

### If a legitimate site is blocked:
1. Check the browser console for blocking messages
2. Use `window.allowPopupURL('https://site.com')` to whitelist
3. Report the issue for whitelist consideration

### If YouTube playlists don't autoplay:
1. Ensure browser allows autoplay (check browser settings)
2. Verify the playlist URL is in correct embed format
3. Check that the channel has YouTube enhancement enabled

### If popups still appear:
1. Check if the popup source is from a new domain
2. Look for popup patterns not yet covered
3. Report new popup sources for blacklist addition

## Performance Impact

The popup blocker is designed to be lightweight:
- ⚡ Minimal CPU usage through efficient pattern matching
- 🔄 Smart DOM monitoring to avoid performance impact
- 📦 Small memory footprint
- 🚀 No impact on legitimate content loading

## Browser Compatibility

Compatible with all modern browsers:
- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## Security Considerations

### What's Protected:
- ✅ Popup advertisements
- ✅ Redirect attacks
- ✅ Malicious iframes
- ✅ Cross-site scripting attempts
- ✅ Unwanted content injection

### What's Not Protected:
- ❌ Direct malware downloads (use antivirus)
- ❌ Phishing on legitimate sites (use browser security)
- ❌ Social engineering attacks (use common sense)

## Updates and Maintenance

The popup blocker automatically:
- 🔄 Updates blocking patterns for new threats
- 📊 Maintains statistics across sessions
- 🛠️ Self-diagnoses and reports issues
- 📈 Optimizes performance based on usage

## Support

For issues or feature requests:
1. Check browser console for error messages
2. Note the specific content that should be blocked/allowed
3. Provide the URL and behavior description
4. Include browser and OS version information

---

**Note**: This popup blocker is specifically designed for the IPTV agent environment and may require adjustments for other applications.