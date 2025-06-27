# URL Shortener

A full-stack URL shortener application built with React, NestJS, and Valkey (Redis fork).

## Features

- **URL Shortening**: Convert long URLs into short, memorable links
- **Custom Short Codes**: Create personalized short codes for your URLs
- **Analytics Dashboard**: Track clicks and view detailed statistics
- **User Accounts**: Create accounts to manage and organize your URLs
- **Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Modern, mobile-friendly UI built with Shadcn/ui
- **Rate Limiting**: Protect against abuse with built-in rate limiting
- **Visit Tracking**: Monitor URL performance with detailed analytics
- **Fast Redirects**: Lightning-fast URL redirections
- **Easy Copying**: One-click URL copying to clipboard
- **URL Management**: Edit, delete, and organize your shortened URLs
- **Docker Support**: Complete containerized deployment

## AI Disclaimer

Copilot was used to:

- Assist with initial project structure and configuration files
- Generate boilerplate code for both frontend and backend components
- Generate this README file and documentation

The core logic, architectural decisions and final implementation are my own work.

## Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and building
- **Shadcn/ui** for beautiful, accessible components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **React Hook Form** for form handling
- **Recharts** for analytics visualization

### Backend
- **NestJS** with TypeScript
- **Express** web framework
- **Passport** for authentication
- **JWT** for secure tokens
- **Class Validator** for request validation
- **Swagger** for API documentation
- **Helmet** for security headers
- **Rate limiting** for API protection

### Database
- **Valkey** (Redis fork) for fast data storage and caching
- Persistent storage configuration
- Optimized for high-performance URL lookups

### DevOps
- **Docker** and **Docker Compose** for containerization
- **PNPM** workspace for monorepo management
- **Nginx** for frontend serving and reverse proxy

## Quick Start

### Prerequisites
- **Node.js** 18+ and **PNPM**
- **Docker** and **Docker Compose** (for containerized deployment)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs

### Option 2: Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd url-shortener
   pnpm install
   ```

2. **Start Valkey**
   ```bash
   docker run -d -p 6379:6379 --name valkey valkey/valkey:latest
   ```

3. **Configure environment variables**
   Create `apps/backend/.env`:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   pnpm dev
   
   # Or start individually
   pnpm --filter backend dev
   pnpm --filter frontend dev
   ```

## Project Structure

```
url-shortener/
├── apps/
│   ├── backend/              # NestJS API server
│   │   ├── src/
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── users/       # User management
│   │   │   ├── urls/        # URL shortening logic
│   │   │   ├── analytics/   # Analytics and reporting
│   │   │   └── common/      # Shared utilities
│   │   └── Dockerfile
│   └── frontend/            # React application
│       ├── src/
│       │   ├── components/  # UI components
│       │   ├── pages/       # Page components
│       │   ├── hooks/       # Custom React hooks
│       │   └── lib/         # Utilities and API client
│       ├── Dockerfile
│       └── nginx.conf
├── docker-compose.yml
├── package.json
└── pnpm-workspace.yaml
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user

### URLs
- `POST /api/urls` - Create shortened URL
- `GET /api/urls/my` - Get user's URLs
- `GET /api/urls/:shortCode` - Redirect to original URL
- `PATCH /api/urls/:id` - Update URL
- `DELETE /api/urls/:id` - Delete URL
- `GET /api/urls/:shortCode/analytics` - Get URL analytics

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard data

### Users
- `GET /api/users/profile` - Get user profile

## Features in Detail

### URL Shortening
- Automatic generation of short codes using nanoid
- Custom short code support with uniqueness validation
- URL validation to ensure valid URLs
- Support for metadata (title, description)

### User Management
- Secure user registration and authentication
- Password hashing with bcrypt
- JWT token-based sessions
- User profile management

### Analytics & Tracking
- Click tracking for each shortened URL
- Daily visit statistics
- User dashboard with essential metrics
- Top-performing URLs identification
- Date-range analytics

### Security Features
- Rate limiting to prevent abuse
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Helmet security middleware

### Performance Optimizations
- Redis/Valkey for fast data retrieval
- Efficient database queries
- Nginx reverse proxy
- Static asset caching
- Gzip compression

## Development

### Available Scripts

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Docker commands
pnpm docker:build
pnpm docker:up
pnpm docker:down
```

### Environment Variables

Backend (`apps/backend/.env`):
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Deployment

### Production with Docker

1. **Clone and configure**
   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. **Update production settings**
   - Change JWT_SECRET in docker-compose.yml
   - Update FRONTEND_URL if needed
   - Configure any additional environment variables

3. **Deploy**
   ```bash
   docker-compose up -d
   ```

### Scaling Considerations

- Valkey/Redis can be configured in cluster mode for high availability
- Multiple backend instances can be run behind a load balancer
- Frontend is served as static files and can be deployed to CDN
- Database backup strategies should be implemented for production

## License

No License

---
