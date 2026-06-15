class Officer {
  final String id;
  final String fullName;
  final String badgeNumber;
  final String? phone;
  final String? district;
  final String? email;

  Officer({
    required this.id,
    required this.fullName,
    required this.badgeNumber,
    this.phone,
    this.district,
    this.email,
  });

  factory Officer.fromJson(Map<String, dynamic> json) {
    return Officer(
      id: json['id'] as String,
      fullName: json['full_name'] as String,
      badgeNumber: json['badge_number'] as String,
      phone: json['phone'] as String?,
      district: json['district'] as String?,
      email: json['email'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'full_name': fullName,
        'badge_number': badgeNumber,
        'phone': phone,
        'district': district,
        'email': email,
      };
}
