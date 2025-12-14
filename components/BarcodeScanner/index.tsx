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
  onClose?: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onISBNScanned, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanningStatus, setScanningStatus] =
    useState<string>("Initializing...");
  const [debugMessages, setDebugMessages] = useState<string[]>([]);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const flashlightStateRef = useRef(false); // Use ref to track flashlight state for button handlers
  const quaggaRef = useRef<any>(null);
  const scannerElementRef = useRef<HTMLDivElement | null>(null);
  const overlayElementRef = useRef<HTMLDivElement | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const scanningLineAnim = useRef(new Animated.Value(0)).current;

  // Toggle flashlight/torch for web scanner
  const toggleFlashlight = async () => {
    if (!videoTrackRef.current) {
      console.warn("Cannot toggle flashlight - video track not available");
      return;
    }
    
    // Use ref to get current state (more reliable than state variable in closure)
    const currentState = flashlightStateRef.current;
    const newState = !currentState;
    const track = videoTrackRef.current;
    
    console.log(`Attempting to turn flashlight ${newState ? "ON" : "OFF"}... Current state: ${currentState}`);
    
    try {
      // Try the standard way (works on Chrome/Edge Android)
      await track.applyConstraints({
        advanced: [{ torch: newState }] as any,
      });
      
      // Update ref and state
      flashlightStateRef.current = newState;
      setFlashlightOn(newState);
      console.log(`✅ Flashlight ${newState ? "ON" : "OFF"}`);
      
      // Update button immediately
      const flashBtn = document.getElementById("scanner-flash-button");
      if (flashBtn) {
        flashBtn.textContent = newState ? "🔦 ON" : "💡 OFF";
        flashBtn.style.backgroundColor = newState ? "#FFD700" : "#666";
      }
    } catch (e1: any) {
      console.log("Method 1 failed, trying method 2:", e1.message);
      
      // Try direct constraint
      try {
        await track.applyConstraints({ torch: newState } as any);
        flashlightStateRef.current = newState;
        setFlashlightOn(newState);
        console.log(`✅ Flashlight ${newState ? "ON" : "OFF"} (method 2)`);
        
        const flashBtn = document.getElementById("scanner-flash-button");
        if (flashBtn) {
          flashBtn.textContent = newState ? "🔦 ON" : "💡 OFF";
          flashBtn.style.backgroundColor = newState ? "#FFD700" : "#666";
        }
      } catch (e2: any) {
        console.error("Flashlight toggle failed:", e2.message);
      }
    }
  };

  const handleBarcodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    // Prevent multiple detections of the same barcode
    if (scanned) {
      console.log("Already scanned, ignoring duplicate detection");
      return;
    }
    setScanned(true);
    console.log("Barcode scanned, setting scanned=true:", data);

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
      // IMPORTANT: Scanning happens FIRST, Google API is called AFTER
      // If Google API fails, scanning still succeeded - we have the ISBN
      if (onISBNScanned) {
        // Pass the ISBN immediately - don't wait for Google API
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
            // Prevent processing if already scanned
            if (scanned) {
              console.log("Already scanned, ignoring onDetected");
              return;
            }
            
            const msg = `onDetected: ${JSON.stringify(result?.codeResult?.code || "no code")}`;
            console.log(msg);
            setDebugMessages((prev) => [...prev.slice(-4), msg]); // Keep last 5 messages
            
            if (isMounted && result && !scanned) {
              // Check different possible result structures
              const codeResult = result.codeResult || result;
              if (codeResult && codeResult.code) {
                const code = codeResult.code;
                console.log("✅ onDetected processing barcode:", code);
                if (isMounted && !scanned) {
                  setScanningStatus(`Detected: ${code}`);
                  setDebugMessages((prev) => [...prev.slice(-4), `✅ Processing: ${code}`]);
                  
                  // Call handler directly
                  handleBarcodeScanned({
                    type: codeResult.format || "unknown",
                    data: code,
                  });
                }
              } else {
                console.warn("No code found in result:", codeResult);
              }
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
                  // Higher quality for iPhone 15 - use best available
                  width: { ideal: 1920, min: 1280 }, // Higher for better quality on modern phones
                  height: { ideal: 1080, min: 720 }, // Higher for better quality
                  facingMode: "environment", // Use back camera by default
                  // Enable continuous autofocus for better close-up scanning
                  // Without this, some devices struggle with macro/close-up focus
                  focusMode: "continuous",
                } as any,
              },
              decoder: {
                readers: [
                  "ean_reader", // EAN-13 for ISBN (most common for books)
                  "ean_8_reader", // EAN-8 (shorter variant)
                  "upc_reader", // UPC-A (common for books)
                  "upc_e_reader", // UPC-E (compressed UPC)
                  "code_128_reader", // Code 128 (sometimes used for ISBN)
                  "code_39_reader", // Code 39 (less common but sometimes used)
                ],
              },
              locate: true,
              locator: {
                halfSample: false, // Use full sample for better accuracy
                patchSize: "large", // Large patch size - balanced for most barcodes
                showBoundingBox: false, // Disable for performance
                showPatches: false,
                showFoundPatches: false,
                showSkeleton: false,
                showLabels: false,
                showPatchLabels: false,
              },
              numOfWorkers: 0, // Use 0 workers for better consistency
              frequency: 10, // Standard frequency for detection
              // Increase area to scan entire view, not just center
              area: {
                top: "0%",
                right: "0%",
                left: "0%",
                bottom: "0%"
              },
              // Disable visual debugging to improve performance
              debug: {
                drawBoundingBox: false, // Disable to reduce render load
                showFrequency: false,
                drawScanline: false, // We have our own red line overlay
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
                // Create overlay with scanning frame and red line - properly centered
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
                overlay.style.alignItems = "center"; // Center vertically and horizontally
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
                frame.style.margin = "0 auto"; // Ensure centered
                
                const line = document.createElement("div");
                line.style.position = "absolute";
                line.style.width = "100%";
                line.style.height = "2px";
                line.style.backgroundColor = "#FF0000";
                line.style.zIndex = "10002";
                line.style.boxShadow = "0 0 10px #FF0000, 0 0 20px #FF0000";
                line.style.top = "50%"; // Center the red line vertically in the frame
                line.style.transform = "translateY(-50%)"; // Perfectly center it
                
                const text = document.createElement("div");
                text.style.color = "#FF0000";
                text.style.fontSize = "16px";
                text.style.fontWeight = "bold";
                text.style.position = "absolute";
                text.style.bottom = "20px"; // Position text at bottom of frame, not below it
                text.style.left = "50%";
                text.style.transform = "translateX(-50%)"; // Center horizontally
                text.style.zIndex = "10002";
                text.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
                text.style.whiteSpace = "nowrap";
                text.textContent = "Point camera at barcode";
                
                // Create Close Scanner button as DOM element (above overlay)
                const closeButton = document.createElement("button");
                closeButton.id = "scanner-close-button";
                closeButton.textContent = "Close Scanner";
                closeButton.style.position = "fixed";
                closeButton.style.top = "20px";
                closeButton.style.left = "20px";
                closeButton.style.zIndex = "10003"; // Above overlay (10001)
                closeButton.style.padding = "10px 20px";
                closeButton.style.backgroundColor = "#bf471b";
                closeButton.style.color = "#fff";
                closeButton.style.border = "none";
                closeButton.style.borderRadius = "5px";
                closeButton.style.fontSize = "16px";
                closeButton.style.fontWeight = "bold";
                closeButton.style.cursor = "pointer";
                closeButton.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";
                closeButton.onclick = () => {
                  if (onClose) {
                    onClose();
                  }
                };
                document.body.appendChild(closeButton);
                
                // Create Flashlight button as DOM element (above overlay)
                const createFlashButton = () => {
                  // Remove existing button if any
                  const existing = document.getElementById("scanner-flash-button");
                  if (existing) existing.remove();
                  
                  const flashButton = document.createElement("button");
                  flashButton.id = "scanner-flash-button";
                  flashButton.textContent = flashlightOn ? "🔦 ON" : "💡 OFF";
                  flashButton.style.position = "fixed";
                  flashButton.style.top = "20px";
                  flashButton.style.right = "20px";
                  flashButton.style.zIndex = "10003"; // Above overlay
                  flashButton.style.padding = "10px 20px";
                  flashButton.style.backgroundColor = flashlightOn ? "#FFD700" : "#666";
                  flashButton.style.color = "#fff";
                  flashButton.style.border = "none";
                  flashButton.style.borderRadius = "5px";
                  flashButton.style.fontSize = "16px";
                  flashButton.style.fontWeight = "bold";
                  flashButton.style.cursor = "pointer";
                  flashButton.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";
                  // Store reference to toggle function in a way that works with closures
                  flashButton.onclick = () => {
                    toggleFlashlight();
                  };
                  document.body.appendChild(flashButton);
                };
                
                if (torchSupported || Platform.OS === "web") {
                  createFlashButton();
                }
                
                frame.appendChild(line);
                frame.appendChild(text);
                overlay.appendChild(frame);
                document.body.appendChild(overlay);
                overlayElementRef.current = overlay;

                // Start Quagga first
                console.log("🔵 Starting Quagga...");
                setDebugMessages((prev) => [...prev, "🔵 Starting Quagga..."]);
                Quagga.start();
                console.log("✅ Quagga.start() called");

                // Set up callbacks AFTER starting (some Quagga versions need this)
                setTimeout(() => {
                  console.log("🔵 Setting up callbacks...");
                  setDebugMessages((prev) => [...prev, "🔵 Setting up callbacks..."]);
                  
                  // Use the existing detectionHandler that was defined above
                  Quagga.onDetected(detectionHandler);
                  console.log("✅ onDetected callback registered");

                  // Track frame processing with debounce - reset these when component remounts or scanner restarts
                  let lastDetectedCode = "";
                  let lastDetectionTime = 0;
                  let frameCount = 0;
                  
                  // Expose function to reset detection tracking (for "Scan Again")
                  (window as any).__resetScannerTracking = () => {
                    lastDetectedCode = "";
                    lastDetectionTime = 0;
                    frameCount = 0;
                  };

                  // Also listen for processed frames - this fires more reliably than onDetected
                  Quagga.onProcessed((result: any) => {
                    if (!isMounted) return;
                    
                    frameCount++;
                    
                    // Update status every 30 frames to show it's working
                    if (frameCount % 30 === 0 && isMounted) {
                      setScanningStatus("Scanning... Point at barcode");
                    }

                    // Log frame count more frequently to verify it's working (every 50 frames)
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

                    // Check for detected codes in processed frames - log ALL detections
                    if (result && result.codeResult && result.codeResult.code) {
                      const codeResult = result.codeResult;
                      const code = codeResult.code;
                      
                      // Log ALL code detections to debug
                      console.log(`🔍 onProcessed detected code: ${code} (format: ${codeResult.format || "unknown"})`);
                      
                      if (code && isMounted && !scanned) {
                        const now = Date.now();

                        // More lenient debouncing: process if different code OR if enough time passed
                        const timeSinceLastDetection = now - lastDetectionTime;
                        const isDifferentCode = code !== lastDetectedCode;
                        const enoughTimePassed = timeSinceLastDetection > 800; // Reduced to 800ms for faster response
                        
                        // Process if: different code, enough time passed, OR we haven't detected anything in a while
                        if (isDifferentCode || enoughTimePassed || timeSinceLastDetection > 2500) {
                          console.log(`✅✅✅ PROCESSING CODE: ${code} (different: ${isDifferentCode}, time: ${timeSinceLastDetection}ms, scanned: ${scanned})`);
                          if (isMounted && !scanned) {
                            setScanningStatus(`Found: ${code}`);
                            setDebugMessages((prev) => [...prev.slice(-4), `✅ Processing: ${code}`]);

                            lastDetectedCode = code;
                            lastDetectionTime = now;

                            // Use the same handler as onDetected
                            handleBarcodeScanned({
                              type: codeResult.format || "unknown",
                              data: code,
                            });
                          } else {
                            console.warn(`❌ Not processing - isMounted: ${isMounted}, scanned: ${scanned}`);
                          }
                        } else {
                          console.log(`⏸️ Skipping duplicate detection: ${code} (last: ${lastDetectedCode}, time: ${timeSinceLastDetection}ms)`);
                        }
                      }
                    }
                  });
                  
                  console.log("✅ onProcessed callback registered");
                }, 500); // Wait 500ms after start to set up callbacks
                
                // Try to get video track for flashlight control and focus adjustment
                setTimeout(async () => {
                  try {
                    // Get video element created by Quagga
                    const videoElement = scannerDiv.querySelector('video') as HTMLVideoElement;
                    if (videoElement && videoElement.srcObject) {
                      const stream = videoElement.srcObject as MediaStream;
                      const videoTrack = stream.getVideoTracks()[0];
                      if (videoTrack) {
                        videoTrackRef.current = videoTrack;
                        
                        // Try to improve focus for close-up barcode scanning
                        try {
                          const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : ({} as any);
                          // If focusDistance is supported, we could set it, but most phones handle this automatically
                          // The key is to use continuous autofocus which we set in constraints
                          console.log("Video track capabilities:", capabilities);
                        } catch (focusError) {
                          console.log("Could not check focus capabilities:", focusError);
                        }
                        
                        // Check if torch is supported - try multiple methods
                        try {
                          const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : ({} as any);
                          const settings = videoTrack.getSettings ? videoTrack.getSettings() : ({} as any);
                          
                          // Check for torch in capabilities or try applying it to detect support
                          if (capabilities.torch !== undefined || settings.torch !== undefined || 
                              (capabilities as any).advanced?.some((adv: any) => adv.torch)) {
                            setTorchSupported(true);
                            console.log("✅ Torch/flashlight supported (via capabilities)");
                          } else {
                            // On mobile browsers, torch might be supported even if not in capabilities
                            // Try to detect if we're on a mobile device
                            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                            if (isMobile) {
                              // Assume torch is available on mobile devices
                              setTorchSupported(true);
                              console.log("✅ Assuming torch supported on mobile device");
                            } else {
                              console.log("ℹ️ Torch not detected - may not be supported");
                            }
                          }
                        } catch (capError) {
                          console.warn("Error checking torch capabilities:", capError);
                          // On mobile, assume torch might work anyway
                          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                          if (isMobile) {
                            setTorchSupported(true);
                            console.log("✅ Assuming torch supported on mobile (fallback)");
                          }
                        }
                      }
                    }
                  } catch (e) {
                    console.warn("Could not access video track for torch:", e);
                    // Fallback: if mobile device, show button anyway
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    if (isMobile) {
                      setTorchSupported(true);
                      console.log("✅ Showing torch button on mobile (fallback)");
                    }
                  }
                }, 1000);
                
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
          // Remove close button
          const closeBtn = document.getElementById("scanner-close-button");
          if (closeBtn) {
            closeBtn.remove();
          }
          // Remove flashlight button
          const flashBtn = document.getElementById("scanner-flash-button");
          if (flashBtn) {
            flashBtn.remove();
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
            Scanner v2.28 - Continuous Focus Mode for Close-Up
          </Text>
          {/* Debug messages displayed on screen - always show to verify it's rendering */}
          <View style={{ marginTop: 10, backgroundColor: "rgba(0,0,0,0.8)", padding: 10, borderRadius: 4, minHeight: 100, maxHeight: 200 }}>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold", marginBottom: 6 }}>
              Debug Log ({debugMessages.length} messages):
            </Text>
            <View style={{ maxHeight: 150, overflow: "scroll" }}>
              {debugMessages.length > 0 ? (
                debugMessages.map((msg, idx) => (
                  <Text key={idx} style={{ color: "#0f0", fontSize: 9, marginTop: 2, fontFamily: "monospace" }}>
                    {msg}
                  </Text>
                ))
              ) : (
                <Text style={{ color: "#f90", fontSize: 9, fontStyle: "italic" }}>
                  Waiting for Quagga to initialize... (Scanner is working even if messages don't show)
                </Text>
              )}
            </View>
          </View>
        </View>
        {/* Flashlight toggle button as DOM element - position at top right */}
        {(torchSupported || Platform.OS === "web") && (
          <View style={{ display: "none" }}>
            {/* Hidden View - actual button created as DOM element in useEffect */}
          </View>
        )}
        {/* Overlay is created as DOM element in useEffect above */}
        {scanned && (
          <View style={styles.buttonContainer}>
            <Button
              title="Tap to Scan Again"
              onPress={() => {
                console.log("Resetting scanner for new scan...");
                setScanned(false);
                setScanningStatus("Ready - Point at barcode");
                // Reset detection tracking
                if ((window as any).__resetScannerTracking) {
                  (window as any).__resetScannerTracking();
                }
                if (quaggaRef.current) {
                  try {
                    quaggaRef.current.resume();
                  } catch (e) {
                    // If resume fails, try restarting
                    try {
                      if (quaggaRef.current.stop) {
                        quaggaRef.current.stop();
                      }
                      // Small delay before restart
                      setTimeout(() => {
                        if (quaggaRef.current && quaggaRef.current.start) {
                          quaggaRef.current.start();
                        }
                      }, 100);
                    } catch (e2) {
                      console.error("Error restarting scanner:", e2);
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
