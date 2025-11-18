import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

type Attributes = {
  forca: number;
  agilidade: number;
  sabedoria: number;
  carisma: number;
  intuicao: number;
};

function sumAttributes(a: Attributes): number {
  return a.forca + a.agilidade + a.sabedoria + a.carisma + a.intuicao;
}

function validAttributes(a: Attributes): boolean {
  const vals = [a.forca, a.agilidade, a.sabedoria, a.carisma, a.intuicao];
  return vals.every(v => Number.isInteger(v) && v >= -1 && v <= 3) && sumAttributes(a) === 3;
}

async function assertOwner(campaignId: string, uid: string) {
  const c = await db.collection("campaigns").doc(campaignId).get();
  if (!c.exists) throw new HttpsError("not-found", "Campaign not found");
  const data = c.data() as any;
  if (data.ownerId !== uid) throw new HttpsError("permission-denied", "Only owner allowed");
  return data;
}

async function assertPlayer(campaignId: string, uid: string) {
  const c = await db.collection("campaigns").doc(campaignId).get();
  if (!c.exists) throw new HttpsError("not-found", "Campaign not found");
  const data = c.data() as any;
  if (!data.players || !(uid in data.players)) throw new HttpsError("permission-denied", "Not a campaign player");
  return data;
}

function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const generateInvite = onCall({ region: "us-central1" }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Auth required");
  const { campaignId, options } = req.data as { campaignId: string; options?: { expiresAt?: number; usesLimit?: number } };
  if (!campaignId) throw new HttpsError("invalid-argument", "campaignId required");
  await assertOwner(campaignId, uid);
  const token = uuidv4();
  const inviteDoc = {
    campaignId,
    createdBy: uid,
    createdAt: Date.now(),
    expiresAt: options?.expiresAt ?? null,
    usesLimit: options?.usesLimit ?? null,
    usedBy: {},
  } as any;
  await db.collection("invites").doc(token).set(inviteDoc);
  return { token, inviteId: token, urlPath: `/invite/${token}` };
});

export const validateInvite = onCall({ region: "us-central1" }, async (req) => {
  const uid = req.auth?.uid;
  const name = (req.auth?.token as any)?.name || uid;
  if (!uid) throw new HttpsError("unauthenticated", "Auth required");
  const { token } = req.data as { token: string };
  if (!token) throw new HttpsError("invalid-argument", "token required");

  const ref = db.collection("invites").doc(token);
  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError("not-found", "invalid");
    const inv = snap.data() as any;
    if (inv.expiresAt && Date.now() > inv.expiresAt) throw new HttpsError("failed-precondition", "expired");
    const usedCount = inv.usedBy ? Object.keys(inv.usedBy).length : 0;
    if (inv.usesLimit && usedCount >= inv.usesLimit) throw new HttpsError("failed-precondition", "limit_reached");

    const campaignId = inv.campaignId as string;
    const campRef = db.collection("campaigns").doc(campaignId);
    const camp = await tx.get(campRef);
    if (!camp.exists) throw new HttpsError("not-found", "Campaign not found");
    const campData = camp.data() as any;
    // mark usedBy and add player atomically
    const now = Date.now();
    const newUsedBy = { ...(inv.usedBy || {}), [uid]: { joinedAt: now } };
    const players = { ...(campData.players || {}), [uid]: { userId: uid, displayName: name, status: "accepted", joinedAt: now } };
    tx.update(ref, { usedBy: newUsedBy });
    tx.update(campRef, { players });
    return { success: true, campaignId };
  });
});

export const createCharacter = onCall({ region: "us-central1" }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Auth required");
  const { campaignId, data } = req.data as { campaignId: string; data: any };
  if (!campaignId || !data) throw new HttpsError("invalid-argument", "campaignId and data required");
  const type = data.type as "player" | "npc";
  if (type !== "player" && type !== "npc") throw new HttpsError("invalid-argument", "invalid type");
  const attrs = data.attributes as Attributes;
  if (!validAttributes(attrs)) throw new HttpsError("invalid-argument", "invalid attributes");

  if (type === "player") {
    await assertPlayer(campaignId, uid);
    const id = `${campaignId}_${uid}`;
    const ref = db.collection("characters").doc(id);
    const exists = await ref.get();
    if (exists.exists) throw new HttpsError("already-exists", "one character per player per campaign");
    const now = Date.now();
    const doc = {
      id,
      campaignId,
      userId: uid,
      name: data.name || "",
      background: data.background || "",
      attributes: attrs,
      equipment: data.equipment || "",
      notes: data.notes || "",
      moves: Array.isArray(data.moves) ? data.moves : [],
      type: "player",
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(doc);
    return { id };
  } else {
    await assertOwner(campaignId, uid);
    const now = Date.now();
    const ref = db.collection("characters").doc();
    const doc = {
      id: ref.id,
      campaignId,
      userId: null,
      name: data.name || "",
      background: data.background || "",
      attributes: attrs,
      equipment: data.equipment || "",
      notes: data.notes || "",
      moves: Array.isArray(data.moves) ? data.moves : [],
      type: "npc",
      createdAt: now,
      updatedAt: now,
    };
    await ref.set(doc);
    return { id: ref.id };
  }
});

