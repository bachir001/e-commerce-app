import { OneSignal, LogLevel } from 'react-native-onesignal';
export function initOneSignal() {
// Enable verbose logging for debugging (remove or reduce in production)
OneSignal.Debug.setLogLevel(LogLevel.Verbose);
const oneSignalAppId = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID;

// Initialize with your OneSignal App ID
OneSignal.initialize(oneSignalAppId);

// Prompt for push notification permissions (not needed if using in-app messages)
OneSignal.Notifications.requestPermission(false);
}