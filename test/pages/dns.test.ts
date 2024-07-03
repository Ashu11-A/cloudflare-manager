import DNS from '@/pages/dns.js';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/index.js', () => ({
    __esModule: true,
    zone: {
        get: jest.fn().mockReturnValue({ name: 'zone1', id: 1 }),
        save: jest.fn(),
    }
}));

test('zones page should call zones.save with the selected zone', async () => {
  const { zone } = await import('../../src/index.js');
  const options = { loaders: [], requirements: [], reply: jest.fn() };

  DNS.interaction.requirements = [zone]
  DNS.isTest = true

  const option = Object.assign(DNS, options)
  const result = await option.interaction.run(option)

  expect(result.result).toEqual('dns_dynamic')
});
