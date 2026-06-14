class Payment {
  final String paymentId;
  final String referenceNumber;
  final double amount;
  final String transactionReference;
  final DateTime paidAt;
  final String message;

  Payment({
    required this.paymentId,
    required this.referenceNumber,
    required this.amount,
    required this.transactionReference,
    required this.paidAt,
    required this.message,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      paymentId: json['paymentId'] as String,
      referenceNumber: json['referenceNumber'] as String,
      amount: (json['amount'] as num).toDouble(),
      transactionReference: json['transactionReference'] as String,
      paidAt: DateTime.parse(json['paidAt'] as String),
      message: json['message'] as String? ?? 'Payment successful.',
    );
  }

  Map<String, dynamic> toJson() => {
        'paymentId': paymentId,
        'referenceNumber': referenceNumber,
        'amount': amount,
        'transactionReference': transactionReference,
        'paidAt': paidAt.toIso8601String(),
        'message': message,
      };
}
