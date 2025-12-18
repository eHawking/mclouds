# Magnetic Clouds

Premium Web Hosting & Domain Provider from Bangladesh

![Node.js](https://img.shields.io/badge/Node.js-24.11.1-green)
![React](https://img.shields.io/badge/React-18-blue)
![MariaDB](https://img.shields.io/badge/MariaDB-10.x-orange)

## Features

- **Web Hosting** - Shared, VPS, Cloud, and Dedicated Servers
- **Domain Services** - Registration, Transfer, and Search
- **Security** - SSL Certificates, Professional Email, Website Backup
- **Global Datacenters** - 10+ locations worldwide with interactive map
- **User Dashboard** - Complete service management
- **Admin Panel** - Full administrative control at `/admin`
- **Multi-language** - English (default) and Bengali
- **Multi-currency** - USD (default), EUR, GBP, BDT, INR, SGD, AUD
- **Theme System** - Light (default) / Dark mode with Gradient / Flat styles
- **45-Day Money Back Guarantee**
- **24/7 Technical Support**

## Tech Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: MariaDB
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Maps**: Leaflet / React-Leaflet
- **Charts**: Recharts

## Project Structure

```
magnetic-clouds/
├── server/                 # Backend
│   ├── index.js           # Express server entry
│   ├── database/          # DB connection, migrations, seeds
│   ├── middleware/        # Auth middleware
│   └── routes/            # API routes
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── lib/           # API utilities
│   │   └── i18n.js        # Internationalization
│   └── public/            # Static assets
├── uploads/               # User uploads (auto-created)
├── .env.example           # Environment template
└── package.json           # Root dependencies
```

## Installation

### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
```

**Required Environment Variables:**

```env
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Database (MariaDB)
DB_HOST=localhost
DB_PORT=3306
DB_USER=magnetic_clouds
DB_PASSWORD=your_secure_password
DB_NAME=magnetic_clouds

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Admin (change after first login)
ADMIN_EMAIL=admin@magneticclouds.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

### 4. Development

```bash
# Run both server and client
npm run dev

# Or separately:
npm run server:dev  # Backend on port 3000
npm run client:dev  # Frontend on port 5173
```

### 5. Production Build

```bash
npm run build
npm start
```

## Plesk Deployment (Node.js 24.11.1)

### Step 1: Create Node.js Application in Plesk

1. Go to **Websites & Domains** → Your Domain
2. Click **Node.js**
3. Configure:
   - **Node.js Version**: 24.11.1
   - **Document Root**: `/httpdocs`
   - **Application Root**: `/httpdocs`
   - **Application Startup File**: `server/index.js`
   - **Application Mode**: `production`

### Step 2: Set Environment Variables

In Plesk Node.js settings, add these environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` (or as assigned) |
| `APP_URL` | `https://your-domain.com` |
| `DB_HOST` | `localhost` |
| `DB_PORT` | `3306` |
| `DB_USER` | `your_db_user` |
| `DB_PASSWORD` | `your_db_password` |
| `DB_NAME` | `magnetic_clouds` |
| `JWT_SECRET` | `your-very-long-secret-key` |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_EMAIL` | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | `YourSecurePassword123!` |

### Step 3: Database Setup

1. Create a MariaDB database in Plesk
2. Create a database user with full privileges
3. SSH into your server and run:

```bash
cd /var/www/vhosts/your-domain.com/httpdocs
npm run db:migrate
npm run db:seed
```

### Step 4: Build Frontend

```bash
cd /var/www/vhosts/your-domain.com/httpdocs
npm run build
```

### Step 5: NPM Install

In Plesk Node.js panel, click **NPM Install** or via SSH:

```bash
npm install --production
cd client && npm install && npm run build && cd ..
```

### Step 6: Restart Application

Click **Restart** in Plesk Node.js panel.

## Plesk Node.js Configuration Summary

| Setting | Value |
|---------|-------|
| **Node.js Version** | 24.11.1 |
| **Application Mode** | production |
| **Document Root** | /httpdocs |
| **Application Root** | /httpdocs |
| **Application Startup File** | server/index.js |

## Default Admin Login

After running `npm run db:seed`:

- **Email**: admin@magneticclouds.com (or your ADMIN_EMAIL)
- **Password**: Admin@123456 (or your ADMIN_PASSWORD)
- **Admin Panel**: https://your-domain.com/admin

⚠️ **Important**: Change admin password immediately after first login!

## Features Included

### Public Pages
- Home with hero, features, pricing preview
- Web Hosting, VPS, Cloud, Dedicated Servers
- Domain Search & Registration
- SSL Certificates, Professional Email, Website Backup
- Global Datacenters with interactive map
- About Us, Contact Us, Support
- Terms of Service, Privacy Policy, Refund Policy
- Cart & Checkout (smart checkout)

### User Dashboard (`/dashboard`)
- Overview with stats
- My Services management
- My Domains
- Invoices & Payment history
- Support Tickets (create, view, reply)
- Profile management

### Admin Panel (`/admin`)
- Dashboard with revenue charts
- Users management
- Products & Categories
- Orders management
- Support Tickets
- Domain TLDs pricing
- Pages (CMS)
- Media Library (auto WebP conversion)
- Settings (themes, currencies, etc.)

## Theme System

The admin can control themes from `/admin/settings`:

- **Gradient Theme**: Modern gradients throughout
- **Flat Theme**: Clean solid colors

Users can toggle Light/Dark mode from the navbar.

## SEO Features

- React Helmet for meta tags
- Semantic HTML structure
- Optimized images (auto WebP conversion)
- Fast loading with code splitting
- Mobile responsive design

## API Endpoints

```
/api/auth/*       - Authentication
/api/users/*      - User dashboard data
/api/products/*   - Products & categories
/api/orders/*     - Order management
/api/domains/*    - Domain search & TLDs
/api/tickets/*    - Support tickets
/api/settings/*   - Public settings
/api/pages/*      - CMS pages
/api/admin/*      - Admin endpoints
/api/upload/*     - Media upload
```

## Support

For technical support, contact: support@magneticclouds.com

---

Made with ❤️ in Bangladesh
