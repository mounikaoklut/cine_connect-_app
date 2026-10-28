"""Models package — import all ORM models so Alembic and relationships work."""

from app.models.user import (
    User,
    Profile,
    Skill,
    UserSkill,
    Experience,
    PortfolioItem,
    PortfolioMedia,
)
from app.models.chat import Conversation, ConversationParticipant, ChatMessageModel
from app.models.notification import (
    Notification,
    NotificationType,
    UserDevice,
    NotificationPreference,
)
from app.models.settings import (
    UserSettings,
    AccountType,
    AvailabilityStatus,
    StreamQuality,
    ThemeMode,
)
from app.models.production_house import ProductionHouse, Project
from app.models.opportunity import Opportunity, Application
from app.models.social import Post, Comment, Like, Follow, SavedPost

__all__ = [
    "User",
    "Profile",
    "Skill",
    "UserSkill",
    "Experience",
    "PortfolioItem",
    "PortfolioMedia",
    "Conversation",
    "ConversationParticipant",
    "ChatMessageModel",
    "Notification",
    "NotificationType",
    "UserDevice",
    "NotificationPreference",
    "UserSettings",
    "AccountType",
    "AvailabilityStatus",
    "StreamQuality",
    "ThemeMode",
    "ProductionHouse",
    "Project",
    "Opportunity",
    "Application",
    "Post",
    "Comment",
    "Like",
    "Follow",
    "SavedPost",
    "Conversation",
    "Message",
    "Notification",
]
