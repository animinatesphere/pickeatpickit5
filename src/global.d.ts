
export {};

/* eslint-disable @typescript-eslint/no-explicit-any */
// Temporary global declaration to satisfy TypeScript until @types/google.maps is installed
declare global {
  namespace google {
    namespace maps {
      // Minimal placeholders used in this project. Install @types/google.maps for full typing.
      export class Map {
        constructor(el: HTMLElement, opts?: any);
        panTo(_latLng: any): void;
        setZoom(_zoom: number): void;
        fitBounds(_bounds: any): void;
      }

      export class Marker {
        constructor(opts?: any);
        setMap(_map: any | null): void;
      }

      export class Polyline {
        constructor(opts?: any);
        setMap(_map: any | null): void;
      }

      export class LatLngBounds {
        constructor();
        extend(_latLng: any): void;
      }

      export const SymbolPath: any;
    }
  }

  interface Window {
    google: any;
    gm_authFailure?: () => void;
  }
}
