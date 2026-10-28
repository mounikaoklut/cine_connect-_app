import 'package:flutter/material.dart';
import '../services/notification_service.dart';

/// Navigation item model for CineConnect bottom bar
class CineNavItem {
  final String keyName;
  final String label;
  final IconData icon;
  final bool showBadge;

  const CineNavItem({
    required this.keyName,
    required this.label,
    required this.icon,
    this.showBadge = false,
  });
}

/// Legacy wheel item model preserved for compatibility
class NavWheelItem {
  final String keyName;
  final String label;
  final IconData icon;

  const NavWheelItem({
    required this.keyName,
    required this.label,
    required this.icon,
  });
}

/// 8-item wheel list preserved for backward compatibility
final List<NavWheelItem> kNavigationWheelItems = [
  const NavWheelItem(keyName: 'Home', label: 'Home', icon: Icons.home_rounded),
  const NavWheelItem(keyName: 'Opportunities', label: 'Opportunities', icon: Icons.explore_rounded),
  const NavWheelItem(keyName: 'Messages', label: 'Messages', icon: Icons.chat_bubble_rounded),
  const NavWheelItem(keyName: 'Notifications', label: 'Notification', icon: Icons.notifications_rounded),
  const NavWheelItem(keyName: 'Profile', label: 'Profile', icon: Icons.person_rounded),
  const NavWheelItem(keyName: 'Pipeline', label: 'My Applications', icon: Icons.folder_special_rounded),
  const NavWheelItem(keyName: 'Talent', label: 'Directory', icon: Icons.people_alt_rounded),
  const NavWheelItem(keyName: 'Settings', label: 'Settings', icon: Icons.settings_rounded),
];

/// CineConnect Custom Bottom Navigation Bar
///
/// Features:
/// - Flawless vertical centering along horizontal baseline
/// - Side items ("Opportunities", "Notification") centered in Column layout
/// - Active circular button ("Messages") aligned with label pill directly beneath
/// - Accurately positioned red notification badge (top: -2, right: -2) without icon skew
/// - SafeArea wrapped so system navigation/gesture bars do not push elements off-center
/// - Cinematic dark theme background (#0B0C10) with glowing gold/amber active state
class CineBottomNavigationBar extends StatefulWidget {
  final String activeRoute;
  final ValueChanged<String> onRouteSelected;
  final bool isPositioned;
  final double contentHeight;

  const CineBottomNavigationBar({
    super.key,
    required this.activeRoute,
    required this.onRouteSelected,
    this.isPositioned = true,
    this.contentHeight = 72.0,
  });

  @override
  State<CineBottomNavigationBar> createState() => _CineBottomNavigationBarState();
}

class _CineBottomNavigationBarState extends State<CineBottomNavigationBar> {
  late int _currentIndex;

  static const List<CineNavItem> _navItems = [
    CineNavItem(
      keyName: 'Opportunities',
      label: 'Opportunities',
      icon: Icons.explore_rounded,
    ),
    CineNavItem(
      keyName: 'Messages',
      label: 'Messages',
      icon: Icons.chat_bubble_rounded,
    ),
    CineNavItem(
      keyName: 'Notifications',
      label: 'Notification',
      icon: Icons.notifications_rounded,
      showBadge: true,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = _findIndexForRoute(widget.activeRoute);
  }

  @override
  void didUpdateWidget(covariant CineBottomNavigationBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.activeRoute != widget.activeRoute) {
      final newIndex = _findIndexForRoute(widget.activeRoute);
      if (newIndex != _currentIndex) {
        setState(() {
          _currentIndex = newIndex;
        });
      }
    }
  }

  int _findIndexForRoute(String route) {
    if (route == 'Opportunities' || route == 'Castings') {
      return 0;
    } else if (route == 'Messages') {
      return 1;
    } else if (route == 'Notifications' || route == 'Notification' || route == 'Pipeline' || route == 'My Applications' || route == 'Applications') {
      return 2;
    }
    // Default to Messages (1) for Home or other unlisted initial routes
    return 1;
  }

  void _handleItemTap(int index) {
    if (_currentIndex != index) {
      setState(() {
        _currentIndex = index;
      });
      widget.onRouteSelected(_navItems[index].keyName);
    }
  }

