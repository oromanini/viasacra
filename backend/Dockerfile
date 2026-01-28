FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
  && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt

# remove a dependencia que nao existe no pip
RUN grep -v -i '^emergentintegrations==' requirements.txt > /app/requirements.docker.txt \
 && pip install --no-cache-dir -r /app/requirements.docker.txt

COPY . /app

EXPOSE 8000
