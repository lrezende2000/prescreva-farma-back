import { createRefreshTokenService } from "../RefreshToken/createRefreshTokenService";
import { getRefreshTokenService } from "../RefreshToken/getRefreshTokenService"
import { updateUserTokenService } from "./updateUserTokenService";

export const refreshUserCredentialsService = async (rfId: string) => {
  const refreshToken = await getRefreshTokenService(rfId);

  if (!refreshToken) {
    return null;
  }

  const newRefreshToken = await createRefreshTokenService(refreshToken.userId);
  const token = await updateUserTokenService(refreshToken.userId);

  return ({ token, refreshToken: newRefreshToken, userId: refreshToken.userId });
}