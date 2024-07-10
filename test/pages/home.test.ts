import { jest } from '@jest/globals'
import Home from '../../src/pages/home.js'

test('It should return the first element of the question', async () => {
  const result = await Home.interaction.run(Home)

  expect(result.result).toEqual('zones')
})