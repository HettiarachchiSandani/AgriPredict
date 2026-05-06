# AgriPredict – AI-Driven Smart Layer Farm Management System
## Project Overview
AgriPredict is a web-based poultry layer farm management system designed to improve efficiency, accuracy, and decision-making in poultry farming. The system addresses limitations in traditional manual record-keeping by introducing a centralized digital platform integrated with machine learning and blockchain-based data validation.

The platform enables farm owners and managers to record daily operations, monitor batch performance, and generate predictive insights for egg production and mortality. Buyers can also interact with the system through a structured request management module.

## Aim of the Project
The main aim of AgriPredict is to develop an intelligent poultry farm management system that enhances operational efficiency by combining:

- Data-driven decision-making
- Predictive analytics using machine learning
- Secure and tamper-resistant data storage

## Key Features
- User Management with role-based access
- Batch Management
- Daily Operations Tracking
- AI Prediction
- Interactive Dashboards
- Report Generation
- Data Integrity using Blockchain
- Buyer Request Management

## Technology Stack
### Frontend
- React.js
- Chart.js
- CSS

### Backend
- Django REST Framework
- Python

### Database
- PostgreSQL (via Supabase)

### Machine Learning
- XGBoost
- CatBoost
- Random Forest
- SHAP (Explainability)

### Security
- JWT Authentication
- Blockchain-inspired hashing (SHA-256)

### Tools
- Figma (UI/UX Designs)
- Postman
- VS Code
- Git & GitHub

## System Architecture
The system follows a layered client-server architecture consisting of:
- React Frontend (User Interface)
- Django Backend (Business Logic & API Layer)
- PostgreSQL Database (Data Storage)
- Machine Learning Module (Prediction Engine)
- Blockchain Layer (Data Integrity Verification)

## Additional Resources
- React Icons: https://react-icons.github.io/react-icons/
- Supabase: https://supabase.com/docs
- SHAP: https://shap.readthedocs.io/en/latest/
- Scikit-learn: https://scikit-learn.org/

## System Setup Guide
### 1. System Requirements
- Node.js
- npm
- Python 3.x
- pip
- Git
- VS Code
- Stable Internet

### 2. How to Run
#### 2.1 Clone Repository
```bash
git clone https://github.com/HettiarachchiSandani/AgriPredict.git
```

#### 2.2 Frontend Setup
1. Navigate to frontend
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Run frontend
```bash
npm run dev
```

4. Frontend runs at
```bash
http://localhost:5173/
```

#### 2.3 Backend Setup
1. Navigate to backend
```bash
cd backend/agripredict
```

2. Create virtual environment
```bash
python -m venv venv
```

Activate virtual environment:

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Configure environments (.env)
```bash
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=your_supabase_host
DB_PORT=5432
```

5. Run migration
```bash
python manage.py migrate
```

6. Start backend server
```bash
python manage.py runserver
```

7. Backend runs at:
```bash
http://127.0.0.1:8000/
```

## License
This project is developed for academic purposes as part of a final year undergraduate project and is not intended for commercial use.

## Author
Kalehe Hettiarachchi  
BSc (Hons) Computer Science