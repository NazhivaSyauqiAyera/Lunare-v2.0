from pydantic import BaseModel
from datetime import date

class PeriodCreate(BaseModel):
    start_date: date
    end_date: date
    mood: str