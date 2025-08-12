// Mock implementation of Vercel KV for local testing
class MockKV {
  private data: Map<string, any> = new Map();
  
  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    this.data.set(key, { value, expiry: options?.ex ? Date.now() + (options.ex * 1000) : null });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const item = this.data.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.data.delete(key);
      return null;
    }
    return item.value;
  }
  
  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + 1;
    await this.set(key, newValue);
    return newValue;
  }
  
  async incrby(key: string, increment: number): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + increment;
    await this.set(key, newValue);
    return newValue;
  }
  
  async expire(key: string, seconds: number): Promise<void> {
    const item = this.data.get(key);
    if (item) {
      item.expiry = Date.now() + (seconds * 1000);
      this.data.set(key, item);
    }
  }
  
  pipeline() {
    const operations: Array<() => Promise<any>> = [];
    
    return {
      set: (key: string, value: any, options?: { ex?: number }) => {
        operations.push(() => this.set(key, value, options));
        return this;
      },
      get: (key: string) => {
        operations.push(() => this.get(key));
        return this;
      },
      incr: (key: string) => {
        operations.push(() => this.incr(key));
        return this;
      },
      incrby: (key: string, increment: number) => {
        operations.push(() => this.incrby(key, increment));
        return this;
      },
      expire: (key: string, seconds: number) => {
        operations.push(() => this.expire(key, seconds));
        return this;
      },
      exec: async () => {
        const results = [];
        for (const op of operations) {
          try {
            results.push(await op());
          } catch (error) {
            results.push(error);
          }
        }
        return results;
      }
    };
  }
}

const mockKV = new MockKV();

export const kv = process.env.NODE_ENV === 'development' && !process.env.KV_REST_API_URL 
  ? mockKV 
  : require('@vercel/kv').kv;