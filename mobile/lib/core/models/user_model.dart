enum UserRole {
  superAdmin,
  adminHead,
  hr,
  faculty,
}

extension UserRoleExtension on UserRole {
  String get displayName {
    switch (this) {
      case UserRole.superAdmin:
        return 'Super Admin';
      case UserRole.adminHead:
        return 'Admin / Head';
      case UserRole.hr:
        return 'HR Lead';
      case UserRole.faculty:
        return 'Faculty';
    }
  }

  String get description {
    switch (this) {
      case UserRole.superAdmin:
        return 'Full control across all dashboards & permission overrides';
      case UserRole.adminHead:
        return 'Department Lead: Task assignment, extension & submission review';
      case UserRole.hr:
        return 'HR Peer: Employee directory management & bulk CSV/XLSX import';
      case UserRole.faculty:
        return 'Faculty Member: Executes tasks, updates subtasks & requests extensions';
    }
  }
}

class Department {
  final String id;
  final String name;
  final String code;

  const Department({
    required this.id,
    required this.name,
    required this.code,
  });
}

class EmployeeUser {
  final String id;
  final String employeeId;
  final String name;
  final String email;
  final String designation;
  final String departmentName;
  final UserRole role;
  final String avatarInitials;

  const EmployeeUser({
    required this.id,
    required this.employeeId,
    required this.name,
    required this.email,
    required this.designation,
    required this.departmentName,
    required this.role,
    required this.avatarInitials,
  });
}
