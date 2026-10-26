import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_theme.dart';
import '../models/settings_model.dart';
import '../services/settings_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final SettingsService _settingsService = SettingsService.instance;

  @override
  void initState() {
    super.initState();
    _settingsService.fetchSettings();
    _settingsService.fetchSessions();
  }

  void _showPasswordChangeSheet(BuildContext context) {
    final currentPwController = TextEditingController();
    final newPwController = TextEditingController();
    final confirmPwController = TextEditingController();

    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F131C),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.lock_outline_rounded, color: AppTheme.accentGold, size: 22),
                const SizedBox(width: 8),
                const Text(
                  "Change Password",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: currentPwController,
              obscureText: true,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "Current Password",
                labelStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppTheme.bgSurface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: newPwController,
              obscureText: true,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "New Password (min 8 chars)",
                labelStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppTheme.bgSurface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: confirmPwController,
              obscureText: true,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "Confirm New Password",
                labelStyle: const TextStyle(color: AppTheme.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppTheme.bgSurface,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentGold,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () async {
                  if (newPwController.text != confirmPwController.text) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text("Passwords do not match"), backgroundColor: AppTheme.accentRose),
                    );
                    return;
                  }
                  final msg = await _settingsService.changePassword(
                    currentPwController.text,
                    newPwController.text,
                    confirmPwController.text,
                  );
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(msg), backgroundColor: AppTheme.accentEmerald),
                  );
                },
                child: const Text("Update Password", style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF131722),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: AppTheme.accentRose.withOpacity(0.5)),
        ),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: AppTheme.accentRose, size: 24),
            SizedBox(width: 8),
            Text("Log Out?", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
          ],
        ),
        content: const Text(
          "Are you sure you want to log out of CineConnect? Active tokens on this device will be cleared.",
          style: TextStyle(fontSize: 12, color: AppTheme.textMuted, height: 1.4),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text("Cancel", style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.accentRose, foregroundColor: Colors.white),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Logged out successfully. Tokens cleared."), backgroundColor: AppTheme.accentRose),
              );
            },
            child: const Text("Log Out", style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  bool _isPrivateAccount = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Settings & Activity", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppTheme.accentEmerald.withOpacity(0.15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppTheme.accentEmerald.withOpacity(0.4)),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.bolt, color: AppTheme.accentEmerald, size: 12),
                SizedBox(width: 4),
                Text("FastAPI + Redis", style: TextStyle(color: AppTheme.accentEmerald, fontSize: 9, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
      body: ValueListenableBuilder<UserSettings>(
        valueListenable: _settingsService.settingsNotifier,
        builder: (context, settings, _) {
          return ListView(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 90),
            children: [
              // 1. HOW TO USE CINECONNECT
              _buildSectionHeader("HOW TO USE CINECONNECT"),
              _buildHowToUseCard(context),
              const SizedBox(height: 20),

              // 2. SUBSCRIPTIONS
              _buildSectionHeader("SUBSCRIPTIONS"),
              _buildSubscriptionsCard(context, settings),
              const SizedBox(height: 20),

              // 3. WHO CAN SEE YOUR ACCOUNT
              _buildSectionHeader("WHO CAN SEE YOUR ACCOUNT"),
              _buildWhoCanSeeCard(context, settings),
              const SizedBox(height: 20),

              // 4. HOW OTHERS CAN INTERACT WITH YOU
              _buildSectionHeader("HOW OTHERS CAN INTERACT WITH YOU"),
              _buildInteractionsCard(context, settings),
              const SizedBox(height: 20),

              // 5. ACCOUNT & SYSTEM ACTIONS
              _buildSectionHeader("ACCOUNT & SYSTEM ACTIONS"),
              _buildAccountActionsCard(context, settings),
              const SizedBox(height: 16),
              _buildAddProfileAndLogoutButtons(context),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          color: AppTheme.accentGoldLight,
          fontSize: 11,
          fontWeight: FontWeight.w800,
          letterSpacing: 0.8,
        ),
      ),
    );
  }

  Widget _buildHowToUseCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Column(
        children: [
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.bookmark_border_rounded, color: AppTheme.accentGold, size: 20),
            ),
            title: const Text("Saved", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Casting calls, project notices, showreels & posts", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            trailing: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text("12", style: TextStyle(color: AppTheme.textMuted, fontSize: 12, fontWeight: FontWeight.w600)),
                SizedBox(width: 4),
                Icon(Icons.chevron_right, color: Colors.white38),
              ],
            ),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Saved Collections: 12 casting calls & showreels bookmarked")),
              );
            },
          ),
          const Divider(color: AppTheme.borderSubtle, height: 1),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.history_rounded, color: AppTheme.accentGold, size: 20),
            ),
            title: const Text("Archive", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Archived posts, stories, audition tapes & expired jobs", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            trailing: const Icon(Icons.chevron_right, color: Colors.white38),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Archive Vault: 3 audition submissions & stories preserved")),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSubscriptionsCard(BuildContext context, UserSettings settings) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
                    child: const Icon(Icons.stars_rounded, color: AppTheme.accentGold, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Talent Pro Membership", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                      SizedBox(height: 2),
                      Text("Active • Renews Nov 15, 2026 (\$19/mo)", style: TextStyle(color: AppTheme.accentEmerald, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.accentEmerald.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: AppTheme.accentEmerald.withOpacity(0.4)),
                ),
                child: const Text("PRO", style: TextStyle(color: AppTheme.accentEmerald, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: AppTheme.borderSubtle, height: 1),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Expanded(
                child: Text(
                  "Unlimited audition submissions, 4K showreels, verified badge",
                  style: TextStyle(color: AppTheme.textMuted, fontSize: 11),
                ),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.accentGold,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text("Subscription & Billing managed via Stripe")),
                  );
                },
                child: const Text("Manage", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWhoCanSeeCard(BuildContext context, UserSettings settings) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Column(
        children: [
          SwitchListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
            secondary: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.lock_outline_rounded, color: AppTheme.accentGold, size: 20),
            ),
            title: const Text("Account Privacy", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: Text(
              _isPrivateAccount ? "Private (Only approved connections see posts)" : "Public (Discoverable in crew searches)",
              style: const TextStyle(color: AppTheme.textMuted, fontSize: 11),
            ),
            value: _isPrivateAccount,
            activeColor: AppTheme.accentGold,
            onChanged: (val) {
              setState(() => _isPrivateAccount = val);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(val ? "Account is now Private 🔒" : "Account is now Public 🌐 (Discoverable in talent searches)"),
                  backgroundColor: AppTheme.bgSurface,
                ),
              );
            },
          ),
          const Divider(color: AppTheme.borderSubtle, height: 1),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentEmerald.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.verified_user_outlined, color: AppTheme.accentEmerald, size: 20),
            ),
            title: const Text("Close Friends", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Trusted circle for exclusive BTS & reels", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            trailing: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text("14 members", style: TextStyle(color: AppTheme.accentEmerald, fontSize: 11, fontWeight: FontWeight.bold)),
                SizedBox(width: 4),
                Icon(Icons.chevron_right, color: Colors.white38),
              ],
            ),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Close Friends: 14 trusted directors & crew members")),
              );
            },
          ),
          const Divider(color: AppTheme.borderSubtle, height: 1),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentRose.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.block_rounded, color: AppTheme.accentRose, size: 20),
            ),
            title: const Text("Blocked", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Manage blocked users & agencies", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            trailing: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text("2", style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                SizedBox(width: 4),
                Icon(Icons.chevron_right, color: Colors.white38),
              ],
            ),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Blocked: 2 recruitment accounts")),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildInteractionsCard(BuildContext context, UserSettings settings) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Column(
        children: [
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.chat_bubble_outline_rounded, color: AppTheme.accentGold, size: 20),
            ),
            title: const Text("Messages & Story Replies", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Control who can DM you & reply to showreels", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            trailing: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text("Verified Only", style: TextStyle(color: AppTheme.accentGold, fontSize: 11, fontWeight: FontWeight.bold)),
                SizedBox(width: 4),
                Icon(Icons.chevron_right, color: Colors.white38),
              ],
            ),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Messaging Permissions: Verified Production Houses Only")),
              );
            },
          ),
          const Divider(color: AppTheme.borderSubtle, height: 1),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.shield_outlined, color: AppTheme.accentGold, size: 20),
            ),
            title: const Text("Restricted", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Limit interactions without alerting them", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            trailing: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text("1", style: TextStyle(color: AppTheme.textMuted, fontSize: 11, fontWeight: FontWeight.bold)),
                SizedBox(width: 4),
                Icon(Icons.chevron_right, color: Colors.white38),
              ],
            ),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Restricted Accounts: 1 agency limited")),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAccountActionsCard(BuildContext context, UserSettings settings) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.bgSecondary,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.borderSubtle),
      ),
      child: Column(
        children: [
          SwitchListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
            secondary: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.notifications_none_rounded, color: AppTheme.accentGold, size: 20),
            ),
            title: const Text("Notifications", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Job alerts, casting callbacks & audition updates", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            value: settings.notifyApplicationStatus,
            activeColor: AppTheme.accentGold,
            onChanged: (val) => _settingsService.updateSettings({'notify_application_status': val}),
          ),
          const Divider(color: AppTheme.borderSubtle, height: 1),
          ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppTheme.accentGold.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.key_rounded, color: AppTheme.accentGold, size: 20),
            ),
            title: const Text("Security", style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
            subtitle: const Text("Change password & cryptographic credentials", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
            trailing: const Icon(Icons.chevron_right, color: Colors.white38),
            onTap: () => _showPasswordChangeSheet(context),
          ),
        ],
      ),
    );
  }

  Widget _buildAddProfileAndLogoutButtons(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.accentGold,
              side: BorderSide(color: AppTheme.accentGold.withOpacity(0.5), width: 1.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.people_alt_outlined, size: 18),
            label: const Text("Add Profile / Switch Account", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text("Switched to Secondary Profile: Shadow Reel Studios")),
              );
            },
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton.icon(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.accentRose,
              side: BorderSide(color: AppTheme.accentRose.withOpacity(0.4), width: 1.5),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            icon: const Icon(Icons.logout_rounded, size: 18),
            label: const Text("Log Out", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            onPressed: () => _showLogoutConfirmation(context),
          ),
        ),
      ],
    );
  }  );
  }
}
