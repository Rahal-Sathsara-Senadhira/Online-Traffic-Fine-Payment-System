class AppConstants {
  // Change this to your server's IP when running on a physical device
  // Use 10.0.2.2 for Android emulator (maps to host machine localhost)
  static const String baseUrl = 'http://localhost:4000/api';

  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';

  static const Duration requestTimeout = Duration(seconds: 30);

  // Fine status values from the API
  static const String statusPending = 'PENDING';
  static const String statusPaid = 'PAID';

  // Payment methods matching the API enum
  static const String paymentCard = 'CARD';
  static const String paymentOnlineBanking = 'ONLINE_BANKING';
}
