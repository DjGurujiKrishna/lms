import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ROLE_STUDENT } from '../auth/constants.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { CurrentInstituteId } from '../tenant/decorators/current-institute-id.decorator.js';
import { ExamsService } from './exams.service.js';

@Controller('student/exams')
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(ROLE_STUDENT)
export class StudentExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  listForCourse(
    @CurrentInstituteId() instituteId: string,
    @CurrentUser() user: JwtUser,
    @Query('courseId') courseId: string | undefined,
  ) {
    if (!courseId) {
      throw new BadRequestException('courseId query parameter is required');
    }
    return this.examsService.findForEnrolledStudent(
      instituteId,
      user.id,
      courseId,
    );
  }
}
