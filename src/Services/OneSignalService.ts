import { OneSignal, LogLevel } from "react-native-onesignal";
import Constants from "expo-constants";

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

if (!ONESIGNAL_APP_ID) {
  console.error(
    "OneSignal App ID not found. Ensure it's set in app.json 'extra' or .env file."
  );
}

let isInitialized = false;

export const initOneSignalNew = () => {
  if (!ONESIGNAL_APP_ID) {
    console.error("OneSignal initialization skipped: UNDEFINED APP ID");
    return;
  }

  if (isInitialized) {
    return;
  }

  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.initialize(ONESIGNAL_APP_ID);

  OneSignal.User.pushSubscription.addEventListener("change", () => {
    isInitialized = true;
    console.log("OneSignal initialized successfully");
  });

  OneSignal.Notifications.requestPermission(true).then(() => {
    isInitialized = true;
    console.log("whats up");
  });
};

export const loginOneSignal = async (userId: string) => {
 
  if (!userId) {
    console.warn("OneSignal login skipped: userId is undefined");
    return;
  }

  OneSignal.login(userId);

  console.log("OneSignal: External User ID set:", userId);
};

export const logoutOneSignal = () => {
  OneSignal.logout();
  console.log("OneSignal: External User ID removed (logged out).");
};
