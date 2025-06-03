// src/Services/storage.ts
import * as SecureStore from "expo-secure-store";

export interface StoredNotification {
  id: string;
  title: string;
  body: string | null;
  timestamp: number;
  imageUrl?: string; // ← new
}

const NOTIFICATIONS_KEY = "notifications";
const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID!;
const ONESIGNAL_REST_API_KEY = process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY!;

export async function fetchAndStoreNotifications(): Promise<StoredNotification[]> {
  try {
    const response = await fetch(
      `https://onesignal.com/api/v1/notifications?app_id=${ONESIGNAL_APP_ID}`,
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch OneSignal notifications:", response.statusText);
      return [];
    }

    const data = await response.json();
    const rawList = data.notifications as any[];

    const mapped: StoredNotification[] = rawList.map((notif) => {
      // Attempt to pull out a “big picture” URL if OneSignal provided it:
      // On many OneSignal setups, this field is “big_picture”.
      const imageUrl = notif.big_picture ?? notif.android_big_picture ?? notif.big_picture_small ?? undefined;

      return {
        id: notif.id,
        title: notif.headings?.en ?? notif.heading_en ?? "No Title",
        body: notif.contents?.en ?? notif.content_en ?? null,
        timestamp: notif.send_after
          ? new Date(notif.send_after).getTime()
          : notif.created_at
          ? new Date(notif.created_at).getTime()
          : Date.now(),
        imageUrl, // may be undefined if no image was sent
      };
    });

    await SecureStore.setItemAsync(NOTIFICATIONS_KEY, JSON.stringify(mapped));
    console.log("✅ Fetched & stored remote notifications:", mapped);
    return mapped;
  } catch (error) {
    console.error("Error in fetchAndStoreNotifications:", error);
    return [];
  }
}

export async function getAllNotifications(): Promise<StoredNotification[]> {
  try {
    const raw = await SecureStore.getItemAsync(NOTIFICATIONS_KEY);
    return raw ? (JSON.parse(raw) as StoredNotification[]) : [];
  } catch {
    return [];
  }
}

export async function clearAllNotifications() {
  await SecureStore.deleteItemAsync(NOTIFICATIONS_KEY);
}
