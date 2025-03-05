  import React, { useEffect, useState } from 'react';
  import { View, Text, StyleSheet, Button, Alert } from 'react-native';
  import { Camera, CameraView } from 'expo-camera';

  interface BarcodeScannerProps {
    onISBNScanned?: (isbn: string) => void; // Make the prop optional
  }

  const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onISBNScanned }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
      const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };

      getCameraPermissions();
    }, []);

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
      if (scanned) return; // Prevent scanning multiple times
      setScanned(true);

      // Check if the scanned barcode is an ISBN
      const isISBN = (data: string) => {
        return /^\d{9}(\d|X)$/.test(data) || // ISBN-10
              /^(978|979)\d{9}(\d|X)$/.test(data); // ISBN-13
      };

      if (isISBN(data)) {
        console.log(`Valid ISBN: ${data}`);
        if (onISBNScanned) {  // Check if the function is defined
          onISBNScanned(data); // Call the function if it's defined
        } else {
          Alert.alert('ISBN Scanned', `ISBN: ${data}`); // Fallback action
        }
      } else {
        Alert.alert('Unrecognized Barcode', `Type: ${type}, Data: ${data}`, [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    };

    if (hasPermission === null) {
      return <Text>Requesting for camera permission...</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera. Please enable camera access in your device settings.</Text>;
    }

    return (
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'pdf417', 'qr'], // Include formats relevant to your needs
          }}
        />
        {scanned && (
          <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
        )}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  export default BarcodeScanner;
