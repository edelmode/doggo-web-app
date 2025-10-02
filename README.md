# 🐶 Doggo Web App (Full Stack)  

The **Doggo Web App** is a full-stack web-based platform designed to detect and analyze dog emotions based on posture.  
It integrates machine learning models, real-time detection, and a user-friendly dashboard to help visualize dog behavior.  

⚡ This repository contains both **frontend** and **backend** implementations.  
📌 Developed as part of a research/project on **Dog Emotion Detection**.  
🔑 Note: The `.env` file is not included in this repository for security purposes. You must configure your own environment variables.  

---

## 📌 Features & Pages  

- 🏠 **Main Dashboard** – Displays real-time dog emotion detection results.  
- 📷 **Live Camera Feed** – Stream and analyze dog posture in real time.  
- 📊 **Emotion Display** – Visual representation of detected emotions with confidence scores.  
- 📸 **Screenshot Capture** – Allows users to save snapshots of detection results.  
- 👤 **User Profile** – Manage user details and preferences.  
- 👨‍💻 **Developers Page** – Acknowledgment of contributors behind the project.  
- 📱 **Responsive UI** – Optimized for desktop and mobile use.  

---

## 🛠️ Tech Stack  

### 🌐 Frontend  
- **ReactJS** – Component-based framework for building interactive UIs.  
- **TailwindCSS** – Utility-first CSS framework for styling.  

### ⚙️ Backend  
- **Flask (Python)** – Lightweight backend framework for APIs and model integration.  
- **Socket.IO** – Real-time communication for emotion updates.  

### 🤖 Machine Learning  
- **YOLO + TensorFlow Lite** – For dog posture keypoint detection and emotion classification.  

### 🗄️ Database / Storage  
- **Azure Blob Storage** – For storing user images and videos.  
- **Azure Database for MySQL** – (Optional) for storing logs and user data.  

---

## 🚀 Getting Started  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/carlajeanne/doggo-web-app.git
cd doggo-web-app
```

### 2️⃣ Install Dependencies
```bash
cd frontend
npm install
```

```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Setup Environment Variables
```bash
PORT=5000
DB_HOST=your-azure-db-host
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
AZURE_STORAGE_CONNECTION_STRING=your-azure-storage-connection
JWT_SECRET=your-secret-key
```

### 4️⃣ Run the Development Servers
```bash
cd frontend
npm run dev
```

```bash
cd backend
python app.py
```
