import { Controller, Get, Header, Inject } from '@nestjs/common';

import { MetricsService } from './metrics.service';

@Controller()
export class MetricsController {
  constructor(@Inject(MetricsService) private readonly metricsService: MetricsService) {}

  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  getMetrics(): string {
    return this.metricsService.renderPrometheus();
  }

  @Get('version')
  getVersion(): { version: string } {
    return { version: process.env.APP_VERSION ?? '1.0.0' };
  }
}
