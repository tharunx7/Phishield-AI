/// <reference types="vite/client" />

declare namespace chrome {
  export namespace storage {
    export interface StorageChange {
      oldValue?: any;
      newValue?: any;
    }
    export const local: any;
    export const sync: any;
    export const managed: any;
    export namespace onChanged {
      export function addListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
      export function removeListener(callback: (changes: { [key: string]: StorageChange }, areaName: string) => void): void;
    }
  }
}
declare const chrome: any;
