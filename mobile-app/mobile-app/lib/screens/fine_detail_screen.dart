import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../providers/fine_provider.dart';
import '../widgets/custom_button.dart';
import 'payment_screen.dart';

class FineDetailScreen extends StatelessWidget {
  const FineDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final fine = context.watch<FineProvider>().currentFine;
    if (fine == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    final currencyFmt = NumberFormat.currency(symbol: 'LKR ', decimalDigits: 2);
    final dateFmt = DateFormat('dd MMMM yyyy, hh:mm a');
    final isPaid = fine.isPaid;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        title: Text(fine.referenceNumber),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Status banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                decoration: BoxDecoration(
                  color: isPaid ? Colors.green.shade600 : const Color(0xFFB71C1C),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      isPaid ? Icons.check_circle_rounded : Icons.warning_rounded,
                      color: Colors.white,
                      size: 28,
                    ),
                    const SizedBox(width: 10),
                    Text(
                      isPaid ? 'Fine Paid' : 'Payment Required',
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Amount card
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Text(
                        'Fine Amount',
                        style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        currencyFmt.format(fine.amount),
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          color: isPaid ? Colors.green.shade700 : const Color(0xFFB71C1C),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Details card
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Fine Details',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A237E)),
                      ),
                      const SizedBox(height: 16),
                      _DetailRow(label: 'Reference Number', value: fine.referenceNumber),
                      _DetailRow(label: 'Violation', value: fine.category?.name ?? 'Traffic Violation'),
                      _DetailRow(label: 'Driver Name', value: fine.driverName),
                      _DetailRow(label: 'NIC Number', value: fine.driverNic),
                      _DetailRow(label: 'Vehicle Number', value: fine.vehicleNumber),
                      _DetailRow(label: 'Location', value: fine.location),
                      _DetailRow(label: 'Issued On', value: dateFmt.format(fine.issuedAt.toLocal())),
                      if (fine.officer != null) ...[
                        _DetailRow(label: 'Issuing Officer', value: fine.officer!.fullName),
                        _DetailRow(label: 'Badge Number', value: fine.officer!.badgeNumber),
                        if (fine.officer!.district != null)
                          _DetailRow(label: 'District', value: fine.officer!.district!),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              if (!isPaid)
                PrimaryButton(
                  label: 'Pay Fine Now',
                  onPressed: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const PaymentScreen()),
                  ),
                  icon: Icons.payment,
                )
              else
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.green.shade300),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.verified, color: Colors.green.shade700),
                      const SizedBox(width: 8),
                      Text(
                        'This fine has been fully paid.',
                        style: TextStyle(color: Colors.green.shade700, fontWeight: FontWeight.w600),
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

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;

  const _DetailRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 140,
            child: Text(label, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}
