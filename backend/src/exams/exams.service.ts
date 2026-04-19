import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { ROLE_STUDENT } from '../auth/constants.js';
import { isCurriculumStaff } from '../auth/access.constants.js';
import type { JwtUser } from '../auth/interfaces/jwt-user.interface.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CoursesService } from '../courses/courses.service.js';
import type { CreateExamDto } from './dto/create-exam.dto.js';
import type { CreateQuestionDto } from './dto/create-question.dto.js';
import type { SubmitExamDto } from './dto/submit-exam.dto.js';

const GRACE_SECONDS = 5;

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coursesService: CoursesService,
  ) {}

  async createExam(instituteId: string, dto: CreateExamDto) {
    await this.coursesService.ensureCourseInTenant(dto.courseId, instituteId);
    return this.prisma.exam.create({
      data: {
        title: dto.title.trim(),
        courseId: dto.courseId,
        duration: dto.duration,
      },
      select: {
        id: true,
        title: true,
        courseId: true,
        duration: true,
      },
    });
  }

  async createQuestion(instituteId: string, dto: CreateQuestionDto) {
    await this.ensureExamInTenant(dto.examId, instituteId);
    if (!dto.options.includes(dto.answer)) {
      throw new BadRequestException('answer must be one of options');
    }
    return this.prisma.question.create({
      data: {
        examId: dto.examId,
        question: dto.question.trim(),
        options: dto.options as unknown as Prisma.InputJsonValue,
        answer: dto.answer,
      },
      select: {
        id: true,
        examId: true,
        question: true,
        options: true,
        answer: true,
      },
    });
  }

  async getExamById(examId: string, instituteId: string, viewer: JwtUser) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        course: { instituteId },
      },
      include: {
        questions: {
          orderBy: { id: 'asc' },
        },
        course: {
          select: { id: true, name: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (isCurriculumStaff(viewer.role)) {
      return exam;
    }

    if (viewer.role !== ROLE_STUDENT) {
      throw new ForbiddenException();
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId: viewer.id,
        courseId: exam.courseId,
      },
      select: { id: true },
    });
    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course');
    }

    return {
      id: exam.id,
      title: exam.title,
      courseId: exam.courseId,
      duration: exam.duration,
      course: exam.course,
      questions: exam.questions.map(({ answer: _omit, ...q }) => ({
        ...q,
        options: q.options,
      })),
    };
  }

  async submitExam(instituteId: string, studentId: string, dto: SubmitExamDto) {
    const exam = await this.prisma.exam.findFirst({
      where: {
        id: dto.examId,
        course: { instituteId },
      },
      include: {
        questions: true,
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        studentId,
        courseId: exam.courseId,
      },
    });
    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course');
    }

    if (dto.startedAt) {
      const start = new Date(dto.startedAt).getTime();
      if (Number.isNaN(start)) {
        throw new BadRequestException('Invalid startedAt');
      }
      const elapsedSec = (Date.now() - start) / 1000;
      if (elapsedSec > exam.duration + GRACE_SECONDS) {
        throw new BadRequestException('Time limit exceeded');
      }
    }

    const existing = await this.prisma.result.findUnique({
      where: {
        studentId_examId: { studentId, examId: exam.id },
      },
    });
    if (existing) {
      throw new ConflictException('Exam already submitted');
    }

    const questions = exam.questions;
    if (questions.length === 0) {
      throw new BadRequestException('Exam has no questions');
    }

    let correct = 0;
    for (const q of questions) {
      const given = dto.answers[q.id]?.trim();
      if (given !== undefined && given === q.answer) {
        correct += 1;
      }
    }

    const score =
      questions.length === 0
        ? 0
        : Math.round((correct / questions.length) * 100);

    const result = await this.prisma.result.create({
      data: {
        studentId,
        examId: exam.id,
        score,
      },
      select: {
        id: true,
        score: true,
        examId: true,
        studentId: true,
      },
    });

    return {
      ...result,
      correct,
      total: questions.length,
    };
  }

  private async ensureExamInTenant(examId: string, instituteId: string) {
    const row = await this.prisma.exam.findFirst({
      where: {
        id: examId,
        course: { instituteId },
      },
      select: { id: true },
    });
    if (!row) {
      throw new NotFoundException('Exam not found');
    }
  }
}
