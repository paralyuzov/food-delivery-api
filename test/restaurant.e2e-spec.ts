import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Restaurant (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let customerToken: string;
  let restaurantId: string;
  let customerId: string;

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
    await prisma.restaurantRating.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.dish.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.restaurant.deleteMany({
      where: { name: { contains: 'Test Restaurant' } },
    });
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-restaurant-' } },
    });

    // Create admin user
    const adminEmail = `test-restaurant-admin-${Date.now()}@example.com`;
    await request(app.getHttpServer()).post('/auth/register').send({
      email: adminEmail,
      password: 'Admin123!',
      confirmPassword: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
    });

    // Update user to admin role
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN', isEmailVerified: true },
    });

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: adminEmail,
        password: 'Admin123!',
      });

    adminToken = adminLogin.body.access_token;

    // Create customer user
    const customerEmail = `test-restaurant-customer-${Date.now()}@example.com`;
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
    customerId = customerLogin.body.user.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.restaurantRating.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.dish.deleteMany({});
    await prisma.menu.deleteMany({});
    await prisma.restaurant.deleteMany({
      where: { name: { contains: 'Test Restaurant' } },
    });
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-restaurant-' } },
    });

    await app.close();
  });

  describe('/restaurants (POST)', () => {
    it('should create a restaurant as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Test Restaurant ${Date.now()}`,
          description: 'A test restaurant',
          address: '123 Test Street',
          phone: '+1234567890',
          email: 'test@restaurant.com',
          imageUrl: 'https://example.com/image.jpg',
          isActive: true,
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toContain('Test Restaurant');
      expect(response.body.description).toBe('A test restaurant');
      restaurantId = response.body.id;
    });

    it('should fail to create restaurant as customer', () => {
      return request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: `Test Restaurant ${Date.now()}`,
          description: 'A test restaurant',
          address: '123 Test Street',
          phone: '+1234567890',
          email: 'customer@restaurant.com',
          isActive: true,
        })
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/restaurants')
        .send({
          name: `Test Restaurant ${Date.now()}`,
          description: 'A test restaurant',
          address: '123 Test Street',
        })
        .expect(401);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Test Restaurant ${Date.now()}`,
          email: 'incomplete@restaurant.com',
          isActive: true,
        })
        .expect(400);
    });
  });

  describe('/restaurants (GET)', () => {
    it('should get all restaurants without authentication', () => {
      return request(app.getHttpServer())
        .get('/restaurants')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/restaurants/:id (GET)', () => {
    it('should get a restaurant by id', () => {
      return request(app.getHttpServer())
        .get(`/restaurants/${restaurantId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(restaurantId);
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('description');
        });
    });
  });

  describe('/restaurants/popular (GET)', () => {
    it('should get popular restaurants', () => {
      return request(app.getHttpServer())
        .get('/restaurants/popular')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/restaurants/:id (PUT)', () => {
    it('should update a restaurant as admin', () => {
      return request(app.getHttpServer())
        .put(`/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: `Updated Test Restaurant ${Date.now()}`,
          description: 'Updated description',
          address: '456 Updated Street',
          phone: '+0987654321',
          email: `updated-${Date.now()}@restaurant.com`,
          imageUrl: 'https://example.com/updated.jpg',
          isActive: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(restaurantId);
          expect(res.body.description).toBe('Updated description');
        });
    });

    it('should fail to update as customer', () => {
      return request(app.getHttpServer())
        .put(`/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          description: 'Unauthorized update',
        })
        .expect(403);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .put(`/restaurants/${restaurantId}`)
        .send({
          description: 'Unauthorized update',
        })
        .expect(401);
    });
  });

  describe('/restaurants/:id/rate (POST)', () => {
    it('should rate a restaurant as customer', () => {
      return request(app.getHttpServer())
        .post(`/restaurants/${restaurantId}/rate`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post(`/restaurants/${restaurantId}/rate`)
        .send({
          rating: 5,
          comment: 'Unauthorized rating',
        })
        .expect(401);
    });
  });

  describe('/restaurants/:id (DELETE)', () => {
    it('should fail to delete as customer', () => {
      return request(app.getHttpServer())
        .delete(`/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });

    it('should delete a restaurant as admin', () => {
      return request(app.getHttpServer())
        .delete(`/restaurants/${restaurantId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/restaurants/${restaurantId}`)
        .expect(401);
    });
  });
});
