import { prismaClient } from "../../database/client";

export const getRefreshTokenService = async (rfId: string) => {
  const refreshToken = await prismaClient.refreshToken.findUnique({
    where: {
      id: rfId,
    }
  });

  return refreshToken;
}