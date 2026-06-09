<div align="center">

# 🔧 Osta — أُسطى
### Home Services Marketplace — Backend API

**Connecting clients with verified home service technicians**

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📖 About

**Osta (أُسطى)** is a home services marketplace platform that connects clients with verified technicians for services such as plumbing, electrical work, AC repair, and more.

The platform supports three roles:
- **Client** — browse services, place requests, track orders, leave reviews
- **Technician** — complete a multi-step registration, get verified, receive and manage requests
- **Admin** — manage users, approve/reject technicians, oversee all platform activity

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js + TypeScript) |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Access + Refresh tokens) + Passport |
| OAuth | Google OAuth 2.0 |
| File Uploads | Multer (local disk storage) |
| Validation | class-validator + class-transformer |
| Documentation | Swagger / OpenAPI |
| AI Assistant | OpenAI API |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Sohailahesham/Backend-Osta.git
cd Backend-Osta

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Seed the first admin user
npm run seed:admin

# 5. Start the development server
npm run start:dev
```

### Environment Variables

```env
MONGO_URI=mongodb://localhost:27017/osta
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=3000
ALLOWED_ORIGINS=http://localhost:3001

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
FRONTEND_URL=http://localhost:3001

OPENAI_API_KEY=your_openai_key
```

---

## 📚 API Documentation

After starting the server, visit:

```
http://localhost:3000/api/docs
```

Full interactive Swagger UI with all endpoints, request/response schemas, and JWT authorization.

---

## 📡 API Endpoints

### 🔐 Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register/user` | Register as client | Public |
| POST | `/auth/register/technician` | Register as technician | Public |
| POST | `/auth/login` | Login | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/logout` | Logout | JWT |
| POST | `/auth/forget-password` | Send OTP to email | Public |
| POST | `/auth/verify-otp` | Verify OTP code | Public |
| POST | `/auth/reset-password` | Reset password | Public |
| POST | `/auth/send-verification` | Send email verification | JWT |
| GET | `/auth/verify-email` | Verify email via link | Public |
| GET | `/auth/google` | Google OAuth login | Public |
| GET | `/auth/google/callback` | Google OAuth callback | Public |

### 👤 Users (Client)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me` | Get my profile | JWT |
| PATCH | `/users/me` | Update my profile | JWT |
| GET | `/users/dashboard` | Get client dashboard stats | JWT |

### 🔧 Technician
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/technician/step2` | Set specialization | JWT |
| POST | `/technician/step3` | Professional info | JWT |
| POST | `/technician/step4` | Service areas | JWT |
| POST | `/technician/step5` | Upload documents | JWT |
| GET | `/technician/details` | Get technician profile | JWT |
| GET | `/technician/dashboard` | Get technician dashboard | JWT |

### 📂 Categories
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/categories` | List all categories | Public |
| GET | `/categories/:id` | Get category by ID | Public |
| POST | `/categories` | Create category | Admin |
| PATCH | `/categories/:id` | Update category | Admin |
| PATCH | `/categories/:id/toggle-active` | Toggle active | Admin |
| DELETE | `/categories/:id` | Delete category | Admin |

### 🛠️ Services
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/services` | List services (filter by category) | Public |
| GET | `/services/most-common` | Top 6 most common | Public |
| GET | `/services/:id` | Get service by ID | Public |
| GET | `/services/:id/comments` | Get comments | Public |
| POST | `/services` | Create service | Admin |
| PATCH | `/services/:id` | Update service | Admin |
| PATCH | `/services/:id/toggle-active` | Toggle active | Admin |
| DELETE | `/services/:id` | Delete service | Admin |
| POST | `/services/:id/comments` | Add comment | JWT |
| DELETE | `/services/:serviceId/comments/:commentId` | Delete comment | JWT |

### 📋 Requests
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/requests` | Create service request | JWT (Client) |
| GET | `/requests` | Get all requests | JWT (Admin) |
| GET | `/requests/my` | Get my requests | JWT (Client) |
| GET | `/requests/pending` | Get pending requests | JWT (Technician) |
| GET | `/requests/assigned` | Get assigned requests | JWT (Technician) |
| GET | `/requests/:id` | Get request by ID | JWT |
| PATCH | `/requests/:id/accept` | Accept request | JWT (Technician) |
| PATCH | `/requests/:id/complete` | Complete request | JWT (Technician) |
| PATCH | `/requests/:id/cancel` | Cancel request | JWT |
| PATCH | `/requests/:id/status` | Override status | JWT (Admin) |
| DELETE | `/requests/:id` | Delete request | JWT (Admin) |

### ⭐ Reviews
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/reviews` | Submit review | JWT (Client) |
| GET | `/reviews/technician/:id` | Technician reviews | Public |
| GET | `/reviews/service/:id` | Service reviews | Public |
| PATCH | `/reviews/:id` | Edit review | JWT (Client) |
| DELETE | `/reviews/:id` | Delete review | JWT (Client) |

### 🚨 Emergency
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/emergency` | List emergency numbers | Public |
| POST | `/admin/emergency` | Add emergency number | Admin |
| PATCH | `/admin/emergency/:id` | Update emergency number | Admin |
| DELETE | `/admin/emergency/:id` | Delete emergency number | Admin |

### 👑 Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard` | Platform stats overview |
| GET | `/admin/users` | List all users (paginated) |
| GET | `/admin/users/:id` | Get user by ID |
| GET | `/admin/technicians` | List approved technicians |
| GET | `/admin/technicians/pending` | List pending technicians |
| GET | `/admin/technicians/:id` | Get technician by ID |
| PATCH | `/admin/technicians/:id/approve` | Approve technician |
| PATCH | `/admin/technicians/:id/reject` | Reject technician |
| PATCH | `/admin/users/:id/set-admin-role` | Promote user to admin |

### 🤖 AI Assistant
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/chat` | Chat with AI assistant | Public |

---

## 🗂️ Project Structure

```
src/
├── admin/          — Admin management (users, technicians, dashboard)
├── assistant/      — AI chat assistant
├── auth/           — Authentication (JWT, Google OAuth, OTP, email verify)
├── categories/     — Service categories
├── common/         — Shared (guards, pipes, decorators, interceptors, DTOs)
├── emergency/      — Emergency contact numbers
├── request/        — Service booking requests
├── reviews/        — Ratings & reviews
├── services/       — Service catalog
├── technician/     — Technician registration & profile
└── users/          — Client profile management
```

---

## 🔒 Security

- JWT access tokens (short-lived) + refresh tokens (long-lived)
- Passwords hashed with bcryptjs
- Role-based access control (Client / Technician / Admin)
- Google OAuth 2.0 integration
- Email verification flow
- OTP-based password reset
- Request body whitelisting via ValidationPipe

---

## 👥 Team

Built as a graduation project at ITI — intake 45.

---

## 📄 License

Copyright (c) 2026 Osta Team. All Rights Reserved.

This software is proprietary and confidential. Unauthorized use, copying, or distribution is strictly prohibited.