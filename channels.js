// Channel data - sorted alphabetically in each category
const playlist = [
  { name: "PlayDesi1", url: "https://playdesi.info/", icon: "fa-bolt", category: "entertainment", isSpecialIframe: true },
  { name: "PlayDesi2", url: "https://playdesi.pk/", icon: "fa-bolt", category: "entertainment", openInNewTab: true },
  { name: "Abzy TV", url: "https://abzy.com", icon: "fa-tv", category: "entertainment", sandboxLevel: "minimal" },
  { name: "ARY Zindagi TV", url: "https://www.aryzindagi.tv/", icon: "fa-heart", category: "entertainment" },
  { name: "Einthusan", url: "https://einthusan.tv/launcher/?lang=hindi", icon: "fa-video", category: "entertainment", openInNewTab: true },
  { name: "Geo TV", url: "https://www.harpalgeo.tv/", icon: "fa-globe", category: "entertainment" },
  { name: "Hum TV", url: "https://hum.tv/", icon: "fa-film", category: "entertainment" },
  { name: "YoMovies", url: "https://yomovies.design/", icon: "fa-play-circle", category: "entertainment", openInNewTab: true },
  { name: "YuppTV", url: "https://www.yupptv.com/fast-tv", icon: "fa-satellite", category: "entertainment" },
  { name: "Dunya News", url: "https://dunyanews.tv/live/", icon: "fa-newspaper", category: "news" },
  { name: "Geo News", url: "https://live.geo.tv/", icon: "fa-bullhorn", category: "news" },
  { name: "Aastha TV", url: "https://www.aasthatv.tv/", icon: "fa-om", category: "spiritual" },
  { name: "Shemaroo TV", url: "https://www.shemaroome.com/", icon: "fa-film", category: "entertainment", openInNewTab: true },
  { name: "OldMovies", url: "https://youtube.com/playlist?list=PLafSq5UblCNWcweoEqCDqZ76FmADCuGSf", icon: "fa-play-circle", category: "entertainment", openInNewTab: true }
];

function renderChannels() {
  const entertainmentList = document.getElementById('entertainment-list');
  const newsList = document.getElementById('news-list');
  const spiritualList = document.getElementById('spiritual-list');

  entertainmentList.innerHTML = '';
  newsList.innerHTML = '';
  spiritualList.innerHTML = '';

  const sortedPlaylist = [...playlist].sort((a, b) => a.name.localeCompare(b.name));

  const entertainmentChannels = sortedPlaylist.filter(c => c.category === 'entertainment');
  entertainmentChannels.forEach(channel => {
    entertainmentList.appendChild(createChannelElement(channel));
  });

  sortedPlaylist
    .filter(c => c.category === 'news')
    .forEach(channel => newsList.appendChild(createChannelElement(channel)));

  sortedPlaylist
    .filter(c => c.category === 'spiritual')
    .forEach(channel => spiritualList.appendChild(createChannelElement(channel)));

  document.getElementById('search').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.channel').forEach((c) => {
      c.style.display = c.dataset.name.toLowerCase().includes(term) ? "" : "none";
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
