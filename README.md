# 🔐 LeakAlert

LeakAlert is a full-stack web app that helps users check if their email has been involved in any public data breaches, while also promoting good security habits.

## Try it out!!!

https://leak-alert.vercel.app/

## ✨ Features

- User registration & login with encrypted passwords (bcrypt + JWT)
- Checks for:
  - Password reuse
  - 2FA usage
  - Insecure browser settings
  - Public data breaches (via HaveIBeenPwned API)
- Generates a professional PDF report of your security posture
- Deployable to Vercel (frontend) + Render (backend) + MongoDB Atlas

## 🧠 Tech Stack

| Frontend        | Backend        | Database       | Other            |
|----------------|----------------|----------------|------------------|
| Next.js + TS    | Express + Node | MongoDB Atlas  | jsPDF, Tailwind, Axios |

## 🚀 Getting Started

### 1. Clone this repo

```bash
git clone https://github.com/DavidSantosTXUSA/LeakAlert.git
cd LeakAlert
```
2. Set up the backend



```bash
cd server
npm install
touch .env
```
Inside .env:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
HIBP_API_KEY=your_haveibeenpwned_api_key

Then run:

```bash
node index.js
```

3. Set up the frontend

```bash
cd ../client
npm install
touch .env.local

```
Inside .env.local:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5050
```
Then run:

```
npm run dev
```

📄 Report will include

Number of breached accounts

Specific services that leaked your email

Security best practices based on your answers

How I Deployed
Backend: Deployed to Render

Frontend: Deployed to Vercel

Set my environment variables accordingly in both platforms.

📧 Contact
Made by David Santos. Reach me at davidsantos4148@gmail.com
