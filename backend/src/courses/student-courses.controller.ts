import { Controller, Get, UseGuards } from '@nestjs/common';
import { ROLE_STUDENT } from '../auth/constants.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { CurrentInstituteId } from '../tenant/decorators/current-institute-id.decorator.js';
import { CoursesService } from './courses.service.js';

@Controller('student/courses')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(ROLE_STUDENT)
export class StudentCoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  mine(
    @CurrentInstituteId() instituteId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.coursesService.findEnrolledWithSubjects(instituteId, user.id);
  }
}
