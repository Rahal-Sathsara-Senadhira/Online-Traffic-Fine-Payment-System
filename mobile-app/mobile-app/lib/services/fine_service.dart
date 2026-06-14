import '../models/fine.dart';
import 'api_service.dart';

class FineService {
  final ApiService _api;

  FineService(this._api);

  /// Public — no auth required
  Future<Fine> getFineByReference(String referenceNumber) async {
    final data = await _api.get('/fines/$referenceNumber');
    return Fine.fromJson(data);
  }

  /// Requires ADMIN JWT
  Future<Fine> createFine({
    required String categoryId,
    required String officerId,
    required String driverNic,
    required String driverName,
    required String vehicleNumber,
    required String location,
    required double amount,
  }) async {
    final data = await _api.post(
      '/fines',
      {
        'categoryId': categoryId,
        'officerId': officerId,
        'driverNic': driverNic,
        'driverName': driverName,
        'vehicleNumber': vehicleNumber,
        'location': location,
        'amount': amount,
      },
      requiresAuth: true,
    );
    return Fine.fromJson(data);
  }

  /// Requires ADMIN JWT; optionally filter by status
  Future<List<Fine>> getAllFines({String? status}) async {
    final path = status != null ? '/fines?status=$status' : '/fines';
    final data = await _api.get(path, requiresAuth: true);
    final raw = data['fines'];
    final list = raw is List ? raw : <dynamic>[];
    return list
        .whereType<Map<String, dynamic>>()
        .map(Fine.fromJson)
        .toList();
  }
}
