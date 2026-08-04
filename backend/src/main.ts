import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation & Filtering
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS Enabled
  app.enableCors();

  // Swagger OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('CT University Task Assignment System API')
    .setDescription('Enterprise Backend API for Task Assignment, Monitoring & Faculty Workflow')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(port);
  console.log(`🚀 CTU Task Backend Service running on: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger API Documentation available at: http://localhost:${port}/api/v1/docs`);
}
bootstrap();
