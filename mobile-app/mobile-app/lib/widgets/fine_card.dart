import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/fine.dart';

class FineCard extends StatelessWidget {
  final Fine fine;
  final VoidCallback? onTap;

  const FineCard({super.key, required this.fine, this.onTap});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(symbol: 'LKR ', decimalDigits: 2);
    final dateFormat = DateFormat('dd MMM yyyy, hh:mm a');

    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    fine.referenceNumber,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: Color(0xFF1565C0),
                    ),
                  ),
                  _StatusChip(status: fine.status),
                ],
              ),
              const SizedBox(height: 10),
              _InfoRow(icon: Icons.person_outline, label: fine.driverName),
              const SizedBox(height: 4),
              _InfoRow(icon: Icons.directions_car_outlined, label: fine.vehicleNumber),
              const SizedBox(height: 4),
              _InfoRow(icon: Icons.location_on_outlined, label: fine.location),
              const SizedBox(height: 4),
              _InfoRow(
                icon: Icons.calendar_today_outlined,
                label: dateFormat.format(fine.issuedAt.toLocal()),
              ),
              const Divider(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    fine.category?.name ?? 'Traffic Violation',
                    style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                  ),
                  Text(
                    currencyFormat.format(fine.amount),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: Color(0xFFB71C1C),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoRow({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey.shade500),
        const SizedBox(width: 6),
        Expanded(
          child: Text(label, style: TextStyle(fontSize: 13, color: Colors.grey.shade700)),
        ),
      ],
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final isPaid = status == 'PAID';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isPaid ? Colors.green.shade100 : Colors.orange.shade100,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status,
        style: TextStyle(
          color: isPaid ? Colors.green.shade800 : Colors.orange.shade800,
          fontWeight: FontWeight.w600,
          fontSize: 12,
        ),
      ),
    );
  }
}
