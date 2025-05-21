import { View, Text } from "react-native";
import React from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function signIn() {
  return <AuthForm authType="sign-in" />;
}
