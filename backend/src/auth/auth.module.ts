import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => ({
        // Ensure secret is present and typed as string
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          // Cast to satisfy the stricter type in @nestjs/jwt v10 (number | StringValue)
          // If your env provides values like "15m", this cast is appropriate.
          expiresIn: (configService.get<string>('JWT_EXPIRATION') || '15m') as unknown as number,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
