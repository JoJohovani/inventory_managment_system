# Inventory Management System - Backend

A comprehensive REST API for inventory management built with Node.js, Express.js, Prisma ORM, and MySQL.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations with image upload and stock tracking
- **Sales Management**: Complete sales workflow with inventory updates
- **Purchase Management**: Purchase orders and supplier management
- **Category Management**: Product categorization system
- **User Management**: Multi-role user system (Admin, Manager, Cashier)
- **Reporting**: Sales and inventory reports
- **File Upload**: Image upload for products and profiles
- **Logging**: Comprehensive logging with Winston
- **Validation**: Input validation with Joi
- **Error Handling**: Centralized error handling
- **Rate Limiting**: API rate limiting for security
- **Health Checks**: System health monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Joi
- **File Upload**: Multer
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. Clone the repository
   \`\`\`bash
   git clone <repository-url>
   cd inventory-management-system/backend
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Configure your database URL in \`.env\`
   \`\`\`
   DATABASE_URL="mysql://username:password@localhost:3306/inventory_db"
   \`\`\`

5. Generate Prisma client and run migrations
   \`\`\`bash
   npm run prisma:generate
   npm run prisma:migrate
   \`\`\`

6. Start the server
   \`\`\`bash
   npm run dev
   \`\`\`

## API Endpoints

### Authentication

- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/profile\` - Get user profile
- \`PUT /api/auth/profile\` - Update user profile

### Products

- \`GET /api/products\` - Get all products (with pagination, search, filters)
- \`GET /api/products/:id\` - Get product by ID
- \`POST /api/products\` - Create new product (Admin/Manager only)
- \`PUT /api/products/:id\` - Update product (Admin/Manager only)
- \`DELETE /api/products/:id\` - Delete product (Admin/Manager only)
- \`GET /api/products/low-stock\` - Get low stock products

### Sales

- \`GET /api/sales\` - Get all sales
- \`GET /api/sales/:id\` - Get sale by ID
- \`POST /api/sales\` - Create new sale
- \`PUT /api/sales/:id/status\` - Update sale status
- \`DELETE /api/sales/:id\` - Delete sale

## Database Schema

The system uses the following main entities:

- **Users**: System users with role-based access
- **Roles**: User roles (Admin, Manager, Cashier, etc.)
- **Categories**: Product categories
- **Products**: Inventory items
- **Sales**: Sales transactions
- **Purchases**: Purchase orders
- **ProductSales**: Sale line items
- **ProductPurchases**: Purchase line items
- **Settings**: System configuration

## Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization

## File Structure

\`\`\`
backend/
├── src/
│ ├── controllers/ # Request handlers
│ ├── routes/ # API routes
│ ├── services/ # Business logic
│ ├── middlewares/ # Custom middleware
│ ├── validators/ # Input validation
│ ├── config/ # Configuration files
│ ├── utils/ # Utility functions
│ └── tests/ # Test files
├── prisma/ # Database schema and migrations
├── uploads/ # File uploads
└── logs/ # Application logs
\`\`\`

## Environment Variables

\`\`\`
DATABASE_URL=mysql://username:password@localhost:3306/inventory_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
\`\`\`

## Scripts

- \`npm start\` - Start production server
- \`npm run dev\` - Start development server with nodemon
- \`npm test\` - Run tests
- \`npm run prisma:generate\` - Generate Prisma client
- \`npm run prisma:migrate\` - Run database migrations
- \`npm run prisma:studio\` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
