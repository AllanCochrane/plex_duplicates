# Plex Duplicate Cleaner

A specialized web utility to scan your Plex Media Server for duplicate movie and TV show files, allowing you to easily identify lower-quality versions and reclaim disk space.

## 🚀 Installation

**Prerequisites:** You must have **Node.js v20.0.0 or higher** installed to run this project. You can check your version by running `node -v`.

1. **Clone the repository** (or download the source).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL shown in your terminal (usually `http://localhost:3000`).

## 🛠 Operation

1. **Connect**: Enter your Plex Server URL and your X-Plex-Token.
2. **Select Library**: Choose the Movie or TV Show library you wish to scan.
3. **Review Duplicates**: The app will group duplicates together. You can see the resolution, bitrate, codec, and file size for each version.
4. **Delete**: Click the "Delete" button on the file you want to remove.
   - *Note*: Ensure "Allow media deletion" is enabled in your Plex Server settings (Settings > Library).

## 🔑 Finding your Plex Token

To locate your `X-Plex-Token`:
1. Log in to your Plex Web App.
2. Navigate to any item (movie or episode) in your library.
3. Click the **...** (More) button and select **Get Info**.
4. Click the **View XML** link at the bottom left of the Info window.
5. In the browser tab that opens, look at the URL. Find the parameter `X-Plex-Token=...`. The string after the equals sign is your token.

## 🌐 Understanding Connection Warnings

**"Your local network IP will only work if you allow mixed-content or use a secure plex.direct URL."**

### What this means practically:
Because this application is often served over a secure connection (`https://...`), web browsers enforce a security policy called **Mixed Content blocking**. This prevents a secure site from making requests to an insecure (`http://`) local IP address (like `http://192.168.1.50:32400`).

**Options to fix this:**
1. **Use your `plex.direct` URL**: This is a secure HTTPS address provided by Plex for every server (e.g., `https://192-168-1-50.abcdef...plex.direct:32400`). You can find this in your server console or by inspecting network requests in the Plex Web app.
2. **Enable Insecure Content**: If you must use a local IP (HTTP), find the site settings in your browser (usually the lock icon or "site info" in the URL bar) and look for "Insecure content". Set it to **Allow**. This tells the browser to trust requests from this specific app to your local server.

## 🐛 Troubleshooting

### `Cannot find native binding` or Tailwind error on `npm run dev`
If you encounter this error:
`Error: Cannot find native binding. npm has a bug related to optional dependencies...`

**1. Check your Node.js version**
If your terminal also shows an `EBADENGINE` warning (e.g., `Unsupported engine: package: '@tailwindcss/oxide...', required: { node: '>= 20' }`), you are using an older version of Node.js (like v18). Tailwind CSS v4 and the Vite plugins for this project require Node v20+. **You must upgrade your Node.js installation** to version 20 or higher. 

**2. Clean Reinstall**
Once you are on Node 20+, or if you were already on Node 20+ and encountered the underlying npm bug, run the following commands to wipe out the bad installation and try again:
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```