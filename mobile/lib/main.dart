import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:habitare/core/router/app_router.dart';
import 'package:habitare/core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: HabitareApp()));
}

class HabitareApp extends ConsumerWidget {
  const HabitareApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'Habitare',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      routerConfig: router,
    );
  }
}
