import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: process.env.MMKV_ID,
  encryptionKey: process.env.MMKV_ENCRYPTION_KEY,
});
