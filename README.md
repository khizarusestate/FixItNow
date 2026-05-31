# FixItNow - Home Services Platform

A modern React application for booking home services like plumbing, electrical work, mechanics, and more.

## Features

- Customer & Worker authentication
- Real-time booking system
- Profile management (view, edit, delete account)
- Responsive design with Tailwind CSS
- Socket.IO for real-time notifications
- Error boundaries for production stability

## Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **HTTP Client:** Fetch API with custom wrapper
- **Real-time:** Socket.IO Client

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Production Deployment

### 1. Environment Variables

Copy `.env.example` to `.env` and update:

```env
VITE_API_BASE_URL=https://your-production-api.com/api
```

### 2. Build

```bash
npm run build
```

Output will be in the `dist/` folder.

### 3. Deploy

Upload the `dist/` folder contents to your web server or CDN.

## Project Structure

```
src/
├── Components/          # React components
│   ├── Header.jsx
│   ├── Home.jsx
│   ├── BookingSection.jsx
│   ├── Contact.jsx
│   ├── About.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── WorkerModal.jsx
│   ├── ProfileModal.jsx
│   ├── EditProfile.jsx
│   ├── MyBookings.jsx
│   ├── WorkerDashboard.jsx
│   └── ErrorBoundary.jsx
├── context/            # React context providers
│   ├── AuthContext.jsx
│   └── ModalContext.jsx
├── services/           # API services
│   └── api.js
├── utils/              # Utility functions
│   └── jwt.js
└── lib/                # Library exports
    └── api.js
```

## API Configuration

The app uses environment variables for API configuration:

- `VITE_API_BASE_URL` - Base URL for API requests

Default production fallback is `https://fixitnow-backand-production.up.railway.app/api` when `VITE_API_BASE_URL` is unset in prod builds. Local dev uses `http://localhost:5000/api` or `/api` via Vite proxy.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
