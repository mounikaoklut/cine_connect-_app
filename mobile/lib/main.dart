import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'core/theme/app_theme.dart';
import 'data/mock_data.dart';
import 'models/models.dart';
import 'screens/landing_screen.dart';
import 'screens/home_feed_screen.dart';
import 'screens/auditions_screen.dart';
import 'screens/talent_directory_screen.dart';
import 'screens/pitch_vault_screen.dart';
import 'screens/pipeline_screen.dart';
import 'screens/profile_screen.dart';
import 'widgets/audition_sheet.dart';
import 'widgets/showreel_dialog.dart';
import 'widgets/pitch_dialog.dart';
import 'widgets/create_post_sheet.dart';
import 'widgets/curved_dual_wheel_nav.dart';
import 'screens/chat_inbox_screen.dart';
import 'screens/chat_room_screen.dart';
import 'services/notification_service.dart';
import 'screens/notification_center_screen.dart';
import 'services/settings_service.dart';
import 'screens/settings_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: AppTheme.bgPrimary,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const CineConnectMobileApp());
}

class CineConnectMobileApp extends StatelessWidget {
  const CineConnectMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'CineConnect',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const MainNavigationWrapper(),
    );
  }
}

class MainNavigationWrapper extends StatefulWidget {
  const MainNavigationWrapper({super.key});

  @override
  State<MainNavigationWrapper> createState() => _MainNavigationWrapperState();
}

class _MainNavigationWrapperState extends State<MainNavigationWrapper> {
  bool _showLanding = false;
  int _currentIndex = 0;

  List<FeedPost> _posts = [];
  List<PipelineItem> _pipeline = [];
  List<CastingCall> _castings = [];
  List<Talent> _talents = [];
  List<PitchDeck> _pitches = [];

  @override
  void initState() {
    super.initState();
    _posts = MockData.feedList;
    _pipeline = MockData.pipelineList;
    _castings = MockData.castingList;
    _talents = MockData.talentList;
    _pitches = MockData.pitchList;

    // Initialize unified notification & settings engines
    NotificationService.instance.initialize();
    SettingsService.instance.initialize();
    NotificationService.instance.deepLinkStream.listen((route) {
      if (!mounted) return;
      if (route.contains('/opportunities') || route.contains('/applications')) {
        setState(() => _currentIndex = 1);
      } else if (route.contains('/messages') || route.contains('/chat')) {
        setState(() => _currentIndex = 3);
      } else if (route.contains('/pipeline')) {
        setState(() => _currentIndex = 4);
      } else if (route.contains('/settings')) {
        setState(() => _currentIndex = 6);
      }
    });
  }

