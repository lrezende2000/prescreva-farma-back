import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientUnknownRequestError ||
    err instanceof PrismaClientRustPanicError ||
    err instanceof PrismaClientInitializationError
  ) {
    return res.status(400).json({
      error: true,
      message: "Algo deu errado",
    });
  }

  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json({
      error: true,
      message: "Erro na validação de dados",
    });
  }

  if (err instanceof Error) {
    return res.status(400).json({
      error: true,
      message: err.message,
    });
  }
});

app.listen(PORT, () => console.log(`Server is listeing on port ${PORT}`));