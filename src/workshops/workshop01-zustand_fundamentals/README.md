<div align="center">

  # Workshop 01: Zustand Fundamentals

  ทำความเข้าใจ **Store**, **State**, **Action** และ **Data Flow**  
  ผ่านโปรเจกต์ Counter ขนาดเล็กด้วย React + TypeScript

  ![Level](https://img.shields.io/badge/Level-Beginner-22C55E)
  ![Zustand](https://img.shields.io/badge/Zustand-Fundamentals-433E38)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)

  [หน้าหลัก](../../../README.md) · [Zustand Docs](https://zustand.docs.pmnd.rs/)

</div>

---

## เป้าหมายการเรียนรู้

เมื่อจบ Workshop นี้ คุณจะสามารถ:

- อธิบายความแตกต่างระหว่าง Store, State และ Action ได้
- สร้าง Zustand Store ที่กำหนด Type ด้วย TypeScript ได้
- อัปเดต State ผ่านฟังก์ชัน `set()` ได้อย่างถูกต้อง
- ใช้ Selector เพื่อเลือก State หรือ Action ที่ Component ต้องการได้
- อธิบาย Data Flow ระหว่าง Component และ Store ได้

## สารบัญ

1. [Zustand คืออะไร?](#1-zustand-คืออะไร)
2. [ติดตั้ง Zustand](#2-ติดตั้ง-zustand)
3. [ทำความเข้าใจ Store, State และ Action](#3-ทำความเข้าใจ-store-state-และ-action)
4. [สร้าง TypeScript Store](#4-สร้าง-typescript-store)
5. [นำ Store ไปใช้กับ React Components](#5-นำ-store-ไปใช้กับ-react-components)
6. [Data Flow ทำงานอย่างไร?](#6-data-flow-ทำงานอย่างไร)
7. [Workshop Challenge](#7-workshop-challenge)
8. [คำถามทบทวน](#8-คำถามทบทวน)

---

## 1. Zustand คืออะไร?

[Zustand](https://zustand.docs.pmnd.rs/) คือ Library สำหรับจัดการ State ในแอปพลิเคชัน React เหมาะกับข้อมูลที่ต้องใช้งานร่วมกันระหว่างหลาย Components

สมมติว่าแอปมี Components สามตัว:

- `Header` แสดงชื่อพนักงาน
- `Profile` แสดงรายละเอียดพนักงาน
- `Settings` เปลี่ยนชื่อพนักงาน

หากใช้ `useState` ที่ Parent Component อาจต้องส่งข้อมูลผ่าน Props หลายชั้น แต่ Zustand ช่วยให้เราสร้าง **Store กลาง** ซึ่งแต่ละ Component สามารถเข้าถึง State เดียวกันได้โดยตรง

```text
                   ┌─────────────────────────┐
                   │      Zustand Store      │
                   │ employeeName = "Tony"  │
                   └────────────┬────────────┘
                                │
               ┌────────────────┼────────────────┐
               │                │                │
          ┌────▼────┐      ┌────▼─────┐    ┌────▼─────┐
          │ Header  │      │ Profile  │    │ Settings │
          │ อ่านชื่อ │      │ อ่านชื่อ  │    │ เปลี่ยนชื่อ │
          └─────────┘      └──────────┘    └──────────┘
```

> [!IMPORTANT]
> การใช้ Zustand ไม่ได้หมายความว่าต้องเลิกใช้ `useState` ทั้งสองอย่างสามารถทำงานร่วมกันได้

| เลือกใช้ | เหมาะกับ |
| --- | --- |
| `useState` | State ที่ใช้เฉพาะภายใน Component |
| Zustand | State ที่หลาย Components ต้องใช้ร่วมกัน |

## 2. ติดตั้ง Zustand

ภายในโปรเจกต์ React + TypeScript ให้ติดตั้งด้วย pnpm:

```bash
pnpm add zustand
```

Zustand รองรับ TypeScript อยู่แล้ว จึงไม่ต้องติดตั้ง `@types/zustand` เพิ่ม

### โครงสร้างไฟล์ของ Workshop

```text
src/
├── stores/
│   └── useCounterStore.ts
├── components/
│   ├── CounterDisplay.tsx
│   └── CounterButtons.tsx
└── App.tsx
```

## 3. ทำความเข้าใจ Store, State และ Action

ก่อนเริ่มเขียนโค้ด มาทำความรู้จักคำสำคัญสามคำ:

| คำศัพท์ | ความหมาย | ตัวอย่าง |
| --- | --- | --- |
| **Store** | ที่เก็บ State และ Actions | `useCounterStore` |
| **State** | ข้อมูลปัจจุบันของแอป | `count: 0` |
| **Action** | ฟังก์ชันที่ใช้จัดการ State | `increase()` |

ใน Workshop นี้ เราจะสร้างระบบนับจำนวนที่เริ่มต้นจาก `count = 0` และเพิ่มค่าเป็น `1` เมื่อเรียก `increase()`

## 4. สร้าง TypeScript Store

สร้างไฟล์ `src/stores/useCounterStore.ts`:

```ts
import { create } from "zustand";

interface CounterStore {
  count: number;
  increase: () => void;
}

export const useCounterStore = create<CounterStore>()((set) => ({
  count: 0,

  increase: () => {
    set((state) => ({
      count: state.count + 1,
    }));
  },
}));
```

เราจะแยกทำความเข้าใจ Store นี้ทีละส่วน

### ส่วนที่ 1: Interface

```ts
interface CounterStore {
  count: number;
  increase: () => void;
}
```

`CounterStore` กำหนดรูปแบบข้อมูลที่ Store ต้องมี:

- `count: number` — ค่า `count` ต้องเป็นตัวเลข
- `increase: () => void` — `increase` ต้องเป็นฟังก์ชันที่ไม่รับ Parameter และไม่คืนค่าที่นำไปใช้ต่อ

หากกำหนด `count: "Hello"` TypeScript จะตรวจพบว่า Type ไม่ตรงกับ Interface

### ส่วนที่ 2: create

```ts
create<CounterStore>()((set) => ({
  // State และ Actions
}));
```

| ส่วนประกอบ | หน้าที่ |
| --- | --- |
| `create` | สร้าง Zustand Store |
| `<CounterStore>` | กำหนด Type ของ Store |
| `()` | รูปแบบการเรียก `create` สำหรับ TypeScript |
| `set` | ฟังก์ชันจาก Zustand สำหรับเปลี่ยน State |
| `({ ... })` | คืน Object ที่ประกอบด้วย State และ Actions |

### ส่วนที่ 3: State เริ่มต้น

```ts
count: 0
```

เมื่อ Store ถูกสร้างขึ้น State ชื่อ `count` จะมีค่าเริ่มต้นเป็น `0`

### ส่วนที่ 4: Action และ set

```ts
increase: () => {
  set((state) => ({
    count: state.count + 1,
  }));
},
```

ลำดับการทำงาน:

1. เรียก Action `increase()`
2. `set()` รับ State ปัจจุบันเข้ามาใน Callback
3. คำนวณค่าใหม่ด้วย `state.count + 1`
4. คืน Object ที่มี `count` ค่าใหม่
5. Zustand อัปเดต Store และแจ้ง Components ที่เกี่ยวข้อง

```text
Current State        Action          Next State
  count: 0     ── increase() ──▶      count: 1
```

> [!WARNING]
> ไม่ควรเปลี่ยน State โดยตรงด้วย `state.count++` ให้ใช้ `set()` เพื่ออัปเดต State เสมอ

## 5. นำ Store ไปใช้กับ React Components

เมื่อสร้าง Store แล้ว ขั้นตอนถัดไปคืออ่าน State และเรียก Action จาก Components

### Component 1: CounterDisplay

สร้างไฟล์ `src/components/CounterDisplay.tsx`:

```tsx
import { useCounterStore } from "../stores/useCounterStore";

export default function CounterDisplay() {
  const count = useCounterStore((state) => state.count);

  return <h2>Count: {count}</h2>;
}
```

บรรทัดสำคัญคือ:

```ts
const count = useCounterStore((state) => state.count);
```

ฟังก์ชัน `(state) => state.count` เรียกว่า **Selector** มีหน้าที่เลือกเฉพาะ `count` จาก Store เมื่อค่านี้เปลี่ยน Component จึงจะได้รับค่าใหม่และ Re-render ตามความเหมาะสม

### Component 2: CounterButtons

สร้างไฟล์ `src/components/CounterButtons.tsx`:

```tsx
import { useCounterStore } from "../stores/useCounterStore";

export default function CounterButtons() {
  const increase = useCounterStore((state) => state.increase);

  return <button onClick={increase}>Increase +1</button>;
}
```

Component นี้ไม่ได้อ่าน `count` แต่เลือกเฉพาะ Action `increase` เมื่อผู้ใช้กดปุ่ม Component จะเรียก Action ใน Store โดยตรง

### Component 3: App

แก้ไขไฟล์ `src/App.tsx`:

```tsx
import CounterButtons from "./components/CounterButtons";
import CounterDisplay from "./components/CounterDisplay";

export default function App() {
  return (
    <main>
      <CounterDisplay />
      <CounterButtons />
    </main>
  );
}
```

ตอนนี้ทั้งสอง Components สามารถทำงานร่วมกันผ่าน Zustand Store ได้ โดยไม่ต้องส่ง Props ระหว่างกัน

## 6. Data Flow ทำงานอย่างไร?

```text
┌────────────────────────┐
│  1. CounterButtons     │
│  ผู้ใช้กด Increase      │
└───────────┬────────────┘
            │ เรียก increase()
            ▼
┌────────────────────────┐
│  2. Zustand Action     │
│  คำนวณและเรียก set()   │
└───────────┬────────────┘
            │ อัปเดต State
            ▼
┌────────────────────────┐
│  3. Store State        │
│  count: 0 → count: 1   │
└───────────┬────────────┘
            │ Selector ได้รับค่าใหม่
            ▼
┌────────────────────────┐
│  4. CounterDisplay     │
│  แสดงผล Count: 1       │
└────────────────────────┘
```

นี่คือแนวคิดหลักของ Zustand: **Component เรียก Action → Action อัปเดต Store → Component ที่เลือก State นั้นได้รับค่าใหม่**

## 7. Workshop Challenge

เพิ่มความสามารถให้ Counter อีกสองอย่าง โดยลองเขียนด้วยตัวเองก่อนดูคำใบ้

### เป้าหมาย

- [x] เพิ่ม Action `decrease` สำหรับลด `count` ลง 1
- [x] เพิ่ม Action `reset` สำหรับคืน `count` เป็น 0
- [x] เพิ่มปุ่ม Increase, Decrease และ Reset ใน `CounterButtons`
- [x] ทดสอบว่าทั้งสามปุ่มเปลี่ยนค่าใน `CounterDisplay` ได้

### Hints

<details>
<summary><strong>Hint 1:</strong> TypeScript Interface ต้องเพิ่มอะไร?</summary>

เพิ่ม Signature ของ Actions ใหม่ให้กับ `CounterStore`

```ts
decrease: () => void;
reset: () => void;
```

</details>

<details>
<summary><strong>Hint 2:</strong> decrease ต้องเขียน set อย่างไร?</summary>

อ่าน `count` ปัจจุบันแล้วลบออกหนึ่งค่า

```ts
set((state) => ({ count: state.count - 1 }));
```

</details>

<details>
<summary><strong>Hint 3:</strong> reset จำเป็นต้องใช้ state.count ไหม?</summary>

ไม่จำเป็น เพราะเราทราบค่าที่ต้องการกำหนดอยู่แล้ว

```ts
set({ count: 0 });
```

</details>

<details>
<summary><strong>Hint 4:</strong> Component จะเรียก Action ใหม่อย่างไร?</summary>

เลือกแต่ละ Action ด้วย Selector แล้วส่งให้ `onClick`

```tsx
const decrease = useCounterStore((state) => state.decrease);
const reset = useCounterStore((state) => state.reset);
```

</details>

## 8. คำถามทบทวน

ลองตอบคำถามต่อไปนี้ด้วยตัวเองก่อนเรียน Workshop ถัดไป:

1. `create<CounterStore>()` ทำหน้าที่อะไร และทำไมจึงต้องระบุ `CounterStore`?
2. `set((state) => ({ count: state.count + 1 }))` แตกต่างจาก `set({ count: 1 })` อย่างไร?
3. ทำไม `CounterButtons` จึงเปลี่ยนตัวเลขใน `CounterDisplay` ได้ ทั้งที่ไม่ได้ส่ง Props ให้กัน?

### สิ่งที่ควรส่งเพื่อตรวจ

- โค้ด `useCounterStore.ts` หลังทำ Challenge เสร็จ
- โค้ด `CounterButtons.tsx` หลังทำ Challenge เสร็จ
- คำตอบของคำถามทบทวนทั้งสามข้อ

การตรวจจะครอบคลุมทั้ง **TypeScript**, **Logic** และความเข้าใจเรื่อง **Data Flow** เพื่อให้พื้นฐานพร้อมสำหรับ Workshop ถัดไป

---

<div align="center">

  **ถัดไป:** Workshop 02 — TypeScript + Store

  [← กลับสู่หน้าหลัก](../../../README.md)

</div>
