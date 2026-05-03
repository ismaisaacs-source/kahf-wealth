declare module "@nestjs/common" {
  type AnyDecorator = (...args: any[]) => any;
  export function Controller(_path?: string): AnyDecorator;
  export function Get(_path?: string): AnyDecorator;
  export function Post(_path?: string): AnyDecorator;
  export function Put(_path?: string): AnyDecorator;
  export function Body(): AnyDecorator;
  export function Param(_name?: string): AnyDecorator;
  export function Injectable(): AnyDecorator;
  export function Module(_metadata: {
    imports?: unknown[];
    controllers?: unknown[];
    providers?: unknown[];
    exports?: unknown[];
  }): AnyDecorator;
}

declare module "@nestjs/core" {
  export class NestFactory {
    static create(module: unknown): Promise<{
      setGlobalPrefix(prefix: string): void;
      listen(port: number): Promise<void>;
    }>;
  }
}
