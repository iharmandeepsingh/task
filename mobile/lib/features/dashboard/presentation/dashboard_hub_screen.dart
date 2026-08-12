import 'package:flutter/material.dart';
import '../../../../core/models/user_model.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../app/theme/app_theme.dart';
import '../../auth/presentation/login_screen.dart';
import 'faculty_dashboard_screen.dart';
import 'head_dashboard_screen.dart';
import 'hr_dashboard_screen.dart';
import 'super_admin_dashboard_screen.dart';

class DashboardHubScreen extends StatefulWidget {
  const DashboardHubScreen({super.key});

  @override
  State<DashboardHubScreen> createState() => _DashboardHubScreenState();
}

class _DashboardHubScreenState extends State<DashboardHubScreen> {
  final CTUSystemService _service = CTUSystemService.instance;

  @override
  void initState() {
    super.initState();
    _service.addListener(_onServiceUpdate);
  }

  @override
  void dispose() {
    _service.removeListener(_onServiceUpdate);
    super.dispose();
  }

  void _onServiceUpdate() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final user = _service.currentUser;
    final role = _service.currentRole;

    Widget currentDashboard;
    switch (role) {
      case UserRole.faculty:
        currentDashboard = const FacultyDashboardScreen();
        break;
      case UserRole.adminHead:
        currentDashboard = const HeadDashboardScreen();
        break;
      case UserRole.hr:
        currentDashboard = const HRDashboardScreen();
        break;
      case UserRole.superAdmin:
        currentDashboard = const SuperAdminDashboardScreen();
        break;
    }

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CT UNIVERSITY',
              style: const TextStyle(fontSize: 12, letterSpacing: 1.0, color: Colors.white70),
            ),
            Text(
              user.name,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<UserRole>(
            tooltip: 'Switch Demo Role',
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Text(
                    role.displayName,
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  const SizedBox(width: 4),
                  const Icon(Icons.arrow_drop_down, color: Colors.white, size: 18),
                ],
              ),
            ),
            onSelected: (newRole) {
              _service.switchRole(newRole);
            },
            itemBuilder: (context) => UserRole.values.map((r) {
              return PopupMenuItem<UserRole>(
                value: r,
                child: Row(
                  children: [
                    Icon(
                      r == role ? Icons.check_circle_rounded : Icons.circle_outlined,
                      color: r == role ? AppTheme.primaryBlue : Colors.grey,
                      size: 18,
                    ),
                    const SizedBox(width: 10),
                    Text(r.displayName),
                  ],
                ),
              );
            }).toList(),
          ),
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Logout',
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (context) => const LoginScreen()),
              );
            },
          ),
        ],
      ),
      body: currentDashboard,
    );
  }
}
