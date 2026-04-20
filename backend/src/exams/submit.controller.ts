import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ROLE_STUDENT } from '../auth/constants.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RoleGuard } from '../auth/guards/role.guard.js';
import { CurrentInstituteId } from '../tenant/decorators/current-institute-id.decorator.js';
import { SubmitExamDto } from './dto/submit-exam.dto.js';
import { ExamsService } from './exams.service.js';

/** TASK step 12 — `POST /submit` */
@Controller()
@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(ROLE_STUDENT)
export class SubmitController {
  constructor(private readonly examsService: ExamsService) {}

  @Post('submit')
  submit(
    @CurrentInstituteId() instituteId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: SubmitExamDto,
  ) {
    return this.examsService.submitExam(instituteId, user.id, dto);
  }
}
