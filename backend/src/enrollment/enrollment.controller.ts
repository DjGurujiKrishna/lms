import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MANAGE_CURRICULUM_ROLES } from '../auth/access.constants.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { CurrentInstituteId } from '../tenant/decorators/current-institute-id.decorator.js';
import { EnrollDto } from './dto/enroll.dto.js';
import { EnrollmentService } from './enrollment.service.js';

@Controller('enroll')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(...MANAGE_CURRICULUM_ROLES)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  enroll(
    @CurrentInstituteId() instituteId: string,
    @Body() dto: EnrollDto,
  ) {
    return this.enrollmentService.enroll(instituteId, dto);
  }
}
