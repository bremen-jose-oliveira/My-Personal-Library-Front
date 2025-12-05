import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Button, Alert, Platform } from "react-native";
import { Camera, CameraView } from "expo-camera";

interface BarcodeScannerProps {
  onISBNScanned?: (isbn: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onISBNScanned }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const quaggaRef = useRef<any>(null);
  const scannerElementRef = useRef<HTMLDivElement | null>(null);

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
      return (
        /^\d{9}(\d|X)$/.test(cleaned) || /^(978|979)\d{9}(\d|X)$/.test(cleaned)
      );
    };

    const cleanedData = data.replace(/[^0-9X]/g, "");

    if (isISBN(cleanedData)) {
      console.log(`Valid ISBN: ${cleanedData}`);
      if (onISBNScanned) {
        onISBNScanned(cleanedData);
      } else {
        Alert.alert("ISBN Scanned", `ISBN: ${cleanedData}`);
      }
    } else {
      Alert.alert("Unrecognized Barcode", `Type: ${type}, Data: ${data}`, [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
    }
  };

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
          scannerDiv.style.width = "100%";
          scannerDiv.style.height = "100%";
          scannerDiv.style.position = "absolute";
          scannerDiv.style.top = "0";
          scannerDiv.style.left = "0";
          scannerDiv.style.zIndex = "1000";
          scannerDiv.style.backgroundColor = "#000";

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

          // Initialize Quagga2
          Quagga.init(
            {
              inputStream: {
                name: "Live",
                type: "LiveStream",
                target: scannerDiv,
                constraints: {
                  width: 1280,
                  height: 720,
                  facingMode: "environment", // Use back camera by default
                },
              },
              decoder: {
                readers: [
                  "ean_reader",
                  "ean_8_reader",
                  "code_128_reader",
                  "code_39_reader",
                  "upc_reader",
                  "upc_e_reader",
                ],
              },
              locate: true,
              locator: {
                halfSample: true,
                patchSize: "medium",
              },
              numOfWorkers: 2,
              frequency: 10,
            },
            (err: Error | null) => {
              if (err) {
                console.error("Quagga initialization error:", err);
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

              if (isMounted) {
                Quagga.start();
                setHasPermission(true);
                quaggaRef.current = Quagga;
              }
            }
          );

          // Handle detected barcodes
          Quagga.onDetected((result: any) => {
            if (isMounted && result?.codeResult) {
              handleBarcodeScanned({
                type: result.codeResult.format || "unknown",
                data: result.codeResult.code,
              });
            }
          });
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
        <Text style={styles.text}>
          Camera is active. Point at a barcode to scan.
        </Text>
        {scanned && (
          <View style={styles.buttonContainer}>
            <Button
              title="Tap to Scan Again"
              onPress={() => {
                setScanned(false);
                if (quaggaRef.current) {
                  quaggaRef.current.resume();
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
          barcodeTypes: ["ean13", "ean8", "pdf417", "qr"],
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
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    zIndex: 10,
  },
});

export default BarcodeScanner;
