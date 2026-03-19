# 📁 CloudVault - Full-Stack File Manager

A robust file management system built as part of **The Odin Project** curriculum. This application handles secure user authentication, folder organization, and cloud-integrated file storage using a modern tech stack.

![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Live Deployment
[View Live Project on Render](https://file-uploader-nfqc.onrender.com/)

## ✨ Core Features
- **Secure Auth:** Passport.js authentication with encrypted credentials.
- **Persistent Sessions:** Sessions stored in PostgreSQL via `prisma-session-store` (prevents logouts on server restart).
- **Cloud Storage:** Direct integration with **Supabase Storage Buckets**.
- **Secure Downloads:** File retrieval using temporary 60-second **Signed URLs**.
- **Dynamic UI:** Responsive dashboard built with **Tailwind CSS** and EJS templates.

## 🛠️ Technical Stack
- **Environment:** Developed on **Arch Linux**.
- **Backend:** Node.js & Express.
- **Database:** PostgreSQL (Hosted on Supabase) via Prisma ORM.
- **Hosting:** Render (Web Service).

## ⚙️ Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Avad05/File_Uploader.git
   cd File_Uploader

2. **Install dependencies:**
   ```bash
   npm install

3. **Configure Environment Variables (.env):**
   ```bash
   DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT_ID.supabase.co:5432/postgres"
   SUPABASE_URL="[https://your-id.supabase.co](https://your-id.supabase.co)"
   SUPABASE_ANON_KEY="your-supabase-key"
   SESSION_SECRET="your-random-string"
   NODE_ENV="development" 
   PORT=3000
   
4. **Sync Database Schema:**
   ```bash
   npx prisma generate
   npx prisma db push
   
5. **Run in Development Mode:**
   ```bash
    node app.js --watch 

## 🏗️ Deployment (Render)

The project is configured with a build script that automatically prepares the production environment:

    Build Command: npm install && npx prisma generate && npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css

    Start Command: npm start

    Environment: Set NODE_ENV to production in the Render dashboard to enable secure cookies and template caching.   

## 📜 License

This project is open-source and available under the MIT License.    
