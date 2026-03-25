import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly users: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  async signup(email: string, password: string) {
    const existing = await this.users.findOne({ email }).lean();
    if (existing) throw new BadRequestException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ email, passwordHash });

    const token = await this.jwt.signAsync({ sub: String(user._id), email: user.email });
    return {
      user: { id: String(user._id), email: user.email },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.users.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({ sub: String(user._id), email: user.email });
    return {
      user: { id: String(user._id), email: user.email },
      token,
    };
  }
}
