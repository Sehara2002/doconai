
from fastapi import APIRouter, HTTPException, status,Response
from models.user import UserCreate,UserLogin
from controllers.authController import AuthService
from fastapi import Depends, Request,Response
from utils import decode_token  
import os
from db.database import users_collection
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

PRODUCTION = os.getenv("PRODUCTION", "false").lower() == "true"
DOMAIN = os.getenv("DOMAIN", "localhost")
# Security configurations

ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"

router = APIRouter(tags=["Auth"], prefix="/auth")

@router.get("/me")
async def get_current_user(request: Request):
    # Get token directly from Authorization header as fallback
    
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
    else:
        # Try getting from cookies
        token = request.cookies.get("access_token")
        print(token)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    try:
        payload = decode_token(token, SECRET_KEY, ALGORITHM)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        user = await users_collection.find_one({"id": user_id}, {"_id": 0, "hashed_password": 0})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing refresh token"
        )
    
    try:
        payload = decode_token(refresh_token, SECRET_KEY, ALGORITHM)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Create new tokens
        tokens = await AuthService.create_tokens(user_id)
        
        # Set new cookies
        response.set_cookie(
            key="access_token",
            value=tokens.access_token,
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            samesite="lax"
        )
        
        response.set_cookie(
            key="refresh_token",
            value=tokens.refresh_token,
            httponly=True,
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            samesite="lax"
        )
        
        return {"message": "Tokens refreshed successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token refresh failed: {str(e)}"
        )

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(
    user: UserCreate,
    response: Response
):
    try:
        tokens = await AuthService.register(user)
        
        # Set HTTP-only cookies
        response.set_cookie(
            key="access_token",
            value=tokens.access_token,
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure= "production",
            samesite="lax"
        )
        
        response.set_cookie(
            key="refresh_token",
            value=tokens.refresh_token,
            httponly=True,
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            secure="production",
            samesite="lax"
        )
        
        return {"message": "User created successfully"}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )

@router.post("/login", status_code=status.HTTP_200_OK)
async def login(user_data: UserLogin,response: Response):
    try:
        
        # Authenticate user
        user = await AuthService.authenticate_user(user_data.email, user_data.password)
        if not user:
            raise ValueError("Invalid email or password")
        
        
        # Generate tokens
        tokens = await AuthService.create_tokens(user["id"])
        
        
        # Set HTTP-only cookies
        response.set_cookie(
            key="access_token",
            value=tokens.access_token,
            httponly=True,
            max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            secure=False, 
            samesite="lax",
            domain=DOMAIN,
            path="/"
        )
        
        response.set_cookie(
            key="refresh_token",
            value=tokens.refresh_token,
            httponly=True,
            max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
            secure=False,
            samesite="lax",
            domain=DOMAIN,
            path="/"
        )
        
        return {"message": "Login successful", "user_id": user["id"]}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

