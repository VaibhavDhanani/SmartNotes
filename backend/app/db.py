from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from decouple import config

db_user = config("DB_USER", default="vaibhav")
db_password = config("DB_PASSWORD", default="smart0911102")
db_host = config("DB_HOST", default="localhost")
db_port = config("DB_PORT", default="5432")
db_name = config("DB_NAME", default="smartnotes")

DATABASE_URL = (
    f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
)


engine = create_async_engine(
    DATABASE_URL,
    echo=True,
)

AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()


async def get_db():
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()
