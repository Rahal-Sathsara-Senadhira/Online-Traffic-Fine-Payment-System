import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/constants.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  final ApiService _api;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  AuthService(this._api);

  Future<User> login(String username, String password) async {
    final data = await _api.post('/auth/login', {
      'email': username,
      'password': password,
    });

    final token = data['token'] as String;
    await _storage.write(key: AppConstants.tokenKey, value: token);

    // Decode the JWT payload to extract user info
    final payload = _decodeJwt(token);
    return User(
      id: payload['id'] as String,
      username: username,
      role: payload['role'] as String,
    );
  }

  Future<void> logout() async {
    await _storage.delete(key: AppConstants.tokenKey);
  }

  Future<bool> isLoggedIn() async {
    final token = await _storage.read(key: AppConstants.tokenKey);
    if (token == null) return false;
    try {
      final payload = _decodeJwt(token);
      final exp = payload['exp'] as int;
      return DateTime.fromMillisecondsSinceEpoch(exp * 1000)
          .isAfter(DateTime.now());
    } catch (_) {
      return false;
    }
  }

  // Decode JWT payload without verifying signature (server verifies)
  Map<String, dynamic> _decodeJwt(String token) {
    final parts = token.split('.');
    if (parts.length != 3) throw Exception('Invalid JWT format');
    final payload = parts[1];
    final normalized = base64Url.normalize(payload);
    final decoded = utf8.decode(base64Url.decode(normalized));
    return jsonDecode(decoded) as Map<String, dynamic>;
  }
}