  void _openAuditionSheet(CastingCall casting) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => AuditionSheet(
        casting: casting,
        onSubmitSuccess: (roleName, productionHouse) {
          setState(() {
            _pipeline.insert(
              0,
              PipelineItem(
                id: "app-${DateTime.now().millisecondsSinceEpoch}",
                projectTitle: roleName,
                roleTitle: roleName,
                productionHouse: productionHouse,
                appliedDate: "Just now",
                stage: "Applied",
                progressPercent: 0.25,
                nextStepNote: "Self-tape received by casting associate.",
              ),
            );
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text("Audition for '$roleName' added to your Pipeline!"),
              backgroundColor: AppTheme.accentEmerald,
            ),
          );
        },
      ),
    );
  }

  void _openShowreelDialog(Talent talent) {
    showDialog(
      context: context,
      builder: (_) => ShowreelDialog(talent: talent),
    );
  }

  void _openPitchDialog(PitchDeck pitch) {
    showDialog(
      context: context,
      builder: (_) => PitchDialog(pitch: pitch),
    );
  }

  void _openCreatePostSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => CreatePostSheet(
        onPostCreated: (newPost) {
          setState(() => _posts.insert(0, newPost));
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Published to Community Feed!"), backgroundColor: AppTheme.accentGoldDark),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_showLanding) {
      return LandingScreen(
        onEnterStudioHub: () => setState(() => _showLanding = false),
        onSelectCasting: _openAuditionSheet,
        onSelectTalent: _openShowreelDialog,
        onSelectPitch: _openPitchDialog,
      );
    }

    final screens = [
      HomeFeedScreen(
        posts: _posts,
        onToggleLike: (id) {
          setState(() {
            final p = _posts.firstWhere((element) => element.id == id);
            p.isLiked = !p.isLiked;
            p.likes += p.isLiked ? 1 : -1;
          });
        },
        onOpenCreatePost: _openCreatePostSheet,
        onApplyCasting: (castingId) {
          final c = _castings.firstWhere((element) => element.id == castingId, orElse: () => _castings[0]);
          _openAuditionSheet(c);
        },
        onViewReel: (talentId) {
          final t = _talents.firstWhere((element) => element.id == talentId, orElse: () => _talents[0]);
          _openShowreelDialog(t);
        },
        onRequestPitch: (pitchId) {
          final p = _pitches.firstWhere((element) => element.id == pitchId, orElse: () => _pitches[0]);
          _openPitchDialog(p);
        },
      ),
      AuditionsScreen(
        castings: _castings,
        onSelectCasting: _openAuditionSheet,
      ),
      TalentDirectoryScreen(
        talents: _talents,
        onSelectTalent: _openShowreelDialog,
      ),
      ChatInboxScreen(
        onOpenCasting: (castingId) {
          final c = _castings.firstWhere((e) => e.id == castingId, orElse: () => _castings[0]);
          _openAuditionSheet(c);
        },
      ),
      PipelineScreen(pipelineItems: _pipeline),
      const ProfileScreen(),
      const SettingsScreen(),
    ];

    return Scaffold(
      drawer: Drawer(
        backgroundColor: AppTheme.bgSecondary,
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: const BoxDecoration(color: AppTheme.bgPrimary),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 38,
                        height: 38,
                        decoration: BoxDecoration(
                          color: AppTheme.accentGold,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.movie, color: Colors.black, size: 24),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        "CineConnect",
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text("Mobile Talent & Production Suite", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.public, color: AppTheme.accentGold),
              title: const Text("Public Showcase Landing", style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                setState(() => _showLanding = true);
              },
            ),
            ListTile(
              leading: const Icon(Icons.notifications_active_rounded, color: AppTheme.accentGold),
              title: const Text("Notification Center", style: TextStyle(color: Colors.white)),
              trailing: ValueListenableBuilder<int>(
                valueListenable: NotificationService.instance.unreadCountNotifier,
                builder: (context, count, _) {
                  if (count == 0) return const SizedBox.shrink();
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.accentRose,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      "$count new",
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  );
                },
              ),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const NotificationCenterScreen()),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.chat_bubble_rounded, color: AppTheme.accentGold),
              title: const Text("Production Chats & Messages", style: TextStyle(color: Colors.white)),
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppTheme.accentGold,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Text("3 new", style: TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold)),
              ),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 3);
              },
            ),
            ListTile(
              leading: const Icon(Icons.auto_stories_rounded, color: AppTheme.accentGold),
              title: const Text("Pitch Vault & Project Decks", style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => Scaffold(
                      appBar: AppBar(title: const Text("Pitch Vault")),
                      body: PitchVaultScreen(
                        pitches: _pitches,
                        onSelectPitch: _openPitchDialog,
                      ),
                    ),
                  ),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.person, color: AppTheme.accentGold),
              title: const Text("My Profile & Media Vault", style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 5);
              },
            ),
            ListTile(
              leading: const Icon(Icons.settings_rounded, color: AppTheme.accentGold),
              title: const Text("Settings & Preferences", style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                setState(() => _currentIndex = 6);
              },
            ),
            const Divider(color: AppTheme.borderSubtle),
            ListTile(
              leading: const Icon(Icons.bolt, color: AppTheme.accentEmerald),
              title: const Text("FastAPI Backend Status", style: TextStyle(color: Colors.white)),
              subtitle: const Text("Connected to http://localhost:8000", style: TextStyle(color: AppTheme.textMuted, fontSize: 11)),
              onTap: () {},
            ),
          ],
        ),
      ),
      body: Stack(
        children: [
          screens[_currentIndex],
          CurvedDualWheelNav(
            activeRoute: _getActiveRouteName(_currentIndex),
            onRouteSelected: (route) {
              setState(() {
                switch (route) {
                  case 'Home':
                    _currentIndex = 0;
                    break;
                  case 'Opportunities':
                    _currentIndex = 1;
                    break;
                  case 'Messages':
                    _currentIndex = 3;
                    break;
                  case 'Notifications':
                  case 'Pipeline':
                  case 'My Applications':
                  case 'Applications':
                    _currentIndex = 4;
                    break;
                  case 'Talent':
                    _currentIndex = 2;
                    break;
                  case 'Profile':
                    _currentIndex = 5;
                    break;
                  case 'Settings':
                    _currentIndex = 6;
                    break;
                }
              });
            },
          ),
        ],
      ),
    );
  }

  String _getActiveRouteName(int index) {
    switch (index) {
      case 0:
        return 'Home';
      case 1:
        return 'Opportunities';
      case 2:
        return 'Talent';
      case 3:
        return 'Messages';
      case 4:
        return 'Pipeline';
      case 5:
        return 'Profile';
      case 6:
        return 'Settings';
      default:
        return 'Home';
    }
  }
}

