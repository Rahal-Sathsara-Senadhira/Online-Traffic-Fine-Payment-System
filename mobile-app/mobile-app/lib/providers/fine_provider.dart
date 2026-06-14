import 'package:flutter/foundation.dart';
import '../models/fine.dart';
import '../models/payment.dart';
import '../services/fine_service.dart';
import '../services/payment_service.dart';
import '../services/api_service.dart';

class FineProvider extends ChangeNotifier {
  final FineService _fineService;
  final PaymentService _paymentService;

  Fine? _currentFine;
  Payment? _lastPayment;
  List<Fine> _allFines = [];
  bool _loading = false;
  String? _error;

  FineProvider()
      : _fineService = FineService(ApiService()),
        _paymentService = PaymentService(ApiService());

  Fine? get currentFine => _currentFine;
  Payment? get lastPayment => _lastPayment;
  List<Fine> get allFines => _allFines;
  bool get loading => _loading;
  String? get error => _error;

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clearCurrentFine() {
    _currentFine = null;
    _lastPayment = null;
    notifyListeners();
  }

  Future<bool> lookupFine(String referenceNumber) async {
    _loading = true;
    _error = null;
    _currentFine = null;
    notifyListeners();

    try {
      _currentFine = await _fineService.getFineByReference(referenceNumber.trim().toUpperCase());
      _loading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> payFine({
    required String referenceNumber,
    required String categoryId,
    required String paymentMethod,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _lastPayment = await _paymentService.processPayment(
        referenceNumber: referenceNumber,
        categoryId: categoryId,
        paymentMethod: paymentMethod,
      );
      // Mark current fine as paid locally
      if (_currentFine != null) {
        _currentFine = Fine(
          id: _currentFine!.id,
          referenceNumber: _currentFine!.referenceNumber,
          driverNic: _currentFine!.driverNic,
          driverName: _currentFine!.driverName,
          vehicleNumber: _currentFine!.vehicleNumber,
          location: _currentFine!.location,
          amount: _currentFine!.amount,
          status: 'PAID',
          category: _currentFine!.category,
          officer: _currentFine!.officer,
          issuedAt: _currentFine!.issuedAt,
        );
      }
      _loading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> loadAllFines({String? status}) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      _allFines = await _fineService.getAllFines(status: status);
      _loading = false;
      notifyListeners();
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> issueFine({
    required String categoryId,
    required String officerId,
    required String driverNic,
    required String driverName,
    required String vehicleNumber,
    required String location,
    required double amount,
  }) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final fine = await _fineService.createFine(
        categoryId: categoryId,
        officerId: officerId,
        driverNic: driverNic,
        driverName: driverName,
        vehicleNumber: vehicleNumber,
        location: location,
        amount: amount,
      );
      _currentFine = fine;
      _loading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _loading = false;
      notifyListeners();
      return false;
    }
  }
}
