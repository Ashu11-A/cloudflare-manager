import { jest } from '@jest/globals'
import Zones from '@/pages/zones.js'

jest.unstable_mockModule('@/index.js', () => {
  return {
    __esModule: true,
    zones: {
      save: jest.fn(),
      getData: jest.fn().mockReturnValue([
        { name: 'zone1', id: '1' },
        { name: 'zone2', id: '2' },
      ]),
      zone:  {
        save: jest.fn(),
      }
    }
  }
})

describe('zones Page', () => {
  it('It should return the first element of the question', async () => {
    const { zones } = await import('@/index.js')

    Zones.interaction.requirements = [zones]

    const { result } = await Zones.interaction.run(Zones)

    expect(result).toBe('options')
  })
})
