import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

enum TaskStatus {
  assigned,
  inProgress,
  submitted,
  underReview,
  accepted,
  rejected,
  reissued,
}

extension TaskStatusExtension on TaskStatus {
  String get label {
    switch (this) {
      case TaskStatus.assigned:
        return 'Assigned';
      case TaskStatus.inProgress:
        return 'In Progress';
      case TaskStatus.submitted:
        return 'Submitted for Review';
      case TaskStatus.underReview:
        return 'Under Review';
      case TaskStatus.accepted:
        return 'Accepted';
      case TaskStatus.rejected:
        return 'Rejected';
      case TaskStatus.reissued:
        return 'Re-issued';
    }
  }

  Color get color {
    switch (this) {
      case TaskStatus.assigned:
        return const Color(0xFF64748B);
      case TaskStatus.inProgress:
        return const Color(0xFF2563EB);
      case TaskStatus.submitted:
        return const Color(0xFF8B5CF6);
      case TaskStatus.underReview:
        return const Color(0xFFD97706);
      case TaskStatus.accepted:
        return const Color(0xFF10B981);
      case TaskStatus.rejected:
        return const Color(0xFFEF4444);
      case TaskStatus.reissued:
        return const Color(0xFF0284C7);
    }
  }
}

enum DeadlineHealth {
  green,  // Finished on time / >7 days
  yellow, // Near deadline (3-7 days)
  orange, // Almost at deadline (<3 days)
  red,    // Overdue / Past deadline
}

extension DeadlineHealthExtension on DeadlineHealth {
  String get label {
    switch (this) {
      case DeadlineHealth.green:
        return 'Green: Finished / On Track';
      case DeadlineHealth.yellow:
        return 'Yellow: Near Deadline';
      case DeadlineHealth.orange:
        return 'Orange: Almost at Deadline';
      case DeadlineHealth.red:
        return 'Red: Past Deadline';
    }
  }

  Color get color {
    switch (this) {
      case DeadlineHealth.green:
        return AppTheme.greenDeadline;
      case DeadlineHealth.yellow:
        return AppTheme.yellowDeadline;
      case DeadlineHealth.orange:
        return AppTheme.orangeDeadline;
      case DeadlineHealth.red:
        return AppTheme.redDeadline;
    }
  }
}

enum PriorityLevel {
  low,
  medium,
  high,
  urgent,
}

class TaskSubtask {
  final String id;
  final String title;
  bool isCompleted;

  TaskSubtask({
    required this.id,
    required this.title,
    this.isCompleted = false,
  });
}

class ExtensionRequest {
  final String id;
  final String taskId;
  final String reason;
  final DateTime requestedDeadline;
  final DateTime currentDeadline;
  String status; // PENDING, APPROVED, REJECTED
  String? decisionReason;

  ExtensionRequest({
    required this.id,
    required this.taskId,
    required this.reason,
    required this.requestedDeadline,
    required this.currentDeadline,
    this.status = 'PENDING',
    this.decisionReason,
  });
}

class TaskReview {
  final String id;
  final String taskId;
  final String reviewerName;
  final bool isApproved;
  final String feedback;
  final String? newRestartDeadline;
  final DateTime reviewedAt;

  TaskReview({
    required this.id,
    required this.taskId,
    required this.reviewerName,
    required this.isApproved,
    required this.feedback,
    this.newRestartDeadline,
    required this.reviewedAt,
  });
}

class ChatMessage {
  final String id;
  final String senderName;
  final String senderRole;
  final String message;
  final String? attachmentName;
  final DateTime timestamp;
  final bool isHead;

  ChatMessage({
    required this.id,
    required this.senderName,
    required this.senderRole,
    required this.message,
    this.attachmentName,
    required this.timestamp,
    required this.isHead,
  });
}

class TaskModel {
  final String id;
  final String taskCode;
  final String title;
  final String description;
  final String creatorName;
  final String assigneeId;
  final String assigneeName;
  final String departmentName;
  PriorityLevel priority;
  TaskStatus status;
  DeadlineHealth deadlineHealth;
  int progressPercent;
  DateTime startDate;
  DateTime deadline;
  DateTime lastActivityAt;
  bool isIdle;
  bool isReminderActive;
  List<TaskSubtask> subtasks;
  List<ExtensionRequest> extensions;
  List<ChatMessage> chatMessages;
  TaskReview? review;

  TaskModel({
    required this.id,
    required this.taskCode,
    required this.title,
    required this.description,
    required this.creatorName,
    required this.assigneeId,
    required this.assigneeName,
    required this.departmentName,
    required this.priority,
    required this.status,
    required this.deadlineHealth,
    required this.progressPercent,
    required this.startDate,
    required this.deadline,
    required this.lastActivityAt,
    this.isIdle = false,
    this.isReminderActive = false,
    required this.subtasks,
    required this.extensions,
    required this.chatMessages,
    this.review,
  });
}
