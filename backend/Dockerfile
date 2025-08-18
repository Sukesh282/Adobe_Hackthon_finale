 # Stage 1: Builder with Virtual Environment
FROM python:3.9-slim-bullseye as builder
WORKDIR /app
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final Production Image
FROM python:3.9-slim-bullseye
WORKDIR /app
# Copy only the necessary parts from the builder stage
COPY --from=builder /opt/venv /opt/venv
# Copy the application code
COPY ./app /app/app
# Copy the model that was downloaded manually before the build
COPY ./models /app/models
# Use the virtual environment's Python and packages
ENV PATH="/opt/venv/bin:$PATH"
# Ensure the uploads and audio directories exist
RUN mkdir -p /app/uploads /app/audio_files /app/db
EXPOSE 8000
# Run the application using the Uvicorn ASGI server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
