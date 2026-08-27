import 'package:flutter/material.dart';
import '../../../../app/theme/app_theme.dart';

class EmployeeImportScreen extends StatefulWidget {
  const EmployeeImportScreen({super.key});

  @override
  State<EmployeeImportScreen> createState() => _EmployeeImportScreenState();
}

class _EmployeeImportScreenState extends State<EmployeeImportScreen> {
  String _selectedFileName = 'No file selected';
  bool _isParsed = false;
  final int _validRows = 180;
  final int _warningRows = 4;
  final int _errorRows = 0;
  final int _duplicateRows = 0;

  void _simulateUpload(String fileName) {
    setState(() {
      _selectedFileName = fileName;
      _isParsed = true;
    });
  }

  void _confirmImport() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirm Employee Batch Import'),
        content: Text(
          'Confirm batch import of $_validRows valid employee records from "$_selectedFileName"?\n\nNote: Excel sheet names and designations will NOT grant application roles automatically.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryBlue),
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Import complete! $_validRows employee master records staged/imported.')),
              );
            },
            child: const Text('Execute Batch Import'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HR Employee Data Import'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Security Banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFEFF6FF),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF93C5FD)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.shield_outlined, color: AppTheme.primaryBlue, size: 18),
                    SizedBox(width: 6),
                    Text('Enterprise Security & Non-Derivation Policy', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryBlue)),
                  ],
                ),
                SizedBox(height: 6),
                Text(
                  '• Sheet names ("Updated Faculty", "Admin") do NOT grant application roles.\n• Designations (HOD, Dean, HR) describe employment ONLY.\n• Imported employees are created with accountStatus: NOT_CREATED. Account provisioning is a separate controlled action.',
                  style: TextStyle(fontSize: 11, color: AppTheme.textDark),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Upload Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  const Icon(Icons.cloud_upload_outlined, size: 40, color: AppTheme.primaryBlue),
                  const SizedBox(height: 8),
                  Text(_selectedFileName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 4),
                  const Text('Supported Formats: .xlsx, .csv (Max 10MB)', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                  const SizedBox(height: 14),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      OutlinedButton.icon(
                        icon: const Icon(Icons.table_chart, size: 16),
                        label: const Text('Select Faculty Excel (.xlsx)'),
                        onPressed: () => _simulateUpload('Updated_Faculty_2026.xlsx'),
                      ),
                      const SizedBox(width: 8),
                      OutlinedButton.icon(
                        icon: const Icon(Icons.description, size: 16),
                        label: const Text('Select Admin Excel (.xlsx)'),
                        onPressed: () => _simulateUpload('Admin_Employees_2026.xlsx'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          if (_isParsed) ...[
            const SizedBox(height: 20),
            const Text('Import Staging & Validation Preview', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 10),

            // Metrics Summary Grid
            Row(
              children: [
                Expanded(child: _buildSummaryBox('Valid Rows', '$_validRows', AppTheme.greenDeadline)),
                const SizedBox(width: 8),
                Expanded(child: _buildSummaryBox('Warnings', '$_warningRows', AppTheme.yellowDeadline)),
                const SizedBox(width: 8),
                Expanded(child: _buildSummaryBox('Errors', '$_errorRows', AppTheme.redDeadline)),
                const SizedBox(width: 8),
                Expanded(child: _buildSummaryBox('Duplicates', '$_duplicateRows', AppTheme.orangeDeadline)),
              ],
            ),
            const SizedBox(height: 16),

            // Staging Table Preview Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Staging Preview (Page 1 of 4)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const Divider(),
                    _buildPreviewRow('1', 'CTU-EMP-301', 'Dr. Harmanpreet Singh', 'harman@ctu.edu.in', 'VALID'),
                    _buildPreviewRow('2', 'CTU-EMP-302', 'Prof. Ananya Sharma', 'ananya@ctu.edu.in', 'VALID'),
                    _buildPreviewRow('3', 'CTU-EMP-303', 'Dr. Rajesh Kumar', 'rajesh/personal@ctu.edu.in', 'WARNING (Multiple emails parsed)'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryBlue,
                padding: const EdgeInsets.all(16),
              ),
              icon: const Icon(Icons.check_circle_outline),
              label: const Text('Confirm & Execute Batch Import', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
              onPressed: _confirmImport,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSummaryBox(String label, String count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Text(count, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textMuted)),
        ],
      ),
    );
  }

  Widget _buildPreviewRow(String num, String id, String name, String email, String status) {
    final isWarning = status.startsWith('WARNING');
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text('#$num', style: const TextStyle(fontSize: 11, color: AppTheme.textMuted)),
          const SizedBox(width: 8),
          Text(id, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(width: 8),
          Expanded(child: Text(name, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: isWarning ? AppTheme.yellowDeadline.withValues(alpha: 0.15) : AppTheme.greenDeadline.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              status,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isWarning ? AppTheme.yellowDeadline : AppTheme.greenDeadline),
            ),
          ),
        ],
      ),
    );
  }
}
