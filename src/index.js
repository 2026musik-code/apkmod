
// Default fallback for development/demo (Note: Should be kept secret in production)
const DEFAULT_API_KEY = 'dedi131';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- Key Management ---
    // Try to get key from R2 first, then Env, then Default
    let API_KEY_VAL = null;
    let isCustomKey = false;

    // Check R2
    if (env.BUCKET) {
        try {
            const obj = await env.BUCKET.get('API_KEY');
            if (obj) {
                API_KEY_VAL = (await obj.text()).trim();
                isCustomKey = true;
            }
        } catch (e) {
            console.error('Failed to read from R2', e);
        }
    }

    // Fallback
    if (!API_KEY_VAL) {
        API_KEY_VAL = env.API_KEY || DEFAULT_API_KEY;
    }

    // Handle Settings Save/Check/Reset
    if (url.pathname === '/api/settings') {
        if (!env.BUCKET) return new Response(JSON.stringify({ success: false, message: 'R2 Bucket not configured' }), { headers: {'content-type': 'application/json'} });

        // GET: Check status
        if (request.method === 'GET') {
             return new Response(JSON.stringify({ configured: isCustomKey }), { headers: {'content-type': 'application/json'} });
        }

        // POST: Save
        if (request.method === 'POST') {
            try {
                const body = await request.json();
                if(body.key) {
                    await env.BUCKET.put('API_KEY', body.key.trim());
                    return new Response(JSON.stringify({ success: true }), { headers: {'content-type': 'application/json'} });
                }
                return new Response(JSON.stringify({ success: false, message: 'Missing key' }), { headers: {'content-type': 'application/json'} });
            } catch(e) {
                return new Response(JSON.stringify({ success: false, message: e.message }), { headers: {'content-type': 'application/json'} });
            }
        }

        // DELETE: Reset
        if (request.method === 'DELETE') {
             try {
                await env.BUCKET.delete('API_KEY');
                return new Response(JSON.stringify({ success: true }), { headers: {'content-type': 'application/json'} });
             } catch(e) {
                return new Response(JSON.stringify({ success: false, message: e.message }), { headers: {'content-type': 'application/json'} });
             }
        }
    }

    // --- Upstream Proxy Headers ---
    const upstreamHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': 'https://google.com/'
    };

    // --- API Proxies (Restored for Fallback) ---
    if (url.pathname === '/api/mod') {
        const query = url.searchParams.get('query') || 'Michat';
        const apiUrl = `https://api.ferdev.my.id/search/getmodsapk?query=${query}&apikey=${API_KEY_VAL}`;
        try {
            const response = await fetch(apiUrl, { headers: upstreamHeaders });
            if (!response.ok) {
                 const txt = await response.text();
                 return new Response(JSON.stringify({ success: false, message: `Proxy Error ${response.status}: ${txt.substring(0, 100)}` }), { headers: { 'content-type': 'application/json' } });
            }
            return new Response(response.body, { headers: { 'content-type': 'application/json' } });
        } catch(e) {
            return new Response(JSON.stringify({ success: false, message: `Proxy Fetch Error: ${e.message}` }), { headers: { 'content-type': 'application/json' } });
        }
    }
    if (url.pathname === '/api/drakor') {
        const query = url.searchParams.get('query') || 'CEO';
        const apiUrl = `https://api.ferdev.my.id/internet/melolo/search?query=${query}&apikey=${API_KEY_VAL}`;
        const response = await fetch(apiUrl, { headers: upstreamHeaders });
        return new Response(response.body, { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname === '/api/detail') {
        const bookId = url.searchParams.get('bookId');
        const apiUrl = `https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=${API_KEY_VAL}`;
        const response = await fetch(apiUrl, { headers: upstreamHeaders });
        return new Response(response.body, { headers: { 'content-type': 'application/json' } });
    }
    if (url.pathname === '/api/stream') {
        const videoId = url.searchParams.get('videoId');
        const apiUrl = `https://api.ferdev.my.id/internet/melolo/stream?videoId=${videoId}&apikey=${API_KEY_VAL}`;
        const response = await fetch(apiUrl, { headers: upstreamHeaders });
        return new Response(response.body, { headers: { 'content-type': 'application/json' } });
    }

    // --- Video Proxy (Server-Side) ---
    if (url.pathname === '/api/proxy-video') {
        const videoUrl = url.searchParams.get('url');
        if (!videoUrl) return new Response('Missing URL', { status: 400 });

        try {
            const vidRes = await fetch(videoUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': 'https://tiktok.com/',
                }
            });

            // Stream back with CORS
            const headers = new Headers(vidRes.headers);
            headers.set('Access-Control-Allow-Origin', '*');
            headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

            return new Response(vidRes.body, {
                status: vidRes.status,
                statusText: vidRes.statusText,
                headers: headers
            });
        } catch (e) {
            return new Response('Proxy Error', { status: 502 });
        }
    }

    // --- HTML Injection ---
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
        .glass-panel { background: rgba(24, 24, 24, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
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
<body class="bg-darker text-white font-sans antialiased min-h-screen pb-20 bg-gradient-to-b from-darker to-[#0f0f0f]">

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

            <div class="flex items-center gap-4">
                <div id="searchContainer" class="hidden md:flex max-w-md">
                    <div class="relative w-full">
                        <input type="text" id="searchInput" placeholder="Cari aplikasi..."
                            class="w-full bg-card border border-white/10 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-gold transition text-white placeholder-gray-500">
                        <button id="searchBtn" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gold hover:text-white">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </div>
                <!-- Settings Button -->
                <button onclick="openSettings()" class="text-gray-400 hover:text-gold transition">
                    <i class="fas fa-cog text-xl"></i>
                </button>
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
            <div class="glass-panel w-full md:max-w-4xl md:rounded-xl shadow-2xl overflow-hidden relative min-h-screen md:min-h-0 bg-[#181818]">
                <button onclick="closeModal()" class="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 rounded-full text-white hover:bg-white/20 flex items-center justify-center transition">
                    <i class="fas fa-times"></i>
                </button>

                <!-- Branding Header -->
                <div class="absolute top-0 left-0 p-4 z-20 flex items-center gap-2 pointer-events-none">
                    <i class="fas fa-crown text-gold drop-shadow-lg"></i>
                    <span class="text-gold font-bold tracking-wider text-sm drop-shadow-lg">MOD APPS</span>
                </div>

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
                        <div class="md:hidden flex gap-4 mb-4 mt-8">
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

    <!-- Settings Modal -->
    <div id="settingsModal" class="fixed inset-0 z-[70] hidden flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onclick="closeSettings()"></div>
        <div class="glass-panel w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative p-6 z-10">
            <h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <i class="fas fa-cog text-gold"></i> Pengaturan
            </h3>

            <div class="mb-4">
                <p id="apiKeyStatus" class="text-sm text-gray-400 mb-2">Memeriksa status...</p>
                <label class="block text-sm text-gray-400 mb-2">Set API Key Baru</label>
                <input type="password" id="apiKeyInput" placeholder="Masukkan API Key..."
                    class="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-4 text-white focus:border-gold focus:outline-none transition">
                <p class="text-xs text-gray-500 mt-1">API Key akan disimpan di R2 (vpsai).</p>
            </div>

            <div class="flex justify-between gap-3">
                <button id="resetKeyBtn" onclick="resetSettings()" class="hidden px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition">Reset Default</button>
                <div class="flex gap-2">
                    <button onclick="closeSettings()" class="px-4 py-2 text-gray-300 hover:text-white transition">Batal</button>
                    <button onclick="saveSettings()" class="px-6 py-2 bg-gold text-black font-bold rounded-lg hover:bg-white transition flex items-center gap-2">
                        <i class="fas fa-save"></i> Simpan
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Inject API Key from Worker
        const ACTIVE_API_KEY = '${API_KEY_VAL}';

        // Client-Side Direct Fetch URLs
        const MOD_API_BASE = 'https://api.ferdev.my.id/search/getmodsapk';
        const DRAKOR_API_BASE = 'https://api.ferdev.my.id/internet/melolo/search';
        const DETAIL_API_BASE = 'https://api.ferdev.my.id/internet/melolo/detail';
        const STREAM_API_BASE = 'https://api.ferdev.my.id/internet/melolo/stream';

        // Fallback Proxy URLs (Worker)
        const MOD_PROXY = '/api/mod';
        const DRAKOR_PROXY = '/api/drakor';
        const DETAIL_PROXY = '/api/detail';
        const STREAM_PROXY = '/api/stream';
        const PROXY_VIDEO_BASE = '/api/proxy-video';
        const SETTINGS_API_BASE = '/api/settings';

        let currentModData = [];
        let drakorData = {};
        let currentChapters = [];
        let currentPlayingVideoId = null;
        let currentPage = 'home';

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
            currentPage = page;
            const modPage = document.getElementById('modPage');
            const drakorPage = document.getElementById('drakorPage');

            // Update Search Placeholders
            const placeholder = page === 'drakor' ? 'Cari Drama...' : 'Cari aplikasi...';
            document.getElementById('searchInput').placeholder = placeholder;
            document.getElementById('mobileSearchInput').placeholder = placeholder;

            window.history.replaceState(null, null, '#' + page);

            if (page === 'home') {
                modPage.classList.remove('hidden'); modPage.classList.remove('opacity-0');
                drakorPage.classList.add('hidden');
                document.getElementById('searchContainer').classList.remove('hidden');
            } else {
                modPage.classList.add('opacity-0');
                setTimeout(() => modPage.classList.add('hidden'), 300);
                drakorPage.classList.remove('hidden');
                document.getElementById('searchContainer').classList.remove('hidden'); // Keep search visible!
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
                imgElement.onerror = null;
                imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMzAwIiB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
                imgElement.classList.remove('animate-pulse', 'bg-gray-800');
            };
        }

        // --- Fetch with Fallback Logic ---
        async function robustFetch(directUrl, proxyUrl) {
            try {
                // Try Direct Client-Side first
                const res = await fetch(directUrl);
                if(res.ok) return await res.json();
                throw new Error('Direct fetch failed with ' + res.status);
            } catch(e) {
                console.warn('Direct fetch failed, trying proxy...', e);
                // Fallback to Proxy
                const res2 = await fetch(proxyUrl);
                const data2 = await res2.json();
                if(res2.ok && data2.success) return data2;
                throw new Error('Proxy fallback failed: ' + (data2.message || res2.statusText));
            }
        }

        async function fetchMods(query = 'Michat') {
            const grid = document.getElementById('modGrid');
            const loading = document.getElementById('loading');
            grid.innerHTML = ''; loading.classList.remove('hidden');

            const directUrl = \`\${MOD_API_BASE}?query=\${query}&apikey=\${ACTIVE_API_KEY}\`;
            const proxyUrl = \`\${MOD_PROXY}?query=\${query}\`;

            try {
                const data = await robustFetch(directUrl, proxyUrl);
                if (data.success && data.data) {
                    currentModData = data.data; renderMods(data.data); renderRecommendations(data.data);
                } else {
                    const msg = data.message || 'Tidak ada hasil ditemukan.';
                    grid.innerHTML = \`<p class="text-center text-gray-500 col-span-full">\${msg}</p>\`;
                }
            } catch (err) {
                console.error(err);
                grid.innerHTML = \`<p class="text-center text-red-500 col-span-full">Gagal memuat data: \${err.message}</p>\`;
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

        // --- NEW: Context-Aware Search for Drakor ---
        const handleSearch = () => {
            const q = document.getElementById('searchInput').value || document.getElementById('mobileSearchInput').value;
            if (currentPage === 'drakor') {
                searchDrakor(q);
            } else {
                fetchMods(q);
            }
        };

        async function searchDrakor(query) {
            const container = document.getElementById('drakorContent');
            const hero = document.getElementById('drakorHero');

            hero.classList.add('hidden'); // Hide Hero for results
            container.innerHTML = '<div class="text-center py-20"><i class="fas fa-spinner fa-spin text-4xl text-gold"></i></div>';

            try {
                const direct = \`\${DRAKOR_API_BASE}?query=\${query}&apikey=\${ACTIVE_API_KEY}\`;
                const proxy = \`\${DRAKOR_PROXY}?query=\${query}\`;

                const data = await robustFetch(direct, proxy);
                const items = data.result || data.data;

                container.innerHTML = '';

                if (items && Array.isArray(items) && items.length > 0) {
                    // Render Grid
                    const grid = document.createElement('div');
                    grid.className = 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';

                    items.forEach((item) => {
                       const card = document.createElement('div');
                       card.className = 'cursor-pointer group/card relative transition transform hover:scale-105 hover:z-10 duration-300';
                       card.onclick = () => openDetail(item);
                       const imgContainer = document.createElement('div');
                       imgContainer.className = 'aspect-poster bg-gray-800 rounded-lg overflow-hidden relative shadow-lg';
                       const img = document.createElement('img');
                       img.className = 'w-full h-full object-cover transition duration-500 group-hover/card:brightness-75';
                       loadImage(item.cover, img);
                       imgContainer.appendChild(img);
                       const title = document.createElement('h4');
                       title.className = 'mt-2 text-sm text-gray-300 font-medium truncate group-hover/card:text-white transition';
                       title.innerText = item.title;
                       card.appendChild(imgContainer);
                       card.appendChild(title);
                       grid.appendChild(card);
                    });

                    const title = document.createElement('h3');
                    title.className = 'text-xl font-bold text-white mb-4';
                    title.innerText = \`Hasil Pencarian: "\${query}"\`;
                    container.appendChild(title);
                    container.appendChild(grid);
                } else {
                    container.innerHTML = '<p class="text-center text-gray-500">Tidak ada drama ditemukan.</p>';
                }
            } catch(e) {
                container.innerHTML = \`<p class="text-center text-red-500">Pencarian gagal: \${e.message}</p>\`;
            }
        }

        const drakorCategories = ['CEO', 'Romantis', 'Aksi', 'Fantasi', 'Sekolah', 'Kerajaan'];
        async function initDrakor() {
            const container = document.getElementById('drakorContent');
            const hero = document.getElementById('drakorHero');
            hero.classList.remove('hidden'); // Show Hero again
            container.innerHTML = '<div class="text-center py-20"><i class="fas fa-spinner fa-spin text-4xl text-gold"></i></div>';
            try {
                const results = await Promise.all(drakorCategories.map(cat => {
                    const direct = \`\${DRAKOR_API_BASE}?query=\${cat}&apikey=\${ACTIVE_API_KEY}\`;
                    const proxy = \`\${DRAKOR_PROXY}?query=\${cat}\`;
                    return robustFetch(direct, proxy)
                        .then(data => ({ category: cat, data: data }))
                        .catch(() => ({ category: cat, data: [] }));
                }));

                container.innerHTML = '';
                results.forEach(result => {
                    const items = result.data.result || result.data.data;
                    if (items && Array.isArray(items) && items.length > 0) {
                        drakorData[result.category] = items; renderDrakorCategory(result.category, items);
                    }
                });
                if (drakorData['CEO'] && drakorData['CEO'].length > 0) setupHero(drakorData['CEO'][0]);
            } catch (e) { container.innerHTML = \`<p class="text-center text-red-500">Gagal memuat drakor: \${e.message}</p>\`; }
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
                const direct = \`\${DETAIL_API_BASE}?bookId=\${item.book_id}&apikey=\${ACTIVE_API_KEY}\`;
                const proxy = \`\${DETAIL_PROXY}?bookId=\${item.book_id}\`;

                const data = await robustFetch(direct, proxy);
                if (data.success && data.result) {
                    if (Array.isArray(data.result)) currentChapters = data.result;
                    else if (data.result.episodes && Array.isArray(data.result.episodes)) currentChapters = data.result.episodes;
                    else currentChapters = [];
                    currentChapters.length > 0 ? renderEpisodeGrid(currentChapters) : document.getElementById('episodeGrid').innerHTML = '<p class="col-span-full text-center text-gray-500">Tidak ada episode.</p>';
                } else {
                     document.getElementById('episodeGrid').innerHTML = '<p class="col-span-full text-center text-gray-500">Tidak ada episode.</p>';
                }
            } catch (err) {
                document.getElementById('episodeGrid').innerHTML = \`<p class="col-span-full text-center text-red-500">Gagal memuat episode: \${err.message}</p>\`;
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

            // Reset states
            loading.classList.remove('hidden');
            error.classList.add('hidden');

            if(chapter.cover) {
                 if (chapter.cover.toLowerCase().includes('.heic')) {
                    fetch(chapter.cover).then(r => r.blob()).then(blob => heic2any({ blob, toType: "image/jpeg", quality: 0.5 })).then(res => video.poster = URL.createObjectURL(res)).catch(() => video.poster = "");
                 } else video.poster = chapter.cover;
            }

            try {
                const direct = \`\${STREAM_API_BASE}?videoId=\${chapter.video_id}&apikey=\${ACTIVE_API_KEY}\`;
                const proxy = \`\${STREAM_PROXY}?videoId=\${chapter.video_id}\`;

                const data = await robustFetch(direct, proxy);
                if (data.success && data.result && data.result.length > 0) {
                    const preferred = data.result.find(r => r.quality === '720p') || data.result.find(r => r.quality === '540p') || data.result[0];
                    if (preferred && preferred.url) {
                        const proxyUrl = \`\${PROXY_VIDEO_BASE}?url=\${encodeURIComponent(preferred.url)}\`;
                        if (Hls.isSupported() && preferred.url.endsWith('.m3u8')) {
                            const hls = new Hls();
                            hls.loadSource(proxyUrl);
                            hls.attachMedia(video);
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

        // --- Video Logic ---
        const vPlayer = document.getElementById('videoPlayer');
        vPlayer.addEventListener('playing', () => {
            document.getElementById('playerLoading').classList.add('hidden');
            document.getElementById('playerError').classList.add('hidden');
        });
        vPlayer.addEventListener('timeupdate', () => {
            if(vPlayer.currentTime > 0.5) {
                 document.getElementById('playerLoading').classList.add('hidden');
                 document.getElementById('playerError').classList.add('hidden');
            }
        });
        vPlayer.addEventListener('error', (e) => {
             console.error("Video Error", e);
             if (vPlayer.paused) {
                 document.getElementById('playerLoading').classList.add('hidden');
                 document.getElementById('playerError').classList.remove('hidden');
             }
        });
        vPlayer.addEventListener('ended', () => {
            console.log('Video ended. Checking for next episode...');
            if (currentPlayingVideoId && currentChapters.length > 0) {
                // Find current chapter index
                // Note: currentChapters is sorted by episode number in openDetail
                const currentIndex = currentChapters.findIndex(c => c.video_id === currentPlayingVideoId);
                if (currentIndex !== -1 && currentIndex < currentChapters.length - 1) {
                    const nextChapter = currentChapters[currentIndex + 1];
                    console.log('Autoplaying next episode:', nextChapter.episode);

                    // Show toast notification
                    const toast = document.createElement('div');
                    toast.id = 'autoplayToast';
                    toast.className = 'fixed top-24 left-1/2 transform -translate-x-1/2 bg-gold text-black px-6 py-3 rounded-full shadow-2xl z-[80] font-bold flex items-center gap-2 animate-bounce';
                    toast.innerHTML = '<i class="fas fa-forward"></i> Memutar Episode ' + nextChapter.episode + '...';
                    document.body.appendChild(toast);

                    setTimeout(() => {
                        if(document.getElementById('autoplayToast')) document.getElementById('autoplayToast').remove();
                        playEpisode(nextChapter);
                    }, 2000);
                }
            }
        });

        // Initialize Routing
        window.addEventListener('load', () => {
            if(window.location.hash === '#drakor') {
                switchPage('drakor');
            } else {
                fetchMods();
            }
        });

        // Settings Functions
        async function openSettings() {
            document.getElementById('settingsModal').classList.remove('hidden');
            try {
                const res = await fetch(SETTINGS_API_BASE);
                const data = await res.json();
                const statusEl = document.getElementById('apiKeyStatus');
                if (data.configured) {
                     statusEl.innerHTML = '<span class="text-green-500 flex items-center gap-1"><i class="fas fa-check-circle"></i> Custom Key Active</span>';
                     document.getElementById('resetKeyBtn').classList.remove('hidden');
                } else {
                     statusEl.innerHTML = '<span class="text-gray-500 flex items-center gap-1"><i class="fas fa-info-circle"></i> Using Default Key</span>';
                     document.getElementById('resetKeyBtn').classList.add('hidden');
                }
            } catch(e) {
                console.error(e);
            }
        }
        function closeSettings() {
            document.getElementById('settingsModal').classList.add('hidden');
        }
        async function saveSettings() {
            const key = document.getElementById('apiKeyInput').value;
            if(!key) return alert('API Key tidak boleh kosong');

            try {
                const res = await fetch(SETTINGS_API_BASE, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: key.trim() }) // Trim frontend side too
                });
                const data = await res.json();
                if(data.success) {
                    alert('API Key berhasil disimpan di R2!');
                    closeSettings();
                    window.location.reload();
                } else {
                    alert('Gagal menyimpan: ' + (data.message || 'Error unknown'));
                }
            } catch (e) {
                alert('Gagal menyimpan: ' + e.message);
            }
        }
        async function resetSettings() {
            if(!confirm('Kembali ke Default Key? (Key di R2 akan dihapus)')) return;
            try {
                const res = await fetch(SETTINGS_API_BASE, { method: 'DELETE' });
                const data = await res.json();
                if(data.success) {
                    alert('API Key direset ke Default!');
                    closeSettings();
                    window.location.reload();
                } else {
                    alert('Gagal reset: ' + data.message);
                }
            } catch(e) { alert('Error: ' + e.message); }
        }

        document.getElementById('menuBtn').addEventListener('click', toggleSidebar);
        // Updated Listeners to use context-aware handler
        document.getElementById('searchBtn').addEventListener('click', handleSearch);
        document.getElementById('mobileSearchBtn').addEventListener('click', handleSearch);

        document.getElementById('videoPlayer').addEventListener('error', (e) => { console.error("Video Error", e); document.getElementById('playerLoading').classList.add('hidden'); document.getElementById('playerError').classList.remove('hidden'); });
    </script>
</body>
</html>
`;

    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  },
};
