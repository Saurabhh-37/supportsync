# SupportSync

SupportSync is a comprehensive support ticket and feature request management system built with React and FastAPI. It provides a modern, responsive interface for managing support tickets, feature requests, and user interactions.

## Technology Stack

### Frontend
- React 19.0.0
- Material-UI (MUI) v6
- Redux Toolkit for state management
- React Router v7 for navigation
- Chart.js for data visualization
- Axios for API communication

### Backend
- FastAPI 0.104.1
- SQLAlchemy 2.0.23 for ORM
- Pydantic for data validation
- Python-Jose for JWT authentication
- Passlib for password hashing
- Uvicorn as ASGI server

## Prerequisites

- Node.js (v16 or higher)
- Python 3.8 or higher
- pip (Python package manager)
- Git

## Installation

### Clone the Repository

```bash
git clone https://github.com/yourusername/supportsync.git
cd supportsync
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
REACT_APP_API_URL=http://localhost:8000
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd fastapi
```

2. Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/MacOS
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```bash
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./sql_app.db
```

## Running the Application

### Start the Backend Server

1. Navigate to the backend directory:
```bash
cd fastapi
```

2. Activate the virtual environment (if not already activated):
```bash
# Windows
.\venv\Scripts\activate

# Linux/MacOS
source venv/bin/activate
```

3. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start the Frontend Development Server

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Authentication

#### Login
- **POST** `/api/auth/login`
```json
// Request
{
    "username": "user@example.com",
    "password": "password123"
}

// Response
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "token_type": "bearer"
}
```

### Tickets

#### Create Ticket
- **POST** `/api/tickets`
```json
// Request
{
    "title": "Issue with login",
    "description": "Unable to login to the application",
    "priority": "HIGH",
    "category": "BUG"
}

// Response
{
    "id": 1,
    "title": "Issue with login",
    "description": "Unable to login to the application",
    "priority": "HIGH",
    "category": "BUG",
    "status": "OPEN",
    "created_at": "2024-03-28T10:00:00",
    "created_by": "user@example.com"
}
```

#### Get Tickets
- **GET** `/api/tickets`
```json
// Response
{
    "tickets": [
        {
            "id": 1,
            "title": "Issue with login",
            "description": "Unable to login to the application",
            "priority": "HIGH",
            "category": "BUG",
            "status": "OPEN",
            "created_at": "2024-03-28T10:00:00",
            "created_by": "user@example.com"
        }
    ]
}
```

### Feature Requests

#### Create Feature Request
- **POST** `/api/feature-requests`
```json
// Request
{
    "title": "Dark Mode Support",
    "description": "Add dark mode theme support",
    "priority": "MEDIUM"
}

// Response
{
    "id": 1,
    "title": "Dark Mode Support",
    "description": "Add dark mode theme support",
    "priority": "MEDIUM",
    "status": "UNDER_REVIEW",
    "created_at": "2024-03-28T10:00:00",
    "created_by": "user@example.com",
    "upvotes": 0
}
```

### Users

#### Create User
- **POST** `/api/users`
```json
// Request
{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "USER"
}

// Response
{
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "USER",
    "created_at": "2024-03-28T10:00:00"
}
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details. 