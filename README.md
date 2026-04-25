 ---                                                                                                                                                                                                                                            
  # SIH Trip Tracker — Team MapMyWay
                                    
  A full-stack trip tracking and expense management system built for Smart India Hackathon (SIH). The application combines GPS trajectory analysis, AI-powered travel classification, OCR-based expense tracking, and a conversational AI        
  assistant to deliver an intelligent travel companion.                                                                                                                                                                                          
                                                                                                                                                                                                                                                 
  ## Key Capabilities                                                                                                                                                                                                                            
                     
  The platform integrates three parallel AI models — a GPS-based travel classifier, a Phi-3 Mini conversational assistant, and an OCR expense processor. Users can log trips, automatically classify them as business or leisure, track budgets
  with real-time alerts, and get contextual answers through the built-in chatbot. The system supports CSV/JSON data exports and is deployable via Docker.                                                                                        
                                                                                                                                                         
  **Budget States**: Safe (under 80%) → Warning (80–100%) → Exceeded (over 100%)                                                                                                                                                                 
                                                                                                                                                                                                                                                 
  ## Tech Stack
                                                                                                                                                                                                                                                 
  **Frontend** — React + TypeScript with mobile-responsive design and real-time budget state updates.
                                                                                                                                                                                                                                                 
  **Backend** — Go with Echo Framework handling REST API routing, JWT authentication, and AI model integration through dedicated controllers.
                                                                                                                                                                                                                                                 
  **AI/ML** — Python powering three models: logistic regression on Haversine-processed GPS trajectories for travel classification, Phi-3 Mini for the conversational assistant, and an OCR pipeline for receipt-based expense extraction.
                                                                                                                                                                                                                                                 
  **Database** — PostgreSQL / MySQL for trip data, user sessions, and expense records.
                                                                                                                                                                                                                                                 
  ## Project Structure
                                                                                                                                                                                                                                                 
  SIH-Trip-Tracker/
  ├── app/          # Mobile application code
  ├── backend/      # Go REST API (Echo Framework)                                                                                                                                                                                               
  ├── frontend/     # React + TypeScript web interface                                                                                                                                                                                           
  ├── models/       # Python ML models and data schemas                                                                                                                                                                                          
  ├── scripts/      # Utility and automation scripts                                                                                                                                                                                             
  ├── design/       # UI/UX design assets
  └── docs/         # Architecture diagrams and flowcharts                                                                                                                                                                                       
                  
  ## Setup                                                                                                                                                                                                                                       
                  
  **Prerequisites**: Node.js v18+, Go 1.21+, Python 3.10+, PostgreSQL or MySQL, Docker (optional).                                                                                                                                               
   
  **Backend**                                                                                                                                                                                                                                    
  ```bash         
  cd backend
  go mod tidy
  go run main.go

  Frontend
  cd frontend
  npm install
  npm run dev
             
  ML Models
  cd models                                                                                                                                                                                                                                      
  python -m venv venv
  source venv/bin/activate                                                                                                                                                                                                                       
  pip install -r requirements.txt
  python app.py                  
               
  Docker (optional)
  docker-compose up --build                                                                                                                                                                                                                      
   
  Team                                                                                                                                                                                                                                           
                  
  Built by Team MapMyWay for Smart India Hackathon (SIH).                                                                                                                                                                                        
   
  ┌──────────────────┬──────────────────────────────┐                                                                                                                                                                                            
  │       Name       │            GitHub            │
  ├──────────────────┼──────────────────────────────┤
  │ Harsh Naik       │ https://github.com/HrsHnk-56 │
  ├──────────────────┼──────────────────────────────┤
  │ Yash Kumar Gupta │ https://github.com/AurReaper │                                                                                                                                                                                            
  └──────────────────┴──────────────────────────────┘
                                                                                                                                                                                                                                                 
  ---                             
