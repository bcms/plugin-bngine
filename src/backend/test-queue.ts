import { createQueue } from './util';

async function main() {
  const queue = createQueue({ name: 'Test queue' });

  const i1 = queue({
    name: 'Q1',
    handler: async () => {
      console.log('Q1');
    },
  });
  const i2 = queue({
    name: 'Q2',
    handler: async () => {
      console.log('Q2');
    },
  });
  const i3 = queue({
    name: 'Q3',
    handler: async () => {
      console.log('Q3');
    },
  });
  await i1.wait;
  await i2.wait;
  await i3.wait;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
