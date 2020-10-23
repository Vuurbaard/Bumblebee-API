import { RedisClient } from "redis";

import redis from 'redis';
import { json } from "body-parser";


const { promisify } = require("util");

const redis_host = process.env.REDIS_HOST || '127.0.0.1';


class CacheService {
	protected client: RedisClient;

	public constructor() { 
		console.log(process.env);
		this.client = redis.createClient({
			'host': redis_host
		})

		this.client.on('error', (error) => {
			console.warn(error);
		})
	}

	public async hasKey(key: string) {
		let vm = this;
		return new Promise((res, rej) => {
			vm.client.get(key, (err, data) => {
				res(data !== null && data !== '');
			});
		})
	}

	public async get(key: string) {
		let vm = this;
		return new Promise((res, rej) => {
			vm.client.get(key, (err, data: any) => {
				if(data !== null){
					res(JSON.parse(data));
				} else {
					res(null);
				}

			});
		})
	}

	public async set(key: string, data: any) {
		let vm = this;
		let serialized = JSON.stringify(data);

		return new Promise((res, rej) => {
			vm.client.set(key,serialized, (err, success) => {
				res(success);
			});
		})
	}

	public async clear(key: string) {
		let vm = this;
		return new Promise((res, rej) => {
			vm.client.set(key, '', (err, success) => {
				res(success);
			});
		})
	}

}

export default new CacheService();