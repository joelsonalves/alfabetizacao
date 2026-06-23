from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://alfabetizacao:alfabetizacao_secret@localhost:5432/alfabetizacao"
    secret_key: str = "super-secret-key-change-in-production"
    jwt_expiry_hours: int = 24
    jwt_refresh_expiry_hours: int = 168
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    log_level: str = "INFO"
    unsplash_access_key: str = ""

    # Redis
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: str = ""
    redis_ttl_config: int = 300
    redis_ttl_catalog: int = 3600
    redis_enabled: bool = True

    class Config:
        env_file = ".env"


settings = Settings()
