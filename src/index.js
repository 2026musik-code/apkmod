
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MOD APPS - Premium Modded APKs</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background: #0f0f0f;
            color: #e0e0e0;
        }
        h1, h2, h3 {
            font-family: 'Playfair Display', serif;
        }
        .luxury-gradient {
            background: linear-gradient(135deg, #d4af37, #f1c40f, #b8860b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .card {
            background: rgba(30, 30, 30, 0.6);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(212, 175, 55, 0.2);
            transition: all 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            border-color: rgba(212, 175, 55, 0.8);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.3);
        }
        .btn-luxury {
            background: linear-gradient(45deg, #d4af37, #b8860b);
            color: #000;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn-luxury:hover {
            background: linear-gradient(45deg, #f1c40f, #d4af37);
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.6);
        }
        .loader {
            border-top-color: #d4af37;
            -webkit-animation: spinner 1.5s linear infinite;
            animation: spinner 1.5s linear infinite;
        }
        @keyframes spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb {
            background: #444;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #d4af37;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</head>
<body class="min-h-screen flex flex-col items-center justify-start py-10 px-4">

    <!-- Header -->
    <header class="text-center mb-12 animate-fade-in-down">
        <div class="inline-block p-2 border-b-2 border-yellow-600 mb-4">
            <i class="fas fa-crown text-yellow-500 text-3xl"></i>
        </div>
        <h1 class="text-5xl md:text-6xl font-bold mb-2 luxury-gradient tracking-wide">MOD APPS</h1>
        <p class="text-gray-400 text-lg">Premium Selection of Modded Applications</p>
    </header>

    <!-- Search Section -->
    <div class="w-full max-w-2xl mb-12 relative group">
        <div class="absolute inset-0 bg-yellow-500 blur-lg opacity-20 group-hover:opacity-40 transition duration-300 rounded-full"></div>
        <div class="relative flex items-center bg-gray-900 rounded-full border border-gray-700 shadow-2xl overflow-hidden focus-within:border-yellow-500 transition-colors duration-300">
            <i class="fas fa-search text-gray-500 ml-6 text-xl"></i>
            <input type="text" id="searchInput" placeholder="Search for your favorite mod..."
                   class="w-full bg-transparent text-white px-4 py-4 focus:outline-none text-lg placeholder-gray-600"
                   onkeydown="if(event.key === 'Enter') searchMods()">
            <button onclick="searchMods()" class="btn-luxury px-8 py-4 rounded-full m-1 hover:scale-105 transform">
                SEARCH
            </button>
        </div>
    </div>

    <!-- Categories -->
    <div class="w-full max-w-7xl mb-8 px-4">
        <div class="flex overflow-x-auto space-x-4 pb-4 no-scrollbar" id="categoryList">
            <button onclick="filterCategory('Viral')" class="category-btn whitespace-nowrap px-6 py-2 rounded-full border border-yellow-600/50 bg-yellow-600/20 text-yellow-500 font-semibold transition-all">Viral</button>
            <button onclick="filterCategory('Chat')" class="category-btn whitespace-nowrap px-6 py-2 rounded-full border border-gray-700 hover:border-yellow-600/50 hover:text-yellow-500 text-gray-400 font-semibold transition-all">Chat</button>
            <button onclick="filterCategory('Game')" class="category-btn whitespace-nowrap px-6 py-2 rounded-full border border-gray-700 hover:border-yellow-600/50 hover:text-yellow-500 text-gray-400 font-semibold transition-all">Game</button>
            <button onclick="filterCategory('+18')" class="category-btn whitespace-nowrap px-6 py-2 rounded-full border border-gray-700 hover:border-yellow-600/50 hover:text-yellow-500 text-gray-400 font-semibold transition-all">+18</button>
            <button onclick="filterCategory('VPN')" class="category-btn whitespace-nowrap px-6 py-2 rounded-full border border-gray-700 hover:border-yellow-600/50 hover:text-yellow-500 text-gray-400 font-semibold transition-all">VPN</button>
            <button onclick="filterCategory('Browser')" class="category-btn whitespace-nowrap px-6 py-2 rounded-full border border-gray-700 hover:border-yellow-600/50 hover:text-yellow-500 text-gray-400 font-semibold transition-all">Browser</button>
        </div>
    </div>

    <!-- Recommended Section -->
    <div id="recommendedSection" class="w-full max-w-7xl mb-12 px-4">
        <h2 class="text-2xl font-bold mb-6 text-yellow-500 border-l-4 border-yellow-500 pl-4">Recommended</h2>
        <div id="recommendedList" class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 no-scrollbar">
            <!-- Loading placeholders -->
            <div class="min-w-[calc(50%-0.5rem)] md:min-w-[33%] lg:min-w-[25%] shrink-0 snap-center h-64 bg-gray-800/50 rounded-xl animate-pulse"></div>
            <div class="min-w-[calc(50%-0.5rem)] md:min-w-[33%] lg:min-w-[25%] shrink-0 snap-center h-64 bg-gray-800/50 rounded-xl animate-pulse"></div>
        </div>
    </div>

    <!-- Results Section -->
    <div id="loading" class="hidden mb-8">
        <div class="loader ease-linear rounded-full border-4 border-t-4 border-gray-700 h-12 w-12"></div>
    </div>

    <div id="error" class="hidden mb-8 text-red-400 bg-red-900/20 px-6 py-3 rounded-lg border border-red-900">
        <i class="fas fa-exclamation-circle mr-2"></i> <span id="errorMessage">Something went wrong.</span>
    </div>

    <div id="results" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4">
        <!-- Results will be injected here -->
    </div>

    <!-- Footer -->
    <footer class="mt-20 text-gray-600 text-sm">
        <p>&copy; 2026 MOD APPS. All rights reserved.</p>
    </footer>

    <script>
        const API_KEY = 'dedi131';
        const API_URL = 'https://api.ferdev.my.id/search/getmodsapk';

        async function searchMods() {
            const query = document.getElementById('searchInput').value.trim();
            if (!query) return;

            const resultsContainer = document.getElementById('results');
            const loading = document.getElementById('loading');
            const errorDiv = document.getElementById('error');

            // Reset UI
            resultsContainer.innerHTML = '';
            errorDiv.classList.add('hidden');
            loading.classList.remove('hidden');

            try {
                const response = await fetch(\`\${API_URL}?query=\${encodeURIComponent(query)}&apikey=\${API_KEY}\`);
                const data = await response.json();

                loading.classList.add('hidden');

                if (data.success && data.data && data.data.length > 0) {
                    displayResults(data.data);
                } else {
                    showError('No results found for your query.');
                }
            } catch (err) {
                loading.classList.add('hidden');
                showError('Failed to fetch data. Please try again later.');
                console.error(err);
            }
        }

        function displayResults(items) {
            const resultsContainer = document.getElementById('results');

            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card rounded-xl overflow-hidden shadow-lg flex flex-col h-full';

                // Fallback image handling
                const imgUrl = item.image || 'https://via.placeholder.com/300x200?text=No+Image';

                card.innerHTML = \`
                    <div class="relative h-48 overflow-hidden">
                        <img src="\${imgUrl}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" alt="\${item.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-110">
                        <div class="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-500/30">
                            \${item.version}
                        </div>
                    </div>
                    <div class="p-6 flex-grow flex flex-col">
                        <h3 class="text-xl font-bold mb-2 text-white line-clamp-1" title="\${item.title}">\${item.title}</h3>

                        <div class="flex items-center text-sm text-gray-400 mb-4 space-x-4">
                            <span class="flex items-center"><i class="fas fa-hdd mr-1 text-gray-500"></i> \${item.size}</span>
                            <span class="flex items-center"><i class="fas fa-check-circle mr-1 text-green-500"></i> \${item.status}</span>
                        </div>

                        <div class="mb-6 flex-grow">
                            <p class="text-gray-300 text-sm italic border-l-2 border-yellow-600 pl-3 py-1 bg-white/5 rounded-r">
                                \${item.modFeature || 'Standard Mod Features'}
                            </p>
                        </div>

                        <a href="\${item.link}" target="_blank" rel="noopener noreferrer"
                           class="btn-luxury text-center py-3 rounded-lg text-sm uppercase tracking-wider font-bold shadow-lg block mt-auto hover:text-black hover:no-underline">
                            <i class="fas fa-download mr-2"></i> Download Now
                        </a>
                    </div>
                \`;
                resultsContainer.appendChild(card);
            });
        }

        function showError(msg) {
            const errorDiv = document.getElementById('error');
            const errorMsg = document.getElementById('errorMessage');
            errorMsg.textContent = msg;
            errorDiv.classList.remove('hidden');
        }

        let currentCategory = 'Viral';

        async function filterCategory(category) {
            currentCategory = category;
            updateCategoryButtons();
            await fetchRecommendations(category);
        }

        function updateCategoryButtons() {
            const buttons = document.querySelectorAll('.category-btn');
            buttons.forEach(btn => {
                const btnCategory = btn.textContent.trim();
                // Reset styles
                btn.className = 'category-btn whitespace-nowrap px-6 py-2 rounded-full border border-gray-700 hover:border-yellow-600/50 hover:text-yellow-500 text-gray-400 font-semibold transition-all';

                if (btnCategory === currentCategory) {
                    // Active style
                    btn.className = 'category-btn whitespace-nowrap px-6 py-2 rounded-full border border-yellow-600/50 bg-yellow-600/20 text-yellow-500 font-semibold transition-all';
                }
            });
        }

        async function fetchRecommendations(category) {
            const list = document.getElementById('recommendedList');
            // specific loading skeleton for carousel
            list.innerHTML = `
                <div class="min-w-[calc(50%-0.5rem)] md:min-w-[33%] lg:min-w-[25%] shrink-0 snap-center h-64 bg-gray-800/50 rounded-xl animate-pulse"></div>
                <div class="min-w-[calc(50%-0.5rem)] md:min-w-[33%] lg:min-w-[25%] shrink-0 snap-center h-64 bg-gray-800/50 rounded-xl animate-pulse"></div>
            `;

            try {
                const response = await fetch(\`\${API_URL}?query=\${encodeURIComponent(category)}&apikey=\${API_KEY}\`);
                const data = await response.json();

                list.innerHTML = '';

                if (data.success && data.data && data.data.length > 0) {
                    data.data.forEach(item => {
                        const card = createRecommendationCard(item);
                        list.appendChild(card);
                    });
                } else {
                    list.innerHTML = '<div class="text-gray-500 p-4 min-w-full text-center">No recommendations found.</div>';
                }
            } catch (err) {
                console.error(err);
                list.innerHTML = '<div class="text-red-500 p-4 min-w-full text-center">Failed to load recommendations.</div>';
            }
        }

        function createRecommendationCard(item) {
             const card = document.createElement('div');
             // 1 row 2 columns layout: min-w-[calc(50%-0.5rem)]
             card.className = 'min-w-[calc(50%-0.5rem)] md:min-w-[33%] lg:min-w-[25%] shrink-0 snap-center card rounded-xl overflow-hidden shadow-lg flex flex-col h-full';

             const imgUrl = item.image || 'https://via.placeholder.com/300x200?text=No+Image';

             card.innerHTML = \`
                <div class="relative h-32 overflow-hidden">
                    <img src="\${imgUrl}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" alt="\${item.title}" class="w-full h-full object-cover">
                    <div class="absolute top-1 right-1 bg-black/70 backdrop-blur-md text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-yellow-500/30">
                        \${item.version}
                    </div>
                </div>
                <div class="p-4 flex-grow flex flex-col">
                    <h3 class="text-sm font-bold mb-1 text-white line-clamp-1" title="\${item.title}">\${item.title}</h3>
                    <div class="mb-3 flex-grow">
                         <p class="text-gray-400 text-xs line-clamp-2">\${item.modFeature || 'Modded'}</p>
                    </div>
                    <a href="\${item.link}" target="_blank" rel="noopener noreferrer"
                       class="btn-luxury text-center py-2 rounded text-xs uppercase font-bold shadow-lg block mt-auto hover:text-black hover:no-underline">
                        Download
                    </a>
                </div>
             \`;
             return card;
        }

        // Optional: Trigger search on load if query param exists
        window.addEventListener('load', () => {
             const urlParams = new URLSearchParams(window.location.search);
             const q = urlParams.get('q');
             if (q) {
                 document.getElementById('searchInput').value = q;
                 searchMods();
                 filterCategory('Viral');
             } else {
                 filterCategory('Viral');
             }
        });
    </script>
</body>
</html>
`;

export default {
  async fetch(request, env, ctx) {
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};
