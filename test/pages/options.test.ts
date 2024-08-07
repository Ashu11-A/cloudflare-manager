import Options from '../../src/pages/options.js'
import { jest } from '@jest/globals'

jest.unstable_mockModule('../../src/index.js', () => ({
  __esModule: true,
  zone: {
    getData: jest.fn().mockReturnValue({ name: 'zone1', id: 1 }),
    save: jest.fn(),
  }
}))

test('It should return the first element of the question', async () => {
  const { zone } = await import('../../src/index.js')

  Options.interaction.loaders = []
  Options.interaction.requirements = [zone]

  const result = await Options.interaction.run(Options)

  expect(result.result).toEqual('analytics')
})
