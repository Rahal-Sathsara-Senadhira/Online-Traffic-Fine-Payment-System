import '../models/payment.dart';
import 'api_service.dart';

class PaymentService {
  final ApiService _api;

  PaymentService(this._api);

  /// Public — no auth required
  Future<Payment> processPayment({
    required String referenceNumber,
    required String categoryId,
    required String paymentMethod, // 'CARD' or 'ONLINE_BANKING'
  }) async {
    final data = await _api.post('/payments', {
      'referenceNumber': referenceNumber,
      'categoryId': categoryId,
      'paymentMethod': paymentMethod,
    });
    return Payment.fromJson(data);
  }

  /// Public — no auth required
  Future<Map<String, dynamic>> getReceipt(String paymentId) async {
    return _api.get('/payments/$paymentId');
  }
}
