from fastapi import FastAPI
from core import error_handlers
from routes import  sessionRoutes, messageRoutes,auth
from db.database import connect_to_mongo, close_mongo_connection
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

# Include routers
app.include_router(sessionRoutes.router)
app.include_router(messageRoutes.router)
app.include_router(auth.router)

# Add exception handlers
app.add_exception_handler(Exception, error_handlers.global_exception_handler)
app.add_exception_handler(RequestValidationError, error_handlers.validation_exception_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()