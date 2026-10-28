
import asyncio
import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine

load_dotenv()

async def test_connection():
    database_url = os.getenv("DATABASE_URL")
    engine = create_async_engine(database_url)

    try:
        async with engine.connect() as connection:
            result = await connection.exec_driver_sql(
                "SELECT current_database(), current_user"
            )
            print("Database connection successful!")
            print("Database and user:", result.fetchone())
    finally:
        await engine.dispose()

asyncio.run(test_connection())
