import { Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?:
    | "default"
    | "title"
    | "semibold"
    | "subtitle"
    | "link"
    | "caption"
    | "heading";
  className?: string;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ThemedText({
  className,
  lightColor,
  darkColor,
  variant = "default",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      className={cn(
        "text-base",
        variant === "default" && "text-base leading-6",
        variant === "semibold" && "text-base leading-6 font-semibold",
        variant === "title" && "text-3xl font-bold leading-8",
        variant === "subtitle" && "text-xl font-bold",
        variant === "link" &&
          "text-base leading-7 text-blue-600 dark:text-blue-400",
        variant === "caption" && "text-sm text-gray-500 dark:text-gray-400",
        variant === "heading" && "text-2xl font-bold",
        className
      )}
      style={{ color }}
      {...rest}
    />
  );
}
