import 'fine_category.dart';
import 'officer.dart';

class Fine {
  final String id;
  final String referenceNumber;
  final String driverNic;
  final String driverName;
  final String vehicleNumber;
  final String location;
  final double amount;
  final String status; // PENDING or PAID
  final FineCategory? category;
  final Officer? officer;
  final DateTime issuedAt;

  Fine({
    required this.id,
    required this.referenceNumber,
    required this.driverNic,
    required this.driverName,
    required this.vehicleNumber,
    required this.location,
    required this.amount,
    required this.status,
    this.category,
    this.officer,
    required this.issuedAt,
  });

  bool get isPaid => status == 'PAID';
  bool get isPending => status == 'PENDING';

  factory Fine.fromJson(Map<String, dynamic> json) {
    return Fine(
      id: json['id'] as String,
      referenceNumber: json['reference_number'] as String,
      driverNic: json['driver_nic'] as String,
      driverName: json['driver_name'] as String,
      vehicleNumber: json['vehicle_number'] as String,
      location: json['location'] as String,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
      category: json['category'] != null
          ? FineCategory.fromJson(json['category'] as Map<String, dynamic>)
          : null,
      officer: json['officer'] != null
          ? Officer.fromJson(json['officer'] as Map<String, dynamic>)
          : null,
      issuedAt: DateTime.parse(json['issued_at'] as String),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'reference_number': referenceNumber,
        'driver_nic': driverNic,
        'driver_name': driverName,
        'vehicle_number': vehicleNumber,
        'location': location,
        'amount': amount,
        'status': status,
        'category': category?.toJson(),
        'officer': officer?.toJson(),
        'issued_at': issuedAt.toIso8601String(),
      };
}
