import 'package:flutter/material.dart';
import '../models/task_model.dart';

class DeadlineBadge extends StatelessWidget {
  final DeadlineHealth health;
  final bool compact;

  const DeadlineBadge({
    super.key,
    required this.health,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    String text;
    IconData icon;

    switch (health) {
      case DeadlineHealth.green:
        text = compact ? 'Green' : 'Green: Finished / On Track';
        icon = Icons.check_circle_outline;
        break;
      case DeadlineHealth.yellow:
        text = compact ? 'Yellow' : 'Yellow: Near Deadline (3-7d)';
        icon = Icons.access_time;
        break;
      case DeadlineHealth.orange:
        text = compact ? 'Orange' : 'Orange: Almost at Deadline (<3d)';
        icon = Icons.warning_amber_rounded;
        break;
      case DeadlineHealth.red:
        text = compact ? 'Red' : 'Red: Past Deadline (Overdue)';
        icon = Icons.error_outline;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: health.color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: health.color.withValues(alpha: 0.4), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: compact ? 12 : 14, color: health.color),
          const SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(
              color: health.color,
              fontSize: compact ? 11 : 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class IdleFlagBanner extends StatelessWidget {
  const IdleFlagBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFFCA5A5)),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.report_problem_outlined, size: 14, color: Color(0xFFDC2626)),
          SizedBox(width: 6),
          Text(
            '⚠️ Idle Flag: No update for 3-5 days',
            style: TextStyle(
              color: Color(0xFF991B1B),
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
