from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://alfabetizacao:alfabetizacao_secret@localhost:5432/alfabetizacao"
    secret_key: str = "super-secret-key-change-in-production"
    jwt_expiry_hours: int = 24
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    unsplash_access_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
