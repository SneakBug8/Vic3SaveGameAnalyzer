import { Vic3ParserClass } from "./Vic3Parser";
import * as path from "path";
import { Config } from "../config";


class Vic3SaveManagerClass {
    private Saves = new Map<number, Vic3ParserClass>();
    public LoadSave(savepath: string) {
        let ranid = 0;
        while (this.Saves.has(ranid)) {
            ranid++;
        }

        const parser = new Vic3ParserClass(savepath, ranid + "");
        parser.StartParsing();
        this.Saves.set(ranid, parser);

        console.log(`Save game id ${ranid} loaded`);
        return ranid;
    }

    public GetManager(id: number) {
        return this.Saves.get(id);
    }
}

export const Vic3SaveManager = new Vic3SaveManagerClass();