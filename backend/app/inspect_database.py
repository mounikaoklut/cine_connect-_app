```python
import asyncio
from sqlalchemy import text
from app.database import engine


async def main():
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT current_database(), current_schema(), current_user
            """))
            print("=== ACTIVE DATABASE ===")
            print(result.fetchone())

            result = await conn.execute(text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND table_type = 'BASE TABLE'
                ORDER BY table_name
            """))
            print("\n=== PUBLIC TABLES ===")
            print([row[0] for row in result.fetchall()])

            result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'users'
                ORDER BY ordinal_position
            """))
            print("\n=== USERS COLUMNS ===")
            columns = result.fetchall()

            if columns:
                for row in columns:
                    print(
                        f"{row[0]} | {row[1]} | nullable={row[2]}"
                    )
            else:
                print("No public.users table found.")

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
```