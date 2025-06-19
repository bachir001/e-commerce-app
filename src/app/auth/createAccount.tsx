import CreateAccount from "@/components/auth/CreateAccount";
import { useLocalSearchParams } from "expo-router";

export default function createAccount() {
  const { email } = useLocalSearchParams();

  return <CreateAccount email={Array.isArray(email) ? email[0] : email} />;
}
