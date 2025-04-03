import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const port = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: 'https://pos-ui-production.up.railway.app', // Cambia esta línea para permitir solo tu frontend
    // origin: 'http://localhost:5173', // Cambia esta línea para permitir solo tu frontend
    credentials: true,
    // origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(port || 3000);
}
bootstrap();
