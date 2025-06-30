import axiosApi from "@/apis/axiosApi";
import { useSessionStore } from "@/store/useSessionStore";
import { SessionContextValue } from "@/types/globalTypes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import Toast from "react-native-toast-message";

export default function useAddAddress() {
  const { token } = useSessionStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (addressData: any) => {
      const HeaderData = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axiosApi.post(
        "/addresses/add",
        addressData,
        HeaderData
      );

      if (response.data.status) {
        return response.data.data;
      } else {
        throw new Error(response.data.message);
      }
    },
    onMutate: async (addressData: any) => {
      await queryClient.cancelQueries({ queryKey: ["addresses"] });
      const previousAddresses = queryClient.getQueryData(["addresses"]);

      let newAddresses;

      const addressesArray = Array.isArray(previousAddresses)
        ? previousAddresses
        : [];

      if (addressData.is_default === 1) {
        const updatedOldAddresses = addressesArray.map((address: any) => {
          if (address.is_default === 1) {
            return { ...address, is_default: 0 };
          }
          return address;
        });

        newAddresses = [addressData, ...updatedOldAddresses];
      } else {
        newAddresses = [...addressesArray, addressData];
      }

      queryClient.setQueryData(["addresses"], newAddresses);

      return { previousAddresses };
    },
    onError: (err, addressData, context) => {
      console.error("Error adding address: ", err);
      queryClient.setQueryData(["addresses"], context?.previousAddresses);
      Toast.show({
        type: "error",
        text1: "Error creating address",
        text2: "Something went wrong",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
      });
    },
    // onSettled: () => {
    //   queryClient.invalidateQueries({queryKey: ["addresses"]});
    // },
    onSuccess: (data) => {
      Toast.show({
        type: "success",
        text1: "Address created successfully",
        text2: "Your address has been added",
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        onHide: () => {
          router.back();
        },
      });
    },
  });
}
