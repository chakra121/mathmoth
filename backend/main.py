from fastapi import FastAPI
from database import get_db
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.admin_tests import router as admin_tests_router
from routes.admin_questions import router as admin_questions_router
from routes.admin_test_links import router as admin_test_links_router
from routes.student_tests import router as student_tests_router
from routes.student_submissions import router as student_submissions_router
from routes.admin_reports import router as admin_reports_router
from routes.health import router as health_router
from routes.admin_passwords import router as admin_passwords_router

app = FastAPI(title="Mathmoth API")
app.include_router(auth_router)
app.include_router(admin_tests_router)
app.include_router(admin_questions_router)
app.include_router(admin_test_links_router, prefix="/admin")
app.include_router(student_tests_router, prefix="/student")
app.include_router(student_submissions_router)
app.include_router(admin_reports_router)
app.include_router(health_router)
app.include_router(admin_passwords_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mathmoth.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Mathmoth backend is running 🚀"}

@app.get("/test-db")
def test_db():
    db = get_db()
    collections = db.list_collection_names()
    return {"collections": collections}