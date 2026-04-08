AUCTION APP PROJECT — SETUP & WORKFLOW DOCUMENTATION

---

1. DOCKER + PROJECT SETUP

---

Start Docker Desktop before running anything.

Run project:
docker compose up --build

Stop project:
docker compose down

Stop + remove volumes (reset DB):
docker compose down -v

Restart containers:
docker compose restart

---

2. CHECK RUNNING APPLICATION

---

Open browser:
http://localhost:3000

Test API:
http://localhost:3000/test-api

---

3. ACCESS DATABASE (POSTGRES)

---

Open new terminal and run:
docker exec -it auction_postgres psql -U postgres -d auction_db

Inside psql:

Show tables:
\dt

Check data:
SELECT * FROM teams;

Exit psql:
\q

---

4. GIT SETUP (FIRST TIME)

---

Check Git installed:
git --version

Initialize repository:
git init

---

5. CREATE .gitignore

---

Create file:
.gitignore

Add:
node_modules
.env
*.log
dist
build

---

6. ADD FILES TO GIT

---

Add all files:
git add .

Check status:
git status

---

7. COMMIT CODE

---

First commit:
git commit -m "Initial commit"

If Git asks for identity:
git config --global user.name "ShubhPandya"
git config --global user.name "Email-id"

---

8. CONNECT TO GITHUB

---

Add remote repository:
git remote add origin https://github.com/your-username/auction-app.git

Set branch:
git branch -M main

---

9. PUSH CODE TO GITHUB

---

Push project:
git push -u origin main

Login via browser when prompted.

---

10. DAILY WORKFLOW (IMPORTANT)

---

After making changes:

git add .
git commit -m "your message"
git push

---

11. PROJECT STRUCTURE

---

server.js → backend server
config/db.js → database connection
db/init.sql → database schema
docker-compose.yml → containers setup
Dockerfile → backend container
services/ → API logic
cron/ → scheduled jobs

---

12. NOTES

---

* Always start Docker before running project
* Never upload .env file to GitHub
* Use docker compose down before shutting system
* Use docker compose up when starting work again
