import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'fine_lookup_screen.dart';
import 'create_fine_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        title: const Text('Traffic Fine System', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          if (auth.status == AuthStatus.authenticated)
            IconButton(
              icon: const Icon(Icons.logout),
              tooltip: 'Logout',
              onPressed: () async {
                await auth.logout();
                if (context.mounted) {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                }
              },
            ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _WelcomeBanner(auth: auth),
              const SizedBox(height: 32),
              const Text(
                'Quick Actions',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A237E)),
              ),
              const SizedBox(height: 16),
              _ActionCard(
                icon: Icons.search_rounded,
                color: const Color(0xFF1565C0),
                title: 'Look Up Fine',
                subtitle: 'Find a fine by reference number and pay it',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const FineLookupScreen()),
                ),
              ),
              const SizedBox(height: 12),
              if (auth.isOfficer) ...[
                _ActionCard(
                  icon: Icons.add_circle_rounded,
                  color: const Color(0xFF2E7D32),
                  title: 'Issue New Fine',
                  subtitle: 'Record an on-the-spot traffic violation',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const CreateFineScreen()),
                  ),
                ),
                const SizedBox(height: 12),
              ],
              if (auth.status != AuthStatus.authenticated)
                _ActionCard(
                  icon: Icons.admin_panel_settings_rounded,
                  color: const Color(0xFF6A1B9A),
                  title: 'Officer Login',
                  subtitle: 'Sign in to issue and manage fines',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WelcomeBanner extends StatelessWidget {
  final AuthProvider auth;

  const _WelcomeBanner({required this.auth});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1565C0), Color(0xFF0D47A1)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: const Color(0xFF1565C0).withOpacity(0.3), blurRadius: 12, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          const Icon(Icons.local_police_rounded, color: Colors.white, size: 40),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  auth.isAdmin ? 'Welcome, Officer' : 'Traffic Fine Portal',
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  auth.isAdmin
                      ? 'You can issue fines and manage violations'
                      : 'Look up and pay your traffic fines',
                  style: TextStyle(color: Colors.blue.shade100, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 2),
                    Text(subtitle,
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey.shade400),
            ],
          ),
        ),
      ),
    );
  }
}
