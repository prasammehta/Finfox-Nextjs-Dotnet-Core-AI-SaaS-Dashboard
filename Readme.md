# Finfox - AI-Powered Financial Management Dashboard

A modern, full-stack financial management SaaS application with AI-powered transaction assistance, built with Next.js 15 and .NET 10.

![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.5.11-black)
![.NET](https://img.shields.io/badge/.NET-10.0-purple)
![Status](https://img.shields.io/badge/status-Active-green)

## 🎯 Project Overview

Finfox is a comprehensive financial management platform that combines a modern web dashboard with an AI-powered assistant. Users can track accounts, transactions, investments, and debts while leveraging natural language processing to create and manage transactions conversationally.

### Key Features

- 💰 **Multi-Account Management** - Track multiple bank accounts and financial accounts
- 🤖 **AI Transaction Assistant** - Create transactions through natural conversation using GPT-4
- 📊 **Advanced Dashboard** - Real-time financial analytics and insights
- 📈 **Investment Tracking** - Monitor investment portfolios and performance
- 💳 **Debt Management** - Track and manage debts with payment schedules
- 🎨 **Customizable Theming** - Dynamic theme customization with OKLCH color space
- 🔐 **JWT Authentication** - Secure authentication with JWT tokens
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🔄 **Recurring Transactions** - Automatic recurring transaction management
- 📋 **Billing System** - Track bills and recurring payments

---

## 🎬 Demo

**Live Application**: [https://finfox-nextjs-dotnet-core-ai-saa-s.vercel.app/](https://finfox-nextjs-dotnet-core-ai-saa-s.vercel.app/)

**Test Credentials**:
- **Email**: `admin@gmail.com`
- **Password**: `pass123`

## 🏗️ Tech Stack

### Frontend

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 15.5.11 |
| **Runtime** | React | 19.1.0 |
| **Language** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.1.11 |
| **UI Components** | shadcn/ui + Radix UI | Latest |
| **State Management** | Zustand + React Context | 5.0.7 |
| **Form Management** | React Hook Form | 7.62.0 |
| **Validation** | Zod | 4.0.15 |
| **Charts** | Recharts | 2.15.4 |
| **Icons** | Lucide React | 0.536.0 |
| **HTTP Client** | Axios | 1.13.2 |
| **Theme Management** | next-themes | 0.4.6 |
| **Utilities** | Date-fns | 4.1.0 |
| **Notifications** | Sonner | 2.0.7 |

### Backend

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | ASP.NET Core | 10.0 |
| **Language** | C# | Latest |
| **ORM** | Entity Framework Core | 10.0 |
| **Database** | PostgreSQL | 14+ |
| **AI Integration** | Semantic Kernel | 1.14.0 |
| **LLM Provider** | OpenAI GPT-4 | Latest |
| **Authentication** | JWT Bearer | Built-in |
| **API Documentation** | Swagger/OpenAPI | Swashbuckle 10.1 |
| **Logging** | Serilog | 4.2.0 |
| **Data Export** | ClosedXML | Latest |

---

## 🤖 AI Integration

### Semantic Kernel & OpenAI Integration

The application uses **Microsoft Semantic Kernel** with **OpenAI GPT-4** for intelligent transaction processing:

#### AI Capabilities

- **Natural Language Understanding**: Parse user transactions from conversational input
- **Intent Recognition**: Identify transaction creation, modification, or deletion requests
- **Context Awareness**: Access to user's accounts, debts, and transaction history
- **Validation & Guidance**: Prompt users for missing required fields
- **Multi-turn Conversations**: Maintain context across multiple exchanges

#### AI Architecture

```
User Input → Semantic Kernel → GPT-4 → Plugin Functions → Database
    ↓              ↓             ↓           ↓              ↓
Chat Message  Intent Analysis Extract Data Validate  Store Transaction
```

#### Key Components

1. **AiService** (`Services/AiService.cs`)
   - Manages chat sessions and message history
   - Orchestrates AI responses
   - Handles intent extraction

2. **TransactionPlugin** (`Plugins/TransactionPlugin.cs`)
   - Kernel functions for transaction processing
   - Account and debt retrieval
   - Category validation

3. **AiController** (`Controllers/AiController.cs`)
   - REST endpoints for chat and intent extraction
   - Session management
   - History retrieval

#### Supported Transaction Categories

- **Expenses**: GROCERIES, UTILITIES, ENTERTAINMENT, TRANSPORTATION, HEALTHCARE, EDUCATION, DINING, SHOPPING, OTHER_EXPENSE
- **Income**: SALARY, FREELANCE, INVESTMENT, OTHER_INCOME

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### System Requirements

- **Node.js**: v18.0.0 or higher
- **.NET SDK**: 10.0 or higher
- **PostgreSQL**: 14 or higher
- **Git**: Latest version

### Required Accounts/Keys

1. **OpenAI API Key** - [Get it here](https://platform.openai.com/api-keys)
2. **PostgreSQL Database** - Local or cloud (AWS RDS, Azure Database, etc.)
3. **Git** - For version control

### Verify Installation

```bash
# Check Node.js
node --version  # Should be v18+

# Check .NET
dotnet --version  # Should be 10.0+

# Check PostgreSQL
psql --version  # Should be 14+
```

---

## 🚀 Installation Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/prasammehta/Finfox-Nextjs-Dotnet-Core-AI-SaaS-Dashboard.git
cd Finfox-Nextjs-Dotnet-Core-AI-SaaS-Dashboard
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd backend/FinfoxApi
```

#### 2.2 Configure Database Connection

Edit `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=finfox;Username=postgres;Password=your_password"
  },
  "OpenAi": {
    "ApiKey": "sk-your-openai-api-key-here",
    "Model": "gpt-4"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-jwt-key-min-32-characters",
    "Issuer": "finfox",
    "Audience": "finfox-users",
    "ExpirationMinutes": 1440
  }
}
```

#### 2.3 Install Dependencies

```bash
dotnet restore
```

#### 2.4 Apply Database Migrations

```bash
# Install EF CLI if not already installed
dotnet tool install --global dotnet-ef

# Apply migrations
dotnet ef database update
```

This creates the following tables:
- Users
- Accounts
- Transactions
- Investments
- Debts
- Bills
- BillCompanies
- RecurringTransactions
- AiChatSessions
- AiChatMessages

#### 2.5 Build Backend

```bash
dotnet build
```

#### 2.6 Run Backend

```bash
dotnet run
```

Backend will be available at: `http://localhost:5252`

**Verify API is running:**
```bash
curl http://localhost:5252/api/health
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd ../../frontend
```

#### 3.2 Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

#### 3.3 Configure Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5252/api
NEXT_PUBLIC_API_TIMEOUT=30000

# Authentication
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics, CDN, etc.
NEXT_PUBLIC_ANALYTICS_ID=
```

#### 3.4 Build Frontend

```bash
npm run build
```

#### 3.5 Run Frontend

**Development Mode:**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:3000`

**Production Mode:**
```bash
npm run start
```

---

## 📖 API Documentation

### Authentication

All API endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.

#### Get JWT Token

```bash
curl -X POST http://localhost:5252/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "message": "Login successful"
}
```

#### Use Token in Requests

```bash
curl -X GET http://localhost:5252/api/dashboard/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Key Endpoints

#### Dashboard API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Get complete dashboard data |
| `GET` | `/api/dashboard/metrics` | Get key financial metrics |
| `GET` | `/api/dashboard/accounts` | Get account summary |
| `GET` | `/api/dashboard/transactions/recent` | Get recent transactions |
| `GET` | `/api/dashboard/budget` | Get budget overview |

#### AI Chat API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/chat` | Send chat message |
| `POST` | `/api/ai/extract-intent` | Extract transaction intent |
| `GET` | `/api/ai/history` | Get chat history |
| `GET` | `/api/ai/session/{id}` | Get session messages |
| `DELETE` | `/api/ai/session/{id}` | Delete chat session |

#### Transactions API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | List all transactions |
| `POST` | `/api/transactions` | Create transaction |
| `GET` | `/api/transactions/{id}` | Get transaction details |
| `PUT` | `/api/transactions/{id}` | Update transaction |
| `DELETE` | `/api/transactions/{id}` | Delete transaction |

#### Accounts API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/accounts` | List all accounts |
| `POST` | `/api/accounts` | Create account |
| `GET` | `/api/accounts/{id}` | Get account details |
| `PUT` | `/api/accounts/{id}` | Update account |
| `DELETE` | `/api/accounts/{id}` | Delete account |

### Full API Documentation

Interactive API documentation is available at: `http://localhost:5252/swagger`

---

## 🧪 Testing the AI Features

### 1. Test Chat Endpoint

```bash
curl -X POST http://localhost:5252/api/ai/chat \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I spent $50 on groceries today"
  }'
```

### 2. Test Intent Extraction

```bash
curl -X POST http://localhost:5252/api/ai/extract-intent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Transfer $200 from checking to savings"
  }'
```

### 3. Get Chat History

```bash
curl -X GET http://localhost:5252/api/ai/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎨 Theme Customization

### Available Features

- **40+ Pre-built Themes** - shadcn/ui and custom theme presets
- **OKLCH Color Space** - Modern, perceptually uniform colors
- **Real-time Preview** - See changes instantly
- **Import/Export** - Share themes with others
- **Sidebar Configuration** - Multiple layout options
- **Dark/Light Mode** - System preference detection

### Access Theme Customizer

In the dashboard, click the theme icon (top-right corner) to open the customizer.

### Theme Configuration Files

- `src/utils/shadcn-ui-theme-presets.ts` - Base theme presets
- `src/utils/tweakcn-theme-presets.ts` - Extended theme collection
- `src/config/theme-data.ts` - Theme data aggregation
- `src/hooks/use-theme-manager.ts` - Theme management logic

---

## 📁 Project Structure

### Backend Structure

```
backend/
├── FinfoxApi/
│   ├── Controllers/           # REST API endpoints
│   │   ├── AiController.cs
│   │   ├── DashboardController.cs
│   │   ├── TransactionsController.cs
│   │   ├── AccountsController.cs
│   │   └── ...
│   ├── Services/              # Business logic
│   │   ├── AiService.cs
│   │   ├── DashboardService.cs
│   │   ├── TransactionService.cs
│   │   └── ...
│   ├── Models/                # Database models
│   │   ├── User.cs
│   │   ├── Transaction.cs
│   │   ├── AiChatSession.cs
│   │   └── ...
│   ├── ViewModels/            # DTOs
│   │   ├── AiChatResponseVM.cs
│   │   ├── DashboardVM.cs
│   │   └── ...
│   ├── Plugins/               # Semantic Kernel plugins
│   │   ├── TransactionPlugin.cs
│   │   └── FinfoxPlugin.cs
│   ├── Data/                  # Database context
│   │   └── FinfoxApiDbContext.cs
│   ├── Migrations/            # EF migrations
│   ├── Interfaces/            # Service interfaces
│   ├── Repositories/          # Data access layer
│   ├── Helpers/               # Utility helpers
│   ├── appsettings.json       # Configuration
│   ├── Program.cs             # Application entry point
│   └── finfoxapi.csproj       # Project file
└── finfox-backend.sln         # Solution file
```

### Frontend Structure

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Auth pages
│   │   ├── (dashboard)/       # Protected routes
│   │   ├── landing/           # Public landing
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── theme-customizer/  # Theme customization
│   │   ├── app-sidebar.tsx
│   │   └── ...
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-theme-manager.ts
│   │   ├── use-sidebar-config.ts
│   │   └── ...
│   ├── contexts/              # React contexts
│   │   ├── theme-context.ts
│   │   └── sidebar-context.tsx
│   ├── lib/                   # Utility libraries
│   ├── types/                 # TypeScript definitions
│   ├── config/                # Configuration
│   ├── utils/                 # Helper functions
│   ├── services/              # API services
│   └── middleware.ts          # Next.js middleware
├── public/                    # Static assets
├── .env.example               # Environment template
├── next.config.ts             # Next.js config
├── tailwind.config.ts         # Tailwind config
├── tsconfig.json              # TypeScript config
└── package.json               # Dependencies
```

---

## 🔧 Configuration

### Backend Configuration (`appsettings.json`)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=finfox;Username=postgres;Password=password"
  },
  "OpenAi": {
    "ApiKey": "sk-your-api-key",
    "Model": "gpt-4"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-min-32-chars",
    "Issuer": "finfox",
    "Audience": "finfox-users",
    "ExpirationMinutes": 1440
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  }
}
```

### Frontend Environment Variables (`.env.local`)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5252/api

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Finfox

# Optional Features
NEXT_PUBLIC_ANALYTICS_ID=
```

