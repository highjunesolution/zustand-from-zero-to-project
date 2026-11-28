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

const demoAdmin: AuthUser = {
  id: "admin001",
  displayName: "Admin User",
  email: "admin@example.com",
  role: "ADMIN",
};

const demoAccounts = [
  { user: demoUser, password: "workshop123" },
  { user: demoAdmin, password: "workshop123" },
];

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
  const account = demoAccounts.find((item) => {
    return item.user.email === email && item.password === password;
  });

  if (!account) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  //   3. สร้าง Session ID ใหม่
  req.session.regenerate((err) => {
    if (err) return next(err);

    // 4. เก็บข้อมูล User ฝั่ง Backend
    req.session.user = account.user;

    // 5. บันทึก Session
    req.session.save((saveErr) => {
      if (saveErr) return next(saveErr);

      // 6. ส่งเฉพาะ User กลับ Frontend
      return res.status(200).json({
        user: account.user,
      });
    });
  });
});

app.get("/api/auth/me", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  const { user } = req.session;

  if (!user) {
    return res.status(401).json({
      message: "Unauthenticated",
    });
  }

  return res.status(200).json({
    user,
  });
});

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

app.listen(PORT, "127.0.0.1", () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
