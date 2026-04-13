# Face Recognition

## Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
```

### Activate Virtual Environment

**Windows (Command Prompt):**
```bash
venv\Scripts\activate
```

**Windows (Git Bash):**
```bash
source venv/Scripts/activate
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Backend Server

```bash
uvicorn app.main:app --reload
```

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
