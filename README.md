# Food Express API

> A modern, full-featured food delivery platform API built with NestJS, TypeScript, and PostgreSQL.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Email Templates](#-email-templates)
- [Payment Integration](#-payment-integration)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Email verification** with secure token system
- **Password reset** functionality with time-limited tokens
- **Role-based access control** (Admin, Customer)
- **Custom header-based refresh token** extraction (`x-refresh-token`)
- **Session management** with token invalidation

### 🍽️ Restaurant Management
- Complete CRUD operations for restaurants
- Restaurant rating and review system
- Popular restaurants listing
- Restaurant search and filtering

### 📋 Menu & Dishes
- Menu management per restaurant
- Dish CRUD operations with categories
- Dish ratings and reviews
- Popular dishes listing
- Category-based dish filtering

### 🛒 Order Management
- Shopping cart functionality
- Stripe payment integration
- Order status tracking (Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled)
- Order history for users
- Real-time order updates
- Active order validation

### 👥 User Management
- User profile management
- Multiple delivery addresses
- User status management (Active/Inactive)
- Admin user management dashboard
- User deletion with order validation

### 📧 Email Service
- **SendGrid integration** for reliable email delivery
- Professional HTML email templates
- Email verification emails
- Password reset emails
- Mobile-responsive designs

### 💳 Payment Processing
- **Stripe integration** for secure payments
- Checkout session creation
- Payment verification
- Webhook support for payment events

### 📚 API Documentation
- **Swagger/OpenAPI** documentation
- Interactive API explorer
- Request/response examples
- Authentication flows documented

## 🛠️ Tech Stack

### Core Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **Node.js** - JavaScript runtime

### Database & ORM
- **PostgreSQL** - Relational database
- **Prisma** - Next-generation ORM
- **Prisma Migrate** - Database migrations

### Authentication & Security
- **Passport** - Authentication middleware
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **class-validator** - DTO validation
- **class-transformer** - Object transformation

### Integrations
- **SendGrid** - Email delivery service
- **Stripe** - Payment processing
- **Swagger** - API documentation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **SWC** - Fast TypeScript/JavaScript compiler

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **SendGrid API Key** (for email functionality)
- **Stripe API Keys** (for payment functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/paralyuzov/food-delivery-api.git
   cd food-delivery-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

4. **Set up the database**
   ```bash
   # Run migrations
   npx prisma migrate dev

   # Generate Prisma Client
   npx prisma generate

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

6. **Access the application**
   - API: `http://localhost:3000`
   - Swagger Documentation: `http://localhost:3000/api`

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/food_delivery_db?schema=public"

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_here
JWT_REFRESH_EXPIRES_IN=7d

# SendGrid Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Food Express

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# App Configuration
PORT=8080
NODE_ENV=development
```

### Getting API Keys

#### SendGrid
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Navigate to **Settings > API Keys**
3. Create a new API key with **Mail Send** permissions
4. Set up domain authentication for better deliverability

#### Stripe
1. Sign up at [Stripe](https://stripe.com/)
2. Navigate to **Developers > API Keys**
3. Copy your **Secret Key**
4. Set up webhooks for payment events

## 📖 API Documentation

The API documentation is automatically generated using Swagger and is available at:

```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| GET | `/auth/verify-email` | Verify email address | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/change-password` | Change password | Yes |
| POST | `/auth/logout` | Logout user | Yes |
| GET | `/auth/me` | Get current user | Yes |

### Restaurant Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/restaurants` | Get all restaurants | No |
| GET | `/restaurants/popular` | Get popular restaurants | No |
| GET | `/restaurants/:id` | Get restaurant by ID | No |
| POST | `/restaurants` | Create restaurant | Admin |
| PUT | `/restaurants/:id` | Update restaurant | Admin |
| DELETE | `/restaurants/:id` | Delete restaurant | Admin |
| POST | `/restaurants/:id/rate` | Rate restaurant | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders/checkout` | Create checkout session | Yes |
| POST | `/orders/confirm-payment` | Confirm payment | Yes |
| GET | `/orders/user-orders` | Get user orders | Yes |
| GET | `/orders/all` | Get all orders | Admin |
| PATCH | `/orders/update-status/:orderId` | Update order status | Admin |

For complete API documentation with request/response examples, visit the Swagger UI at `/api`.

## 🗄️ Database Schema

### Core Models

- **User** - User accounts with roles and authentication
- **Restaurant** - Restaurant information and ratings
- **Menu** - Restaurant menus
- **Dish** - Menu items with categories and ratings
- **Order** - Customer orders with status tracking
- **OrderItem** - Individual items in orders
- **Address** - User delivery addresses
- **RefreshToken** - JWT refresh token management
- **RestaurantRating** - Restaurant reviews and ratings
- **DishRating** - Dish reviews and ratings

### Relationships

```
User ─┬─ Address (1:n)
      ├─ Order (1:n)
      ├─ RefreshToken (1:n)
      ├─ RestaurantRating (1:n)
      └─ DishRating (1:n)

Restaurant ─┬─ Menu (1:n)
            └─ RestaurantRating (1:n)

Menu ──── Dish (1:n)

Dish ─┬─ OrderItem (1:n)
      └─ DishRating (1:n)

Order ─┬─ OrderItem (1:n)
       ├─ Address (n:1)
       ├─ User (n:1)
       └─ Restaurant (n:1)
```

### Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset

# Open Prisma Studio (DB GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate
```

## 🔒 Authentication

### JWT Token Strategy

The API uses a dual-token authentication system:

#### Access Token
- Short-lived (15 minutes default)
- Sent in `Authorization: Bearer <token>` header
- Used for API requests

#### Refresh Token
- Long-lived (7 days default)
- Sent in custom `x-refresh-token` header
- Used to obtain new access tokens
- Stored in database for validation
- Invalidated on logout

### Authentication Flow

```
1. Login → Receive Access Token + Refresh Token
2. Use Access Token for API requests
3. When Access Token expires → Use Refresh Token to get new tokens
4. Refresh Token validates against database
5. Old Refresh Token invalidated, new tokens issued
6. Logout → All Refresh Tokens invalidated
```

### Protected Routes

Use the appropriate guard decorator:
- `@UseGuards(JwtAuthGuard)` - Requires valid access token
- `@UseGuards(JwtRefreshTokenGuard)` - Requires valid refresh token

## 📧 Email Templates

Professional, mobile-responsive HTML email templates powered by SendGrid:

### Verification Email
- Welcome message with branding
- One-click email verification
- 24-hour token expiration
- Fallback plain-text link

### Password Reset Email
- Security-focused design
- One-click password reset
- 15-minute token expiration
- Security warning for unauthorized requests

### Email Features
- Mobile-responsive design
- Cross-email-client compatibility
- Professional branding
- Hidden preheader text
- Unsubscribe links
- Support links

## 💳 Payment Integration

### Stripe Integration Features

- **Checkout Sessions** - Secure payment flow
- **Payment Verification** - Server-side validation
- **Webhook Support** - Real-time payment events
- **Order Confirmation** - Automatic order creation on successful payment

### Payment Flow

```
1. User adds items to cart
2. POST /orders/checkout → Stripe Checkout Session created
3. User redirected to Stripe payment page
4. User completes payment
5. Stripe redirects to success URL
6. POST /orders/confirm-payment → Order confirmed
7. Order stored in database with PENDING status
```

## 📁 Project Structure

```
food-delivery-api/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed.ts               # Database seeding
├── src/
│   ├── auth/                 # Authentication module
│   │   ├── decorators/       # Custom decorators
│   │   ├── dto/              # Data transfer objects
│   │   ├── guards/           # Auth guards
│   │   └── strategy/         # Passport strategies
│   ├── mail/                 # Email service
│   ├── user/                 # User management
│   ├── restaurant/           # Restaurant module
│   ├── menus/                # Menu module
│   ├── dishes/               # Dish module
│   ├── orders/               # Order module
│   ├── stripe/               # Payment integration
│   ├── admin/                # Admin module
│   ├── prisma/               # Prisma service
│   └── main.ts              # Application entry point
├── test/                     # E2E tests
├── .env.example             # Environment template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── README.md               # This file
```

## 📜 Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start with debugger

# Production
npm run build             # Build for production
npm run start:prod        # Start production server

# Code Quality
npm run lint              # Lint code
npm run format            # Format code

# Testing
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:cov          # Generate coverage report
npm run test:e2e          # Run E2E tests

# Database
npx prisma migrate dev    # Create and apply migration
npx prisma migrate deploy # Apply migrations to production
npx prisma studio         # Open Prisma Studio GUI
npx prisma generate       # Generate Prisma Client
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Build/tooling changes

## 📝 License

This project is [UNLICENSED](LICENSE).

## 👨‍💻 Author

**Martin Paralyuzov**
- GitHub: [@paralyuzov](https://github.com/paralyuzov)

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [SendGrid](https://sendgrid.com/) - Email delivery service
- [Stripe](https://stripe.com/) - Payment processing

---

<p align="center">Made with ❤️ and ☕</p>
