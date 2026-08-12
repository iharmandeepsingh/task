import 'package:flutter/material.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../app/theme/app_theme.dart';
import 'faculty_dashboard_screen.dart';
import 'head_dashboard_screen.dart';
import 'hr_dashboard_screen.dart';

class SuperAdminDashboardScreen extends StatefulWidget {
  const SuperAdminDashboardScreen({super.key});

  @override
  State<SuperAdminDashboardScreen> createState() => _SuperAdminDashboardScreenState();
}

class _SuperAdminDashboardScreenState extends State<SuperAdminDashboardScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final CTUSystemService _service = CTUSystemService.instance;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Super Admin Global Control Header
        Container(
          padding: const EdgeInsets.all(16),
          color: AppTheme.roleSuperAdmin.withOpacity(0.1),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const CircleAvatar(
                    backgroundColor: AppTheme.roleSuperAdmin,
                    child: Icon(Icons.shield_rounded, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Super Admin Master Console',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                        ),
                        Text(
                          'Box 1 Flowchart: Full control over all dashboards. Grants permissions & overrides requests.',
                          style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.roleSuperAdmin,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    ),
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Super Admin override executed across all departments.')),
                      );
                    },
                    child: const Text('Global Override', style: TextStyle(fontSize: 11)),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              TabBar(
                controller: _tabController,
                labelColor: AppTheme.roleSuperAdmin,
                unselectedLabelColor: AppTheme.textMuted,
                indicatorColor: AppTheme.roleSuperAdmin,
                isScrollable: true,
                tabs: const [
                  Tab(text: 'University Overview'),
                  Tab(text: 'Head / Dept View'),
                  Tab(text: 'Faculty Tasks'),
                  Tab(text: 'HR Directory'),
                ],
              ),
            ],
          ),
        ),

        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildUniversityMetricsView(),
              const HeadDashboardScreen(),
              const FacultyDashboardScreen(),
              const HRDashboardScreen(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUniversityMetricsView() {
    final tasks = _service.tasks;
    final total = tasks.length;
    final inProgress = tasks.where((t) => t.status == TaskStatus.inProgress || t.status == TaskStatus.assigned).length;
    final completed = tasks.where((t) => t.status == TaskStatus.accepted).length;
    final idleCount = tasks.where((t) => t.isIdle).length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('University-Wide Task Statistics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildMetricTile('Total Tasks', '$total', AppTheme.primaryBlue, Icons.assignment)),
            const SizedBox(width: 10),
            Expanded(child: _buildMetricTile('Active', '$inProgress', Colors.blue, Icons.run_circle_outlined)),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _buildMetricTile('Completed', '$completed', AppTheme.greenDeadline, Icons.check_circle_outline)),
            const SizedBox(width: 10),
            Expanded(child: _buildMetricTile('Idle Flags (3-5d)', '$idleCount', AppTheme.redDeadline, Icons.warning_amber_rounded)),
          ],
        ),
        const SizedBox(height: 24),
        const Text('Department Workload Index', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        Card(
          child: ListTile(
            title: const Text('Computer Science & Engineering', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('Faculty: 18 • Active Tasks: 12 • Completed: 45'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.greenDeadline.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
              child: const Text('92% Health', style: TextStyle(color: AppTheme.greenDeadline, fontWeight: FontWeight.bold, fontSize: 11)),
            ),
          ),
        ),
        Card(
          child: ListTile(
            title: const Text('School of Law', style: TextStyle(fontWeight: FontWeight.bold)),
            subtitle: const Text('Faculty: 12 • Active Tasks: 8 • Completed: 30'),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: AppTheme.yellowDeadline.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
              child: const Text('85% Health', style: TextStyle(color: AppTheme.yellowDeadline, fontWeight: FontWeight.bold, fontSize: 11)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMetricTile(String title, String count, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 10),
          Text(count, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
          Text(title, style: const TextStyle(fontSize: 12, color: AppTheme.textMuted)),
        ],
      ),
    );
  }
}
