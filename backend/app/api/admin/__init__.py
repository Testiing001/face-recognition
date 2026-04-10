from fastapi import APIRouter, Depends
from app.api.admin.dependencies import get_current_admin
from app.api.admin import upload, view, delete, facegroups

router = APIRouter(dependencies=[Depends(get_current_admin)])

router.include_router(upload.router)
router.include_router(view.router)
router.include_router(delete.router)
router.include_router(facegroups.router)