import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation for DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  
  // Enable CORS for Frontend MVP
  app.enableCors();
  
  await app.listen(3000);
}
bootstrap();
