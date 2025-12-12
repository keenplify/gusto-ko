import NextAuth from "next-auth";
import github from "next-auth/providers/github";
import credentials from "next-auth/providers/credentials";
import auth0 from "next-auth/providers/auth0";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import slugify from "slugify";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    github,
    credentials({
      authorize: async (credentials) => {
        if (!credentials?.email) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: credentials?.email,
          },
        });
        if (user) {
          return user;
        }
        return null;
      },
      credentials: {
        email: { label: "Email", type: "text" },
      },
    }),
    auth0({
      clientId: process.env.AUTH_AUTH0_ID!,
      clientSecret: process.env.AUTH_AUTH0_SECRET!,
      issuer: `https://${process.env.AUTH_AUTH0_DOMAIN}`,
    }),
  ],
  events: {
    createUser: async ({ user }) => {
      // Skip creating a wishlist if the user already has one or more
      const existingCount = await prisma.wishlist.count({
        where: { userId: user.id },
      });
      if (existingCount > 0) return;

      // Prefer `user.name` for a human-friendly shareId, otherwise use email (which is unique)
      // sanitize a string to be safe for use as a shareId
      const sanitize = (s: string) => slugify(s, { lower: true, strict: true });

      const nameBase = user.name ? `${sanitize(user.name)}-wishlist` : null;
      const emailBase = user.email
        ? `${sanitize(user.email)}-wishlist`
        : `${user.id}-wishlist`;

      // Start with nameBase if present; if nameBase is already taken, fall back to emailBase
      let chosenBase = nameBase ?? emailBase;
      if (nameBase) {
        const exists = await prisma.wishlist.findFirst({
          where: { shareId: nameBase },
        });
        if (!exists) chosenBase = nameBase;
        else chosenBase = emailBase;
      }

      // Ensure uniqueness by appending numeric suffixes if needed
      let shareId = chosenBase;
      let suffix = 1;
      while (await prisma.wishlist.findFirst({ where: { shareId } })) {
        shareId = `${chosenBase}-${suffix++}`;
      }

      const rawName = user.name?.trim();
      let name: string;
      if (rawName && rawName.length > 0) {
        const last = rawName.slice(-1);
        // If name already ends with an apostrophe, don't add another
        if (last === "'" || last === "’") {
          name = `${rawName} Wishlist`;
        } else if (last === "s" || last === "S") {
          // For names ending in s, use the style "Chris' Wishlist"
          name = `${rawName}' Wishlist`;
        } else {
          name = `${rawName}'s Wishlist`;
        }
      } else {
        name = `Wishlist`;
      }

      // Attempt create with retries in case of a race condition (unique constraint)
      let attempts = 0;
      const maxAttempts = 6;
      while (attempts < maxAttempts) {
        try {
          await prisma.wishlist.create({
            data: {
              name,
              shareId,
              user: {
                connect: { id: user.id },
              },
            },
          });
          break;
        } catch (error) {
          // If another process created the same shareId concurrently, Prisma will throw P2002
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            // try a new suffixed shareId and retry
            shareId = `${chosenBase}-${suffix++}`;
            attempts += 1;
            continue;
          }
          throw error;
        }
      }
    },
  },
});