function rollD6(): number { return Math.floor(Math.random() * 6) + 1; }

function pickUsedDice(all: number[], mode: "normal" | "advantage" | "disadvantage"): number[] {
  if (mode === "normal") return all.slice(0, 2);
  const sorted = [...all].sort((a, b) => a - b);
  return mode === "advantage" ? sorted.slice(1) : sorted.slice(0, 2);
}

function outcomeFrom(total: number): "success" | "partial" | "fail" {
  if (total >= 10) return "success";
  if (total >= 7) return "partial";
  return "fail";
}

export const createRoll = onCall({ region: "us-central1" }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Auth required");
  const { sessionId, campaignId, characterId, moveId, attributeRef, mode } = req.data as {
    sessionId: string;
    campaignId: string;
    characterId?: string;
    moveId?: string;
    attributeRef?: keyof Attributes;
    mode?: "normal" | "advantage" | "disadvantage" | "pdm";
  };
  if (!sessionId || !campaignId) throw new HttpsError("invalid-argument", "sessionId and campaignId required");

  const isPDM = mode === "pdm";
  const camp = await db.collection("campaigns").doc(campaignId).get();
  if (!camp.exists) throw new HttpsError("not-found", "Campaign not found");
  const campData = camp.data() as any;
  const isOwner = campData.ownerId === uid;
  const isPlayerInCampaign = campData.players && (uid in campData.players);

  if (isPDM && !isOwner) throw new HttpsError("permission-denied", "Only owner can PDM roll");
  if (!isPDM && !isPlayerInCampaign) throw new HttpsError("permission-denied", "Not a campaign player");

  let attributeMod = 0;
  if (attributeRef && characterId) {
    const ch = await db.collection("characters").doc(characterId).get();
    if (!ch.exists) throw new HttpsError("not-found", "Character not found");
    const chData = ch.data() as any;
    if (!isOwner && chData.userId !== uid && !isPDM) throw new HttpsError("permission-denied", "Not your character");
    attributeMod = (chData.attributes?.[attributeRef] ?? 0) as number;
  }

  let moveMod = 0;
  if (moveId) {
    const mv = await db.collection("moves").doc(moveId).get();
    if (mv.exists) moveMod = (mv.data() as any).modifier ?? 0;
  }

  const rollMode = !isPDM && (mode === "advantage" || mode === "disadvantage") ? mode : "normal";
  const diceCount = rollMode === "normal" ? 2 : 3;
  const dice = Array.from({ length: diceCount }, rollD6);
  const usedDice = pickUsedDice(dice, rollMode as any);
  const baseSum = usedDice.reduce((a, b) => a + b, 0);
  const totalModifier = attributeMod + moveMod;
  const total = baseSum + totalModifier;
  const outcome = outcomeFrom(total);

  const ref = db.collection("rolls").doc();
  const who = characterId ? { kind: "player", sheetId: characterId, name: "" } : { kind: "npc", sheetId: "", name: "" };
  const doc = {
    id: ref.id,
    sessionId,
    campaignId,
    dice,
    usedDice,
    baseSum,
    attributeRef: attributeRef ?? null,
    attributeModifier: attributeMod,
    moveRef: moveId ?? null,
    moveModifier: moveMod,
    totalModifier,
    total,
    outcome,
    who,
    isPDM: isPDM,
    createdAt: Date.now(),
    createdBy: uid,
  };
  await ref.set(doc);
  return { id: ref.id, total, outcome };
});

export const deleteRoll = onCall({ region: "us-central1" }, async (req) => {
  const uid = req.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Auth required");
  const { sessionId, rollId } = req.data as { sessionId: string; rollId: string };
  if (!sessionId || !rollId) throw new HttpsError("invalid-argument", "sessionId and rollId required");
  const ref = db.collection("rolls").doc(rollId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError("not-found", "Roll not found");
  const data = snap.data() as any;
  const campaignId = data.campaignId as string;
  await assertOwner(campaignId, uid);
  await ref.delete();
  return { success: true };
});