import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

//Her modülde tek tek import etmemek için Globall yapıyoruz
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
