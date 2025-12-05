# 🗺️ MapMates - Premium Social Travel Application

<div align="center">

![MapMates](https://img.shields.io/badge/MapMates-v1.0.0-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase)

**Connect. Explore. Discover.**

A modern social travel web application with real-time location sharing, gamification, and community-driven place discovery.

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## ✨ Features

### 🗺️ **Interactive Map**
- Real-time location tracking with Google Maps
- See nearby users within 1km radius
- Custom emoji avatars on map
- Click to connect with users

### 🤝 **Social Connections**
- Discover nearby travelers
- Play mini-games to unlock chat
- Real-time messaging
- Connection management

### 📍 **Place Discovery**
- Browse curated places in Pune
- Search and filter by category, budget, rating
- Beautiful place detail modals
- Reviews, ratings, and directions
- Submit new places for rewards

### 💎 **Mapos Currency**
- Earn Mapos through games and contributions
- Spend Mapos to unlock features
- Transaction history and wallet
- Achievement badges

### 🏆 **Gamification**
- Level system and progression
- Daily streak tracking
- Top 10 leaderboard
- Achievement badges
- Celebration animations

### 👑 **Admin Panel**
- User management (ban, verify, promote)
- Place approval workflow
- Platform analytics
- Global reward distribution

### 🎨 **Premium UI/UX**
- Purple-blue-white gradient theme
- Smooth animations with Framer Motion
- Confetti celebrations
- Toast notifications
- Fully responsive design

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Google Maps API key

### Installation

```bash
# Navigate to project
cd mapmates

# Install dependencies
npm install

# Configure environment variables
# Copy .env.local and add your keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### First Time Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Run `supabase-setup.sql` in SQL Editor

2. **Get Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable Maps JavaScript API
   - Create API key

3. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

4. **Create Admin Account**
   - Sign up through the app
   - Update `role` to `admin` in Supabase profiles table

📖 **Detailed setup**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[INDEX.md](INDEX.md)** | 📑 Documentation index and navigation |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | 🛠️ Detailed setup instructions |
| **[FEATURES.md](FEATURES.md)** | ✨ Complete feature documentation |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | 🚀 Production deployment guide |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | ⚡ Quick commands and patterns |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** | 📊 Project overview and architecture |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | 🏗️ System architecture diagrams |
| **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** | ✅ Comprehensive testing guide |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | 🔧 Common issues and solutions |
| **[CHANGELOG.md](CHANGELOG.md)** | 📝 Version history |
| **[PROJECT_COMPLETE.md](PROJECT_COMPLETE.md)** | 🎉 Project completion summary |

---

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row-level security
  - Storage

### Maps & Location
- **Google Maps JavaScript API** - Interactive maps
- **Geolocation API** - Location tracking

### State Management
- **Zustand** - Global state
- **React Hooks** - Local state

### Utilities
- **date-fns** - Date formatting
- **canvas-confetti** - Celebrations
- **react-hot-toast** - Notifications

---

## 📁 Project Structure

```
mapmates/
├── app/                    # Next.js pages
│   ├── dashboard/         # Main dashboard with map
│   ├── admin/             # Admin control panel
│   ├── wallet/            # Mapos wallet
│   ├── places/            # Place discovery
│   ├── chat/              # Real-time messaging
│   └── profile/           # User profile
│
├── components/            # React components
│   ├── auth/             # Authentication
│   ├── map/              # Map components
│   ├── places/           # Place components
│   ├── admin/            # Admin components
│   └── ui/               # UI components
│
├── lib/                  # Utilities
│   ├── supabase/        # Supabase clients
│   ├── store/           # State management
│   ├── api/             # API utilities
│   └── utils/           # Helper functions
│
└── types/               # TypeScript types
```

---

## 🎮 Key Features Explained

### Real-time Location Sharing
Users can see nearby travelers on an interactive map within a 1km radius. Each user is represented by their chosen emoji avatar.

### Gamified Connections
To unlock chat with another user, you can either:
- Play a mini-game and earn 20 Mapos
- Skip using 20 Mapos

### Mapos Currency System
- **Earn**: Games (20), Place approvals (50), Daily bonuses
- **Spend**: Skip games (20), Premium features
- **Track**: Transaction history, achievements, leaderboard

### Place Discovery
Browse and discover places in Pune with:
- Search and filters
- Ratings and reviews
- Image galleries
- Google Maps directions
- Save to wishlist

### Admin Control
Complete platform management:
- User moderation
- Place approvals
- Analytics dashboard
- Global rewards

---

## 🔐 Security

- ✅ Row-level security (RLS) on all tables
- ✅ Protected routes with middleware
- ✅ Secure authentication with Supabase
- ✅ Environment variable management
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 📱 Responsive Design

Fully responsive and optimized for:
- 📱 Mobile (320px - 767px)
- 📱 Tablet (768px - 1023px)
- 💻 Desktop (1024px+)

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# Deploy on Vercel
# 1. Import project from GitHub
# 2. Add environment variables
# 3. Deploy
```

📖 **Detailed deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🧪 Testing

Run the comprehensive testing checklist:

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

📋 **Full checklist**: See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

---

## 🐛 Troubleshooting

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Map not loading | Check Google Maps API key |
| Auth not working | Verify Supabase credentials |
| RLS errors | Check policies in SQL setup |
| Build errors | Clear .next and node_modules |

🔧 **Full guide**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📊 Database Schema

### Core Tables
- **profiles** - User profiles and stats
- **places** - Travel places and attractions
- **reviews** - Place reviews and ratings
- **connections** - User connections
- **messages** - Chat messages
- **transactions** - Mapos transactions
- **achievements** - User achievements
- **games** - Mini-games configuration
- **saved_places** - User wishlists
- **announcements** - Admin announcements

🗄️ **Full schema**: See `supabase-setup.sql`

---

## 🎨 Design System

### Colors
- **Primary**: Purple (#8B5CF6) to Blue (#3B82F6) gradient
- **Secondary**: White (#FFFFFF)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter
- **Headings**: Bold, gradient text
- **Body**: Regular, gray-800

### Components
- **Buttons**: Rounded-xl, gradient backgrounds
- **Cards**: Rounded-2xl, shadow-lg
- **Inputs**: Rounded-xl, border-2
- **Modals**: Rounded-2xl, backdrop blur

---

## 🔮 Future Enhancements

- [ ] More mini-games (puzzles, trivia, memory)
- [ ] Push notifications
- [ ] Image upload for places
- [ ] Video support
- [ ] Group chat
- [ ] Events system
- [ ] Rewards marketplace
- [ ] Social sharing
- [ ] AI recommendations
- [ ] AR features

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Google Maps](https://developers.google.com/maps)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

## 📞 Support

- 📖 **Documentation**: Check all .md files
- 🐛 **Issues**: GitHub Issues
- 💬 **Discussions**: GitHub Discussions
- 📧 **Email**: support@mapmates.app

---

## ⭐ Show Your Support

If you like this project, please give it a ⭐ on GitHub!

---

<div align="center">

**Built with ❤️ using Next.js, TypeScript, and Supabase**

[Get Started](#-quick-start) • [Documentation](#-documentation) • [Features](#-features)

**MapMates v1.0.0** - Connect, Explore, Discover

</div>
