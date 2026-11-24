# Ulavan Santhai (உழவன் சந்தை) - Mobile Application 🌾📱

Direct agricultural marketplace mobile application for Farmers (Sellers) and Buyers across Tamil Nadu.

This branch (`mobile-app`) was created by converting the existing **Login** and **Register** pages from the `frontend` branch into a native cross-platform mobile application powered by **React Native & Expo**, connecting directly to the API endpoints provided by the `backend` branch.

---

## 🚀 Key Features Converted

### 1. 🔑 Login Screen (`src/screens/LoginScreen.js`)
* **Dual Identifier Input:** Accepts either an Email Address or a 10-digit Mobile Number.
* **Password Visibility:** Interactive toggle for show/hide password.
* **Remember Me:** Option to persist session credentials on the device.
* **Forgot Password Dialog:** Informational recovery instructions modal.
* **Live Backend Authentication:** Posts credentials to `/api/auth/login`.
* **Instant Redirection:** Routes directly to the user role switcher / dashboard upon login.

### 2. 📝 Register Screen (`src/screens/RegisterScreen.js`)
* **Unified Registration Form:**
  * Full Name / Username
  * Valid Email Address
  * 10-digit Indian Mobile Number with `+91` badge
  * Password (minimum 8 characters) & Confirm Password validation
  * Terms of Service & Privacy Policy agreement checkbox
* **Backend Registration API:** Submits user payload to `/api/auth/register`.
* **OTP Verification Trigger:** Automatically opens the 6-digit verification modal once backend generates the email OTP.

### 3. ✉️ 6-Digit Email Verification Modal (`src/components/OtpModal.js`)
* **Auto-advance PIN Input:** 6 individual numeric boxes that automatically jump to the next box upon typing.
* **Backspace Support:** Automatically focuses back on previous box when deleting.
* **Resend Cooldown Timer:** 30-second countdown before requesting a fresh OTP.
* **Backend Email Verification:** Calls `/api/auth/email/verify` and activates the account in the database.

### 4. 🚜 Dashboard & Role Switcher (`src/screens/HomeScreen.js`)
* User welcome profile summary (Name, Verified badge, Mobile, Email).
* Operating mode switcher:
  * **Farmer / Seller (உழவர் / விற்பனையாளர்)**
  * **Buyer / Wholesaler (வாங்குபவர்)**
* Live backend server configuration indicator with on-tap IP customization.
* Shortcut banner to access `/get-started` for role switching.
* Secure Sign-out action.

### 5. 🌾 Role Selection & Onboarding (`src/screens/GetStartedScreen.js`)
* Faithful mobile adaptation of `frontend` branch `/get-started` screen.
* Buyer and Seller dual cards with high-resolution imagery and badge indicators.
* Live status check query to `GET /api/v1/user/me`.
* Verified Plan Active pulsing status indicators.
* Direct workspace and onboarding navigation.

### 6. 🏠 Landing Experience (`src/screens/LandingScreen.js`)
* Responsive mobile landing screen with hero section, audience cards, categories, how-it-works, plans, and footer.
* Interactive drawer navbar with quick jump anchors and role access.

---

## 🛠 Backend Integration (uses `backend` branch)

The mobile app connects directly to the Node.js/Express backend API on the `backend` branch:

| Action | HTTP Method | Endpoint | Description |
|---|---|---|---|
| **Login** | `POST` | `/api/auth/login` | Authenticates user and returns JWT token & user object |
| **Register** | `POST` | `/api/auth/register` | Stages user in pending memory and dispatches 6-digit email OTP |
| **Verify OTP** | `POST` | `/api/auth/email/verify` | Verifies OTP and activates user into Supabase |
| **Resend OTP** | `POST` | `/api/auth/email/resend` | Dispatches new OTP code with 30s cooldown |

---

## ⚙️ Setting Up Your Local Backend IP

When running the mobile app on a physical Android or iPhone via Expo Go, your phone must be on the same Wi-Fi network as the laptop running the backend.

