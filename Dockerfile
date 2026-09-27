FROM python:3.13-slim as backend-builder

WORKDIR /app
COPY backend/requirements.txt .
# Remove passlib as it has a bug with Python 3.13 and bcrypt, we fixed it in our code
RUN sed -i '/passlib/d' requirements.txt
RUN pip install --no-cache-dir -r requirements.txt bcrypt

# Node builder for frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Final production image
FROM python:3.13-slim
WORKDIR /app

# Copy python dependencies
COPY --from=backend-builder /usr/local/lib/python3.13/site-packages /usr/local/lib/python3.13/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend code
COPY backend/ /app/

# Copy frontend dist to be served by FastAPI
COPY --from=frontend-builder /app/dist /frontend/dist

# Expose port
EXPOSE 8000

# Start server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
