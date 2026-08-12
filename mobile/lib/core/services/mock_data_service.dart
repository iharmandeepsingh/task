import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/task_model.dart';

class CTUSystemService extends ChangeNotifier {
  static final CTUSystemService instance = CTUSystemService._internal();
  CTUSystemService._internal();

  // Current Logged In Role Session
  UserRole currentRole = UserRole.adminHead;
  EmployeeUser currentUser = sampleUsers[1]; // Dr. Gurpreet Singh (Head of Dept)

  void switchRole(UserRole newRole) {
    currentRole = newRole;
    switch (newRole) {
      case UserRole.superAdmin:
        currentUser = sampleUsers[0];
        break;
      case UserRole.adminHead:
        currentUser = sampleUsers[1];
        break;
      case UserRole.hr:
        currentUser = sampleUsers[2];
        break;
      case UserRole.faculty:
        currentUser = sampleUsers[3];
        break;
    }
    notifyListeners();
  }

  // Pre-configured Sample Users matching Flowchart
  static final List<EmployeeUser> sampleUsers = [
    const EmployeeUser(
      id: 'usr-0',
      employeeId: 'CTU-EMP-001',
      name: 'Dr. Manjit Singh',
      email: 'superadmin@ctu.edu.in',
      designation: 'Vice Chancellor / Super Admin',
      departmentName: 'University Administration',
      role: UserRole.superAdmin,
      avatarInitials: 'MS',
    ),
    const EmployeeUser(
      id: 'usr-1',
      employeeId: 'CTU-EMP-102',
      name: 'Dr. Gurpreet Singh',
      email: 'head.cse@ctu.edu.in',
      designation: 'Head of Department (CSE)',
      departmentName: 'Computer Science & Engineering',
      role: UserRole.adminHead,
      avatarInitials: 'GS',
    ),
    const EmployeeUser(
      id: 'usr-2',
      employeeId: 'CTU-EMP-205',
      name: 'Ms. Pooja Rani',
      email: 'hr.head@ctu.edu.in',
      designation: 'HR Lead & Registrar',
      departmentName: 'Human Resources',
      role: UserRole.hr,
      avatarInitials: 'PR',
    ),
    const EmployeeUser(
      id: 'usr-3',
      employeeId: 'CTU-EMP-309',
      name: 'Dr. Harmanpreet Singh',
      email: 'harman.faculty@ctu.edu.in',
      designation: 'Associate Professor',
      departmentName: 'Computer Science & Engineering',
      role: UserRole.faculty,
      avatarInitials: 'HS',
    ),
    const EmployeeUser(
      id: 'usr-4',
      employeeId: 'CTU-EMP-312',
      name: 'Prof. Ananya Sharma',
      email: 'ananya.law@ctu.edu.in',
      designation: 'Assistant Professor',
      departmentName: 'School of Law',
      role: UserRole.faculty,
      avatarInitials: 'AS',
    ),
  ];

