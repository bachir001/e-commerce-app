// app/(tabs)/cart/shipping.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { z } from 'zod';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useCartStore } from '@/store/cartStore';
import { getOrCreateSessionId } from '@/lib/session';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

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

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.date(),
  mobileNumber: z.string()
    .min(8, 'Mobile number must be 8 digits')
    .max(8, 'Mobile number must be 8 digits')
    .regex(/^\d+$/, 'Must contain only numbers'),
  emailAddress: z.string().email('Invalid email address').optional().or(z.literal('')),
  streetAddress1: z.string().min(1, 'Street address is required'),
  streetAddress2: z.string().optional(),
  governorateId: z.number({
    required_error: 'Governorate is required',
    invalid_type_error: 'Governorate is required',
  }).optional(),
  cityId: z.number({
    required_error: 'City is required',
    invalid_type_error: 'City is required',
  }).optional(),
  areaId: z.number({
    required_error: 'Area is required',
    invalid_type_error: 'Area is required',
  }).optional(),
  gender: z.enum(['male', 'female']),
  deliveryMethod: z.enum(['delivery', 'pickup']),
}).refine(data => {
  if (data.deliveryMethod === 'delivery') {
    return !!data.governorateId && !!data.cityId && !!data.areaId;
  }
  return true;
}, {
  message: 'All address fields are required for delivery',
  path: ['governorateId'],
});

