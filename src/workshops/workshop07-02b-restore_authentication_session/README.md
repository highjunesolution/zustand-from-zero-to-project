<div align="center">

  # Workshop 07.2.2: Restore Authentication Session

  ตรวจสอบ Session เดิมหลัง Refresh  
  ด้วย React + Zustand + Express TypeScript

  ![Level](https://img.shields.io/badge/Level-Intermediate-F59E0B)
  ![Zustand](https://img.shields.io/badge/Zustand-Authentication-433E38)
  ![Security](https://img.shields.io/badge/Security-Session_Restore-DC2626?logo=owasp&logoColor=white)

  [← Workshop 07.2.1](../workshop07-02a-express/README.md) · [หน้าหลัก](../../../README.md) · [Express Session Docs](https://expressjs.com/en/resources/middleware/session.html)

</div>

---

## เกี่ยวกับ Workshop

Workshop นี้ต่อจาก Workshop 07.2.1 ซึ่งเราเปลี่ยน Mock Authentication Service เป็น Express Backend และเก็บ Session ID ใน HttpOnly Cookie แล้ว

Workshop 07.2 แบ่งเป็นสามช่วง:

| Workshop | หัวข้อ | เป้าหมาย |
| --- | --- | --- |
| **07.2.1** | Express TypeScript + Login API | Login แล้ว Browser ได้รับ Session Cookie |
| **07.2.2 ← บทนี้** | Current User + Restore Session | Refresh แล้ว Login ยังอยู่ |
| **07.2.3** | Logout + Session Destruction | Logout แล้ว Session ฝั่ง Backend ถูกลบ |

เราจะใช้ `server.ts`, `authService.ts`, `useAuthStore.ts`, `LoginForm.tsx` และ `AuthProfile.tsx` ที่ทำเสร็จแล้วใน Workshop 07.2.1 ต่อ ไม่ต้องเริ่มใหม่ทั้งหมด

บทนี้จะทำ **07.2.2** ให้ครบตั้งแต่สร้าง `/api/auth/me` จน React Restore User หลัง Refresh สำเร็จ ส่วน Backend Logout API จะเพิ่มใน Workshop 07.2.3

ปัญหาที่เราจะลงมือแก้คือ:

> Login สำเร็จแล้ว แต่เมื่อ Refresh หน้าเว็บ React กลับมาแสดง `LoginForm` ทั้งที่ Session Cookie ยังอยู่ใน Browser

สาเหตุคือ Zustand Store อยู่ในหน่วยความจำของ JavaScript เมื่อ Refresh หน้าเว็บ Store จะถูกสร้างใหม่จากค่าเริ่มต้น ส่วน Session ฝั่ง Backend และ Cookie ใน Browser อาจยังมีผลอยู่

Workshop นี้จะทำให้ React ตรวจสอบ Session เดิมผ่าน `GET /api/auth/me` และนำข้อมูล User กลับมาใส่ Zustand โดยอัตโนมัติ กระบวนการนี้เรียกว่า **Restore Authentication State**

> [!NOTE]
> Workshop นี้ใช้โปรเจกต์เดิมทั้งหมด และยังไม่สร้าง Logout API จนกว่าจะถึง Workshop 07.2.3

## เป้าหมายการเรียนรู้

เมื่อจบ Workshop นี้ คุณจะสามารถ:

- อธิบายได้ว่าทำไม Zustand จึงลืม User หลัง Refresh
- สร้าง `GET /api/auth/me` ด้วย Express TypeScript ได้
- สร้าง `getCurrentUserApi()` ที่แยกกรณี Unauthenticated ออกจาก System Error ได้
- ออกแบบ `authStatus` สำหรับ Authentication Lifecycle ได้
- เพิ่ม `checkAuth()` ใน Zustand Store ได้
- ใช้ `useEffect()` ตรวจสอบ Session เมื่อเปิดแอปได้
- ป้องกันการแสดง `LoginForm` ก่อนตรวจสอบ Session เสร็จได้
- ทดสอบ Restore Session ผ่าน Browser และ DevTools ได้

## สารบัญ

1. [ทำไม Refresh แล้ว Login หาย?](#1-ทำไม-refresh-แล้ว-login-หาย)
2. [สร้าง GET /api/auth/me](#2-สร้าง-get-apiauthme)
3. [ทดสอบ Backend ก่อนเชื่อม React](#3-ทดสอบ-backend-ก่อนเชื่อม-react)
4. [สร้าง getCurrentUserApi](#4-สร้าง-getcurrentuserapi)
5. [เพิ่ม Authentication Status ใน Zustand](#5-เพิ่ม-authentication-status-ใน-zustand)
6. [สร้าง checkAuth Action](#6-สร้าง-checkauth-action)
7. [ตรวจสอบ Session เมื่อเปิดแอป](#7-ตรวจสอบ-session-เมื่อเปิดแอป)
8. [ทดสอบ Restore Session](#8-ทดสอบ-restore-session)
9. [Workshop Challenge](#9-workshop-challenge)
10. [คำถามทบทวน](#10-คำถามทบทวน)
11. [สิ่งที่ต้องส่งก่อนขึ้น Workshop 07.2.3](#สิ่งที่ต้องส่งก่อนขึ้น-workshop-0723)

---

## 1. ทำไม Refresh แล้ว Login หาย?

ใน `useAuthStore.ts` มี State เริ่มต้นดังนี้:

```ts
user: null,
loading: false,
error: null,
```

หลัง Login สำเร็จ Store จะเก็บ User:

```ts
set({ user });
```

React จึงแสดง `AuthProfile` ได้ แต่เมื่อ Refresh หน้าเว็บ JavaScript จะเริ่มทำงานใหม่และ Zustand Store จะกลับไปใช้ค่าเริ่มต้น ในขณะเดียวกัน Browser อาจยังมี Session Cookie เดิมอยู่

เราจึงต้องถาม Backend ว่า Session ที่ Browser ส่งมายังถูกต้องหรือไม่:

```text
┌──────────────────────────┐
│ Refresh React App        │
│ Zustand: user = null     │
└────────────┬─────────────┘
             │ GET /api/auth/me
             │ Browser ส่ง Session Cookie
             ▼
┌──────────────────────────┐
│ Express Session          │
│ โหลด Session จาก Store   │
└────────────┬─────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌───────────┐  ┌───────────────┐
│ HTTP 200  │  │ HTTP 401      │
│ ส่ง User  │  │ ไม่มี User    │
└───────────┘  └───────────────┘
```

เราไม่ได้นำ Session ID ไปเก็บใน Zustand เพราะ Browser จัดการ HttpOnly Cookie ให้อยู่แล้ว Frontend เก็บเฉพาะ User และสถานะที่จำเป็นสำหรับ UI

## 2. สร้าง GET /api/auth/me

เปิด `server/src/server.ts` ซึ่งมี Login Route จาก Workshop ก่อนหน้า:

```ts
app.post("/api/auth/login", /* ... */);
```

เพิ่ม Route ต่อไปนี้ก่อน `app.listen()`:

```ts
app.get("/api/auth/me", (req, res) => {
  res.setHeader("Cache-Control", "no-store");

  const user = req.session.user;

  if (!user) {
    return res.status(401).json({
      message: "Unauthenticated",
    });
  }

  return res.status(200).json({
    user,
  });
});
```

การวาง `Cache-Control: no-store` ไว้ต้น Route ทำให้ทั้ง Response `200` และ `401` ไม่ถูก Cache

### 2.1 อ่านข้อมูลจาก Session

```ts
const user = req.session.user;
```

ใน Workshop 07.2.1 เราเพิ่ม Module Augmentation ไว้แล้ว:

```ts
declare module "express-session" {
  interface SessionData {
    user?: AuthUser;
  }
}
```

TypeScript จึงรู้ว่า `req.session.user` มี Type เป็น `AuthUser | undefined`

### 2.2 ตอบ 401 เมื่อไม่มี User

```ts
if (!user) {
  return res.status(401).json({
    message: "Unauthenticated",
  });
}
```

HTTP `401 Unauthorized` ในที่นี้หมายความว่า Request ยังไม่มี Authentication ที่ถูกต้อง อาจเกิดจากผู้ใช้ยังไม่เคย Login, Session หมดอายุ หรือ Session ถูกลบไปแล้ว

### 2.3 ส่ง User เมื่อ Session ถูกต้อง

```ts
return res.status(200).json({ user });
```

React จะได้รับ Response รูปแบบนี้:

```json
{
  "user": {
    "id": "user001",
    "displayName": "Demo User",
    "email": "demo@example.com",
    "role": "USER"
  }
}
```

### ทำไมไม่ต้องตรวจ Session ID เอง?

เพราะเราได้ติดตั้ง Session Middleware ไว้ก่อน Routes แล้ว:

```ts
app.use(
  session({
    // session options
  }),
);
```

เมื่อ Browser ส่ง Cookie กลับมา `express-session` จะอ่าน Session ID, ตรวจลายเซ็น และโหลดข้อมูลจาก Session Store จากนั้น Route จึงเข้าถึง `req.session.user` ได้

> [!IMPORTANT]
> ไม่ควรอ่าน Header `Cookie` หรือแยก Session ID ด้วยตัวเองเมื่อใช้ `express-session` เพราะ Middleware จัดการขั้นตอนเหล่านี้ให้แล้ว

## 3. ทดสอบ Backend ก่อนเชื่อม React

หลัง Login สำเร็จ เปิด Console ใน Browser แล้วเรียก:

```js
const response = await fetch("/api/auth/me", {
  credentials: "include",
});

console.log(response.status);
console.log(await response.json());
```

ผลลัพธ์ที่คาดหวัง:

| Session | HTTP Status | Response |
| --- | --- | --- |
| Login แล้วและ Session ยังถูกต้อง | `200` | `{ user: ... }` |
| ยังไม่ Login | `401` | `{ message: "Unauthenticated" }` |
| Session หมดอายุหรือถูกลบ | `401` | `{ message: "Unauthenticated" }` |

> [!WARNING]
> อย่าใช้ปุ่ม Logout เดิมทดสอบการทำลาย Session เพราะตอนนี้ปุ่มนั้นล้างเฉพาะ Zustand State แต่ Session ฝั่ง Backend ยังอยู่ การที่ UI แสดง `LoginForm` จึงไม่ได้แปลว่า Server Session หายแล้ว

## 4. สร้าง getCurrentUserApi

เปิด `src/services/authService.ts` ซึ่งมี `loginApi()` อยู่แล้ว แล้วเพิ่ม Interface และ Function ต่อท้ายไฟล์:

```ts
interface MeResponse {
  user: AuthUser;
}

export async function getCurrentUserApi(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/me", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Session check failed: ${response.status}`);
  }

  const data: MeResponse = await response.json();

  return data.user;
}
```

### ทำไม Return Type เป็น Promise<AuthUser | null>?

Function นี้มีผลลัพธ์สามรูปแบบ:

| ผลลัพธ์ | ความหมาย |
| --- | --- |
| `AuthUser` | Backend ยืนยัน Session สำเร็จ |
| `null` | Backend ตอบ `401` เพราะไม่มี Authentication ที่ถูกต้อง |
| Throw Error | ตรวจสอบ Session ไม่สำเร็จ เช่น Server Error หรือ Network Error |

HTTP `401` ไม่จำเป็นต้องเป็น System Error เพราะเป็นเรื่องปกติที่ผู้ใช้ใหม่จะยังไม่ได้ Login การคืน `null` ทำให้ Store แยกสถานะ Unauthenticated ออกจากระบบขัดข้องได้

### ทำไมใช้ credentials: "include"?

`credentials: "include"` กำหนดให้ Fetch รองรับ Cookie ที่เกี่ยวข้องกับ Request โดย Frontend ไม่ต้องอ่านหรือจัดการ Session ID เอง

สำหรับ Vite Proxy ใน Workshop นี้ Request เป็น Same-origin ดังนั้นค่าเริ่มต้น `credentials: "same-origin"` ก็เพียงพอ แต่การระบุ `include` ช่วยสื่อเจตนาเรื่อง Cookie อย่างชัดเจน

อ่านเพิ่มเติมที่ [MDN: Including credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials)

## 5. เพิ่ม Authentication Status ใน Zustand

ก่อนหน้านี้ Store มีเพียง:

```ts
user: AuthUser | null;
```

แต่ `user === null` อาจหมายถึงสองกรณี:

1. ยังไม่ได้ตรวจว่า Browser มี Session หรือไม่
2. ตรวจแล้วและไม่มีผู้ใช้ที่ Login อยู่

หากแยกสองกรณีนี้ไม่ได้ React อาจแสดง `LoginForm` ทันทีทั้งที่ Backend ยังตรวจสอบ Session ไม่เสร็จ เราจึงต้องเพิ่ม `authStatus`

### 5.1 สร้าง Union Type

เปิด `src/stores/useAuthStore.ts` แล้วเพิ่ม:

```ts
type AuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "error";
```

| Status | ความหมาย |
| --- | --- |
| `checking` | กำลังตรวจสอบ Session |
| `authenticated` | Backend ยืนยันตัวตนสำเร็จ |
| `unauthenticated` | ยังไม่ได้ Login หรือ Session ไม่มีผล |
| `error` | ตรวจสอบ Session ไม่สำเร็จเพราะระบบขัดข้อง |

เราแยก `authStatus` ออกจาก `loading` เพราะ `loading` เดิมใช้กับการ Submit Login Form

### 5.2 เพิ่ม State และ Action ใน AuthStore

```ts
interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;

  authStatus: AuthStatus;

  login: (input: LoginInput) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

### 5.3 กำหนดค่าเริ่มต้น

```ts
user: null,
loading: false,
error: null,
authStatus: "checking",
```

Store เริ่มด้วย `checking` เพราะเมื่อเปิดแอป เรายังไม่รู้ว่า Browser มี Session ที่ถูกต้องหรือไม่ ต้องรอ Backend ตอบก่อนจึงเปลี่ยนเป็น `authenticated` หรือ `unauthenticated`

## 6. สร้าง checkAuth Action

เพิ่ม Import:

```ts
import {
  getCurrentUserApi,
  loginApi,
} from "../services/authService";
```

จากนั้นเพิ่ม Action ใน Store:

```ts
checkAuth: async () => {
  set({ authStatus: "checking", error: null });

  try {
    const user = await getCurrentUserApi();

    set({
      user,
      authStatus: user ? "authenticated" : "unauthenticated",
    });
  } catch (error) {
    set({
      user: null,
      authStatus: "error",
      error:
        error instanceof Error
          ? error.message
          : "Unable to verify session",
    });
  }
},
```

### ลำดับการทำงาน

```text
checkAuth()
    │
    ├─ set authStatus = "checking"
    │
    └─ GET /api/auth/me
         │
         ├─ 200 ───────▶ user + "authenticated"
         │
         ├─ 401 ───────▶ null + "unauthenticated"
         │
         └─ Error ─────▶ null + "error"
```

เราไม่ควรสรุปว่าผู้ใช้ Logout แล้วเพียงเพราะ Backend ติดต่อไม่ได้ เพราะ Network Error ไม่ได้พิสูจน์ว่า Session ไม่มีผล

### 6.1 ปรับ Login Action

หลัง `loginApi()` สำเร็จ ให้กำหนด `authStatus` ด้วย:

```ts
set({
  user,
  error: null,
  authStatus: "authenticated",
});
```

เมื่อ Login ไม่สำเร็จ:

```ts
set({
  user: null,
  authStatus: "unauthenticated",
  error:
    error instanceof Error
      ? error.message
      : "Login failed",
});
```

และปรับ `logout()` ชั่วคราวให้กำหนด `authStatus: "unauthenticated"` ด้วย

> [!WARNING]
> `logout()` ในขั้นนี้ยังล้างเฉพาะ Frontend State การทำลาย Session ฝั่ง Backend จะเพิ่มใน Workshop 07.2.3

## 7. ตรวจสอบ Session เมื่อเปิดแอป

เปิด `src/App.tsx` แล้วเรียก `checkAuth()` ผ่าน `useEffect()`:

```tsx
import { useEffect } from "react";
import AuthProfile from "./components/AuthProfile";
import LoginForm from "./components/LoginForm";
import { useAuthStore } from "./stores/useAuthStore";

export default function App() {
  const user = useAuthStore((state) => state.user);
  const authStatus = useAuthStore((state) => state.authStatus);
  const error = useAuthStore((state) => state.error);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (authStatus === "checking") {
    return <p>Checking authentication...</p>;
  }

  if (authStatus === "error") {
    return <p>Session verification failed: {error}</p>;
  }

  if (authStatus === "authenticated" && user) {
    return <AuthProfile />;
  }

  return <LoginForm />;
}
```

### ทำไมใช้ useEffect?

```tsx
useEffect(() => {
  void checkAuth();
}, [checkAuth]);
```

เราต้องการตรวจสอบ Session เมื่อ Component เริ่มทำงาน โดยไม่ส่ง HTTP Request ระหว่าง Render

- `void` แสดงเจตนาว่า Effect ไม่ได้รอ Promise เพื่อนำค่าไปใช้ต่อ
- `checkAuth` จัดการผลลัพธ์และ Error ภายใน Store
- `[checkAuth]` เป็น Dependency Array ของ Effect

### ทำไมต้องตรวจ authStatus ก่อน user?

รูปแบบเดิม:

```tsx
return user ? <AuthProfile /> : <LoginForm />;
```

มีปัญหาเพราะ `user` เริ่มต้นเป็น `null` จึงแสดง `LoginForm` ทันทีทั้งที่กำลังตรวจสอบ Session

รูปแบบใหม่จะรอผลก่อน:

```tsx
if (authStatus === "checking") {
  return <p>Checking authentication...</p>;
}
```

| authStatus | UI |
| --- | --- |
| `checking` | Checking authentication... |
| `authenticated` | `AuthProfile` |
| `unauthenticated` | `LoginForm` |
| `error` | Session verification failed |

### หมายเหตุเรื่อง React StrictMode

ใน Development ที่เปิด React Strict Mode อาจเห็น `GET /api/auth/me` ถูกเรียกสองครั้ง เพราะ React เรียก Effect เพิ่มเติมเพื่อช่วยตรวจจับปัญหา

สำหรับ Workshop นี้ Route เป็น GET ที่ใช้ตรวจสอบ Session จึงทดลองต่อได้ ส่วน Request Deduplication และ Race Condition เป็นหัวข้อที่ควรพิจารณาเมื่อพัฒนาระบบ Production อ่านเพิ่มเติมที่ [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects#why-effects-run-twice-in-development-and-how-to-fix-them)

## 8. ทดสอบ Restore Session

ทำการทดสอบตามลำดับต่อไปนี้

### 8.1 เปิด Frontend และ Backend

Terminal แรก:

```bash
cd server
pnpm dev
```

Terminal ที่สองจาก Project Root:

```bash
pnpm dev
```

เข้า React ผ่าน `http://localhost:5173`

### 8.2 Login ด้วยบัญชี Demo

| Field | Value |
| --- | --- |
| Email | `demo@example.com` |
| Password | `workshop123` |

ตรวจว่า `AuthProfile` แสดงข้อมูลหลัง Login สำเร็จ

### 8.3 Refresh หน้าเว็บ

ควรเห็น `Checking authentication...` ก่อน แล้วจึงแสดง `AuthProfile` อีกครั้งเมื่อ Backend ตอบ HTTP `200`

### 8.4 ตรวจสอบ Network

เปิด DevTools → **Network** → เลือก Request `me` แล้วตรวจว่า:

- Request ส่ง Cookie ไปด้วย
- Response Status เป็น `200`
- Response Body มีข้อมูล User
- Response Header มี `Cache-Control: no-store`

### 8.5 ทดลองกรณีไม่มี Session

เปิด Incognito Window ใหม่แล้วเข้าแอป ควรได้ HTTP `401` และ React แสดง `LoginForm`

### ผลลัพธ์ที่คาดหวัง

| สถานการณ์ | API | UI |
| --- | --- | --- |
| มี Session ถูกต้อง | `200` | `AuthProfile` |
| ยังไม่ Login | `401` | `LoginForm` |
| Session หมดอายุ | `401` | `LoginForm` |
| Backend ไม่ทำงาน | Network Error | Session verification failed |

> [!IMPORTANT]
> หาก Restart Backend ที่ยังใช้ `MemoryStore` ข้อมูล Session ฝั่ง Server จะหาย แม้ Browser ยังมี Cookie อยู่ `/api/auth/me` ก็จะตอบ `401` นี่เป็นข้อจำกัดของ Session Store สำหรับการทดลอง ไม่ใช่พฤติกรรมที่ควรใช้ใน Production

## 9. Workshop Challenge

### Challenge A — เพิ่ม Retry Button

เมื่อ Backend ไม่ทำงาน App จะแสดง Session Verification Failed ให้เพิ่มปุ่ม **Retry Authentication** เพื่อเรียก `checkAuth()` อีกครั้งโดยไม่ต้อง Refresh หน้าเว็บ

<details>
<summary><strong>เปิดคำใบ้</strong></summary>

เลือก `checkAuth` จาก Store แล้วเรียกจากปุ่ม:

```tsx
if (authStatus === "error") {
  return (
    <>
      <p>Session verification failed: {error}</p>
      <button onClick={() => void checkAuth()}>
        Retry Authentication
      </button>
    </>
  );
}
```

</details>

### Challenge B — สังเกต State Transitions

เปิด Zustand DevTools หรือเพิ่ม Log ชั่วคราว แล้วสังเกตว่า `authStatus` เปลี่ยนอย่างไรในกรณีต่อไปนี้:

- เปิดแอปโดยมี Session
- เปิดแอปโดยไม่มี Session
- Backend ไม่ทำงาน
- กด Retry หลัง Backend กลับมาทำงาน

### ภารกิจที่ต้องทำ

**ความคืบหน้า: 8/8**

- [x] เพิ่ม `GET /api/auth/me` ใน Express Backend
- [x] เพิ่ม `getCurrentUserApi` ใน `authService.ts`
- [x] เพิ่ม `authStatus` และ `checkAuth` ใน Zustand
- [x] ปรับ Login Action ให้เปลี่ยน `authStatus`
- [x] ใช้ `useEffect` ตรวจสอบ Session ใน App
- [x] ทดสอบ Refresh หลัง Login สำเร็จ
- [x] ทดสอบ Incognito และกรณี Backend ไม่ทำงาน
- [x] สร้างปุ่ม Retry Authentication

## 10. คำถามทบทวน

### 1. ทำไมต้องมี authStatus: "checking" ทั้งที่มี user: AuthUser | null อยู่แล้ว?

- A. เพราะ `user === null` แยกไม่ได้ระหว่างยังไม่ตรวจ Session กับตรวจแล้วแต่ไม่มี User
- B. เพราะ Zustand ไม่รองรับ `null`
- C. เพราะ `checking` ใช้เก็บ Session ID

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — `authStatus` ป้องกันการแสดง Login UI ก่อน Backend ตรวจสอบ Session เสร็จ

</details>

### 2. ทำไม getCurrentUserApi() คืน null เมื่อได้รับ HTTP 401 แทนการ Throw Error?

- A. เพราะ HTTP `401` หมายถึงไม่มี Authentication ที่ถูกต้อง ซึ่งเป็นสถานะปกติของผู้ใช้ที่ยังไม่ Login
- B. เพราะ `fetch()` ไม่รองรับ Error
- C. เพราะ `null` จะสร้าง Session ใหม่

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — การคืน `null` แยก Unauthenticated State ออกจาก Network หรือ Server Error ซึ่งควร Throw Error

</details>

### 3. ทำไม Zustand นำ User กลับมาได้หลัง Refresh ทั้งที่ไม่ได้ใช้ Persist Middleware?

- A. เพราะ Zustand อ่าน HttpOnly Cookie โดยตรง
- B. เพราะ Browser ส่ง Session Cookie ให้ Backend แล้ว `/api/auth/me` ส่ง User กลับมาให้ Store
- C. เพราะ React เก็บ State ไว้หลัง Refresh

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: B** — State ถูกสร้างใหม่จริง แต่ `checkAuth()` ใช้ Session ที่ยังอยู่ฝั่ง Browser/Backend เพื่อโหลด User กลับมาอีกครั้ง

</details>

## สิ่งที่ต้องส่งก่อนขึ้น Workshop 07.2.3

1. `server/src/server.ts` — Route `GET /api/auth/me`
2. `src/services/authService.ts` — `getCurrentUserApi()`
3. `src/stores/useAuthStore.ts` — `authStatus` และ `checkAuth()`
4. `src/App.tsx` — ตรวจ Session ตอน Mount และเลือก UI ตาม Status
5. ปุ่ม Retry Authentication จาก Challenge
6. คำตอบของคำถามทบทวนทั้งสามข้อ

สิ่งที่จะตรวจ:

- Session Lookup และ HTTP Status ของ `/api/auth/me`
- การแยก `401` ออกจาก Network หรือ Server Error
- Authentication State Transitions
- การเรียก Async Action ผ่าน `useEffect`
- การป้องกัน Login Form Flash ก่อนตรวจ Session เสร็จ
- Restore Authentication Data Flow หลัง Refresh

## สรุปเส้นทาง Authentication

```text
07.1   Authentication Store + Mock Login
  │
  ▼
07.2.1 Express TypeScript + Login API
  │
  ▼
07.2.2 Restore Session ด้วย /api/auth/me
  │
  ▼
07.2.3 Logout + Session Destruction
```

Workshop 07.2.3 จะเพิ่ม Backend Logout API เพื่อทำลาย Session ฝั่ง Server และทำให้ Authentication Flow ครบวงจร

## แหล่งข้อมูลเพิ่มเติม

- [Express Session](https://expressjs.com/en/resources/middleware/session.html)
- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [MDN: HTTP 401 Unauthorized](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401)
- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)

---

<div align="center">

  **ถัดไป:** Workshop 07.2.3 — Logout & Session Destruction

  [← Workshop 07.2.1](../workshop07-02a-express/README.md) · [กลับสู่หน้าหลัก](../../../README.md)

</div>
