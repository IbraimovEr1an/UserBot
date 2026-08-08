type RecordType = Record<string, string>;

class CloudTelegram {
  setItem(key: string, value: string): Promise<boolean> {
    return new Promise((res, rej) => {
      window.Telegram?.WebApp?.CloudStorage.setItem(key, value, (e, s) =>
        e ? rej(e) : res(s || false),
      );
    });
  }

  async setItems(items: RecordType): Promise<void> {
    await Promise.all(
      Object.entries(items).map(([key, value]) => this.setItem(key, value)),
    );
  }

  getItems(keys: string[]): Promise<RecordType> {
    return new Promise((res, rej) => {
      window.Telegram?.WebApp?.CloudStorage.getItems(keys, (e, v) =>
        e ? rej(e) : res(v || {}),
      );
    });
  }

  removeItem(key: string): Promise<boolean> {
    return new Promise((res, rej) => {
      window.Telegram?.WebApp?.CloudStorage.removeItem(key, (e, s) =>
        e ? rej(e) : res(s || false),
      );
    });
  }

  removeItems(keys: string[]): Promise<boolean> {
    return new Promise((res, rej) => {
      window.Telegram?.WebApp?.CloudStorage.removeItems(keys, (e, s) =>
        e ? rej(e) : res(s || false),
      );
    });
  }
}

export default new CloudTelegram();
