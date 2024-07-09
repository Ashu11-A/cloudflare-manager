import Zone from '../../src/pages/zones.js'
import { jest } from '@jest/globals'

jest.unstable_mockModule('../../src/index.js', () => ({
  __esModule: true,
  zones: {
    getData: jest.fn().mockReturnValue([{ name: 'zone1', id: 1 }]),
    save: jest.fn(),
  }
}))

test('zones page should call zones.save with the selected zone', async () => {
  const { zones } = await import('../../src/index.js')

  Zone.interaction.loaders = []
  Zone.interaction.requirements = [zones]

  const result = await Zone.interaction.run(Zone)

  expect(result.result).toEqual('options')
})
