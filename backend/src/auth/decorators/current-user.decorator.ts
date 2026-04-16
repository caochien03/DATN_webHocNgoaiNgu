import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';

type SafeUser = Omit<User, 'passwordHash'>;

export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext): SafeUser | unknown => {
    const request = ctx.switchToHttp().getRequest<{ user: SafeUser }>();
    const user = request.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
