import * as crypto from 'crypto';
import { useLogger } from '@becomes/purple-cheetah';

interface QueueHandler {
  (): Promise<void>;
}

export function createQueue({ name }: { name: string }): (data: {
  handler: QueueHandler;
  name: string;
}) => {
  wait: Promise<void>;
} {
  const logger = useLogger({ name });
  let busy = false;

  const items: {
    [id: string]: { name: string; handler: QueueHandler };
  } = {};

  function nextItem() {
    const ids = Object.keys(items);
    const id = ids[0];
    if (id) {
      const data = items[id];
      data
        .handler()
        .then(() => {
          delete items[id];
          if (ids.length > 1) {
            nextItem();
          } else {
            busy = false;
          }
        })
        .catch(() => {
          delete items[id];
          if (ids.length > 1) {
            nextItem();
          } else {
            busy = false;
          }
        });
    }
  }

  setInterval(() => {
    if (!busy) {
      busy = true;
      nextItem();
    }
  }, 1000);

  return (data) => {
    const id = crypto
      .createHash('sha256')
      .update(Date.now() + crypto.randomBytes(8).toString())
      .digest('hex');

    let resolve: () => void;
    let reject: (err?: unknown) => void;
    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    items[id] = {
      name: data.name,
      handler: async () => {
        try {
          await data.handler();
          resolve();
        } catch (error) {
          reject(error);
        }
      },
    };
    promise.catch((error) => {
      logger.error(data.name, error);
    });
    // if (!busy) {
    //   busy = true;
    //   nextItem();
    // }
    return {
      wait: promise,
    };
  };
}
