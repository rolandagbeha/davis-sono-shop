export { config } from '../_authProxy.js';
import { proxyToNeonAuth } from '../_authProxy.js';
import type { VercelRequest, VercelResponse } from '../_authProxy.js';

export default function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  return proxyToNeonAuth(req, res, 'forget-password');
}
