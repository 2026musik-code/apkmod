# MOD APPS - Premium Modded APKs & Drakor

A web application built on Cloudflare Workers to browse and download premium modded APKs and watch Korean Dramas (Drakor).

## Setup & Deployment

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Deploy to Cloudflare Workers:**
    ```bash
    npx wrangler deploy
    ```

## Configuration (API Key)

The application uses an external API for fetching mods and videos.

**Option 1: Using `wrangler` CLI (Recommended for Secrets)**
Run the following command and paste your API key when prompted:
```bash
npx wrangler secret put API_KEY
```

**Option 2: Cloudflare Dashboard**
1.  Go to your Worker in the Cloudflare Dashboard.
2.  Navigate to **Settings** > **Variables**.
3.  Add a new variable:
    -   **Variable name:** `API_KEY`
    -   **Value:** `dedi131` (or your new key)
    -   Click **Encrypt** (recommended) or Save.

**Option 3: Local Development (`.dev.vars`)**
For local development using `wrangler dev`, create a `.dev.vars` file in the root directory:
```
API_KEY=dedi131
```

## Features

-   **Mod Apps:** Search and download modded APKs.
-   **Drakor Mods:** Watch Korean Dramas with streaming support.
-   **Video Proxy:** Proxies video streams to bypass CORS restrictions.
-   **Responsive UI:** Mobile-friendly dark theme.
