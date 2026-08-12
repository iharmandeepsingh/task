import 'package:flutter/material.dart';
import '../../../../core/models/task_model.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../core/widgets/deadline_badge.dart';
import '../../../../app/theme/app_theme.dart';
import '../../chat/presentation/task_chat_screen.dart';
import '../../reports/presentation/faculty_report_card_screen.dart';

class FacultyDashboardScreen extends StatefulWidget {
  const FacultyDashboardScreen({super.key});

  @override
  State<FacultyDashboardScreen> createState() => _FacultyDashboardScreenState();
}

class _FacultyDashboardScreenState extends State<FacultyDashboardScreen> {
  final CTUSystemService _service = CTUSystemService.instance;

  void _showExtensionDialog(TaskModel task) {
    final reasonController = TextEditingController();
    DateTime selectedDate = DateTime.now().add(const Duration(days: 7));

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Request Extension'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Task: ${task.title}',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Reason for Extension',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                const Text('Requested Deadline: '),
                TextButton(
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 60)),
                    );
                    if (picked != null) {
                      setState(() {
                        selectedDate = picked;
                      });
                    }
                  },
                  child: Text(selectedDate.toString().split(' ')[0]),
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (reasonController.text.trim().isNotEmpty) {
                _service.requestExtension(task.id, reasonController.text.trim(), selectedDate);
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Extension request submitted to Department Head.')),
                );
              }
            },
            child: const Text('Submit Request'),
          ),
        ],
      ),
    );
  }

  void _showSubmitDialog(TaskModel task) {
    final notesController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Submit Work for Review'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Submit final work for "${task.title}" to Department Head?'),
            const SizedBox(height: 12),
            TextField(
              controller: notesController,
              decoration: const InputDecoration(
                labelText: 'Submission Notes / Link',
                border: OutlineInputBorder(),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              _service.submitTaskForReview(task.id);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Task submitted for Head review!')),
              );
            },
            child: const Text('Submit Work'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = _service.currentUser;
    final myTasks = _service.tasks.where((t) => t.assigneeId == user.id || true).toList(); // Show user tasks

    return ListView(
      padding: const EdgeInsets.all(16.0),
      children: [
        // Role Greeting Banner
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.primaryBlue.withOpacity(0.06),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.15)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: AppTheme.roleFaculty,
                child: Text(user.avatarInitials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Faculty Dashboard (${user.departmentName})',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                    ),
                    const Text(
                      'Box 2 Flowchart: Execute tasks, tick subtasks, request extensions & submit work.',
                      style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.assessment_rounded, color: AppTheme.primaryBlue),
                tooltip: 'My Report Card',
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => FacultyReportCardScreen(faculty: user),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'My Assigned Tasks (${myTasks.length})',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.white,
                foregroundColor: AppTheme.primaryBlue,
                elevation: 1,
                side: const BorderSide(color: AppTheme.primaryBlue),
              ),
              icon: const Icon(Icons.assessment_outlined, size: 16),
              label: const Text('View Report Card', style: TextStyle(fontSize: 12)),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => FacultyReportCardScreen(faculty: user)),
                );
              },
            ),
          ],
        ),
        const SizedBox(height: 12),

        ...myTasks.map((task) => _buildTaskCard(task)),
      ],
    );
  }

  Widget _buildTaskCard(TaskModel task) {
    final pendingExtension = task.extensions.any((e) => e.status == 'PENDING');

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (task.isIdle)
              const Padding(
                padding: EdgeInsets.only(bottom: 10.0),
                child: IdleFlagBanner(),
              ),

            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryBlue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    task.taskCode,
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                  ),
                ),
                const SizedBox(width: 8),
                DeadlineBadge(health: task.deadlineHealth, compact: true),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: task.status.color.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    task.status.label,
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: task.status.color),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            Text(
              task.title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
            ),
            const SizedBox(height: 4),
            Text(
              task.description,
              style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 12),

            // Progress Bar
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: task.progressPercent / 100.0,
                    backgroundColor: const Color(0xFFE2E8F0),
                    color: task.status.color,
                    minHeight: 6,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 10),
                Text(
                  '${task.progressPercent}%',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                ),
              ],
            ),
            const SizedBox(height: 14),

            // Subtasks checklist
            if (task.subtasks.isNotEmpty) ...[
              const Text(
                'Sub-tasks / Stages (Box 2 Flowchart):',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textDark),
              ),
              const SizedBox(height: 6),
              ...task.subtasks.map((st) => CheckboxListTile(
                dense: true,
                contentPadding: EdgeInsets.zero,
                title: Text(st.title, style: TextStyle(fontSize: 13, decoration: st.isCompleted ? TextDecoration.lineThrough : null)),
                value: st.isCompleted,
                onChanged: (val) {
                  if (val != null) {
                    _service.updateSubtask(task.id, st.id, val);
                  }
                },
              )),
              const Divider(),
            ],

            // Re-issued banner if applicable
            if (task.status == TaskStatus.reissued && task.review != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF93C5FD)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.replay_rounded, size: 16, color: Color(0xFF1D4ED8)),
                        SizedBox(width: 6),
                        Text('Task Re-issued by Head', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF1D4ED8))),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text('Feedback: ${task.review!.feedback}', style: const TextStyle(fontSize: 12, color: AppTheme.textDark)),
                    if (task.review!.newRestartDeadline != null)
                      Text('New Restart Deadline: ${task.review!.newRestartDeadline}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                  ],
                ),
              ),
              const SizedBox(height: 12),
            ],

            // Action Row
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chat_bubble_outline_rounded, color: AppTheme.primaryBlue),
                  tooltip: 'Task Chat with Head',
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => TaskChatScreen(task: task)),
                    );
                  },
                ),
                Text(
                  '${task.chatMessages.length}',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue),
                ),
                const Spacer(),

                if (task.status != TaskStatus.accepted && task.status != TaskStatus.submitted) ...[
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      side: BorderSide(color: pendingExtension ? Colors.grey : AppTheme.orangeDeadline),
                    ),
                    icon: Icon(Icons.access_time_rounded, size: 14, color: pendingExtension ? Colors.grey : AppTheme.orangeDeadline),
                    label: Text(
                      pendingExtension ? 'Extension Pending' : 'Request Extension',
                      style: TextStyle(fontSize: 11, color: pendingExtension ? Colors.grey : AppTheme.orangeDeadline),
                    ),
                    onPressed: pendingExtension ? null : () => _showExtensionDialog(task),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      backgroundColor: AppTheme.greenDeadline,
                    ),
                    icon: const Icon(Icons.send_rounded, size: 14),
                    label: const Text('Submit Work', style: TextStyle(fontSize: 11)),
                    onPressed: () => _showSubmitDialog(task),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
