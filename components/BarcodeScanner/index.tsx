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
  const scannerElementRef = useRef<HTMLDivElement | null>(null);

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
      let isMounted = true;
      
      const initScanner = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          
          // Create a simple div element
          const scannerDiv = document.createElement('div');
          scannerDiv.id = 'qr-reader';
          scannerDiv.style.width = '100%';
          scannerDiv.style.height = '100%';
          scannerDiv.style.position = 'absolute';
          scannerDiv.style.top = '0';
          scannerDiv.style.left = '0';
          scannerDiv.style.zIndex = '1000';
          scannerDiv.style.backgroundColor = '#000';
          
          // Find or create container
          let container = document.getElementById('scanner-container');
          if (!container) {
            container = document.createElement('div');
            container.id = 'scanner-container';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
          }
          
          container.appendChild(scannerDiv);
          scannerElementRef.current = scannerDiv;

          const html5QrCode = new Html5Qrcode('qr-reader');
          html5QrCodeRef.current = html5QrCode;

          // Get available cameras
          const cameras = await Html5Qrcode.getCameras();
          const cameraId = cameras.length > 0 ? cameras[0].id : null;

          if (!cameraId) {
            throw new Error('No camera found');
          }

          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText: string, decodedResult: any) => {
              if (isMounted) {
                handleBarcodeScanned({
                  type: decodedResult?.result?.format?.formatName || 'unknown',
                  data: decodedText,
                });
              }
            },
            (errorMessage: string) => {
              // Ignore common scanning errors
            }
          );

          if (isMounted) {
            setHasPermission(true);
          }
        } catch (err: any) {
          console.error('Scanner error:', err);
          if (isMounted) {
            setHasPermission(false);
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              Alert.alert('Camera Permission Required', 'Please allow camera access in your browser settings.');
            } else {
              Alert.alert('Camera Error', err.message || 'Failed to start camera');
            }
          }
        }
      };

      // Small delay to ensure DOM is ready
      const timer = setTimeout(initScanner, 300);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().catch(() => {});
          html5QrCodeRef.current.clear();
        }
        if (scannerElementRef.current?.parentNode) {
          scannerElementRef.current.parentNode.removeChild(scannerElementRef.current);
        }
        const container = document.getElementById('scanner-container');
        if (container) {
          container.remove();
        }
      };
    } else {
      const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      };
      getCameraPermissions();
    }
  }, []);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {Platform.OS === 'web'
            ? 'Camera access is required. Please allow camera permissions in your browser settings.'
            : 'No access to camera. Please enable camera access in your device settings.'}
        </Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera is active. Point at a barcode to scan.</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    padding: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 10,
  },
});

export default BarcodeScanner;
