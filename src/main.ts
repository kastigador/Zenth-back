import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { promises as fs } from 'fs';
import { json, urlencoded } from 'express';
import { EncryptedValidationPipe } from './common/security/encrypted-validation.pipe';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX', 'v1');
  const bodyLimit = config.get<string>('API_BODY_LIMIT', '10mb');
  const payloadSecret = config.get<string>('PAYLOAD_ENCRYPTION_SECRET', '');
  const storageRoot = config.get<string>('STORAGE_LOCAL_ROOT', '/home/luis/Plantillas/proyectos-ia/crm-negocio/asset-varios/');

  app.enableCors({
    origin: 'http://localhost:8081',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });
  app.use(cookieParser());
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));

  app.setGlobalPrefix(apiPrefix);
  await fs.mkdir(storageRoot, { recursive: true });
  app.useStaticAssets(storageRoot, { prefix: '/assets/' });
  app.useGlobalPipes(
    new EncryptedValidationPipe(payloadSecret, {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('CRM Negocio API')
    .setDescription('API para CRM con pagos y notificaciones')
    .setVersion('1.0.0')
    .addServer(`/${apiPrefix}`)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swagger, {
    deepScanRoutes: true,
  });

  const swaggerUiOptions = {
    customSiteTitle: 'CRM Negocio API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  };

  SwaggerModule.setup('docs', app, document, {
    ...swaggerUiOptions,
    jsonDocumentUrl: 'docs-json',
  });

  SwaggerModule.setup('docs', app, document, {
    ...swaggerUiOptions,
    useGlobalPrefix: true,
    jsonDocumentUrl: 'docs-json',
  });

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap();
