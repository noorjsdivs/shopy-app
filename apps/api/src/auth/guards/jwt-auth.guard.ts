import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Requires a valid access token (passport 'jwt' strategy). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
