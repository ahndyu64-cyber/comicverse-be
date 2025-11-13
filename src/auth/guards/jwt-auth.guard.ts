import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // Allow requests without valid JWT (don't throw error)
    // User will be undefined if no valid token provided
    return user || undefined;
  }
}