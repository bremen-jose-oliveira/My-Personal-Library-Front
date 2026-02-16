import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { useState } from "react";
import { Colors } from "@/constants/Colors";

type Props = {};

const inputField = (props: React.ComponentProps<typeof TextInput>) => {
  const [isFocused, setIsFocused] = useState(false);
  const safeProps: React.ComponentProps<typeof TextInput> = {
    ...props,
  };

  // Convert string values to booleans for boolean props
  if (props.secureTextEntry !== undefined) {
    safeProps.secureTextEntry =
      typeof props.secureTextEntry === "string"
        ? props.secureTextEntry === "true"
        : Boolean(props.secureTextEntry);
  }

  if (props.multiline !== undefined) {
    safeProps.multiline =
      typeof props.multiline === "string"
        ? props.multiline === "true"
        : props.multiline === true;
  }

  if (props.editable !== undefined) {
    safeProps.editable =
      typeof props.editable === "string"
        ? props.editable !== "false"
        : props.editable !== false;
  }

  if (props.autoFocus !== undefined) {
    safeProps.autoFocus =
      typeof props.autoFocus === "string"
        ? props.autoFocus === "true"
        : Boolean(props.autoFocus);
  }

  if (props.selectTextOnFocus !== undefined) {
    safeProps.selectTextOnFocus =
      typeof props.selectTextOnFocus === "string"
        ? props.selectTextOnFocus === "true"
        : Boolean(props.selectTextOnFocus);
  }

  return (
    <TextInput
      {...safeProps}
      placeholderTextColor={Colors.placeholder}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      style={[
        styles.inputField,
        isFocused && styles.inputFieldFocused,
      ]}
    />
  );
};

export default inputField;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: "stretch",
    borderRadius: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  inputFieldFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
