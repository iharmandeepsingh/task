import 'package:flutter/material.dart';
import '../../../../core/models/user_model.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../app/theme/app_theme.dart';
import '../../dashboard/presentation/dashboard_hub_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final CTUSystemService _service = CTUSystemService.instance;

  void _loginAsRole(UserRole role) {
    _service.switchRole(role);
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (context) => const DashboardHubScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primaryBlue,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 15,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.school_rounded,
                    size: 50,
                    color: AppTheme.primaryBlue,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'CT UNIVERSITY',
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Task Assignment & Faculty Workflow System',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withOpacity(0.8),
                  ),
                ),
                const SizedBox(height: 40),
                Card(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Select Demo User Role to Access:',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textDark,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...UserRole.values.map((role) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                side: const BorderSide(color: Color(0xFFCBD5E1)),
                              ),
                              onPressed: () => _loginAsRole(role),
                              child: Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: _getRoleColor(role).withOpacity(0.15),
                                    child: Icon(_getRoleIcon(role), color: _getRoleColor(role), size: 20),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          role.displayName,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.textDark,
                                          ),
                                        ),
                                        Text(
                                          role.description,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            color: AppTheme.textMuted,
                                          ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppTheme.textMuted),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getRoleColor(UserRole role) {
    switch (role) {
      case UserRole.superAdmin:
        return AppTheme.roleSuperAdmin;
      case UserRole.adminHead:
        return AppTheme.roleHead;
      case UserRole.hr:
        return AppTheme.roleHR;
      case UserRole.faculty:
        return AppTheme.roleFaculty;
    }
  }

  IconData _getRoleIcon(UserRole role) {
    switch (role) {
      case UserRole.superAdmin:
        return Icons.admin_panel_settings_rounded;
      case UserRole.adminHead:
        return Icons.supervisor_account_rounded;
      case UserRole.hr:
        return Icons.people_alt_rounded;
      case UserRole.faculty:
        return Icons.person_rounded;
    }
  }
}
