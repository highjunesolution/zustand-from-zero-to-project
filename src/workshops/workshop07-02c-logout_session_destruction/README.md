<div align="center">

  # Workshop 07.2.3: Logout & Session Destruction

  ทำลาย Session ฝั่ง Backend และลบ HttpOnly Cookie  
  ด้วย React + Zustand + Express TypeScript

  ![Level](https://img.shields.io/badge/Level-Intermediate-F59E0B)
  ![Zustand](https://img.shields.io/badge/Zustand-Authentication-433E38)
  ![Security](https://img.shields.io/badge/Security-Session_Destruction-DC2626?logo=owasp&logoColor=white)

  [← Workshop 07.2.2](../workshop07-02b-restore_authentication_session/README.md) · [หน้าหลัก](../../../README.md) · [Express Session Docs](https://expressjs.com/en/resources/middleware/session.html)

</div>

---

## เกี่ยวกับ Workshop

Workshop นี้ต่อจาก Workshop 07.2.2 ซึ่ง React สามารถตรวจสอบ Session เดิมและ Restore User หลัง Refresh ได้แล้ว ขั้นตอนสุดท้ายของ Authentication Flow คือทำให้ Logout ยกเลิก Session ฝั่ง Backend จริง

Workshop 07.2 แบ่งเป็นสามช่วง:

| Workshop | หัวข้อ | เป้าหมาย |
| --- | --- | --- |
| **07.2.1** | Express TypeScript + Login API | Login แล้ว Browser ได้รับ Session Cookie |
| **07.2.2** | Current User + Restore Session | Refresh แล้ว Login ยังอยู่ |
| **07.2.3 ← บทนี้** | Logout + Session Destruction | Logout แล้ว Session ฝั่ง Backend ถูกลบ |

เราจะใช้ `server.ts`, `authService.ts`, `useAuthStore.ts` และ `AuthProfile.tsx` จาก Workshop ก่อนหน้าต่อ โดยไม่ต้องติดตั้ง Library เพิ่ม

เป้าหมายสำคัญของบทนี้คือ:

> เมื่อผู้ใช้กด Logout แล้ว การ Refresh หน้าเว็บต้องไม่ทำให้ผู้ใช้กลับมาอยู่ในสถานะ Login อีก

## เป้าหมายการเรียนรู้

เมื่อจบ Workshop นี้ คุณจะสามารถ:

- อธิบายความแตกต่างระหว่าง Frontend Logout กับ Backend Logout ได้
- ทำลาย Server-side Session ด้วย `req.session.destroy()` ได้
- สั่ง Browser ลบ Session Cookie ด้วย `res.clearCookie()` ได้
- สร้าง `POST /api/auth/logout` ที่ตอบ HTTP `204` ได้
- สร้าง `logoutApi(): Promise<void>` ได้
- เปลี่ยน Zustand Logout Action ให้เป็น Async Action ได้
- แยก Loading State ของ Login และ Logout ได้
- ป้องกันการส่ง Logout Request ซ้ำได้
- ทดสอบ Login → Restore → Logout แบบ End-to-End ได้

## สารบัญ

1. [ทำไมการล้าง Zustand ยังไม่ใช่ Logout จริง?](#1-ทำไมการล้าง-zustand-ยังไม่ใช่-logout-จริง)
2. [ทำลาย Session และลบ Cookie](#2-ทำลาย-session-และลบ-cookie)
3. [สร้าง POST /api/auth/logout](#3-สร้าง-post-apiauthlogout)
4. [สร้าง logoutApi](#4-สร้าง-logoutapi)
5. [สร้าง Async Logout Action](#5-สร้าง-async-logout-action)
6. [เชื่อมปุ่ม Logout กับ AuthProfile](#6-เชื่อมปุ่ม-logout-กับ-authprofile)
7. [ทำความเข้าใจ Logout Data Flow](#7-ทำความเข้าใจ-logout-data-flow)
8. [ทดสอบระบบ End-to-End](#8-ทดสอบระบบ-end-to-end)
9. [ข้อควรรู้ก่อนใช้ใน Production](#9-ข้อควรรู้ก่อนใช้ใน-production)
10. [Workshop Challenge](#10-workshop-challenge)
11. [คำถามทบทวน](#11-คำถามทบทวน)
12. [สิ่งที่ต้องส่งก่อนขึ้น Workshop 07.3](#สิ่งที่ต้องส่งก่อนขึ้น-workshop-073)

---

## 1. ทำไมการล้าง Zustand ยังไม่ใช่ Logout จริง?

ใน Workshop 07.2.2 Logout Action เดิมล้างเฉพาะ Frontend State:

```ts
logout: () => {
  set({
    user: null,
    loading: false,
    error: null,
    authStatus: "unauthenticated",
  });
},
```

โค้ดนี้เปลี่ยน UI ได้ แต่ไม่ได้ติดต่อ Backend:

```text
ก่อน Logout
┌─────────────────────┐    ┌─────────────────────┐
│ Zustand             │    │ Backend Session     │
│ authenticated       │    │ ยังใช้งานได้        │
└──────────┬──────────┘    └─────────────────────┘
           │ set({ user: null })
           ▼
หลัง Logout แบบเดิม
┌─────────────────────┐    ┌─────────────────────┐
│ Zustand             │    │ Backend Session     │
│ ไม่มี User          │    │ ยังใช้งานได้!       │
└─────────────────────┘    └─────────────────────┘
```

เมื่อ Refresh หน้าเว็บ `checkAuth()` จะเรียก `GET /api/auth/me` อีกครั้ง Backend ยังพบ Session เดิม จึงตอบ HTTP `200` และส่ง User กลับมา ทำให้ React แสดง `AuthProfile` อีกครั้ง

Logout ที่สมบูรณ์ต้องจัดการสามส่วน:

| ส่วน | หน้าที่ |
| --- | --- |
| Backend | ทำลาย Session ใน Session Store |
| Browser | ลบ Session Cookie |
| Zustand | ล้าง User และ Authentication State |

> [!IMPORTANT]
> การทำลาย Session ฝั่ง Backend สำคัญที่สุด เพราะเป็นการยกเลิกสิทธิ์ของ Session ID เดิม แม้ Client ยังมีสำเนา Cookie เก่า Session นั้นก็ต้องใช้งานต่อไม่ได้

## 2. ทำลาย Session และลบ Cookie

### 2.1 req.session.destroy()

ตอน Login เราใช้ `regenerate()` เพื่อสร้าง Session ID ใหม่:

```ts
req.session.regenerate((err) => {
  // สร้าง Session ID ใหม่
});
```

ตอน Logout เราจะใช้ `destroy()` เพื่อลบ Session ปัจจุบันออกจาก Session Store:

```ts
req.session.destroy((err) => {
  if (err) {
    return next(err);
  }

  // Session ถูกทำลายสำเร็จ
});
```

| Method | ใช้เมื่อใด | สิ่งที่เกิดขึ้น |
| --- | --- | --- |
| `regenerate()` | Login | สร้าง Session ID ใหม่ |
| `save()` | บันทึก Session | เขียนข้อมูล Session ลง Store |
| `destroy()` | Logout | ลบ Session ออกจาก Store |

`destroy()` เป็น Asynchronous Method ที่ใช้ Callback แจ้งผล เราต้องตรวจ `err` เพราะ Session Store เช่น Redis หรือ Database อาจลบข้อมูลไม่สำเร็จ

อ่านเพิ่มเติมที่ [Express Session: session.destroy](https://expressjs.com/en/resources/middleware/session.html#sessiondestroycallback)

### 2.2 res.clearCookie()

ใน Workshop 07.2.1 เราตั้งชื่อ Cookie ว่า `workshop.sid`:

```ts
session({
  name: "workshop.sid",
  // ...
});
```

เมื่อ Logout ให้ Backend สั่ง Browser ลบ Cookie:

```ts
res.clearCookie("workshop.sid", {
  path: "/",
  httpOnly: true,
  secure: false,
  sameSite: "lax",
});
```

React ไม่สามารถลบ Cookie นี้ผ่าน `document.cookie` ได้เพราะมี `HttpOnly` Backend จึงส่ง `Set-Cookie` ที่ทำให้ Cookie หมดอายุแทน

| คำสั่ง | สิ่งที่ลบ |
| --- | --- |
| `req.session.destroy()` | Session จาก Server-side Session Store |
| `res.clearCookie()` | Session Cookie จาก Browser |

> [!IMPORTANT]
> ชื่อและ Options ที่กำหนดขอบเขต Cookie โดยเฉพาะ `path` และ `domain` ต้องตรงกับ Cookie เดิม จึงจะลบ Cookie ได้ถูกตัว ไม่ต้องกำหนด `expires` หรือ `maxAge` เอง

## 3. สร้าง POST /api/auth/logout

เปิด `server/src/server.ts` แล้วเพิ่ม Route ต่อจาก `/api/auth/me` และก่อน `app.listen()`:

```ts
app.post("/api/auth/logout", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");

  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }

    res.clearCookie("workshop.sid", {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(204).end();
  });
});
```

### 3.1 ทำไมใช้ POST แทน GET?

Logout เปลี่ยน State ฝั่ง Server จึงควรใช้ `POST` ไม่ใช่ `GET` เพราะ Browser, Crawler หรือระบบ Prefetch อาจเรียก GET โดยไม่ได้ตั้งใจ

```http
POST /api/auth/logout
```

### 3.2 ทำไมต้อง destroy ก่อน clearCookie?

ลำดับการทำงานคือ:

1. Backend พยายามทำลาย Session
2. หากสำเร็จ จึงสั่ง Browser ลบ Cookie
3. ส่ง Response ว่า Logout สำเร็จ

หาก `destroy()` ล้มเหลว Route จะส่ง Error ผ่าน `next(err)` และไม่ตอบ HTTP `204`

### 3.3 ทำไมตอบ HTTP 204?

```ts
return res.status(204).end();
```

HTTP `204 No Content` หมายถึง Request สำเร็จและไม่มี Response Body Frontend จึงไม่ต้องรอ JSON เช่น `{ "success": true }`

### 3.4 Authentication Endpoints ตอนนี้

| Endpoint | Method | หน้าที่ |
| --- | --- | --- |
| `/api/auth/login` | `POST` | ตรวจ Credentials และสร้าง Session |
| `/api/auth/me` | `GET` | ตรวจสอบ Session ปัจจุบัน |
| `/api/auth/logout` | `POST` | ทำลาย Session และลบ Cookie |

ตรวจ TypeScript และเปิด Backend:

```bash
cd server
pnpm typecheck
pnpm dev
```

> [!WARNING]
> `secure: false` ใช้เฉพาะ HTTP localhost ใน Workshop เท่านั้น Production ต้องใช้ HTTPS และ Secure Cookie

## 4. สร้าง logoutApi

เปิด `src/services/authService.ts` แล้วเพิ่ม:

```ts
export async function logoutApi(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Logout failed: HTTP ${response.status}`);
  }
}
```

### ทำไม Return Type เป็น Promise<void>?

`logoutApi()` ต้องรอ Backend ทำลาย Session จึงเป็น Async Function แต่ไม่ต้องคืนข้อมูลให้ผู้เรียก เมื่อสำเร็จจึง Resolve เป็น `void`

### ทำไมไม่เรียก response.json()?

Backend ตอบ HTTP `204` ซึ่งไม่มี Response Body หากเรียก:

```ts
await response.json();
```

อาจเกิด `SyntaxError` เพราะไม่มี JSON ให้ Parse การตรวจ `response.ok` จึงเพียงพอ

### ทำไมใช้ credentials: "include"?

Browser ต้องส่ง Session Cookie เดิมไปยัง Backend เพื่อให้ `express-session` ระบุ Session ที่ต้องทำลาย Option นี้ไม่ได้ทำให้ JavaScript อ่าน Cookie แต่กำหนดให้ Browser แนบ Credentials ตามกฎที่เกี่ยวข้อง

อ่านเพิ่มเติมที่ [MDN: Including credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials)

> [!NOTE]
> Auth Service ไม่ต้อง Import Zustand เพราะมีหน้าที่จัดการ HTTP Request และ Response เท่านั้น

## 5. สร้าง Async Logout Action

### 5.1 เปลี่ยน Action Type

เปลี่ยน Logout จาก Synchronous Action:

```ts
logout: () => void;
```

เป็น Async Action:

```ts
logout: () => Promise<void>;
```

### 5.2 แยก Loading State

เพิ่ม `logoutLoading` แยกจาก `loading` ที่ใช้กับ Login:

```ts
interface AuthStore {
  user: AuthUser | null;
  authStatus: AuthStatus;
  loading: boolean;
  logoutLoading: boolean;
  error: string | null;

  login: (input: LoginInput) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}
```

กำหนดค่าเริ่มต้น:

```ts
logoutLoading: false,
```

Login และ Logout เป็นคนละ Operation จึงควรควบคุมปุ่มและข้อความ Loading แยกกัน

### 5.3 Import logoutApi

```ts
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
} from "../services/authService";
```

### 5.4 เขียน Logout Action

Store ต้องรับทั้ง `set` และ `get`:

```ts
const authStore: StateCreator<AuthStore> = (set, get) => ({
  // ...
});
```

เพิ่ม Async Logout Action:

```ts
logout: async () => {
  if (get().logoutLoading) return;

  set({
    logoutLoading: true,
    error: null,
  });

  try {
    await logoutApi();

    set({
      user: null,
      authStatus: "unauthenticated",
      error: null,
    });
  } catch (error) {
    set({
      error:
        error instanceof Error
          ? error.message
          : "Unable to logout",
    });
  } finally {
    set({ logoutLoading: false });
  }
},
```

> [!IMPORTANT]
> ต้องตรวจ `get().logoutLoading` **ก่อน** เปลี่ยนเป็น `true` หากวาง Guard หลัง `set({ logoutLoading: true })` Action จะ Return ทันทีทุกครั้งและไม่เรียก Logout API

### ลำดับการเปลี่ยน State

```text
Authenticated
user: AuthUser
logoutLoading: false
        │
        │ logout()
        ▼
Request Pending
user: AuthUser
logoutLoading: true
        │
   ┌────┴───────────────┐
   ▼                    ▼
Success                Error
user: null             user: AuthUser
unauthenticated        เก็บ Error
logoutLoading: false   logoutLoading: false
```

เมื่อ Logout ล้มเหลว เราไม่ล้าง `user` เพราะ Backend ยังไม่ได้ยืนยันว่า Session ถูกทำลายสำเร็จ ผู้ใช้ควรเห็น Error และสามารถลองใหม่ได้

### ทำไมใช้ get()?

`get()` อ่าน State ปัจจุบันภายใน Store:

```ts
if (get().logoutLoading) return;
```

แม้ปุ่มใน React จะถูก Disable ระหว่าง Logout แต่ Guard ใน Store ยังช่วยป้องกัน Component อื่นเรียก Action ซ้ำ

> [!NOTE]
> Store นี้เหมาะสำหรับเรียน Authentication Flow แต่ยังไม่ได้จัดการ Race Condition ระหว่าง `login()`, `checkAuth()` และ `logout()` อย่างครบถ้วน เช่น Response ของ `checkAuth()` ที่กลับมาหลัง Logout อาจเขียนทับ State ได้

## 6. เชื่อมปุ่ม Logout กับ AuthProfile

เปิด `src/components/AuthProfile.tsx` แล้วเลือก State และ Action ที่ต้องใช้:

```tsx
const user = useAuthStore((state) => state.user);
const logout = useAuthStore((state) => state.logout);
const logoutLoading = useAuthStore(
  (state) => state.logoutLoading,
);
const error = useAuthStore((state) => state.error);
```

ปรับปุ่ม Logout:

```tsx
<button
  type="button"
  disabled={logoutLoading}
  onClick={() => void logout()}
>
  {logoutLoading ? "Logging out..." : "Logout"}
</button>
```

แสดง Error เมื่อ Logout ไม่สำเร็จ:

```tsx
{error && (
  <p role="alert" style={{ color: "red" }}>
    {error}
  </p>
)}
```

ตัวอย่าง Component ฉบับรวม:

```tsx
import { useAuthStore } from "../stores/useAuthStore";

const AuthProfile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const logoutLoading = useAuthStore(
    (state) => state.logoutLoading,
  );
  const error = useAuthStore((state) => state.error);

  if (!user) return null;

  return (
    <div>
      <h2>Welcome, {user.displayName}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>

      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={logoutLoading}
        onClick={() => void logout()}
      >
        {logoutLoading ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
};

export default AuthProfile;
```

`App.tsx` ไม่ต้องเปลี่ยน Decision Logic หลัก เพราะเมื่อ Logout สำเร็จ Store จะกำหนด `authStatus: "unauthenticated"` ทำให้ App Re-render และแสดง `LoginForm` โดยอัตโนมัติ

## 7. ทำความเข้าใจ Logout Data Flow

```text
┌─────────────────────────┐
│ AuthProfile             │
│ onClick → logout()      │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Zustand                 │
│ logoutLoading = true    │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Auth Service            │
│ await logoutApi()       │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Express                 │
│ destroy Session         │
│ clear Cookie            │
└────────────┬────────────┘
             │ HTTP 204
             ▼
┌─────────────────────────┐
│ Zustand                 │
│ user = null             │
│ unauthenticated         │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ App.tsx                 │
│ แสดง LoginForm          │
└─────────────────────────┘
```

State จะถูกล้างหลัง Backend ตอบสำเร็จเท่านั้น จึงมั่นใจได้ว่า UI และ Server-side Session สอดคล้องกัน

## 8. ทดสอบระบบ End-to-End

### 8.1 เปิด Backend และ Frontend

Terminal แรก:

```bash
cd server
pnpm dev
```

Terminal ที่สองจาก Project Root:

```bash
pnpm dev
```

เปิด `http://localhost:5173`

### 8.2 ใช้บัญชี Demo

| Field | Value |
| --- | --- |
| Email | `demo@example.com` |
| Password | `workshop123` |

### 8.3 ผลลัพธ์ที่คาดหวัง

| ขั้นตอน | HTTP Status | Zustand / React |
| --- | --- | --- |
| Login | `200` | `authenticated` และแสดง `AuthProfile` |
| Refresh → `/api/auth/me` | `200` | Restore User สำเร็จ |
| กด Logout | `204` | `unauthenticated` และแสดง `LoginForm` |
| Refresh → `/api/auth/me` | `401` | ยังแสดง `LoginForm` |

### 8.4 ตรวจสอบผ่าน DevTools

- [ ] `POST /api/auth/login` ตอบ HTTP `200`
- [ ] Application → Cookies พบ `workshop.sid`
- [ ] Refresh ก่อน Logout แล้ว `GET /api/auth/me` ตอบ `200`
- [ ] `POST /api/auth/logout` ตอบ `204`
- [ ] Cookie `workshop.sid` ถูกลบจาก Browser
- [ ] Refresh หลัง Logout แล้ว `GET /api/auth/me` ตอบ `401`
- [ ] `LoginForm` แสดงและ `AuthProfile` ไม่แสดง

### 8.5 ทดสอบ API หลัง Logout

เปิด Browser Console แล้วเรียก:

```js
const response = await fetch("/api/auth/me", {
  credentials: "include",
});

console.log(response.status);
console.log(await response.json());
```

ผลลัพธ์ที่คาดหวัง:

```text
401
{ message: "Unauthenticated" }
```

> [!CAUTION]
> อย่าส่ง Session ID หรือค่าจริงของ Cookie มาในแชทหรือ Screenshot ที่เผยแพร่

## 9. ข้อควรรู้ก่อนใช้ใน Production

Authentication Flow ใน Workshop เหมาะสำหรับการทดลอง แต่ระบบจริงยังต้องพิจารณาเรื่องต่อไปนี้:

| ประเด็น | สิ่งที่ควรทำใน Production |
| --- | --- |
| Session Storage | ใช้ Redis หรือ Database แทน `MemoryStore` |
| HTTPS | ตั้ง `secure: true` และกำหนด Reverse Proxy ให้ถูกต้อง |
| Password | ตรวจ Password Hash ใน Backend ไม่ใช้ Hardcoded Password |
| CSRF | ป้องกัน Request ที่เปลี่ยน State ด้วยมาตรการที่เหมาะสม |
| Race Conditions | ป้องกัน Async Actions ที่ตอบกลับผิดลำดับ |
| Session Expiration | จัดการการหมดอายุและ Re-authentication ฝั่ง Server |
| Authorization | ตรวจ Session และ Role ในทุก Protected Endpoint |

`SameSite=Lax` ช่วยลดความเสี่ยง CSRF บางรูปแบบแต่ไม่ใช่การป้องกันทั้งหมด และ `HttpOnly` ช่วยป้องกันการอ่าน Cookie ผ่าน JavaScript แต่ไม่ได้กำจัดความเสี่ยงจาก XSS

อ่านเพิ่มเติมที่ [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

## 10. Workshop Challenge

### Challenge A — ป้องกัน Double Logout

ทดลองลบ Guard นี้ชั่วคราว:

```ts
if (get().logoutLoading) return;
```

จากนั้นกด Logout หลายครั้งอย่างรวดเร็วและตรวจ Network ว่ามี Request กี่ครั้ง ใส่ Guard กลับคืนแล้วเปรียบเทียบผล

> เป้าหมาย: เข้าใจว่า `get()` ใช้อ่าน State ปัจจุบันภายใน Action อย่างไร

### Challenge B — จำลอง Logout Error

ปรับ Logout Route ชั่วคราวให้ตอบ HTTP `500` โดยยังไม่ทำลาย Session แล้วตรวจว่า:

- Error แสดงใน `AuthProfile`
- User ยังไม่ถูกล้าง
- ปุ่ม Logout กลับมาใช้งานได้
- เมื่อคืน Backend Route แล้วสามารถ Logout ใหม่ได้

<details>
<summary><strong>เปิดคำใบ้</strong></summary>

ตรวจ `catch` และ `finally` ใน `useAuthStore.ts` โดย `catch` ควรเก็บ Error แต่ไม่ล้าง User ส่วน `finally` ต้องกำหนด `logoutLoading: false`

</details>

> [!WARNING]
> หลังทดลองต้องคืน Logout Route ให้ทำงานตามปกติ

### Challenge C — ตรวจสอบ Session หลัง Logout

ทดลองตามลำดับ:

```text
Login → Logout → Refresh → GET /api/auth/me
```

อธิบายว่าเหตุใด Backend จึงตอบ HTTP `401` แม้ไม่ได้ใช้ Zustand Persist

### ภารกิจที่ต้องทำ

**ความคืบหน้า: 7/7**

- [x] เพิ่ม `POST /api/auth/logout`
- [x] ทำลาย Session ด้วย `req.session.destroy()`
- [x] ลบ Cookie ด้วย `res.clearCookie()`
- [x] เพิ่ม `logoutApi()` ใน Auth Service
- [x] เปลี่ยน Zustand Logout เป็น Async Action
- [x] เชื่อม Loading และ Error กับ `AuthProfile`
- [x] ทดสอบ Login → Restore → Logout ครบ Flow

## 11. คำถามทบทวน

### 1. req.session.destroy() กับ set({ user: null }) ต่างกันอย่างไร?

- A. ทั้งคู่ทำลาย Session ฝั่ง Server
- B. `destroy()` ลบ Session ฝั่ง Backend ส่วน `set()` ล้าง Zustand State
- C. `set()` ทำลาย HttpOnly Cookie

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: B** — ทั้งสองคำสั่งจัดการ State คนละฝั่ง จึงต้องใช้ร่วมกันใน Logout Flow ที่สมบูรณ์

</details>

### 2. ทำไม logoutApi() ใช้ Promise<void> และไม่เรียก response.json()?

- A. เพราะ HTTP `204` ไม่มี Response Body ให้ Parse
- B. เพราะ TypeScript ห้ามใช้ JSON กับ POST
- C. เพราะ Logout ทำงานแบบ Synchronous

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — Function ต้องรอ Async Request แต่เมื่อสำเร็จไม่มีข้อมูลที่ต้อง Return และไม่มี JSON Body ให้อ่าน

</details>

### 3. หาก Logout API ล้มเหลว Store ควรทำอย่างไร?

- A. ล้าง User ทันทีโดยไม่ตรวจสอบ
- B. เก็บ Error และยังไม่สรุปว่า Backend ทำลาย Session สำเร็จ
- C. Reset `localStorage` แล้วถือว่า Logout สำเร็จ

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: B** — Store ควรคง User ไว้ แสดง Error และเปิดให้ลองใหม่ เพราะ Backend ยังไม่ได้ยืนยันว่า Session ถูกทำลายแล้ว

</details>

## สิ่งที่ต้องส่งก่อนขึ้น Workshop 07.3

1. `server/src/server.ts` — Logout Route และ Session Destruction
2. `src/services/authService.ts` — `logoutApi()`
3. `src/stores/useAuthStore.ts` — Async Logout Action และ `logoutLoading`
4. `src/components/AuthProfile.tsx` — Logout Button, Loading และ Error
5. ผลทดสอบ Login → Restore → Logout
6. คำตอบของคำถามทบทวนทั้งสามข้อ

สิ่งที่จะตรวจ:

- ลำดับ `destroy()` → `clearCookie()` → HTTP `204`
- Cookie Name และ Options ที่ใช้ลบ Cookie
- Return Type และ Error Handling ของ `logoutApi()`
- State Lifecycle ของ Async Logout Action
- ตำแหน่ง Double Logout Guard
- UI Loading และ Error State
- ผลของ `/api/auth/me` หลัง Logout

## สรุป Authentication Flow

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
  │
  ▼
07.3   React Router + Protected Routes
```

เมื่อจบ Workshop นี้ ระบบมี Authentication Flow ครบสามส่วนแล้ว:

```text
Login → Restore Session → Logout
```

## แหล่งข้อมูลเพิ่มเติม

- [Express Session](https://expressjs.com/en/resources/middleware/session.html)
- [Express: res.clearCookie](https://expressjs.com/en/5x/api.html#res.clearCookie)
- [MDN: HTTP 204 No Content](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/204)
- [MDN: Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
- [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

<div align="center">

  **ถัดไป:** Workshop 07.3 — React Router & Protected Routes

  [← Workshop 07.2.2](../workshop07-02b-restore_authentication_session/README.md) · [กลับสู่หน้าหลัก](../../../README.md)

</div>
