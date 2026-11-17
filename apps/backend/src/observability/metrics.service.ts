import { Injectable } from '@nestjs/common';

interface CounterKey {
  method: string;
  route: string;
  status: string;
}

const BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];

@Injectable()
export class MetricsService {
  private readonly requestCounts = new Map<
    string,
    { labels: CounterKey; count: number }
  >();
  private readonly durationSums = new Map<string, number>();
  private readonly durationCounts = new Map<string, number>();
  private readonly durationBuckets = new Map<string, number[]>();

  recordRequest(
    method: string,
    route: string,
    status: number,
    durationSeconds: number,
  ): void {
    const statusStr = String(status);
    const key = `${method}|${route}|${statusStr}`;

    const existing = this.requestCounts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      this.requestCounts.set(key, {
        labels: { method, route, status: statusStr },
        count: 1,
      });
    }

    const histKey = `${method}|${route}`;
    this.durationSums.set(
      histKey,
      (this.durationSums.get(histKey) ?? 0) + durationSeconds,
    );
    this.durationCounts.set(histKey, (this.durationCounts.get(histKey) ?? 0) + 1);

    const buckets = this.durationBuckets.get(histKey) ?? BUCKETS.map(() => 0);
    for (const [i, bound] of BUCKETS.entries()) {
      if (durationSeconds <= bound) {
        buckets[i] = (buckets[i] ?? 0) + 1;
      }
    }
    this.durationBuckets.set(histKey, buckets);
  }

  renderPrometheus(): string {
    const lines: string[] = [
      '# HELP http_requests_total Total number of HTTP requests',
      '# TYPE http_requests_total counter',
    ];

    for (const { labels, count } of this.requestCounts.values()) {
      lines.push(
        `http_requests_total{method="${labels.method}",route="${labels.route}",status="${labels.status}"} ${count}`,
      );
    }

    lines.push(
      '# HELP http_request_duration_seconds HTTP request duration in seconds',
      '# TYPE http_request_duration_seconds histogram',
    );

    for (const [histKey, buckets] of this.durationBuckets.entries()) {
      const [method, route] = histKey.split('|');
      const totalCount = this.durationCounts.get(histKey) ?? 0;
      const totalSum = this.durationSums.get(histKey) ?? 0;

      for (let i = 0; i < BUCKETS.length; i += 1) {
        lines.push(
          `http_request_duration_seconds_bucket{method="${method}",route="${route}",le="${BUCKETS[i]}"} ${buckets[i]}`,
        );
      }
      lines.push(
        `http_request_duration_seconds_bucket{method="${method}",route="${route}",le="+Inf"} ${totalCount}`,
      );
      lines.push(
        `http_request_duration_seconds_sum{method="${method}",route="${route}"} ${totalSum.toFixed(6)}`,
      );
      lines.push(
        `http_request_duration_seconds_count{method="${method}",route="${route}"} ${totalCount}`,
      );
    }

    return `${lines.join('\n')}\n`;
  }
}
