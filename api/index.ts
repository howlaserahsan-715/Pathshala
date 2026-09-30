import app from '../server.ts';
import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  // If invoked on Vercel where '/api' might be stripped by the rewrite
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  return (app as any)(req, res);
}