### Quick Automatic Setup:
```bash
npm run set-ip
```
This automatically scans your network adapter, finds your machine's LAN IP (e.g. `192.168.1.74`), and updates `.env` and `src/config/api.js`.

Alternatively, you can tap the **"⚙ Backend Server"** pill directly inside the mobile app to change the URL anytime without restarting the app!

---

## 📱 How to Run the Mobile App

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Expo Development Server
```bash
npx expo start
```
or
```bash
npm start
```

### 3. Open on Your Device:
* **Android (Expo Go):** Install **Expo Go** from Google Play Store, scan the QR code in your terminal.
* **Android Emulator:** Press `a` in the terminal.
* **iOS Simulator:** Press `i` in the terminal.
* **Web Browser:** Press `w` in the terminal or run `npm run web`.

---

## 📂 Project Structure

```
├── assets/                       # Brand logos, icons, and agricultural imagery
│   ├── images/                   # Preserved branding from frontend
│   │   ├── ulavan-santhai-logo.png
│   │   ├── ulavan-santhai-emblem.png
│   │   ├── login-paddy-distant-farmer.webp
│   │   └── register-paddy-harvest.webp
│   ├── icon.png
│   └── splash.png
├── src/
│   ├── components/
│   │   ├── landing/              # Modular landing page sections (Hero, About, Plans, etc.)
│   │   ├── AuthHeader.js         # Header with emblem, badge, and titles
│   │   ├── FeedbackModal.js      # Success / Error / Info popup modal
│   │   ├── OtpModal.js           # 6-digit interactive email verification modal
│   │   ├── ServerConfigModal.js  # Dynamic IP & backend configuration dialog
│   │   └── index.js              # Clean barrel exports for components
│   ├── config/
│   │   ├── api.js                # Dynamic backend base URL & endpoints
│   │   └── index.js              # Config barrel exports
│   ├── context/
│   │   └── index.js              # Application context definitions
│   ├── screens/
│   │   ├── LandingScreen.js      # Mobile agricultural marketplace landing screen
│   │   ├── GetStartedScreen.js   # Step 2 role selector (Buyer vs Seller)
│   │   ├── LoginScreen.js        # Mobile login screen
│   │   ├── RegisterScreen.js     # Mobile registration screen
│   │   ├── HomeScreen.js         # Welcome & role selection dashboard
│   │   └── index.js              # Screen barrel exports
│   ├── services/
│   │   ├── authService.js        # Backend fetch client & session handling
│   │   └── index.js              # Services barrel exports
│   └── theme/
│       ├── colors.js             # Ulavan Santhai green agricultural palette
│       └── index.js              # Theme barrel exports
├── scripts/
│   └── set-mobile-ip.js          # CLI script to detect and apply host Wi-Fi IP
├── App.js                        # App root with navigation & screen state
├── app.json                      # Expo application manifest
├── babel.config.js               # Babel configuration
└── package.json                  # React Native & Expo dependencies
```

---

## 🌿 தமிழ் குறிப்பு (Tamil Instructions)

1. **புதிய பிராஞ்ச்:** `mobile-app` பிராஞ்ச் வெற்றிகரமாக உருவாக்கப்பட்டு அதில் மொபைல் செயலி கட்டமைக்கப்பட்டுள்ளது.
2. **பக்கங்கள் மாற்றம்:** `frontend` பிராஞ்சில் இருந்த Login மற்றும் Register பக்கங்கள் React Native & Expo மொபைல் செயலிகளாக மாற்றப்பட்டுவிட்டன.
3. **OTP சரிபார்ப்பு:** மின்னஞ்சல் 6-Digit OTP Verification Model சேர்க்கப்பட்டுள்ளது.
4. **Backend இணைப்பு:** `backend` பிராஞ்சில் உள்ள `/api/auth/login`, `/api/auth/register`, `/api/auth/email/verify` ஆகிய endpoints நேரடியாக இணைக்கப்பட்டுள்ளன.
5. **செயலியை இயக்க:** `npx expo start` கட்டளையை இயக்கி Expo Go மூலமாக உங்கள் மொபைலில் நேரடியாகப் பார்க்கலாம்.
