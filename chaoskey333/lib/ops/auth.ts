import { NextApiRequest } from 'next';

/**
 * Validates the X-Admin-Token header against the environment variable
 * @param req - Next.js API request object
 * @returns true if token is valid, false otherwise
 */
export function validateAdminToken(req: NextApiRequest): boolean {
  const token = req.headers['x-admin-token'];
  const expectedToken = process.env.TEMP_ADMIN_TOKEN;

  if (!expectedToken) {
    console.warn('TEMP_ADMIN_TOKEN environment variable not set');
    return false;
  }

  if (!token || typeof token !== 'string') {
    return false;
  }

  return token === expectedToken;
}

/**
 * Middleware to protect admin endpoints
 * Returns 401 if token is invalid
 */
export function requireAdminAuth(handler: Function) {
  return async (req: NextApiRequest, res: any) => {
    if (!validateAdminToken(req)) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Valid X-Admin-Token required' 
      });
    }
    
    return handler(req, res);
  };
}