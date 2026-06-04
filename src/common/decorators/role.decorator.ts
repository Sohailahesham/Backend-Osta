import { SetMetadata } from '@nestjs/common';

export const RoleDecorator = (...roles: any) => SetMetadata('ROLES', roles);
