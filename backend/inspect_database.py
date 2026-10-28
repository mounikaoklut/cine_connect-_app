import asyncio
from sqlalchemy import text
from app.database import engine

async def main():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text(
                "SELECT current_database(), current_schema(), current_user"
            ))
            print("ACTIVE DATABASE:", result.fetchone())

            result = await conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """))
            print("\nPUBLIC TABLES:")
            print([row[0] for row in result.fetchall()])

            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                AND table_name = 'users'
                ORDER BY ordinal_position
            """))
            print("\nUSERS TABLE COLUMNS:")
            for row in result.fetchall():
                print(row)

    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())