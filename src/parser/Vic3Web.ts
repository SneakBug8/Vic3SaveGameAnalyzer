import { WebApi } from "../api/web";
import { Color } from "../util/Color";
import { HtmlFormat } from "../util/HtmlFormat";
import { MIS_DT } from "../util/MIS_DT";
import * as express from "express";
import { marked } from "marked";
import { Vic3ParserClass } from "./Vic3Parser";
import { MapToObject } from "../util/MapToObject";
import { Vic3SaveManager } from "./Vic3SaveManager";
import { Sleep, SleepSync } from "../util/Sleep";

class Vic3WebClass {
    public Init() {

        WebApi.app.get("/uploadform", (req, res) => {
            res.render("vic3/load");
        });

        WebApi.app.post("/upload", (req, res) => {
            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send("No files were uploaded.");
            }

            // console.log(req.files);

            const files = req.files.savefile;
            if (!files) {
                return res.status(400).send("Error uploading file.");
            }

            const file = (Array.isArray(files)) ? files[0] : files;

            /*if (file && !file.name.endsWith(".v3")) {
                return res.status(400).send("Wrong file format.");
            }*/

            const path = file.tempFilePath;

            const saveid = Vic3SaveManager.LoadSave(path);

            res.json({ id: saveid });

            // res.redirect(`${saveid}/countries/ledger`);
        });

        WebApi.app.get("/api/:id/countries", (req, res) => this.handler(req, res, (p) => p.GetListOfCountries()));
        WebApi.app.get("/api/:id/countries/gdp", (req, res) => this.handler(req, res, (p) => p.topCountriesByPath("gdp/channels/0/values")));
        WebApi.app.get("/api/:id/countries/ledger", (req, res) => this.handler(req, res, (p) => p.collectCountryLedger()));
        WebApi.app.get("/api/:id/production", (req, res) => this.handler(req, res, (p) => p.CountriesProductionMap()));
        WebApi.app.get("/api/:id/goodsproduction", (req, res) => this.handler(req, res, (p) => p.TopGoodsProducers()));
        WebApi.app.get("/api/:id/worldgdp", (req, res) => this.handler(req, res, (p) => p.WorldGDP()));
        WebApi.app.get("/:id/countries/ledger", (req, res) => {
            const manager = Vic3SaveManager.GetManager(Number.parseInt(req.params.id));
            if (!manager) {
                return res.status(400).send("No such savegame");
            }
            if (manager && !manager.ParsingCompleted) {
                return res.render("vic3/parsing");
            }
            res.render("vic3/ledger", { id: req.params.id });
        });

        WebApi.app.get("/:id/complete", (req, res) => {
            const manager = Vic3SaveManager.GetManager(Number.parseInt(req.params.id));
            if (manager && !manager.ParsingCompleted) {
                return res.json(0);
            }
            else if (!manager) {
                return res.json(2);
            }
            else {
                return res.json(1);
            }
        });
    }

    private async handler(req: express.Request, res: express.Response, method: (parser: Vic3ParserClass) => any) {
        const manager = Vic3SaveManager.GetManager(Number.parseInt(req.params.id));

        if (manager) {
            res.json(method(manager));
        }
        else {
            console.log(`No save game with id ${req.params.id}`);
            res.json({});
        }
    }

}

export const Vic3web = new Vic3WebClass();
