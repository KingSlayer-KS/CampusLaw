# CampusLaw - Technical Documentation

## Complete System Architecture & Implementation Guide

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Data Flow Analysis](#data-flow-analysis)
4. [API Endpoints & Functions](#api-endpoints--functions)
5. [Authentication System](#authentication-system)
6. [State Management](#state-management)
7. [Implementation Details](#implementation-details)
8. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Overview

### Project Structure

```
CampusLaw/
├── src/
│   ├── app/
│   │   ├── chat/page.tsx          # Protected chat interface
│   │   ├── login/page.tsx          # Authentication page
│   │   ├── signup/page.tsx         # Registration page
│   │   └── api/auth/               # API route proxies
│   ├── components/
│   │   ├── ChatInterface.tsx       # Main chat UI
│   │   ├── useChatHistory.ts       # State management hook
│   │   ├── AuthGuard.tsx           # Route protection
│   │   ├── UserMenu.tsx            # User dropdown menu
│   │   └── HistorySidebar.tsx      # Chat history sidebar
│   └── lib/
│       └── logout.ts               # Logout utilities
└── CampusLawBacked/
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts             # Authentication endpoints
    │   │   ├── history.ts          # Chat session management
    │   │   └── ask.ts              # AI response generation
    │   └── index.ts                # Express server
    └── prisma/
        └── schema.prisma           # Database schema
```

### Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL
- **Authentication**: JWT tokens with refresh tokens
- **AI Integration**: OpenAI API for legal information
- **Database**: PostgreSQL with pgvector for embeddings

---

## Architecture Components

### 1. Frontend Architecture

#### Core Components

**ChatInterface.tsx** - Main UI Controller

- Manages user input and message display
- Orchestrates API calls to backend
- Handles real-time UI updates
- Integrates with useChatHistory hook

**useChatHistory.ts** - State Management Hub

- Single source of truth for chat sessions
- Manages local storage persistence
- Handles server synchronization
- Provides session CRUD operations

**AuthGuard.tsx** - Route Protection

- Protects authenticated routes
- Redirects unauthenticated users
- Manages authentication state

#### Data Structures

```typescript
interface ChatSession {
  id: string; // Local session ID (e.g., "1756679253273")
  backendId?: string; // Server session ID (e.g., "srv-123")
  title: string; // Chat title (auto-generated from first message)
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  messages: Message[]; // Array of chat messages
}

interface Message {
  id: string; // Unique message ID
  type: "user" | "assistant" | "error";
  content: string; // Message text
  legalResponse?: LegalResponse; // AI response data
  timestamp: string; // ISO timestamp
}

interface LegalResponse {
  traceId: string;
  question: string;
  jurisdiction: string;
  short_answer: string[];
  what_the_law_says: {
    act: string;
    section: string;
    url: string;
    quote: string;
  }[];
  caveats: string[];
  sources: string[];
  followups: string[];
  confidence: "high" | "medium" | "low";
}
```

### 2. Backend Architecture

#### API Endpoints

**Authentication Routes** (`/auth`)

- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - Session termination

**Chat Management Routes** (`/history`)

- `GET /history` - Retrieve user's chat sessions
- `POST /history` - Create new chat session
- `PATCH /history/:id` - Update session (title, etc.)
- `DELETE /history/:id` - Delete session
- `POST /history/:id/messages` - Add message to session

**AI Integration Routes** (`/ask`)

- `POST /ask` - Generate legal response

---

## Data Flow Analysis

### Complete Message Flow Example

When a user types "What is a lease?" and hits send:

#### Step 1: Session Creation

```typescript
// 1. Local session created by useChatHistory
const localSession = {
  id: "1756679253273",
  title: "New chat",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z",
  messages: [],
};

// 2. Backend session created via API
POST / history;
Body: {
  title: "New chat";
}
Response: {
  session: {
    id: "123";
  }
}

// 3. Session binding
bindBackendId("1756679253273", "123");
```

#### Step 2: User Message Processing

```typescript
// 4. Add to local state
addMessageToActive({
  type: "user",
  content: "What is a lease?",
  timestamp: "2024-01-15T10:30:05.000Z"
});

// 5. Save to backend
POST /history/123/messages
Body: { role: "user", content: "What is a lease?" }
```

#### Step 3: AI Response Generation

```typescript
// 6. Call AI API
POST /ask
Body: {
  query: "What is a lease?",
  topic: "tenancy",
  sessionId: "123"
};

// 7. AI Response
const aiResponse = {
  traceId: "ai-12345",
  question: "What is a lease?",
  jurisdiction: "Ontario",
  short_answer: ["A lease is a legal agreement..."],
  what_the_law_says: [...],
  caveats: [...],
  sources: [...],
  confidence: "high"
};
```

#### Step 4: Response Storage

```typescript
// 8. Add to local state
addMessageToActive({
  type: "assistant",
  content: "",
  legalResponse: aiResponse,
  timestamp: "2024-01-15T10:30:10.000Z"
});

// 9. Save to backend
POST /history/123/messages
Body: {
  role: "assistant",
  content: "",
  legalResponse: aiResponse,
  traceId: "ai-12345"
};
```

#### Step 5: Auto-titling

```typescript
// 10. Auto-title triggered in addMessageToActive
if (shouldAutoTitle) {
  const title = "What is a lease?".slice(0, 40); // "What is a lease?"
  renameSession("1756679253273", title);

  // 11. Sync to backend
  PATCH / history / 123;
  Body: {
    title: "What is a lease?";
  }
}
```

### State Synchronization Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local State   │    │   Backend API   │    │   Database      │
│                 │    │                 │    │                 │
│ ChatSession[]   │◄──►│ /history        │◄──►│ sessions table  │
│ Message[]       │◄──►│ /history/:id/   │◄──►│ messages table  │
│ User info       │◄──►│ messages        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## API Endpoints & Functions

### Frontend API Functions

#### useChatHistory.ts Functions

| Function                   | Purpose                          | API Calls              | Data Generated       |
| -------------------------- | -------------------------------- | ---------------------- | -------------------- |
| `load()`                   | Load sessions from localStorage  | None                   | ChatSession[]        |
| `save()`                   | Persist sessions to localStorage | None                   | localStorage update  |
| `newBlankSession()`        | Create empty session             | None                   | ChatSession object   |
| Initial Load               | Hydrate from server              | `GET /history`         | Merged ChatSession[] |
| Token Refresh              | Handle expired tokens            | `POST /auth/refresh`   | New JWT tokens       |
| `createSession()`          | Start new chat                   | None                   | New ChatSession      |
| `deleteSession(id)`        | Remove chat                      | `DELETE /history/{id}` | Session removal      |
| `renameSession(id, title)` | Update title                     | `PATCH /history/{id}`  | Title update         |
| `addMessageToActive(msg)`  | Add message                      | `PATCH /history/{id}`  | Message + auto-title |

#### ChatInterface.tsx Functions

| Function                 | Purpose                  | API Calls       | Data Generated        |
| ------------------------ | ------------------------ | --------------- | --------------------- |
| `ensureBackendSession()` | Create server session    | `POST /history` | Backend session ID    |
| `callLegalAPI()`         | Get AI response          | `POST /ask`     | LegalResponse object  |
| `handleSendMessage()`    | Orchestrate message flow | Multiple calls  | Complete message flow |
| `apiFetch()`             | Generic API wrapper      | Various         | Response data         |

### Backend API Endpoints

#### Authentication Endpoints

**POST /auth/signup**

```typescript
Request: {
  email: string;
  password: string;
  name?: string;
}

Response: {
  token: string;           // JWT access token
  refreshToken: string;    // Refresh token
  user: {
    id: string;
    email: string;
    name?: string;
  };
}
```

**POST /auth/login**

```typescript
Request: {
  email: string;
  password: string;
}

Response: {
  token: string;
  refreshToken: string;
  user: User;
}
```

**POST /auth/refresh**

```typescript
Request: {
  refreshToken: string;
}

Response: {
  token: string;
  refreshToken: string;
  expiresAt: string;
}
```

**POST /auth/logout**

```typescript
Request: {
  refreshToken: string;
}

Response: {
  ok: boolean;
}
```

#### Chat Management Endpoints

**GET /history**

```typescript
Headers: {
  Authorization: "Bearer {jwt}";
}

Response: {
  sessions: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }
  [];
}
```

**POST /history**

```typescript
Request: {
  title: string;
}

Response: {
  session: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }
}
```

**PATCH /history/:id**

```typescript
Request: {
  title?: string;
}

Response: {
  session: Session;
}
```

**DELETE /history/:id**

```typescript
Response: {
  ok: boolean;
}
```

**POST /history/:id/messages**

```typescript
Request: {
  role: "user" | "assistant";
  content: string;
  legalResponse?: LegalResponse;
  traceId?: string;
}

Response: {
  message: Message;
}
```

#### AI Integration Endpoints

**POST /ask**

```typescript
Request: {
  query: string;
  topic: "tenancy" | "traffic";
  sessionId: string;
}

Response: {
  traceId: string;
  answer: LegalResponse;
}
```

---

## Authentication System

### Token Management

#### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  iat: number; // Issued at
  exp: number; // Expires at
}
```

#### Refresh Token Structure

```typescript
interface RefreshToken {
  token: string; // Opaque token
  userId: string;
  expiresAt: Date;
}
```

### Authentication Flow

1. **Login Process**

   ```
   User Input → Backend Validation → JWT + Refresh Token → localStorage
   ```

2. **Token Refresh Process**

   ```
   401 Error → Check Refresh Token → New JWT → Retry Request
   ```

3. **Logout Process**
   ```
   Logout Request → Invalidate Refresh Token → Clear localStorage → Redirect
   ```

### Security Features

- **JWT Expiration**: Short-lived access tokens (15 minutes)
- **Refresh Token Rotation**: New refresh token on each refresh
- **Secure Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
- **CORS Protection**: Backend configured to allow specific origins
- **Input Validation**: All inputs validated using Zod schemas

---

## State Management

### useChatHistory Hook Architecture

#### State Variables

```typescript
const [sessions, setSessions] = useState<ChatSession[]>([]);
const [activeId, setActiveId] = useState<string | null>(null);
```

#### Computed Values

```typescript
const active = useMemo(
  () => sessions.find((s) => s.id === activeId) ?? null,
  [sessions, activeId]
);
```

#### Persistence Strategy

```typescript
// Load on mount
useEffect(() => {
  const s = load();
  setSessions(s);
  setActiveId(s[0]?.id ?? null);
}, []);

// Save on changes
useEffect(() => save(sessions), [sessions]);
```

### State Synchronization

#### Local-First Architecture

1. **Immediate Updates**: UI updates instantly with local state
2. **Background Sync**: Server synchronization happens asynchronously
3. **Conflict Resolution**: Server state takes precedence on load
4. **Offline Support**: App works with cached data when offline

#### Session Binding

```typescript
// Local session ID: "1756679253273"
// Backend session ID: "123"
// Binding: bindBackendId("1756679253273", "123")
```

---

## Implementation Details

### Key Implementation Patterns

#### 1. Optimistic Updates

```typescript
// UI updates immediately
addMessageToActive({ type: "user", content: "Hello" });

// Backend sync happens in background
apiFetch(`/history/${sessionId}/messages`, {
  method: "POST",
  body: JSON.stringify({ role: "user", content: "Hello" }),
}).catch(console.warn);
```

#### 2. Error Handling

```typescript
try {
  const response = await apiFetch("/ask", {
    /* ... */
  });
  // Handle success
} catch (error) {
  addMessageToActive({
    type: "error",
    content: error.message || "Unexpected error",
  });
}
```

#### 3. Token Refresh Logic

```typescript
if (res.status === 401) {
  const refreshToken = localStorage.getItem("refreshToken");
  if (refreshToken) {
    const refreshResponse = await fetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshResponse.ok) {
      // Retry original request with new token
    }
  }
}
```

#### 4. Auto-titling Logic

```typescript
const shouldAutoTitle =
  msg.type === "user" &&
  active.messages.length === 0 &&
  (active.title === "New chat" || !active.title);

if (shouldAutoTitle) {
  const title = msg.content.slice(0, 40);
  renameSession(active.id, title);
}
```

### Performance Optimizations

#### 1. Lazy Loading

- Messages loaded only when session is opened
- Backend sessions don't include message content initially

#### 2. Debounced Updates

- Title updates debounced to prevent excessive API calls
- Batch operations for multiple state updates

#### 3. Memoization

- Active session computed with useMemo
- Expensive operations cached appropriately

#### 4. Background Sync

- Non-critical operations happen in background
- UI remains responsive during sync operations

---

## Troubleshooting Guide

### Common Issues & Solutions

#### 1. Authentication Issues

**Problem**: 401 Unauthorized errors

```
Solution: Check token expiration and refresh logic
- Verify JWT_SECRET is set in backend
- Check token refresh endpoint is working
- Ensure CORS is configured correctly
```

**Problem**: Tokens not persisting

```
Solution: Check localStorage implementation
- Verify localStorage is available
- Check for storage quota exceeded
- Ensure tokens are being set correctly
```

#### 2. Session Management Issues

**Problem**: Sessions not syncing between devices

```
Solution: Verify backend session creation
- Check /history endpoint is working
- Verify session binding is correct
- Ensure backendId is being set properly
```

**Problem**: Auto-titling not working

```
Solution: Check auto-titling conditions
- Verify first message detection logic
- Check title update API calls
- Ensure backend sync is working
```

#### 3. API Integration Issues

**Problem**: AI responses not generating

```
Solution: Check OpenAI integration
- Verify OPENAI_API_KEY is set
- Check /ask endpoint implementation
- Ensure proper error handling
```

**Problem**: Messages not saving to backend

```
Solution: Check message storage
- Verify /history/:id/messages endpoint
- Check authentication headers
- Ensure proper error handling
```

### Debug Tools

#### Console Logging

```typescript
// Enable detailed logging
console.log("[useChatHistory] creating new session:", session);
console.log("[ChatInterface] API call:", { url, method, body });
console.log("[Auth] Token refresh:", { success, newToken });
```

#### Network Monitoring

- Use browser DevTools Network tab
- Monitor API request/response cycles
- Check for failed requests and error responses

#### State Inspection

```typescript
// Add to components for debugging
console.log("Current sessions:", sessions);
console.log("Active session:", active);
console.log("User state:", user);
```

### Performance Monitoring

#### Key Metrics to Track

1. **API Response Times**: Monitor backend performance
2. **Token Refresh Frequency**: Identify authentication issues
3. **Session Creation Rate**: Monitor user engagement
4. **Error Rates**: Track system reliability

#### Monitoring Implementation

```typescript
// Add performance monitoring
const startTime = performance.now();
const response = await apiFetch("/ask", {
  /* ... */
});
const duration = performance.now() - startTime;
console.log(`API call took ${duration}ms`);
```

---

## Deployment Considerations

### Environment Variables

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

#### Backend (.env)

```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-strong-secret-here
OPENAI_API_KEY=sk-your-openai-key
REFRESH_TOKEN_TTL_DAYS=30
```

### Production Optimizations

1. **Security**: Use httpOnly cookies for refresh tokens
2. **Performance**: Implement Redis for session storage
3. **Monitoring**: Add comprehensive logging and metrics
4. **Caching**: Implement response caching for AI calls
5. **Rate Limiting**: Add API rate limiting for abuse prevention

### Database Schema

#### Sessions Table

```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Messages Table

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  role VARCHAR(20),
  content TEXT,
  legal_response JSONB,
  trace_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Conclusion

This technical documentation provides a comprehensive overview of the CampusLaw system architecture, implementation details, and operational considerations. The system is designed with scalability, maintainability, and user experience in mind, featuring:

- **Robust Authentication**: JWT with refresh token rotation
- **Efficient State Management**: Local-first with background sync
- **Responsive UI**: Optimistic updates and error handling
- **Scalable Backend**: RESTful API with proper separation of concerns
- **AI Integration**: Structured legal information generation

The architecture supports real-time chat functionality while maintaining data persistence and cross-device synchronization, making it suitable for production deployment with proper monitoring and security measures in place.

---

_Document generated for CampusLaw Technical Documentation_
_Version: 1.0_
_Date: January 2024_
