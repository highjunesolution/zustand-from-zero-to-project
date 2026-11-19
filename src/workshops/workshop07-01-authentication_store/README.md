<div align="center">

  # Workshop 07.1: Authentication Store

  จัดการ Login, Logout และ Current User  
  ด้วย Zustand + TypeScript ผ่าน Mock Authentication Service

  ![Level](https://img.shields.io/badge/Level-Intermediate-F59E0B)
  ![Zustand](https://img.shields.io/badge/Zustand-Authentication-433E38)
  ![Security](https://img.shields.io/badge/Security-Fundamentals-DC2626?logo=owasp&logoColor=white)

  [← Workshop 06](../workshop06-persist/README.md) · [หน้าหลัก](../../../README.md) · [Zustand Docs](https://zustand.docs.pmnd.rs/)

</div>

---

## เกี่ยวกับ Workshop

ใน Workshop 01–06 เราได้เรียนรู้ Store, Actions, Selectors, Async API และ Persist แล้ว Workshop นี้จะนำแนวคิดเหล่านั้นมาต่อยอดเป็นระบบ **Login/Logout** ซึ่งเป็นหนึ่งในการใช้งาน Zustand ที่พบบ่อยใน React Application

Workshop 07 แบ่งเป็นสามช่วง:

| Workshop | หัวข้อ |
| --- | --- |
| **07.1** | Authentication State และ Login/Logout Actions |
| **07.2** | Backend API และ HttpOnly Cookie |
| **07.3** | Current User, Protected Routes และ React Router |

บทนี้เริ่มจาก **07.1** โดยจำลอง Backend เพื่อให้เข้าใจ Authentication Data Flow ก่อนเชื่อม API และ Session จริง

## เป้าหมายการเรียนรู้

เมื่อจบ Workshop นี้ คุณจะสามารถ:

- ออกแบบ State และ Actions สำหรับ Authentication ได้
- แยก `LoginInput` ออกจาก `AuthUser` ได้
- สร้าง Mock Authentication Service ที่คืน `Promise<AuthUser>` ได้
- สร้าง Async Login Action ที่คืน `Promise<boolean>` ได้
- จัดการ Loading และ Error ระหว่าง Login ได้
- แยก Form State ออกจาก Global Authentication State ได้
- สร้าง Logout Action และเลือก UI ตาม Current User ได้
- อธิบายว่า Frontend State ไม่ใช่ขอบเขตการรักษาความปลอดภัยได้

## สารบัญ

1. [Authentication Store ใช้ทำอะไร?](#1-authentication-store-ใช้ทำอะไร)
2. [ออกแบบ State และ Actions](#2-ออกแบบ-state-และ-actions)
3. [สร้าง Authentication Types](#3-สร้าง-authentication-types)
4. [สร้าง Mock Authentication Service](#4-สร้าง-mock-authentication-service)
5. [สร้าง Authentication Store](#5-สร้าง-authentication-store)
6. [สร้าง Login Form](#6-สร้าง-login-form)
7. [แสดง Profile และ Logout](#7-แสดง-profile-และ-logout)
8. [Workshop Challenge](#8-workshop-challenge)
9. [คำถามทบทวน](#9-คำถามทบทวน)
10. [สิ่งที่ต้องส่งก่อนขึ้น Workshop 07.2](#สิ่งที่ต้องส่งก่อนขึ้น-workshop-072)

---

## 1. Authentication Store ใช้ทำอะไร?

สมมติว่าแอปมี `LoginPage`, `Header` และ `Dashboard` เมื่อ Login สำเร็จ ทุก Component ที่เกี่ยวข้องต้องทราบว่าผู้ใช้ปัจจุบันคือใคร

```text
┌─────────────────────┐
│     Login Form      │
│ Email + Password    │
└──────────┬──────────┘
           │ login(input)
           ▼
┌─────────────────────┐
│ Authentication     │
│ Service / Backend  │
└──────────┬──────────┘
           │ AuthUser
           ▼
┌─────────────────────┐
│ Zustand Auth Store │
│ user/loading/error │
└──────┬────────┬─────┘
       │        │
       ▼        ▼
   Header    Dashboard
```

Zustand มีหน้าที่จัดการ **Authentication State ที่ Frontend ใช้แสดง UI** ส่วน Backend ต้องเป็นผู้ตรวจสอบ Password, Session และสิทธิ์ของทุก Request

> [!IMPORTANT]
> การซ่อน Component หรือเปลี่ยนหน้าใน React ไม่ใช่การป้องกันสิทธิ์ ผู้ใช้ควบคุมโค้ดและ State ฝั่ง Browser ได้ Backend จึงต้องตรวจสอบ Authentication และ Authorization เสมอ

## 2. ออกแบบ State และ Actions

Authentication Store จะมี State ดังนี้:

| State | Type | หน้าที่ |
| --- | --- | --- |
| `user` | `AuthUser \| null` | ผู้ใช้ที่ Login อยู่ หรือ `null` เมื่อยังไม่ได้ Login |
| `loading` | `boolean` | ระบุว่ากำลัง Login อยู่หรือไม่ |
| `error` | `string \| null` | ข้อความ Error จากการ Login |

และมี Actions:

| Action | Type | หน้าที่ |
| --- | --- | --- |
| `login` | `(input) => Promise<boolean>` | ส่งข้อมูล Login และแจ้งผลสำเร็จ/ล้มเหลว |
| `logout` | `() => void` | ล้าง Current User และ Authentication State |

สำหรับ Workshop 07.1 เราใช้ `user !== null` เพื่อเลือก UI ที่ต้องแสดง เมื่อเชื่อม Backend จริงจะเพิ่มการตรวจสอบ Session ตอนเปิดแอป

### ข้อควรจำจาก Persist

ไม่ควรเก็บ Password, Session ID, JWT หรือ Refresh Token ใน Zustand Persist ที่ใช้ `localStorage` เพราะ JavaScript ภายใน Origin เดียวกันเข้าถึงข้อมูลได้ และช่องโหว่ XSS เพียงจุดเดียวอาจเปิดเผยข้อมูลเหล่านี้ได้ ตามคำแนะนำของ [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)

ใน Workshop ที่เชื่อม Backend เราจะใช้ Session Cookie ที่ Server ตั้งค่า `HttpOnly`, `Secure` และ `SameSite` ให้เหมาะกับสถาปัตยกรรม ส่วน Zustand จะเก็บข้อมูล User สำหรับ UI ไว้ใน Memory

> [!NOTE]
> `HttpOnly` ป้องกัน JavaScript อ่าน Cookie โดยตรง แต่ Browser ยังส่ง Cookie ไปกับ Request ที่เข้าเงื่อนไขได้ รายละเอียดแต่ละ Attribute ดูได้จาก [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)

## 3. สร้าง Authentication Types

แยก Authentication ออกจาก Employee Store ด้วยโครงสร้างดังนี้:

```text
src/
├── types/
│   └── auth.ts
├── services/
│   └── mockAuth.ts
├── stores/
│   └── useAuthStore.ts
├── components/
│   ├── LoginForm.tsx
│   └── AuthProfile.tsx
└── App.tsx
```

สร้าง `src/types/auth.ts`:

```ts
export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface LoginInput {
  email: string;
  password: string;
}
```

Interfaces ทั้งสองมีหน้าที่ต่างกัน:

| Type | ใช้สำหรับ | มี Password? |
| --- | --- | :---: |
| `LoginInput` | ข้อมูลที่ผู้ใช้ส่งเพื่อ Login | ✅ |
| `AuthUser` | ข้อมูล User หลัง Login สำเร็จ | ❌ |

> [!IMPORTANT]
> `AuthUser` ไม่ควรมี Password เพราะ Password มีไว้ส่งให้ Authentication Service ตรวจสอบเท่านั้น ไม่ควรถูกเก็บใน Global Store หรือส่งกลับมาจาก Backend

## 4. สร้าง Mock Authentication Service

ก่อนเชื่อม Backend จริง เราจะจำลอง API ใน `src/services/mockAuth.ts`:

```ts
import type { AuthUser, LoginInput } from "../types/auth";

export async function mockLogin(input: LoginInput): Promise<AuthUser> {
  // จำลองการรอ Backend 500 ms
  await new Promise<void>((resolve) => setTimeout(resolve, 500));

  if (!input.email.trim() || !input.password.trim()) {
    throw new Error("Email and password are required");
  }

  // จำลอง Login ไม่สำเร็จ
  if (input.email === "fail@example.com") {
    throw new Error("Invalid credentials (demo)");
  }

  return {
    id: "demo-001",
    displayName: "Demo User",
    email: input.email,
    role: "USER",
  };
}
```

> [!WARNING]
> นี่คือ Mock สำหรับฝึก Zustand เท่านั้น ไม่ใช่ระบบ Authentication จริง เพราะยอมรับข้อมูล Login ที่ไม่ว่างเกือบทุกค่า ห้ามนำ Logic นี้ไปใช้ตรวจสอบตัวตนใน Production

### Data Flow ของ Mock Service

```text
LoginForm
    │ login({ email, password })
    ▼
Zustand Auth Store
    │ await mockLogin(input)
    ▼
Mock Authentication Service
    │ Promise<AuthUser>
    ▼
set({ user })
    │
    ▼
React แสดง AuthProfile
```

จาก Workshop 05 เราเคยสร้าง `fetchEmployees(): Promise<void>` เพราะ Action เก็บผลลัพธ์ลง Store โดยตรง แต่ `mockLogin(): Promise<AuthUser>` ต้องคืน User ให้ Auth Store นำไปใช้งาน

## 5. สร้าง Authentication Store

สร้าง `src/stores/useAuthStore.ts`

### 5.1 กำหนด Store Interface

```ts
import { create, type StateCreator } from "zustand";
import { mockLogin } from "../services/mockAuth";
import type { AuthUser, LoginInput } from "../types/auth";

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  login: (input: LoginInput) => Promise<boolean>;
  logout: () => void;
}
```

### ทำไม login คืน Promise<boolean>?

`boolean` ทำให้ Component ทราบผลและตัดสินใจทำงานต่อได้ เช่น Navigate ไป Dashboard ใน Workshop 07.3

```ts
const success = await login({
  email: "demo@example.com",
  password: "test123",
});

if (success) {
  // Navigate ไป Dashboard
}
```

### 5.2 สร้าง Login Action

```ts
const authStore: StateCreator<AuthStore> = (set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (input) => {
    set({ loading: true, error: null });

    try {
      const user = await mockLogin(input);

      set({ user });
      return true;
    } catch (error) {
      set({
        user: null,
        error: error instanceof Error ? error.message : "Login failed",
      });

      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null, loading: false, error: null });
  },
});

export const useAuthStore = create<AuthStore>()(authStore);
```

การแยก `authStore` เป็น `StateCreator<AuthStore>` ช่วยกำหนด Type ให้ State Creator ก่อนนำไปสร้าง Hook และเป็นพื้นฐานสำหรับการแยก Store Architecture ในภายหลัง

### ลำดับการเปลี่ยน State

```text
Initial                    Login Pending              Login Success
┌────────────────┐         ┌────────────────┐         ┌────────────────┐
│ user: null     │         │ user: null     │         │ user: AuthUser │
│ loading: false │   ──▶   │ loading: true  │   ──▶   │ loading: false │
│ error: null    │         │ error: null    │         │ error: null    │
└────────────────┘         └────────────────┘         └────────────────┘

                                   │
                                   └──────────────▶ Login Failed
                                                   ┌────────────────┐
                                                   │ user: null     │
                                                   │ loading: false │
                                                   │ error: "..."   │
                                                   └────────────────┘
```

- `try` เรียก Service และรับ `AuthUser`
- `set({ user })` เก็บ User เมื่อสำเร็จ
- `catch` ล้าง User, เก็บ Error และคืน `false`
- `finally` ปิด Loading ทั้งกรณีสำเร็จและล้มเหลว

## 6. สร้าง Login Form

สร้าง `src/components/LoginForm.tsx`:

```tsx
import { useState, type SubmitEvent } from "react";
import { useAuthStore } from "../stores/useAuthStore";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    void login({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign In</h2>

      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
};

export default LoginForm;
```

### Local State กับ Authentication State

| State | จัดเก็บด้วย | เหตุผล |
| --- | --- | --- |
| `email`, `password` | `useState` | เป็นข้อมูลชั่วคราวภายใน Form |
| `user`, `loading`, `error` | Zustand | หลาย Components ต้องใช้สถานะ Login ร่วมกัน |

บรรทัดนี้ตั้งใจไม่ใช้ค่าที่ Promise คืนมา:

```ts
void login({ email, password });
```

`void` แสดงเจตนาว่า Event Handler ไม่ต้องรอหรือใช้ `boolean` ในจุดนี้ ส่วน Login Action ยังทำงานแบบ Async ตามปกติ

## 7. แสดง Profile และ Logout

สร้าง `src/components/AuthProfile.tsx`:

```tsx
import { useAuthStore } from "../stores/useAuthStore";

const AuthProfile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return null;

  return (
    <div>
      <h2>Welcome, {user.displayName}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AuthProfile;
```

นำ Components ไปประกอบใน `src/App.tsx`:

```tsx
import AuthProfile from "./components/AuthProfile";
import LoginForm from "./components/LoginForm";
import { useAuthStore } from "./stores/useAuthStore";

export default function App() {
  const user = useAuthStore((state) => state.user);

  return (
    <main>
      {user ? <AuthProfile /> : <LoginForm />}
    </main>
  );
}
```

เมื่อ `user` มีข้อมูลจะแสดง `AuthProfile` หากเป็น `null` จะแสดง `LoginForm`

> [!WARNING]
> Conditional Rendering นี้ใช้ควบคุม UI เท่านั้น ไม่ใช่ Protected Route หรือ Authorization จริง Backend ต้องตรวจสอบ Session และสิทธิ์ของทุก API Request

## 8. Workshop Challenge

สร้าง Login ตามตัวอย่าง แล้วลงมือเขียน Logout Action และทดสอบ Data Flow ด้วยตัวเอง

### ภารกิจที่ต้องทำ

**ความคืบหน้า: 6/6**

- [x] สร้าง `AuthUser` และ `LoginInput`
- [x] สร้าง Mock Authentication Service
- [x] สร้าง `useAuthStore` และ Login Action
- [x] สร้าง `LoginForm` และ `AuthProfile`
- [x] สร้าง Logout Action เพื่อล้าง Authentication State
- [x] ทดสอบ Login สำเร็จ, Login ไม่สำเร็จ และ Logout

### Challenge A — เขียน Logout Action

เมื่อกด Logout ต้องได้ State ดังนี้:

```ts
user: null,
loading: false,
error: null,
```

<details>
<summary><strong>เปิดคำใบ้ Logout Action</strong></summary>

Workshop นี้ยังไม่มี Backend Logout API จึงอัปเดต State แบบ Synchronous ได้:

```ts
logout: () => {
  set({ user: null, loading: false, error: null });
},
```

</details>

### Challenge B — ทดสอบการทำงาน

| กรณี | ข้อมูลทดสอบ | ผลลัพธ์ที่คาดหวัง |
| --- | --- | --- |
| Login สำเร็จ | Email/Password ที่ไม่ว่าง | แสดง AuthProfile |
| กรอกไม่ครบ | Email หรือ Password ว่าง | แสดง Required Error |
| Login ไม่สำเร็จ | `fail@example.com` | แสดง Invalid Credentials |
| Logout | กดปุ่ม Logout | กลับไปแสดง LoginForm |

> [!NOTE]
> Password สำหรับ Mock จะเป็นข้อความใดก็ได้ที่ไม่ว่าง เพราะ Workshop นี้ยังไม่ได้ตรวจสอบ Credentials จริง

## 9. คำถามทบทวน

### 1. ทำไม user จึงมี Type เป็น AuthUser | null?

- A. เพราะ `null` หมายถึงยังไม่มี Current User ใน Store
- B. เพราะ TypeScript ไม่รองรับ Object อย่างเดียว
- C. เพราะ Zustand เปลี่ยน Object เป็น `null` อัตโนมัติ

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — ก่อน Login และหลัง Logout ระบบไม่มี Current User จึงต้องแทนสถานะนั้นด้วย `null`

</details>

### 2. ทำไม login คืน Promise<boolean> แต่ logout คืน void?

- A. Login มีงาน Async และส่งผลสำเร็จให้ Component ส่วน Logout ในบทนี้เปลี่ยน State ทันที
- B. Logout ไม่สามารถเป็น Async Function ได้
- C. Zustand บังคับให้ชื่อ `login` คืน Promise เสมอ

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — Login ต้องรอ Service และคืนผลสำหรับ Flow ถัดไป ส่วน Logout ยังไม่มี Backend Request จึงเป็น Synchronous Action

</details>

### 3. ทำไมไม่ควร Persist Password หรือ Authentication Token ใน localStorage?

- A. เพราะ `localStorage` เก็บได้เฉพาะตัวเลข
- B. เพราะ JavaScript ใน Origin เข้าถึงได้และ XSS อาจขโมยข้อมูลเหล่านี้
- C. เพราะ Persist ใช้กับ Authentication Store ไม่ได้

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: B** — Web Storage เข้าถึงได้ด้วย JavaScript จึงไม่เหมาะสำหรับ Session Identifier, Token หรือ Credentials

</details>

## สิ่งที่ต้องส่งก่อนขึ้น Workshop 07.2

1. `auth.ts` — `AuthUser` และ `LoginInput`
2. `mockAuth.ts` — Mock Login Service
3. `useAuthStore.ts` — Login และ Logout Actions
4. `LoginForm.tsx` — Form พร้อม Loading และ Error
5. `AuthProfile.tsx` — Current User และ Logout Button
6. คำตอบของคำถามทบทวนทั้งสามข้อ

สิ่งที่จะตรวจ:

- การแยก Login Input และ Auth User
- การกำหนด Return Type ของ Async Action
- State lifecycle ของ Login Success/Failure
- การแบ่ง Local Form State กับ Global Auth State
- การล้าง State ใน Logout Action
- ความเข้าใจขอบเขตความปลอดภัยของ Frontend

### เตรียมพร้อมสำหรับ Workshop ถัดไป

Workshop 07.2 จะเปลี่ยน Mock Service เป็น Backend API จริง:

```text
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

Backend จะตรวจสอบ Password และจัดการ Session ผ่าน HttpOnly Cookie จากนั้น React จะเรียก `/api/auth/me` เพื่อตรวจสอบ Session หลัง Refresh

หาก Frontend และ Backend อยู่คนละ Origin การส่ง Cookie ต้องพิจารณา `fetch(..., { credentials: "include" })`, CORS และ Cookie Attributes ให้สอดคล้องกัน ดูรายละเอียดที่ [MDN: Including credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials)

---

<div align="center">

  **ถัดไป:** Workshop 07.2 — Backend API & HttpOnly Cookie

  [← Workshop 06](../workshop06-persist/README.md) · [กลับสู่หน้าหลัก](../../../README.md)

</div>
