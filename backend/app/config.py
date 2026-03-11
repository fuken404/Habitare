from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import Literal

class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    case_sensitive=False,
    extra="ignore",
  )
  
  # --- Aplicación ---
  APP_NAME: str = "Habitare API"
  APP_VERSION: str = "0.1.0"
  ENVIRONMENT: Literal["development", "staging", "production"] = "development"
  DEBUG: bool = False
  
  # --- Base de datos ---
  POSTGRES_HOST: str
  POSTGRES_PORT: int = 5432
  POSTGRES_DB: str
  POSTGRES_USER: str
  POSTGRES_PASSWORD: str
  
  @property
  def db_url(self) -> str:
      return (
          f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
          f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
      )
  
  @property
  def db_url_sync(self) -> str:
      return (
          f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
          f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
      )
  
  # --- JWT ---
  JWT_SECRET_KEY: str
  JWT_ALGORITHM: str = "HS256"
  JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
  JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
  
  # --- CORS ---
  ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
  
  # --- Rate limiting ---
  RATE_LIMIT_PER_MINUTE: int = 60

  # --- Email (SMTP) ---
  SMTP_HOST: str = "smtp.gmail.com"
  SMTP_PORT: int = 587
  SMTP_USER: str = ""
  SMTP_PASSWORD: str = ""
  SMTP_FROM: str = "Habitare <noreply@habitare.com>"
  SMTP_ENABLED: bool = False

  # --- Validaciones ---
  @field_validator("JWT_SECRET_KEY")
  @classmethod
  def jwt_secret_must_be_strong(cls, v: str) -> str:
    if len(v) < 32:
      raise ValueError("JWT_SECRET_KEY deve tener mínimo 32 carácteres")
    return v
  
  @field_validator("ENVIRONMENT")
  @classmethod
  def debug_only_in_device(cls, v: str) -> str:
    return v
  
settings = Settings()