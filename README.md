# Gen AI Club · NIAT SANSKRITI

Official portal for the Gen AI Club of NIAT Sanskriti — student research lab dedicated to open foundation models, autonomous agents, and multimodal systems.

## 🚀 Deploy to Netlify

This project is pre-configured for one-click deployment on **Netlify**.

### Build Settings
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** `>= 20.0.0`

### Environment Variables
In your Netlify site dashboard (**Site configuration > Environment variables**), add the following:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public / Publishable Anon Key | `sb_publishable_...` |
| `GEMINI_API_KEY` | *(Optional)* Google Gemini API Key | `AIzaSy...` |

> ⚠️ **Note:** Supabase URL in client environments must strictly use the **public publishable / anon key** (`sb_publishable_...` or JWT anon key). Never put the secret `service_role` key in Netlify environment variables.

### SPA Routing & Redirects
A `netlify.toml` and `public/_redirects` file are included to ensure all client-side routes rewrite to `/index.html` with HTTP 200.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Production build test:
   ```bash
   npm run build
   ```
