# 🎓 S.E.M.S - Student Event Management System

### *Full-Stack Web Application for SSUET Event Management*

---

## 📖 Project Description

This project is a web-based **Event Booking and Management System** built using **Flask (Python)** for the backend, **React.js** for the frontend, and **PostgreSQL** as the database. It allows SSUET students to view events, register using their university registration numbers, login, book tickets with early bird discounts, receive digital QR-coded tickets, and manage their bookings.

Administrators can manage events, users, bookings, and view analytics through a dedicated admin dashboard.


## ⚙️ Technologies Used

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React.js, Bootstrap, Chart.js, React-PDF, QRCode.js |
| **Backend** | Python, Flask, Flask-CORS, Werkzeug, psycopg2 |
| **Database** | PostgreSQL, pgAdmin 4 |

---

## 🧠 How the System Works

### 1. Database Connection
- Connects to PostgreSQL using `psycopg2`
- Database: `event_booking` (localhost:5432)

### 2. Database Initialization
- Tables created automatically on first run
- Sample artists and events inserted automatically
- Default admin created: `admin@example.com` / `admin123`

### 3. User Roles

#### 👤 Student
- Register with university registration number (Format: `YYYY[S/F]-DEGREE-ROLLNO`)
- Login using registration number or email
- Browse events by category (6 categories)
- Book tickets with early bird discount (10%)
- Receive digital PDF tickets with QR codes
- Cancel bookings within 24 hours
- Manage bookings from personal dashboard

#### 🛠 Admin
- Email: `admin@example.com` | Password: `admin123`
- Manage events (Add/Edit/Delete)
- View all students and bookings
- View analytics charts (Revenue by event, 7-day booking trends)
- Manage contact messages
- Mark attendance

---

## 🌐 Main Features

### 🔐 Authentication
- User registration with registration number validation
- Secure login with hashed passwords (Werkzeug)
- Session-based authentication
- Role-based access control

### 🎟 Event Management
- 6 categories: Festivals, Tech & Academia, Seminars, Internships, Sports, Society Events
- Each event: Name, Date, Venue, Price, Tickets, Category, Organizer
- Early Bird Discount: 10% off for early bookings

### 🧾 Booking System
- Book tickets with multiple payment methods (simulated)
- Digital PDF tickets with unique QR codes
- 24-hour cancellation policy
- Automatic ticket restoration on cancellation

### 📊 Dashboards
- **Student Dashboard**: View bookings, download tickets, update profile
- **Admin Dashboard**: Stats cards, analytics charts, full CRUD operations

### 📬 Contact Form
- Users can send messages to administration
- Stored in `contact_submissions` table
- Admin can view, mark as read, and delete messages


## 🚀 Quick Setup

### Prerequisites
- Python 3.8+, Node.js 16+, PostgreSQL 14+

### Backend
```
cd backend
pip install -r requirements.txt
python app.py
```
### Frontend
```
cd frontend
npm install
npm run dev
```
### Default Admin
Email: admin@example.com
Password: admin123


### Project Structure

```
sems-event-management/                          # Root Project Folder
│
├── backend/                                     # Backend (Flask Server)
│   ├── app.py                                  # Main Flask application (ALL APIs)
│   ├── schema.sql                              # Database schema
│   ├── requirements.txt                        # Python dependencies
│   └── static/                                 # Static files (images)
│       ├── 1.jpg                              # Hero background
│       ├── 2.jpeg                             # Event image - Cultural Night
│       ├── 3.jpeg                             # Event image - MUN
│       ├── 4.jpeg                             # Event image - SMEC
│       ├── 5.jpg                              # Event image - Beach Party
│       ├── 6.jpeg                             # Event image - Annual Concert
│       ├── 7.jpeg                             # Event image - Dream World
│       ├── 8.jpeg                             # Event image - TICE
│       └── 9.jpeg                             # Event image - Industry Seminar
│
├── frontend/                                    # Frontend (React + Vite)
│   ├── index.html                              # Main HTML entry point
│   ├── package.json                            # Node.js dependencies
│   ├── package-lock.json                       # Locked dependencies
│   ├── vite.config.js                          # Vite build configuration
│   │
│   ├── src/                                    # Source code folder
│   │   ├── App.jsx                            # Main App component (routing)
│   │   ├── index.jsx                          # React entry point
│   │   ├── index.css                          # Global styles
│   │   │
│   │   ├── components/                         # Reusable components
│   │   │   ├── Navbar.jsx                     # Navigation bar
│   │   │   ├── Footer.jsx                     # Footer
│   │   │   ├── PrivateRoute.jsx               # Protected route wrapper
│   │   │   ├── AdminRoute.jsx                 # Admin-only route wrapper
│   │   │   └── TicketModal.jsx                # Digital ticket modal
│   │   │
│   │   ├── pages/                              # Page components
│   │   │   ├── Home.jsx                       # Homepage
│   │   │   ├── Events.jsx                     # Events listing page
│   │   │   ├── Booking.jsx                    # Booking page
│   │   │   ├── UniversityLogin.jsx            # Login page
│   │   │   ├── Register.jsx                   # Registration page
│   │   │   ├── UserDashboard.jsx              # Student dashboard
│   │   │   ├── AdminDashboard.jsx             # Admin dashboard
│   │   │   └── ContactSuccess.jsx             # Contact success page
│   │   │
│   │   ├── contexts/                           # React Context API
│   │   │   └── AuthContext.jsx                # Authentication context
│   │   │
│   │   └── utils/                              # Utility functions
│   │       └── degreeCodes.js                 # Degree code mappings
```
