import { Server } from "@overnightjs/core";
import * as http from "http";
import express from "express";
import path from "path";
import cors from "cors";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import morgan from "morgan";
import "./utils/mongoDBConnection";
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });
import { ApiErrorHandler, NotfoundErrorHandler } from "./utils/ApiErrorHandler";
import { AuthController } from "./http/controllers/auth/auth.controller";
import { CategoryController } from "./http/controllers/category/category.controller";
export class setupServer extends Server {
  private server?: http.Server;
  constructor(private port: number = 8888) {
    super();
  }
  public init(): void {
    this.setupExpress();
    this.setupControllers();
    this.setupErrorHandler();
  }
  private setupExpress(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors({ origin: "*" }));
    this.app.use(morgan("dev"));
    this.app.use(express.static(path.join(__dirname,"..","public")));
    this.app.use(
      "/api-doc",
      swaggerUI.serve,
      swaggerUI.setup(
        swaggerJSDoc({
          swaggerDefinition: {
            openapi: "3.0.0",
            info: {
              title: "overnightJs",
              version: "1.0.0",
              description: "دارای مسیر های متفاوت",
            },
            servers: [
              {
                url: "http://127.0.0.1:8888",
              },
            ],
            components: {
              securitySchemes: {
                BearerAuth: {
                  type: "http",
                  scheme: "bearer",
                  bearerFormat: "JWT",
                },
              },
            },
            security: [{ BearerAuth: [] }],
          },
          apis: ["./src/**/*ts"],
        }),
        { explorer: true }
      )
    );
  }
  private setupErrorHandler(): void {
    this.app.use(NotfoundErrorHandler);
    this.app.use(ApiErrorHandler);
  }
  private setupControllers() {
    const controllers = [new AuthController(), new CategoryController()];
    super.addControllers(controllers);
  }
  public start(): void {
    this.server = http.createServer(this.app);
    this.server.listen(this.port, () => {
      console.log(`server run on => http://127.0.0.1:${this.port}`);
    });
  }
}
