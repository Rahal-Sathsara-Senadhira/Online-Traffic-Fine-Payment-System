import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/constants.dart';
import '../providers/fine_provider.dart';
import '../widgets/custom_button.dart';
import 'receipt_screen.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _selectedMethod = AppConstants.paymentCard;

  Future<void> _pay() async {
    final prov = context.read<FineProvider>();
    final fine = prov.currentFine;
    if (fine == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Confirm Payment'),
        content: Text(
          'You are about to pay LKR ${fine.amount.toStringAsFixed(2)} for fine ${fine.referenceNumber}.\n\nPayment method: ${_methodLabel(_selectedMethod)}',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1565C0)),
            child: const Text('Confirm', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final success = await prov.payFine(
      referenceNumber: fine.referenceNumber,
      categoryId: fine.category?.id ?? '',
      paymentMethod: _selectedMethod,
    );

    if (!mounted) return;
    if (success) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const ReceiptScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(prov.error ?? 'Payment failed. Please try again.'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  String _methodLabel(String method) {
    return method == AppConstants.paymentCard ? 'Credit / Debit Card' : 'Online Banking';
  }

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<FineProvider>();
    final fine = prov.currentFine;
    if (fine == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        title: const Text('Pay Fine'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Amount summary
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFB71C1C), Color(0xFFC62828)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Text(fine.referenceNumber,
                        style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 8),
                    Text(
                      'LKR ${fine.amount.toStringAsFixed(2)}',
                      style: const TextStyle(
                          color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(fine.category?.name ?? 'Traffic Violation',
                        style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              const Text(
                'Select Payment Method',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A237E)),
              ),
              const SizedBox(height: 12),

              _PaymentOption(
                value: AppConstants.paymentCard,
                groupValue: _selectedMethod,
                label: 'Credit / Debit Card',
                subtitle: 'Visa, Mastercard, Amex',
                icon: Icons.credit_card,
                onChanged: (v) => setState(() => _selectedMethod = v!),
              ),
              const SizedBox(height: 8),
              _PaymentOption(
                value: AppConstants.paymentOnlineBanking,
                groupValue: _selectedMethod,
                label: 'Online Banking',
                subtitle: 'Direct bank transfer',
                icon: Icons.account_balance,
                onChanged: (v) => setState(() => _selectedMethod = v!),
              ),

              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.amber.shade300),
                ),
                child: Row(
                  children: [
                    Icon(Icons.lock_outline, color: Colors.amber.shade800, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Your payment is secured and encrypted.',
                        style: TextStyle(color: Colors.amber.shade800, fontSize: 12),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              PrimaryButton(
                label: 'Pay LKR ${fine.amount.toStringAsFixed(2)}',
                onPressed: prov.loading ? null : _pay,
                loading: prov.loading,
                icon: Icons.payment,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final String value;
  final String groupValue;
  final String label;
  final String subtitle;
  final IconData icon;
  final void Function(String?) onChanged;

  const _PaymentOption({
    required this.value,
    required this.groupValue,
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? Colors.blue.shade50 : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: selected ? const Color(0xFF1565C0) : Colors.grey.shade300,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: selected ? const Color(0xFF1565C0) : Colors.grey, size: 28),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: selected ? const Color(0xFF1565C0) : Colors.black87)),
                  Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                ],
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: groupValue,
              onChanged: onChanged,
              activeColor: const Color(0xFF1565C0),
            ),
          ],
        ),
      ),
    );
  }
}
