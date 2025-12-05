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
            const { Html5Qrcode } = await import('html5-qrcode');
            
            // Wait for DOM to be ready and find the element
            const findAndInitScanner = async () => {
              // Try multiple times to find the element
              let attempts = 0;
              const maxAttempts = 30; // Increased attempts for mobile
              
              const tryInit = async () => {
                // Try multiple ways to find the element
                let element = document.getElementById(scannerId);
                
                // If not found by ID, try to find by nativeID attribute (React Native Web)
                if (!element && containerRef.current) {
                  // @ts-ignore - accessing React Native Web internals
                  const reactInstance = containerRef.current._internalFiberInstanceHandleDEV || 
                                       containerRef.current._reactInternalFiber;
                  if (reactInstance) {
                    // Try to find child with nativeID
                    const allElements = document.querySelectorAll(`[data-nativeid="${scannerId}"], [nativeid="${scannerId}"]`);
                    if (allElements.length > 0) {
                      element = allElements[0] as HTMLElement;
                      // Set the ID so html5-qrcode can find it
                      if (element && !element.id) {
                        element.id = scannerId;
                      }
                    }
                  }
                }
                
                // Also try to find by searching all elements with the nativeID
                if (!element) {
                  const elementsByNativeId = document.querySelectorAll(`[data-nativeid="${scannerId}"]`);
                  if (elementsByNativeId.length > 0) {
                    element = elementsByNativeId[0] as HTMLElement;
                    if (element && !element.id) {
                      element.id = scannerId;
                    }
                  }
                }
                
                if (element) {
                  console.log('✅ Found scanner element:', element.id || scannerId);
                  try {
                    // Ensure element has an ID for html5-qrcode
                    if (!element.id) {
                      element.id = scannerId;
                    }
                    
                    const html5QrCode = new Html5Qrcode(scannerId);
                    html5QrCodeRef.current = html5QrCode;

                    console.log('🔄 Starting camera...');
                    // Request camera permission and start scanning
                    // html5-qrcode will handle the permission request
                    await html5QrCode.start(
                      { facingMode: 'environment' }, // Use back camera on mobile devices
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
                        // Ignore scanning errors (they're normal while scanning)
                        // Only log if it's not a common scanning error
                        if (!errorMessage.includes('NotFoundException') && 
                            !errorMessage.includes('No MultiFormat Readers')) {
                          console.log('Scanner message:', errorMessage);
                        }
                      }
                    );
                    console.log('✅ Scanner started successfully');
                    setHasPermission(true);
                    return true;
                  } catch (err: any) {
                    console.error('❌ Error starting scanner:', err);
                    console.error('Error details:', {
                      name: err.name,
                      message: err.message,
                      stack: err.stack
                    });
                    setHasPermission(false);
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('permission')) {
                      Alert.alert(
                        'Camera Permission Required',
                        'Please allow camera access in your browser settings. Click the camera icon in your browser\'s address bar to grant permission.',
                        [{ text: 'OK' }]
                      );
                    } else if (err.message?.includes('element') || err.message?.includes('container')) {
                      console.log('⚠️ Element issue, will retry...');
                      return false; // Retry if element issue
                    } else {
                      Alert.alert('Camera Error', `Failed to start camera: ${err.message || 'Unknown error'}. Please try again.`);
                    }
                    return false;
                  }
                } else {
                  console.log(`⏳ Element not found yet (attempt ${attempts + 1}/${maxAttempts})`);
                }
                return false;
              };
              
              while (attempts < maxAttempts) {
                const success = await tryInit();
                if (success) return;
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 150)); // Slightly longer delay
              }
              
              console.error('❌ Failed to find scanner element after', maxAttempts, 'attempts');
              setHasPermission(false);
              Alert.alert(
                'Scanner Error', 
                'Failed to initialize scanner container. Please close and reopen the scanner.',
                [{ text: 'OK' }]
              );
            };
            
            // Wait longer for mobile browsers - they need more time to render
            const delay = 500; // Increased delay for mobile
            setTimeout(findAndInitScanner, delay);
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
      // Use useEffect to ensure the element has the correct ID after render
      React.useEffect(() => {
        // Find the element by nativeID and ensure it has an ID
        const findAndSetId = () => {
          // Try multiple ways to find the element
          let element = document.getElementById(scannerId);
          
          if (!element) {
            // Try to find by data-nativeid or nativeid attribute
            const byNativeId = document.querySelector(`[data-nativeid="${scannerId}"], [nativeid="${scannerId}"]`);
            if (byNativeId) {
              element = byNativeId as HTMLElement;
            }
          }
          
          // If still not found, search in the container
          if (!element && containerRef.current) {
            // @ts-ignore - React Native Web internal
            const containerElement = containerRef.current;
            if (containerElement) {
              const children = containerElement.querySelectorAll('*');
              for (const child of children) {
                const htmlChild = child as HTMLElement;
                if (htmlChild.getAttribute('data-nativeid') === scannerId || 
                    htmlChild.getAttribute('nativeid') === scannerId) {
                  element = htmlChild;
                  break;
                }
              }
            }
          }
          
          // Ensure element has the ID
          if (element && !element.id) {
            element.id = scannerId;
            console.log('✅ Set element ID to:', scannerId);
          }
        };
        
        // Try immediately and also after a delay
        findAndSetId();
        const timer = setTimeout(findAndSetId, 100);
        const timer2 = setTimeout(findAndSetId, 500);
        
        return () => {
          clearTimeout(timer);
          clearTimeout(timer2);
        };
      }, [scannerId]);
      
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
