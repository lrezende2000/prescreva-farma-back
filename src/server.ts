import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import cookieParser from 'cookie-parser';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";
import sgMail from '@sendgrid/mail'

import routes from './routes';
import allowedOrigins from "./config/allowedOrigins";
import credentials from "./middlewares/credentials";

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const app = express();
const PORT = process.env.PORT || 8000;

app.use(credentials);
app.use(cors({
  origin: (origin, callback) => {
    if (origin && allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      const error = new Error('Not allowed by CORS')
      error.stack = "";
      callback(error);
    }
  },
  optionsSuccessStatus: 200
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use("/api", routes);

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
