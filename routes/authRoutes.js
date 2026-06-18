const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  verifyResetToken,
} = require("../controllers/authController");

// OTP — Registration verification
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Forgot / Reset Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token", verifyResetToken);

// Browser se aane wala reset link — seedha reset form dikhata hai
router.get("/reset-redirect", (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid reset link");

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ServEase — Reset Password</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #FFF8EF; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .card { background: white; border-radius: 16px; padding: 40px 32px; max-width: 420px; width: 90%; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .logo { text-align: center; margin-bottom: 8px; }
        h2 { color: #E8845A; font-size: 26px; text-align: center; }
        .subtitle { color: #9A8878; font-size: 14px; text-align: center; margin: 8px 0 28px; line-height: 1.5; }
        label { display: block; font-size: 13px; font-weight: 600; color: #2D2A24; margin-bottom: 6px; }
        input { width: 100%; padding: 13px 16px; border: 1px solid #EDD9C8; border-radius: 10px; font-size: 15px; background: #FFF8EF; outline: none; margin-bottom: 18px; }
        input:focus { border-color: #E8845A; }
        .btn { width: 100%; background: #E8845A; color: white; border: none; padding: 15px; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 4px; }
        .btn:hover { background: #d4714a; }
        .btn:disabled { background: #ccc; cursor: not-allowed; }
        .msg { text-align: center; margin-top: 16px; font-size: 14px; padding: 10px; border-radius: 8px; display: none; }
        .msg.success { background: #e6f9f0; color: #1a7a4a; display: block; }
        .msg.error { background: #fdecea; color: #c0392b; display: block; }
        .eye-wrap { position: relative; }
        .eye-wrap input { padding-right: 44px; margin-bottom: 0; }
        .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 18px; color: #9A8878; }
        .field-gap { margin-bottom: 18px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="#FFF2E6"/>
            <path d="M24 12C17.4 12 12 17.4 12 24s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 4a4 4 0 110 8 4 4 0 010-8zm0 17c-4 0-7.5-2-9.5-5 .05-3.2 6.3-5 9.5-5s9.45 1.8 9.5 5c-2 3-5.5 5-9.5 5z" fill="#E8845A"/>
          </svg>
        </div>
        <h2>Reset Password</h2>
        <p class="subtitle">Enter your new password below</p>

        <div class="field-gap">
          <label>New Password</label>
          <div class="eye-wrap">
            <input type="password" id="newPass" placeholder="Min 6 characters" />
            <button class="eye-btn" onclick="toggle('newPass', this)">👁</button>
          </div>
        </div>

        <div class="field-gap" style="margin-bottom:24px;">
          <label>Confirm Password</label>
          <div class="eye-wrap">
            <input type="password" id="confirmPass" placeholder="Re-enter password" />
            <button class="eye-btn" onclick="toggle('confirmPass', this)">👁</button>
          </div>
        </div>

        <button class="btn" id="submitBtn" onclick="resetPassword()">Reset Password</button>
        <div class="msg" id="msg"></div>
      </div>

      <script>
        const TOKEN = "${token}";

        function toggle(id, btn) {
          const input = document.getElementById(id);
          if (input.type === "password") {
            input.type = "text";
            btn.textContent = "🙈";
          } else {
            input.type = "password";
            btn.textContent = "👁";
          }
        }

        async function resetPassword() {
          const newPass = document.getElementById("newPass").value;
          const confirmPass = document.getElementById("confirmPass").value;
          const msg = document.getElementById("msg");
          const btn = document.getElementById("submitBtn");

          msg.className = "msg";
          msg.style.display = "none";

          if (!newPass || !confirmPass) {
            msg.textContent = "Please fill all fields";
            msg.className = "msg error";
            return;
          }
          if (newPass.length < 6) {
            msg.textContent = "Password must be at least 6 characters";
            msg.className = "msg error";
            return;
          }
          if (newPass !== confirmPass) {
            msg.textContent = "Passwords do not match";
            msg.className = "msg error";
            return;
          }

          btn.disabled = true;
          btn.textContent = "Resetting...";

          try {
            const res = await fetch("/api/auth/reset-password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: TOKEN, new_password: newPass })
            });
            const data = await res.json();

            if (data.success) {
              msg.textContent = "Password reset successfully! You can now login.";
              msg.className = "msg success";
              btn.textContent = "Done ✓";
              document.getElementById("newPass").value = "";
              document.getElementById("confirmPass").value = "";
            } else {
              msg.textContent = data.message || "Something went wrong";
              msg.className = "msg error";
              btn.disabled = false;
              btn.textContent = "Reset Password";
            }
          } catch (e) {
            msg.textContent = "Network error. Please try again.";
            msg.className = "msg error";
            btn.disabled = false;
            btn.textContent = "Reset Password";
          }
        }
      </script>
    </body>
    </html>
  `);
});

module.exports = router;
