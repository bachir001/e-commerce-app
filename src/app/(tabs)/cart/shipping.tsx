// app/(tabs)/cart/ShippingScreen.tsx

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { z } from "zod";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { useCartStore } from "@/store/cartStore";
import { getOrCreateSessionId } from "@/lib/session";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import axiosApi from "@/apis/axiosApi";

interface Governorate {
  id: number;
  name: string;
  code: string;
}

interface City {
  id: number;
  name: string;
  governorate_code: string;
  code: string;
}

interface Area {
  id: number;
  name: string;
  code: string;
  price: number;
  user_free_delivery: number;
  city_id: number;
}

const shippingSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dateOfBirth: z.date(),
    mobileNumber: z
      .string()
      .min(8, "Mobile number must be 8 digits")
      .max(8, "Mobile number must be 8 digits")
      .regex(/^\d+$/, "Must contain only numbers"),
    emailAddress: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    streetAddress1: z.string().min(1, "Street address is required"),
    streetAddress2: z.string().optional(),
    governorateId: z
      .number({ required_error: "Governorate is required" })
      .optional(),
    cityId: z.number({ required_error: "City is required" }).optional(),
    areaId: z.number({ required_error: "Area is required" }).optional(),
    gender: z.enum(["male", "female"]),
    deliveryMethod: z.enum(["delivery", "pickup"]),
  })
  .refine(
    (data) => {
      if (data.deliveryMethod === "delivery") {
        return !!data.governorateId && !!data.cityId && !!data.areaId;
      }
      return true;
    },
    {
      message: "All address fields are required for delivery",
      path: ["governorateId"],
    }
  );

