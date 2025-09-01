# Dead Lizard Studio Calendar 🦎

A lightweight MERN stack application for managing studio booking with role-based access control.

## Features

- **Role-based Access Control**: Guest (read-only), User (booking), and Admin (full management)
- **Password-protected Routes**: Different passwords for different access levels
- **Google OAuth Integration**: Secure authentication for users and admins
- **Calendar Interface**: Interactive calendar for viewing and managing bookings
- **Real-time Conflict Detection**: Prevents overlapping bookings
- **TypeScript**: Full TypeScript support for both frontend and backend
- **Webpack**: Modern bundling with hot reload in development

## Project Structure

```
deadLizard_calendar/
├── public/                 # Static assets
├── src/                   # Frontend React application
│   ├── components/        # Reusable React components
│   ├── contexts/         # React contexts (Auth, etc.)
│   ├── pages/            # Page components
│   ├── services/         # API service functions
│   ├── styles/           # Styled components and themes
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── server/               # Backend Express application
│   ├── src/
│   │   ├── config/       # Database and authentication config
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # MongoDB models
│   │   └── routes/       # API routes
│   └── package.json
├── webpack.*.js          # Webpack configurations
└── package.json          # Frontend dependencies
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google OAuth credentials (for user/admin login)

### Installation

1. **Clone and install dependencies:**
   ```bash
   # Install client dependencies
   npm run install-client
   
   # Install server dependencies
   npm run install-server
   
   # Or install both at once
   npm run install-all
   ```

2. **Configure environment variables:**
   ```bash
   # Copy example environment file
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   ```

3. **Set up Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`
   - Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

4. **Start the application:**
   ```bash
   # Development mode (runs both client and server)
   npm run dev
   
   # Or run separately:
   npm run client    # Frontend on http://localhost:3000
   npm run server    # Backend on http://localhost:5000
   ```

## Access Levels

### Default Passwords (Change these!)

- **Guest Access**: `studio_guest_2024` - Read-only calendar view
- **User Access**: `deadlizard_user_2024` - Redirects to Google login for booking
- **Admin Access**: `deadlizard_admin_2024` - Redirects to Google login for full management

### Access Flow

1. **Homepage**: Enter password to determine access level
2. **Guest**: Direct access to read-only calendar
3. **User/Admin**: Redirected to Google OAuth, then to appropriate dashboard

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout

### Bookings
- `GET /api/bookings` - Get user's bookings (or all if admin)
- `GET /api/bookings/date/:date` - Get bookings for specific date (public)
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/role` - Update user role

## Development

### Available Scripts

```bash
# Frontend
npm run client          # Start development server
npm run build          # Build for production
npm run build:dev      # Build for development
npm run type-check     # TypeScript type checking

# Backend
npm run server         # Start backend development server
npm run build:server   # Build backend

# Both
npm run dev           # Start both frontend and backend
npm run install-all   # Install all dependencies
```

### Environment Variables

Create `server/.env` file with:

```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/deadlizard_calendar
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## Deployment

### Frontend (Static Hosting)

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your static hosting service (Netlify, Vercel, etc.)

### Backend (Node.js Hosting)

1. Build the backend:
   ```bash
   cd server && npm run build
   ```

2. Deploy to your Node.js hosting service (Heroku, Railway, etc.)

3. Set environment variables in your hosting platform

### Database

- **Development**: Local MongoDB
- **Production**: MongoDB Atlas or any MongoDB hosting service

## Security Considerations

1. **Change default passwords** in production
2. **Use strong JWT secrets** in production
3. **Enable HTTPS** in production
4. **Secure MongoDB** with authentication
5. **Configure CORS** properly for your domain
6. **Use environment variables** for all secrets

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Contact: booking@deadlizardstudio.com

---

🦎 **Dead Lizard Studio** - Rock on! 🎸
# Force deployment with updated Google OAuth secrets
# Deploy with MongoDB and JWT secrets configured
# Deploy with SESSION_SECRET for OAuth sessions
