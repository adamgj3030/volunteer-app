# THE BEST VOLUNTEER APP ON THIS PLANET MADE WITHOUT CHATGPT OR ANY AI WHATSOEVER

Frontend stack: Typescript, React, Tailwind CSS, shadcn/ui
Backend stack: Python, Flask, PostgreSQL

## Frontend
Create a .env file with the corresponding values:
DEVELOPMENT_DB_URL=http://127.0.0.1:5000
VITE_DEVELOPMENT_DB_URL=http://127.0.0.1:5000

1. `cd frontend && npm install`

## How to Add `shadcn/ui` Components

Make sure to navigate to your frontend directory in the CLI first

### Add a component:

```bash
npx shadcn@latest add <component-name>
```

#### Example:

To add a button component:

```bash
npx shadcn@latest add button
```

This will:

- Copy the `button` component into your local `src/components/ui` folder

## Database
Install PostgreSQL
https://www.postgresql.org/download/windows/

Go to pgAdmin4 and add a new server (name: cosc4353, host: localhost, password: password)
Create a new database under that server with the name volunteer_app

1. cd backend
2. flask db upgrade (create the below .env file in the backend folder before doing this command)


## Backend 
Create a .env file with the corresponding values:
SECRET_KEY=your_secret_key_here
DATABASE_URL=postgresql://postgres:password@localhost:5432/volunteer_app

MAIL_SERVER=localhost
MAIL_PORT=1025
MAIL_USE_TLS=false
MAIL_USE_SSL=false
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_DEFAULT_SENDER="Volunteer App <no-reply@localhost>"

FRONTEND_ORIGIN=http://localhost:5173

JWT_SECRET_KEY=super-dev-jwt-secret-change-me

1. cd backend
2. pip install -r requirements.txt
2. flask run

FOR REGISTRATION:
Make sure Docker Desktop is installed:
https://www.docker.com/products/docker-desktop/
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog


## Testing

Make sure Docker Desktop is installed:
https://www.docker.com/products/docker-desktop/
then 'cd backend' and 'pytest' to run tests