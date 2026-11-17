import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import type { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async check() {
    let database: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.dataSource.query('SELECT 1');
      database = 'connected';
    } catch {
      database = 'disconnected';
    }

    return {
      status: database === 'connected' ? 'ok' : 'degraded',
      version: process.env.APP_VERSION ?? '1.0.0',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
