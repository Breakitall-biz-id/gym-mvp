# FitPro Gym Management System

A modern, comprehensive gym management MVP built with Next.js 14, Supabase, and shadcn/ui. Features role-based authentication, QR check-ins, member management, and payment tracking.

## Features

### 🔐 Authentication & Authorization
- **Role-based access control**: ADMIN, STAFF, and MEMBER roles
- **Supabase Auth**: Secure email/password authentication
- **Protected routes**: Middleware-based route protection

### 👥 Member Management
- **Complete member profiles** with photo uploads
- **Subscription management** with multiple membership plans
- **QR code generation** for seamless check-ins
- **Status tracking**: Active, expired, and expiring memberships

### 📱 Mobile-First Check-in System
- **QR scanner** using device camera
- **Manual token entry** as fallback
- **Real-time status updates** and validation
- **Attendance tracking** with history

### 📊 Dashboard & Analytics
- **KPI cards**: Active members, expiring soon, daily check-ins
- **Visual charts**: Check-in trends over last 14 days
- **Quick actions**: WhatsApp integration for member outreach

### 💰 Payment Management
- **Payment recording**: Multiple methods (cash, transfer, e-wallet)
- **Monthly revenue tracking** with growth metrics
- **Payment history** for each member
- **Status management**: Pending, paid, failed, refunded

### 📱 Member Portal
- **Personal dashboard** with membership card
- **QR code display** for check-ins
- **Attendance history** and monthly stats
- **Payment history** and receipts

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: shadcn/ui (Radix-based)
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL with Row Level Security
- **Validation**: Zod + React Hook Form
- **QR Codes**: qrcode + html5-qrcode libraries
- **Deployment**: Docker + docker-compose

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Docker (for deployment)

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd gym-management
npm install
```

2. **Set up Supabase:**
- Create a new Supabase project
- Copy your project URL and anon key
- Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

3. **Run database migrations:**
- In your Supabase dashboard, go to SQL Editor
- Run the migration files in `/supabase/migrations/` in order:
  - `create_gym_schema.sql` - Creates tables and policies
  - `seed_demo_data.sql` - Adds demo data

4. **Start development server:**
```bash
npm run dev
```

5. **Access the application:**
- Open http://localhost:3000
- Use demo accounts:
  - **Admin**: admin@example.com / Admin123!
  - **Staff**: staff@example.com / Staff123!  
  - **Member**: member@example.com / Member123!

### Production Deployment

**Using Docker:**
```bash
# Build and run with docker-compose
docker-compose up -d

# Or build manually
docker build -t gym-management .
docker run -p 3000:3000 gym-management
```

## Database Schema

The system uses PostgreSQL with the following main tables:

- **profiles** - Links auth.users to roles and member data
- **members** - Core member information and photos
- **membership_plans** - Available subscription plans
- **subscriptions** - Member plan subscriptions with dates
- **attendance** - Check-in records with timestamps
- **qr_tokens** - Temporary QR codes for check-ins
- **payments** - Payment records and transaction history

## Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based policies** for data access
- **Secure QR tokens** with expiration
- **Protected API routes** with validation
- **Image upload security** via Supabase Storage

## Key Components

### Dashboard (`/dashboard`)
- Real-time KPIs and metrics
- Member expiration alerts
- Check-in trend visualization
- Quick member contact links

### Member Management (`/members`)
- Searchable member directory
- Detailed member profiles with tabs
- QR code generation and refresh
- Photo upload to Supabase Storage

### Check-in System (`/checkin`)
- Camera-based QR scanning
- Manual token entry fallback
- Real-time validation and feedback
- Today's check-ins list

### Member Portal (`/app`)
- Personal membership card
- High-contrast QR display
- Monthly visit tracking
- Payment and attendance history

## API Endpoints

- `POST /api/checkin` - Process QR check-ins
- `POST /api/members` - Create new members
- `PATCH /api/members/:id` - Update member info
- `POST /api/qr/issue` - Generate QR tokens
- `POST /api/subscriptions` - Create subscriptions
- `POST /api/payments` - Record payments

## Customization

### Theme Colors
The app uses a dark theme with neon-lime accents. Colors are defined in `/app/globals.css`:
- **Background**: #0B0B0B
- **Cards**: #141414  
- **Primary**: #B8FF00 (neon-lime)
- **Borders**: #232323

### Role Permissions
Modify role access in `/lib/supabase/middleware.ts` and update RLS policies as needed.

### Features
Add new features by:
1. Creating database tables/columns
2. Adding TypeScript types in `/lib/types.ts`
3. Building UI components with shadcn/ui
4. Creating API routes for data operations

## Demo Data

The seed script creates:
- 3 user accounts (admin, staff, member)
- 4 membership plans
- 10 demo members with subscriptions
- 14 days of attendance records
- QR tokens for active members
- Payment transaction history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.