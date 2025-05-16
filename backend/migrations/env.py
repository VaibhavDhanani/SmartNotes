import asyncio
from logging.config import fileConfig
import os
import urllib.parse
from decouple import config as Config

from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

# Alembic Config object
config = context.config

# Set up logging
fileConfig(config.config_file_name)


# Construct async DATABASE_URL


db_user = urllib.parse.quote_plus(Config("DB_USER", default="vaibhav"))
db_password = urllib.parse.quote_plus(Config("DB_PASSWORD", default="smart@0911102"))
db_host = Config("DB_HOST", default="localhost")
db_port = Config("DB_PORT", default="5432")
db_name = Config("DB_NAME", default="smartnotes")

DATABASE_URL = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"


# Set in Alembic config
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Import your models' metadata
from app.models.models import Base
target_metadata = Base.metadata

# Async migration function
def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = create_async_engine(DATABASE_URL, poolclass=None)

    async with connectable.connect() as connection:
        def do_migrations(sync_conn):
            context.configure(
                connection=sync_conn,
                target_metadata=target_metadata,
            )
            with context.begin_transaction():
                context.run_migrations()

        await connection.run_sync(do_migrations)

    await connectable.dispose()


# Main runner
if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())