import { handleAuth, handleLogin, handleCallback } from '@auth0/nextjs-auth0';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default handleAuth({
  async login(req, res) {
    return handleLogin(req, res);
  },

  async callback(req, res) {
    try {
      return await handleCallback(req, res, {
        afterCallback: async (req, res, session) => {
          const auth0User = session.user;

          // Find user in DB by Auth0 sub
          let dbUser = await prisma.user.findUnique({
            where: { auth0Id: auth0User.sub },
          });

          // Create user in DB if not found
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                auth0Id: auth0User.sub,
                email: auth0User.email,
                name: auth0User.name || null,
              },
            });
          }

          // Attach Prisma DB user id to session for frontend use
          session.user.dbId = dbUser.id;

          return session;
        },
      });
    } catch (error) {
      console.error(error);
      res.status(error.status || 500).end(error.message);
    }
  },
});
