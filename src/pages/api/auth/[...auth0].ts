import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from '@auth0/nextjs-auth0';
import {
  handleAuth,
  handleLogin,
  handleCallback,
  handleLogout,
  getSession
} from '@auth0/nextjs-auth0';
import prisma from '../../../lib/prisma';

interface CustomSession extends Session {
  user: Session["user"] & { dbId?: string };
}

export default handleAuth({
  async login(req: NextApiRequest, res: NextApiResponse) {
    return handleLogin(req, res);
  },

  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      return await handleCallback(req, res, {
        afterCallback: async (_req: NextApiRequest, _res: NextApiResponse, session: Session) => {
          const auth0User = session.user;
          if (!auth0User?.email) throw new Error("No email from Auth0");

          const dbUser = await prisma.user.upsert({
            where: { email: String(auth0User.email) },
            update: {
              auth0Id: auth0User.sub,
              name: auth0User.name || null,
            },
            create: {
              auth0Id: auth0User.sub,
              email: String(auth0User.email),
              name: auth0User.name || null,
            },
          });

          (session as CustomSession).user.dbId = dbUser.id;
          return session;
        },
      });
    } catch (error) {
      console.error("Auth0 callback error:", error);
      if (error instanceof Error) {
        res.status(500).end(error.message);
      } else {
        res.status(500).end("An unknown error occurred");
      }
    }
  },

  async logout(req: NextApiRequest, res: NextApiResponse) {
    return handleLogout(req, res, {
      returnTo: process.env.AUTH0_BASE_URL || "http://localhost:3000",
    });
  },

  async me(req: NextApiRequest, res: NextApiResponse) {
    try {
      const session = await getSession(req, res);
      if (!session || !session.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      return res.status(200).json({
        id: (session as CustomSession).user.dbId,
        name: session.user.name || null,
        email: session.user.email || null,
      });
    } catch (err) {
      console.error("Auth me error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  },
});
