import 'package:flutter/material.dart';
import '../../../../core/models/task_model.dart';
import '../../../../core/services/mock_data_service.dart';
import '../../../../app/theme/app_theme.dart';

class TaskChatScreen extends StatefulWidget {
  final TaskModel task;

  const TaskChatScreen({super.key, required this.task});

  @override
  State<TaskChatScreen> createState() => _TaskChatScreenState();
}

class _TaskChatScreenState extends State<TaskChatScreen> {
  final CTUSystemService _service = CTUSystemService.instance;
  final TextEditingController _msgController = TextEditingController();
  String? _attachedFileName;

  @override
  void initState() {
    super.initState();
    _service.addListener(_onUpdate);
  }

  @override
  void dispose() {
    _service.removeListener(_onUpdate);
    _msgController.dispose();
    super.dispose();
  }

  void _onUpdate() {
    if (mounted) setState(() {});
  }

  void _sendMessage() {
    if (_msgController.text.trim().isNotEmpty || _attachedFileName != null) {
      _service.addChatMessage(
        widget.task.id,
        _msgController.text.trim().isEmpty ? 'Uploaded file attachment' : _msgController.text.trim(),
        _attachedFileName,
      );
      _msgController.clear();
      setState(() {
        _attachedFileName = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final task = _service.tasks.firstWhere((t) => t.id == widget.task.id, orElse: () => widget.task);
    final messages = task.chatMessages;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Task Chat: ${task.taskCode}', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
            Text('Head <-> Faculty Communication Channel', style: const TextStyle(fontSize: 11, color: Colors.white70)),
          ],
        ),
      ),
      body: Column(
        children: [
          // Task Info Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: const Color(0xFFF1F5F9),
            child: Row(
              children: [
                const Icon(Icons.forum_outlined, color: AppTheme.primaryBlue, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    task.title,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          // Message Stream
          Expanded(
            child: messages.isEmpty
                ? const Center(
                    child: Text('No chat messages yet. Start a discussion with your Department Head.'),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: messages.length,
                    itemBuilder: (context, index) {
                      final msg = messages[index];
                      final isMe = msg.senderName == _service.currentUser.name;

                      return Align(
                        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(12),
                          constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                          decoration: BoxDecoration(
                            color: isMe ? AppTheme.primaryBlue : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: const Offset(0, 2)),
                            ],
                            border: isMe ? null : Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${msg.senderName} (${msg.senderRole})',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isMe ? Colors.white70 : AppTheme.primaryBlue,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                msg.message,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isMe ? Colors.white : AppTheme.textDark,
                                ),
                              ),
                              if (msg.attachmentName != null) ...[
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: isMe ? Colors.white.withOpacity(0.15) : const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.insert_drive_file_outlined, size: 16, color: isMe ? Colors.white : AppTheme.primaryBlue),
                                      const SizedBox(width: 6),
                                      Text(
                                        msg.attachmentName!,
                                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isMe ? Colors.white : AppTheme.primaryBlue),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // Attachment indicator
          if (_attachedFileName != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              color: const Color(0xFFEFF6FF),
              child: Row(
                children: [
                  const Icon(Icons.attach_file, size: 16, color: AppTheme.primaryBlue),
                  const SizedBox(width: 6),
                  Text('Attached: $_attachedFileName', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.primaryBlue)),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, size: 16),
                    onPressed: () => setState(() => _attachedFileName = null),
                  ),
                ],
              ),
            ),

          // Message Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.attach_file_rounded, color: AppTheme.textMuted),
                  onPressed: () {
                    setState(() {
                      _attachedFileName = 'Faculty_Task_Doc_${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}.pdf';
                    });
                  },
                ),
                Expanded(
                  child: TextField(
                    controller: _msgController,
                    decoration: const InputDecoration(
                      hintText: 'Type task comment or update...',
                      border: InputBorder.none,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send_rounded, color: AppTheme.primaryBlue),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
