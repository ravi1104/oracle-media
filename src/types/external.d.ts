declare module 'uuid' {
  export function v4(): string;
}

declare module 'oracledb' {
  export const OUT_FORMAT_OBJECT: number;
  export let outFormat: number;
  export interface Pool {
    getConnection(): Promise<Connection>;
    close(timeout?: number): Promise<void>;
  }
  export interface Connection {
    execute(statement: string, binds?: Record<string, unknown>, options?: Record<string, unknown>): Promise<unknown>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
    ping(): Promise<void>;
  }
  export function createPool(config: Record<string, unknown>): Promise<Pool>;
}
