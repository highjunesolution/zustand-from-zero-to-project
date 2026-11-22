import "dotenv/config";
import express from "express";
import session from "express-session";
import type { AuthUser } from "./types/auth.js";
declare module "express-session" {
  interface SessionData {
    user?: AuthUser;
  }
}

const app = express();
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET is required");
}
const PORT = Number(process.env.PORT ?? 3001);

app.use(express.json());
app.use(
  session({
    name: "workshop.sid",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 60 * 1000,
    },
  }),
);

const demoUser: AuthUser = {
  id: "user001",
  displayName: "Demo User",
  email: "demo@example.com",
  role: "USER",
};

app.post("/api/auth/login", (req, res, next) => {
  const email: unknown = req.body?.email;
  const password: unknown = req.body?.password;

  // 1. ตรวจชนิดข้อมูล
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({
      message: "Email and password must be strings",
    });
  }

  //  2. ตรวจสอบบัญชี Demo
  if (email !== "demo@example.com" || password !== "workshop123") {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  //   3. สร้าง Session ID ใหม่
  req.session.regenerate((err) => {
    if (err) return next(err);

    // 4. เก็บข้อมูล User ฝั่ง Backend
    req.session.user = demoUser;

    // 5. บันทึก Session
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr);

      // 6. ส่งเฉพาะ User กลับ Frontend
      return res.status(200).json({
        user: demoUser,
      });
    });
  });
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
