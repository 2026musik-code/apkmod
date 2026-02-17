
// Default fallback for development/demo (Note: Should be kept secret in production)
const DEFAULT_API_KEY = 'dedi131';

const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="no-referrer">
    <title>MOD APPS - Premium Modded APKs & Drakor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/js/all.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <style>
        .hide-scroll-bar::-webkit-scrollbar { display: none; }
        .hide-scroll-bar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 4px; }
        html { scroll-behavior: smooth; }
        .aspect-poster { aspect-ratio: 2 / 3; }
    </style>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        gold: '#d4af37',
                        dark: '#0a0a0a',
                        darker: '#050505',
                        card: '#1a1a1a',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-darker text-white font-sans antialiased min-h-screen pb-20">

    <!-- Header -->
    <header class="fixed top-0 w-full z-50 bg-dark/90 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-4">
                <button id="menuBtn" class="text-gold hover:text-white transition">
                    <i class="fas fa-bars text-xl"></i>
                </button>
                <div class="flex flex-col">
                    <h1 class="text-xl font-bold tracking-wider text-gold flex items-center gap-2">
                        <i class="fas fa-crown text-sm"></i> MOD APPS
                    </h1>
                </div>
            </div>

            <div id="searchContainer" class="hidden md:flex flex-1 max-w-md mx-4">
                <div class="relative w-full">
                    <input type="text" id="searchInput" placeholder="Cari aplikasi..."
                        class="w-full bg-card border border-white/10 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-gold transition text-white placeholder-gray-500">
                    <button id="searchBtn" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold hover:text-white">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Sidebar -->
    <div id="sidebar" class="fixed inset-y-0 left-0 w-64 bg-card border-r border-white/10 transform -translate-x-full transition-transform duration-300 z-50 pt-20 shadow-2xl">
        <nav class="px-4 space-y-2">
            <button onclick="switchPage('home')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-gold transition flex items-center gap-3">
                <i class="fas fa-home w-6"></i> Home
            </button>
            <button onclick="switchPage('drakor')" class="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 text-gray-300 hover:text-gold transition flex items-center gap-3">
                <i class="fas fa-play-circle w-6"></i> Drakor Mods
            </button>
             <div class="border-t border-white/10 my-2"></div>
            <div class="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Kategori</div>
            <button onclick="filterMods('Viral')" class="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition">Viral</button>
            <button onclick="filterMods('Game')" class="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition">Game</button>
            <button onclick="filterMods('AI')" class="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition">AI Tools</button>
            <button onclick="filterMods('VPN')" class="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition">VPN</button>
            <button onclick="filterMods('Browser')" class="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded transition">Browser</button>
        </nav>
    </div>

    <!-- Overlay for Sidebar -->
    <div id="overlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden" onclick="toggleSidebar()"></div>

    <!-- Main Content: MOD APPS -->
    <main id="modPage" class="pt-20 px-4 max-w-7xl mx-auto space-y-8 transition-opacity duration-300">
        <!-- Hero Search (Mobile) -->
        <div class="md:hidden relative">
            <input type="text" id="mobileSearchInput" placeholder="Cari aplikasi..."
                class="w-full bg-card border border-white/10 rounded-full py-3 px-5 text-sm focus:outline-none focus:border-gold transition text-white shadow-lg">
            <button id="mobileSearchBtn" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gold">
                <i class="fas fa-search"></i>
            </button>
        </div>

        <!-- Categories -->
        <div class="flex overflow-x-auto space-x-3 pb-2 hide-scroll-bar">
            <button onclick="filterMods('All')" class="px-6 py-2 rounded-full bg-gold text-black font-semibold text-sm whitespace-nowrap shadow-lg shadow-gold/20 hover:bg-white transition">Semua</button>
            <button onclick="filterMods('Viral')" class="px-6 py-2 rounded-full bg-card border border-white/10 hover:border-gold text-gray-300 hover:text-gold text-sm whitespace-nowrap transition">Viral</button>
            <button onclick="filterMods('Game')" class="px-6 py-2 rounded-full bg-card border border-white/10 hover:border-gold text-gray-300 hover:text-gold text-sm whitespace-nowrap transition">Game</button>
             <button onclick="filterMods('Chat')" class="px-6 py-2 rounded-full bg-card border border-white/10 hover:border-gold text-gray-300 hover:text-gold text-sm whitespace-nowrap transition">Chat</button>
             <button onclick="filterMods('AI')" class="px-6 py-2 rounded-full bg-card border border-white/10 hover:border-gold text-gray-300 hover:text-gold text-sm whitespace-nowrap transition">AI</button>
             <button onclick="filterMods('VPN')" class="px-6 py-2 rounded-full bg-card border border-white/10 hover:border-gold text-gray-300 hover:text-gold text-sm whitespace-nowrap transition">VPN</button>
        </div>

        <!-- Recommended Section -->
        <section>
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="w-1 h-6 bg-gold rounded-full"></span> Rekomendasi
            </h2>
            <div id="recommendedContainer" class="flex overflow-x-auto gap-4 pb-4 hide-scroll-bar snap-x">
                <!-- Recommendations populated by JS -->
            </div>
        </section>

        <!-- Mod List Grid -->
        <section>
             <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span class="w-1 h-6 bg-gold rounded-full"></span> Terbaru
            </h2>
            <div id="modGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <!-- Mods populated by JS -->
            </div>
             <div id="loading" class="hidden py-12 text-center">
                <i class="fas fa-circle-notch fa-spin text-3xl text-gold"></i>
            </div>
        </section>
    </main>

    <!-- Main Content: DRAKOR MODS -->
    <main id="drakorPage" class="hidden pt-16 min-h-screen bg-darker">

        <!-- Hero Banner -->
        <div id="drakorHero" class="relative w-full h-[50vh] md:h-[60vh] bg-gray-900 overflow-hidden mb-8 hidden">
            <img id="heroImage" src="" alt="Hero" class="w-full h-full object-cover opacity-60">
            <div class="absolute inset-0 bg-gradient-to-t from-darker via-darker/50 to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-6 w-full max-w-4xl">
                 <span class="px-3 py-1 bg-gold text-black text-xs font-bold rounded mb-2 inline-block">FEATURED</span>
                <h1 id="heroTitle" class="text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">Title</h1>
                <p id="heroSynopsis" class="text-gray-300 text-sm md:text-base line-clamp-2 mb-4 max-w-2xl drop-shadow-md">Synopsis...</p>
                <div class="flex gap-3">
                    <button onclick="playHero()" class="px-6 py-2 bg-gold text-black font-bold rounded-full hover:bg-white transition flex items-center gap-2">
                        <i class="fas fa-play"></i> Tonton Sekarang
                    </button>
                     <button onclick="infoHero()" class="px-6 py-2 bg-white/20 backdrop-blur text-white font-bold rounded-full hover:bg-white/30 transition flex items-center gap-2">
                        <i class="fas fa-info-circle"></i> Info Detail
                    </button>
                </div>
            </div>
        </div>

        <!-- Categories Rows -->
        <div class="space-y-8 px-4 pb-20">
             <div id="drakorContent"></div>
        </div>
    </main>

    <!-- Detail Modal -->
    <div id="detailModal" class="fixed inset-0 z-[60] hidden overflow-y-auto">
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onclick="closeModal()"></div>

        <div class="relative min-h-screen md:flex md:items-center md:justify-center p-0 md:p-4">
            <div class="bg-[#181818] w-full md:max-w-4xl md:rounded-xl shadow-2xl overflow-hidden relative min-h-screen md:min-h-0">

                <button onclick="closeModal()" class="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full text-white hover:bg-white/20 flex items-center justify-center transition">
                    <i class="fas fa-times"></i>
                </button>

                <!-- Player -->
                 <div id="playerContainer" class="w-full aspect-video bg-black hidden relative group">
                    <video id="videoPlayer" class="w-full h-full" controls poster="" playsinline webkit-playsinline>
                        Your browser does not support the video tag.
                    </video>
                     <!-- Loading -->
                     <div id="playerLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-black/80 hidden z-20">
                        <i class="fas fa-circle-notch fa-spin text-gold text-4xl mb-2"></i>
                        <p class="text-white text-sm">Memuat Video...</p>
                     </div>
                      <!-- Error -->
                     <div id="playerError" class="absolute inset-0 flex flex-col items-center justify-center bg-black/90 hidden z-20 px-4 text-center">
                        <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-2"></i>
                        <p class="text-white text-sm mb-2" id="playerErrorMsg">Gagal memuat video.</p>
                        <button onclick="retryVideo()" class="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-sm text-white">Coba Lagi</button>
                     </div>
                </div>

                <div class="grid md:grid-cols-[300px_1fr] gap-6">
                    <!-- Poster Side -->
                    <div class="relative h-[400px] md:h-full hidden md:block">
                        <img id="modalPoster" src="" class="w-full h-full object-cover opacity-80">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent"></div>
                    </div>
                    <!-- Content Side -->
                    <div class="p-6 md:py-8 space-y-6">
                        <!-- Mobile Header -->
                        <div class="md:hidden flex gap-4 mb-4">
                             <img id="modalPosterMobile" src="" class="w-24 h-36 object-cover rounded shadow-lg bg-gray-800">
                             <div>
                                <h2 id="modalTitle" class="text-2xl font-bold text-white mb-1">Title</h2>
                                <div class="flex flex-wrap gap-2 text-xs text-gray-400 mb-2">
                                    <span id="modalStatus" class="border border-gray-600 px-2 py-0.5 rounded">Status</span>
                                    <span id="modalChapters" class="text-gold">0 Episodes</span>
                                </div>
                             </div>
                        </div>

                         <!-- Desktop Header -->
                        <div class="hidden md:block">
                            <h2 id="modalTitleDesktop" class="text-3xl font-bold text-white mb-2">Title</h2>
                            <div class="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
                                <span id="modalStatusDesktop" class="bg-white/10 px-2 py-0.5 rounded">Status</span>
                                <span id="modalChaptersDesktop" class="text-gold flex items-center gap-1"><i class="fas fa-layer-group"></i> 0 Episodes</span>
                            </div>
                        </div>

                        <!-- Info -->
                        <div>
                             <p id="modalSynopsis" class="text-gray-300 text-sm leading-relaxed line-clamp-4 hover:line-clamp-none cursor-pointer transition">
                                Synopsis...
                            </p>
                             <div id="modalTags" class="mt-3 flex flex-wrap gap-2"></div>
                        </div>

                        <!-- Episode Selector -->
                        <div>
                            <h3 class="text-white font-bold mb-3 flex items-center gap-2">
                                <i class="fas fa-list-ul text-gold"></i> Episodes
                            </h3>
                            <div id="episodeGridLoading" class="hidden text-center py-4">
                                <i class="fas fa-spinner fa-spin text-gold"></i>
                            </div>
                            <div id="episodeGrid" class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Use local proxy paths
        const MOD_API_BASE = '/api/mod';
        const DRAKOR_API_BASE = '/api/drakor';
        const DETAIL_API_BASE = '/api/detail';
        const STREAM_API_BASE = '/api/stream';
        const PROXY_VIDEO_BASE = '/api/proxy-video';

        let currentModData = [];
        let drakorData = {};
        let currentChapters = [];
        let currentPlayingVideoId = null;

        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            if (isOpen) {
                sidebar.classList.add('-translate-x-full');
                overlay.classList.add('hidden');
            } else {
                sidebar.classList.remove('-translate-x-full');
                overlay.classList.remove('hidden');
            }
        }

        function switchPage(page) {
            toggleSidebar();
            const modPage = document.getElementById('modPage');
            const drakorPage = document.getElementById('drakorPage');
            if (page === 'home') {
                modPage.classList.remove('hidden'); modPage.classList.remove('opacity-0');
                drakorPage.classList.add('hidden');
                document.getElementById('searchContainer').classList.remove('hidden');
            } else {
                modPage.classList.add('opacity-0');
                setTimeout(() => modPage.classList.add('hidden'), 300);
                drakorPage.classList.remove('hidden');
                document.getElementById('searchContainer').classList.add('hidden');
                if (Object.keys(drakorData).length === 0) initDrakor();
            }
        }

        async function loadImage(url, imgElement) {
            if (!url) return;
            imgElement.classList.add('animate-pulse', 'bg-gray-800');
            if (url.toLowerCase().includes('.heic')) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const blob = await response.blob();
                    const conversionResult = await heic2any({ blob, toType: "image/jpeg", quality: 0.8 });
                    const conversionUrl = URL.createObjectURL(conversionResult);
                    imgElement.src = conversionUrl;
                } catch (e) {
                    imgElement.src = 'https://via.placeholder.com/200x300?text=No+Image';
                }
            } else {
                imgElement.src = url;
            }
            imgElement.onload = () => imgElement.classList.remove('animate-pulse', 'bg-gray-800');
            imgElement.onerror = () => {
                imgElement.onerror = null; // Prevent infinite loop
                imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMzAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                imgElement.classList.remove('animate-pulse', 'bg-gray-800');
            };
        }

        async function fetchMods(query = 'Michat') {
            const grid = document.getElementById('modGrid');
            const loading = document.getElementById('loading');
            grid.innerHTML = ''; loading.classList.remove('hidden');
            try {
                const res = await fetch(\`\${MOD_API_BASE}?query=\${query}\`);
                const data = await res.json();
                if (data.success && data.data) {
                    currentModData = data.data; renderMods(data.data); renderRecommendations(data.data);
                } else {
                    grid.innerHTML = '<p class="text-center text-gray-500 col-span-full">Tidak ada hasil ditemukan.</p>';
                }
            } catch (err) {
                console.error(err); grid.innerHTML = '<p class="text-center text-red-500 col-span-full">Gagal memuat data.</p>';
            } finally { loading.classList.add('hidden'); }
        }

        function renderMods(mods) {
            const grid = document.getElementById('modGrid');
            grid.innerHTML = mods.map(mod => \`
                <div class="bg-card rounded-xl overflow-hidden border border-white/5 hover:border-gold/50 transition group hover:shadow-lg hover:shadow-gold/10">
                    <div class="relative h-40 overflow-hidden">
                        <img src="\${mod.image}" alt="\${mod.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                        <div class="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-gold border border-gold/20">\${mod.version}</div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-white mb-1 truncate">\${mod.title}</h3>
                        <p class="text-xs text-gray-400 mb-3 truncate">\${mod.modFeature}</p>
                        <a href="\${mod.link}" target="_blank" class="block w-full py-2 bg-white/5 hover:bg-gold hover:text-black text-center rounded-lg text-sm font-semibold transition border border-white/10 hover:border-transparent">Download <i class="fas fa-download ml-1"></i></a>
                    </div>
                </div>\`).join('');
        }

        function renderRecommendations(mods) {
            const container = document.getElementById('recommendedContainer');
            container.innerHTML = mods.slice(0, 6).map(mod => \`
                <div class="snap-start shrink-0 w-[80vw] sm:w-[300px] bg-gradient-to-br from-gray-800 to-black rounded-2xl p-4 border border-white/10 flex items-center gap-4 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition"></div>
                    <img src="\${mod.image}" class="w-20 h-20 rounded-xl object-cover shadow-lg z-10">
                    <div class="z-10 min-w-0 flex-1">
                        <h3 class="font-bold text-lg text-white truncate">\${mod.title}</h3>
                        <p class="text-xs text-gold mb-2">\${mod.size}</p>
                        <a href="\${mod.link}" target="_blank" class="inline-block px-4 py-1.5 bg-gold text-black text-xs font-bold rounded-full hover:bg-white transition">GET MOD</a>
                    </div>
                </div>\`).join('');
        }

        function filterMods(category) { category === 'All' ? fetchMods('Michat') : fetchMods(category); }

        const drakorCategories = ['CEO', 'Romantis', 'Aksi', 'Fantasi', 'Sekolah', 'Kerajaan'];
        async function initDrakor() {
            const container = document.getElementById('drakorContent');
            container.innerHTML = '<div class="text-center py-20"><i class="fas fa-spinner fa-spin text-4xl text-gold"></i></div>';
            try {
                const results = await Promise.all(drakorCategories.map(cat =>
                    fetch(\`\${DRAKOR_API_BASE}?query=\${cat}\`).then(res => res.json()).then(data => ({ category: cat, data: data })).catch(() => ({ category: cat, data: [] }))
                ));
                container.innerHTML = '';
                results.forEach(result => {
                    const items = result.data.result || result.data.data;
                    if (items && Array.isArray(items) && items.length > 0) {
                        drakorData[result.category] = items; renderDrakorCategory(result.category, items);
                    }
                });
                if (drakorData['CEO'] && drakorData['CEO'].length > 0) setupHero(drakorData['CEO'][0]);
            } catch (e) { container.innerHTML = '<p class="text-center text-red-500">Gagal memuat drakor.</p>'; }
        }

        function renderDrakorCategory(category, items) {
            const container = document.getElementById('drakorContent');
            const section = document.createElement('div');
            section.className = 'relative group';
            section.innerHTML = \`<h3 class="text-lg md:text-xl font-bold text-white mb-3 pl-2 border-l-4 border-gold">\${category}</h3><div class="relative"><div class="grid grid-rows-2 grid-flow-col gap-4 overflow-x-auto pb-4 hide-scroll-bar scroll-pl-4 snap-x" id="list-\${category}"></div></div>\`;
            container.appendChild(section);
            const list = section.querySelector(\`#list-\${category}\`);
            items.forEach((item) => {
                const card = document.createElement('div');
                card.className = 'snap-start shrink-0 w-[140px] md:w-[180px] cursor-pointer group/card relative transition transform hover:scale-105 hover:z-10 duration-300';
                card.onclick = () => openDetail(item);
                const imgContainer = document.createElement('div');
                imgContainer.className = 'aspect-poster bg-gray-800 rounded-lg overflow-hidden relative shadow-lg';
                const img = document.createElement('img');
                img.className = 'w-full h-full object-cover transition duration-500 group-hover/card:brightness-75';
                loadImage(item.cover, img);
                imgContainer.innerHTML = \`<img src="\${img.src}" class="w-full h-full object-cover transition duration-500 group-hover/card:brightness-75"><div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300"><i class="fas fa-play-circle text-5xl text-gold drop-shadow-lg"></i></div>\`;
                // Need to re-apply load image to the new innerHTML img or just append
                imgContainer.innerHTML = '';
                imgContainer.appendChild(img);
                const playOverlay = document.createElement('div'); playOverlay.className = 'absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300'; playOverlay.innerHTML = '<i class="fas fa-play-circle text-5xl text-gold drop-shadow-lg"></i>';
                imgContainer.appendChild(playOverlay);
                const title = document.createElement('h4'); title.className = 'mt-2 text-sm text-gray-300 font-medium truncate group-hover/card:text-white transition'; title.innerText = item.title;
                card.appendChild(imgContainer); card.appendChild(title); list.appendChild(card);
            });
        }

        function setupHero(item) {
            const hero = document.getElementById('drakorHero'); hero.classList.remove('hidden');
            loadImage(item.cover, document.getElementById('heroImage'));
            document.getElementById('heroTitle').innerText = item.title;
            document.getElementById('heroSynopsis').innerText = item.sinopsis || 'No synopsis available.';
            window.currentItem = item;
        }
        function playHero() { if (window.currentItem) openDetail(window.currentItem); }
        function infoHero() { if (window.currentItem) openDetail(window.currentItem); }

        async function openDetail(item) {
            console.log('openDetail called for', item.title);
            const modal = document.getElementById('detailModal');
            loadImage(item.cover, document.getElementById('modalPoster'));
            loadImage(item.cover, document.getElementById('modalPosterMobile'));
            document.getElementById('modalTitleDesktop').innerText = item.title;
            document.getElementById('modalTitle').innerText = item.title;
            document.getElementById('modalSynopsis').innerText = item.sinopsis || 'No synopsis available.';
            document.getElementById('modalStatusDesktop').innerText = item.status || 'Ongoing';
            document.getElementById('modalStatus').innerText = item.status || 'Ongoing';
            const totalEps = parseInt(item.total_chapters) || 0;
            document.getElementById('modalChaptersDesktop').innerText = \`\${totalEps} Episodes\`;
            document.getElementById('modalChapters').innerText = \`\${totalEps} Episodes\`;
            document.getElementById('playerContainer').classList.add('hidden');
            const video = document.getElementById('videoPlayer'); video.pause(); video.removeAttribute('src');
            document.getElementById('episodeGrid').innerHTML = '';
            document.getElementById('episodeGridLoading').classList.remove('hidden');
            modal.classList.remove('hidden'); document.body.style.overflow = 'hidden';

            try {
                const res = await fetch(\`\${DETAIL_API_BASE}?bookId=\${item.book_id}\`);
                const data = await res.json();
                if (data.success && data.result) {
                    if (Array.isArray(data.result)) currentChapters = data.result;
                    else if (data.result.episodes && Array.isArray(data.result.episodes)) currentChapters = data.result.episodes;
                    else currentChapters = [];
                    currentChapters.length > 0 ? renderEpisodeGrid(currentChapters) : document.getElementById('episodeGrid').innerHTML = '<p class="col-span-full text-center text-gray-500">Tidak ada episode.</p>';
                } else {
                     document.getElementById('episodeGrid').innerHTML = '<p class="col-span-full text-center text-gray-500">Tidak ada episode.</p>';
                }
            } catch (err) {
                document.getElementById('episodeGrid').innerHTML = '<p class="col-span-full text-center text-red-500">Gagal memuat episode.</p>';
            } finally { document.getElementById('episodeGridLoading').classList.add('hidden'); }
        }

        function renderEpisodeGrid(chapters) {
            const grid = document.getElementById('episodeGrid'); grid.innerHTML = '';
            chapters.sort((a, b) => a.episode - b.episode);
            chapters.forEach((chapter) => {
                const btn = document.createElement('button');
                btn.className = 'aspect-square bg-card border border-white/10 hover:border-gold hover:bg-white/10 rounded flex items-center justify-center text-gray-300 font-semibold text-sm transition focus:ring-2 focus:ring-gold focus:outline-none';
                btn.innerText = chapter.episode;
                btn.onclick = () => playEpisode(chapter);
                grid.appendChild(btn);
            });
        }

        async function playEpisode(chapter) {
            const playerContainer = document.getElementById('playerContainer');
            const video = document.getElementById('videoPlayer');
            const loading = document.getElementById('playerLoading');
            const error = document.getElementById('playerError');
            currentPlayingVideoId = chapter.video_id;
            playerContainer.classList.remove('hidden'); playerContainer.scrollIntoView({ behavior: 'smooth' });
            video.pause(); video.src = ""; video.removeAttribute('poster');
            loading.classList.remove('hidden'); error.classList.add('hidden');

            if(chapter.cover) {
                 if (chapter.cover.toLowerCase().includes('.heic')) {
                    fetch(chapter.cover).then(r => r.blob()).then(blob => heic2any({ blob, toType: "image/jpeg", quality: 0.5 })).then(res => video.poster = URL.createObjectURL(res)).catch(() => video.poster = "");
                 } else video.poster = chapter.cover;
            }

            try {
                const res = await fetch(\`\${STREAM_API_BASE}?videoId=\${chapter.video_id}\`);
                const data = await res.json();
                if (data.success && data.result && data.result.length > 0) {
                    const preferred = data.result.find(r => r.quality === '720p') || data.result.find(r => r.quality === '540p') || data.result[0];
                    if (preferred && preferred.url) {
                        const proxyUrl = \`\${PROXY_VIDEO_BASE}?url=\${encodeURIComponent(preferred.url)}\`;
                        if (Hls.isSupported() && preferred.url.endsWith('.m3u8')) {
                            const hls = new Hls(); hls.loadSource(proxyUrl); hls.attachMedia(video);
                            hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(e => loading.classList.add('hidden')));
                        } else {
                            video.src = proxyUrl;
                            video.play().catch(e => { console.warn("Autoplay prevented"); loading.classList.add('hidden'); });
                        }
                        video.onloadeddata = () => loading.classList.add('hidden');
                    } else throw new Error('No valid URL');
                } else throw new Error('No stream result');
            } catch (err) {
                console.error(err); loading.classList.add('hidden'); error.classList.remove('hidden');
                document.getElementById('playerErrorMsg').innerText = "Gagal memuat video: " + err.message;
            }
        }
        function retryVideo() { if (currentPlayingVideoId) { const chapter = currentChapters.find(c => c.video_id === currentPlayingVideoId); if(chapter) playEpisode(chapter); } }
        function closeModal() { document.getElementById('detailModal').classList.add('hidden'); document.body.style.overflow = ''; document.getElementById('videoPlayer').pause(); }
        document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
        document.getElementById('searchBtn').addEventListener('click', () => { const q = document.getElementById('searchInput').value; if(q) fetchMods(q); });
        document.getElementById('mobileSearchBtn').addEventListener('click', () => { const q = document.getElementById('mobileSearchInput').value; if(q) fetchMods(q); });
        document.getElementById('videoPlayer').addEventListener('error', (e) => { console.error("Video Error", e); document.getElementById('playerLoading').classList.add('hidden'); document.getElementById('playerError').classList.remove('hidden'); });
        fetchMods();
    </script>
</body>
</html>
`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const API_KEY_VAL = env.API_KEY || DEFAULT_API_KEY;

    if (!API_KEY_VAL) {
        return new Response('API_KEY is not configured', { status: 500 });
    }

    // --- API Proxies ---
    if (url.pathname === '/api/mod') {
        const query = url.searchParams.get('query') || 'Michat';
        const apiUrl = `https://api.ferdev.my.id/search/getmodsapk?query=${query}&apikey=${API_KEY_VAL}`;
        const response = await fetch(apiUrl);
        return new Response(response.body, { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname === '/api/drakor') {
        const query = url.searchParams.get('query') || 'CEO';
        const apiUrl = `https://api.ferdev.my.id/internet/melolo/search?query=${query}&apikey=${API_KEY_VAL}`;
        const response = await fetch(apiUrl);
        return new Response(response.body, { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname === '/api/detail') {
        const bookId = url.searchParams.get('bookId');
        const apiUrl = `https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=${API_KEY_VAL}`;
        const response = await fetch(apiUrl);
        return new Response(response.body, { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname === '/api/stream') {
        const videoId = url.searchParams.get('videoId');
        const apiUrl = `https://api.ferdev.my.id/internet/melolo/stream?videoId=${videoId}&apikey=${API_KEY_VAL}`;
        const response = await fetch(apiUrl);
        return new Response(response.body, { headers: { 'content-type': 'application/json' } });
    }

    // --- Video Proxy ---
    if (url.pathname === '/api/proxy-video') {
        const videoUrl = url.searchParams.get('url');
        if (!videoUrl) return new Response('Missing URL', { status: 400 });

        try {
            const vidRes = await fetch(videoUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Referer': 'https://tiktok.com/',
                }
            });

            // Stream back with CORS
            const headers = new Headers(vidRes.headers);
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

            // Handle range requests if needed (Cloudflare workers handle streaming automatically usually)
            return new Response(vidRes.body, {
                status: vidRes.status,
                statusText: vidRes.statusText,
                headers: headers
            });
        } catch (e) {
            return new Response('Proxy Error', { status: 502 });
        }
    }

    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  },
};
