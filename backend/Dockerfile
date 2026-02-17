# --- Build stage ---
FROM python:3.12-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para psycopg2 y asyncpg
RUN apt-get update && apt-get install -y --no-install-recommends \
  build-essential \
  libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Copia e instala dependencias de Python
COPY requirements.txt .
RUN pip install --upgrade pip && \
  pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Runtime stage ---
FROM python:3.12-slim AS runtime

WORKDIR /app

# Dependencias de sistema mínimas para runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
  libpq5 \
  && rm -rf /var/lib/apt/lists/*

# Copia dependencias instaladas desde el builder
COPY --from=builder /install /usr/local

# Copiar el código fuente
COPY app/ ./app/

# Usuario no root por seguridad
RUN addgroup --system habitare && \ 
  adduser --system --ingroup habitare habitare
USER habitare

# Puerto expuesto
EXPOSE 8000

# Health check interno del contenedor
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

# Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]