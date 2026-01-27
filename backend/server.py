from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import json


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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()