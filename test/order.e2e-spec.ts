import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Order (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let customerToken: string;
  let restaurantId: string;
  let menuId: string;
  let dishId: string;
  let addressId: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up test data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.dish.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.restaurant.deleteMany({
      where: { name: { contains: 'Test Order Restaurant' } },
    });
    await prisma.address.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-order-' } },
    });

    // Create admin user
    const adminEmail = `test-order-admin-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email: adminEmail,
      password: 'Admin123!',
      confirmPassword: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN', isEmailVerified: true },
    });

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password: 'Admin123!',
      });

    adminToken = adminLogin.body.access_token;

    // Create customer user
    const customerEmail = `test-order-customer-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email: customerEmail,
      password: 'Customer123!',
      confirmPassword: 'Customer123!',
      firstName: 'Customer',
      lastName: 'User',
    });

    await prisma.user.update({
      where: { email: customerEmail },
      data: { isEmailVerified: true },
    });

    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: customerEmail,
        password: 'Customer123!',
      });

    customerToken = customerLogin.body.access_token;
    const customerId = customerLogin.body.user.id;

    // Create address for customer
    const address = await prisma.address.create({
      data: {
        userId: customerId,
        street: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country',
      },
    });
    addressId = address.id;

    // Get admin user for restaurant manager
    const adminUser = await prisma.user.findFirst({
      where: { email: { contains: 'test-order-admin-' } },
    });

    // Create restaurant, menu, and dish
    const restaurant = await prisma.restaurant.create({
      data: {
        name: `Test Order Restaurant ${Date.now()}`,
        description: 'Test restaurant for orders',
        address: '123 Restaurant Street',
        phone: '+1234567890',
        imageUrl: 'https://example.com/image.jpg',
        managerId: adminUser!.id,
      },
    });
    restaurantId = restaurant.id;

    const menu = await prisma.menu.create({
      data: {
        name: 'Test Menu',
        description: 'Test menu description',
        restaurantId: restaurant.id,
      },
    });
    menuId = menu.id;

    const dish = await prisma.dish.create({
      data: {
        name: 'Test Dish',
        description: 'Delicious test dish',
        price: 19.99,
        imageUrl: 'https://example.com/dish.jpg',
        category: 'Main Course',
        menuId: menu.id,
      },
    });
    dishId = dish.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.dish.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.restaurant.deleteMany({
      where: { name: { contains: 'Test Order Restaurant' } },
    });
    await prisma.address.deleteMany({});
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-order-' } },
    });

    await app.close();
  });

  describe('/orders/checkout (POST)', () => {
    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/orders/checkout')
        .send({
          items: [
            {
              dishId: dishId,
              quantity: 2,
            },
          ],
          addressId: addressId,
          restaurantId: restaurantId,
        })
        .expect(401);
    });

    it('should fail with empty items', () => {
      return request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [],
          addressId: addressId,
          restaurantId: restaurantId,
        })
        .expect(400);
    });
  });

  describe('/orders/user-orders (GET)', () => {
    beforeAll(async () => {
      // Get customer user
      const customer = await prisma.user.findFirst({
        where: { email: { contains: 'test-order-customer-' } },
      });

      // Create a test order directly in database
      const order = await prisma.order.create({
        data: {
          customerId: customer!.id,
          restaurantId: restaurantId,
          addressId: addressId,
          status: 'PENDING',
          subtotal: 39.98,
          deliveryFee: 5.00,
          tax: 3.20,
          total: 48.18,
          session_id: `test_session_${Date.now()}`,
          items: {
            create: [
              {
                dishId: dishId,
                quantity: 2,
                price: 19.99,
              },
            ],
          },
        },
      });
      orderId = order.id;
    });

    it('should get user orders', () => {
      return request(app.getHttpServer())
        .get('/orders/user-orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('status');
          expect(res.body[0]).toHaveProperty('total');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get('/orders/user-orders')
        .expect(401);
    });
  });

  describe('/orders/all (GET)', () => {
    it('should get all orders as admin', () => {
      return request(app.getHttpServer())
        .get('/orders/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should fail as customer', () => {
      return request(app.getHttpServer())
        .get('/orders/all')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/orders/all').expect(401);
    });
  });

  describe('/orders/update-status/:orderId (PATCH)', () => {
    it('should fail as customer', () => {
      return request(app.getHttpServer())
        .patch(`/orders/update-status/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          status: 'PREPARING',
        })
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/orders/update-status/${orderId}`)
        .send({
          status: 'PREPARING',
        })
        .expect(401);
    });

    it('should fail with invalid order id', () => {
      return request(app.getHttpServer())
        .patch('/orders/update-status/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'CONFIRMED',
        })
        .expect(404);
    });
  });
});
