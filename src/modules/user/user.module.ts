import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserAdminController } from './user-admin.controller';

@Module({
  providers: [UserService, UserRepository],
  controllers: [UserController, UserAdminController],
  exports: [UserService, UserRepository],
})
export class UserModule {}