  // Pre-configured Sample Tasks matching CT University Flowchart
  List<TaskModel> tasks = [
    TaskModel(
      id: 'task-101',
      taskCode: 'CTU-CSE-101',
      title: 'NAAC Accreditation Criterion 3 Report',
      description: 'Compile research publications, grants, and patents data for the CSE Department for NAAC inspection.',
      creatorName: 'Dr. Gurpreet Singh (Head)',
      assigneeId: 'usr-3',
      assigneeName: 'Dr. Harmanpreet Singh',
      departmentName: 'Computer Science & Engineering',
      priority: PriorityLevel.high,
      status: TaskStatus.inProgress,
      deadlineHealth: DeadlineHealth.yellow,
      progressPercent: 60,
      startDate: DateTime.now().subtract(const Duration(days: 10)),
      deadline: DateTime.now().add(const Duration(days: 4)),
      lastActivityAt: DateTime.now().subtract(const Duration(hours: 5)),
      isIdle: false,
      isReminderActive: true,
      subtasks: [
        TaskSubtask(id: 'st-1', title: 'Gather Scopus publication index', isCompleted: true),
        TaskSubtask(id: 'st-2', title: 'Verify consultancy project receipts', isCompleted: true),
        TaskSubtask(id: 'st-3', title: 'Draft PDF annexure summary', isCompleted: false),
      ],
      extensions: [
        ExtensionRequest(
          id: 'ext-1',
          taskId: 'task-101',
          reason: 'Awaiting verified consultancy receipt figures from university finance department.',
          requestedDeadline: DateTime.now().add(const Duration(days: 8)),
          currentDeadline: DateTime.now().add(const Duration(days: 4)),
          status: 'PENDING',
        ),
      ],
      chatMessages: [
        ChatMessage(
          id: 'msg-1',
          senderName: 'Dr. Gurpreet Singh',
          senderRole: 'Head of Dept',
          message: 'Please ensure all Scopus journal DOIs are cross-verified.',
          timestamp: DateTime.now().subtract(const Duration(hours: 24)),
          isHead: true,
        ),
        ChatMessage(
          id: 'msg-2',
          senderName: 'Dr. Harmanpreet Singh',
          senderRole: 'Faculty',
          message: 'Will do. I have uploaded the draft spreadsheet in subtasks.',
          attachmentName: 'CSE_NAAC_Research_Draft.xlsx',
          timestamp: DateTime.now().subtract(const Duration(hours: 12)),
          isHead: false,
        ),
      ],
    ),
    TaskModel(
      id: 'task-102',
      taskCode: 'CTU-LAW-204',
      title: 'MoOT Court Competition Organization',
      description: 'Prepare event schedule, invite guest judges from Punjab High Court, and finalize student moot court briefs.',
      creatorName: 'Dr. Gurpreet Singh (Head)',
      assigneeId: 'usr-4',
      assigneeName: 'Prof. Ananya Sharma',
      departmentName: 'School of Law',
      priority: PriorityLevel.urgent,
      status: TaskStatus.submitted,
      deadlineHealth: DeadlineHealth.green,
      progressPercent: 100,
      startDate: DateTime.now().subtract(const Duration(days: 15)),
      deadline: DateTime.now().add(const Duration(days: 10)),
      lastActivityAt: DateTime.now().subtract(const Duration(hours: 2)),
      isIdle: false,
      isReminderActive: false,
      subtasks: [
        TaskSubtask(id: 'st-10', title: 'Draft invitation letter for judges', isCompleted: true),
        TaskSubtask(id: 'st-11', title: 'Publish rulebook to student portal', isCompleted: true),
      ],
      extensions: [],
      chatMessages: [],
    ),
    TaskModel(
      id: 'task-103',
      taskCode: 'CTU-CSE-108',
      title: 'Mid-Semester Exam Question Paper Setup',
      description: 'Create outcome-based education (OBE) question papers for Data Structures & Algorithms course.',
      creatorName: 'Dr. Gurpreet Singh (Head)',
      assigneeId: 'usr-3',
      assigneeName: 'Dr. Harmanpreet Singh',
      departmentName: 'Computer Science & Engineering',
      priority: PriorityLevel.medium,
      status: TaskStatus.reissued,
      deadlineHealth: DeadlineHealth.orange,
      progressPercent: 40,
      startDate: DateTime.now().subtract(const Duration(days: 12)),
      deadline: DateTime.now().add(const Duration(days: 2)),
      lastActivityAt: DateTime.now().subtract(const Duration(days: 4)),
      isIdle: true, // Idle flag triggered!
      isReminderActive: true,
      subtasks: [
        TaskSubtask(id: 'st-20', title: 'Map Questions to Bloom Taxonomy Level 4', isCompleted: true),
        TaskSubtask(id: 'st-21', title: 'Submit answer key and marking scheme', isCompleted: false),
      ],
      extensions: [],
      chatMessages: [],
      review: TaskReview(
        id: 'rev-1',
        taskId: 'task-103',
        reviewerName: 'Dr. Gurpreet Singh',
        isApproved: false,
        feedback: 'Questions did not align with Bloom Taxonomy level 4. Please revise and resubmit.',
        newRestartDeadline: '2026-08-07',
        reviewedAt: DateTime.now().subtract(const Duration(days: 1)),
      ),
    ),
  ];

