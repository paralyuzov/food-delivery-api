import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [MenusController],
  providers: [MenusService],
  imports: [PrismaModule],
})
export class MenusModule {}
