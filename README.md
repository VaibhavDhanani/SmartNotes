# SmartNotes

A modern, intelligent note-taking application designed to help you capture, organize, and retrieve your thoughts effortlessly.

## Features

- **Rich Text Editing**: Full-featured editor with markdown support
- **Search & Filter**: Powerful search functionality to find notes quickly
- **Cross-Platform Sync**: Access your notes from anywhere
- **Export Options**: Export notes in multiple formats (PDF, Document(DOCS))

## Glimps
### Home Screen 
![image](https://github.com/user-attachments/assets/3e91d31b-14b1-44d0-afc1-33e05fb8558b)

### Workspace
![image](https://github.com/user-attachments/assets/e92839ef-e869-4b5c-a59b-99879832e13d)

### Directory/Document Creation
![image](https://github.com/user-attachments/assets/5a4144e9-d936-4573-b053-104e04adcc13)

### Document Editor
![image](https://github.com/user-attachments/assets/5e7c644f-1504-488e-a5bf-d29b98237656)

### Share Access
![image](https://github.com/user-attachments/assets/5bb8981f-9af7-4442-8767-1c50887b117f)

### Shared Documents 
![image](https://github.com/user-attachments/assets/3c9a4f34-28a7-4a33-90ea-c464aee84032)

### Collaborative Editor
![image](https://github.com/user-attachments/assets/4a29dfc3-5044-4df4-a06c-4292fd350b94)


## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vaibhavdhanani/smartnotes.git
cd fronted
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```
4. Goto backend folder, create virtual environment:
```bash
cd ../backend
python -m venv venv
pip install -r requirments.txt
alembic upgrade head # for database creation
```
5. Run backend server:
```bash
uvicorn app.main:app --reload
```

6. Open your browser and navigate to `http://localhost:5173`

## Usage

### Creating Notes

1. Click the "New", select directory or document
2. Start typing your note content
3. Save automatically as you type

### Organizing Notes

- **Folders**: Create folders to group related notes
- **Search**: Use the search bar to find notes by title


## Configuration

Create a `.env` file in the fronted directory:

```env
VITE_SERVER_URL="http://127.0.0.1:8000"
```
Create a `.env` file in the backend directory:

```env
DB_HOST=
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_PORT=
SECRET_KEY=
ALGORITHM=
ACCESS_TOKEN_EXPIRE_MINUTES=
```


## API Documentation

### Endpoints

#### Goto `http://127.0.0.1:8000/docs`
![image](https://github.com/user-attachments/assets/34c20392-4537-4e84-b76b-a3a983be13a8)



## Tech Stack

- **Frontend**: React + Vite
- **Backend**: FastAPI with Python
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT
- **Used Modules**: WebSocket



