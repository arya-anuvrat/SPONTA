# Firebase Email/Password Authentication Setup

## ✅ Backend Implementation Complete

The backend now supports email/password authentication:
- `POST /api/auth/signup-email` - Create user account with email
- `POST /api/auth/signin` - Sign in (works with email/password tokens)

---

## 🔥 Firebase Console Setup Steps

### Step 1: Enable Email/Password Authentication

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **Sponta**

2. **Navigate to Authentication**
   - Click **"Authentication"** in the left sidebar
   - Click **"Get started"** if you haven't set up Authentication yet

3. **Enable Email/Password Provider**
   - Click on the **"Sign-in method"** tab
   - Find **"Email/Password"** in the list
   - Click on it
   - Toggle **"Enable"** to ON
   - **Enable "Email link (passwordless sign-in)"** if you want (optional)
   - Click **"Save"**

### Step 2: Configure Email Templates (Optional but Recommended)

1. **Go to Authentication → Templates**
   - Click **"Templates"** tab
   - Customize email verification and password reset emails
   - Add your app name and branding

### Step 3: Configure Authorized Domains (if needed)

1. **Go to Authentication → Settings**
   - Click **"Settings"** tab
   - Scroll to **"Authorized domains"**
   - Add your domain if using web app
   - Localhost is already authorized for development

### Step 4: Test Email/Password Authentication

**Option A: Using Firebase Console**
1. Go to **Authentication → Users**
2. Click **"Add user"**
3. Enter email and password
4. User will be created

**Option B: Using Client SDK (Recommended)**
```javascript
// Frontend code example
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// Sign up
const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Get ID token
    const idToken = await user.getIdToken();
    // Send to backend
    await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
  }
};

// Sign in
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Get ID token
    const idToken = await user.getIdToken();
    // Send to backend
    await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
  }
};
```

---

## 📝 How It Works

### Sign Up Flow:
1. **Client**: User enters email and password
2. **Client**: Calls `createUserWithEmailAndPassword(auth, email, password)` (Firebase client SDK)
3. **Client**: Gets Firebase ID token
4. **Client**: Sends token to backend `POST /api/auth/signin` with `Authorization: Bearer <token>`
5. **Backend**: Verifies token, creates/updates user in Firestore

### Alternative: Backend Creates Account
1. **Client**: Calls `POST /api/auth/signup-email` with email, displayName, dateOfBirth
2. **Backend**: Creates user account in Firebase Auth (without password)
3. **Client**: Sets password using `createUserWithEmailAndPassword` or `updatePassword`

### Sign In Flow:
1. **Client**: User enters email and password
2. **Client**: Calls `signInWithEmailAndPassword(auth, email, password)` (Firebase client SDK)
3. **Client**: Gets Firebase ID token
4. **Client**: Sends token to backend `POST /api/auth/signin` with `Authorization: Bearer <token>`
5. **Backend**: Verifies token, returns user data from Firestore

---

## 🔐 Security Notes

1. **Passwords are NEVER sent to backend** - Firebase handles password hashing
2. **Backend only receives and verifies ID tokens** - No password storage
3. **Email verification** - Can be enabled in Firebase Console
4. **Password reset** - Handled by Firebase (sendPasswordResetEmail)

---

## ✅ Verification Checklist

- [ ] Email/Password provider enabled in Firebase Console
- [ ] Test user created successfully
- [ ] Can sign in with email/password
- [ ] ID token received from client
- [ ] Backend verifies token correctly
- [ ] User document created in Firestore

---

## 🐛 Troubleshooting

**Error: "Email already exists"**
- User already registered with that email
- Use sign-in instead of sign-up

**Error: "Invalid email"**
- Check email format
- Ensure email validation in frontend

**Error: "Weak password"**
- Firebase requires minimum 6 characters
- Can configure password requirements in Firebase Console

**Error: "User not found"**
- User doesn't exist in Firebase Auth
- Sign up first

---

## 📚 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Email/Password Auth Guide](https://firebase.google.com/docs/auth/web/password-auth)
- [Firebase Admin SDK Auth](https://firebase.google.com/docs/auth/admin)

