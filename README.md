# JWell — Premium Jewellery Store

A full-stack e-commerce jewellery platform with Customer, Admin, and Supplier workflows.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Redux Toolkit + Framer Motion
- **Backend**: Django + Django REST Framework + JWT Authentication
- **Database**: MySQL
- **Payments**: Stripe

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- MySQL Server

### 1. Database Setup

```sql
CREATE DATABASE jewellery_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup

```bash
cd backend

# Create .env file (copy from root .env.example)
# Update DB_PASSWORD and Stripe keys

# Install dependencies (or use the requirements.txt)
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers mysqlclient stripe Pillow django-filter openpyxl reportlab drf-spectacular

# Run migrations
python manage.py migrate

# Seed sample data
python manage.py seed_data

# Start server
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open in Browser

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **API Docs**: http://localhost:8000/api/docs/

## Default Login Credentials

| Role     | Username   | Password     |
|----------|-----------|-------------|
| Admin    | admin     | admin123    |
| Supplier | supplier1 | supplier123 |
| Customer | customer1 | customer123 |

## Features

### Customer
- Browse/search/filter jewellery products
- Product detail with related recommendations
- Shopping cart management
- Stripe secure checkout
- Order tracking with progress indicator
- Profile management
- Complaint/return system

### Admin
- Dashboard with revenue analytics
- Product CRUD management
- Category management
- Order management with status updates
- Supplier management
- User management
- Sales/Product/Customer reports
- Low stock alerts
- Complaint resolution

### Supplier
- Dashboard with order statistics
- Accept/reject purchase orders
- Dispatch management with stock updates

### Payment
- Stripe Checkout integration
- Webhook support
- Payment verification
- Refund support

### Recommendation Engine
- Related products (same category + price range)
- Trending products (most ordered)
- Personalized recommendations (based on order history)

## API Endpoints

All endpoints are documented at `/api/docs/` (Swagger UI).

### Auth
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/token/refresh/`
- `GET/PUT /api/auth/profile/`

### Products
- `GET /api/products/`
- `GET /api/products/<id>/`
- `GET /api/products/categories/`
- `GET /api/products/featured/`

### Cart
- `GET /api/cart/`
- `POST /api/cart/add/`
- `PUT /api/cart/update/<id>/`
- `DELETE /api/cart/remove/<id>/`

### Orders
- `POST /api/orders/create/`
- `GET /api/orders/`
- `GET /api/orders/<id>/`

### Payments
- `POST /api/payments/create-checkout-session/`
- `POST /api/payments/verify/`

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Dashboard
3. Add keys to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Project Structure

```
├── backend/
│   ├── apps/
│   │   ├── users/          # Auth & user management
│   │   ├── products/       # Products & categories
│   │   ├── cart/           # Shopping cart
│   │   ├── orders/         # Order management
│   │   ├── payments/       # Stripe payments
│   │   ├── suppliers/      # Supplier workflow
│   │   ├── reports/        # Analytics & reports
│   │   ├── complaints/     # Customer complaints
│   │   └── recommendations/# Product recommendations
│   ├── jewellery_store/    # Django project settings
│   └── media/              # Uploaded files
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route pages
│       ├── store/          # Redux store & slices
│       └── services/       # API service layer
└── .env.example
```
