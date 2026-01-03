import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas em segundos
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
        } else if (account?.provider === 'google') {
          // Create user if doesn't exist (Google OAuth)
          const newUser = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email!,
              image: user.image,
              role: 'MEMBER', // Default role for Google OAuth users
            }
          })
          token.role = newUser.role
          token.id = newUser.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        // Check if user exists, if not create them
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! }
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              name: user.name,
              email: user.email!,
              image: user.image,
              role: 'MEMBER',
            }
          })
        }
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
}

// JWT utilities for API authentication
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' })
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    return payload
  } catch {
    return null
  }
}
