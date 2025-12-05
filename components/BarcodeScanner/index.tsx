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
  const [isInitializing, setIsInitializing] = useState(false);

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

  // Function to initialize scanner (can be called manually for user gesture)
  const initWebScanner = React.useCallback(async () => {
    if (Platform.OS !== 'web') return;
    if (isInitializing) return;
    setIsInitializing(true);
    try {
          const { Html5Qrcode } = await import('html5-qrcode');
          
          // Function to create and initialize scanner
          const createAndInitScanner = async () => {
            // Remove any existing scanner div
            const existingDiv = document.getElementById(scannerId);
            if (existingDiv) {
              existingDiv.remove();
            }

            // Create scanner div directly in body
            const scannerDiv = document.createElement('div');
            scannerDiv.id = scannerId;
            scannerDiv.style.cssText = `
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              background-color: #000 !important;
              z-index: 9999 !important;
              display: block !important;
            `;
            document.body.appendChild(scannerDiv);
            console.log('✅ Created scanner div:', scannerId, 'Dimensions:', scannerDiv.offsetWidth, 'x', scannerDiv.offsetHeight);

            // Wait a moment for the div to be fully in the DOM
            await new Promise(resolve => setTimeout(resolve, 200));

            try {
              const html5QrCode = new Html5Qrcode(scannerId);
              html5QrCodeRef.current = html5QrCode;

              console.log('🔄 Starting camera with element:', scannerId);
              
              // Try to get available cameras first
              const cameras = await Html5Qrcode.getCameras();
              console.log('📷 Available cameras:', cameras.length);
              
              // Use the first available camera, or environment-facing if available
              const cameraId = cameras.find((cam: any) => cam.label?.toLowerCase().includes('back') || cam.label?.toLowerCase().includes('rear'))?.id || cameras[0]?.id;
              
              await html5QrCode.start(
                cameraId || { facingMode: 'environment' },
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
                  // Ignore common scanning errors
                  if (!errorMessage.includes('NotFoundException') && 
                      !errorMessage.includes('No MultiFormat Readers') &&
                      !errorMessage.includes('QR code parse error') &&
                      !errorMessage.includes('No QR code found')) {
                    console.log('Scanner message:', errorMessage);
                  }
                }
              );
              console.log('✅ Scanner started successfully!');
              setHasPermission(true);
            } catch (err: any) {
              console.error('❌ Error starting scanner:', err);
              console.error('Error details:', {
                name: err.name,
                message: err.message,
                code: err.code,
                stack: err.stack?.substring(0, 300)
              });
              setHasPermission(false);
              
              // Remove the div on error
              const errorDiv = document.getElementById(scannerId);
              if (errorDiv) {
                errorDiv.remove();
              }
              
              if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('permission')) {
                Alert.alert(
                  'Camera Permission Required',
                  'Please allow camera access in your browser settings. Look for a camera icon in the address bar.',
                  [{ text: 'OK' }]
                );
              } else if (err.message?.includes('element') || err.message?.includes('container') || err.message?.includes('not found')) {
                Alert.alert(
                  'Scanner Error',
                  'Failed to initialize scanner. Please try again.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Camera Error', `Failed to start camera: ${err.message || 'Unknown error'}`);
              }
            }
          };

          // Initialize immediately
          createAndInitScanner();
        } catch (err: any) {
          console.error('Error loading html5-qrcode:', err);
          setHasPermission(false);
          Alert.alert('Scanner Error', 'Failed to load barcode scanner library.');
        } finally {
          setIsInitializing(false);
        }
  }, [scannerId, isInitializing, handleBarcodeScanned]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Only auto-init on desktop, require user gesture on mobile
      if (typeof window !== 'undefined') {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) {
          initWebScanner();
        } else {
          // On mobile, wait for user interaction
          setHasPermission(null);
        }
      }

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
  }, [scannerId, retryKey, initWebScanner]);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={{ marginBottom: 20, textAlign: 'center', padding: 20, fontSize: 16, color: '#fff' }}>
          {Platform.OS === 'web' 
            ? 'Click the button below to start the camera scanner.'
            : 'Requesting camera permission...'}
        </Text>
        {Platform.OS === 'web' && (
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Button 
              title={isInitializing ? "Starting Camera..." : "Start Camera Scanner"} 
              onPress={initWebScanner}
              disabled={isInitializing}
            />
          </View>
        )}
      </View>
    );
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
