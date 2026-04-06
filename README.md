# Hostel Management System

A full-stack hostel management system built with MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features

### Admin Features
- Dashboard with statistics
- Student management (CRUD operations)
- Room management and assignment
- Fee management and tracking
- Complaint management
- Attendance tracking
- Notice management
- Leave application management
- Reports and analytics

### Student Features
- Personal dashboard
- Profile management
- Room details and roommate information
- Fee payment history
- Complaint submission and tracking
- Leave application
- View notices and announcements

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Express Validator for input validation

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Tailwind CSS for styling
- Context API for state management

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel-management
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

The backend will be running on `http://localhost:5000`

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
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will be running on `http://localhost:3000`

## Database Setup

### MongoDB Setup
1. Install MongoDB locally or create a free MongoDB Atlas account
2. Update the `MONGODB_URI` in the backend `.env` file
3. The application will automatically create the necessary collections

### Default Admin Account
For testing purposes, you can create an admin account using the registration endpoint or manually insert in MongoDB:

```javascript
{
  "name": "Admin User",
  "email": "admin@hostel.com",
  "password": "admin123", // This will be hashed automatically
  "role": "admin",
  "phone": "1234567890"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Admin Routes (Protected)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/students` - Get all students
- `POST /api/admin/students` - Create student
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/students/:id` - Delete student

### Room Management
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `POST /api/rooms/assign` - Assign student to room

### Fee Management
- `GET /api/fees` - Get all fees
- `POST /api/fees` - Create fee
- `POST /api/fees/pay` - Mark fee as paid
- `GET /api/fees/history/:studentId` - Get student fee history

### Complaint Management
- `GET /api/complaints` - Get all complaints (Admin)
- `POST /api/user/complaints` - Create complaint (Student)
- `GET /api/user/complaints` - Get student complaints
- `PUT /api/complaints/:id` - Update complaint status

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance

### Notices
- `GET /api/notices` - Get all notices (Admin)
- `POST /api/notices` - Create notice (Admin)
- `GET /api/user/notices` - Get student notices

### Leave Management
- `GET /api/leaves` - Get all leave applications (Admin)
- `POST /api/user/leave` - Apply for leave (Student)
- `PUT /api/leaves/:id` - Update leave status (Admin)

### Reports
- `GET /api/reports/fees` - Fee reports
- `GET /api/reports/occupancy` - Occupancy reports
- `GET /api/reports/complaints` - Complaint reports
- `GET /api/reports/students` - Student reports

## Project Structure

```
hostel-management/
├── backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Database configuration
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   ├── services/   # API services
│   │   └── App.js      # Main App component
│   └── public/        # Static files
└── README.md
```

## Usage

1. Start both the backend and frontend servers
2. Open your browser and navigate to `http://localhost:3000`
3. Use the login page to sign in with admin or student credentials
4. Admin can manage students, rooms, fees, complaints, etc.
5. Students can view their dashboard, manage profile, submit complaints, etc.

## Demo Accounts

### Admin Account
- Email: admin@hostel.com
- Password: admin123

### Student Account
- Email: student@hostel.com
- Password: student123

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
