import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';

interface BarcodeScannerProps {
  onISBNScanned?: (isbn: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onISBNScanned }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const html5QrCodeRef = useRef<any>(null);
  const [scannerId] = useState(() => `html5qr-scanner-${Date.now()}`);
  const [retryKey, setRetryKey] = useState(0);

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    const isISBN = (data: string) => {
      const cleaned = data.replace(/[^0-9X]/g, '');
      return /^\d{9}(\d|X)$/.test(cleaned) || /^(978|979)\d{9}(\d|X)$/.test(cleaned);
    };

    const cleanedData = data.replace(/[^0-9X]/g, '');

    if (isISBN(cleanedData)) {
      console.log(`Valid ISBN: ${cleanedData}`);
      if (onISBNScanned) {
        onISBNScanned(cleanedData);
      } else {
        Alert.alert('ISBN Scanned', `ISBN: ${cleanedData}`);
      }
    } else {
      Alert.alert('Unrecognized Barcode', `Type: ${type}, Data: ${data}`, [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const initWebScanner = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          
          // Create scanner div directly in body for simplicity
          let scannerDiv = document.getElementById(scannerId);
          if (!scannerDiv) {
            scannerDiv = document.createElement('div');
            scannerDiv.id = scannerId;
            scannerDiv.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100vw;
              height: 100vh;
              background-color: #000;
              z-index: 9999;
            `;
            document.body.appendChild(scannerDiv);
            console.log('✅ Created scanner div:', scannerId);
          }

          const initScanner = async () => {
            try {
              const html5QrCode = new Html5Qrcode(scannerId);
              html5QrCodeRef.current = html5QrCode;

              console.log('🔄 Starting camera...');
              await html5QrCode.start(
                { facingMode: 'environment' },
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                  aspectRatio: 1.0,
                },
                (decodedText: string, decodedResult: any) => {
                  console.log('📷 Barcode scanned:', decodedText);
                  handleBarcodeScanned({ 
                    type: decodedResult?.result?.format?.formatName || 'unknown', 
                    data: decodedText 
                  });
                },
                (errorMessage: string) => {
                  if (!errorMessage.includes('NotFoundException') && 
                      !errorMessage.includes('No MultiFormat Readers') &&
                      !errorMessage.includes('QR code parse error')) {
                    console.log('Scanner:', errorMessage);
                  }
                }
              );
              console.log('✅ Scanner started!');
              setHasPermission(true);
            } catch (err: any) {
              console.error('❌ Error starting scanner:', err);
              setHasPermission(false);
              if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('permission')) {
                Alert.alert(
                  'Camera Permission Required',
                  'Please allow camera access in your browser settings.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Camera Error', `Failed to start camera: ${err.message || 'Unknown error'}`);
              }
            }
          };

          // Wait a bit for the div to be in the DOM
          setTimeout(initScanner, 100);
        } catch (err: any) {
          console.error('Error loading html5-qrcode:', err);
          setHasPermission(false);
          Alert.alert('Scanner Error', 'Failed to load barcode scanner library.');
        }
      };

      initWebScanner();

      return () => {
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().catch((err: any) => {
            console.error('Error stopping scanner:', err);
          });
          html5QrCodeRef.current.clear();
        }
        // Remove the div from body
        const element = document.getElementById(scannerId);
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      };
    } else {
      const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };
      getCameraPermissions();
    }
  }, [scannerId, retryKey]);

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ marginBottom: 20, textAlign: 'center', padding: 20, fontSize: 16 }}>
          {Platform.OS === 'web' 
            ? 'Camera access is required. Please allow camera permissions in your browser settings.'
            : 'No access to camera. Please enable camera access in your device settings.'}
        </Text>
        {Platform.OS === 'web' && (
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Button 
              title="Request Camera Permission" 
              onPress={async () => {
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                  });
                  stream.getTracks().forEach(track => track.stop());
                  setHasPermission(null);
                  setRetryKey(prev => prev + 1);
                } catch (err: any) {
                  console.error('Permission request failed:', err);
                  Alert.alert(
                    'Permission Denied',
                    'Please click the camera icon in your browser\'s address bar to grant camera permission.',
                    [{ text: 'OK' }]
                  );
                }
              }} 
            />
          </View>
        )}
      </View>
    );
  }

  if (Platform.OS === 'web') {
    // For web, the scanner div is already in the body, just show a placeholder
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
          Camera is active. Point at a barcode to scan.
        </Text>
        {scanned && (
          <View style={styles.buttonContainer}>
            <Button 
              title="Tap to Scan Again" 
              onPress={() => {
                setScanned(false);
                if (html5QrCodeRef.current) {
                  html5QrCodeRef.current.resume();
                }
              }} 
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'pdf417', 'qr'],
        }}
      />
      {scanned && (
        <View style={styles.buttonContainer}>
          <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 10,
  },
});

export default BarcodeScanner;
