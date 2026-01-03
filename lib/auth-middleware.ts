import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from './prisma'
import { verifyToken } from './auth'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export async function authenticateRequest(req: AuthenticatedRequest): Promise<boolean> {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyToken(token)
  
  if (!payload) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  })

  if (!user) {
    return false
  }

  req.user = user
  return true
}

export function withAuth(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const isAuthenticated = await authenticateRequest(req)
    
    if (!isAuthenticated) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    return handler(req, res)
  }
}

export function withAuthAndRole(roles: string[]) {
  return function(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const isAuthenticated = await authenticateRequest(req)
      
      if (!isAuthenticated) {
        return res.status(401).json({ message: 'Unauthorized' })
      }

      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden - Insufficient permissions' })
      }

      return handler(req, res)
    }
  }
}