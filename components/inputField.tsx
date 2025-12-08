import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'

type Props = {}

const inputField = (props: React.ComponentProps<typeof TextInput>) => {
  // Ensure boolean props are actually booleans, not strings
  // This prevents "String cannot be cast to Boolean" errors in React Native
  const safeProps: React.ComponentProps<typeof TextInput> = {
    ...props,
  };
  
  // Convert string values to booleans for boolean props
  if (props.secureTextEntry !== undefined) {
    safeProps.secureTextEntry = typeof props.secureTextEntry === 'string' 
      ? props.secureTextEntry === 'true' 
      : Boolean(props.secureTextEntry);
  }
  
  if (props.multiline !== undefined) {
    safeProps.multiline = typeof props.multiline === 'string'
      ? props.multiline === 'true'
      : props.multiline === true;
  }
  
  if (props.editable !== undefined) {
    safeProps.editable = typeof props.editable === 'string'
      ? props.editable !== 'false'
      : props.editable !== false;
  }
  
  if (props.autoFocus !== undefined) {
    safeProps.autoFocus = typeof props.autoFocus === 'string'
      ? props.autoFocus === 'true'
      : Boolean(props.autoFocus);
  }
  
  if (props.selectTextOnFocus !== undefined) {
    safeProps.selectTextOnFocus = typeof props.selectTextOnFocus === 'string'
      ? props.selectTextOnFocus === 'true'
      : Boolean(props.selectTextOnFocus);
  }
  
  return (
  <TextInput
          
          {...safeProps}
        
          style={styles.inputField}
        
        />
  )
}



export default inputField

const styles = StyleSheet.create({
      inputField: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 18,
        alignSelf: "stretch",
      borderRadius: 5,
      fontSize: 16,
      color: Colors.black,
      marginBottom: 20,    
      },
})