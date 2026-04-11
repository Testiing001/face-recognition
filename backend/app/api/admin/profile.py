from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_admin

router = APIRouter()

@router.get("/profile")
def get_admin_profile(admin=Depends(get_current_admin)):
    return admin