import 'package:flutter/material.dart';
import '../../../../core/models/user_model.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../app/theme/app_theme.dart';

class HRDashboardScreen extends StatefulWidget {
  const HRDashboardScreen({super.key});

  @override
  State<HRDashboardScreen> createState() => _HRDashboardScreenState();
}

class _HRDashboardScreenState extends State<HRDashboardScreen> {
  final List<EmployeeUser> employees = List.from(CTUSystemService.sampleUsers);

  void _showBulkImportDialog() {
    String selectedFileName = 'No file selected';
    bool isValidFormat = false;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Bulk Data Upload (HR Module)'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Box 5 Flowchart Rule: Strictly the format asked (e.g. only .xlsx if .xlsx requested).',
                style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
              ),
              const SizedBox(height: 16),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFFCBD5E1)),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.cloud_upload_outlined, size: 36, color: AppTheme.primaryBlue),
                    const SizedBox(height: 8),
                    Text(selectedFileName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        OutlinedButton(
                          onPressed: () {
                            setDialogState(() {
                              selectedFileName = 'faculty_list_2026.xlsx';
                              isValidFormat = true;
                            });
                          },
                          child: const Text('Select .XLSX File'),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          onPressed: () {
                            setDialogState(() {
                              selectedFileName = 'document_invalid.pdf';
                              isValidFormat = false;
                            });
                          },
                          child: const Text('Select .PDF (Invalid)'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              if (selectedFileName != 'No file selected')
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isValidFormat ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      Icon(isValidFormat ? Icons.check_circle : Icons.error, color: isValidFormat ? Colors.green : Colors.red, size: 16),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          isValidFormat ? 'Format valid (.xlsx). Ready for bulk processing.' : 'Error: File format rejected! Strictly .xlsx or .csv allowed.',
                          style: TextStyle(fontSize: 11, color: isValidFormat ? Colors.green.shade800 : Colors.red.shade800, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: isValidFormat
                  ? () {
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Bulk employee import complete! 25 faculty records added.')),
                      );
                    }
                  : null,
              child: const Text('Import Data'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.roleHR,
        icon: const Icon(Icons.file_upload_outlined, color: Colors.white),
        label: const Text('Bulk CSV/XLSX Import', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        onPressed: _showBulkImportDialog,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Header Banner
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.roleHR.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.roleHR.withValues(alpha: 0.2)),
            ),
            child: const Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppTheme.roleHR,
                  child: Icon(Icons.people_alt_rounded, color: Colors.white),
                ),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'HR Lead Dashboard (Peer of Head)',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                      ),
                      Text(
                        'Box 1 & 5 Flowchart: Manage employee directory & execute bulk data import (.xlsx / .csv).',
                        style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          Text(
            'University Employees & Staff (${employees.length})',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 12),

          ...employees.map((emp) => Card(
            margin: const EdgeInsets.only(bottom: 12),
            child: ListTile(
              leading: CircleAvatar(
                backgroundColor: AppTheme.primaryBlue.withValues(alpha: 0.1),
                child: Text(emp.avatarInitials, style: const TextStyle(color: AppTheme.primaryBlue, fontWeight: FontWeight.bold)),
              ),
              title: Text(emp.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              subtitle: Text('${emp.designation} • ${emp.departmentName}\nID: ${emp.employeeId} • Email: ${emp.email}'),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primaryBlue.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(emp.role.displayName, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
              ),
            ),
          )),
        ],
      ),
    );
  }
}
