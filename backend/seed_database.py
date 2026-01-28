#!/usr/bin/env python3
"""
Script para popular o banco de dados MongoDB com os dados da Via Sacra.

Uso local:
  python backend/seed_database.py

Uso via Docker (recomendado):
  docker compose run --rm backend python backend/seed_database.py
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError


def seed_database() -> None:
    # Resolve paths (funciona igual local e no Docker)
    backend_dir = Path(__file__).resolve().parent            # .../backend
    project_root = backend_dir.parent                        # .../ (raiz do repo)

    # Load environment variables from backend/.env (se existir)
    env_path = backend_dir / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    else:
        print(f"ℹ️  Aviso: .env não encontrado em {env_path} (seguindo com defaults/vars do ambiente).")

    # MongoDB connection
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    db_name = os.environ.get("DB_NAME", "test_database")

    # JSON path (na raiz do projeto)
    json_path = Path(__file__).resolve().parent / "via_sacra_data.json"

    if not json_path.exists():
        raise FileNotFoundError(
            "Arquivo via_sacra_data.json não encontrado.\n"
            f"Esperado em: {json_path}\n\n"
            "Dica: coloque o arquivo na raiz do projeto (mesmo nível do docker-compose.yml)."
        )

    print(f"📄 Lendo dados de: {json_path}")
    print(f"🗄️  Mongo URL: {mongo_url}")
    print(f"🧱 DB Name:   {db_name}")

    client = None
    try:
        # timeout pra não travar quando a URL está errada
        client = MongoClient(mongo_url, serverSelectionTimeoutMS=5000)

        # força conexão agora (ping)
        client.admin.command("ping")

        db = client[db_name]

        existing_intro = db.intro.count_documents({})
        existing_stations = db.stations.count_documents({})
        existing_final_prayers = db.final_prayers.count_documents({})

        if any((existing_intro, existing_stations, existing_final_prayers)):
            print("\n✅ Banco já populado. Ignorando seed.")
            print(f"   - Intro:         {existing_intro} documento")
            print(f"   - Estações:      {existing_stations} documentos")
            print(f"   - Orações finais:{existing_final_prayers} documentos")
            return

        # Load JSON data
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Validação mínima
        for key in ("intro", "stations", "final_prayers"):
            if key not in data:
                raise ValueError(f"JSON inválido: chave obrigatória '{key}' não encontrada.")

        # Insert intro
        print("➡️  Inserindo oração inicial...")
        db.intro.insert_one(data["intro"])

        # Insert stations
        print(f"➡️  Inserindo {len(data['stations'])} estações...")
        db.stations.insert_many(data["stations"])

        # Insert final prayers
        print(f"➡️  Inserindo {len(data['final_prayers'])} orações finais...")
        db.final_prayers.insert_many(data["final_prayers"])

        # Verify
        print("\n✅ Dados inseridos com sucesso!")
        print(f"   - Intro:         {db.intro.count_documents({})} documento")
        print(f"   - Estações:      {db.stations.count_documents({})} documentos")
        print(f"   - Orações finais:{db.final_prayers.count_documents({})} documentos")

    except ServerSelectionTimeoutError as e:
        raise RuntimeError(
            "Falha ao conectar no MongoDB (timeout).\n"
            f"MONGO_URL atual: {mongo_url}\n\n"
            "Se estiver rodando no Docker, use:\n"
            "  MONGO_URL=mongodb://mongo:27017\n"
            "e tenha o serviço 'mongo' no docker-compose.\n"
        ) from e
    finally:
        if client is not None:
            client.close()


if __name__ == "__main__":
    try:
        seed_database()
    except Exception as e:
        print(f"\n❌ Erro ao popular banco de dados: {e}")
        sys.exit(1)
