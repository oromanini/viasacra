# Via Sacra Interativa - Setup Local

## Pré-requisitos

- Python 3.8+
- Node.js 16+
- MongoDB instalado e rodando localmente

## Instalação

### 1. Backend (FastAPI)

```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Popular o banco de dados
python seed_database.py

# Iniciar o servidor (porta 8001)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Frontend (React)

```bash
cd frontend

# Instalar dependências
yarn install

# Atualizar .env com URL do backend local
# Edite frontend/.env e altere:
# REACT_APP_BACKEND_URL=http://localhost:8001

# Iniciar o servidor de desenvolvimento (porta 3000)
yarn start
```

## Acessar a aplicação

Abra o navegador em: `http://localhost:3000`

## Estrutura do Projeto

```
/
├── backend/
│   ├── server.py              # API FastAPI
│   ├── seed_database.py       # Script para popular MongoDB
│   ├── requirements.txt       # Dependências Python
│   └── .env                   # Configurações (MongoDB URL)
├── frontend/
│   ├── src/
│   │   ├── App.js            # Componente principal
│   │   ├── pages/            # Páginas da aplicação
│   │   │   ├── IntroPage.js
│   │   │   ├── ViaSacraPage.js
│   │   │   └── FinalPage.js
│   │   └── components/       # Componentes reutilizáveis
│   │       ├── ViaMap.js
│   │       ├── StationCard.js
│   │       └── Navigation.js
│   ├── package.json          # Dependências Node
│   └── .env                  # URL do backend
└── via_sacra_data.json       # Dados das 14 estações

```

## Dados da Via Sacra

Todos os textos, orações e meditações das 14 estações estão no arquivo `via_sacra_data.json` na raiz do projeto. O script `seed_database.py` lê este arquivo e popula o MongoDB.

## Endpoints da API

- `GET /api/intro` - Oração inicial
- `GET /api/stations` - Lista todas as 14 estações
- `GET /api/stations/{id}` - Retorna estação específica (1-14)
- `GET /api/final-prayers` - Orações finais

## Troubleshooting

### MongoDB não está rodando

```bash
# Ubuntu/Debian
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB
```

### Dados não aparecem na aplicação

Execute novamente o script de seed:
```bash
cd backend
python seed_database.py
```

### Erro de CORS

Certifique-se de que o backend está configurado corretamente no arquivo `frontend/.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## Features

✅ Mapa visual interativo com 14 estações  
✅ Cores litúrgicas (roxo, dourado, cinza)  
✅ Personagem que avança pelo mapa  
✅ Navegação próximo/anterior  
✅ Textos completos de Santo Afonso de Ligório  
✅ Design acessível para pessoas mais velhas  
✅ Responsivo (mobile e desktop)
