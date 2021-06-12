import { RedisClient } from "redis";

import redis from "redis";

const redis_host = process.env.REDIS_HOST || "127.0.0.1";

class CacheService {
  protected client: RedisClient;

  public constructor() {
    this.client = redis.createClient({
      host: redis_host,
    });

    this.client.on("error", (error) => {
      console.warn(error);
    });
  }

  public async hasKey(key: string) {
    const vm = this;
    return new Promise((res, rej) => {
      vm.client.get(key, (err, data) => {
        res(data !== null && data !== "" && data.length !== 0);
      });
    });
  }

  public async get(key: string) {
    const vm = this;
    return new Promise((res, rej) => {
      vm.client.get(key, (err, data: any) => {
        // console.log(key, ":", data);
        if (data !== null) {
          res(JSON.parse(data));
        } else {
          res(null);
        }
      });
    });
  }

  public async set(key: string, data: any) {
    const vm = this;
    const serialized = JSON.stringify(data);

    return new Promise((res, rej) => {
      vm.client.set(key, serialized, (err, success) => {
        res(success);
      });
    });
  }

  public async clear(key: string) {
    const vm = this;
    return new Promise((res, rej) => {
      vm.client.set(key, "", (err, success) => {
        res(success);
      });
    });
  }
}

export default new CacheService();
