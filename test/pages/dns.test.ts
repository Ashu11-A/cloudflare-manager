import DNS from '../../src/pages/dns.js'
import { jest } from '@jest/globals'

jest.unstable_mockModule('../../src/index.js', () => ({
  __esModule: true,
  zone: {
    getData: jest.fn().mockReturnValue({ name: 'zone1', id: 1 }),
    save: jest.fn(),
  }
}))

test('zones page should call zones.save with the selected zone', async () => {
  const { zone } = await import('../../src/index.js')

  DNS.interaction.loaders = []
  DNS.interaction.requirements = [zone]

  const result = await DNS.interaction.run(DNS)

  expect(result.result).toEqual('dns_dynamic')
})