### Development vs Production

**Development:**
```bash
# Backend
ASPNETCORE_ENVIRONMENT=Development

# Frontend
NODE_ENV=development
```

**Production:**
```bash
# Backend
ASPNETCORE_ENVIRONMENT=Production

# Frontend
NODE_ENV=production
```

---

## 🔐 Security Considerations

### Before Deploying to Production

1. **Change JWT Secret Key**
   ```json
   "Jwt": {
     "SecretKey": "generate-a-strong-random-key-min-32-chars"
   }
   ```

2. **Configure CORS Properly**
   ```json
   "Cors": {
     "AllowedOrigins": ["https://yourdomain.com"]
   }
   ```

3. **Enable HTTPS**
   - Use SSL certificates
   - Redirect HTTP to HTTPS

4. **Secure OpenAI Key**
   - Use environment variables
   - Never commit to version control
   - Use secrets manager in production

5. **Database Security**
   - Use strong passwords
   - Enable encryption at rest
   - Regular backups
   - Restrict network access

6. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only
   - Implement CSRF protection

---

## 🌐 Deployment

### Deploy Backend (Azure/AWS/Heroku)

#### Azure App Service
```bash
az webapp up --name finfox-api --resource-group finfox-rg --runtime "DOTNETCORE:10.0"
```

