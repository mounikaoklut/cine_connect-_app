"""Create notifications, user_devices, and notification_preferences tables.

Revision ID: 001_notifications
Revises: 
Create Date: 2026-10-22 11:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_notifications'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create notification_type_enum if not exists
    notification_type_enum = postgresql.ENUM(
        'APPLICATION_STATUS',
        'INTERVIEW_SCHEDULE',
        'DIRECT_MESSAGE',
        'CASTING_ALERT',
        'SYSTEM',
        name='notification_type_enum',
        create_type=False
    )
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE notification_type_enum AS ENUM ("
        "'APPLICATION_STATUS', 'INTERVIEW_SCHEDULE', 'DIRECT_MESSAGE', 'CASTING_ALERT', 'SYSTEM'"
        "); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )

    # 2. Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('notification_type', notification_type_enum, nullable=False),
        sa.Column('deep_link_route', sa.String(length=255), nullable=True),
        sa.Column('metadata_json', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default='{}'),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('ix_notifications_created_at', 'notifications', ['created_at'])
    op.create_index('ix_notifications_user_is_read', 'notifications', ['user_id', 'is_read'])

    # 3. Create user_devices table
    op.create_table(
        'user_devices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('fcm_token', sa.String(length=512), nullable=False),
        sa.Column('device_type', sa.String(length=20), nullable=False, server_default='android'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_user_devices_user_id', 'user_devices', ['user_id'])
    op.create_index('ix_user_devices_fcm_token', 'user_devices', ['fcm_token'])

    # 4. Create notification_preferences table
    op.create_table(
        'notification_preferences',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('application_status', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('interview_schedule', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('direct_message', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('casting_alert', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('system', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('email_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('push_enabled', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('notification_preferences')
    op.drop_table('user_devices')
    op.drop_table('notifications')
    op.execute("DROP TYPE IF EXISTS notification_type_enum;")
