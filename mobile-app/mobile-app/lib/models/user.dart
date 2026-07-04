class User {
  final String id;
  final String username;
  final String role;
  final String? email;
  final String? nic;
  final String? phone;

  User({
    required this.id,
    required this.username,
    required this.role,
    this.email,
    this.nic,
    this.phone,
  });

  bool get isAdmin => role == 'ADMIN';
  bool get isOfficer => role == 'OFFICER' || role == 'ADMIN';

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      username: json['username'] as String,
      role: json['role'] as String,
      email: json['email'] as String?,
      nic: json['nic'] as String?,
      phone: json['phone'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'username': username,
        'role': role,
        'email': email,
        'nic': nic,
        'phone': phone,
      };
}
