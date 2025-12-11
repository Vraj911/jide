# J++ IDE

A modern web-based IDE for the J++ programming language. Built with Next.js App Router and JavaScript.

## Project Structure

```
jide/
├── app/                    # Next.js App Router pages
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   ├── ide/
│   │   └── page.js        # IDE page
│   ├── docs/
│   │   └── page.js        # Documentation page
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.js    # Login page
│   │   └── signup/
│   │       └── page.js    # Signup page
│   └── not-found.js       # 404 page
├── components/            # React components
│   ├── ui/                # shadcn/ui components (convert .tsx to .jsx)
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── Editor.jsx
│   └── ...
├── lib/                   # Utility libraries
│   ├── jpp/               # J++ compiler (not connected yet)
│   └── monacoConfig.js    # Monaco editor config
├── src/
│   └── index.css          # Global styles
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

## Technology Stack

- **Next.js 14** - React framework with App Router
- **JavaScript** - Pure JS (no TypeScript)
- **Monaco Editor** - Code editor
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Three.js** - 3D backgrounds

## Notes

- All pages are in the `app/` directory following Next.js App Router conventions
- Components are in JavaScript (.jsx) format
- The J++ compiler is in `lib/jpp/` but not currently connected to the IDE
- UI components in `src/components/ui/` need to be converted from .tsx to .jsx (or they may work as-is)

## License

MIT
