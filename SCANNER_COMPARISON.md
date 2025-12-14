# Mobile vs Web Scanner - Why Mobile is Better

## The Technical Difference

### Mobile Scanner (expo-camera)
- Uses **native iOS/Android camera APIs**
- Hardware-accelerated barcode detection
- Direct access to camera hardware
- Better autofocus control (native system handles it)
- Processes at hardware level (very fast)
- Uses device's built-in barcode detection if available

### Web Scanner (Quagga2)
- Uses **JavaScript-based image processing**
- Processes video frames in JavaScript (slower)
- Browser limitations on camera control
- Autofocus handled by browser (less control)
- Software-based barcode detection (more CPU intensive)
- Limited by browser's getUserMedia API capabilities

## Why Web Scanner Feels Worse

1. **Performance**: Native APIs are optimized and use hardware acceleration. JavaScript processing is slower.

2. **Autofocus**: Native camera APIs have better autofocus control. Web browsers have limited control over focus behavior.

3. **Detection Speed**: Native APIs can detect barcodes faster because they're closer to the hardware.

4. **Camera Control**: Web has less direct control over camera settings compared to native APIs.

## Focus Blur Issue on Web

When pointing at a barcode close-up:
- The camera struggles with **macro/close-up focus**
- Barcodes are flat surfaces, making it harder for autofocus to "lock on"
- Normal text at medium distance focuses fine (different focus distance)
- This is a limitation of web browser camera APIs - less control over focus behavior

**Solution**: We use `focusMode: "continuous"` which helps, but web browsers still have limited focus control compared to native apps.

## Recommendations

For best experience:
- Use mobile app version when possible (better performance and focus)
- For web: Hold barcode at medium distance (not too close, not too far) - let autofocus work
- Good lighting helps autofocus work better on web