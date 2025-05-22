import { KeyboardTypeOptions } from "react-native";
export type KeyboardTypeOption =
  | "default"
  | "email-address"
  | "numeric"
  | "phone-pad"
  | "number-pad"
  | "decimal-pad"
  | "url"
  | "web-search"
  | "visible-password";

interface CreateInputs {
  placeholder?: string;
  label: string;
  keyboardType?: KeyboardTypeOptions;
  isPassword?: boolean;
  isCalendar?: boolean;
  isGender?: boolean;
  isMobile?: boolean;
}

export const CREATE_INPUTS: CreateInputs[] = [
  {
    placeholder: "Enter your First Name",
    label: "First Name",
  },
  {
    placeholder: "Enter your Last Name",
    label: "Last Name",
  },
  {
    placeholder: "Enter your Email",
    label: "Email",
    keyboardType: "email-address",
  },
  {
    placeholder: "Enter date of birth",
    label: "Date of Birth",
    isCalendar: true,
  },
  {
    placeholder: "Enter gender",
    label: "Gender",
    isGender: true,
  },
  // {
  //   placeholder: "Enter Mobile Number",
  //   label: "Mobile",
  //   isMobile: true,
  // },
  {
    placeholder: "Enter your password",
    label: "Password",
    isPassword: true,
  },
  // {
  //   placeholder: "Enter your password again",
  //   label: "Confirm Password",
  //   isPassword: true,
  // },
];
