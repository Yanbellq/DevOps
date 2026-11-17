import { type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthController } from './health/health.controller';
import { HttpObservabilityMiddleware } from './observability/http-observability.middleware';
import { MetricsController } from './observability/metrics.controller';
import { MetricsService } from './observability/metrics.service';
import { Task } from './tasks/task.entity';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'taskflow',
      entities: [Task],
      synchronize: process.env.DB_SYNCHRONIZE !== 'false',
    }),
    TasksModule,
  ],
  controllers: [HealthController, MetricsController],
  providers: [MetricsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpObservabilityMiddleware).forRoutes('*');
  }
}