  @override
  Widget build(BuildContext context) {
    final navContent = ValueListenableBuilder<int>(
      valueListenable: NotificationService.instance.unreadCountNotifier,
      builder: (context, unreadCount, _) {
        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Color(0xFF131722), // Cinematic dark charcoal surface
                Color(0xFF0B0C10), // Deep black foundation
              ],
            ),
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(24.0),
              topRight: Radius.circular(24.0),
            ),
            boxShadow: [
              BoxShadow(
                color: Color(0xCC000000),
                blurRadius: 24.0,
                offset: Offset(0, -6),
              ),
            ],
          ),
          child: SafeArea(
            top: false,
            left: false,
            right: false,
            bottom: true,
            child: SizedBox(
              height: widget.contentHeight,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: List.generate(_navItems.length, (index) {
                  return _buildNavItem(index, unreadCount);
                }),
              ),
            ),
          ),
        );
      },
    );

    if (!widget.isPositioned) {
      return navContent;
    }

    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: navContent,
    );
  }

  Widget _buildNavItem(int index, int unreadCount) {
    final item = _navItems[index];
    final isActive = _currentIndex == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => _handleItemTap(index),
        behavior: HitTestBehavior.opaque,
        child: Container(
          constraints: const BoxConstraints(
            minWidth: 48.0,
            minHeight: 48.0,
          ),
          alignment: Alignment.center,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isActive) ...[
                // Active Circular Highlight Button (Aligned symmetrically on horizontal baseline)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOutCubic,
                  width: 44.0,
                  height: 44.0,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFFFFB300), Color(0xFFFF9800)],
                    ),
                    border: Border.all(
                      color: Colors.white,
                      width: 2.0,
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x66FF9800),
                        blurRadius: 12.0,
                        spreadRadius: 1.5,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Icon(
                      item.icon,
                      size: 23.0,
                      color: const Color(0xFF08090C),
                    ),
                  ),
                ),
                // Consistent 4.5dp spacing between active icon & label pill
                const SizedBox(height: 4.5),
                // Active Label Pill directly beneath the icon
                AnimatedContainer(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.symmetric(horizontal: 7.0, vertical: 1.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFF101219),
                    borderRadius: BorderRadius.circular(6.0),
                    border: Border.all(
                      color: const Color(0xFFFF9800),
                      width: 1.0,
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x33FF9800),
                        blurRadius: 4.0,
                        offset: Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Text(
                    item.label,
                    style: const TextStyle(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFF5F5F5),
                      letterSpacing: 0.2,
                      height: 1.1,
                    ),
                  ),
                ),
              ] else ...[
                // Inactive Item Icon Block with fixed bounding container for center alignment
                SizedBox(
                  width: 32.0,
                  height: 32.0,
                  child: Stack(
                    clipBehavior: Clip.none,
                    alignment: Alignment.center,
                    children: [
                      Icon(
                        item.icon,
                        size: 26.0,
                        color: const Color(0xFF858995),
                      ),
                      // Accurately positioned top-right badge without shifting icon center
                      if (item.showBadge)
                        Positioned(
                          top: -2.0,
                          right: -2.0,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 1.0),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(7.0),
                              border: Border.all(
                                color: const Color(0xFF0B0C10),
                                width: 1.2,
                              ),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x4DEF4444),
                                  blurRadius: 4.0,
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                            constraints: const BoxConstraints(
                              minWidth: 14.0,
                              minHeight: 14.0,
                            ),
                            child: Text(
                              (unreadCount > 0 ? unreadCount : 2).toString(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 8.5,
                                fontWeight: FontWeight.w800,
                                height: 1.0,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                // Consistent 5.0dp padding between icon and text label
                const SizedBox(height: 5.0),
                // Inactive text label
                Text(
                  item.label,
                  style: const TextStyle(
                    fontSize: 10.0,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF858995),
                    letterSpacing: 0.2,
                    height: 1.1,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Naming compatibility aliases supporting all conventions
typedef CurvedDualWheelNav = CineBottomNavigationBar;
typedef CustomCurvedNavBar = CineBottomNavigationBar;
typedef CineAntiGravityNavBar = CineBottomNavigationBar;


