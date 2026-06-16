import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtPayload } from '../common/types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.users.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      name: dto.name,
      role: Role.CUSTOMER,
    });
    return { user, ...(await this.issueTokens(user.id, user.email, user.role)) };
  }

  async login(dto: LoginDto) {
    const found = await this.users.findByEmail(dto.email.toLowerCase());
    if (!found) throw new UnauthorizedException('Invalid email or password.');
    const ok = await bcrypt.compare(dto.password, found.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid email or password.');

    const user = {
      id: found.id,
      email: found.email,
      name: found.name,
      role: found.role,
      createdAt: found.createdAt,
    };
    return { user, ...(await this.issueTokens(found.id, found.email, found.role)) };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
    const accessToken = await this.signAccess(
      payload.sub,
      payload.email,
      payload.role,
    );
    return { accessToken };
  }

  me(userId: string) {
    return this.users.findPublicById(userId);
  }

  private async issueTokens(sub: string, email: string, role: Role) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccess(sub, email, role),
      this.signRefresh(sub, email, role),
    ]);
    return { accessToken, refreshToken };
  }

  private signAccess(sub: string, email: string, role: Role): Promise<string> {
    const payload: JwtPayload = { sub, email, role };
    const options: JwtSignOptions = {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_ACCESS_TTL',
        '900s',
      ) as JwtSignOptions['expiresIn'],
    };
    return this.jwt.signAsync(payload, options);
  }

  private signRefresh(sub: string, email: string, role: Role): Promise<string> {
    const payload: JwtPayload = { sub, email, role };
    const options: JwtSignOptions = {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>(
        'JWT_REFRESH_TTL',
        '30d',
      ) as JwtSignOptions['expiresIn'],
    };
    return this.jwt.signAsync(payload, options);
  }
}
