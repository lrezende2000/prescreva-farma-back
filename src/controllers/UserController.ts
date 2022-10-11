import express from "express";
import { createUserService } from "../services/User/createUserService";
import { createProfessionalService } from "../services/Professional/createProfessionalService";

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { body } = req;

  const user = await createUserService(body?.user);

  if (!user) {
    throw new Error("Não foi possível criar o usuário");
  }

  const professional = await createProfessionalService(body?.professional);

  if (!professional) {
    throw new Error("Não foi possível criar o perfil do profissional");
  }

  return res.status(201).json({
    error: false,
    message: "Usuário criado com sucesso",
  });
});

export default router;
