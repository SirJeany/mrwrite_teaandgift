# ☕ Mr. Write Tea & Gift Shop — Website

A quirky, coastal-themed website for **Mr. Write Tea & Gift Shop** in Hermanus, South Africa.

## 🏖️ About

Mr. Write is Hermanus's quirkiest teahouse — a cozy blend of loose-leaf teas, handmade gifts, live music, and ocean vibes. This site captures that eclectic, welcoming energy.

## 🚀 Running Locally

No build tools required — this is a static site using HTML, CSS, and vanilla JavaScript.

### Option 1: Open directly
```bash
open index.html
```
> ⚠️ Some features (like Google Maps embed) work best when served over HTTP.

### Option 2: Python local server
```bash
# Python 3
python3 -m http.server 8000

# Then visit http://localhost:8000
```

### Option 3: VS Code Live Server
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

### Option 4: Node.js
```bash
npx serve .
```

## 📁 Project Structure

```
Website/
├── index.html          # Main HTML page (single-page architecture)
├── booking.html        # High Tea booking page with form & validation
├── css/
│   ├── style.css       # Shared styles, animations, responsive overrides
│   └── booking.css     # Booking page-specific styles
├── js/
│   ├── main.js         # Navbar scroll, Tea-O-Meter, animations
│   └── booking.js      # Date logic, time slots, progress bar, form handling
├── images/             # Image assets (add your own photos here)
└── README.md           # You are here
```

## 🎨 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Markup     | Semantic HTML5                      |
| Styling    | Bootstrap 5.3 (CDN) + custom CSS   |
| JavaScript | Vanilla ES6+                        |
| Fonts      | Google Fonts (Fredoka + Nunito)     |
| Icons      | Bootstrap Icons                     |

## 🎯 Features

- **Sticky Navbar** — Transparent hero overlay → solid on scroll
- **Hero Section** — Animated steaming teacup built with pure CSS
- **About Us** — Illustrated cards & quirky stats
- **Events Carousel** — Bootstrap carousel with upcoming events
- **Tea-O-Meter** — Interactive mood-based tea recommendation widget
- **Gallery** — Card grid with hover zoom effects
- **Contact** — Business details, social links, embedded Google Map
- **Book a High Tea** — Full booking form with two-day rule, dynamic time slots, visual package cards, and brew progress bar
- **Scroll Animations** — Intersection Observer fade-in reveals
- **Back to Top** — Floating button with smooth scroll

## 🎨 Brand Colors

| Name           | Hex       | Usage              |
|----------------|-----------|--------------------|
| Creamy Yellow  | `#f5d98f` | Primary            |
| Rich Orange    | `#cc6818` | Secondary / CTAs   |
| Deep Ocean Blue| `#3158a5` | Accent / Links     |
| Sky Blue       | `#b5d3ed` | Light accent       |
| Vibrant Red    | `#ea1c29` | Highlight accent   |

## 📸 Adding Your Own Images

Replace the placeholder illustrated cards in the Gallery and About sections with real photos:

1. Add images to the `images/` folder
2. Replace the `<div class="gallery-card-img">` placeholder contents with `<img>` tags
3. Update the About section's illustrated cards similarly

## 📱 Responsive

Mobile-first design tested across:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## 📄 License

Built with ❤️ for Mr. Write Tea & Gift Shop, Hermanus.
