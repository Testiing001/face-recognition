from fastapi import APIRouter, Depends
from app.dependencies.auth import get_current_admin
from app.api.admin import profile, upload, view, delete, facegroups

router = APIRouter(dependencies=[Depends(get_current_admin)])

router.include_router(profile.router)
router.include_router(upload.router)
router.include_router(view.router)
router.include_router(delete.router)
router.include_router(facegroups.router)