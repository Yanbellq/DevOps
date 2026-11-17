import { Inject, Injectable, type NestMiddleware } from '@nestjs/common';

import { MetricsService } from './metrics.service';

import type { NextFunction, Request, Response } from 'express';

function normalizeRoute(path: string): string {
  return path.replace(/\/[0-9a-f]{8}-[0-9a-f-]{27}/gi, '/:id').split('?')[0] || '/';
}

@Injectable()
export class HttpObservabilityMiddleware implements NestMiddleware {
  constructor(@Inject(MetricsService) private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    const route = normalizeRoute(req.originalUrl || req.url);

    const failRate = Number(process.env.FAIL_RATE ?? 0);
    if (failRate > 0 && route.startsWith('/api/tasks') && Math.random() < failRate) {
      res.status(500).json({ statusCode: 500, message: 'Simulated failure (FAIL_RATE)' });
      const elapsedSec = Number(process.hrtime.bigint() - start) / 1e9;
      this.metricsService.recordRequest(req.method, route, 500, elapsedSec);
      process.stdout.write(
        `${JSON.stringify({
          time: new Date().toISOString(),
          level: 'error',
          message: 'Simulated 500 error',
          method: req.method,
          route,
          status: 500,
          durationMs: Math.round(elapsedSec * 1000),
        })}\n`,
      );
      return;
    }

    res.on('finish', () => {
      if (route === '/api/metrics') return;
      const elapsedSec = Number(process.hrtime.bigint() - start) / 1e9;
      this.metricsService.recordRequest(req.method, route, res.statusCode, elapsedSec);
      process.stdout.write(
        `${JSON.stringify({
          time: new Date().toISOString(),
          level: res.statusCode >= 500 ? 'error' : 'info',
          message: 'HTTP request',
          method: req.method,
          route,
          status: res.statusCode,
          durationMs: Math.round(elapsedSec * 1000),
        })}\n`,
      );
    });

    next();
  }
}
