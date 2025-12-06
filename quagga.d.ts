declare module "@ericblade/quagga2" {
  export type QuaggaConfig = {
    inputStream: {
      name?: string;
      type: "LiveStream" | "ImageStream";
      target?: string | HTMLElement;
      constraints?: {
        width?: number;
        height?: number;
        facingMode?: "user" | "environment";
      };
    };
    decoder: {
      readers: string[];
    };
    locate?: boolean;
    locator?: {
      halfSample?: boolean;
      patchSize?: "x-small" | "small" | "medium" | "large" | "x-large";
      showCanvas?: boolean;
      showPatches?: boolean;
      showFoundPatches?: boolean;
      showSkeleton?: boolean;
      showLabels?: boolean;
      showPatchLabels?: boolean;
      showBoundingBox?: boolean;
      boxFromPatches?: {
        showTransformed?: boolean;
        showTransformedBox?: boolean;
        showBB?: boolean;
      };
    };
    numOfWorkers?: number;
    frequency?: number;
    debug?: {
      drawBoundingBox?: boolean;
      showFrequency?: boolean;
      drawScanline?: boolean;
      showPattern?: boolean;
    };
  };

  export type QuaggaResult = {
    codeResult: {
      code: string;
      format: string;
      decodedCodes?: Array<{
        code: number;
        error?: number;
      }>;
    };
  };

  export type QuaggaError = Error;

  const Quagga: {
    init(
      config: QuaggaConfig,
      callback: (err: QuaggaError | null) => void
    ): void;
    start(): void;
    stop(): void;
    pause(): void;
    resume(): void;
    onDetected(callback: (result: QuaggaResult) => void): void;
    offDetected(callback?: (result: QuaggaResult) => void): void;
    onProcessed(callback: (result: any) => void): void;
    offProcessed(callback?: (result: any) => void): void;
  };

  export default Quagga;
}
