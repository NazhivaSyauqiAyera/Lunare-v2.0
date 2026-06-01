from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
import models

from schemas.user_schema import UserCreate, UserLogin, UserProfileUpdate, UserProfileResponse
from utils.auth_middleware import get_current_user
from utils.hashing import hash_password, verify_password
from utils.jwt_handler import create_access_token

router = APIRouter()

# DATABASE SESSION
def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# REGISTER
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = hash_password(user.password)

    new_user = models.User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully"
    }


# LOGIN
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not db_user:

        raise HTTPException(
            status_code=400,
            detail="Invalid email"
        )

    if not verify_password(user.password, db_user.password):

        raise HTTPException(
            status_code=400,
            detail="Invalid password"
        )

    token = create_access_token({
        "user_id": db_user.id
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# GET PROFILE
@router.get("/profile", response_model=UserProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


# UPDATE PROFILE
@router.put("/profile")
def update_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user)
):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if profile_data.email:
        # Check if email is already taken by someone else
        existing = db.query(models.User).filter(
            models.User.email == profile_data.email,
            models.User.id != user_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        db_user.email = profile_data.email

    if profile_data.username:
        db_user.username = profile_data.username

    if profile_data.password:
        db_user.password = hash_password(profile_data.password)

    db.commit()
    db.refresh(db_user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email
        }
    }