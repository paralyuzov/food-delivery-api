import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let access_token: string;
  let refresh_token: string;
  let userEmail: string;
  let verificationToken: string;

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
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-' } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.refreshToken.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-' } },
    });

    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      userEmail = `test-${Date.now()}@example.com`;

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userEmail,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          phone: '+1234567890',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Registration successful');
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: userEmail,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(409);
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-new-${Date.now()}@example.com`,
          password: '123',
          confirmPassword: '123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-new-${Date.now()}@example.com`,
        })
        .expect(400);
    });

    it('should fail when passwords do not match', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-new-${Date.now()}@example.com`,
          password: 'Password123!',
          confirmPassword: 'DifferentPassword123!',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(400);
    });
  });

  describe('/auth/verify-email (GET)', () => {
    beforeAll(async () => {
      // Get verification token from database
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      verificationToken = user?.emailVerificationToken || '';
    });

    it('should verify email with valid token', () => {
      return request(app.getHttpServer())
        .get(`/auth/verify-email?token=${verificationToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Email verification successful');
        });
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/verify-email?token=invalid-token')
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(userEmail);

          // Store tokens for future tests
          access_token = res.body.access_token;
          refresh_token = res.body.refresh_token;
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });

    it('should fail with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('/auth/me (GET)', () => {
    it('should get current user with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(userEmail);
          expect(res.body).toHaveProperty('id');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh tokens with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('x-refresh-token', refresh_token)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body).toHaveProperty('refresh_token');

          // Update tokens
          access_token = res.body.access_token;
          refresh_token = res.body.refresh_token;
        });
    });

    it('should fail without refresh token', () => {
      return request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('x-refresh-token', 'invalid-token')
        .expect(401);
    });
  });

  describe('/auth/change-password (POST)', () => {
    it('should change password with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!',
          confirmNewPassword: 'NewPassword123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('changed');
        });
    });

    it('should login with new password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmail,
          password: 'NewPassword123!',
        })
        .expect(200)
        .expect((res) => {
          access_token = res.body.access_token;
          refresh_token = res.body.refresh_token;
        });
    });

    it('should fail with wrong current password', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'AnotherPassword123!',
          confirmNewPassword: 'AnotherPassword123!',
        })
        .expect(401);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .send({
          currentPassword: 'NewPassword123!',
          newPassword: 'AnotherPassword123!',
        })
        .expect(401);
    });
  });

  describe('/auth/forgot-password (POST)', () => {
    it('should send password reset email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: userEmail,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Password reset link');
        });
    });

    it('should return success even with non-existent email (security)', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(200);
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);
    });
  });

  describe('/auth/reset-password (POST)', () => {
    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'AnotherPassword123!',
        })
        .expect(400);
    });

    it('should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'some-token',
          newPassword: '123',
        })
        .expect(400);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Logged out');
        });
    });

    it('should fail to use refresh token after logout', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('x-refresh-token', refresh_token)
        .expect(401);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
