{
  "project": "Healthiffy",
  "brief": "Full-stack web application for restaurant/food ordering (admin + customer) with realtime updates, file uploads, and payments.",
  "repoStructure": {
    "backend": "Node.js + Express API with services, controllers, models, middlewares, sockets",
    "frontend": "React (Vite) single-page app with components, routes, and Redux",
    "docker": "docker-compose.yml and Dockerfiles for backend/frontend",
    "tests": "test/smoke.test.js"
  },
  "techStack": [
    "Node.js", "Express", "MongoDB (mongoose)", "React (Vite)", "TailwindCSS", "Docker", "Cloudinary", "WebSockets"
  ],
  "keyFeatures": [
    "Authentication (access + refresh tokens)",
    "Role-based access (admin, worker, user)",
    "Menu, categories, branches management",
    "Cart and order lifecycle (create, update, status)",
    "Payments and payment settings",
    "File upload via Cloudinary",
    "Realtime updates via sockets",
    "API responses and centralized error handling"
  ],
  "servicesAndFiles": {
    "serverEntry": "backend/src/server.js",
    "appInit": "backend/src/app.js",
    "dbConnect": "backend/database/connectDB.js",
    "seedAdmin": "backend/database/seedAdmin.js",
    "authService": "backend/src/services/auth.service.js",
    "orderService": "backend/src/services/order.service.js",
    "socketServer": "backend/src/sockets/socket.server.js",
    "frontendEntry": "frontend/src/main.jsx",
    "dockerCompose": "docker-compose.yml"
  },
  "apiOverview": [
    "/api/v1/auth (login, register, refresh, logout)",
    "/api/v1/branches (CRUD)",
    "/api/v1/menu-items (CRUD, search, slug)",
    "/api/v1/cart (add, update, remove)",
    "/api/v1/orders (create, list, update status)",
    "/api/v1/payment (create payment, webhook)",
    "/api/v1/upload (file uploads)"
  ],
  "environmentVars": [
    "NODE_ENV", "PORT", "MONGO_URI", "JWT_SECRET", "JWT_EXPIRES_IN", "REFRESH_TOKEN_SECRET", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "PAYMENT_* (provider keys)"
  ],
  "runInstructions": {
    "backendDev": "cd backend && npm install && npm run dev",
    "frontendDev": "cd frontend && npm install && npm run dev",
    "docker": "docker-compose up --build",
    "seedAdmin": "node backend/database/seedAdmin.js"
  },
  "tests": "Run node test/smoke.test.js or use test runner configured in package.json",
  "notes": {
    "seedAdmin": "Creates initial admin user for testing",
    "uploads": "Uses Cloudinary configuration at backend/src/config/cloudinary.config.js",
    "security": "Middlewares include auth, role checks, and security.middleware",
    "errors": "Centralized error handling via backend/src/middlewares/error.middleware.js"
  },
  "usageForLLM": "This JSON object is structured for an LLM to parse project layout, endpoints, run steps, and important files. Use it to generate API docs, test plans, architecture diagrams, or code improvements. Ask targeted follow-ups: 'List all public API endpoints with request/response schemas' or 'Find security issues in authentication flow'."
}
