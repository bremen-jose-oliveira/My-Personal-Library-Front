  import React, { useEffect, useState, useRef } from 'react';
  import { View, Text, StyleSheet, Button, Alert, Platform } from 'react-native';
  import { Camera, CameraView } from 'expo-camera';

  interface BarcodeScannerProps {
    onISBNScanned?: (isbn: string) => void; // Make the prop optional
  }

  const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onISBNScanned }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const html5QrCodeRef = useRef<any>(null);
    const containerRef = useRef<View>(null);
    const [scannerId] = useState(() => `html5qr-scanner-${Date.now()}`);
    const [retryKey, setRetryKey] = useState(0); // Key to force re-initialization

    const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
      if (scanned) return; // Prevent scanning multiple times
      setScanned(true);

      // Check if the scanned barcode is an ISBN
      const isISBN = (data: string) => {
        // Remove any non-digit characters except X for ISBN-10
        const cleaned = data.replace(/[^0-9X]/g, '');
        return /^\d{9}(\d|X)$/.test(cleaned) || // ISBN-10
              /^(978|979)\d{9}(\d|X)$/.test(cleaned); // ISBN-13
      };

      const cleanedData = data.replace(/[^0-9X]/g, '');

      if (isISBN(cleanedData)) {
        console.log(`Valid ISBN: ${cleanedData}`);
        if (onISBNScanned) {  // Check if the function is defined
          onISBNScanned(cleanedData); // Call the function if it's defined
        } else {
          Alert.alert('ISBN Scanned', `ISBN: ${cleanedData}`); // Fallback action
        }
      } else {
        Alert.alert('Unrecognized Barcode', `Type: ${type}, Data: ${data}`, [
          { text: 'OK', onPress: () => setScanned(false) },
        ]);
      }
    };

    useEffect(() => {
      if (Platform.OS === 'web') {
        // Web implementation using html5-qrcode
        const initWebScanner = async () => {
          try {
            // First, explicitly request camera permissions
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
              });
              // Stop the stream immediately - we just needed permission
              stream.getTracks().forEach(track => track.stop());
              console.log('✅ Camera permission granted');
            } catch (permErr: any) {
              console.error('Camera permission denied:', permErr);
              setHasPermission(false);
              if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
                Alert.alert(
                  'Camera Permission Required',
                  'Please allow camera access in your browser settings to use the barcode scanner. Click the camera icon in your browser\'s address bar to grant permission.',
                  [{ text: 'OK' }]
                );
              } else {
                Alert.alert('Camera Error', 'Failed to access camera. Please check your browser settings.');
              }
              return;
            }

            const { Html5Qrcode } = await import('html5-qrcode');
            
            // Wait for DOM to be ready and find the element
            const findAndInitScanner = async () => {
              // Try multiple times to find the element
              let attempts = 0;
              const maxAttempts = 20;
              
              const tryInit = async () => {
                // Try to find element by ID in document
                const element = document.getElementById(scannerId);
                
                if (element) {
                  try {
                    const html5QrCode = new Html5Qrcode(scannerId);
                    html5QrCodeRef.current = html5QrCode;

                    // Start scanning (permission already granted)
                    await html5QrCode.start(
                      { facingMode: 'environment' }, // Use back camera on mobile devices
                      {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                      },
                      (decodedText: string, decodedResult: any) => {
                        handleBarcodeScanned({ 
                          type: decodedResult?.result?.format?.formatName || 'unknown', 
                          data: decodedText 
                        });
                      },
                      (errorMessage: string) => {
                        // Ignore errors, just keep scanning
                      }
                    );
                    setHasPermission(true);
                    return true;
                  } catch (err: any) {
                    console.error('Error starting scanner:', err);
                    setHasPermission(false);
                    if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
                      Alert.alert(
                        'Camera Permission Required',
                        'Please allow camera access in your browser settings. Click the camera icon in your browser\'s address bar to grant permission.',
                        [{ text: 'OK' }]
                      );
                    } else {
                      Alert.alert('Camera Error', 'Failed to start camera. Please try again.');
                    }
                    return false;
                  }
                }
                return false;
              };
              
              while (attempts < maxAttempts) {
                const success = await tryInit();
                if (success) return;
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 100));
              }
              
              setHasPermission(false);
              Alert.alert('Scanner Error', 'Failed to initialize scanner container. Please try again.');
            };
            
            // Wait a bit for the DOM to be ready
            setTimeout(findAndInitScanner, 300);
          } catch (err: any) {
            console.error('Error loading html5-qrcode:', err);
            setHasPermission(false);
            Alert.alert('Scanner Error', 'Failed to load barcode scanner library.');
          }
        };

        initWebScanner();

        // Cleanup function
        return () => {
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch((err: any) => {
              console.error('Error stopping scanner:', err);
            });
            html5QrCodeRef.current.clear();
          }
        };
      } else {
        // Native implementation using expo-camera
        const getCameraPermissions = async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          setHasPermission(status === 'granted');
        };

        getCameraPermissions();
      }
    }, [scannerId, retryKey]); // Add retryKey to dependencies to re-run on retry

    if (hasPermission === null) {
      return <Text>Requesting for camera permission...</Text>;
    }
    if (hasPermission === false) {
      return (
        <View style={styles.container}>
          <Text style={{ marginBottom: 20, textAlign: 'center', padding: 20, fontSize: 16 }}>
            {Platform.OS === 'web' 
              ? 'Camera access is required to scan barcodes. Please allow camera permissions in your browser settings.'
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
                    setHasPermission(null); // Reset to trigger re-initialization
                    setRetryKey(prev => prev + 1); // Force re-initialization
                  } catch (err: any) {
                    console.error('Permission request failed:', err);
                    Alert.alert(
                      'Permission Denied',
                      'Please click the camera icon (🔒 or 📷) in your browser\'s address bar to grant camera permission, then click "Request Camera Permission" again.',
                      [{ text: 'OK' }]
                    );
                  }
                }} 
              />
              <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', paddingHorizontal: 20, marginTop: 10 }}>
                Tip: Look for a camera icon in your browser's address bar and click it to allow camera access.
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (Platform.OS === 'web') {
      // For web, we need to render a container that html5-qrcode can attach to
      // Use View with nativeID which React Native Web converts to an HTML element with that ID
      return (
        <View style={styles.container} ref={containerRef}>
          <View
            nativeID={scannerId}
            style={styles.webScannerContainer}
          />
          {scanned && (
            <View style={styles.buttonContainer}>
              <Button title={"Tap to Scan Again"} onPress={() => {
                setScanned(false);
                // Restart scanning
                if (html5QrCodeRef.current) {
                  html5QrCodeRef.current.resume();
                }
              }} />
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
            barcodeTypes: ['ean13', 'ean8', 'pdf417', 'qr'], // Include formats relevant to your needs
          }}
        />
        {scanned && (
          <View style={styles.buttonContainer}>
            <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
          </View>
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
    webScannerContainer: {
      width: '100%',
      height: '100%',
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      zIndex: 10,
    },
  });

  export default BarcodeScanner;
