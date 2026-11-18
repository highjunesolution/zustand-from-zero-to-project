<div align="center">

  <img src="./src/assets/hero.png" alt="Zustand Workshop" width="180" />

  # React + Zustand + TypeScript Workshop

  เรียนรู้การจัดการ State ด้วย Zustand ตั้งแต่พื้นฐาน  
  จนสามารถนำไปประยุกต์ใช้กับโปรเจกต์ React + TypeScript ได้จริง

  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
  ![Zustand](https://img.shields.io/badge/Zustand-5-433E38)
  ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

</div>

---

## เกี่ยวกับ Workshop

Workshop นี้ออกแบบมาให้เรียน Zustand อย่างเป็นลำดับ โดยเริ่มจากแนวคิดพื้นฐาน เช่น **Store**, **State** และ **Action** ก่อนต่อยอดไปสู่การจัดการข้อมูลที่ซับซ้อน การเรียก API การบันทึกข้อมูล และระบบ Authentication

> **แนวทางการเรียน**  
> เรียนรู้แนวคิด → ดูตัวอย่าง → ทำความเข้าใจการทำงาน → ทดลองเขียน → ตรวจสอบผลลัพธ์

## สิ่งที่จะได้เรียนรู้

- สร้าง Store และ Action ด้วย Zustand
- กำหนด Type ให้ Store ด้วย TypeScript
- เลือก State ด้วย Selector และเข้าใจการ Re-render
- จัดการ Object และ Array ภายใน Store
- จัดการ Async Action, Loading และ Error
- บันทึก State ลง `localStorage` ด้วย Persist Middleware
- ออกแบบ Authentication Store
- วางโครงสร้าง Store สำหรับโปรเจกต์จริง

## เริ่มต้นใช้งาน

### ความต้องการของระบบ

- [Node.js](https://nodejs.org/) เวอร์ชันที่รองรับ Vite 8
- [pnpm](https://pnpm.io/)

### ติดตั้งและรันโปรเจกต์

```bash
# ติดตั้ง dependencies
pnpm install

# เปิด development server
pnpm dev
```

จากนั้นเปิด URL ที่แสดงใน Terminal (โดยปกติคือ `http://localhost:5173`)

### คำสั่งที่ใช้บ่อย

| คำสั่ง | รายละเอียด |
| --- | --- |
| `pnpm dev` | เปิด Development Server |
| `pnpm build` | ตรวจ TypeScript และ Build สำหรับ Production |
| `pnpm lint` | ตรวจสอบคุณภาพโค้ดด้วย Oxlint |
| `pnpm preview` | Preview Production Build |

## Roadmap การเรียน Zustand

| Workshop | หัวข้อ | สิ่งที่จะได้ฝึก |
| :---: | --- | --- |
| 01 | **Zustand Fundamentals** | Store, State, Action และ `set` |
| 02 | **TypeScript + Store** | Interface, Parameters และ Return Types |
| 03 | **Selectors** | การเลือก State และการ Re-render |
| 04 | **Objects & Arrays** | เพิ่ม แก้ไข และลบข้อมูล Employee |
| 05 | **Async Actions** | เรียก API พร้อมจัดการ Loading และ Error |
| 06 | **Persist** | จัดเก็บ State ใน `localStorage` |
| 07 | **Authentication** | Login, Logout, User และ Token |
| 08 | **Store Architecture** | แยก Store และจัดโครงสร้างโปรเจกต์ |
| 09 | **Mini Project** | Employee Management เชื่อมต่อ API |

## Workshop ปัจจุบัน

### 01 — Zustand Fundamentals

เรียนรู้พื้นฐานการสร้าง Counter Store และเชื่อมต่อ Store เข้ากับ React Components โดยไม่ต้องส่ง Props ระหว่างกัน

หัวข้อหลัก:

- สร้าง State เริ่มต้น
- สร้าง Actions สำหรับเพิ่ม ลด และรีเซ็ตค่า
- ใช้ Selector อ่าน State และ Action
- ทำความเข้าใจ Data Flow ระหว่าง Store และ Components

เริ่มเรียนได้ที่ **[Workshop 01: Zustand Fundamentals](./src/workshops/workshop01-zustand_fundamentals/README.md)**

## โครงสร้างโปรเจกต์

```text
src/
├── components/
│   ├── CounterButtons.tsx
│   └── CounterDisplay.tsx
├── stores/
│   └── useCounterStore.ts
├── workshops/
│   └── workshop01-zustand_fundamentals/
│       └── README.md
├── App.tsx
└── main.tsx
```

## แนวคิดสำคัญ

```text
ผู้ใช้กดปุ่ม
     ↓
Component เรียก Action
     ↓
Action อัปเดต State ด้วย set()
     ↓
Component ที่เลือก State นั้น Re-render
```

Zustand เหมาะกับ State ที่หลาย Components ต้องใช้ร่วมกัน ส่วน State ที่ใช้เฉพาะภายใน Component ยังสามารถใช้ `useState` ได้ตามปกติ

---

<div align="center">
  เรียนทีละแนวคิด ทดลองด้วยตัวเอง และค่อย ๆ สร้างพื้นฐาน State Management ที่แข็งแรง
</div>
