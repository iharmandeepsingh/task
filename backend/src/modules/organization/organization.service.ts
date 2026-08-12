import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateOrganizationUnitDto } from './dto/create-org-unit.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Organization Unit Architecture Methods
  async createOrganizationUnit(dto: CreateOrganizationUnitDto) {
    const existing = await this.prisma.organizationUnit.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException(`Organization unit code ${dto.code} already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.organizationUnit.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent Organization Unit ID ${dto.parentId} not found`);
      }
    }

    return this.prisma.organizationUnit.create({
      data: {
        name: dto.name,
        code: dto.code,
        type: dto.type,
        parentId: dto.parentId,
        isActive: dto.isActive ?? true,
      },
      include: { parent: true },
    });
  }

  async validateNoCycles(unitId: string, targetParentId: string): Promise<void> {
    if (unitId === targetParentId) {
      throw new BadRequestException('Organization unit cannot be its own parent');
    }

    let currentParentId: string | null = targetParentId;
    while (currentParentId) {
      if (currentParentId === unitId) {
        throw new BadRequestException('Circular organizational hierarchy detected');
      }
      const parentUnit: { parentId: string | null } | null = await this.prisma.organizationUnit.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });
      currentParentId = parentUnit ? parentUnit.parentId : null;
    }
  }

  async getOrganizationTree() {
    // Fetch all units and construct tree
    const allUnits = await this.prisma.organizationUnit.findMany({
      where: { isActive: true },
      include: {
        children: true,
        _count: { select: { memberships: true } },
      },
      orderBy: { name: 'asc' },
    });

    const rootUnits = allUnits.filter((u) => !u.parentId);
    return rootUnits;
  }

  async getOrganizationUnitById(id: string) {
    const unit = await this.prisma.organizationUnit.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        memberships: {
          include: { employee: true },
        },
      },
    });
    if (!unit) {
      throw new NotFoundException(`Organization Unit ID ${id} not found`);
    }
    return unit;
  }

  async deactivateOrganizationUnit(id: string) {
    const unit = await this.getOrganizationUnitById(id);

    // Safety check: verify no active child units or active memberships
    const activeChildren = await this.prisma.organizationUnit.count({
      where: { parentId: id, isActive: true },
    });
    if (activeChildren > 0) {
      throw new BadRequestException('Cannot deactivate unit with active child units');
    }

    return this.prisma.organizationUnit.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // 2. Legacy Bridge Methods (Schools & Departments)
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
