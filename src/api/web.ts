import * as express from "express";
import * as bodyParser from "body-parser";
import { Config } from "../config";
import * as ejs from "ejs";
import * as cookieParser from "cookie-parser";
import * as fileUpload from "express-fileupload";
import * as cors from "cors";

class WebApiClass {
  public app: express.Express;
  public constructor() {
    this.app = express();
    const port = Config.port();

    this.app.set("view engine", "ejs");
    this.app.set("views", Config.projectPath() + "/views");

    this.app.use(express.static(Config.projectPath() + "/public"));
    this.app.use(fileUpload({
      useTempFiles: true,
      tempFileDir: "/data/tmp/"
    }));

    // app.use(cookieParser());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
    this.app.use(cors());


    this.app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });

    this.app.use((req, res, next) => {
      console.log(req.method + " to " + req.url);
      next();
    });
    this.app.get("/", (req, res) => {
      res.render("index");
    });

  }
}

export const WebApi = new WebApiClass();
