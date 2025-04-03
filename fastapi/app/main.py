from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import user, ticket, comment, health, feature_request, stats, search, upload, dashboard
from app.database import engine, Base, init_db

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(  
    title="SupportSync API",
    description="A ticketing system API with user management and feature requests",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(user.router, prefix="/api", tags=["Authentication & Users"])
app.include_router(user.auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(ticket.router, prefix="/api", tags=["Tickets"])
app.include_router(comment.router, prefix="/api", tags=["Comments"])
app.include_router(feature_request.router, prefix="/api", tags=["Feature Requests"])
app.include_router(stats.router, prefix="/api", tags=["Statistics"])
app.include_router(search.router, prefix="/api", tags=["Search"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])

@app.get("/")
async def root():
    return {"message": "Welcome to SupportSync API"}