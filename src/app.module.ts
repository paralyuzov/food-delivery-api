import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { MenusModule } from './menus/menus.module';
import { DishesModule } from './dishes/dishes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    PrismaModule,
    AuthModule,
    MailModule,
    RestaurantModule,
    MenusModule,
    DishesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
