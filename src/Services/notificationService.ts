import { OneSignal } from "react-native-onesignal";
import { UserContextType } from "@/types/globalTypes";
import * as SecureStore from "expo-secure-store";
interface UserData {
  id: string;
  date_of_birth: string;
  gender_id: number;
}

const getGenderString = (genderId: number): string => {
  switch (genderId) {
    case 1:
      return "male";
    case 2:
      return "female";
    default:
      return "male";
  }
};

// Simple duplicate prevention
let lastUserId: string | null = null;

export async function addExternalUserID(userParam: UserContextType) {
  try {
    if (!userParam) return;

    const userIdString = String(userParam.id);
    // 2. Perform login
    const result = await OneSignal.login(userIdString);
    console.log(result, "result");

    console.log("Login called for:", userIdString);

    // 4. Update tags
    await updateUserTags(userParam);
  } catch (error) {
    console.error("Error in addExternalUserID:", error);
  }
}

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID!;
const ONESIGNAL_REST_API_KEY = process.env.EXPO_PUBLIC_ONESIGNAL_REST_API_KEY!;

// Type 1: Send to specific user on their birthday
export async function sendBirthdayNotification(
  message: string = "Happy Birthday! Enjoy your special day!",
  imageUrl?: string
): Promise<boolean> {
  try {
    const userString = await SecureStore.getItemAsync("user");
    if (!userString) {
      return false;
    }

    const currentUser: UserData = JSON.parse(userString);

    const today = new Date();
    const birthDate = new Date(currentUser.date_of_birth);

    const sendAfter = new Date(today);
    sendAfter.setHours(10, 0, 0, 0);

    const notificationBody = {
      app_id: ONESIGNAL_APP_ID,
      include_aliases: {
        // external_id: [userId],
      },
      target_channel: "push",
      headings: { en: "🎂 Happy Birthday!" },
      contents: { en: message },
      ...(imageUrl && { big_picture: imageUrl }),
      send_after: sendAfter.toISOString(),
    };

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationBody),
    });

    return response.ok;
  } catch (error) {
    console.error("Error sending birthday notification:", error);
    return false;
  }
}

// Type 2: Send to all users of specific gender
export async function sendGenderNotification(
  gender: string,
  title: string,
  message: string,
  imageUrl?: string
): Promise<boolean> {
  try {
    const notificationBody = {
      app_id: ONESIGNAL_APP_ID,
      filters: [{ field: "tag", key: "gender", relation: "=", value: gender }],
      target_channel: "push",
      headings: { en: title },
      contents: { en: message },
      ...(imageUrl && { big_picture: imageUrl }),
    };

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notificationBody),
    });

    return response.ok;
  } catch (error) {
    console.error("Error sending gender notification:", error);
    return false;
  }
}

export const sendUserNotification = async (
  externalId: string, // Changed to externalId, and it should not be null for targeting
  title: string,
  message: string
) => {
  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        // Use include_external_user_ids for targeting by External ID
        include_external_user_ids: [externalId],
        headings: { en: title },
        contents: { en: message },
      }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending user notification:", error);
    throw error;
  }
};

// Update user tags in OneSignal (call this after login)

export async function updateUserTags(user: UserContextType) {
  try {
    if (!user) return;
    console.log(user, "user");

    // const birthDate = new Date(user.date_of_birth);
    OneSignal.User.addTags({
      user_id: String(user.id),
      gender: getGenderString(user.gender_id),
      // birth_month: String(birthDate.getMonth() + 1), // Convert to string
      // birth_day: String(birthDate.getDate()), // Convert to string
    });
  } catch (error) {
    console.error("Error updating user tags:", error);
  }
}
