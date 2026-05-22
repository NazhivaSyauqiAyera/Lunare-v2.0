from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Period
from schemas.period_schema import PeriodCreate

router = APIRouter()

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/periods")
def create_period(
    period: PeriodCreate,
    db: Session = Depends(get_db)
):

    new_period = Period(
        start_date=period.start_date,
        end_date=period.end_date,
        mood=period.mood
    )

    db.add(new_period)
    db.commit()

    return {
        "message": "Data period berhasil ditambahkan"
    }


@router.get("/periods")
def get_periods(db: Session = Depends(get_db)):

    periods = db.query(Period).all()

    return periods

@router.put("/periods/{id}")
def update_period(
    id: int,
    period: PeriodCreate,
    db: Session = Depends(get_db)
):

    existing_period = db.query(Period).filter(
        Period.id == id
    ).first()

    if not existing_period:
        return {
            "message": "Data tidak ditemukan"
        }

    existing_period.start_date = period.start_date
    existing_period.end_date = period.end_date
    existing_period.mood = period.mood

    db.commit()

    return {
        "message": "Data berhasil diupdate"
    }    

@router.delete("/periods/{id}")
def delete_period(
    id: int,
    db: Session = Depends(get_db)
):

    period = db.query(Period).filter(
        Period.id == id
    ).first()

    if not period:
        return {
            "message": "Data tidak ditemukan"
        }

    db.delete(period)
    db.commit()

    return {
        "message": "Data berhasil dihapus"
    }    