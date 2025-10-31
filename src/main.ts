import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Bật ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Tự động loại field không có trong DTO
      forbidNonWhitelisted: true,   // Throw lỗi nếu request gửi field thừa
      transform: true,              // Chuyển đổi kiểu (ví dụ string -> number)
    }),
  );

  const whitelist = process.env.CORS_WHITELIST?.split(',') || [];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (whitelist.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
