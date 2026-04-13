# 🪡 FabricFit — AI Virtual Try-On for Indian Fabrics

An MVP web app that lets shopkeepers and customers visualize what a fabric will look like when stitched into a specific Indian outfit worn by a person.

---

## 📁 Folder Structure

```
fabric-tryon/
├── backend/
│   ├── main.py              ← FastAPI app
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js
    │   ├── index.css
    │   ├── App.js
    │   └── App.css
    ├── package.json
    └── .env.example
```

---

## ⚙️ Setup Instructions

### Step 1 — Get a Replicate API Key

1. Sign up free at https://replicate.com
2. Go to https://replicate.com/account/api-tokens
3. Copy your token

---

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and paste your REPLICATE_API_TOKEN

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Create .env
cp .env.example .env
# Edit if your backend runs on a different port

# Install and start
npm install
npm start
```

Frontend runs at: http://localhost:3000

---

## 🤖 How the AI Works

### Model Used
`stability-ai/stable-diffusion-img2img` on Replicate

### What it does
- Takes the **person image** as base image
- Uses `prompt_strength: 0.6` — keeps 40% of original (person's pose/body)
- Changes 60% based on the outfit prompt + fabric texture

### Sample Prompts Generated

**For Kurta:**
```
A person wearing a traditional Indian kurta made from this fabric, long tunic style,
full length view, high quality photo, realistic fabric texture, detailed clothing,
natural lighting, fashion photography style, Indian traditional wear
```

**For Lehenga:**
```
A person wearing a beautiful Indian lehenga made from this fabric, flared skirt 
with blouse, high quality photo, realistic fabric texture, detailed clothing,
natural lighting, fashion photography style, Indian traditional wear
```

### Tuning `prompt_strength`
- `0.4` = More like original person, less outfit change
- `0.6` = Balanced (default)
- `0.75` = More AI generation, less original photo

---

## 💡 Ways to Improve Realism (Bonus)

### Near-term (free/cheap)
1. **Use ControlNet** (also on Replicate) — keeps the person's exact pose while changing clothing
2. **Better model**: `realistic-vision-v5` or `juggernaut-xl` for more photorealistic output
3. **Add fabric analysis step**: Use GPT-4 Vision to describe the fabric texture/color before generating prompt
4. **Inpainting**: Mask only the clothing region of the person, so face/background stays 100% original

### Medium-term
5. **IDM-VTON model** — a dedicated virtual try-on model (cloth warping, not just img2img)
6. **CatVTON** — state-of-art garment transfer, available open source
7. **Let users adjust prompt strength** with a slider in UI

### Advanced
8. **Run locally** with ComfyUI + ControlNet for zero API cost
9. **Fine-tune** on Indian garment datasets for better kurta/lehenga accuracy

---

## 🚀 Deployment (Free/Cheap)

### Backend (FastAPI)
| Platform | Cost | Notes |
|----------|------|-------|
| **Render.com** | Free tier | Easy, add env vars in dashboard |
| **Railway.app** | ~$5/mo | Fast deploys from GitHub |
| **Fly.io** | Free tier | Docker-based |

```bash
# Render: add render.yaml
# Railway: connect GitHub repo, set REPLICATE_API_TOKEN env var
```

### Frontend (React)
| Platform | Cost | Notes |
|----------|------|-------|
| **Vercel** | Free | Best for React, instant deploys |
| **Netlify** | Free | Drag-drop deploy |
| **GitHub Pages** | Free | Static hosting |

For Vercel:
```bash
cd frontend
npm run build
npx vercel deploy
# Set REACT_APP_API_URL to your Render/Railway backend URL
```

### Full Stack on One Server
Use a ₹500/month DigitalOcean or Hetzner VPS, run both behind nginx.

---

## 💸 API Cost Estimate

Replicate charges per second of GPU time:
- Stable Diffusion img2img: ~$0.0023/run (about **₹0.20 per generation**)
- Free credits given on signup

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `REPLICATE_API_TOKEN not set` | Add token to `backend/.env` |
| CORS error | Make sure backend is running on port 8000 |
| Generation takes forever | Normal — SD takes 20-40s |
| Poor results | Try different `prompt_strength` (0.5–0.7 range) |
| Face looks distorted | Add `preserve face` to prompt or use inpainting |
