import jwt from 'jsonwebtoken'
import { NextApiRequest } from 'next'
import cookie from 'cookie'

export function getTokenFromReq(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {}
  return typeof cookies.token === 'string' ? cookies.token : null
}

export function verifyToken(token: string): { email: string; username: string } {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }
  return jwt.verify(token, secret) as { email: string; username: string }
} 