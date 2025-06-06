# Inventory Management System

A comprehensive inventory management system built with React frontend and Node.js/Express backend with MySQL database.

## Features

- **Dashboard**: Real-time analytics and insights
- **Product Management**: Add, edit, delete, and track products
- **Category Management**: Organize products by categories
- **Sales Management**: Process sales orders and track revenue
- **Purchase Management**: Handle purchase orders and supplier management
- **Customer & Supplier Management**: Maintain customer and supplier databases
- **Inventory Tracking**: Monitor stock levels with low stock alerts
- **Reports**: Generate various business reports
- **User Management**: Role-based access control

## Tech Stack

### Backend
- Node.js with Express.js
- MySQL with Prisma ORM
- JWT Authentication
- File upload with Multer
- Winston for logging
- Rate limiting and security middleware

### Frontend
- React 19 with Vite
- Tailwind CSS for styling
- React Router for navigation
- React Hot Toast for notifications
- Chart.js for data visualization
- Lucide React for icons

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL database
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   DATABASE_URL="mysql://username:password@localhost:3306/inventory_db"
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

5. Generate Prisma client and run migrations:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. Seed the database with sample data:
   ```bash
   npm run prisma:seed
   ```

7. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@inventory.com / admin123
- **Manager**: manager@inventory.com / manager123
- **Cashier**: cashier@inventory.com / cashier123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Sales
- `GET /api/sales-orders` - Get all sales
- `POST /api/sales-orders` - Create sale
- `PUT /api/sales-orders/:id/status` - Update sale status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activities` - Get recent activities

## Project Structure

```
inventory-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── utils/
│   │   └── config/
│   ├── prisma/
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── public/
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.