import { describe, expect, it } from 'vite-plus/test';

import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('records HTTP requests and renders Prometheus exposition format', () => {
    const metrics = new MetricsService();
    metrics.recordRequest('GET', '/api/tasks', 200, 0.015);
    metrics.recordRequest('GET', '/api/tasks', 200, 0.04);
    metrics.recordRequest('POST', '/api/tasks', 500, 0.12);

    const output = metrics.renderPrometheus();
    expect(output).toContain(
      'http_requests_total{method="GET",route="/api/tasks",status="200"} 2',
    );
    expect(output).toContain(
      'http_requests_total{method="POST",route="/api/tasks",status="500"} 1',
    );
    expect(output).toContain(
      'http_request_duration_seconds_count{method="GET",route="/api/tasks"} 2',
    );
  });
});
