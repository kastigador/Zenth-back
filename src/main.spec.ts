const createDocument = jest.fn(() => ({ openapi: '3.0.0' }));
const setup = jest.fn();
const nestCreate = jest.fn();
const mkdirMock = jest.fn().mockResolvedValue(undefined);

class MockDocumentBuilder {
  setTitle() {
    return this;
  }
  setDescription() {
    return this;
  }
  setVersion() {
    return this;
  }
  addServer() {
    return this;
  }
  addBearerAuth() {
    return this;
  }
  build() {
    return { any: true };
  }
}

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: (...args: unknown[]) => nestCreate(...args),
  },
}));

jest.mock('fs', () => {
  const actual = jest.requireActual('fs');
  return {
    ...actual,
    promises: {
      ...actual.promises,
      mkdir: (...args: unknown[]) => mkdirMock(...args),
    },
  };
});

jest.mock('@nestjs/swagger', () => {
  const actual = jest.requireActual('@nestjs/swagger');
  return {
    ...actual,
    DocumentBuilder: MockDocumentBuilder,
    SwaggerModule: {
      ...actual.SwaggerModule,
      createDocument: (app: unknown, options: unknown, config: unknown) =>
        (createDocument as jest.Mock)(app, options, config),
      setup: (path: string, app: unknown, document: unknown, options: unknown) =>
        (setup as jest.Mock)(path, app, document, options),
    },
  };
});

describe('main bootstrap', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('configura app, swagger y listen con config', async () => {
    const configService = {
      get: jest.fn((key: string, fallback?: unknown) => {
        const values: Record<string, unknown> = {
          API_PREFIX: 'v1',
          API_BODY_LIMIT: '10mb',
          PAYLOAD_ENCRYPTION_SECRET: 'payload-secret',
          STORAGE_LOCAL_ROOT: '/tmp/crm-assets',
          PORT: 3333,
        };
        return values[key] ?? fallback;
      }),
    };

    const app = {
      get: jest.fn(() => configService),
      useLogger: jest.fn(),
      enableCors: jest.fn(),
      use: jest.fn(),
      setGlobalPrefix: jest.fn(),
      useStaticAssets: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    nestCreate.mockResolvedValue(app);

    jest.isolateModules(() => {
      require('./main');
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(nestCreate).toHaveBeenCalled();
    expect(app.enableCors).toHaveBeenCalled();
    expect(app.useLogger).toHaveBeenCalled();
    expect(app.setGlobalPrefix).toHaveBeenCalledWith('v1');
    expect(app.useStaticAssets).toHaveBeenCalledWith('/tmp/crm-assets', { prefix: '/assets/' });
    expect(app.useGlobalPipes).toHaveBeenCalled();
    expect(createDocument).toHaveBeenCalled();
    expect(setup).toHaveBeenCalledTimes(2);
    expect(app.listen).toHaveBeenCalledWith(3333);
    expect(mkdirMock).toHaveBeenCalledWith('/tmp/crm-assets', { recursive: true });
  });
});
