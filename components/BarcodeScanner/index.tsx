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
                // Find element by ID
                let element = document.getElementById(scannerId);
                
                // If not found, try to create it as a fallback
                if (!element) {
                  console.log(`⚠️ Element "${scannerId}" not found, attempting to create it...`);
                  // Try to find the container and create the div
                  const container = document.querySelector('[data-testid="scanner-container"]') || 
                                  containerRef.current || 
                                  document.body;
                  
                  if (container && (container.appendChild || (container as any).appendChild)) {
                    element = document.createElement('div');
                    element.id = scannerId;
                    element.style.cssText = `
                      width: 100vw;
                      height: 100vh;
                      min-width: 100%;
                      min-height: 100%;
                      position: fixed;
                      top: 0;
                      left: 0;
                      background-color: #000;
                      display: block;
                      z-index: 1;
                    `;
                    try {
                      (container as HTMLElement).appendChild(element);
                      console.log('✅ Created scanner div as fallback');
                    } catch (e) {
                      console.error('Failed to append div:', e);
                    }
                  }
                }
                
                if (element) {
                  console.log('✅ Found scanner element with ID:', scannerId);
                  
                  // Force proper dimensions for mobile
                  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                  
                  element.style.cssText = `
                    width: ${viewportWidth}px;
                    height: ${viewportHeight}px;
                    min-width: 100%;
                    min-height: 100%;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background-color: #000;
                    display: block;
                    z-index: 1;
                  `;
                  
                  console.log('Element details:', {
                    id: element.id,
                    parent: element.parentElement?.tagName || element.parentNode?.nodeName,
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                    viewportWidth,
                    viewportHeight,
                    display: window.getComputedStyle(element).display,
                    visible: element.offsetWidth > 0 && element.offsetHeight > 0
                  });
                  
                  // Ensure element is visible
                  if (element.offsetWidth === 0 || element.offsetHeight === 0) {
                    console.warn('⚠️ Element has zero dimensions, forcing viewport size...');
                    element.style.width = `${viewportWidth}px`;
                    element.style.height = `${viewportHeight}px`;
                    element.style.position = 'fixed';
                    element.style.top = '0';
                    element.style.left = '0';
                    element.style.display = 'block';
                    element.style.zIndex = '1';
                  }
                  
                  try {
                    const html5QrCode = new Html5Qrcode(scannerId);
                    html5QrCodeRef.current = html5QrCode;

                    console.log('🔄 Starting camera with element:', scannerId);
                    console.log('Camera constraints:', { facingMode: 'environment' });
                    
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
                    console.log('✅ Scanner started successfully!');
                    setHasPermission(true);
                    return true;
                  } catch (err: any) {
                    console.error('❌ Error starting scanner:', err);
                    console.error('Error details:', {
                      name: err.name,
                      message: err.message,
                      code: err.code,
                      stack: err.stack?.substring(0, 200)
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
                      const errorMsg = err.message || 'Unknown error';
                      console.error('Camera error:', errorMsg);
                      Alert.alert('Camera Error', `Failed to start camera: ${errorMsg}. Please try again.`);
                    }
                    return false;
                  }
                } else {
                  console.log(`⏳ Element with ID "${scannerId}" not found yet (attempt ${attempts + 1}/${maxAttempts})`);
                  // Log all divs for debugging
                  if (attempts === 0) {
                    const allDivs = Array.from(document.querySelectorAll('div')).slice(0, 10);
                    console.log('First 10 divs in document:', allDivs.map(d => ({ id: d.id, className: d.className })));
                  }
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
            
            // Start immediately and retry multiple times
            // The ref callback should create the div, but we need to wait for it
            findAndInitScanner();
            
            // Retry with increasing delays to ensure the div is created
            setTimeout(() => {
              if (hasPermission === null) {
                console.log('🔄 Retrying scanner initialization (300ms)...');
                findAndInitScanner();
              }
            }, 300);
            
            setTimeout(() => {
              if (hasPermission === null) {
                console.log('🔄 Retrying scanner initialization (800ms)...');
                findAndInitScanner();
              }
            }, 800);
            
            setTimeout(() => {
              if (hasPermission === null) {
                console.log('🔄 Retrying scanner initialization (1500ms)...');
                findAndInitScanner();
              }
            }, 1500);
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
      // Use a ref callback to get the actual DOM element and create the scanner div
      const containerRefCallback = (node: any) => {
        if (node) {
          containerRef.current = node;
          
          // Get the actual DOM element from React Native Web
          // @ts-ignore - React Native Web internals
          const domNode = node._internalFiberInstanceHandleDEV?.stateNode?.node ||
                         node._reactInternalFiber?.stateNode?.node ||
                         (node.querySelector ? node : null);
          
          if (domNode) {
            // Create or find the scanner div
            let scannerDiv = document.getElementById(scannerId);
            if (!scannerDiv) {
              scannerDiv = document.createElement('div');
              scannerDiv.id = scannerId;
              // Use viewport units for mobile compatibility
              scannerDiv.style.cssText = `
                width: 100vw;
                height: 100vh;
                min-width: 100%;
                min-height: 100%;
                position: fixed;
                top: 0;
                left: 0;
                background-color: #000;
                display: block;
                z-index: 1;
              `;
              domNode.appendChild(scannerDiv);
              console.log('✅ Created scanner div with ID:', scannerId, 'in container');
            } else {
              // Update existing div styles to ensure visibility
              scannerDiv.style.cssText = `
                width: 100vw;
                height: 100vh;
                min-width: 100%;
                min-height: 100%;
                position: fixed;
                top: 0;
                left: 0;
                background-color: #000;
                display: block;
                z-index: 1;
              `;
            }
          } else {
            // Fallback: try to find by querying the document
            setTimeout(() => {
              let scannerDiv = document.getElementById(scannerId);
              if (!scannerDiv) {
                scannerDiv = document.createElement('div');
                scannerDiv.id = scannerId;
                scannerDiv.style.cssText = `
                  width: 100vw;
                  height: 100vh;
                  min-width: 100%;
                  min-height: 100%;
                  position: fixed;
                  top: 0;
                  left: 0;
                  background-color: #000;
                  display: block;
                  z-index: 1;
                `;
                // Try to find the container in the DOM
                const containerElement = document.querySelector('[data-testid="scanner-container"]') || 
                                        document.body;
                containerElement.appendChild(scannerDiv);
                console.log('✅ Created scanner div with ID:', scannerId, 'as fallback');
              }
            }, 100);
          }
        }
      };
      
      return (
        <View 
          style={styles.container} 
          ref={containerRefCallback}
          // @ts-ignore - Web-only test ID
          testID="scanner-container"
        >
          {/* The scanner div will be created by the ref callback */}
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
      width: '100%',
      height: '100%',
      backgroundColor: '#000', // Black background for camera
    },
    webScannerContainer: {
      width: '100%',
      height: '100%',
      flex: 1,
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      zIndex: 10,
    },
  });

  export default BarcodeScanner;
