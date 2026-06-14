import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/fine_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import 'fine_detail_screen.dart';

class CreateFineScreen extends StatefulWidget {
  const CreateFineScreen({super.key});

  @override
  State<CreateFineScreen> createState() => _CreateFineScreenState();
}

class _CreateFineScreenState extends State<CreateFineScreen> {
  final _formKey = GlobalKey<FormState>();
  final _categoryIdCtrl = TextEditingController();
  final _officerIdCtrl = TextEditingController();
  final _driverNicCtrl = TextEditingController();
  final _driverNameCtrl = TextEditingController();
  final _vehicleCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();

  // Common fine categories for quick selection
  static const _quickCategories = [
    'Speeding',
    'Running Red Light',
    'No Helmet',
    'No Seatbelt',
    'Drunk Driving',
    'Illegal Parking',
    'Mobile Phone Use',
    'No License',
  ];
  String? _selectedCategory;

  @override
  void dispose() {
    _categoryIdCtrl.dispose();
    _officerIdCtrl.dispose();
    _driverNicCtrl.dispose();
    _driverNameCtrl.dispose();
    _vehicleCtrl.dispose();
    _locationCtrl.dispose();
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final prov = context.read<FineProvider>();
    final success = await prov.issueFine(
      categoryId: _categoryIdCtrl.text.trim(),
      officerId: _officerIdCtrl.text.trim(),
      driverNic: _driverNicCtrl.text.trim(),
      driverName: _driverNameCtrl.text.trim(),
      vehicleNumber: _vehicleCtrl.text.trim().toUpperCase(),
      location: _locationCtrl.text.trim(),
      amount: double.parse(_amountCtrl.text.trim()),
    );

    if (!mounted) return;
    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Fine issued successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const FineDetailScreen()),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(prov.error ?? 'Failed to issue fine'),
          backgroundColor: Colors.red.shade700,
        ),
      );
    }
  }

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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _SectionHeader(title: 'Violation Details', icon: Icons.gavel_rounded),
                const SizedBox(height: 12),

                // Quick category chips
                const Text('Quick Select Category:',
                    style: TextStyle(fontSize: 13, color: Colors.grey)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: _quickCategories.map((cat) {
                    final selected = _selectedCategory == cat;
                    return ChoiceChip(
                      label: Text(cat, style: TextStyle(fontSize: 12, color: selected ? Colors.white : Colors.black87)),
                      selected: selected,
                      selectedColor: const Color(0xFF1565C0),
                      onSelected: (_) => setState(() {
                        _selectedCategory = cat;
                        // In a real app this would be the UUID from the API
                        _categoryIdCtrl.text = cat.toLowerCase().replaceAll(' ', '_');
                      }),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  controller: _categoryIdCtrl,
                  label: 'Category ID (UUID)',
                  hint: 'Enter category UUID from admin panel',
                  prefixIcon: Icons.category_outlined,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Category ID is required' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _officerIdCtrl,
                  label: 'Officer ID (UUID)',
                  hint: 'Your officer UUID',
                  prefixIcon: Icons.badge_outlined,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Officer ID is required' : null,
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
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Driver name is required' : null,
                ),
                const SizedBox(height: 24),

                _SectionHeader(title: 'Vehicle & Location', icon: Icons.directions_car_outlined),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _vehicleCtrl,
                  label: 'Vehicle Number',
                  hint: 'CAB-0001',
                  prefixIcon: Icons.directions_car_outlined,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Vehicle number is required' : null,
                ),
                const SizedBox(height: 12),
                CustomTextField(
                  controller: _locationCtrl,
                  label: 'Location of Violation',
                  hint: 'e.g. Baseline Road, Colombo',
                  prefixIcon: Icons.location_on_outlined,
                  maxLines: 2,
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Location is required' : null,
                ),
                const SizedBox(height: 24),

                _SectionHeader(title: 'Fine Amount', icon: Icons.attach_money),
                const SizedBox(height: 12),
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
          style: const TextStyle(
              fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF1A237E)),
        ),
      ],
    );
  }
}
