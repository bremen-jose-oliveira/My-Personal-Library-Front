  import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
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
                // Simply find element by ID - useLayoutEffect should have created it
                const element = document.getElementById(scannerId);
                
                if (element) {
                  console.log('✅ Found scanner element with ID:', scannerId);
                  console.log('Element details:', {
                    id: element.id,
                    parent: element.parentElement?.tagName,
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                    display: window.getComputedStyle(element).display
                  });
                  
                  try {
                    const html5QrCode = new Html5Qrcode(scannerId);
                    html5QrCodeRef.current = html5QrCode;

                    console.log('🔄 Starting camera...');
                    // Request camera permission and start scanning
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
                        if (!errorMessage.includes('NotFoundException') && 
                            !errorMessage.includes('No MultiFormat Readers') &&
                            !errorMessage.includes('QR code parse error')) {
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
                      code: err.code
                    });
                    setHasPermission(false);
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message?.includes('permission')) {
                      Alert.alert(
                        'Camera Permission Required',
                        'Please allow camera access in your browser settings. Click the camera icon in your browser\'s address bar to grant permission.',
                        [{ text: 'OK' }]
                      );
                    } else if (err.message?.includes('element') || err.message?.includes('container') || err.message?.includes('not found')) {
                      console.log('⚠️ Element issue, will retry...');
                      return false; // Retry if element issue
                    } else {
                      Alert.alert('Camera Error', `Failed to start camera: ${err.message || 'Unknown error'}. Please try again.`);
                    }
                    return false;
                  }
                } else {
                  console.log(`⏳ Element with ID "${scannerId}" not found yet (attempt ${attempts + 1}/${maxAttempts})`);
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
            
            // Wait for useLayoutEffect to create the div, then initialize
            // useLayoutEffect runs synchronously, but we still need a small delay
            // to ensure the DOM is fully ready
            const delay = 200; // Small delay to ensure DOM is ready
            setTimeout(findAndInitScanner, delay);
            
            // Also try after a longer delay as fallback for slower devices
            setTimeout(() => {
              if (hasPermission === null) {
                console.log('🔄 Retrying scanner initialization after longer delay...');
                findAndInitScanner();
              }
            }, 1000);
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
      // Use useLayoutEffect to create the div synchronously before paint
      useLayoutEffect(() => {
        // Create the scanner div directly in the document
        let scannerDiv = document.getElementById(scannerId);
        if (!scannerDiv) {
          scannerDiv = document.createElement('div');
          scannerDiv.id = scannerId;
          scannerDiv.style.width = '100%';
          scannerDiv.style.height = '100%';
          scannerDiv.style.position = 'relative';
          scannerDiv.style.minHeight = '400px';
          scannerDiv.style.display = 'block';
          scannerDiv.style.backgroundColor = '#000'; // Black background for camera
          
          // Function to find and append to container
          const findAndAppend = () => {
            if (containerRef.current) {
              // @ts-ignore - React Native Web internals
              const domNode = containerRef.current._internalFiberInstanceHandleDEV?.stateNode?.node ||
                           containerRef.current._reactInternalFiber?.stateNode?.node;
              
              // Also try querySelector if the ref is a DOM element
              const containerElement = (domNode && typeof domNode === 'object' && 'appendChild' in domNode) 
                ? domNode 
                : (containerRef.current as any)?.querySelector 
                  ? containerRef.current 
                  : null;
              
              if (containerElement && containerElement.appendChild) {
                containerElement.appendChild(scannerDiv!);
                console.log('✅ Created and appended scanner div with ID:', scannerId);
                return true;
              }
            }
            return false;
          };
          
          // Try immediately
          if (!findAndAppend()) {
            // If container not ready, try multiple times
            let attempts = 0;
            const maxAttempts = 10;
            const interval = setInterval(() => {
              attempts++;
              if (findAndAppend() || attempts >= maxAttempts) {
                clearInterval(interval);
                if (attempts >= maxAttempts && !document.getElementById(scannerId)?.parentElement) {
                  console.warn('⚠️ Could not find container, appending to body as fallback');
                  document.body.appendChild(scannerDiv!);
                }
              }
            }, 50);
          }
        }
        
        return () => {
          const element = document.getElementById(scannerId);
          if (element && element.parentNode) {
            element.parentNode.removeChild(element);
          }
        };
      }, [scannerId]);
      
      return (
        <View style={styles.container} ref={containerRef}>
          {/* The scanner div will be created by useLayoutEffect and appended to container */}
          <View style={styles.webScannerContainer} />
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