export default function ShippingScreen(): React.ReactElement {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';
  const colorScheme = isDarkMode ? 'dark' : 'light';
  const styles = createStyles(colorScheme);

  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [streetAddress1, setStreetAddress1] = useState<string>('');
  const [streetAddress2, setStreetAddress2] = useState<string>('');
  const [governorateList, setGovernorateList] = useState<Governorate[]>([]);
  const [selectedGovernorateId, setSelectedGovernorateId] = useState<number>();
  const [cityList, setCityList] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number>();
  const [areaList, setAreaList] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<Area>();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [couponCode, setCouponCode] = useState<string>('');

  const cartItems = useCartStore(state => state.items);
  const subtotalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryCost = deliveryMethod === 'delivery' && selectedArea ? selectedArea.price : 0;
  const grandTotal = subtotalAmount + deliveryCost;

  function formatDateAsYMD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    axios.get('https://api-gocami-test.gocami.com/api/governorates')
      .then(response => {
        if (response.data.status) {
          setGovernorateList(response.data.data);
        }
      })
      .catch(error => console.error('Error fetching governorates:', error));
  }, []);

  useEffect(() => {
    if (!selectedGovernorateId) {
      setCityList([]);
      setSelectedCityId(undefined);
      return;
    }
    const match = governorateList.find(g => g.id === selectedGovernorateId);
    if (!match) return;

    axios.get(`https://api-gocami-test.gocami.com/api/cities/${match.code}`)
      .then(response => {
        if (response.data.status) {
          setCityList(response.data.data);
        }
      })
      .catch(error => console.error('Error fetching cities:', error));
  }, [selectedGovernorateId, governorateList]);

  useEffect(() => {
    if (!selectedCityId) {
      setAreaList([]);
      setSelectedArea(undefined);
      return;
    }
    const match = cityList.find(c => c.id === selectedCityId);
    if (!match) return;

    axios.get(`https://newapi.gocami.com/api/areas/${encodeURIComponent(match.code)}`)
      .then(response => {
        if (response.data.status) {
          setAreaList(response.data.data);
        }
      })
      .catch(error => console.error('Error fetching areas:', error));
  }, [selectedCityId, cityList]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateMobile = (mobile: string) => {
    const re = /^\d{10}$/;
    return re.test(mobile);
  };

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
        const firstError = result.error.issues[0];
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: `${firstError.path[0]}: ${firstError.message}`,
        });
        return;
      }

      // Proceed with API call if validation passes
      const sessionId = await getOrCreateSessionId();
      const pickUpFlag = deliveryMethod === 'pickup' ? 1 : 0;

      const requestBody = {
        first_name: firstName,
        last_name: lastName,
        mobile: mobileNumber,
        email: emailAddress,
        gender_id: gender === 'male' ? 1 : 2,
        date_of_birth: formatDateAsYMD(dateOfBirth),
        street: streetAddress1,
        street_2: streetAddress2,
        governorate_id: selectedGovernorateId,
        city_id: selectedCityId,
        area_id: selectedArea?.id,
        country_id: 1,
        postal_code: '',
        password: '',
        note: additionalNotes,
        pick_up: pickUpFlag,
        delivery_price: deliveryCost,
      };

      const response = await axios.post(
        'https://api-gocami-test.gocami.com/api/checkout-data',
         requestBody,
        { headers: { 'x-session': sessionId } }
      );
      
      if (response.data.status) {
        Toast.show({
          type: 'success',
          text1: 'Order Placed',
          text2: `Invoice #${response.data.data.invoice_id}`,
        });
        router.replace('/(tabs)/home');
      } else {        
        throw new Error(response.data.message || 'Checkout failed');
      }
    } catch (err: any) {
  if (axios.isAxiosError(err) && err.response) {
    console.error('🔴 checkout status:', err.response.status);
    console.error('🔴 checkout payload:', err.response.data);
    Toast.show({
      type: 'error',
      text1: `Checkout Failed (${err.response.status})`,
      text2: err.response.data?.message || JSON.stringify(err.response.data),
    });
  } else {
        console.error('⚠️ unexpected error:', err);
        Toast.show({
          type: 'error',
          text1: 'Checkout Failed',
          text2: err.message || 'Unknown error',
        });
      }
    }
  }

  return (
      <SafeAreaView style={styles.container}>
       <ScrollView contentContainerStyle={styles.scrollContent}>
         <Text style={styles.header}>SHIPPING ADDRESS</Text>

         <Text style={styles.sectionLabel}>Your Contact Details</Text>
        <TextInput
          style={styles.textInput}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />

        <Pressable
          style={styles.textInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.textInputText}>
            {dateOfBirth.toLocaleDateString()}
          </Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowDatePicker(false);
              if (date) setDateOfBirth(date);
            }}
          />
        )}

        <TextInput
          style={styles.textInput}
          placeholder="Mobile Number"
          keyboardType="phone-pad"
          value={mobileNumber}
          onChangeText={setMobileNumber}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Email Address"
          keyboardType="email-address"
          value={emailAddress}
          onChangeText={setEmailAddress}
        />

        <Text style={styles.sectionLabel}>Your Address Details</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Street Address 1"
          value={streetAddress1}
          onChangeText={setStreetAddress1}
        />
        <TextInput
          style={styles.textInput}
          placeholder="Street Address 2"
          value={streetAddress2}
          onChangeText={setStreetAddress2}
        />

        <Picker
          style={styles.picker}
          selectedValue={selectedGovernorateId}
          onValueChange={setSelectedGovernorateId}
        >
          <Picker.Item label="Select a Governorate" value={undefined} />
          {governorateList.map(gov => (
            <Picker.Item key={gov.id} label={gov.name} value={gov.id} />
          ))}
        </Picker>

        <Picker
          style={styles.picker}
          selectedValue={selectedCityId}
          onValueChange={setSelectedCityId}
          enabled={cityList.length > 0}
        >
          <Picker.Item label="Select a City" value={undefined} />
          {cityList.map(city => (
            <Picker.Item key={city.id} label={city.name} value={city.id} />
          ))}
        </Picker>

        <Picker
          style={styles.picker}
          selectedValue={selectedArea}
          onValueChange={setSelectedArea}
          enabled={areaList.length > 0}
        >
          <Picker.Item label="Select an Area" value={undefined} />
          {areaList.map(area => (
            <Picker.Item key={area.id} label={area.name} value={area} />
          ))}
        </Picker>

        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.radioGroup}>
          <Pressable onPress={() => setGender('male')} style={styles.radioOption}>
            <View style={[styles.radioOuter, gender === 'male' && styles.radioSelected]} />
            <Text style={styles.radioLabel}>Male</Text>
          </Pressable>
          <Pressable onPress={() => setGender('female')} style={styles.radioOption}>
            <View style={[styles.radioOuter, gender === 'female' && styles.radioSelected]} />
            <Text style={styles.radioLabel}>Female</Text>
          </Pressable>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Additional Notes"
          value={additionalNotes}
          onChangeText={setAdditionalNotes}
        />

        <Text style={styles.sectionLabel}>Choose Delivery Method</Text>
        <View style={styles.radioGroup}>
          <Pressable onPress={() => setDeliveryMethod('delivery')} style={styles.radioOption}>
            <View style={[styles.radioOuter, deliveryMethod === 'delivery' && styles.radioSelected]} />
            <Text style={styles.radioLabel}>Delivery</Text>
          </Pressable>
          <Pressable onPress={() => setDeliveryMethod('pickup')} style={styles.radioOption}>
            <View style={[styles.radioOuter, deliveryMethod === 'pickup' && styles.radioSelected]} />
            <Text style={styles.radioLabel}>Pickup from Store</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ORDER DETAILS</Text>
          {cartItems.map(item => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.rowLeft}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSku}>SKU: {item.id}</Text>
                </View>
              </View>
              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              <Text style={styles.quantityText}>{item.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ORDER SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text>
              {cartItems.length} product{cartItems.length > 1 ? 's' : ''}
            </Text>
            <Text>(total quantity: {totalQuantity})</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text>Product total</Text>
            <Text>${subtotalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Delivery</Text>
            <Text>
              {deliveryMethod === 'delivery'
                ? selectedArea
                  ? `$${selectedArea.price.toFixed(2)}`
                  : '__'
                : '—'}
            </Text>
          </View>

          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${grandTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.couponRow}>
            <TextInput
              style={[styles.textInput, styles.couponInput]}
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

const screenWidth = Dimensions.get('window').width;
function createStyles(mode: 'light' | 'dark') {
  const backgroundColor = mode === 'light' ? '#F3E8FF' : Colors[mode].background;
  const textColor       = Colors[mode].text;

  return StyleSheet.create({
    container:       { flex: 1, backgroundColor },
    scrollContent:   { padding: 16, paddingBottom: 48 },
    header:          { fontSize: 24, fontWeight: '700', marginBottom: 16, color: textColor },
    sectionLabel:    { fontSize: 16, fontWeight: '600', marginTop: 24, marginBottom: 8, color: textColor },
    textInput:       {
      width: '100%', height: 44, borderRadius: 22,
      borderWidth: 1, borderColor: '#5E3EBD',
      paddingHorizontal: 16, marginBottom: 12, marginTop: 12,
      color: textColor,
    },
    textInputText:   { color: textColor, fontSize: 16 },
    picker:          {
      width: '100%', height: 44, borderRadius: 22,
      borderWidth: 1, borderColor: '#5E3EBD',
      marginBottom: 12,
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      marginRight: 12,
    },
    radioGroup:      { flexDirection: 'row', marginBottom: 12 },
    radioOption:     { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
    radioOuter:      {
      width: 20, height: 20, borderRadius: 10,
      borderWidth: 2, borderColor: '#5E3EBD',
      marginRight: 8, backgroundColor: 'transparent',
    },
    radioSelected:   { backgroundColor: '#5E3EBD' },
    radioLabel:      { fontSize: 14, color: textColor },
    card:            {
      backgroundColor: '#FFFFFF', borderRadius: 12,
      padding: 16, marginTop: 24,
      width: screenWidth - 32, alignSelf: 'center',
      shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTitle:       { fontSize: 18, fontWeight: '600', marginBottom: 12, color: textColor },
    itemRow:         {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'space-between', marginBottom: 12,
    },
    rowLeft:         { flexDirection: 'row', alignItems: 'center' },
    itemInfo:        { marginLeft: 12 },
    itemName:        { fontSize: 14, fontWeight: '500', maxWidth: 120, color: textColor },
    itemSku:         { fontSize: 12, color: '#666666', marginTop: 4 },
    itemPrice:       { fontSize: 14, fontWeight: '600', color: textColor },
    quantityText:    { fontSize: 14, marginLeft: 8, color: textColor },
    summaryRow:      { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
    divider:         { height: 1, backgroundColor: '#EEEEEE', marginVertical: 8 },
    totalLabel:      { fontWeight: '700' },
    totalValue:      { fontSize: 16, fontWeight: '700', color: '#F59E0B' },
    couponRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    couponInput:     { flex: 1, marginRight: 8 },
    couponButton:    { backgroundColor: '#FBBF24', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
    couponButtonText:{ color: '#FFFFFF', fontWeight: '600' },
    placeOrderButton:{ marginTop: 16, backgroundColor: '#5E3EBD', borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
    placeOrderText:  { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  });
}
