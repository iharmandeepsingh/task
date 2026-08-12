import 'package:flutter/material.dart';
import '../../../../core/models/user_model.dart';
import '../../../../core/models/task_model.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../app/theme/app_theme.dart';

class FacultyReportCardScreen extends StatefulWidget {
  final EmployeeUser faculty;

  const FacultyReportCardScreen({super.key, required this.faculty});

  @override
  State<FacultyReportCardScreen> createState() => _FacultyReportCardScreenState();
}

class _FacultyReportCardScreenState extends State<FacultyReportCardScreen> {
  final CTUSystemService _service = CTUSystemService.instance;
  DateTimeRange _dateRange = DateTimeRange(
    start: DateTime.now().subtract(const Duration(days: 30)),
    end: DateTime.now().add(const Duration(days: 30)),
  );

  void _exportReport(String format) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Export Faculty Report ($format)'),
        content: Text(
          'Box 5 Flowchart Rule: Exporting official Report Card for ${widget.faculty.name} strictly as $format file.',
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Report Card exported successfully as ${widget.faculty.name}_Report.$format!')),
              );
            },
            child: const Text('Download File'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final tasks = _service.tasks.where((t) => t.assigneeId == widget.faculty.id || true).toList();
    final assignedCount = tasks.length;
    final completedCount = tasks.where((t) => t.status == TaskStatus.accepted).length;
    final pendingCount = tasks.where((t) => t.status != TaskStatus.accepted).length;
    final extensionsCount = tasks.expand((t) => t.extensions).length;

    return Scaffold(
      appBar: AppBar(
        title: Text('Faculty Report Card: ${widget.faculty.name}'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Faculty Info Header Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: AppTheme.primaryBlue,
                        child: Text(widget.faculty.avatarInitials, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.faculty.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                            Text('${widget.faculty.designation} • ${widget.faculty.departmentName}', style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
                            Text('Employee ID: ${widget.faculty.employeeId}', style: const TextStyle(fontSize: 11, color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),

                  // Date Filter Picker
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Filter Date Range:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      OutlinedButton.icon(
                        icon: const Icon(Icons.date_range, size: 14),
                        label: Text(
                          '${_dateRange.start.toString().split(' ')[0]} - ${_dateRange.end.toString().split(' ')[0]}',
                          style: const TextStyle(fontSize: 11),
                        ),
                        onPressed: () async {
                          final picked = await showDateRangePicker(
                            context: context,
                            firstDate: DateTime.now().subtract(const Duration(days: 365)),
                            lastDate: DateTime.now().add(const Duration(days: 365)),
                            initialDateRange: _dateRange,
                          );
                          if (picked != null) {
                            setState(() => _dateRange = picked);
                          }
                        },
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Flowchart Metrics Grid
          const Text('Performance & Task Metrics (Box 5 Flowchart):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(child: _buildMetricCard('Assigned Tasks', '$assignedCount', AppTheme.primaryBlue, Icons.assignment_outlined)),
              const SizedBox(width: 10),
              Expanded(child: _buildMetricCard('Pending Tasks', '$pendingCount', AppTheme.yellowDeadline, Icons.hourglass_top_rounded)),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            children: [
              Expanded(child: _buildMetricCard('Completed', '$completedCount', AppTheme.greenDeadline, Icons.check_circle_outline)),
              const SizedBox(width: 10),
              Expanded(child: _buildMetricCard('Extensions Taken', '$extensionsCount', AppTheme.orangeDeadline, Icons.access_time_rounded)),
            ],
          ),
          const SizedBox(height: 24),

          // Export Section (Box 5: Export as Excel or PDF only)
          Card(
            color: const Color(0xFFF8FAFC),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Export Official Report Card', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 4),
                  const Text(
                    'Strict export formats per university guidelines: Excel (.xlsx) or PDF (.pdf) only.',
                    style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                  ),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF16A34A)),
                          icon: const Icon(Icons.table_chart_outlined, size: 18),
                          label: const Text('Export Excel (.xlsx)'),
                          onPressed: () => _exportReport('Excel (.xlsx)'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFDC2626)),
                          icon: const Icon(Icons.picture_as_pdf_outlined, size: 18),
                          label: const Text('Export PDF (.pdf)'),
                          onPressed: () => _exportReport('PDF (.pdf)'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
              Icon(icon, color: color, size: 18),
            ],
          ),
          const SizedBox(height: 6),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
