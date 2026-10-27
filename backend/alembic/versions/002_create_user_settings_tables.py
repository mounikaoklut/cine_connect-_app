"""Create user_settings table with role preferences, security, notifications matrix, and stream quality.

Revision ID: 002_user_settings
Revises: 001_notifications
Create Date: 2026-10-22 11:35:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '002_user_settings'
down_revision = '001_notifications'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create Enums if not exist
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE account_type_enum AS ENUM ('CREATIVE_TALENT', 'PRODUCTION_HOUSE'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE availability_status_enum AS ENUM ('AVAILABLE', 'BUSY', 'UNAVAILABLE'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE stream_quality_enum AS ENUM ('AUTO', 'LOW', 'MEDIUM', 'HIGH'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE theme_mode_enum AS ENUM ('DARK', 'LIGHT', 'SYSTEM'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )

    account_type_enum = postgresql.ENUM('CREATIVE_TALENT', 'PRODUCTION_HOUSE', name='account_type_enum', create_type=False)
    availability_status_enum = postgresql.ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE', name='availability_status_enum', create_type=False)
    stream_quality_enum = postgresql.ENUM('AUTO', 'LOW', 'MEDIUM', 'HIGH', name='stream_quality_enum', create_type=False)
    theme_mode_enum = postgresql.ENUM('DARK', 'LIGHT', 'SYSTEM', name='theme_mode_enum', create_type=False)

    # 2. Create user_settings table
    op.create_table(
        'user_settings',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
        sa.Column('account_type', account_type_enum, nullable=False, server_default='CREATIVE_TALENT'),
        sa.Column('availability_status', availability_status_enum, nullable=False, server_default='AVAILABLE'),
        sa.Column('rate_currency', sa.String(length=3), nullable=False, server_default='USD'),
        sa.Column('day_rate', sa.DECIMAL(precision=10, scale=2), nullable=True),
        sa.Column('primary_role', sa.String(length=100), nullable=True),
        sa.Column('secondary_crafts', postgresql.ARRAY(sa.String(length=50)), nullable=True),
        sa.Column('union_affiliations', sa.String(length=200), nullable=True),
        sa.Column('willing_to_travel', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('portfolio_url', sa.String(length=512), nullable=True),
        sa.Column('resume_url', sa.String(length=512), nullable=True),
        sa.Column('company_name', sa.String(length=200), nullable=True),
        sa.Column('tax_id', sa.String(length=100), nullable=True),
        sa.Column('registered_address', sa.Text(), nullable=True),
        sa.Column('verified_banner', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('default_nda_template', sa.Text(), nullable=True),
        sa.Column('is_two_factor_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('identity_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('notify_chat', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_application_status', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_casting_matches', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_email_digest', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('notify_sms_urgent', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('dnd_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('dnd_start_time', sa.String(length=10), nullable=True),
        sa.Column('dnd_end_time', sa.String(length=10), nullable=True),
        sa.Column('stream_quality', stream_quality_enum, nullable=False, server_default='AUTO'),
        sa.Column('cached_media_bytes', sa.Integer(), nullable=False, server_default='124000000'),
        sa.Column('theme_mode', theme_mode_enum, nullable=False, server_default='DARK'),
        sa.Column('account_status', sa.String(length=20), nullable=False, server_default='ACTIVE'),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_user_settings_user_id', 'user_settings', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_user_settings_user_id', table_name='user_settings')
    op.drop_table('user_settings')
    op.execute("DROP TYPE IF EXISTS theme_mode_enum")
    op.execute("DROP TYPE IF EXISTS stream_quality_enum")
    op.execute("DROP TYPE IF EXISTS availability_status_enum")
    op.execute("DROP TYPE IF EXISTS account_type_enum")
