import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRole } from 'src/users/schemas/user.schema';

@Injectable()
export class TechnicianGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.user?.role !== UserRole.TECHNICIAN) {
      throw new ForbiddenException('Only technicians can access this');
    }
    return true;
  }
}