import { createContext, useState, useEffect } from "react";
import {
  auth,
  db,
  storage,
} from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AuthContext = createContext(null);
export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    async function loadProfile(uid, retries = 3, delay = 600) {
      for (let i = 0; i < retries; i++) {
        try {
          const snap = await getDoc(doc(db, "users", uid));
          if (snap.exists()) {
            return snap.data();
          }
        } catch (err) {
          console.error("Profile load error:", err);
          if (i === retries - 1) {
            setAuthError(err?.message || "Failed to load user profile.");
            return null;
          }
        }
        await new Promise((r) => setTimeout(r, delay));
      }
      return null;
    }

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthError("");
      if (firebaseUser) {
        const data = await loadProfile(firebaseUser.uid);
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signup({ name, email, password, phone, role, ...extra }) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const profileData = {
        name,
        email,
        phone,
        role,
        status: role === "driver" ? "Pending" : "Active",
        createdAt: new Date(),
        ...extra,
      };
      await setDoc(doc(db, "users", cred.user.uid), profileData);
      try {
        await sendEmailVerification(cred.user);
      } catch (verificationErr) {
        console.warn("Verification email failed:", verificationErr);
      }
      setProfile(profileData);
      return { role, emailVerified: cred.user.emailVerified };
    } catch (err) {
      console.error("Signup error:", err);
      throw new Error(err.message || "Sign up failed. Please try again.");
    }
  }

  async function googleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const data = snap.exists()
        ? snap.data()
        : {
            name: cred.user.displayName || "Google User",
            email: cred.user.email,
            phone: cred.user.phoneNumber || "",
            role: "rider",
            status: "Active",
            createdAt: new Date(),
          };
      if (!snap.exists()) {
        await setDoc(doc(db, "users", cred.user.uid), data);
      }
      setProfile(data);
      return data.role;
    } catch (err) {
      console.error("Google sign-in error:", err);
      throw new Error(err.message || "Google sign-in failed. Please try again.");
    }
  }

  async function login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        throw new Error("Please verify your email before logging in. Check your inbox for the verification link.");
      }
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (!snap.exists()) {
        await signOut(auth);
        throw new Error("No profile found. Please sign up first.");
      }
      const data = snap.data();
      setProfile(data);
      return data.role;
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "permission-denied" || err.message?.includes("permissions")) {
        throw new Error("Database access denied. Please contact support or check Firestore rules.");
      }
      throw new Error(err.message || "Login failed. Please try again.");
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateProfile(updates) {
    if (!user) throw new Error("Not authenticated");
    const userRef = doc(db, "users", user.uid);
    const safeUpdates = { ...updates };

    if (safeUpdates.name && auth.currentUser) {
      try {
        await firebaseUpdateProfile(auth.currentUser, { displayName: safeUpdates.name });
      } catch (err) {
        console.warn("Auth display name update failed:", err);
      }
    }

    await updateDoc(userRef, safeUpdates);
    setProfile((prev) => ({ ...(prev || {}), ...safeUpdates }));
  }

  async function uploadAvatar(file) {
    if (!user) throw new Error("Not authenticated");
    const fileRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateProfile({ avatar: url });
    return url;
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, authError, signup, login, googleSignIn, logout, resetPassword, updateProfile, uploadAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}
