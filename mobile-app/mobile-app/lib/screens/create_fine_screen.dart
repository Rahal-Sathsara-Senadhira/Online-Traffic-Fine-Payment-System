import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/fine_category.dart';
import '../models/officer.dart';
import '../providers/fine_provider.dart';
import '../services/api_service.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class CreateFineScreen extends StatefulWidget {
  const CreateFineScreen({super.key});

  @override
  State<CreateFineScreen> createState() => _CreateFineScreenState();
}

class _CreateFineScreenState extends State<CreateFineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _driverNicCtrl = TextEditingController();
  final _driverNameCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();

  final _api = ApiService();

  List<FineCategory> _categories = [];
  List<Officer> _officers = [];
  FineCategory? _selectedCategory;
  Officer? _selectedOfficer;
  bool _loadingData = true;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _loadFormData();
  }

  @override
  void dispose() {
    _driverNicCtrl.dispose();
    _driverNameCtrl.dispose();
    _vehicleCtrl.dispose();
    _locationCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadFormData() async {
    setState(() { _loadingData = true; _loadError = null; });
    try {
      final catList = await _api.getList('/categories');
      final offList = await _api.getList('/officers', requiresAuth: true);
      setState(() {
        _categories = catList
            .whereType<Map<String, dynamic>>()
            .map(FineCategory.fromJson)
            .toList();
        _officers = offList
            .whereType<Map<String, dynamic>>()
            .map(Officer.fromJson)
            .toList();
        _loadingData = false;
      });
    } on ApiException catch (e) {
      setState(() { _loadError = e.message; _loadingData = false; });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedCategory == null || _selectedOfficer == null) return;

    final prov = context.read<FineProvider>();
    final success = await prov.issueFine(
      categoryId: _selectedCategory!.id,
      officerId: _selectedOfficer!.id,
      driverNic: _driverNicCtrl.text.trim(),
      driverName: _driverNameCtrl.text.trim(),
      vehicleNumber: _vehicleCtrl.text.trim().toUpperCase(),
      location: _locationCtrl.text.trim(),
      amount: double.parse(_amountCtrl.text.trim()),
    );

    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Fine issued successfully!'), backgroundColor: Colors.green),
      );
      Navigator.of(context).pop();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(prov.error ?? 'Failed to issue fine'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

  InputDecoration _dropdownDecoration(String label, IconData icon) => InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF1565C0)),
        filled: true,
        fillColor: Colors.grey.shade50,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.grey.shade300)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF1565C0), width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.red)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      );

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<FineProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
        title: const Text('Issue New Fine'),
      ),
      body: _loadingData
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF1565C0)))
          : _loadError != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, color: Colors.red, size: 48),
                        const SizedBox(height: 12),
                        Text(_loadError!, textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
                        const SizedBox(height: 20),
                        ElevatedButton.icon(
                          onPressed: _loadFormData,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              : SafeArea(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(20),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _SectionHeader(title: 'Violation Details', icon: Icons.gavel_rounded),
                          const SizedBox(height: 12),

                          DropdownButtonFormField<FineCategory>(
                            initialValue: _selectedCategory,
                            decoration: _dropdownDecoration('Violation Category *', Icons.category_outlined),
                            isExpanded: true,
                            items: _categories
                                .map((c) => DropdownMenuItem(
                                      value: c,
                                      child: Text(
                                        '${c.name}  •  LKR ${c.defaultAmount.toStringAsFixed(0)}',
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ))
                                .toList(),
                            onChanged: (cat) => setState(() {
                              _selectedCategory = cat;
                              if (cat != null) _amountCtrl.text = cat.defaultAmount.toStringAsFixed(2);
                            }),
                            validator: (v) => v == null ? 'Please select a category' : null,
                          ),
                          const SizedBox(height: 12),

                          DropdownButtonFormField<Officer>(
                            initialValue: _selectedOfficer,
                            decoration: _dropdownDecoration('Issuing Officer *', Icons.badge_outlined),
                            isExpanded: true,
                            items: _officers
                                .map((o) => DropdownMenuItem(
                                      value: o,
                                      child: Text(
                                        '${o.fullName}  —  ${o.badgeNumber}',
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ))
                                .toList(),
                            onChanged: (o) => setState(() => _selectedOfficer = o),
                            validator: (v) => v == null ? 'Please select an officer' : null,
                          ),
                          const SizedBox(height: 24),

                          _SectionHeader(title: 'Driver Information', icon: Icons.person_outlined),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _driverNicCtrl,
                            label: 'Driver NIC Number',
                            hint: '200012345678',
                            prefixIcon: Icons.credit_card_outlined,
                            keyboardType: TextInputType.number,
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) return 'NIC is required';
                              if (v.trim().length < 10) return 'Invalid NIC number';
                              return null;
                            },
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _driverNameCtrl,
                            label: 'Driver Full Name',
                            hint: 'As per license',
                            prefixIcon: Icons.person_outline,
                            validator: (v) =>
                                (v == null || v.trim().isEmpty) ? 'Driver name is required' : null,
                          ),
                          const SizedBox(height: 24),

                          _SectionHeader(title: 'Vehicle & Location', icon: Icons.directions_car_outlined),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _vehicleCtrl,
                            label: 'Vehicle Number',
                            hint: 'CAB-0001',
                            prefixIcon: Icons.directions_car_outlined,
                            validator: (v) =>
                                (v == null || v.trim().isEmpty) ? 'Vehicle number is required' : null,
                          ),
                          const SizedBox(height: 12),
                          CustomTextField(
                            controller: _locationCtrl,
                            label: 'Location of Violation',
                            hint: 'e.g. Baseline Road, Colombo',
                            prefixIcon: Icons.location_on_outlined,
                            maxLines: 2,
                            validator: (v) =>
                                (v == null || v.trim().isEmpty) ? 'Location is required' : null,
                          ),
                          const SizedBox(height: 24),

                          _SectionHeader(title: 'Fine Amount', icon: Icons.payments_outlined),
                          const SizedBox(height: 4),
                          Text(
                            'Auto-filled from category. Adjust if needed.',
                            style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                          ),
                          const SizedBox(height: 8),
                          CustomTextField(
                            controller: _amountCtrl,
                            label: 'Amount (LKR)',
                            hint: '2500.00',
                            prefixIcon: Icons.payments_outlined,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            validator: (v) {
                              if (v == null || v.trim().isEmpty) return 'Amount is required';
                              final amount = double.tryParse(v.trim());
                              if (amount == null || amount <= 0) return 'Enter a valid amount';
                              return null;
                            },
                          ),
                          const SizedBox(height: 32),

                          PrimaryButton(
                            label: 'Issue Fine',
                            onPressed: prov.loading ? null : _submit,
                            loading: prov.loading,
                            icon: Icons.gavel_rounded,
                          ),
                          const SizedBox(height: 16),
                        ],
                      ),
                    ),
                  ),
                ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionHeader({required this.title, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFF1565C0), size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A237E)),
        ),
      ],
    );
  }
}
