import { prismaClient } from "../../database/client"
import { deleteRefreshTokenByUserIdService } from "../RefreshToken/deleteRefreshTokenService";


export const removeUserCredentialsService = async (userId: number) => {
  await prismaClient.user.update({
    where: {
      id: userId,
    },
    data: {
      token: null,
    }
  });

  await deleteRefreshTokenByUserIdService(userId);
}