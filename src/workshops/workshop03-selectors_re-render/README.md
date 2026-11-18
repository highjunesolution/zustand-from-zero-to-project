<div align="center">

  # Workshop 03: Selectors & Re-render

  เลือก State ที่ Component ต้องการ  
  และลดการ Re-render ที่ไม่จำเป็นด้วย Zustand Selectors

  ![Level](https://img.shields.io/badge/Level-Beginner%20→%20Intermediate-F59E0B)
  ![Zustand](https://img.shields.io/badge/Zustand-Selectors-433E38)
  ![React](https://img.shields.io/badge/React-Re--render-61DAFB?logo=react&logoColor=white)

  [← Workshop 02](../workshop02-action_parameters/README.md) · [หน้าหลัก](../../../README.md) · [Zustand Docs](https://zustand.docs.pmnd.rs/)

</div>

---

## เกี่ยวกับ Workshop

Workshop นี้จะพาไปทำความเข้าใจหัวใจสำคัญของการใช้ Zustand กับ React นั่นคือการเลือก State ด้วย **Selector** เพื่อให้ Component ติดตามเฉพาะข้อมูลที่ต้องใช้ และ Re-render เมื่อข้อมูลนั้นเปลี่ยนจริง ๆ

เราจะต่อยอดจาก Counter Store ของ Workshop 01–02 โดยเพิ่ม State ชื่อ `label` แล้วเปรียบเทียบพฤติกรรมระหว่างการ Subscribe ทั้ง Store กับการเลือก State บางส่วน

## เป้าหมายการเรียนรู้

เมื่อจบ Workshop นี้ คุณจะสามารถ:

- อธิบายว่า Re-render คืออะไรและเกิดขึ้นเมื่อใดได้
- เปรียบเทียบการดึงทั้ง Store กับการใช้ Selector ได้
- ตรวจสอบการ Re-render ด้วย `console.log()` ได้
- เลือก State ให้เหมาะกับความต้องการของแต่ละ Component ได้
- อธิบายปัญหาของ Selector ที่สร้าง Object ใหม่ได้
- ใช้ `useShallow` เมื่อจำเป็นต้องเลือกหลายค่ารวมกันได้

## สารบัญ

1. [Re-render คืออะไร?](#1-re-render-คืออะไร)
2. [Selector คืออะไร?](#2-selector-คืออะไร)
3. [ทดลองกับ Store จริง](#3-ทดลองกับ-store-จริง)
4. [ทำนายผล Re-render](#4-ทำนายผล-re-render)
5. [การเลือก State หลายค่า](#5-การเลือก-state-หลายค่า)
6. [Workshop Challenge](#6-workshop-challenge)
7. [คำถามทบทวน](#7-คำถามทบทวน)
8. [สิ่งที่ต้องส่งก่อนขึ้น Workshop 04](#สิ่งที่ต้องส่งก่อนขึ้น-workshop-04)

---

## 1. Re-render คืออะไร?

**Re-render** คือการที่ React เรียก Component อีกครั้งเพื่อคำนวณ UI จาก Props และ State ล่าสุด

ตัวอย่าง Component ที่แสดงค่า Counter:

```tsx
const CounterDisplay = () => {
  const count = useCounterStore((state) => state.count);

  console.log("CounterDisplay Render");

  return <h2>Count: {count}</h2>;
};
```

เมื่อ Zustand อัปเดต `count` จาก `0` เป็น `1` Component ที่ Subscribe ค่า `count` จะ Re-render เพื่อแสดงค่าล่าสุด

```text
Store                     CounterDisplay
count: 0   ── update ──▶  Render: Count 1
count: 1
```

แต่ถ้า Store มี State หลายค่าและมีเพียงค่าหนึ่งที่เปลี่ยน ทุก Component จำเป็นต้อง Re-render หรือไม่?

> **คำตอบ:** ไม่จำเป็น Component ควร Re-render เมื่อข้อมูลที่ตัวเอง Subscribe เปลี่ยนเท่านั้น และนี่คือหน้าที่ของ Selector

## 2. Selector คืออะไร?

**Selector** คือฟังก์ชันที่เลือกข้อมูลบางส่วนออกจาก Store

### แบบที่ 1: Subscribe ทั้ง Store

```tsx
const store = useCounterStore();
```

Component นี้ Subscribe ข้อมูลทั้ง Store เมื่อ State ส่วนใดส่วนหนึ่งเปลี่ยน Component จะได้รับ Store Object ใหม่และ Re-render แม้ว่าข้อมูลที่นำมาแสดงจะยังเหมือนเดิม

### แบบที่ 2: เลือกเฉพาะ State

```tsx
const count = useCounterStore((state) => state.count);
```

Component นี้ Subscribe เฉพาะผลลัพธ์ของ Selector คือ `count` หาก State อื่นเปลี่ยนแต่ `count` เหมือนเดิม Component ไม่จำเป็นต้อง Re-render จากการอัปเดตนั้น

### เปรียบเทียบสองรูปแบบ

| รูปแบบ | Subscription | เมื่อ `label` เปลี่ยน |
| --- | --- | --- |
| `useCounterStore()` | ทั้ง Store | Re-render |
| `useCounterStore((state) => state.count)` | เฉพาะ `count` | ไม่ Re-render จากการเปลี่ยน `label` |

โดยปกติ Zustand ใช้ [`Object.is`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/is) เปรียบเทียบผลลัพธ์เก่าและใหม่ของ Selector

```text
Selector result เดิม ── Object.is ── Selector result ใหม่
         │                                  │
         ├── เท่ากัน    → ไม่แจ้งการเปลี่ยนแปลง
         └── ไม่เท่ากัน → Component Re-render
```

> [!TIP]
> เลือก State เท่าที่ Component ต้องใช้ จะทำให้ความสัมพันธ์ระหว่าง Component กับ Store ชัดเจนและลดงานที่ไม่จำเป็น

## 3. ทดลองกับ Store จริง

เราจะเพิ่ม State ชื่อ `label` เพื่อทดลองว่า Component ที่สนใจเฉพาะ `count` จะตอบสนองอย่างไรเมื่อ `label` เปลี่ยน

### 3.1 เพิ่ม State และ Action

เปิด `src/stores/useCounterStore.ts` แล้วเพิ่ม Type ต่อไปนี้ใน Interface เดิม:

```ts
interface CounterStore {
  // State และ Actions จาก Workshop ก่อนหน้า
  // ...

  label: string;
  setLabel: (value: string) => void;
}
```

เพิ่ม State และ Action ภายใน `create<CounterStore>()`:

```ts
label: "Counter A",

setLabel: (value) => {
  set({ label: value });
},
```

ตอนนี้ Store มี State หลักสองค่าที่อัปเดตแยกจากกันได้:

```ts
count: 0,
label: "Counter A",
```

### 3.2 สร้าง Component ที่ Subscribe ทั้ง Store

สร้าง `src/components/CounterWhole.tsx`:

```tsx
import { useCounterStore } from "../stores/useCounterStore";

const CounterWhole = () => {
  const store = useCounterStore();

  console.log("CounterWhole Render");

  return <h2>Whole: {store.count}</h2>;
};

export default CounterWhole;
```

แม้ Component จะแสดงเฉพาะ `store.count` แต่การเรียก `useCounterStore()` โดยไม่มี Selector หมายถึงการ Subscribe ทั้ง Store

### 3.3 เพิ่ม Log ใน CounterDisplay

แก้ไข `src/components/CounterDisplay.tsx`:

```tsx
import { useCounterStore } from "../stores/useCounterStore";

const CounterDisplay = () => {
  const count = useCounterStore((state) => state.count);

  console.log("CounterDisplay Render");

  return <h2>Count: {count}</h2>;
};

export default CounterDisplay;
```

Component นี้ Subscribe เฉพาะ `count`

### 3.4 สร้างปุ่มเปลี่ยน label

สร้าง `src/components/LabelButtons.tsx`:

```tsx
import { useCounterStore } from "../stores/useCounterStore";

const LabelButtons = () => {
  const setLabel = useCounterStore((state) => state.setLabel);

  return (
    <div>
      <button onClick={() => setLabel("Counter B")}>
        Change to B
      </button>

      <button onClick={() => setLabel("Counter A")}>
        Change to A
      </button>
    </div>
  );
};

export default LabelButtons;
```

### 3.5 ประกอบ Components ใน App

```tsx
import CounterButtons from "./components/CounterButtons";
import CounterDisplay from "./components/CounterDisplay";
import CounterWhole from "./components/CounterWhole";
import LabelButtons from "./components/LabelButtons";

export default function App() {
  return (
    <main>
      <CounterWhole />
      <CounterDisplay />

      <CounterButtons />
      <LabelButtons />
    </main>
  );
}
```

เปิด Browser DevTools ที่แท็บ **Console** แล้วทดลองกดปุ่มเปลี่ยน `count` และ `label`

## 4. ทำนายผล Re-render

### เมื่อเปลี่ยน label

```text
Zustand Store
label: "Counter A" → "Counter B"
         │
         ├── CounterWhole
         │   Subscribe ทั้ง Store → Re-render
         │
         └── CounterDisplay
             Subscribe count → ไม่ Re-render จาก update นี้
```

### เมื่อเปลี่ยน count

```text
Zustand Store
count: 0 → 1
     │
     ├── CounterWhole
     │   Subscribe ทั้ง Store → Re-render
     │
     └── CounterDisplay
         Subscribe count → Re-render
```

| การเปลี่ยนแปลง | CounterWhole | CounterDisplay |
| --- | :---: | :---: |
| `label` เปลี่ยน | Re-render | ไม่ Re-render จาก Zustand update นี้ |
| `count` เปลี่ยน | Re-render | Re-render |

> [!IMPORTANT]
> ตารางนี้อธิบายเฉพาะการอัปเดตจาก Zustand โดยสมมติว่า Parent ไม่ Re-render และค่าที่ Selector เลือกเปลี่ยนตามที่ระบุ Component ยังอาจ Re-render จากสาเหตุอื่นได้ เช่น Props หรือ Parent เปลี่ยน

### ข้อควรระวังระหว่างทดสอบ

หากเปิด [React Strict Mode](https://react.dev/reference/react/StrictMode) ใน Development อาจเห็น `console.log()` มากกว่าหนึ่งครั้ง พฤติกรรมนี้ช่วยตรวจหาปัญหาในช่วงพัฒนาและไม่ได้หมายความว่า Zustand มีบั๊ก

## 5. การเลือก State หลายค่า

หาก Component ต้องใช้ทั้ง `count` และ `label` วิธีที่เข้าใจง่ายคือใช้ Selectors แยกกัน:

```tsx
const count = useCounterStore((state) => state.count);
const label = useCounterStore((state) => state.label);
```

รูปแบบนี้ถูกต้องและเหมาะกับหลายกรณี

### ปัญหาของ Object Selector

บางครั้งเราอาจต้องการรวมหลายค่าเป็น Object:

```tsx
const data = useCounterStore((state) => ({
  count: state.count,
  label: state.label,
}));
```

Selector นี้สร้าง Object ใหม่ทุกครั้งที่ถูกเรียก แม้ `count` และ `label` จะยังเป็นค่าเดิม Reference ของ Object ก็ไม่เหมือนเดิม:

```ts
Object.is(
  { count: 0, label: "Counter A" },
  { count: 0, label: "Counter A" },
); // false
```

ใน Zustand v5 ผลลัพธ์ Selector ที่ Reference ไม่คงที่อาจทำให้เกิดการ Render ซ้ำหรือ Infinite Render Loop ได้

### ทำไมต้องมี useShallow?

`useShallow` ช่วยลดการ Re-render ที่ไม่จำเป็นเมื่อ Selector คืนค่าเป็น Object หรือ Array โดยเปรียบเทียบข้อมูลภายในระดับแรกด้วย **Shallow Comparison**

จำง่าย ๆ ว่า **Object ใหม่ไม่ได้แปลว่าข้อมูลข้างในเปลี่ยนเสมอไป**

```ts
const a = { count: 10 };
const b = { count: 10 };

console.log(a === b); // false
```

แม้ `count` จะเท่ากัน แต่ `a` และ `b` เป็น Object คนละตัวในหน่วยความจำจึงมี Reference ต่างกัน โดยปกติ Zustand ใช้ `Object.is` ตรวจสอบผลลัพธ์ของ Selector ซึ่งจะพิจารณา Reference ของ Object ด้วย

### useShallow ช่วยอย่างไร?

เมื่อต้องการเลือก `count` และ `label` พร้อมกัน ให้นำ Selector ไปครอบด้วย `useShallow`:

```tsx
import { useShallow } from "zustand/react/shallow";

const data = useCounterStore(
  useShallow((state) => ({
    count: state.count,
    label: state.label,
  })),
);
```

`useShallow` จะเปรียบเทียบ Properties ระดับแรก หากค่าทั้งหมดยังเหมือนเดิม จะใช้ Object ผลลัพธ์เดิมต่อ ทำให้ Component ไม่ Re-render จากผลลัพธ์ Selector ที่ไม่ได้เปลี่ยนจริง

```text
Object A                         Object B
┌─────────────────────┐         ┌─────────────────────┐
│ count: 10           │         │ count: 10           │
│ label: "A"          │         │ label: "A"          │
└──────────┬──────────┘         └──────────┬──────────┘
           │                               │
           └────── Shallow Comparison ─────┘
                           │
                     Shallow Equal
              Properties ระดับแรกเหมือนกัน
```

> [!IMPORTANT]
> Shallow Comparison ไม่ได้เปรียบเทียบ Object ซ้อนกันทุกระดับ หาก Property เป็น Object อีกชั้น ระบบจะเปรียบเทียบ Reference ของ Object ชั้นนั้น

### ควรใช้ useShallow เมื่อไหร่?

| รูปแบบ Selector | คำแนะนำ |
| --- | --- |
| `state.count` | ใช้ Selector ธรรมดา |
| `state.label` | ใช้ Selector ธรรมดา |
| `({ count: state.count, label: state.label })` | ใช้ `useShallow` |
| `state.employees` | ใช้ Selector ธรรมดา |
| `state.employees.filter(...)` | พิจารณาใช้ `useShallow` เพราะได้ Array ใหม่ |

> [!WARNING]
> ใน Zustand v5 การคืน Object หรือ Array ใหม่จาก Selector ทุกครั้งโดยไม่รักษา Reference อาจทำให้เกิด Infinite Render Loop ได้

> [!TIP]
> หากเลือกค่าเดียว เช่น `state.count` ไม่จำเป็นต้องใช้ `useShallow` แต่ถ้า Selector สร้าง Object หรือ Array ใหม่ ให้พิจารณาใช้ `useShallow`

## 6. Workshop Challenge

ฝึกสังเกตพฤติกรรม Re-render ก่อนเพิ่ม Logic ที่ซับซ้อนขึ้น

### ภารกิจที่ต้องทำ

**ความคืบหน้า: 5/5**

- [x] เพิ่ม `label` และ `setLabel` ใน Store เดิม
- [x] สร้าง `CounterWhole.tsx` ที่ Subscribe ทั้ง Store
- [x] เพิ่ม `console.log()` ใน `CounterDisplay.tsx`
- [x] สร้าง `LabelButtons.tsx` และทดลองเปลี่ยน `label`
- [x] สร้าง `LabelDisplay.tsx` ด้วยตัวเอง

### Challenge พิเศษ: LabelDisplay

สร้าง Component ที่มีคุณสมบัติดังนี้:

- Subscribe เฉพาะ `label`
- แสดงค่า `label` เป็นข้อความ
- มี `console.log("LabelDisplay Render")`
- เมื่อเปลี่ยนเฉพาะ `count` ไม่ควร Re-render จาก Zustand Subscription

<details>
<summary><strong>เปิดคำใบ้</strong></summary>

เลือก `label` ด้วย Selector โดยตรง:

```tsx
const label = useCounterStore((state) => state.label);
```

นำค่าไปแสดงและเพิ่ม Log ภายใน Component:

```tsx
const LabelDisplay = () => {
  const label = useCounterStore((state) => state.label);

  console.log("LabelDisplay Render");

  return <h2>Label: {label}</h2>;
};
```

</details>

## 7. คำถามทบทวน

### 1. หาก CounterDisplay เลือก `state.count` และเราเปลี่ยนเฉพาะ `label` จะเกิดอะไรขึ้น?

- A. CounterDisplay ต้อง Re-render เสมอ
- B. CounterDisplay ไม่จำเป็นต้อง Re-render เพราะ `count` ไม่เปลี่ยน
- C. Zustand จะ Reset `count`

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: B** — ผลลัพธ์ของ Selector ยังคงเป็น `count` ค่าเดิม จึงไม่มีการแจ้งการเปลี่ยนแปลงจาก Subscription นี้

</details>

### 2. `useCounterStore()` โดยไม่ส่ง Selector หมายความว่าอะไร?

- A. Subscribe ทั้ง Store
- B. Subscribe เฉพาะ Action
- C. ไม่ Subscribe ข้อมูลใดเลย

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — Component จะได้รับ State Object ทั้งหมดและตอบสนองต่อการเปลี่ยนแปลงของ Store

</details>

### 3. เหตุใดเราจึงควรใช้ Selector?

- A. ทำให้ State เป็น Global
- B. เลือกข้อมูลที่ Component ต้องการและลด Re-render ที่ไม่จำเป็น
- C. ทำให้ไม่ต้องกำหนด TypeScript Interface

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: B** — Selector ทำให้ Subscription สอดคล้องกับข้อมูลที่ Component ใช้งานจริง

</details>

## สิ่งที่ต้องส่งก่อนขึ้น Workshop 04

1. `useCounterStore.ts` — เพิ่ม `label` และ `setLabel`
2. `CounterWhole.tsx` — Component ที่ Subscribe ทั้ง Store
3. `CounterDisplay.tsx` — Component ที่เลือกเฉพาะ `count`
4. `LabelButtons.tsx` — ปุ่มสำหรับเปลี่ยน `label`
5. `LabelDisplay.tsx` — Component ที่เลือกเฉพาะ `label`

สิ่งที่จะตรวจ:

- การเลือก State ด้วย Selector
- ความแตกต่างระหว่าง Whole-store subscription กับ Selector
- พฤติกรรม Re-render เมื่อ `count` หรือ `label` เปลี่ยน
- ความเข้าใจเรื่อง Object Reference และ `useShallow`

---

<div align="center">

  **ถัดไป:** Workshop 04 — Objects & Arrays

  [← Workshop 02](../workshop02-action_parameters/README.md) · [กลับสู่หน้าหลัก](../../../README.md)

</div>
