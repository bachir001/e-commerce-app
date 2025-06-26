import { useLocalSearchParams } from "expo-router";

import { Address } from ".";
import AddressForm from "@/components/addresses/AddressForm";

export default function EditAddress() {
  const { address } = useLocalSearchParams();
  const addressParsed: Address = JSON.parse(address as string);

  return <AddressForm type="edit" addressParsed={addressParsed} />;
}
