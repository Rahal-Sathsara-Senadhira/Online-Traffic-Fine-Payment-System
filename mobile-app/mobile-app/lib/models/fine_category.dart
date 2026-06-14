class FineCategory {
  final String id;
  final String name;
  final String? description;
  final double defaultAmount;

  FineCategory({
    required this.id,
    required this.name,
    this.description,
    required this.defaultAmount,
  });

  factory FineCategory.fromJson(Map<String, dynamic> json) {
    return FineCategory(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      defaultAmount: (json['default_amount'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'default_amount': defaultAmount,
      };
}
