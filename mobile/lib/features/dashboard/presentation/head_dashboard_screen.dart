import 'package:flutter/material.dart';
import '../../../../core/models/task_model.dart';
import '../../../../core/models/user_model.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../core/widgets/deadline_badge.dart';
import '../../../../app/theme/app_theme.dart';
import '../../chat/presentation/task_chat_screen.dart';

class HeadDashboardScreen extends StatefulWidget {
  const HeadDashboardScreen({super.key});

  @override
  State<HeadDashboardScreen> createState() => _HeadDashboardScreenState();
}

class _HeadDashboardScreenState extends State<HeadDashboardScreen> {
  final CTUSystemService _service = CTUSystemService.instance;

  void _showCreateTaskDialog() {
    final titleController = TextEditingController();
    final descController = TextEditingController();
    final subtaskController = TextEditingController();
    String selectedAssigneeId = CTUSystemService.sampleUsers[3].id;
    PriorityLevel priority = PriorityLevel.medium;
    DateTime selectedDeadline = DateTime.now().add(const Duration(days: 7));

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Create & Assign New Task'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: titleController,
                  decoration: const InputDecoration(labelText: 'Task Title', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descController,
                  decoration: const InputDecoration(labelText: 'Description / Instructions', border: OutlineInputBorder()),
                  maxLines: 2,
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: selectedAssigneeId,
                  decoration: const InputDecoration(labelText: 'Assign to Faculty', border: OutlineInputBorder()),
                  items: CTUSystemService.sampleUsers.where((u) => u.role == UserRole.faculty).map((u) {
                    return DropdownMenuItem(value: u.id, child: Text('${u.name} (${u.departmentName})'));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setDialogState(() => selectedAssigneeId = val);
                  },
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<PriorityLevel>(
                  value: priority,
                  decoration: const InputDecoration(labelText: 'Priority Level', border: OutlineInputBorder()),
                  items: PriorityLevel.values.map((p) {
                    return DropdownMenuItem(value: p, child: Text(p.name.toUpperCase()));
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) setDialogState(() => priority = val);
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: subtaskController,
                  decoration: const InputDecoration(
                    labelText: 'Sub-tasks (Comma separated)',
                    hintText: 'e.g. Gather data, Draft report, Final review',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Text('Deadline: '),
                    TextButton(
                      onPressed: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: selectedDeadline,
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 90)),
                        );
                        if (picked != null) setDialogState(() => selectedDeadline = picked);
                      },
                      child: Text(selectedDeadline.toString().split(' ')[0]),
                    ),
                  ],
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () {
                if (titleController.text.trim().isNotEmpty) {
                  final subtasks = subtaskController.text.split(',').map((s) => s.trim()).where((s) => s.isNotEmpty).toList();
                  _service.createNewTask(
                    title: titleController.text.trim(),
                    description: descController.text.trim(),
                    assigneeId: selectedAssigneeId,
                    departmentName: _service.currentUser.departmentName,
                    priority: priority,
                    deadline: selectedDeadline,
                    subtaskTitles: subtasks.isEmpty ? ['Complete assigned task execution'] : subtasks,
                  );
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task assigned to faculty!')));
                }
              },
              child: const Text('Assign Task'),
            ),
          ],
        ),
      ),
    );
  }

  void _showReviewSubmissionDialog(TaskModel task) {
    final feedbackController = TextEditingController();
    DateTime restartDeadline = DateTime.now().add(const Duration(days: 5));

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: Text('Review Submission - ${task.taskCode}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Faculty: ${task.assigneeName}', style: const TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(task.title, style: const TextStyle(fontSize: 13, color: AppTheme.textMuted)),
              const SizedBox(height: 12),
              TextField(
                controller: feedbackController,
                decoration: const InputDecoration(
                  labelText: 'Feedback / Comments',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text('If Rejecting (Re-issue Deadline): '),
                  TextButton(
                    onPressed: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: restartDeadline,
                        firstDate: DateTime.now(),
                        lastDate: DateTime.now().add(const Duration(days: 60)),
                      );
                      if (picked != null) setDialogState(() => restartDeadline = picked);
                    },
                    child: Text(restartDeadline.toString().split(' ')[0]),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            OutlinedButton(
              style: OutlinedButton.styleFrom(foregroundColor: AppTheme.redDeadline),
              onPressed: () {
                _service.reviewTaskSubmission(
                  task.id,
                  false,
                  feedbackController.text.trim().isEmpty ? 'Needs revision as per department guidelines.' : feedbackController.text.trim(),
                  restartDeadline,
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task Rejected & Re-issued with new timeline.')));
              },
              child: const Text('Reject & Re-issue'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.greenDeadline),
              onPressed: () {
                _service.reviewTaskSubmission(
                  task.id,
                  true,
                  feedbackController.text.trim().isEmpty ? 'Approved. Good job!' : feedbackController.text.trim(),
                  null,
                );
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Task Approved & Closed (Green)!')));
              },
              child: const Text('Accept & Close'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = _service.currentUser;
    final pendingExtensions = _service.tasks.expand((t) => t.extensions).where((e) => e.status == 'PENDING').toList();
    final reviewQueue = _service.tasks.where((t) => t.status == TaskStatus.submitted).toList();

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.primaryBlue,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Create & Assign Task', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: _showCreateTaskDialog,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Header Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.roleHead.withOpacity(0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.roleHead.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.roleHead,
                  child: Text(user.avatarInitials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Department Head Dashboard (${user.departmentName})',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                      ),
                      const Text(
                        'Box 1 & 2 Flowchart: Assign tasks to faculty, review submissions & approve extensions.',
                        style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Submissions Review Queue
          if (reviewQueue.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF3E8FF),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFD8B4FE)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.rate_review_rounded, color: Color(0xFF7E22CE), size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Work Submissions Review Queue (${reviewQueue.length})',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF6B21A8)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ...reviewQueue.map((task) => Card(
                    child: ListTile(
                      title: Text(task.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      subtitle: Text('Faculty: ${task.assigneeName} • ${task.taskCode}'),
                      trailing: ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF7E22CE), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6)),
                        onPressed: () => _showReviewSubmissionDialog(task),
                        child: const Text('Review', style: TextStyle(fontSize: 12)),
                      ),
                    ),
                  )),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          // Extension Requests Queue
          if (pendingExtensions.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.access_time_filled_rounded, color: Color(0xFFB45309), size: 20),
                      const SizedBox(width: 8),
                      Text(
                        'Pending Extension Requests (${pendingExtensions.length})',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF92400E)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  ...pendingExtensions.map((ext) {
                    final task = _service.tasks.firstWhere((t) => t.id == ext.taskId);
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${task.taskCode}: ${task.title}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                            const SizedBox(height: 4),
                            Text('Faculty: ${task.assigneeName}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            Text('Reason: ${ext.reason}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                            Text('Requested Date: ${ext.requestedDeadline.toString().split(' ')[0]}', style: const TextStyle(fontSize: 11, color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                OutlinedButton(
                                  style: OutlinedButton.styleFrom(foregroundColor: AppTheme.redDeadline),
                                  onPressed: () => _service.reviewExtension(task.id, ext.id, false, 'Deadline extension not justified.'),
                                  child: const Text('Reject', style: TextStyle(fontSize: 11)),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(backgroundColor: AppTheme.greenDeadline),
                                  onPressed: () => _service.reviewExtension(task.id, ext.id, true, 'Extension granted.'),
                                  child: const Text('Approve', style: TextStyle(fontSize: 11)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
            const SizedBox(height: 20),
          ],

          Text(
            'Department Tasks (${_service.tasks.length})',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 12),

          ..._service.tasks.map((task) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              title: Text(task.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 4),
                  Text('Assignee: ${task.assigneeName} • Code: ${task.taskCode}'),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      DeadlineBadge(health: task.deadlineHealth, compact: true),
                      const SizedBox(width: 8),
                      Text('Progress: ${task.progressPercent}%', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              trailing: IconButton(
                icon: const Icon(Icons.chat_bubble_outline_rounded, color: AppTheme.primaryBlue),
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (context) => TaskChatScreen(task: task)));
                },
              ),
            ),
          )),
        ],
      ),
    );
  }
}
