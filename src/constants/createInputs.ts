import { KeyboardTypeOptions } from "react-native";

interface CreateInputs {
  placeholder: string;
  label: string;
  keyboardType?: string | KeyboardTypeOptions;
  isPassword?: boolean;
}

export const CREATE_INPUTS: CreateInputs[] = [
  {
    placeholder: "Enter your First Name",
    label: "First Name",
  },
  {
    placeholder: "Enter your Middle Name",
    label: "Middle Name",
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
    placeholder: "Enter your password",
    label: "Password",
    isPassword: true,
  },
  {
    placeholder: "Enter your password again",
    label: "Confirm Password",
    isPassword: true,
  },
];