export default function ShippingScreen(): React.ReactElement {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === "dark";
  const colorScheme = isDarkMode ? "dark" : "light";
  const styles = createStyles(colorScheme);

  // Contact state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [emailAddress, setEmailAddress] = useState<string>("");

  // Address state
  const [streetAddress1, setStreetAddress1] = useState<string>("");
  const [streetAddress2, setStreetAddress2] = useState<string>("");
  const [governorateList, setGovernorateList] = useState<Governorate[]>([]);
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<number>();
  const [cityList, setCityList] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number>();
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area>();

  // Additional info
  const [gender, setGender] = useState<"male" | "female">("male");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "delivery"
  );
  const [couponCode, setCouponCode] = useState<string>("");

  // Cart store
  const cartItems = useCartStore((state) => state.items);
  const subtotalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCost =
    deliveryMethod === "delivery" && selectedArea ? selectedArea.price : 0;
  const grandTotal = subtotalAmount + deliveryCost;

  // Helpers
  function formatDateAsYMD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Fetch governorates
  useEffect(() => {
    axiosApi
      .get("/governorates")
      .then((response) => {
        if (response.data.status) {
          setGovernorateList(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching governorates:", error));
  }, []);

  // Fetch cities on governorate change
  useEffect(() => {
    if (!selectedGovernorateId) {
      setCityList([]);
      setSelectedCityId(undefined);
      return;
    }
    const gov = governorateList.find((g) => g.id === selectedGovernorateId);
    if (!gov) return;
    axiosApi
      .get(`/cities/${gov.code}`)
      .then((response) => {
        if (response.data.status) {
          setCityList(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching cities:", error));
  }, [selectedGovernorateId, governorateList]);

  // Fetch areas on city change
  useEffect(() => {
    if (!selectedCityId) {
      setAreaList([]);
      setSelectedArea(undefined);
      return;
    }
    const city = cityList.find((c) => c.id === selectedCityId);
    if (!city) return;
    axiosApi
      .get(`/areas/${encodeURIComponent(city.code)}`)
      .then((response) => {
        if (response.data.status) {
          setAreaList(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching areas:", error));
  }, [selectedCityId, cityList]);

  // Submission
  async function handlePlaceOrder(): Promise<void> {
    try {
      const formData = {
        firstName,
        lastName,
        dateOfBirth,
        mobileNumber,
        emailAddress,
        streetAddress1,
        streetAddress2,
        governorateId: selectedGovernorateId,
        cityId: selectedCityId,
        areaId: selectedArea?.id,
        gender,
        deliveryMethod,
      };

      const result = shippingSchema.safeParse(formData);
      if (!result.success) {
        const issue = result.error.issues[0];
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: `${issue.path[0]}: ${issue.message}`,
          topOffset: 60,
          position: "top",
          autoHide: true,
          visibilityTime: 1000,
        });
        return;
      }

      const sessionId = await getOrCreateSessionId();
      const pickUpFlag = deliveryMethod === "pickup" ? 1 : 0;
      const requestBody = {
        first_name: firstName,
        last_name: lastName,
        mobile: mobileNumber,
        email: emailAddress,
        gender_id: gender === "male" ? 1 : 2,
        date_of_birth: formatDateAsYMD(dateOfBirth),
        street: streetAddress1,
        street_2: streetAddress2,
        governorate_id: selectedGovernorateId,
        city_id: selectedCityId,
        area_id: selectedArea?.id,
        country_id: 1,
        postal_code: "",
        password: "",
        note: additionalNotes,
        pick_up: pickUpFlag,
        delivery_price: deliveryCost,
      };

      const response = await axiosApi.post("checkout-data", requestBody, {
        headers: { "x-session": sessionId },
      });

      if (response.data.status) {
        Toast.show({
          type: "success",
          text1: "Order Placed",
          text2: `Invoice #${response.data.data.invoice_id}`,
          topOffset: 60,
          position: "top",
          autoHide: true,
          visibilityTime: 500,
          onHide: () => {
            router.replace("/(tabs)/home");
          },
        });
      } else {
        throw new Error(response.data.message || "Checkout failed");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        Toast.show({
          type: "error",
          text1: `Checkout Failed (${err.response.status})`,
          text2:
            err.response.data?.message || JSON.stringify(err.response.data),
          topOffset: 60,
          position: "top",
          autoHide: true,
          visibilityTime: 1000,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Checkout Failed",
          text2: err.message || "Unknown error",
          topOffset: 60,
          position: "top",
          autoHide: true,
          visibilityTime: 1000,
        });
      }
      console.error(err);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Shipping Information</Text>

        {/* Contact Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Contact Information</Text>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
          />
          <Pressable
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: Colors[colorScheme].text }}>
              {dateOfBirth.toLocaleDateString()}
            </Text>
          </Pressable>
          {showDatePicker ? (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setDateOfBirth(date);
              }}
            />
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            keyboardType="email-address"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
        </View>

        {/* Address Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Address Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={streetAddress1}
            onChangeText={setStreetAddress1}
          />
          <TextInput
            style={styles.input}
            placeholder="Street Address Line 2 (Optional)"
            value={streetAddress2}
            onChangeText={setStreetAddress2}
          />
          <Picker<number | undefined>
            style={styles.picker}
            selectedValue={selectedGovernorateId}
            onValueChange={(v: number | undefined) =>
              setSelectedGovernorateId(v)
            }
          >
            <Picker.Item label="Select Governorate" value={undefined} />
            {governorateList.map((gov) => (
              <Picker.Item key={gov.id} label={gov.name} value={gov.id} />
            ))}
          </Picker>
          <Picker
            style={styles.picker}
            selectedValue={selectedCityId}
            onValueChange={(v: number | undefined) => setSelectedCityId(v)}
            enabled={cityList.length > 0}
          >
            <Picker.Item label="Select City" value={undefined} />
            {cityList.map((city) => (
              <Picker.Item key={city.id} label={city.name} value={city.id} />
            ))}
          </Picker>
          <Picker
            style={styles.picker}
            selectedValue={selectedArea}
            onValueChange={(value: Area | undefined) => setSelectedArea(value)}
            enabled={areaList.length > 0}
          >
            <Picker.Item label="Select Area" value={undefined} />
            {areaList.map((area) => (
              <Picker.Item
                key={area.id}
                label={`${area.name} ($${area.price.toFixed(2)})`}
                value={area}
              />
            ))}
          </Picker>
        </View>

        {/* Additional Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Additional Information</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: "top" }]}
            placeholder="Add any additional notes or special instructions here..."
            multiline
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
          />
          <Text
            style={{
              marginBottom: 8,
              color: Colors[colorScheme].text,
              fontWeight: "600",
            }}
          >
            Delivery Method
          </Text>
          <View style={styles.radioGroup}>
            <Pressable
              onPress={() => setDeliveryMethod("delivery")}
              style={styles.radioOption}
            >
              <View style={styles.radioOuter}>
                {deliveryMethod === "delivery" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
              <Text style={styles.radioLabel}>Home Delivery</Text>
            </Pressable>
            <Pressable
              onPress={() => setDeliveryMethod("pickup")}
              style={styles.radioOption}
            >
              <View style={styles.radioOuter}>
                {deliveryMethod === "pickup" ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
              <Text style={styles.radioLabel}>Store Pickup</Text>
            </Pressable>
          </View>
        </View>

        {/* Order Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Order Details</Text>
          {cartItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.rowLeft}>
                <Image
                  fadeDuration={0}
                  source={{ uri: item.imageUrl }}
                  style={styles.productImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSku}>SKU: {item.id}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.itemPrice}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
                <Text style={styles.quantityText}>×{item.quantity}</Text>
              </View>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text>
              {cartItems.length} product{cartItems.length > 1 ? "s" : ""}
            </Text>
            <Text>(total quantity: {totalQuantity})</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Product total</Text>
            <Text>${subtotalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Delivery</Text>
            <Text>
              {deliveryMethod === "delivery"
                ? selectedArea
                  ? `$${deliveryCost.toFixed(2)}`
                  : "--"
                : "—"}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.couponRow}>
            <TextInput
              style={[styles.input, styles.couponInput]}
              placeholder="Enter Your Coupon Code"
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <Pressable style={styles.couponButton}>
              <Text style={styles.couponButtonText}>Apply</Text>
            </Pressable>
          </View>

          <Pressable style={styles.placeOrderButton} onPress={handlePlaceOrder}>
            <Text style={styles.placeOrderText}>PLACE ORDER</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get("window").width;

function createStyles(mode: "light" | "dark") {
  const backgroundColor =
    mode === "light" ? "#F3E8FF" : Colors[mode].background;
  const accentColor = "#5E3EBD";
  const textColor = Colors[mode].text;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: backgroundColor,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 48,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: accentColor,
      marginBottom: 24,
      alignSelf: "center",
    },
    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      width: screenWidth - 32,
      alignSelf: "center",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: accentColor,
      marginBottom: 12,
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: accentColor,
      borderRadius: 24,
      height: 48,
      paddingHorizontal: 16,
      marginBottom: 12,
      color: textColor,
    },
    picker: {
      width: "100%",
      borderWidth: 1,
      borderColor: accentColor,
      borderRadius: 24,
      height: 48,
      marginBottom: 12,
    },
    radioGroup: {
      flexDirection: "row",
      marginBottom: 12,
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 24,
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: accentColor,
      borderRadius: 12,
      marginRight: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    radioInner: {
      width: 12,
      height: 12,
      backgroundColor: accentColor,
      borderRadius: 6,
    },
    radioLabel: {
      fontSize: 14,
      color: textColor,
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    itemInfo: {
      marginLeft: 12,
    },
    itemName: {
      fontSize: 14,
      fontWeight: "500",
      maxWidth: 120,
      color: textColor,
    },
    itemSku: {
      fontSize: 12,
      color: "#666666",
      marginTop: 4,
    },
    itemPrice: {
      fontSize: 14,
      fontWeight: "600",
      color: textColor,
    },
    quantityText: {
      fontSize: 14,
      marginLeft: 8,
      color: textColor,
    },
    summaryDivider: {
      height: 1,
      backgroundColor: "#EEEEEE",
      marginVertical: 12,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    totalLabel: {
      fontWeight: "700",
    },
    totalValue: {
      fontSize: 16,
      fontWeight: "700",
      color: "#F59E0B",
    },
    couponRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      marginBottom: 12,
    },
    couponInput: {
      flex: 1,
      marginRight: 8,
      borderRadius: 24,
      height: 48,
    },
    couponButton: {
      backgroundColor: "#FBBF24",
      borderRadius: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    couponButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    placeOrderButton: {
      backgroundColor: accentColor,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: "center",
    },
    placeOrderText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
