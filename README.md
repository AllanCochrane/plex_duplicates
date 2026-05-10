# Plex Duplicate Cleaner

A specialized web utility to scan your Plex Media Server for duplicate movie and TV show files, allowing you to easily identify lower-quality versions and reclaim disk space.

## 🚀 Installation

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
