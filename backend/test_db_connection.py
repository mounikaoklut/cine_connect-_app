import asyncio
from sqlalchemy import text
from app.database import engine


async def main():
    try:
        async with engine.connect() as connection:
            result = await connection.execute(text("SELECT current_database(), current_user"))
            database, username = result.one()

            tables_result = await connection.execute(
                text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name")
            )
            tables = [r[0] for r in tables_result.fetchall()]

            print("Database connection successful!")
            print(f"Database: {database}")
            print(f"User: {username}")
            print(f"Tables in public schema ({len(tables)}): {tables}")

    except Exception as error:
        print("Database connection failed.")
        print(f"Error: {error}")

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
