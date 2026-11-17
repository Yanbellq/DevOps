import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/health')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ status: 'ok', database: 'connected' }),
          });
        }
        if (
          url.includes('/tasks') &&
          (!init || init.method === undefined || init.method === 'GET')
        ) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  id: '1',
                  title: 'Write Dockerfile',
                  description: 'Containerize frontend and backend',
                  status: 'todo',
                  priority: 'high',
                  createdAt: new Date().toISOString(),
                },
              ]),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: '2', title: 'New task', status: 'todo' }),
        });
      }),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders health status and loaded tasks', async () => {
    render(<App />);

    const taskEl = await screen.findByText('Write Dockerfile');
    expect(taskEl).toBeDefined();
    expect(screen.getByTestId('health-badge').textContent).toContain(
      'API: ok | DB: connected',
    );
  });

  it('submits a new task through the form', async () => {
    render(<App />);
    await screen.findByText('Write Dockerfile');

    fireEvent.change(screen.getByLabelText('Task title'), {
      target: { value: 'Setup GitHub Actions' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Task' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/tasks',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
