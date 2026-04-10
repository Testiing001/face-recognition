from fastapi import FastAPI
from app.middleware.middleware import add_middlewares
from app.api import auth, search, admin

app = FastAPI()

add_middlewares(app)

app.include_router(auth.router, prefix="/auth")
app.include_router(search.router, prefix="/search")
app.include_router(admin.router, prefix="/admin")
