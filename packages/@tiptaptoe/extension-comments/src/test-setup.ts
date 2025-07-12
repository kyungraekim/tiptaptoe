import '@testing-library/jest-dom'

// Mock UUID for consistent test results
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}))

// Mock console.error to avoid noisy test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})