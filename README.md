# Simple Wiki (Pure HTML/CSS/JS)

This is a **no-build, zero-dependency** wiki template.  
It uses a single `index.html` with a hash-based router and loads HTML pages from `/pages`.

## 📂 Structure
```
wiki/
├── index.html                # Main HTML + router entry
├── assets/                   # Styles, scripts, icons
│   ├── styles.css             # Theme (light/dark), layout
│   ├── app.js                 # SPA router, search, theme toggle
│   └── favicon.svg            # Favicon
└── pages/                    # Content pages (pure HTML)
    ├── start.html
    ├── windows.html
    ├── faq.html
    ├── reference.html
    ├── syntax.html
    ├── download.html
    ├── tooling.html
    └── tour.html
```

## 🚀 How to use
1. **Edit pages** in `/pages/`. Each file is a separate wiki page.
2. **Update sidebar links** in `index.html` (inside `<aside class="sidebar">`).
3. **Push to GitHub Pages**:
   - Commit and push this folder to your repo.
   - In repo settings → Pages → set branch to `main` and folder `/ (root)`.
   - Your site will be live at: `https://<user>.github.io/<repo>/`.

## 🔍 Features
- No build tools (just HTML, CSS, JS)
- **Light/Dark/Auto** theme toggle
- Client-side **search** (Ctrl+/)
- Mobile-friendly responsive design
- Keyboard shortcut: `g` then `h` to go Home

## 🛠 Customization
- Change colors, fonts, or layout in `assets/styles.css`.
- Add new routes in `window.WIKI.routes` (inside `index.html`).
- Add new HTML pages under `/pages/`.

---

**License**: MIT — free to modify and use.
