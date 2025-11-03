# Alignify

## Authors

Navaneenth Maruthi & Rowan Lowden

## Relevant Links

[Web Link](update)

[Class Link](https://johnguerra.co/classes/webDevelopment_online_fall_2025/)

[Design Document](update)

[Google Slides](https://docs.google.com/presentation/d/132jix8MGZ1AEinC5uaLW_FS-bUvGiTqpZY9ZRZ1z1oE/edit?usp=sharing)

[Video Demo](update)

## Project Description

Alignify is a full-stack productivity web app that helps users plan and execute their goals using Cal Newport’s multiscale planning method. It connects long-term quarterly goals to weekly plans and daily tasks, showing how small actions contribute to bigger objectives. Built with React, Node.js, Express, and MongoDB, Alignify provides a structured and visual system for intentional, goal-driven productivity.

## Features

### User Management

- 🔐 Secure authentication with bcrypt password hashing
- 🔑 Persistent login sessions stored in MongoDB
- 👤 Protected routes and user-specific data

### Quarterly Goal Tracking

- ✏️ Create, read, update, and delete quarterly goals
- 📅 Set goal deadlines and track status
- 🏷️ Categorize by personal, professional, education, etc

### Weekly Progress Tracking

- ⏱️ Create, Read, Update and delete weekly plans as needed
- Include action tasks and weekly objectives
- 🔗 Link weekly plans to quarterly goals
- 💰 Track progress status of weekly tasks
- write weekly reflection at the end of the week

### Daily Task Planning

- create, update, read, delete daily tasks/todo lists
- set daily tasks for morning, afternoon, or evening
- check of daily taks as completed or move to the following day
- link to weekly plans to break down weekly objectives into smaller daily tasks

### Dashboard

- 📊 View total hours worked at a glance
- 📈 See project count and active projects
- 🎯 Monitor top 3 active projects with deadlines
- 💼 Centralized overview of freelance work

## Tech Stack update

**Frontend:**

- HTML5, CSS3, Bootstrap 5
- Vanilla JavaScript (ES6 Modules)

**Backend:**

- Node.js + Express.js
- RESTful API architecture
- Native MongoDB driver (no Mongoose)

**Database:**

- MongoDB Atlas
- Session storage in MongoDB

**DevOps & Infrastructure**

- Docker - Container platform for MongoDB

**Development Tools**

- Nodemon - Auto-restart development server
- ESLint - Code linting and quality checks
- Prettier - Code formatting
- dotenv - Environment variable management
- Git - Version control

## Screenshots

![signup](update)
![login](update)
![dashboard]()
![Quarterly Goals]()
![Weekly Plans](update)
![Daily Tasks](update)

## Instructions UPDATE

Step 1: Clone the Repository

```bash
git clone https://github.com/NavaneethMaruthi/FreelanceFlow.git
cd FreelanceFlow
```

Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including Express, MongoDB driver, bcryptjs, express-session, and more

Step 3: Configure Environment Variables
Create a .env file in the root directory:

```bash
touch .env
```

Add the following configuration to your .env file:

```
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017


# Session Configuration
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Cookie Settings
COOKIE_MAX_AGE=86400000

# Server Configuration
PORT=3000
NODE_ENV=development
```

Step 4: Set Up MongoDB
Using Local MongoDB

macOS: brew install mongodb-community
Ubuntu/Debian: sudo apt-get install mongodb
Windows: Download installer from mongodb.com

Step 5: Start Docker

Step 6: MongoDB
Create New MongoDB connection and connect it
(Make sure you make the changes in the code if you are using different names)

Step 5: Start the Application
Run the development server:

```bash
npm start
```

You should see output similar to:

```
Starting FreelanceFlow backend...
✅ Connected to MongoDB
✅ Server running on http://localhost:3000
📝 Environment: development
📁 Serving frontend from /frontend
📂 Auth routes available at /api/auth
📂 Projects routes available at /api/projects
The application is now running at: http://localhost:3000
```

## Use of AI

## License

MIT License
