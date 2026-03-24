import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException('Phone number already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const tenant = await this.prisma.tenant.create({
      data: {
        name: dto.tenantName,
        ownerPhone: dto.phone,
        language: (dto.language as any) ?? 'en',
      },
    });

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
        role: 'owner',
        tenantId: tenant.id,
        language: (dto.language as any) ?? 'en',
      },
    });

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { phone: dto.phone, isActive: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true, branch: true },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: any) {
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
      branchId: user.branchId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...result } = user;
    return result;
  }
}
