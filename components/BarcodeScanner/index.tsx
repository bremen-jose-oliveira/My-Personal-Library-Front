import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Platform,
  Animated,
} from "react-native";
import { Camera, CameraView } from "expo-camera";

interface BarcodeScannerProps {
  onISBNScanned?: (isbn: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onISBNScanned }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanningStatus, setScanningStatus] =
    useState<string>("Initializing...");
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const quaggaRef = useRef<any>(null);
  const scannerElementRef = useRef<HTMLDivElement | null>(null);
  const overlayElementRef = useRef<HTMLDivElement | null>(null);
  const scanningLineAnim = useRef(new Animated.Value(0)).current;

  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;
    setScanned(true);

    // Pause scanning when a barcode is detected
    if (Platform.OS === "web" && quaggaRef.current) {
      try {
        quaggaRef.current.pause();
      } catch (e) {
        console.error("Error pausing Quagga:", e);
      }
    }

    const isISBN = (data: string) => {
      const cleaned = data.replace(/[^0-9X]/g, "");

      // ISBN-10: 10 digits (9 digits + 1 check digit which can be X)
      const isbn10Pattern = /^\d{9}[\dX]$/;

      // ISBN-13: 13 digits starting with 978 or 979 (EAN-13 format for books)
      const isbn13Pattern = /^(978|979)\d{10}$/;

      // Also accept any 13-digit EAN code (might be a valid ISBN-13)
      const ean13Pattern = /^\d{13}$/;

      // Also accept any 10-digit code (might be ISBN-10)
      const tenDigitPattern = /^\d{10}$/;

      return (
        isbn10Pattern.test(cleaned) ||
        isbn13Pattern.test(cleaned) ||
        ean13Pattern.test(cleaned) ||
        tenDigitPattern.test(cleaned)
      );
    };

    const cleanedData = data.replace(/[^0-9X]/g, "");

    if (isISBN(cleanedData)) {
      console.log(`Valid ISBN/EAN detected: ${cleanedData} (Type: ${type})`);
      if (onISBNScanned) {
        onISBNScanned(cleanedData);
      } else {
        Alert.alert("ISBN Scanned", `ISBN: ${cleanedData}`);
      }
    } else {
      // Show what was scanned to help debug
      console.warn(
        `Unrecognized barcode - Type: ${type}, Data: ${data}, Cleaned: ${cleanedData}`
      );
      Alert.alert(
        "Unrecognized Barcode",
        `Type: ${type}\nData: ${data}\n\nThis doesn't appear to be a valid ISBN. Please try scanning again or enter manually.`,
        [{ text: "OK", onPress: () => setScanned(false) }]
      );
    }
  };

  // Animate scanning line for mobile
  useEffect(() => {
    if (Platform.OS !== "web" && hasPermission && !scanned) {
      scanningLineAnim.setValue(0); // Reset to top
      const animate = Animated.loop(
        Animated.sequence([
          Animated.timing(scanningLineAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanningLineAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animate.start();
      return () => animate.stop();
    }
  }, [hasPermission, scanned, scanningLineAnim]);

  useEffect(() => {
    if (Platform.OS === "web") {
      let isMounted = true;

      const initScanner = async () => {
        // Only try to load Quagga2 if we're in a browser environment
        if (typeof window === "undefined" || typeof document === "undefined") {
          if (isMounted) {
            setHasPermission(false);
          }
          return;
        }

        // Add immediate debug message
        setDebugMessages(["🔵 Starting scanner initialization..."]);
        console.log("🔵 Starting scanner initialization...");

        try {
          // Dynamic import with better error handling - use a try-catch to prevent build failures
          let Quagga;
          try {
            // Use dynamic import that won't break static export
            // Wrap in a function to ensure it's truly lazy-loaded
            const loadQuagga = () => import("@ericblade/quagga2");
            const quaggaModule = await loadQuagga().catch((e) => {
              console.warn("Quagga2 import failed, scanner will not work:", e);
              return null;
            });

            if (!quaggaModule) {
              throw new Error("Quagga2 module not available");
            }

            Quagga = quaggaModule.default || quaggaModule;

            // Additional check to ensure Quagga is properly loaded
            if (!Quagga) {
              throw new Error("Quagga2 default export not found");
            }
            
            // Debug: Quagga loaded
            setDebugMessages((prev) => [...prev, "✅ Quagga2 module loaded"]);
            console.log("✅ Quagga2 module loaded", Quagga);
          } catch (importError: any) {
            console.error("Failed to import Quagga2:", importError);
            if (isMounted) {
              setHasPermission(false);
              // Don't show alert during build/SSR - only in browser
              if (typeof window !== "undefined") {
                Alert.alert(
                  "Scanner Error",
                  "Barcode scanner is not available. Please try again later or use manual entry."
                );
              }
            }
            return;
          }

          if (!Quagga || typeof Quagga.init !== "function") {
            throw new Error("Quagga2 library is not properly loaded");
          }

          // Create a container div for the scanner
          const scannerDiv = document.createElement("div");
          scannerDiv.id = "quagga-scanner";
          scannerDiv.style.width = "100vw";
          scannerDiv.style.height = "100vh";
          scannerDiv.style.position = "fixed";
          scannerDiv.style.top = "0";
          scannerDiv.style.left = "0";
          scannerDiv.style.zIndex = "9999"; // Lower z-index so overlay can be above
          scannerDiv.style.backgroundColor = "#000";
          scannerDiv.style.overflow = "hidden";

          // Ensure Quagga2 canvas elements are visible
          // Quagga2 will create canvas elements for video and drawing overlay
          scannerDiv.style.display = "block";

          // Find or create container
          let container = document.getElementById("scanner-container");
          if (!container) {
            container = document.createElement("div");
            container.id = "scanner-container";
            container.style.width = "100vw";
            container.style.height = "100vh";
            container.style.position = "fixed";
            container.style.top = "0";
            container.style.left = "0";
            container.style.zIndex = "9999";
            document.body.appendChild(container);
          }

          container.appendChild(scannerDiv);
          scannerElementRef.current = scannerDiv;
          
          // Debug: Container created
          setDebugMessages((prev) => [...prev, "✅ Scanner container created"]);
          console.log("✅ Scanner container created");

          // Set up detection callback BEFORE initialization
          const detectionHandler = (result: any) => {
            const msg = `onDetected called: ${JSON.stringify(result?.codeResult?.code || "no code")}`;
            console.log(msg);
            setDebugMessages((prev) => [...prev.slice(-4), msg]); // Keep last 5 messages
            
            if (isMounted && result) {
              // Check different possible result structures
              const codeResult = result.codeResult || result;
              console.log("Code result:", codeResult);
              if (codeResult && codeResult.code) {
                console.log("Processing barcode:", codeResult.code);
                if (isMounted) {
                  setScanningStatus(`Detected: ${codeResult.code}`);
                  setDebugMessages((prev) => [...prev.slice(-4), `✅ Processing: ${codeResult.code}`]);
                }
                handleBarcodeScanned({
                  type: codeResult.format || "unknown",
                  data: codeResult.code,
                });
              } else {
                console.warn("No code found in result:", codeResult);
                setDebugMessages((prev) => [...prev.slice(-4), "⚠️ No code in result"]);
              }
            } else {
              console.warn("Handler called but isMounted:", isMounted, "result:", result);
            }
          };

          // Initialize Quagga2
          Quagga.init(
            {
              inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerDiv,
                constraints: {
                  // Use reasonable constraints for mobile devices
                  width: { ideal: 1280, min: 640 },
                  height: { ideal: 720, min: 480 },
                  facingMode: "environment", // Use back camera by default
                  // Enable autofocus to prevent blur when getting close
                  focusMode: "continuous",
                  advanced: [
                    {
                      focusMode: "continuous",
                    },
                  ],
                } as any,
              },
              decoder: {
                readers: [
                  "ean_reader", // EAN-13 for ISBN (most common for books)
                  "ean_8_reader",
                  "code_128_reader",
                  "code_39_reader",
                  "upc_reader",
                  "upc_e_reader",
                ],
              },
              locate: true,
              locator: {
                halfSample: false, // Use full sample for better accuracy
                patchSize: "large", // Larger patch size for better EAN detection
                showBoundingBox: true,
                showPatches: false,
                showFoundPatches: false,
                showSkeleton: false,
                showLabels: false,
                showPatchLabels: false,
              },
              numOfWorkers: 0, // Use 0 workers for more reliable detection on mobile
              frequency: 10, // Lower frequency for better accuracy
              // Enable visual debugging - shows the red scanning line
              debug: {
                drawBoundingBox: true,
                showFrequency: false,
                drawScanline: true, // This shows the red scanning line
                showPattern: false,
              },
            },
            (err: Error | null) => {
              console.log("🔵 Quagga.init callback called, err:", err);
              
              if (err) {
                console.error("Quagga initialization error:", err);
                const errorMsg = "❌ Init error: " + (err.message || err.toString());
                setDebugMessages((prev) => [...prev, errorMsg]);
                if (isMounted) {
                  setHasPermission(false);
                  if (
                    err.name === "NotAllowedError" ||
                    err.name === "PermissionDeniedError"
                  ) {
                    Alert.alert(
                      "Camera Permission Required",
                      "Please allow camera access in your browser settings."
                    );
                  } else {
                    Alert.alert(
                      "Camera Error",
                      err.message || "Failed to start camera"
                    );
                  }
                }
                return;
              }
              
              // Add initialization success message
              console.log("✅ Quagga initialized successfully");
              setDebugMessages((prev) => [...prev, "✅ Quagga initialized successfully"]);

              if (isMounted) {
                // Create overlay with scanning frame and red line
                const overlay = document.createElement("div");
                overlay.id = "scanner-overlay-web";
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100vw";
                overlay.style.height = "100vh";
                overlay.style.zIndex = "10001"; // Above Quagga scanner (z-index 10000)
                overlay.style.pointerEvents = "none";
                overlay.style.display = "flex";
                overlay.style.justifyContent = "center";
                overlay.style.alignItems = "center";
                overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                
                const frame = document.createElement("div");
                frame.style.width = "80%";
                frame.style.maxWidth = "400px";
                frame.style.aspectRatio = "1";
                frame.style.border = "3px solid white";
                frame.style.borderRadius = "10px";
                frame.style.position = "relative";
                frame.style.display = "flex";
                frame.style.justifyContent = "center";
                frame.style.alignItems = "center";
                
                const line = document.createElement("div");
                line.style.position = "absolute";
                line.style.width = "100%";
                line.style.height = "4px";
                line.style.backgroundColor = "#FF0000";
                line.style.zIndex = "10002";
                line.style.boxShadow = "0 0 15px #FF0000, 0 0 30px #FF0000";
                
                const text = document.createElement("div");
                text.style.color = "#FF0000";
                text.style.fontSize = "16px";
                text.style.fontWeight = "bold";
                text.style.marginTop = "100px";
                text.style.zIndex = "10002";
                text.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
                text.textContent = "Point camera at barcode";
                
                frame.appendChild(line);
                frame.appendChild(text);
                overlay.appendChild(frame);
                document.body.appendChild(overlay);
                overlayElementRef.current = overlay;

                // Set up callbacks BEFORE starting (more reliable)
                console.log("🔵 Setting up callbacks...");
                setDebugMessages((prev) => [...prev, "🔵 Setting up callbacks..."]);
                
                // Use the existing detectionHandler that was defined above
                Quagga.onDetected(detectionHandler);
                console.log("✅ onDetected callback registered");

                // Track frame processing with debounce
                let lastDetectedCode = "";
                let lastDetectionTime = 0;
                let frameCount = 0;

                // Also listen for processed frames - this fires more reliably than onDetected
                Quagga.onProcessed((result: any) => {
                  if (!isMounted) return;
                  
                  frameCount++;
                  
                  // Update status every 30 frames to show it's working
                  if (frameCount % 30 === 0 && isMounted) {
                    setScanningStatus("Scanning... Point at barcode");
                  }

                  // Log every 50 frames for debugging (more frequent)
                  if (frameCount % 50 === 0) {
                    const msg = `🔄 Frames: ${frameCount}`;
                    console.log(msg);
                    if (isMounted) {
                      setDebugMessages((prev) => {
                        const newMsgs = [...prev.slice(-4), msg];
                        return newMsgs;
                      });
                    }
                  }

                  // Check for detected codes in processed frames
                  if (result && result.codeResult && result.codeResult.code) {
                    const codeResult = result.codeResult;
                    const code = codeResult.code;
                    console.log("🔍 onProcessed found code:", code);
                    
                    if (code && isMounted) {
                      setDebugMessages((prev) => [...prev.slice(-4), `🔍 Found: ${code}`]);
                    }
                    
                    const now = Date.now();

                    // Debounce: only process if it's a different code or 2 seconds have passed
                    if (
                      code &&
                      (code !== lastDetectedCode ||
                        now - lastDetectionTime > 2000)
                    ) {
                      console.log("✅ Processing detected code:", code);
                      if (isMounted) {
                        setScanningStatus(`Found: ${code}`);
                        setDebugMessages((prev) => [...prev.slice(-4), `✅ Processing: ${code}`]);
                      }

                      lastDetectedCode = code;
                      lastDetectionTime = now;

                      // Use the same handler as onDetected
                      handleBarcodeScanned({
                        type: codeResult.format || "unknown",
                        data: code,
                      });
                    }
                  }
                });
                
                console.log("✅ onProcessed callback registered");

                // Start Quagga AFTER setting up callbacks
                console.log("🔵 Starting Quagga...");
                setDebugMessages((prev) => [...prev, "🔵 Starting Quagga..."]);
                Quagga.start();
                console.log("✅ Quagga.start() called");
                
                // Set state after a short delay to ensure Quagga is started
                setTimeout(() => {
                  console.log("🔵 Setting final state after delay...");
                  if (isMounted) {
                    setHasPermission(true);
                    quaggaRef.current = Quagga;
                    setScanningStatus("Ready - Point at barcode");
                    setDebugMessages((prev) => {
                      const newMsgs = [...prev.slice(-4), "🚀 Quagga started - scanning..."];
                      console.log("✅ Final debug messages:", newMsgs);
                      return newMsgs;
                    });
                  }
                }, 500);
              }
            }
          );
        } catch (err: any) {
          console.error("Scanner error:", err);
          if (isMounted) {
            setHasPermission(false);
            const errorMessage =
              err?.message || err?.toString() || "Failed to initialize scanner";
            console.error("Full error details:", err);
            Alert.alert(
              "Camera Error",
              `Scanner initialization failed: ${errorMessage}. Please ensure you're using HTTPS or localhost.`
            );
          }
        }
      };

      // Small delay to ensure DOM is ready - only if we're in browser
      if (typeof window !== "undefined") {
        const timer = setTimeout(() => {
          initScanner().catch((err) => {
            console.error("Scanner initialization error:", err);
            if (isMounted) {
              setHasPermission(false);
            }
          });
        }, 300);

        return () => {
          isMounted = false;
          clearTimeout(timer);
          if (quaggaRef.current) {
            try {
              quaggaRef.current.offDetected();
              quaggaRef.current.stop();
            } catch (e) {
              console.error("Error stopping Quagga:", e);
            }
          }
          if (overlayElementRef.current?.parentNode) {
            overlayElementRef.current.parentNode.removeChild(overlayElementRef.current);
          }
          if (scannerElementRef.current?.parentNode) {
            scannerElementRef.current.parentNode.removeChild(
              scannerElementRef.current
            );
          }
          const container = document.getElementById("scanner-container");
          if (container) {
            container.remove();
          }
        };
      } else {
        // SSR/build time - just set permission to false
        if (isMounted) {
          setHasPermission(false);
        }
        return () => {
          isMounted = false;
        };
      }
    } else {
      const getCameraPermissions = async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
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
          {Platform.OS === "web"
            ? "Camera access is required. Please allow camera permissions in your browser settings."
            : "No access to camera. Please enable camera access in your device settings."}
        </Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        {/* The Quagga2 scanner is rendered in a div appended to body */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{scanningStatus}</Text>
          <Text style={{ color: "#fff", fontSize: 10, marginTop: 5, opacity: 0.7 }}>
            Scanner v2.12 - Aggressive Debug + Better Config
          </Text>
          {/* Debug messages displayed on screen - always show to verify it's rendering */}
          <View style={{ marginTop: 10, backgroundColor: "rgba(0,0,0,0.7)", padding: 8, borderRadius: 4, minHeight: 80 }}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "bold", marginBottom: 4 }}>
              Debug Log ({debugMessages.length} messages):
            </Text>
            {debugMessages.length > 0 ? (
              debugMessages.map((msg, idx) => (
                <Text key={idx} style={{ color: "#0f0", fontSize: 9, marginTop: 2, fontFamily: "monospace" }}>
                  {msg}
                </Text>
              ))
            ) : (
              <Text style={{ color: "#f90", fontSize: 9, fontStyle: "italic" }}>
                Waiting for Quagga to initialize...
              </Text>
            )}
          </View>
        </View>
        {/* Overlay is created as DOM element in useEffect above */}
        {scanned && (
          <View style={styles.buttonContainer}>
            <Button
              title="Tap to Scan Again"
              onPress={() => {
                setScanned(false);
                setScanningStatus("Ready - Point at barcode");
                if (quaggaRef.current) {
                  try {
                    quaggaRef.current.resume();
                  } catch (e) {
                    // If resume fails, try restarting
                    if (quaggaRef.current.stop) {
                      quaggaRef.current.stop();
                    }
                    if (quaggaRef.current.start) {
                      quaggaRef.current.start();
                    }
                  }
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
          barcodeTypes: [
            "ean13",
            "ean8",
            "upc_a",
            "upc_e",
            "code128",
            "code39",
            "pdf417",
            "qr",
          ],
        }}
      />
      {/* Scanning line overlay */}
      {!scanned && (
        <View style={styles.scanningOverlay}>
          <View style={styles.scanningFrame}>
            <Animated.View
              style={[
                styles.scanningLine,
                {
                  transform: [
                    {
                      translateY: scanningLineAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 300], // Moves from top to bottom of frame
                      }),
                    },
                  ],
                },
              ]}
            />
          </View>
        </View>
      )}
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
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    textAlign: "center",
    padding: 20,
  },
  statusContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10001,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  statusText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    zIndex: 10001,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scanningFrame: {
    width: "80%",
    aspectRatio: 1,
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 10,
    position: "relative",
    overflow: "hidden",
  },
  scanningLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#FF0000",
    shadowColor: "#FF0000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default BarcodeScanner;
