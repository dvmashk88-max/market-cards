type Entry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

export class AsyncTtlCache {
  private readonly entries = new Map<string, Entry<unknown>>();

  async get<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = this.entries.get(key) as Entry<T> | undefined;
    if (existing && existing.expiresAt > now) return existing.value;

    const value = load();
    this.entries.set(key, { expiresAt: now + ttlMs, value });

    try {
      return await value;
    } catch (error) {
      this.entries.delete(key);
      throw error;
    }
  }

  clear(): void {
    this.entries.clear();
  }
}
