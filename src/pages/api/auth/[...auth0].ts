import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "@auth0/nextjs-auth0";
import {
  handleAuth,
  handleLogin,
  handleCallback,
  handleLogout,
  handleProfile
} from "@auth0/nextjs-auth0";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Extend Session type to include our custom dbId property
interface CustomSession extends Session {
  user: Session["user"] & { dbId?: string };
}

export default handleAuth({
  // -------------------------
  // LOGIN HANDLER
  // -------------------------
  async login(req: NextApiRequest, res: NextApiResponse) {
    return handleLogin(req, res);
  },

  // -------------------------
  // CALLBACK HANDLER
  // -------------------------
  async callback(req: NextApiRequest, res: NextApiResponse) {
    try {
      return await handleCallback(req, res, {
        afterCallback: async (
          _req: NextApiRequest,
          _res: NextApiResponse,
          session: Session
        ) => {
          const auth0User = session.user;

          // Find user in DB by Auth0 sub
          let dbUser = await prisma.user.findUnique({
            where: { auth0Id: auth0User.sub },
          });

          // If not found, create a new one
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                auth0Id: auth0User.sub,
                email: String(auth0User.email),
                name: auth0User.name || null,
              },
            });
          }

          // Attach DB id to session
          (session as CustomSession).user.dbId = dbUser.id;

          return session;
        },
      });
    } catch (error: unknown) {
      console.error(error);

      if (error instanceof Error) {
        res.status(500).end(error.message);
      } else {
        res.status(500).end("An unknown error occurred");
      }
    }
  },

  // -------------------------
  // LOGOUT HANDLER
  // -------------------------
  async logout(req: NextApiRequest, res: NextApiResponse) {
    return handleLogout(req, res);
  },

  // -------------------------
  // ME / PROFILE HANDLER
  // -------------------------
  async me(req: NextApiRequest, res: NextApiResponse) {
    return handleProfile(req, res);
  },
});
