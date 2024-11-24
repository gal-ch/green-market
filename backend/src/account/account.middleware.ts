import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AccountMiddleware implements NestMiddleware {
  private jwtSecret: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    this.jwtSecret = this.configService.get<string>('JWT_SECRET');

  }

  use(req: any, res: any, next: () => void) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      console.log('Authorization header is missing');
      return next(); // Allow unauthenticated requests to proceed, if needed
    }
  
    const token = authorizationHeader.split(' ')[1];
    console.log('Authorization Header:', authorizationHeader);
    console.log('Extracted Token:', token);
    if (!token) {
      console.log('Token missing after Bearer');
      return next(); // Allow unauthenticated requests to proceed, if needed
    }
  
    try {
      const decoded = jwt.verify(token, 'N4DkhxKJt6TuZ/H0+VwgXZ6c63M8AHgSyMpbrBw82I8=') as JwtPayload;
      console.log('Decoded token:', decoded);
  
      req.accountId = decoded.sub;
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
