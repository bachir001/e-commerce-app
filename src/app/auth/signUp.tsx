import { View, Text } from "react-native";
import React from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function signUp() {
  return <AuthForm authType="sign-up" />;
}
