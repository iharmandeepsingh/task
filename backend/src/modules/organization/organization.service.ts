import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async createSchool(dto: CreateSchoolDto) {
    const existing = await this.prisma.school.findFirst({
      where: { OR: [{ code: dto.code }, { name: dto.name }] },
    });
    if (existing) {
      throw new ConflictException('School with this code or name already exists');
    }

    return this.prisma.school.create({
      data: dto,
    });
  }

  async getAllSchools() {
    return this.prisma.school.findMany({
      include: {
        departments: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const school = await this.prisma.school.findUnique({
      where: { id: dto.schoolId },
    });
    if (!school) {
      throw new NotFoundException(`School with ID ${dto.schoolId} not found`);
    }

    const existing = await this.prisma.department.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Department code ${dto.code} already exists`);
    }

    return this.prisma.department.create({
      data: dto,
    });
  }

  async getAllDepartments() {
    return this.prisma.department.findMany({
      include: {
        school: true,
        _count: {
          select: { profiles: true, tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
