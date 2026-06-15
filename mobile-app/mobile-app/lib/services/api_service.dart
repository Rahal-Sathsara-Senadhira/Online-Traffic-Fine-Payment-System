import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/constants.dart';

class ApiException implements Exception {
  final int statusCode;
  final String errorCode;
  final String message;

  ApiException({
    required this.statusCode,
    required this.errorCode,
    required this.message,
  });

  @override
  String toString() => message;
}

class ApiService {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<String?> _getToken() => _storage.read(key: AppConstants.tokenKey);

  Future<Map<String, String>> _headers({bool requiresAuth = false}) async {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (requiresAuth) {
      final token = await _getToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Map<String, dynamic> _parseResponse(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }
    throw ApiException(
      statusCode: response.statusCode,
      errorCode: body['error'] as String? ?? 'UNKNOWN_ERROR',
      message: body['message'] as String? ?? 'An unexpected error occurred.',
    );
  }

  Future<Map<String, dynamic>> get(
    String path, {
    bool requiresAuth = false,
  }) async {
    try {
      final response = await http
          .get(
            Uri.parse('${AppConstants.baseUrl}$path'),
            headers: await _headers(requiresAuth: requiresAuth),
          )
          .timeout(AppConstants.requestTimeout);
      return _parseResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        errorCode: 'NETWORK_ERROR',
        message: 'Cannot connect to server. Please check your connection.',
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        errorCode: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
      );
    }
  }

  Future<Map<String, dynamic>> post(
    String path,
    Map<String, dynamic> body, {
    bool requiresAuth = false,
  }) async {
    try {
      final response = await http
          .post(
            Uri.parse('${AppConstants.baseUrl}$path'),
            headers: await _headers(requiresAuth: requiresAuth),
            body: jsonEncode(body),
          )
          .timeout(AppConstants.requestTimeout);
      return _parseResponse(response);
    } on SocketException {
      throw ApiException(
        statusCode: 0,
        errorCode: 'NETWORK_ERROR',
        message: 'Cannot connect to server. Please check your connection.',
      );
    } on ApiException {
      rethrow;
    } catch (e) {
      throw ApiException(
        statusCode: 0,
        errorCode: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred.',
      );
    }
  }
}
