import { Module } from '@nestjs/common';
import { DefectsController } from './defects.controller';
import { DefectsService } from './defects.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DefectsController],
  providers: [DefectsService],
  exports: [DefectsService],
})
export class DefectsModule {}
