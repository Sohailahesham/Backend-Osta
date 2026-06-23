import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT || 3000;
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  //* ── Swagger ──────────────────────────────────────────────
  const config = new DocumentBuilder()
  .setTitle('Osta API')
  .setDescription(
    'Home services marketplace — connecting clients with verified technicians',
  )
  .setVersion('1.0')
  .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
  .addTag('Auth', 'Register, login, tokens, Google OAuth, OTP')
  .addTag('Users', 'Client profile management')
  .addTag('Technician', 'Multi-step registration & profile')
  .addTag('Categories', 'Service categories')
  .addTag('Services', 'Service catalog')
  .addTag('Requests', 'Service booking requests')
  .addTag('Reviews', 'Ratings & reviews')
  .addTag('Emergency', 'Emergency contact numbers')
  .addTag('Admin', 'Admin management panel')
  .addTag('Chat', 'AI assistant')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  app
  .getHttpAdapter()
  .get('/api-json', (req: express.Request, res: express.Response) => {
    res.json(document);
  });

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
