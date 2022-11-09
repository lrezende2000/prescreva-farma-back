import { prismaClient } from "../../database/client"


export const deleteRefreshTokenByUserIdService = async (userId: number) => {

  await prismaClient.refreshToken.deleteMany({
    where: {
      userId,
    }
  });
}

export const deleteRefreshTokenByIdService = async (rfId: string) => {
  try {
    await prismaClient.refreshToken.delete({
      where: {
        id: rfId,
      },
    });
  } catch { }

}