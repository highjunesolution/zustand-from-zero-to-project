<div align="center">

  # Workshop 02: Actions with Parameters

  เรียนรู้การส่งข้อมูลจาก React Component ไปยัง Zustand Action  
  พร้อมกำหนดชนิดข้อมูลอย่างปลอดภัยด้วย TypeScript

  ![Level](https://img.shields.io/badge/Level-Beginner%20→%20Intermediate-F59E0B)
  ![Zustand](https://img.shields.io/badge/Zustand-Actions-433E38)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Parameters-3178C6?logo=typescript&logoColor=white)

  [← Workshop 01](../workshop01-zustand_fundamentals/README.md) · [หน้าหลัก](../../../README.md) · [Zustand Docs](https://zustand.docs.pmnd.rs/)

</div>

---

## เกี่ยวกับ Workshop

ใน Workshop 01 เราได้เรียนรู้การสร้าง **Store**, **State**, **Action** และการใช้ `set()` เพื่อเปลี่ยน State แล้ว

Workshop นี้จะต่อยอดจาก Counter Store เดิม โดยเน้นการส่ง **Parameter** จาก React Component ไปยัง Zustand Action เพื่อให้ Action รับข้อมูลและนำไปประมวลผลได้อย่างยืดหยุ่น

## เป้าหมายการเรียนรู้

เมื่อจบ Workshop นี้ คุณจะสามารถ:

- อธิบายความแตกต่างระหว่าง Action ปกติกับ Action ที่รับ Parameter ได้
- กำหนด Type ของ Action Parameter ด้วย TypeScript ได้
- ส่งค่าจาก React Component ไปยัง Zustand Store ได้
- อธิบายการทำงานของ `onClick={() => action(value)}` ได้
- ออกแบบ Action ที่รับข้อมูลจากผู้ใช้และจัดการ Business Logic ได้

## สารบัญ

1. [ทำความเข้าใจ Action ที่รับ Parameter](#1-ทำความเข้าใจ-action-ที่รับ-parameter)
2. [เพิ่ม Action ใน Store](#2-เพิ่ม-action-ใน-store)
3. [ส่ง Parameter จาก React Component](#3-ส่ง-parameter-จาก-react-component)
4. [ทำความเข้าใจ Data Flow](#4-ทำความเข้าใจ-data-flow)
5. [Workshop Challenge](#5-workshop-challenge)
6. [คำถามทบทวน](#6-คำถามทบทวน)

---

## 1. ทำความเข้าใจ Action ที่รับ Parameter

ใน Workshop 01 เรามี Action แบบไม่รับ Parameter:

```ts
increase: () => void;
```

เมื่อเรียก `increase()` ค่า `count` จะเพิ่มทีละ `1` เสมอ แต่ถ้าต้องการเพิ่มครั้งละ `5`, `10` หรือจำนวนอื่น การสร้าง Action แยกสำหรับทุกค่าจะทำให้โค้ดซ้ำและขยายต่อได้ยาก:

```ts
increaseOne: () => void;
increaseFive: () => void;
increaseTen: () => void;
```

เราสามารถแก้ปัญหาด้วย Action เดียวที่รับ Parameter:

```ts
increaseBy: (amount: number) => void;
```

| ส่วนประกอบ | ความหมาย |
| --- | --- |
| `increaseBy` | ชื่อ Action |
| `amount` | Parameter ที่รับเข้ามา |
| `number` | ชนิดข้อมูลของ Parameter |
| `void` | ฟังก์ชันไม่มีค่าที่ต้องส่งกลับไปใช้งานต่อ |

Action เดียวจึงรองรับค่าที่แตกต่างกันได้:

```ts
increaseBy(5);  // เพิ่ม 5
increaseBy(10); // เพิ่ม 10
increaseBy(20); // เพิ่ม 20
```

### TypeScript ช่วยตรวจสอบอะไร?

```ts
increaseBy("5"); // ❌ Type Error: string ไม่ใช่ number
increaseBy(5);   // ✅ ถูกต้อง
```

> [!NOTE]
> TypeScript ตรวจสอบ **ชนิดข้อมูล** ไม่ได้ตรวจสอบ **กฎทางธุรกิจ** เช่น `increaseBy(-5)` ยังถูกต้องตาม Type เพราะ `-5` เป็น `number` หากไม่ต้องการค่าติดลบ เราต้องเขียน Validation เพิ่มเอง

## 2. เพิ่ม Action ใน Store

เปิดไฟล์ `src/stores/useCounterStore.ts` แล้วเพิ่ม Action ใหม่ใน Interface:

```ts
interface CounterStore {
  count: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;

  // Action ที่รับ Parameter
  increaseBy: (amount: number) => void;
}
```

จากนั้นเพิ่ม Implementation ภายใน `create`:

```ts
increaseBy: (amount) => {
  set((state) => ({
    count: state.count + amount,
  }));
},
```

### ทำไมไม่ต้องเขียน `(amount: number)` ซ้ำ?

เพราะ `create<CounterStore>()` ทำให้ TypeScript อนุมาน Type ของ `amount` จาก Interface ได้:

```ts
// TypeScript รู้ว่า amount เป็น number จาก CounterStore
increaseBy: (amount) => {
  set((state) => ({ count: state.count + amount }));
},
```

หากต้องการระบุ Type ให้เห็นชัดเจนก็สามารถเขียนได้เช่นกัน:

```ts
increaseBy: (amount: number) => {
  set((state) => ({ count: state.count + amount }));
},
```

ทั้งสองรูปแบบทำงานเหมือนกัน

### การเปลี่ยนแปลงของ State

```text
Current State        Action           Next State
  count: 10     ── increaseBy(5) ──▶   count: 15
  count: 15     ── increaseBy(10) ─▶   count: 25
```

หัวใจสำคัญอยู่ที่การนำ State ปัจจุบันมาคำนวณร่วมกับ Parameter:

```ts
set((state) => ({ count: state.count + amount }));
```

## 3. ส่ง Parameter จาก React Component

เมื่อ Store มี Action `increaseBy` แล้ว ให้เปิดไฟล์ `src/components/CounterButtons.tsx`

### เลือก Action ด้วย Selector

```tsx
const increaseBy = useCounterStore((state) => state.increaseBy);
```

### เรียก Action เมื่อผู้ใช้คลิก

```tsx
<button onClick={() => increaseBy(5)}>
  Increase +5
</button>
```

### ทำไมต้องใช้ `() => increaseBy(5)`?

ลองเปรียบเทียบทั้งสามรูปแบบ:

```tsx
// ✅ ส่ง Function Reference ให้ React
<button onClick={increase}>Increase +1</button>

// ✅ สร้าง Event Handler ที่เรียก Action พร้อม Argument
<button onClick={() => increaseBy(5)}>Increase +5</button>

// ❌ เรียก Action ทันทีระหว่าง Render
<button onClick={increaseBy(5)}>Increase +5</button>
```

| รูปแบบ | สิ่งที่เกิดขึ้น |
| --- | --- |
| `onClick={increase}` | React ได้รับ Function Reference และเรียกเมื่อคลิก |
| `onClick={() => increaseBy(5)}` | React ได้รับ Arrow Function และเรียก `increaseBy(5)` เมื่อคลิก |
| `onClick={increaseBy(5)}` | JavaScript เรียก Action ทันทีระหว่าง Render |

> [!WARNING]
> การเรียก State Action ระหว่าง Render อาจทำให้ State อัปเดตซ้ำและเกิด Render Loop ได้ หลักการนี้เป็นเรื่องของ React Event Handler ไม่ได้เกิดขึ้นเฉพาะกับ Zustand

## 4. ทำความเข้าใจ Data Flow

สมมติว่า `count` เริ่มต้นเป็น `10` และผู้ใช้คลิกปุ่ม **Increase +5**:

```text
┌──────────────────────────────┐
│  1. React Component         │
│  ผู้ใช้คลิก Increase +5      │
└──────────────┬───────────────┘
               │ เรียก increaseBy(5)
               ▼
┌──────────────────────────────┐
│  2. Zustand Action          │
│  รับ amount = 5             │
└──────────────┬───────────────┘
               │ เรียก set()
               ▼
┌──────────────────────────────┐
│  3. Store คำนวณค่าใหม่      │
│  count: 10 + amount: 5      │
└──────────────┬───────────────┘
               │ State ใหม่คือ 15
               ▼
┌──────────────────────────────┐
│  4. CounterDisplay          │
│  แสดงผล Count: 15           │
└──────────────────────────────┘
```

Component ไม่จำเป็นต้องรู้ว่า Store คำนวณ `count` อย่างไร:

- **Component** มีหน้าที่รับ Interaction และเรียก Action
- **Store** มีหน้าที่จัดการ State และ Business Logic

แนวทางนี้นำไปใช้กับระบบจริงได้ เช่น เพิ่มสินค้าลงตะกร้า อัปเดตข้อมูลพนักงาน หรือจัดการข้อมูลผู้ใช้

## 5. Workshop Challenge

ต่อยอดจาก Counter Store เดิมด้วย Actions ที่รับ Parameter

### Challenge A — เพิ่ม decreaseBy

สร้าง Action ที่ลด `count` ตาม Parameter ที่รับเข้ามา:

```ts
decreaseBy(5);  // ลดลง 5
decreaseBy(10); // ลดลง 10
```

- [ ] เพิ่ม Type ของ `decreaseBy` ใน Interface
- [ ] เพิ่ม Implementation ใน Store
- [ ] ทดสอบด้วยค่าที่แตกต่างกัน

<details>
<summary><strong>เปิดคำใบ้ Challenge A</strong></summary>

```ts
decreaseBy: (amount: number) => void;
```

ภายใน Action ให้นำ `amount` ไปลบออกจาก `state.count`

```ts
decreaseBy: (amount) => {
  set((state) => ({ count: state.count - amount }));
},
```

</details>

### Challenge B — เพิ่ม setCount

สร้าง Action ที่กำหนด `count` เป็นค่าที่ต้องการได้ทันที:

```ts
setCount(100); // count = 100
setCount(50);  // count = 50
setCount(0);   // count = 0
```

- [ ] เพิ่ม Type ของ `setCount` ใน Interface
- [ ] เพิ่ม Implementation ใน Store
- [ ] สังเกตว่า Action นี้ไม่ต้องอ่าน State ปัจจุบัน

<details>
<summary><strong>เปิดคำใบ้ Challenge B</strong></summary>

```ts
setCount: (value: number) => void;
```

เมื่อไม่ต้องคำนวณจาก State ปัจจุบัน สามารถส่ง Object ให้ `set()` ได้โดยตรง:

```ts
setCount: (value) => {
  set({ count: value });
},
```

</details>

### Challenge C — นำไปใช้กับ Component

เพิ่มปุ่มต่อไปนี้ใน `CounterButtons.tsx`:

```text
┌─────────────┐  ┌─────────────┐  ┌─────────┐  ┌───────┐
│ Increase +5 │  │ Decrease -5 │  │ Set 100 │  │ Reset │
└─────────────┘  └─────────────┘  └─────────┘  └───────┘
```

- [ ] เลือก Actions ใหม่ด้วย Selector
- [ ] เรียกแต่ละ Action พร้อม Argument ใน `onClick`
- [ ] ตรวจสอบว่าปุ่มทั้งหมดเปลี่ยนค่าบน `CounterDisplay` ถูกต้อง

<details>
<summary><strong>เปิดคำใบ้ Challenge C</strong></summary>

```tsx
const increaseBy = useCounterStore((state) => state.increaseBy);
const decreaseBy = useCounterStore((state) => state.decreaseBy);
const setCount = useCounterStore((state) => state.setCount);

<button onClick={() => increaseBy(5)}>Increase +5</button>
<button onClick={() => decreaseBy(5)}>Decrease -5</button>
<button onClick={() => setCount(100)}>Set 100</button>
```

</details>

> [!TIP]
> Challenge นี้ยังไม่จำเป็นต้องเพิ่ม `useState` ใน Component เพราะข้อมูล `count` ทั้งหมดจัดการผ่าน Zustand Store

## 6. คำถามทบทวน

### 1. ทำไม `increaseBy` จึงต้องกำหนด `amount` เป็น `number`?

- A. เพื่อให้ TypeScript ตรวจสอบชนิดข้อมูลที่ส่งเข้า Action
- B. เพื่อให้ Zustand เปลี่ยนข้อมูลเป็น `number` อัตโนมัติ
- C. เพื่อบังคับให้ `count` มีค่าเป็นบวกเท่านั้น

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — TypeScript ใช้ Type Annotation เพื่อตรวจสอบว่าค่าที่ส่งเข้ามาเป็นตัวเลข แต่ไม่ได้รับประกันว่าตัวเลขนั้นจะเป็นค่าบวก

</details>

### 2. `onClick={() => increaseBy(5)}` มีประโยชน์อะไร?

- A. ทำให้ฟังก์ชันทำงานทุกครั้งที่ Render
- B. สร้าง Event Handler ที่เรียก Action พร้อม Argument เมื่อคลิก
- C. ทำให้ Store เก็บ Parameter ไว้ตลอดเวลา

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: B** — Arrow Function ทำหน้าที่เป็น Event Handler ซึ่งจะเรียก `increaseBy(5)` เมื่อเกิด Click Event

</details>

### 3. หากต้องการกำหนด `count` เป็น `100` โดยตรง ควรใช้แบบใด?

- A. `set({ count: 100 })`
- B. `set((state) => ({ count: state.count + 100 }))`
- C. `state.count = 100`

<details>
<summary><strong>ดูคำตอบ</strong></summary>

**คำตอบ: A** — ค่าที่ต้องการไม่ขึ้นกับ State ปัจจุบัน จึงกำหนดผ่าน `set({ count: 100 })` ได้โดยตรง

</details>

## สิ่งที่ต้องส่งก่อนขึ้น Workshop 03

1. `useCounterStore.ts` — เพิ่ม `increaseBy`, `decreaseBy` และ `setCount`
2. `CounterButtons.tsx` — เพิ่มปุ่มสำหรับเรียก Actions พร้อม Parameters

สิ่งที่จะตรวจ:

- การกำหนด Type ของ Parameters
- การใช้ `set()` ตามลักษณะการอัปเดต State
- การส่ง Arguments ผ่าน Event Handler
- ความเข้าใจเรื่อง Data Flow

---

<div align="center">

  **ถัดไป:** Workshop 03 — Selectors & Re-render

  [← Workshop 01](../workshop01-zustand_fundamentals/README.md) · [กลับสู่หน้าหลัก](../../../README.md)

</div>
