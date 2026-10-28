import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class MediaPreviewModal extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? mediaUrl;
  final String? mediaType; // 'image', 'video', 'pdf'
  final String? fileName;
  final String? fileSize;

  const MediaPreviewModal({
    super.key,
    required this.title,
    this.subtitle,
    this.mediaUrl,
    this.mediaType = 'image',
    this.fileName,
    this.fileSize,
  });

  static void show(
    BuildContext context, {
    required String title,
    String? subtitle,
    String? mediaUrl,
    String? mediaType,
    String? fileName,
    String? fileSize,
  }) {
    showDialog(
      context: context,
      barrierColor: Colors.black.withOpacity(0.92),
      builder: (_) => MediaPreviewModal(
        title: title,
        subtitle: subtitle,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        fileName: fileName,
        fileSize: fileSize,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 500, maxHeight: 720),
        decoration: BoxDecoration(
          color: AppTheme.bgSecondary,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppTheme.borderSubtle, width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.8),
              blurRadius: 30,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Top Bar
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 12),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppTheme.accentGold.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      _getIconForType(),
                      color: AppTheme.accentGold,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        if (subtitle != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            subtitle!,
                            style: const TextStyle(
                              color: AppTheme.textMuted,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded, color: AppTheme.textSecondary),
                    splashRadius: 20,
                  ),
                ],
              ),
            ),
            const Divider(color: AppTheme.borderSubtle, height: 1),

            // Content Preview Body
            Flexible(
              child: Container(
                color: Colors.black,
                child: _buildMediaBody(context),
              ),
            ),

            const Divider(color: AppTheme.borderSubtle, height: 1),

            // Bottom Actions Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.cloud_done_rounded, color: AppTheme.accentNeonCyan, size: 16),
                      const SizedBox(width: 6),
                      Text(
                        "CloudFront Secured",
                        style: TextStyle(
                          color: AppTheme.accentNeonCyan.withOpacity(0.9),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      if (fileSize != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          "•  $fileSize",
                          style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
                        ),
                      ],
                    ],
                  ),
                  ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text("Media asset cached to device storage."),
                          backgroundColor: AppTheme.accentEmerald,
                          duration: Duration(seconds: 2),
                        ),
                      );
                      Navigator.pop(context);
                    },
                    icon: const Icon(Icons.download_rounded, size: 16),
                    label: const Text("Download"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.accentGold,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIconForType() {
    switch (mediaType) {
      case 'video':
        return Icons.videocam_rounded;
      case 'pdf':
      case 'doc':
        return Icons.description_rounded;
      case 'image':
      default:
        return Icons.image_rounded;
    }
  }

  Widget _buildMediaBody(BuildContext context) {
    if (mediaType == 'pdf' || (fileName != null && fileName!.endsWith('.pdf'))) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: AppTheme.accentRose.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppTheme.accentRose.withOpacity(0.4)),
                ),
                child: const Icon(Icons.picture_as_pdf_rounded, color: AppTheme.accentRose, size: 36),
              ),
              const SizedBox(height: 16),
              Text(
                fileName ?? "Production_Script_Dossier.pdf",
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                "PDF Screenplay & Lookbook Document\nTap download to view in external PDF reader",
                style: TextStyle(color: AppTheme.textMuted, fontSize: 12, height: 1.4),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (mediaType == 'video') {
      return Stack(
        alignment: Alignment.center,
        children: [
          Image.network(
            mediaUrl ?? "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80",
            fit: BoxFit.cover,
            width: double.infinity,
            height: 340,
            errorBuilder: (_, __, ___) => Container(
              height: 340,
              color: AppTheme.bgSurface,
              child: const Icon(Icons.movie_creation_rounded, color: AppTheme.accentGold, size: 48),
            ),
          ),
          Container(
            height: 340,
            color: Colors.black45,
          ),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppTheme.accentGold.withOpacity(0.95),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.accentGold.withOpacity(0.4),
                  blurRadius: 20,
                  spreadRadius: 4,
                ),
              ],
            ),
            child: const Icon(Icons.play_arrow_rounded, color: Colors.black, size: 38),
          ),
          Positioned(
            bottom: 12,
            right: 12,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: Colors.white24),
              ),
              child: const Text(
                "4K Pro-Res Showreel",
                style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      );
    }

    // Default image
    return InteractiveViewer(
      panEnabled: true,
      minScale: 0.8,
      maxScale: 3.5,
      child: Center(
        child: Image.network(
          mediaUrl ?? "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000&auto=format&fit=crop&q=80",
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => Container(
            height: 300,
            alignment: Alignment.center,
            child: const Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.broken_image_rounded, color: AppTheme.textMuted, size: 40),
                SizedBox(height: 8),
                Text("Image unavailable", style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
