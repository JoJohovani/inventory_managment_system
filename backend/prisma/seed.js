const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Clear existing data (optional - remove if you want to keep existing data)
  console.log("🧹 Cleaning existing data...")
  await prisma.productSale.deleteMany()
  await prisma.productPurchase.deleteMany()
  await prisma.sale.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.role.deleteMany()
  await prisma.settings.deleteMany()

  // Create Roles
  console.log("👥 Creating roles...")
  const adminRole = await prisma.role.create({
    data: {
      role_type: "admin",
      createdBy: "system",
    },
  })

  const managerRole = await prisma.role.create({
    data: {
      role_type: "manager",
      createdBy: "system",
    },
  })

  const cashierRole = await prisma.role.create({
    data: {
      role_type: "cashier",
      createdBy: "system",
    },
  })

  const customerRole = await prisma.role.create({
    data: {
      role_type: "customer",
      createdBy: "system",
    },
  })

  const supplierRole = await prisma.role.create({
    data: {
      role_type: "supplier",
      createdBy: "system",
    },
  })

  // Create Admin User
  console.log("👤 Creating admin user...")
  const hashedPassword = await bcrypt.hash("admin123", 12)

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@inventory.com",
      password: hashedPassword,
      firstName: "System",
      lastName: "Administrator",
      phone: "+1234567890",
      isAdmin: true,
      roleId: adminRole.role_id,
    },
  })

  // Create Manager User
  const managerUser = await prisma.user.create({
    data: {
      email: "manager@inventory.com",
      password: await bcrypt.hash("manager123", 12),
      firstName: "John",
      lastName: "Manager",
      phone: "+1234567891",
      roleId: managerRole.role_id,
    },
  })

  // Create Cashier User
  const cashierUser = await prisma.user.create({
    data: {
      email: "cashier@inventory.com",
      password: await bcrypt.hash("cashier123", 12),
      firstName: "Jane",
      lastName: "Cashier",
      phone: "+1234567892",
      roleId: cashierRole.role_id,
    },
  })

  // Create Sample Customers
  console.log("🛒 Creating customers...")
  const customers = await Promise.all([
    prisma.user.create({
      data: {
        email: "customer1@example.com",
        password: await bcrypt.hash("customer123", 12),
        firstName: "Alice",
        lastName: "Johnson",
        phone: "+1234567893",
        roleId: customerRole.role_id,
      },
    }),
    prisma.user.create({
      data: {
        email: "customer2@example.com",
        password: await bcrypt.hash("customer123", 12),
        firstName: "Bob",
        lastName: "Smith",
        phone: "+1234567894",
        roleId: customerRole.role_id,
      },
    }),
    prisma.user.create({
      data: {
        email: "customer3@example.com",
        password: await bcrypt.hash("customer123", 12),
        firstName: "Carol",
        lastName: "Williams",
        phone: "+1234567895",
        roleId: customerRole.role_id,
      },
    }),
  ])

  // Create Sample Suppliers
  console.log("🏭 Creating suppliers...")
  const suppliers = await Promise.all([
    prisma.user.create({
      data: {
        email: "supplier1@example.com",
        password: await bcrypt.hash("supplier123", 12),
        firstName: "Tech",
        lastName: "Supplies Inc",
        phone: "+1234567896",
        roleId: supplierRole.role_id,
      },
    }),
    prisma.user.create({
      data: {
        email: "supplier2@example.com",
        password: await bcrypt.hash("supplier123", 12),
        firstName: "Office",
        lastName: "Equipment Co",
        phone: "+1234567897",
        roleId: supplierRole.role_id,
      },
    }),
    prisma.user.create({
      data: {
        email: "supplier3@example.com",
        password: await bcrypt.hash("supplier123", 12),
        firstName: "Electronics",
        lastName: "Wholesale Ltd",
        phone: "+1234567898",
        roleId: supplierRole.role_id,
      },
    }),
  ])

  // Create Categories
  console.log("📂 Creating categories...")
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electronics",
        description: "Electronic devices and accessories",
      },
    }),
    prisma.category.create({
      data: {
        name: "Office Supplies",
        description: "Office equipment and stationery",
      },
    }),
    prisma.category.create({
      data: {
        name: "Furniture",
        description: "Office and home furniture",
      },
    }),
    prisma.category.create({
      data: {
        name: "Books",
        description: "Books and educational materials",
      },
    }),
    prisma.category.create({
      data: {
        name: "Clothing",
        description: "Apparel and accessories",
      },
    }),
    prisma.category.create({
      data: {
        name: "Sports",
        description: "Sports equipment and accessories",
      },
    }),
  ])

  // Create Products
  console.log("📦 Creating products...")
  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: "Laptop Dell Inspiron 15",
        description: "High-performance laptop with Intel i7 processor",
        sku: "ELE-LAP-001",
        barcode: "1234567890123",
        price: 899.99,
        cost: 650.0,
        quantity: 25,
        minStock: 5,
        maxStock: 50,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Wireless Mouse",
        description: "Ergonomic wireless mouse with USB receiver",
        sku: "ELE-MOU-002",
        barcode: "1234567890124",
        price: 29.99,
        cost: 15.0,
        quantity: 100,
        minStock: 20,
        maxStock: 200,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Smartphone Samsung Galaxy",
        description: "Latest Samsung Galaxy smartphone with 128GB storage",
        sku: "ELE-PHO-003",
        barcode: "1234567890125",
        price: 699.99,
        cost: 500.0,
        quantity: 15,
        minStock: 3,
        maxStock: 30,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Bluetooth Headphones",
        description: "Noise-cancelling wireless headphones",
        sku: "ELE-HEA-004",
        barcode: "1234567890126",
        price: 149.99,
        cost: 80.0,
        quantity: 50,
        minStock: 10,
        maxStock: 100,
        categoryId: categories[0].id,
      },
    }),

    // Office Supplies
    prisma.product.create({
      data: {
        name: "Office Chair Executive",
        description: "Ergonomic executive office chair with lumbar support",
        sku: "OFF-CHA-005",
        barcode: "1234567890127",
        price: 299.99,
        cost: 180.0,
        quantity: 12,
        minStock: 3,
        maxStock: 25,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Printer HP LaserJet",
        description: "Monochrome laser printer for office use",
        sku: "OFF-PRI-006",
        barcode: "1234567890128",
        price: 199.99,
        cost: 120.0,
        quantity: 8,
        minStock: 2,
        maxStock: 15,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Paper A4 Ream",
        description: "High-quality A4 printing paper, 500 sheets",
        sku: "OFF-PAP-007",
        barcode: "1234567890129",
        price: 8.99,
        cost: 5.0,
        quantity: 200,
        minStock: 50,
        maxStock: 500,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Pen Set Blue",
        description: "Pack of 10 blue ballpoint pens",
        sku: "OFF-PEN-008",
        barcode: "1234567890130",
        price: 12.99,
        cost: 7.0,
        quantity: 150,
        minStock: 30,
        maxStock: 300,
        categoryId: categories[1].id,
      },
    }),

    // Furniture
    prisma.product.create({
      data: {
        name: "Desk Oak Wood",
        description: "Solid oak wood office desk with drawers",
        sku: "FUR-DES-009",
        barcode: "1234567890131",
        price: 449.99,
        cost: 280.0,
        quantity: 6,
        minStock: 2,
        maxStock: 15,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Bookshelf 5-Tier",
        description: "Wooden 5-tier bookshelf for storage",
        sku: "FUR-BOO-010",
        barcode: "1234567890132",
        price: 129.99,
        cost: 75.0,
        quantity: 10,
        minStock: 3,
        maxStock: 20,
        categoryId: categories[2].id,
      },
    }),

    // Books
    prisma.product.create({
      data: {
        name: "JavaScript Programming Guide",
        description: "Complete guide to JavaScript programming",
        sku: "BOO-JAV-011",
        barcode: "1234567890133",
        price: 39.99,
        cost: 20.0,
        quantity: 30,
        minStock: 5,
        maxStock: 60,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Business Management Handbook",
        description: "Essential handbook for business management",
        sku: "BOO-BUS-012",
        barcode: "1234567890134",
        price: 49.99,
        cost: 25.0,
        quantity: 20,
        minStock: 5,
        maxStock: 40,
        categoryId: categories[3].id,
      },
    }),

    // Clothing
    prisma.product.create({
      data: {
        name: "Business Shirt White",
        description: "Professional white business shirt",
        sku: "CLO-SHI-013",
        barcode: "1234567890135",
        price: 59.99,
        cost: 30.0,
        quantity: 40,
        minStock: 10,
        maxStock: 80,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Formal Trousers Black",
        description: "Black formal trousers for business wear",
        sku: "CLO-TRO-014",
        barcode: "1234567890136",
        price: 79.99,
        cost: 45.0,
        quantity: 35,
        minStock: 8,
        maxStock: 70,
        categoryId: categories[4].id,
      },
    }),

    // Sports
    prisma.product.create({
      data: {
        name: "Basketball Official Size",
        description: "Official size basketball for indoor/outdoor use",
        sku: "SPO-BAS-015",
        barcode: "1234567890137",
        price: 24.99,
        cost: 12.0,
        quantity: 60,
        minStock: 15,
        maxStock: 120,
        categoryId: categories[5].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Running Shoes Nike",
        description: "Nike running shoes for athletic performance",
        sku: "SPO-SHO-016",
        barcode: "1234567890138",
        price: 119.99,
        cost: 70.0,
        quantity: 25,
        minStock: 5,
        maxStock: 50,
        categoryId: categories[5].id,
      },
    }),

    // Low stock items for testing
    prisma.product.create({
      data: {
        name: "USB Cable Type-C",
        description: "High-speed USB Type-C cable",
        sku: "ELE-USB-017",
        barcode: "1234567890139",
        price: 19.99,
        cost: 8.0,
        quantity: 3, // Low stock
        minStock: 10,
        maxStock: 50,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: "Stapler Heavy Duty",
        description: "Heavy-duty office stapler",
        sku: "OFF-STA-018",
        barcode: "1234567890140",
        price: 34.99,
        cost: 18.0,
        quantity: 2, // Low stock
        minStock: 5,
        maxStock: 20,
        categoryId: categories[1].id,
      },
    }),
  ])

  // Create Sample Purchases
  console.log("🛍️ Creating sample purchases...")
  const purchases = await Promise.all([
    prisma.purchase.create({
      data: {
        userId: managerUser.id,
        supplierId: suppliers[0].id,
        totalCost: 16250.0,
        discount: 5.0,
        tax: 8.0,
        status: "received",
        notes: "Electronics restock order",
      },
    }),
    prisma.purchase.create({
      data: {
        userId: managerUser.id,
        supplierId: suppliers[1].id,
        totalCost: 2400.0,
        discount: 0,
        tax: 8.0,
        status: "received",
        notes: "Office supplies monthly order",
      },
    }),
    prisma.purchase.create({
      data: {
        userId: adminUser.id,
        supplierId: suppliers[2].id,
        totalCost: 5600.0,
        discount: 10.0,
        tax: 8.0,
        status: "pending",
        notes: "Furniture order for new office setup",
      },
    }),
  ])

  // Create Purchase Items
  console.log("📋 Creating purchase items...")
  await Promise.all([
    // Purchase 1 items
    prisma.productPurchase.create({
      data: {
        productId: products[0].id, // Laptop
        purchaseId: purchases[0].id,
        purchase_price: 650.0,
        purchase_quantity: 25,
        createdBy: "system",
      },
    }),
    prisma.productPurchase.create({
      data: {
        productId: products[2].id, // Smartphone
        purchaseId: purchases[0].id,
        purchase_price: 500.0,
        purchase_quantity: 15,
        createdBy: "system",
      },
    }),

    // Purchase 2 items
    prisma.productPurchase.create({
      data: {
        productId: products[6].id, // Paper
        purchaseId: purchases[1].id,
        purchase_price: 5.0,
        purchase_quantity: 200,
        createdBy: "system",
      },
    }),
    prisma.productPurchase.create({
      data: {
        productId: products[7].id, // Pens
        purchaseId: purchases[1].id,
        purchase_price: 7.0,
        purchase_quantity: 150,
        createdBy: "system",
      },
    }),
  ])

  // Create Sample Sales
  console.log("💰 Creating sample sales...")
  const sales = await Promise.all([
    prisma.sale.create({
      data: {
        userId: cashierUser.id,
        customerId: customers[0].id,
        totalPrice: 959.98,
        discount: 5.0,
        tax: 8.0,
        paymentMethod: "credit_card",
        status: "completed",
        notes: "Customer purchased laptop and mouse",
      },
    }),
    prisma.sale.create({
      data: {
        userId: cashierUser.id,
        customerId: customers[1].id,
        totalPrice: 179.98,
        discount: 0,
        tax: 8.0,
        paymentMethod: "cash",
        status: "completed",
        notes: "Office supplies purchase",
      },
    }),
    prisma.sale.create({
      data: {
        userId: managerUser.id,
        customerId: customers[2].id,
        totalPrice: 849.97,
        discount: 10.0,
        tax: 8.0,
        paymentMethod: "bank_transfer",
        status: "completed",
        notes: "Bulk purchase with discount",
      },
    }),
    prisma.sale.create({
      data: {
        userId: cashierUser.id,
        customerId: null, // Walk-in customer
        totalPrice: 44.98,
        discount: 0,
        tax: 8.0,
        paymentMethod: "cash",
        status: "completed",
        notes: "Walk-in customer purchase",
      },
    }),
  ])

  // Create Sale Items
  console.log("🛒 Creating sale items...")
  await Promise.all([
    // Sale 1 items
    prisma.productSale.create({
      data: {
        productId: products[0].id, // Laptop
        saleId: sales[0].id,
        sale_price: 899.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),
    prisma.productSale.create({
      data: {
        productId: products[1].id, // Mouse
        saleId: sales[0].id,
        sale_price: 29.99,
        sale_quantity: 2,
        createdBy: "system",
      },
    }),

    // Sale 2 items
    prisma.productSale.create({
      data: {
        productId: products[3].id, // Headphones
        saleId: sales[1].id,
        sale_price: 149.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),
    prisma.productSale.create({
      data: {
        productId: products[1].id, // Mouse
        saleId: sales[1].id,
        sale_price: 29.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),

    // Sale 3 items
    prisma.productSale.create({
      data: {
        productId: products[8].id, // Desk
        saleId: sales[2].id,
        sale_price: 449.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),
    prisma.productSale.create({
      data: {
        productId: products[4].id, // Office Chair
        saleId: sales[2].id,
        sale_price: 299.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),
    prisma.productSale.create({
      data: {
        productId: products[9].id, // Bookshelf
        saleId: sales[2].id,
        sale_price: 129.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),

    // Sale 4 items
    prisma.productSale.create({
      data: {
        productId: products[14].id, // Basketball
        saleId: sales[3].id,
        sale_price: 24.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),
    prisma.productSale.create({
      data: {
        productId: products[16].id, // USB Cable
        saleId: sales[3].id,
        sale_price: 19.99,
        sale_quantity: 1,
        createdBy: "system",
      },
    }),
  ])

  // Create Settings
  console.log("⚙️ Creating system settings...")
  await prisma.settings.create({
    data: {
      appName: "Inventory Management System",
      theme: "light",
      lowStockThreshold: 10,
      currency: "USD",
      taxRate: 8.0,
    },
  })

  console.log("✅ Database seeding completed successfully!")
  console.log("\n📊 Summary:")
  console.log(`- Roles: 5`)
  console.log(`- Users: ${3 + customers.length + suppliers.length}`)
  console.log(`- Categories: ${categories.length}`)
  console.log(`- Products: ${products.length}`)
  console.log(`- Purchases: ${purchases.length}`)
  console.log(`- Sales: ${sales.length}`)
  console.log("\n🔐 Default Login Credentials:")
  console.log("Admin: admin@inventory.com / admin123")
  console.log("Manager: manager@inventory.com / manager123")
  console.log("Cashier: cashier@inventory.com / cashier123")
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
