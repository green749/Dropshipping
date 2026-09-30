import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Multi-Business Dropshipping Platform API Gateway',
    version: '1.0.0',
    description: 'Centralized Microservices API Gateway for Multi-Business Dropshipping Management System. Complete Swagger UI with interactive endpoint execution.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'API Gateway (Port 5000)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token obtained from `/api/v1/auth/login` or `/api/v1/auth/register`.',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: 'Gateway Health', description: 'API Gateway status check' },
    { name: 'Auth & Users', description: 'Auth Microservice (Port 5001)' },
    { name: 'Businesses & Dealers', description: 'Business & Dealer Microservice (Port 5002)' },
    { name: 'Products & Catalog', description: 'Product Microservice (Port 5003)' },
    { name: 'Customers & Orders', description: 'Order & Customer Microservice (Port 5004)' },
    { name: 'Marketing & Campaigns', description: 'Marketing Microservice (Port 5005)' },
    { name: 'Analytics & Dashboards', description: 'Analytics Microservice (Port 5006)' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Gateway Health'],
        summary: 'API Gateway Health Check',
        security: [],
        responses: {
          '200': { description: 'Gateway status UP' },
        },
      },
    },
    // AUTH SERVICE (5001)
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth & Users'],
        summary: 'Register a new user (Dropshipper / Dealer / Marketing)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', example: 'jane@example.com' },
                  password: { type: 'string', example: 'Password123' },
                  role: { type: 'string', enum: ['DROPSHIPPER', 'DEALER', 'MARKETING'], example: 'DROPSHIPPER' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'User registered successfully with JWT token' },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth & Users'],
        summary: 'Log in with credentials to receive JWT token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'jane@example.com' },
                  password: { type: 'string', example: 'Password123' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful' },
          '401': { description: 'Invalid email or password' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth & Users'],
        summary: 'Get logged-in user profile',
        responses: {
          '200': { description: 'Profile retrieved' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/notifications': {
      get: {
        tags: ['Auth & Users'],
        summary: 'Get user notifications',
        responses: { '200': { description: 'Notifications list' } },
      },
    },
    '/api/v1/notifications/{id}/read': {
      patch: {
        tags: ['Auth & Users'],
        summary: 'Mark notification as read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Marked read' } },
      },
    },
    '/api/v1/audit-logs': {
      get: {
        tags: ['Auth & Users'],
        summary: 'Get system audit logs (Dropshipper only)',
        responses: { '200': { description: 'Audit logs list' } },
      },
    },

    // BUSINESS & DEALER SERVICE (5002)
    '/api/v1/businesses': {
      get: {
        tags: ['Businesses & Dealers'],
        summary: 'List all businesses',
        responses: { '200': { description: 'Businesses list' } },
      },
      post: {
        tags: ['Businesses & Dealers'],
        summary: 'Create a new business (Dropshipper only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                  name: { type: 'string', example: 'Apex Dropshipping Ltd' },
                  description: { type: 'string', example: 'Multi-category e-commerce business' },
                  email: { type: 'string', example: 'contact@apexstore.com' },
                  phone: { type: 'string', example: '+1234567890' },
                  address: { type: 'string', example: '100 Business Way, Suite 400' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Business created' } },
      },
    },
    '/api/v1/businesses/{id}': {
      get: {
        tags: ['Businesses & Dealers'],
        summary: 'Get business details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Business details' } },
      },
      patch: {
        tags: ['Businesses & Dealers'],
        summary: 'Update business by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' } } },
            },
          },
        },
        responses: { '200': { description: 'Business updated' } },
      },
      delete: {
        tags: ['Businesses & Dealers'],
        summary: 'Delete business by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Business deleted' } },
      },
    },
    '/api/v1/dealers': {
      get: {
        tags: ['Businesses & Dealers'],
        summary: 'List all dealers',
        responses: { '200': { description: 'Dealers list' } },
      },
      post: {
        tags: ['Businesses & Dealers'],
        summary: 'Create a dealer profile',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_name', 'email'],
                properties: {
                  company_name: { type: 'string', example: 'Tech Supplies Supply Chain' },
                  contact_name: { type: 'string', example: 'Mark Smith' },
                  email: { type: 'string', example: 'dealer@techsupplies.com' },
                  phone: { type: 'string', example: '+1987654321' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Dealer profile created' } },
      },
    },
    '/api/v1/dealers/invite': {
      post: {
        tags: ['Businesses & Dealers'],
        summary: 'Send invitation to a new dealer (Dropshipper only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', example: 'newdealer@example.com' },
                  company_name: { type: 'string', example: 'Global Logistics Inc' },
                  business_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Invitation sent with token and accept URL' } },
      },
    },
    '/api/v1/dealers/invitations': {
      get: {
        tags: ['Businesses & Dealers'],
        summary: 'List all dealer invitations (Dropshipper only)',
        responses: { '200': { description: 'List of dealer invitations' } },
      },
    },
    '/api/v1/dealers/invitations/{token}': {
      get: {
        tags: ['Businesses & Dealers'],
        summary: 'View dealer invitation details by token (Public)',
        security: [],
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Invitation details' }, '400': { description: 'Invitation expired or already used' } },
      },
    },
    '/api/v1/dealers/accept-invite': {
      post: {
        tags: ['Businesses & Dealers'],
        summary: 'Accept dealer invitation to register account and profile (Public)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'name', 'password'],
                properties: {
                  token: { type: 'string', example: 'a1b2c3d4e5f6...' },
                  name: { type: 'string', example: 'Dealer John' },
                  password: { type: 'string', example: 'SecurePassword123' },
                  company_name: { type: 'string', example: 'John Trading Co' },
                  phone: { type: 'string', example: '+123456789' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Account and Dealer profile created, returns JWT token' } },
      },
    },
    '/api/v1/businesses/{businessId}/dealers/{dealerId}': {
      post: {
        tags: ['Businesses & Dealers'],
        summary: 'Assign a dealer to a business',
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'dealerId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '201': { description: 'Dealer assigned to business' } },
      },
      delete: {
        tags: ['Businesses & Dealers'],
        summary: 'Unassign a dealer from a business',
        parameters: [
          { name: 'businessId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'dealerId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Dealer unassigned' } },
      },
    },

    // PRODUCT SERVICE (5003)
    '/api/v1/products': {
      get: {
        tags: ['Products & Catalog'],
        summary: 'List products (filter by business_id, dealer_id, category, status)',
        parameters: [
          { name: 'business_id', in: 'query', schema: { type: 'string' } },
          { name: 'dealer_id', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Products list' } },
      },
      post: {
        tags: ['Products & Catalog'],
        summary: 'Create a new product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'sku', 'category', 'cost_price', 'selling_price'],
                properties: {
                  name: { type: 'string', example: 'Wireless Ergonomic Keyboard' },
                  sku: { type: 'string', example: 'KB-WL-ERG-01' },
                  category: { type: 'string', example: 'Electronics' },
                  cost_price: { type: 'number', example: 25.0 },
                  selling_price: { type: 'number', example: 49.99 },
                  stock_quantity: { type: 'integer', example: 150 },
                  description: { type: 'string', example: 'High precision wireless keyboard' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Product created' } },
      },
    },
    '/api/v1/products/{id}': {
      get: {
        tags: ['Products & Catalog'],
        summary: 'Get product details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product details' } },
      },
      patch: {
        tags: ['Products & Catalog'],
        summary: 'Update product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: { type: 'object', properties: { selling_price: { type: 'number' }, stock_quantity: { type: 'integer' } } },
            },
          },
        },
        responses: { '200': { description: 'Product updated' } },
      },
      delete: {
        tags: ['Products & Catalog'],
        summary: 'Delete product',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Product deleted' } },
      },
    },

    // ORDER SERVICE (5004)
    '/api/v1/customers': {
      get: {
        tags: ['Customers & Orders'],
        summary: 'List customers (Allowed by Dropshipper, Dealer, Marketing)',
        parameters: [{ name: 'business_id', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'Customers list' } },
      },
      post: {
        tags: ['Customers & Orders'],
        summary: 'Create a new customer (Allowed by Dropshipper, Dealer)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['business_id', 'name', 'email'],
                properties: {
                  business_id: { type: 'string', format: 'uuid' },
                  name: { type: 'string', example: 'Alice Johnson' },
                  email: { type: 'string', example: 'alice@example.com' },
                  phone: { type: 'string', example: '+15550199' },
                  address: { type: 'string', example: '123 Main Street' },
                  city: { type: 'string', example: 'Seattle' },
                  state: { type: 'string', example: 'WA' },
                  pincode: { type: 'string', example: '98101' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Customer created' } },
      },
    },
    '/api/v1/customers/{id}': {
      get: {
        tags: ['Customers & Orders'],
        summary: 'Get customer by ID (Allowed by Dropshipper, Dealer, Marketing)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Customer details' }, '404': { description: 'Customer not found' } },
      },
      patch: {
        tags: ['Customers & Orders'],
        summary: 'Update customer details (Allowed by Dropshipper, Dealer)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Alice Johnson Updated' },
                  email: { type: 'string', example: 'alice.updated@example.com' },
                  phone: { type: 'string', example: '+15550199' },
                  address: { type: 'string', example: '456 Tech Avenue' },
                  status: { type: 'string', enum: ['ACTIVE', 'INACTIVE'] },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Customer updated successfully' } },
      },
      delete: {
        tags: ['Customers & Orders'],
        summary: 'Delete customer (Admin / Dropshipper only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Customer deleted successfully' }, '404': { description: 'Customer not found' } },
      },
    },
    '/api/v1/orders': {
      get: {
        tags: ['Customers & Orders'],
        summary: 'List orders (Allowed by Dropshipper, Dealer, Marketing)',
        parameters: [
          { name: 'business_id', in: 'query', schema: { type: 'string' } },
          { name: 'customer_id', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
        ],
        responses: { '200': { description: 'Orders list' } },
      },
      post: {
        tags: ['Customers & Orders'],
        summary: 'Create an order with atomic stock calculation (Allowed by Dropshipper, Dealer)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['business_id', 'customer_id', 'shipping_address', 'items'],
                properties: {
                  business_id: { type: 'string', format: 'uuid' },
                  customer_id: { type: 'string', format: 'uuid' },
                  shipping_address: { type: 'string', example: '123 Main Street, Seattle WA' },
                  shipping_fee: { type: 'number', example: 5.0 },
                  discount: { type: 'number', example: 0.0 },
                  tax: { type: 'number', example: 2.5 },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['product_id', 'quantity'],
                      properties: {
                        product_id: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Order created successfully' } },
      },
    },
    '/api/v1/orders/{id}': {
      get: {
        tags: ['Customers & Orders'],
        summary: 'Get order details by ID (Allowed by Dropshipper, Dealer, Marketing)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Order details' }, '404': { description: 'Order not found' } },
      },
      patch: {
        tags: ['Customers & Orders'],
        summary: 'Update order details (Allowed by Dropshipper, Dealer)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shipping_address: { type: 'string', example: '789 Updated Way, Seattle WA' },
                  shipping_fee: { type: 'number', example: 10.0 },
                  status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
                  payment_status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Order updated successfully' } },
      },
      delete: {
        tags: ['Customers & Orders'],
        summary: 'Delete order (Admin / Dropshipper only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Order deleted successfully' }, '404': { description: 'Order not found' } },
      },
    },
    '/api/v1/orders/{id}/status': {
      patch: {
        tags: ['Customers & Orders'],
        summary: 'Update order status & payment status quick action (Allowed by Dropshipper, Dealer)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
                  payment_status: { type: 'string', enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'Order status updated' } },
      },
    },

    // MARKETING SERVICE (5005)
    '/api/v1/marketing/invite': {
      post: {
        tags: ['Marketing & Campaigns'],
        summary: 'Send invitation to a new Digital Marketer (Dropshipper only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', example: 'marketer@example.com' },
                  business_id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Invitation sent with token and accept URL' } },
      },
    },
    '/api/v1/marketing/invitations': {
      get: {
        tags: ['Marketing & Campaigns'],
        summary: 'List all marketer invitations (Dropshipper only)',
        responses: { '200': { description: 'List of invitations' } },
      },
    },
    '/api/v1/marketing/invitations/{token}': {
      get: {
        tags: ['Marketing & Campaigns'],
        summary: 'View digital marketer invitation details by token (Public)',
        security: [],
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Invitation details' }, '400': { description: 'Invitation expired or already used' } },
      },
    },
    '/api/v1/marketing/accept-invite': {
      post: {
        tags: ['Marketing & Campaigns'],
        summary: 'Accept marketer invitation to register account with MARKETING role (Public)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'name', 'password'],
                properties: {
                  token: { type: 'string', example: 'a1b2c3d4e5f6...' },
                  name: { type: 'string', example: 'Marketer Sarah' },
                  password: { type: 'string', example: 'SecurePassword123' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Account created with MARKETING role, returns JWT token' } },
      },
    },
    '/api/v1/campaigns': {
      get: {
        tags: ['Marketing & Campaigns'],
        summary: 'List marketing campaigns',
        responses: { '200': { description: 'Campaigns list' } },
      },
      post: {
        tags: ['Marketing & Campaigns'],
        summary: 'Create a new marketing campaign',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['business_id', 'name'],
                properties: {
                  business_id: { type: 'string', format: 'uuid' },
                  name: { type: 'string', example: 'Summer Discount Blowout 2026' },
                  description: { type: 'string', example: '25% discount campaign across electronics' },
                  objective: { type: 'string', example: 'Sales Conversions' },
                  budget: { type: 'number', example: 5000.0 },
                  status: { type: 'string', enum: ['DRAFT', 'ACTIVE', 'PAUSED'] },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Campaign created' } },
      },
    },
    '/api/v1/social-accounts': {
      get: {
        tags: ['Marketing & Campaigns'],
        summary: 'List connected social accounts',
        responses: { '200': { description: 'Social accounts list' } },
      },
      post: {
        tags: ['Marketing & Campaigns'],
        summary: 'Connect a new social media account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['business_id', 'platform', 'account_name'],
                properties: {
                  business_id: { type: 'string', format: 'uuid' },
                  platform: { type: 'string', example: 'INSTAGRAM' },
                  account_name: { type: 'string', example: '@apexstore_official' },
                  access_token: { type: 'string', example: 'secret_oauth_token' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Social account connected' } },
      },
    },
    '/api/v1/posts': {
      get: {
        tags: ['Marketing & Campaigns'],
        summary: 'List organic social posts',
        responses: { '200': { description: 'Posts list' } },
      },
      post: {
        tags: ['Marketing & Campaigns'],
        summary: 'Create a social post',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['social_account_id', 'content'],
                properties: {
                  campaign_id: { type: 'string', format: 'uuid' },
                  social_account_id: { type: 'string', format: 'uuid' },
                  content: { type: 'string', example: 'Check out our new products! 🚀 #Dropshipping' },
                  media_url: { type: 'string', example: 'https://example.com/banner.jpg' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Post created' } },
      },
    },
    '/api/v1/posts/{id}/publish': {
      post: {
        tags: ['Marketing & Campaigns'],
        summary: 'Publish a social post immediately',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Post published' } },
      },
    },
    '/api/v1/ads': {
      get: {
        tags: ['Marketing & Campaigns'],
        summary: 'List paid advertisements',
        responses: { '200': { description: 'Ads list' } },
      },
      post: {
        tags: ['Marketing & Campaigns'],
        summary: 'Create a paid ad campaign',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['campaign_id', 'name'],
                properties: {
                  campaign_id: { type: 'string', format: 'uuid' },
                  name: { type: 'string', example: 'Meta Feed Ad #1' },
                  budget: { type: 'number', example: 1000.0 },
                  creative_url: { type: 'string', example: 'https://example.com/ad1.mp4' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Ad created' } },
      },
    },

    // ANALYTICS SERVICE (5006)
    '/api/v1/dashboard/overview': {
      get: {
        tags: ['Analytics & Dashboards'],
        summary: 'Get Dropshipper platform overview metrics and total revenue',
        responses: { '200': { description: 'Platform overview metrics' } },
      },
    },
    '/api/v1/dashboard/dealer': {
      get: {
        tags: ['Analytics & Dashboards'],
        summary: 'Get Dealer specific dashboard metrics, total products, and earnings',
        responses: { '200': { description: 'Dealer metrics' } },
      },
    },
    '/api/v1/dashboard/marketing': {
      get: {
        tags: ['Analytics & Dashboards'],
        summary: 'Get Marketing performance, active campaigns, and total budget',
        responses: { '200': { description: 'Marketing metrics' } },
      },
    },
  },
};

export const setupSwagger = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
