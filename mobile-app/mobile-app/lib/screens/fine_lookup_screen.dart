import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/fine_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import 'fine_detail_screen.dart';

class FineLookupScreen extends StatefulWidget {
  const FineLookupScreen({super.key});

  @override
  State<FineLookupScreen> createState() => _FineLookupScreenState();
}

class _FineLookupScreenState extends State<FineLookupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _refCtrl = TextEditingController();

  @override
  void dispose() {
    _refCtrl.dispose();
    super.dispose();
  }

  Future<void> _lookup() async {
    if (!_formKey.currentState!.validate()) return;
    final prov = context.read<FineProvider>();
    final success = await prov.lookupFine(_refCtrl.text);
    if (!mounted) return;
    if (success && prov.currentFine != null) {
      Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => const FineDetailScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(prov.error ?? 'Fine not found'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<FineProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        title: const Text('Find Your Fine'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue.shade700),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Enter the reference number printed on your fine notice (e.g. TF-2026-123456)',
                        style: TextStyle(color: Colors.blue.shade700, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'Fine Reference Number',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A237E)),
              ),
              const SizedBox(height: 12),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    CustomTextField(
                      controller: _refCtrl,
                      label: 'Reference Number',
                      hint: 'TF-2026-XXXXXX',
                      prefixIcon: Icons.receipt_long_outlined,
                      keyboardType: TextInputType.text,
                      validator: (v) {
                        if (v == null || v.trim().isEmpty) return 'Reference number is required';
                        if (!RegExp(r'^TF-\d{4}-\d+$').hasMatch(v.trim().toUpperCase())) {
                          return 'Invalid format. Use TF-YYYY-XXXXXX';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    PrimaryButton(
                      label: 'Search Fine',
                      onPressed: _lookup,
                      loading: prov.loading,
                      icon: Icons.search,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              Center(
                child: Column(
                  children: [
                    Icon(Icons.receipt_long, size: 64, color: Colors.grey.shade300),
                    const SizedBox(height: 12),
                    Text(
                      'Your fine details will appear here',
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
