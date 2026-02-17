import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";
import { Colors } from "@/constants/Colors";

type Props = {};

const inputField = (props: React.ComponentProps<typeof TextInput>) => {
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

  return <TextInput {...safeProps} style={styles.inputField} />;
};

export default inputField;

const styles = StyleSheet.create({
  inputField: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e9ecef",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignSelf: "stretch",
    borderRadius: 10,
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
});
