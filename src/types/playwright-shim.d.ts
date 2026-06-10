declare module '@playwright/test' {
  export type Page = any;
  export type BrowserContext = any;
  export const devices: any;
  export function defineConfig(cfg: any): any;
  export const expect: any;
  export const test: {
    (name: string, fn: (args: { page?: Page; context?: BrowserContext }) => Promise<any>): void;
    describe(name: string, fn: () => void): void;
    info(): { annotations: Array<any> };
    beforeEach(fn: (args: { page?: Page; context?: BrowserContext }) => Promise<any>): void;
    afterEach(fn: (args: { page?: Page; context?: BrowserContext }) => Promise<any>): void;
  };
}

declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
