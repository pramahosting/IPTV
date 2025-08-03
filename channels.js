// Channel data - sorted alphabetically in each category
const playlist = [
  { name: "Abzy TV", url: "https://abzy.com", icon: "fa-tv", category: "entertainment", language: "hindi" },
  { name: "ABC TV", url: "https://iview.abc.net.au/", icon: "fa-play-circle", category: "news", language: "english", openInNewTab: true },
  { name: "Aastha TV", url: "https://www.aasthatv.tv/", icon: "fa-om", category: "spiritual" },
  { name: "ARY TV", url: "https://www.aryzindagi.tv/", icon: "fa-heart", category: "entertainment", language: "hindi" },
  { name: "Dunya News", url: "https://dunyanews.tv/live/", icon: "fa-newspaper", category: "news", language: "hindi" },
  { name: "Einthusan", url: "https://einthusan.tv/launcher/?lang=hindi", icon: "fa-video", category: "entertainment", language: "hindi", openInNewTab: true },
  { name: "Free Live TV", url: "https://www.freelivetv.org/", icon: "fa-play-circle", category: "entertainment", language: "hindi", openInNewTab: true },
  { name: "Geo News", url: "https://live.geo.tv/", icon: "fa-bullhorn", category: "news", language: "hindi" },
  { name: "Geo TV", url: "https://www.harpalgeo.tv/", icon: "fa-globe", category: "entertainment", language: "hindi" },
  { name: "Hindi Movies", url: "https://yomovies.design/", icon: "fa-play-circle", category: "entertainment", language: "hindi", openInNewTab: true },
  { name: "Hum TV", url: "https://hum.tv/", icon: "fa-film", category: "entertainment", language: "hindi" },
  { name: "Indian Serials", url: "https://www.bollyzone.to/", icon: "fa-play-circle", category: "entertainment", language: "hindi" },
  { name: "Old Hindi Movies", url: "https://youtube.com/playlist?list=PLafSq5UblCNWcweoEqCDqZ76FmADCuGSf", icon: "fa-play-circle", category: "entertainment", language: "hindi", openInNewTab: true },
  { name: "Plex TV", url: "https://www.plex.tv/", icon: "fa-play-circle", category: "entertainment", language: "english", openInNewTab: true },
  { name: "Play Desi", url: "https://playdesi.info/", icon: "fa-bolt", category: "entertainment", language: "hindi" },
  { name: "SBS TV", url: "https://www.sbs.com.au/ondemand/", icon: "fa-play-circle", category: "news", language: "english", openInNewTab: true },
  { name: "Tubi TV", url: "https://tubitv.com/", icon: "fa-play-circle", category: "entertainment", language: "english", openInNewTab: true },
  { name: "Yupp TV", url: "https://www.yupptv.com/fast-tv", icon: "fa-satellite", category: "news", language: "hindi" }
];

function renderChannels() {
  // Clear all sublists
  const entertainmentHindi = document.getElementById('entertainment-hindi-list');
  const entertainmentEnglish = document.getElementById('entertainment-english-list');
  const newsHindi = document.getElementById('news-hindi-list');
  const newsEnglish = document.getElementById('news-english-list');
  const spiritualList = document.getElementById('spiritual-list');

  entertainmentHindi.innerHTML = '';
  entertainmentEnglish.innerHTML = '';
  newsHindi.innerHTML = '';
  newsEnglish.innerHTML = '';
  spiritualList.innerHTML = '';

  playlist.forEach(channel => {
    const el = createChannelElement(channel);

    if (channel.category === 'entertainment') {
      if (channel.language === 'hindi') {
        entertainmentHindi.appendChild(el);
      } else if (channel.language === 'english') {
        entertainmentEnglish.appendChild(el);
      }
    } else if (channel.category === 'news') {
      if (channel.language === 'hindi') {
        newsHindi.appendChild(el);
      } else if (channel.language === 'english') {
        newsEnglish.appendChild(el);
      }
    } else if (channel.category === 'spiritual') {
      // Assuming no language subgroups for spiritual
      spiritualList.appendChild(el);
    }
  });

  // Optional: Setup search filter (by channel name)
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.channel').forEach(channelEl => {
      const name = channelEl.dataset.name.toLowerCase();
      channelEl.style.display = name.includes(term) ? '' : 'none';
    });
  });
}


function createChannelElement(channel) {
  const el = document.createElement('div');
  el.className = 'channel';
  el.innerHTML = `
    <div class="channel-icon"><i class="fas ${channel.icon}"></i></div>
    <div class="channel-name">${channel.name}</div>
  `;
  el.dataset.name = channel.name;
  el.dataset.url = channel.url;
  el.addEventListener('click', () => playChannel(channel, el));
  return el;
}


