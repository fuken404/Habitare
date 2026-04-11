import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:habitare/core/theme/app_colors.dart';
import 'package:habitare/core/theme/app_text_styles.dart';

/// Escanea un QR de autorización Habitare y devuelve el authorization_id
/// (UUID en minúsculas) al hacer pop.
///
/// Formato esperado: HAB-{6digits}-{uuid}
class SecurityQrScannerScreen extends StatefulWidget {
  const SecurityQrScannerScreen({super.key});

  @override
  State<SecurityQrScannerScreen> createState() =>
      _SecurityQrScannerScreenState();
}

class _SecurityQrScannerScreenState extends State<SecurityQrScannerScreen> {
  final MobileScannerController _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
  );
  bool _detected = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (_detected) return;
    final raw = capture.barcodes.firstOrNull?.rawValue;
    if (raw == null) return;

    final id = _parseAuthId(raw);
    if (id == null) {
      _showError('QR no reconocido. Asegúrate de escanear un código Habitare.');
      return;
    }

    setState(() => _detected = true);
    _controller.stop();
    Navigator.of(context).pop(id);
  }

  /// Extrae el UUID de `HAB-XXXXXX-{uuid}`.
  /// Devuelve null si el formato no coincide.
  String? _parseAuthId(String raw) {
    final parts = raw.split('-');
    // Mínimo 7 partes: HAB + 6digits + 5 partes del UUID
    if (parts.length < 7 || parts[0] != 'HAB') return null;
    // UUID = partes [2..6] unidas con '-'
    return parts.sublist(2).join('-').toLowerCase();
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: AppColors.dangerText,
        duration: const Duration(seconds: 3),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    final viewfinderSize = size.width * 0.65;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: Text('Escanear QR', style: AppTextStyles.heading2.copyWith(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on_rounded),
            onPressed: () => _controller.toggleTorch(),
            tooltip: 'Linterna',
          ),
        ],
      ),
      body: Stack(
        children: [
          // ── Cámara ─────────────────────────────────────────────────────────
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),

          // ── Overlay oscuro con ventana central ─────────────────────────────
          _ScannerOverlay(viewfinderSize: viewfinderSize),

          // ── Instrucción ────────────────────────────────────────────────────
          Positioned(
            bottom: 80,
            left: 0,
            right: 0,
            child: Column(
              children: [
                const Icon(Icons.qr_code_scanner_rounded,
                    size: 28, color: Colors.white70),
                const SizedBox(height: 10),
                Text(
                  'Apunta al código QR del visitante',
                  style: AppTextStyles.bodyMedium
                      .copyWith(color: Colors.white70),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Overlay con ventana recortada ─────────────────────────────────────────────

class _ScannerOverlay extends StatelessWidget {
  const _ScannerOverlay({required this.viewfinderSize});
  final double viewfinderSize;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.infinite,
      painter: _OverlayPainter(viewfinderSize: viewfinderSize),
      child: SizedBox.expand(
        child: Center(
          child: SizedBox(
            width: viewfinderSize,
            height: viewfinderSize,
            child: Stack(
              children: [
                // Esquinas del visor
                ..._corners(viewfinderSize),
              ],
            ),
          ),
        ),
      ),
    );
  }

  List<Widget> _corners(double s) {
    const r = 16.0;
    const t = 3.5;
    const l = 28.0;
    const c = AppColors.primary;

    return [
      // Top-left
      Positioned(top: 0, left: 0, child: _Corner(r: r, t: t, l: l, color: c, top: true, left: true)),
      // Top-right
      Positioned(top: 0, right: 0, child: _Corner(r: r, t: t, l: l, color: c, top: true, left: false)),
      // Bottom-left
      Positioned(bottom: 0, left: 0, child: _Corner(r: r, t: t, l: l, color: c, top: false, left: true)),
      // Bottom-right
      Positioned(bottom: 0, right: 0, child: _Corner(r: r, t: t, l: l, color: c, top: false, left: false)),
    ];
  }
}

class _Corner extends StatelessWidget {
  const _Corner({
    required this.r,
    required this.t,
    required this.l,
    required this.color,
    required this.top,
    required this.left,
  });
  final double r, t, l;
  final Color color;
  final bool top, left;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(l + r, l + r),
      painter: _CornerPainter(r: r, t: t, l: l, color: color, top: top, left: left),
    );
  }
}

class _CornerPainter extends CustomPainter {
  _CornerPainter({
    required this.r,
    required this.t,
    required this.l,
    required this.color,
    required this.top,
    required this.left,
  });
  final double r, t, l;
  final Color color;
  final bool top, left;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = t
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final path = Path();
    final sx = left ? 0.0 : size.width;
    final sy = top ? 0.0 : size.height;
    final dx = left ? 1.0 : -1.0;
    final dy = top ? 1.0 : -1.0;

    path.moveTo(sx + dx * l, sy);
    path.lineTo(sx + dx * r, sy);
    path.arcToPoint(
      Offset(sx, sy + dy * r),
      radius: Radius.circular(r),
      clockwise: left == top,
    );
    path.lineTo(sx, sy + dy * l);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _OverlayPainter extends CustomPainter {
  _OverlayPainter({required this.viewfinderSize});
  final double viewfinderSize;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.black.withOpacity(0.6);

    final cx = size.width / 2;
    final cy = size.height / 2;
    final half = viewfinderSize / 2;

    final outer = Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    final inner = Path()
      ..addRRect(RRect.fromRectAndRadius(
        Rect.fromLTRB(cx - half, cy - half, cx + half, cy + half),
        const Radius.circular(12),
      ));

    canvas.drawPath(
      Path.combine(PathOperation.difference, outer, inner),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
