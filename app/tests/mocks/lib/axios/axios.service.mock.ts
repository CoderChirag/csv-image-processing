const mockInterceptors = {
  request: {
    use: jest.fn().mockReturnValue(1),
    eject: jest.fn(),
  },
  response: {
    use: jest.fn().mockReturnValue(1),
    eject: jest.fn(),
  },
};
export const mockAxiosClient = new Proxy<Record<string | symbol, jest.Mock>>(
  {
    interceptors: mockInterceptors,
  } as any,
  {
    get: (target, prop) => {
      if (prop in target) {
        return target[prop];
      }
      target[prop] = jest.fn().mockResolvedValue({ data: {} });
      return target[prop];
    },
  },
);

export class MockAxiosError implements Error {
  name: string = 'AxiosError';
  message: string;
  isAxiosError: boolean = true;

  constructor(message: string) {
    this.message = message;
  }
}

export const MockAxiosLib = {
  create: jest.fn().mockReturnValue(mockAxiosClient),
  isAxiosError: jest
    .fn()
    .mockImplementation((err) => err?.isAxiosError ?? false),
  AxiosError: MockAxiosError,
};
