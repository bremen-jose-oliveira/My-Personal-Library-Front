import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { Colors } from '@/constants/Colors'

type Props = {}

const inputField = (props: React.ComponentProps<typeof TextInput>) => {
  return (
  <TextInput
          
          {...props}
        
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