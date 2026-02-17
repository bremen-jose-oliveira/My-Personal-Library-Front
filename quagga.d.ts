declare module 'quagga' {
    export type QuaggaConfig = {
      inputStream: {
        type: string;
        constraints?: {
          width?: number;
          height?: number;
          facingMode?: 'user' | 'environment';
        };
        target?: string | HTMLElement;
      };
      decoder: {
        readers: string[];
      };
      locate?: boolean;
    };
  
    export type QuaggaResult = {
      codeResult: {
        code: string;
        format: string;
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
      onDetected(callback: (result: QuaggaResult) => void): void;
      offDetected(callback?: (result: QuaggaResult) => void): void;
    };
  
    export default Quagga;
  }
  