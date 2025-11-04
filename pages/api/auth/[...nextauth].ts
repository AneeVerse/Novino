import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import connectToDatabase from '@/lib/db'
import User from '@/models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async (credentials) => {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        try {
          await connectToDatabase()
          
          // Find user by email or username
          const user = await User.findOne({
            $or: [
              { email: credentials.identifier.toLowerCase() },
              { username: credentials.identifier }
            ]
          }).select('+password')

          if (!user) return null
          if (user.isBlocked) return null

          const isValid = await user.comparePassword(credentials.password)
          if (!isValid) return null

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username,
            image: user.avatar
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await connectToDatabase()
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user from Google account
            existingUser = await User.create({
              email: user.email,
              username: user.email?.split('@')[0] + '_' + Math.random().toString(36).substring(7),
              googleId: account.providerAccountId,
              avatar: user.image,
              // Password not required for OAuth users
            })
          } else if (!existingUser.googleId) {
            // Link Google account to existing user
            existingUser.googleId = account.providerAccountId
            existingUser.avatar = existingUser.avatar || user.image
            await existingUser.save()
          }

          // Check if user is blocked
          if (existingUser.isBlocked) {
            return false
          }

          user.id = existingUser._id.toString()
          user.name = existingUser.username
          
          return true
        } catch (error) {
          console.error('Google sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
}

export default NextAuth(authOptions) 