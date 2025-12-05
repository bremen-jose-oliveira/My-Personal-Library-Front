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

                    // Request camera permission and start scanning
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
                    Alert.alert('Camera Error', 'Failed to access camera. Please ensure you have granted camera permissions.');
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
    }, [scannerId]);

    if (hasPermission === null) {
      return <Text>Requesting for camera permission...</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera. Please enable camera access in your device settings.</Text>;
    }

    if (Platform.OS === 'web') {
      // For web, we need to render a div element that html5-qrcode can attach to
      return (
        <View style={styles.container} ref={containerRef}>
          {/* @ts-ignore - Web-specific HTML element */}
          <div 
            id={scannerId}
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'relative'
            }}
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
