import Redis from 'ioredis';

export const redisHost = process.env.REDIS_HOST || 'localhost';
export const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
export const redisPassword = process.env.REDIS_PASSWORD || undefined;
export const redisUrl = process.env.REDIS_URL || undefined;

export const getRedisConnectionOptions = () => {
  if (redisUrl) {
    return {
      connectionString: redisUrl,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    };
  }

  return {
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: redisHost.includes('upstash.io') ? { rejectUnauthorized: false } : undefined
  };
};

export const createRedisClient = () => {
  if (redisUrl) {
    return new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });
  }

  return new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    tls: redisHost.includes('upstash.io') ? { rejectUnauthorized: false } : undefined
  });
};
