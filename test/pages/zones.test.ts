import Zone from '@/pages/zones.js';
import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/index.js', () => ({
    __esModule: true,
    zones: {
        get: jest.fn().mockReturnValue([{ name: 'zone1', id: 1 }]),
        save: jest.fn(),
    }
}));

test('zones page should call zones.save with the selected zone', async () => {
  const { zones } = await import('../../src/index.js');
  const options = { loaders: [], requirements: [zones], reply: jest.fn() };

  Zone.interaction.requirements = [zones]
  Zone.isTest = true

  const zone = Object.assign(Zone, options)
  const result = await Zone.interaction.run(zone)

  expect(result.result).toEqual('zone1_1')
});
