# Container chạy Flask app thật trên Cloud Run (đứng sau Firebase Hosting rewrite).
FROM python:3.12-slim

WORKDIR /app

COPY slide/requirements.txt ./slide/requirements.txt
RUN pip install --no-cache-dir -r slide/requirements.txt

COPY app.py ./app.py
COPY slide ./slide

ENV PYTHONUNBUFFERED=1

# Cloud Run cấp cổng qua biến môi trường PORT (mặc định 8080).
CMD exec gunicorn --bind :${PORT:-8080} --workers 1 --threads 8 --timeout 0 app:app
