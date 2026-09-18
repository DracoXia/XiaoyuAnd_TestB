import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

export const json = (statusCode: number, value: unknown): HandlerResponse => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(value),
});

export const parsePost = <T>(event: HandlerEvent): T => {
  if (event.httpMethod !== 'POST') throw new Error('method-not-allowed');
  return JSON.parse(event.body ?? '{}') as T;
};

export const assertAdmin = (event: HandlerEvent) => {
  const expected = process.env.PUSH_ADMIN_KEY;
  if (!expected || event.headers.authorization !== `Bearer ${expected}`) throw new Error('unauthorized');
};

export const statusForError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'unknown-error';
  if (message === 'unauthorized') return 401;
  if (message === 'method-not-allowed') return 405;
  if (message.startsWith('invalid-')) return 400;
  return 500;
};