#### AWS
```bash
# Using Elastic Beanstalk
eb init -p "ASP.NET Core 10.0"
eb create finfox-api
eb deploy
```

#### Docker (Any Cloud)
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["FinfoxApi.csproj", "."]
RUN dotnet restore "FinfoxApi.csproj"
COPY . .
RUN dotnet build "FinfoxApi.csproj" -c Release

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /src/bin/Release/net10.0/publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "FinfoxApi.dll"]
```

### Deploy Frontend (Vercel/Netlify/AWS)

#### Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync out/ s3://finfox-bucket/
```

---

## 📚 Documentation Files

- [Backend Detailed Guide](./Backend-ReadMe.md) - Backend architecture, AI integration details
- [Frontend Detailed Guide](./Frontend-ReadMe.md) - Frontend components, theming system
- [API Documentation](http://localhost:5252/swagger) - Interactive API docs (when running locally)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Workflow

```bash
# 1. Clone and navigate
git clone <repo>
cd Finfox-Nextjs-Dotnet-Core-AI-SaaS-Dashboard

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes and commit
git commit -m "Add feature description"

# 4. Push and create PR
git push origin feature/my-feature
```

---

## 🐛 Troubleshooting

### Backend Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to PostgreSQL" | Verify PostgreSQL is running and connection string is correct |
| "OpenAI API key not configured" | Add key to `appsettings.json` and restart |
| "Migration failed" | Run `dotnet ef database drop` then `dotnet ef database update` |
| "Port 5252 already in use" | Change port in `launchSettings.json` or kill process on port 5252 |

### Frontend Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to API" | Verify backend is running and `NEXT_PUBLIC_API_URL` is correct |
| "Build fails" | Delete `node_modules` and `.next`, run `npm install` and `npm run build` |
| "Styles not loading" | Run `npm install` and restart dev server |
| "Port 3000 in use" | Run `npm run dev -- -p 3001` |

### Common Solutions

```bash
# Backend issues
cd backend/FinfoxApi
dotnet clean
dotnet restore
dotnet build
dotnet run

# Frontend issues
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

---

## 📊 Performance Optimization

### Backend
- Database indexing on frequently queried columns
- Caching strategies for dashboard data
- API response compression
- Connection pooling

### Frontend
- Code splitting and lazy loading
- Image optimization with Next.js Image
- CSS tree-shaking with Tailwind
- Bundle analysis with `npm run build`

---

## 📝 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](./LICENSE) file for details.

---

## 👨‍💼 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/prasammehta/Finfox/issues)
- **Discussions**: [GitHub Discussions](https://github.com/prasammehta/Finfox/discussions)
- **Email**: support@finfox.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://shadcn.com/ui) - UI components
- [ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/) - Backend framework
- [Semantic Kernel](https://learn.microsoft.com/en-us/semantic-kernel/) - AI integration
- [OpenAI](https://openai.com/) - LLM provider
- [ShadcnStore](https://github.com/silicondeck/shadcn-dashboard-landing-template) - Shadcn Store

---

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ AI Chat for transactions
- ✅ Dashboard and analytics
- ✅ Account management
- ✅ Theme customization

### Phase 2 (Planned)
- 📱 Bug fixes
- 🔔 Add recurring transaction postgres scheduler
- 📧 Email notifications
- 🔄 Google auth
- 💡 UI & Chart Enhancements