import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();
let isInitialized = false;
let initError: Error | null = null;

async function bootstrapServer() {
  if (isInitialized) return server;
  if (initError) throw initError;

  try {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn'] },
    );
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.enableCors({
      origin: true,
      credentials: true,
    });
    await app.init();
    isInitialized = true;
    console.log('[Vercel] NestJS initialized successfully');
  } catch (err: any) {
    console.error('[Vercel] NestJS bootstrap error:', err);
    initError = err;
    throw err;
  }
  return server;
}

export default async function handler(req: any, res: any) {
  // Always set CORS headers first
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const app = await bootstrapServer();
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel] Handler error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        statusCode: 500,
        message: 'Server initialization failed',
        error: err?.message,
      }),
    );
  }
}
