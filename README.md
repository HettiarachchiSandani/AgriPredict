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
https://github.com/HettiarachchiSandani/AgriPredict.git

#### 2.2 Frontend Setup
1. Navigate to frontend
cd frontend

2. Install dependencies
npm install

3. Run frontend
npm run dev

4. Frontend runs at
http://localhost:5173/

#### 2.3 Backend Setup
1. Navigate to backend
cd backend/agripredict

2. Create virtual environment
python -m venv venv

Activate:
Windows:
venv\Scripts\activate

Linux/Mac:
source venv/bin/activate

3. Install dependencies
pip install -r requirements.txt

4. Configure environments (.env)
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=your_supabase_host
DB_PORT=5432

5. Run migration
python manage.py migrate

6. Start backend server
python manage.py runserver

7. Backend runs at:
http://127.0.0.1:8000/

## License
This project is developed for academic purposes as part of a final year undergraduate project.

## Author
Kalehe Hettiarachchi - BSc(Hons) Computer Science Degree 