from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import json
from datetime import datetime, timedelta, timezone
import hashlib
import uuid
import asyncio
import requests
import re


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models for Via Sacra
class Station(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: int
    title: str
    image_url: str
    versicle: str
    meditation: str
    prayer: str
    standard_prayers: str
    hymn: str

class IntroText(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    title: str
    text: str

class FinalPrayer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    title: str
    text: str

class RoomCreateRequest(BaseModel):
    name: str = Field(..., min_length=1)
    password: str = Field(..., min_length=4)

class RoomJoinRequest(BaseModel):
    room_id: str
    password: str

class RoomStationUpdate(BaseModel):
    station: int = Field(..., ge=1, le=14)
    host_token: str

class RoomInfo(BaseModel):
    room_id: str
    name: str
    expires_at: datetime
    current_station: int

class RoomCreatedResponse(RoomInfo):
    host_token: str

class RoomListItem(BaseModel):
    room_id: str
    name: str
    expires_at: datetime


class AdminRoomListItem(BaseModel):
    room_id: str
    name: str
    password: str
    participant_count: int
    active: bool
    current_station: int
    created_at: datetime
    expires_at: datetime


# Initialize database with Via Sacra data
async def init_db():
    try:
        # Check if data already exists
        count = await db.stations.count_documents({})
        if count > 0:
            logger.info("Database already initialized")
            return
        
        # Load design guidelines
        design_file = Path(__file__).parent.parent / 'design_guidelines.json'
        with open(design_file, 'r', encoding='utf-8') as f:
            design_data = json.load(f)
        
        # Insert intro
        intro_data = design_data['data_seed']['intro']
        await db.intro.delete_many({})
        await db.intro.insert_one(intro_data)
        
        # Insert stations
        stations_data = design_data['data_seed']['stations']
        await db.stations.delete_many({})
        await db.stations.insert_many(stations_data)
        
        # Insert final prayers
        final_prayers_data = design_data['data_seed']['final_prayers']
        await db.final_prayers.delete_many({})
        await db.final_prayers.insert_many(final_prayers_data)
        
        logger.info("Database initialized with Via Sacra data")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def normalize_room_name(name: str) -> str:
    return " ".join(name.split()).strip().lower()

async def expire_rooms_if_needed():
    now = datetime.now(timezone.utc)
    await db.rooms.update_many(
        {"active": True, "expires_at": {"$lte": now}},
        {"$set": {"active": False}},
    )

async def expire_rooms_loop():
    while True:
        await expire_rooms_if_needed()
        await asyncio.sleep(60 * 10)

def room_to_info(room) -> RoomInfo:
    expires_at = ensure_utc(room["expires_at"])
    return RoomInfo(
        room_id=room["room_id"],
        name=room["name"],
        expires_at=expires_at,
        current_station=room["current_station"],
    )

def ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)

def verify_google_token(token: str) -> str:
    response = requests.get(
        "https://oauth2.googleapis.com/tokeninfo",
        params={"id_token": token},
        timeout=5,
    )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Token inválido.")
    data = response.json()
    email = data.get("email")
    if not email or str(data.get("email_verified")).lower() != "true":
        raise HTTPException(status_code=401, detail="Email não verificado.")
    return email

async def require_admin(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Credenciais ausentes.")
    token = authorization.split(" ", 1)[1]
    email = await asyncio.to_thread(verify_google_token, token)
    allowed_email = os.environ.get("ADMIN_ALLOWED_EMAIL", "oscar.romanini.jr@gmail.com")
    if email.lower() != allowed_email.lower():
        raise HTTPException(status_code=403, detail="Acesso não autorizado.")
    return email


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Via Sacra API"}

@api_router.get("/intro", response_model=IntroText)
async def get_intro():
    intro = await db.intro.find_one({}, {"_id": 0})
    if not intro:
        raise HTTPException(status_code=404, detail="Intro not found")
    return intro

@api_router.get("/stations", response_model=List[Station])
async def get_all_stations():
    stations = await db.stations.find({}, {"_id": 0}).sort("id", 1).to_list(14)
    return stations

@api_router.get("/stations/{station_id}", response_model=Station)
async def get_station(station_id: int):
    if station_id < 1 or station_id > 14:
        raise HTTPException(status_code=400, detail="Station ID must be between 1 and 14")
    
    station = await db.stations.find_one({"id": station_id}, {"_id": 0})
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")
    return station

@api_router.get("/final-prayers", response_model=List[FinalPrayer])
async def get_final_prayers():
    prayers = await db.final_prayers.find({}, {"_id": 0}).to_list(10)
    return prayers

@api_router.get("/rooms", response_model=List[RoomListItem])
async def list_rooms():
    await expire_rooms_if_needed()
    rooms = await db.rooms.find(
        {"active": True, "expires_at": {"$gt": datetime.now(timezone.utc)}},
        {"_id": 0, "password_hash": 0, "host_token": 0},
    ).sort("created_at", -1).to_list(100)
    for room in rooms:
        room["expires_at"] = ensure_utc(room["expires_at"])
    return [RoomListItem(**room) for room in rooms]

@api_router.post("/rooms", response_model=RoomCreatedResponse)
async def create_room(room: RoomCreateRequest):
    now = datetime.now(timezone.utc)
    await expire_rooms_if_needed()
    name = room.name.strip()
    normalized_name = normalize_room_name(name)
    existing_room = await db.rooms.find_one(
        {
            "active": True,
            "$or": [
                {"name_normalized": normalized_name},
                {"name": {"$regex": f"^{re.escape(name)}$", "$options": "i"}},
            ],
        },
        {"_id": 1},
    )
    if existing_room:
        raise HTTPException(status_code=409, detail="Esse nome de sala já existe.")
    room_id = str(uuid.uuid4())
    expires_at = now + timedelta(hours=24)
    host_token = str(uuid.uuid4())

    new_room = {
        "room_id": room_id,
        "name": name,
        "name_normalized": normalized_name,
        "password_plain": room.password,
        "password_hash": hash_password(room.password),
        "created_at": now,
        "expires_at": expires_at,
        "active": True,
        "current_station": 1,
        "participant_count": 1,
        "host_token": host_token,
    }
    await db.rooms.insert_one(new_room)
    return RoomCreatedResponse(
        room_id=room_id,
        name=new_room["name"],
        expires_at=expires_at,
        current_station=1,
        host_token=host_token,
    )

@api_router.post("/rooms/join", response_model=RoomInfo)
async def join_room(payload: RoomJoinRequest):
    await expire_rooms_if_needed()
    room = await db.rooms.find_one(
        {"room_id": payload.room_id, "active": True},
        {"_id": 0},
    )
    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada ou expirada.")
    if ensure_utc(room["expires_at"]) <= datetime.now(timezone.utc):
        await db.rooms.update_one(
            {"room_id": payload.room_id},
            {"$set": {"active": False}},
        )
        raise HTTPException(status_code=404, detail="Sala não encontrada ou expirada.")
    if hash_password(payload.password) != room["password_hash"]:
        raise HTTPException(status_code=401, detail="Senha incorreta.")
    await db.rooms.update_one(
        {"room_id": payload.room_id},
        {"$inc": {"participant_count": 1}},
    )
    return room_to_info(room)

@api_router.get("/rooms/{room_id}", response_model=RoomInfo)
async def get_room(room_id: str):
    await expire_rooms_if_needed()
    room = await db.rooms.find_one(
        {"room_id": room_id, "active": True},
        {"_id": 0},
    )
    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada ou expirada.")
    if ensure_utc(room["expires_at"]) <= datetime.now(timezone.utc):
        await db.rooms.update_one(
            {"room_id": room_id},
            {"$set": {"active": False}},
        )
        raise HTTPException(status_code=404, detail="Sala não encontrada ou expirada.")
    return room_to_info(room)

@api_router.patch("/rooms/{room_id}/station", response_model=RoomInfo)
async def update_room_station(room_id: str, payload: RoomStationUpdate):
    await expire_rooms_if_needed()
    room = await db.rooms.find_one(
        {"room_id": room_id, "active": True},
        {"_id": 0},
    )
    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada ou expirada.")
    if room["host_token"] != payload.host_token:
        raise HTTPException(status_code=403, detail="Apenas o anfitrião pode avançar.")
    await db.rooms.update_one(
        {"room_id": room_id},
        {"$set": {"current_station": payload.station}},
    )
    room["current_station"] = payload.station
    return room_to_info(room)

@api_router.get("/admin/rooms", response_model=List[AdminRoomListItem])
async def list_admin_rooms(name: Optional[str] = None, _: str = Depends(require_admin)):
    await expire_rooms_if_needed()
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    rooms = await db.rooms.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    result = []
    for room in rooms:
        room["created_at"] = ensure_utc(room["created_at"])
        room["expires_at"] = ensure_utc(room["expires_at"])
        result.append(
            AdminRoomListItem(
                room_id=room["room_id"],
                name=room["name"],
                password=room.get("password_plain", ""),
                participant_count=room.get("participant_count", 0),
                active=room.get("active", False),
                current_station=room.get("current_station", 1),
                created_at=room["created_at"],
                expires_at=room["expires_at"],
            )
        )
    return result

@api_router.patch("/admin/rooms/{room_id}/deactivate", response_model=AdminRoomListItem)
async def deactivate_room(room_id: str, _: str = Depends(require_admin)):
    await db.rooms.update_one(
        {"room_id": room_id},
        {"$set": {"active": False, "deactivated_at": datetime.now(timezone.utc)}},
    )
    room = await db.rooms.find_one({"room_id": room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada.")
    room["created_at"] = ensure_utc(room["created_at"])
    room["expires_at"] = ensure_utc(room["expires_at"])
    return AdminRoomListItem(
        room_id=room["room_id"],
        name=room["name"],
        password=room.get("password_plain", ""),
        participant_count=room.get("participant_count", 0),
        active=room.get("active", False),
        current_station=room.get("current_station", 1),
        created_at=room["created_at"],
        expires_at=room["expires_at"],
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    await init_db()
    app.state.expire_rooms_task = asyncio.create_task(expire_rooms_loop())

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    task = getattr(app.state, "expire_rooms_task", None)
    if task:
        task.cancel()