  // Actions
  void updateSubtask(String taskId, String subtaskId, bool isCompleted) {
    final taskIndex = tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = tasks[taskIndex];
      final stIndex = task.subtasks.indexWhere((st) => st.id == subtaskId);
      if (stIndex != -1) {
        task.subtasks[stIndex].isCompleted = isCompleted;
        
        // Recompute progress percent
        final completedCount = task.subtasks.where((st) => st.isCompleted).length;
        task.progressPercent = ((completedCount / task.subtasks.length) * 100).round();
        
        if (task.status == TaskStatus.assigned) {
          task.status = TaskStatus.inProgress;
        }
        task.lastActivityAt = DateTime.now();
        task.isIdle = false;
        notifyListeners();
      }
    }
  }

  void submitTaskForReview(String taskId) {
    final taskIndex = tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      tasks[taskIndex].status = TaskStatus.submitted;
      tasks[taskIndex].progressPercent = 100;
      tasks[taskIndex].lastActivityAt = DateTime.now();
      tasks[taskIndex].isIdle = false;
      notifyListeners();
    }
  }

  void requestExtension(String taskId, String reason, DateTime newDeadline) {
    final taskIndex = tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final ext = ExtensionRequest(
        id: 'ext-${DateTime.now().millisecondsSinceEpoch}',
        taskId: taskId,
        reason: reason,
        requestedDeadline: newDeadline,
        currentDeadline: tasks[taskIndex].deadline,
        status: 'PENDING',
      );
      tasks[taskIndex].extensions.add(ext);
      notifyListeners();
    }
  }

  void reviewExtension(String taskId, String extensionId, bool approve, String decisionReason) {
    final taskIndex = tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = tasks[taskIndex];
      final extIndex = task.extensions.indexWhere((e) => e.id == extensionId);
      if (extIndex != -1) {
        task.extensions[extIndex].status = approve ? 'APPROVED' : 'REJECTED';
        task.extensions[extIndex].decisionReason = decisionReason;
        if (approve) {
          task.deadline = task.extensions[extIndex].requestedDeadline;
          task.deadlineHealth = DeadlineHealth.green;
        }
        notifyListeners();
      }
    }
  }

  void reviewTaskSubmission(String taskId, bool accept, String feedback, DateTime? newRestartDeadline) {
    final taskIndex = tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      final task = tasks[taskIndex];
      if (accept) {
        task.status = TaskStatus.accepted;
        task.deadlineHealth = DeadlineHealth.green;
      } else {
        task.status = TaskStatus.rejected;
        if (newRestartDeadline != null) {
          task.deadline = newRestartDeadline;
          task.status = TaskStatus.reissued;
          task.progressPercent = 30; // Reset progress for re-issue
        }
      }
      task.review = TaskReview(
        id: 'rev-${DateTime.now().millisecondsSinceEpoch}',
        taskId: taskId,
        reviewerName: currentUser.name,
        isApproved: accept,
        feedback: feedback,
        newRestartDeadline: newRestartDeadline?.toString().split(' ')[0],
        reviewedAt: DateTime.now(),
      );
      notifyListeners();
    }
  }

  void addChatMessage(String taskId, String message, String? attachmentName) {
    final taskIndex = tasks.indexWhere((t) => t.id == taskId);
    if (taskIndex != -1) {
      tasks[taskIndex].chatMessages.add(
        ChatMessage(
          id: 'msg-${DateTime.now().millisecondsSinceEpoch}',
          senderName: currentUser.name,
          senderRole: currentUser.role.displayName,
          message: message,
          attachmentName: attachmentName,
          timestamp: DateTime.now(),
          isHead: currentUser.role == UserRole.adminHead || currentUser.role == UserRole.superAdmin,
        ),
      );
      tasks[taskIndex].lastActivityAt = DateTime.now();
      tasks[taskIndex].isIdle = false;
      notifyListeners();
    }
  }

  void createNewTask({
    required String title,
    required String description,
    required String assigneeId,
    required String departmentName,
    required PriorityLevel priority,
    required DateTime deadline,
    required List<String> subtaskTitles,
  }) {
    final assignee = sampleUsers.firstWhere((u) => u.id == assigneeId, orElse: () => sampleUsers[3]);
    final newTask = TaskModel(
      id: 'task-${DateTime.now().millisecondsSinceEpoch}',
      taskCode: 'CTU-TAS-${tasks.length + 101}',
      title: title,
      description: description,
      creatorName: currentUser.name,
      assigneeId: assignee.id,
      assigneeName: assignee.name,
      departmentName: departmentName,
      priority: priority,
      status: TaskStatus.assigned,
      deadlineHealth: DeadlineHealth.green,
      progressPercent: 0,
      startDate: DateTime.now(),
      deadline: deadline,
      lastActivityAt: DateTime.now(),
      subtasks: subtaskTitles.map((st) => TaskSubtask(id: 'st-${DateTime.now().millisecondsSinceEpoch}', title: st)).toList(),
      extensions: [],
      chatMessages: [],
    );
    tasks.insert(0, newTask);
    notifyListeners();
  }
}
