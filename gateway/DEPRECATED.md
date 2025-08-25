# ⚠️ Repository Deprecated

**This repository has been consolidated into the unified monorepo.**

## 🚀 New Location

**All code has moved to:** [dreamscape-monorepo](https://github.com/DREAMSCAPE-AI/dreamscape-monorepo)

### 📍 New Path Structure
- **Old repositories** are now organized in the monorepo:
  - **Services:** `dreamscape-monorepo/services/{auth,user,voyage,payment,ai,panorama}/`
  - **Applications:** `dreamscape-monorepo/apps/{web-client,gateway}/`  
  - **Infrastructure:** `dreamscape-monorepo/infra/{docker,k8s,terraform}/`
  - **Tests:** `dreamscape-monorepo/tests/`
  - **Documentation:** `dreamscape-monorepo/docs/`

## ✅ Benefits of Monorepo

- **🔄 Unified Development** - Single setup for all services
- **⚡ Faster Development** - Hot reload across all services  
- **🧪 Centralized Testing** - Integrated test suite
- **🚀 Simplified Deployment** - Single pipeline
- **📚 Unified Documentation** - Everything in one place
- **🛠️ Shared Utilities** - Common types and tools

## 🚀 Quick Migration

```bash
# Clone the new monorepo
git clone https://github.com/DREAMSCAPE-AI/dreamscape-monorepo.git
cd dreamscape-monorepo

# Install dependencies  
npm install

# Start development
npm run dev
```

## 📚 Documentation

- [Quick Start Guide](https://github.com/DREAMSCAPE-AI/dreamscape-monorepo/blob/main/QUICK_START.md)
- [Migration Guide](https://github.com/DREAMSCAPE-AI/dreamscape-monorepo/blob/main/MIGRATION_GUIDE.md) 
- [Full Documentation](https://github.com/DREAMSCAPE-AI/dreamscape-monorepo/blob/main/README.md)

## 🎯 What Changed

### **Before (Multi-repo)**
```
auth-service/          # Separate repository
user-service/          # Separate repository  
voyage-service/        # Separate repository
payment-service/       # Separate repository
ai-service/           # Separate repository
panorama-service/     # Separate repository
web-client/           # Separate repository
dreamscape-gateway/   # Separate repository
```

### **After (Monorepo)**
```
dreamscape-monorepo/
├── apps/
│   ├── web-client/       # Frontend application
│   └── gateway/          # API Gateway
├── services/
│   ├── auth/            # Authentication service
│   ├── user/            # User management
│   ├── voyage/          # Travel & booking
│   ├── payment/         # Payment processing  
│   ├── ai/              # AI recommendations
│   └── panorama/        # VR/Panorama service
├── infra/              # Infrastructure as code
├── tests/              # Centralized testing
└── docs/               # Unified documentation
```

## ⚡ New Workflow

```bash
# Old way - clone multiple repos
git clone auth-service
git clone user-service  
git clone voyage-service
# ... setup each one individually

# New way - single command
git clone dreamscape-monorepo
cd dreamscape-monorepo
npm run setup && npm run dev
```

---

## 🎉 Welcome to Unified Development!

**This repository is now archived.** All future development happens in the [dreamscape-monorepo](https://github.com/DREAMSCAPE-AI/dreamscape-monorepo).

**Questions?** Check the [Migration Guide](https://github.com/DREAMSCAPE-AI/dreamscape-monorepo/blob/main/MIGRATION_GUIDE.md) or create an issue in the monorepo.

*Migration completed on $(date) with Claude Code assistance.*