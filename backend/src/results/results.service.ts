import { ForbiddenException, Injectable } from '@nestjs/common';
import { ROLE_STUDENT } from '../auth/constants.js';
import { isCurriculumStaff } from '../auth/access.constants.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Students: own scores. Staff: all results in tenant (optional `examId`). */
  async findAll(instituteId: string, user: JwtUser, examId?: string) {
    if (user.role === ROLE_STUDENT) {
      return this.prisma.result.findMany({
        where: {
          studentId: user.id,
          ...(examId ? { examId } : {}),
        },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              courseId: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });
    }

    if (!isCurriculumStaff(user.role)) {
      throw new ForbiddenException();
    }

    return this.prisma.result.findMany({
      where: {
        ...(examId ? { examId } : {}),
        exam: {
          course: { instituteId },
        },
      },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: 'desc' },
    });
  }
}
