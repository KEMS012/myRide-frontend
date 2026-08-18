import { db } from "../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

export const col = (name) => collection(db, name);
export const docRef = (name, id) => doc(db, name, id);
export { getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, onSnapshot };

export function onUsersSnapshot(listener) {
  const q = query(col("users"), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onUsersSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export function onRidesSnapshot(listener) {
  const q = query(col("rides"), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onRidesSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export function onRidesForUserSnapshot(uid, listener) {
  const q = query(col("rides"), where("userId", "==", uid), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onRidesForUserSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export function onRidesForDriverSnapshot(uid, listener) {
  const q = query(col("rides"), where("driverId", "==", uid), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onRidesForDriverSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export function onPartnersSnapshot(listener) {
  const q = query(col("partners"), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onPartnersSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export function onAvailableRidesSnapshot(listener) {
  const q = query(col("rides"), where("status", "==", "requested"), orderBy("createdAt", "asc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onAvailableRidesSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export function onProgramsSnapshot(listener) {
  const q = query(col("programs"), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onProgramsSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export async function getUser(uid) {
  const snap = await getDoc(docRef("users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUser(uid, data) {
  await updateDoc(docRef("users", uid), data);
}

export async function createRide({ userId, from, to, type, scheduledAt, riderName, rideFare }) {
  const rideRef = doc(col("rides"));
  const data = {
    userId,
    riderName: riderName || null,
    rider: riderName || null,
    from,
    to,
    route: `${from} → ${to}`,
    type,
    fare: rideFare || "₦1,200",
    rideFare: rideFare || "₦1,200",
    status: "requested",
    scheduledAt: scheduledAt || null,
    createdAt: serverTimestamp(),
  };
  await setDoc(rideRef, data);
  return { id: rideRef.id, ...data };
}

export async function getRidesForUser(uid) {
  const q = query(col("rides"), where("userId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getRidesForDriver(uid) {
  const q = query(col("rides"), where("driverId", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAvailableRides() {
  const q = query(col("rides"), where("status", "==", "requested"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateRideStatus(rideId, status, extraData = {}) {
  await updateDoc(docRef("rides", rideId), {
    status,
    updatedAt: serverTimestamp(),
    ...extraData,
  });
}

export async function acceptRide(rideId, driverId, driverName) {
  await updateRideStatus(rideId, "accepted", {
    driverId,
    driverName: driverName || null,
    acceptedAt: serverTimestamp(),
  });
}

export async function rejectRide(rideId, reason = "rejected") {
  await updateRideStatus(rideId, "rejected", {
    rejectedAt: serverTimestamp(),
    rejectionReason: reason,
  });
}

export async function completeRide(rideId) {
  const rideSnap = await getDoc(docRef("rides", rideId));
  if (rideSnap.exists()) {
    const ride = rideSnap.data();
    await updateRideStatus(rideId, "completed", { completedAt: serverTimestamp() });
    await createReward({ userId: ride.userId, points: 100, ridesCount: 1 });
  }
}

export async function createSchedule({ userId, from, to, datetime, type }) {
  const ref = doc(col("schedules"));
  await setDoc(ref, {
    userId,
    from,
    to,
    datetime,
    type,
    status: "scheduled",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getSchedulesForUser(uid) {
  try {
    const q = query(col("schedules"), where("userId", "==", uid), orderBy("datetime", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getSchedulesForUser error:", err);
    if (err?.message?.toLowerCase().includes("index")) {
      return [];
    }
    throw err;
  }
}

export async function getActiveSchedules() {
  try {
    const q = query(col("schedules"), where("status", "==", "scheduled"), orderBy("datetime", "asc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("getActiveSchedules error:", err);
    if (err?.message?.toLowerCase().includes("index")) {
      return [];
    }
    throw err;
  }
}

export async function createFixedRide({ userId, driverId, plan, schedule }) {
  const ref = doc(col("fixedRides"));
  await setDoc(ref, {
    userId,
    driverId,
    plan,
    schedule,
    status: "active",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getFixedRidesForUser(uid) {
  const q = query(col("fixedRides"), where("userId", "==", uid), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDrivers() {
  const q = query(col("users"), where("role", "==", "driver"), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createPartner(data) {
  const ref = doc(col("partners"));
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getPartners() {
  const snap = await getDocs(col("partners"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createProgram(data) {
  const ref = doc(col("programs"));
  await setDoc(ref, data);
  return ref.id;
}

export async function getPrograms() {
  const snap = await getDocs(col("programs"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateProgramStatus(programId, status) {
  await updateDoc(docRef("programs", programId), { status });
}

export async function createReward({ userId, points = 0, ridesCount = 0 }) {
  const ref = doc(col("rewards"), userId);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data() : { points: 0, ridesCount: 0, tier: "Bronze" };
  const newPoints = existing.points + points;
  const newRides = existing.ridesCount + ridesCount;
  const newTier = newRides >= 50 ? "Gold" : newRides >= 20 ? "Silver" : "Bronze";
  await setDoc(ref, { userId, points: newPoints, ridesCount: newRides, tier: newTier }, { merge: true });
  return { points: newPoints, ridesCount: newRides, tier: newTier };
}

export async function getUsers() {
  const snap = await getDocs(col("users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getReward(uid) {
  const snap = await getDoc(docRef("rewards", uid));
  return snap.exists() ? snap.data() : null;
}

export async function getRides() {
  const snap = await getDocs(col("rides"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function seedInitialData() {
  const partners = [
    { name: "LAUTECH", type: "School", area: "LAUTECH", riders: 880, rides: 3100, contact: "Dean of Students", status: "Active" },
    { name: "Baptist High School", type: "School", area: "Takie", riders: 410, rides: 1420, contact: "Mr. K. Adeyemi", status: "Active" },
    { name: "CAC Takie", type: "Church", area: "Takie", riders: 320, rides: 1120, contact: "Pastor D. Oladele", status: "Active" },
    { name: "Winners Chapel, Owode", type: "Church", area: "Owode", riders: 260, rides: 860, contact: "Pastor M. Thomas", status: "Active" },
  ];
  for (const p of partners) {
    const ref = doc(col("partners"));
    await setDoc(ref, { id: ref.id, ...p, createdAt: serverTimestamp() });
  }
}

export function onNotificationsSnapshot(uid, listener) {
  const q = query(col("notifications"), where("recipientId", "==", uid), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, (snap) => {
    listener(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (err) => {
    console.error("onNotificationsSnapshot error:", err);
    listener([]);
  });
  return unsub;
}

export async function createNotification(data) {
  const ref = doc(col("notifications"));
  await setDoc(ref, { ...data, createdAt: serverTimestamp(), read: false });
  return ref.id;
}

export async function markNotificationRead(notificationId) {
  await updateDoc(docRef("notifications", notificationId), { read: true });
}
