import * as path from "path";
import * as fs from "fs";
import { Config } from "../config";
import { MapToObject } from "../util/MapToObject";
import TelegramBot = require("node-telegram-bot-api");
import readline = require("readline");
import { Sleep, SleepSync } from "../util/Sleep";
import { Vic3Countries } from "./Vic3Countries";
import * as _ from "lodash";
import { Color } from "../util/Color";
import { MIS_DT } from "../util/MIS_DT";
import { Vic3Goods } from "./Vic3Goods";

export class Vic3ParserClass {
    public constructor(saveGamePath: string, name: string) {
        this.saveGamePath = saveGamePath;
        this.name = name;
    }
    public async StartParsing() {
        this.level = 0;

        if (fs.existsSync(this.saveGamePath)) {
            const file = readline.createInterface({
                input: fs.createReadStream(this.saveGamePath),
                output: process.stdout,
                terminal: false
            });

            this.parsingStarted = Date.now();

            file.on('line', this.ParseSave.bind(this));

            file.on('close', this.ProcessResults.bind(this));
        }
        else {
            this.Log(`No save game to read.`);
        }
    }

    private Log(text: string) {
        console.log(`[${this.name}] ${text}`);
    }

    private name = "";
    private parsingStarted = 0;
    private lastAnnouncedCount = 0;
    private level = 0;
    private tags = new Array<string>();

    private countryData = new Map<string, any>();
    private stateRegionData = new Map<string, any>();
    private statesData = new Map<string, any>();
    private marketsData = new Map<string, any>();
    private buildingsData = new Map<string, any>();

    private saveGamePath = "";

    public ParsingCompleted = false;

    private ParseSave(line: string) {
        if (line.includes("\t")) {
            const v = line.split("\t");
            for (var f of v) {
                this.ParseSave(f);
            }
            return;
        }

        if (!line) {
            return;
        }

        // value regexp: (["'A-Za-z0-9-_\. ]+)
        // keyregexp: [A-Za-z0-9_\.-]*

        /* tag is opening */
        const matches1 = line.match(/\{/gi);
        /* tag is closing */
        const matches2 = line.match(/\}/gi);
        /* proper tag */
        const matches3 = line.match(/([A-Za-z0-9_\.-]+)=(["'A-Za-z0-9-_\. ]+)/i);
        /* tag opens and closes in one line
        includes rgb {} tags, but doesn't capture them */
        const matches4 = line.match(/([A-Za-z0-9_\.-]+)=[A-Za-z0-9_\.-]* ?\{(["'A-Za-z0-9-_=\. ]+)\}/i);

        // \this.Log(`${this.level} ${line}`);
        /*if (this.level === 0) {
            this.Log(`${this.level} ${line}`);
        }*/
        /*if (this.tags.includes("country_manager")) {
            this.Log(`${this.level} [${this.tags}] ${line}`);
        }*/

        // filter for optimizing parsing
        if (this.tags.includes("country_manager") || this.tags.includes("meta_data")) {
            /*SleepSync(5);
            if (matches3 || matches4) {
                this.Log(`${this.level} [${this.tags}] ${line}`);
            }*/

            /*if (this.tags.includes("current_price_report")) {
                this.Log(`${this.level} [${this.tags}] ${line}`);
            }*/

            if (matches4) {
                // this.Log("match4");
                // this.Log(`${this.level} ${matches4[1]} = ${matches4[2]}`);
                let t = matches4[2].split(/[ ]+/);
                t = t.filter((x) => x);
                this.countryData.set(this.tags.join("/") + "/" + matches4[1], t);

                // this.Log(this.data[this.tags.join("/") + "/" + matches4[1]]);
            }
            else if (matches3) {

                // this.Log(`${this.tags.join("/") + "/" + matches3[1]} = ${matches3[2]} , total: ${this.data.size}`);
                // this.Log("match3");
                // this.Log(`${this.level} ${matches3[1]} = ${matches3[2]}`);
                this.countryData.set(this.tags.join("/") + "/" + matches3[1], matches3[2]);
            }

        }

        if (this.tags.includes("state_region_manager")) {
            if (matches4) {
                let t = matches4[2].split(/[ ]+/);
                t = t.filter((x) => x);
                this.stateRegionData.set(this.tags.join("/") + "/" + matches4[1], t);
            }
            else if (matches3) {
                this.stateRegionData.set(this.tags.join("/") + "/" + matches3[1], matches3[2]);
            }
        }

        if (this.tags.includes("market_manager")) {
            if (matches4) {
                let t = matches4[2].split(/[ ]+/);
                t = t.filter((x) => x);
                this.marketsData.set(this.tags.join("/") + "/" + matches4[1], t);
            }
            else if (matches3) {
                this.marketsData.set(this.tags.join("/") + "/" + matches3[1], matches3[2]);
            }
        }

        if (this.tags.includes("building_manager")) {
            if (matches4) {
                let t = matches4[2].split(/[ ]+/);
                t = t.filter((x) => x);
                this.buildingsData.set(this.tags.join("/") + "/" + matches4[1], t);
            }
            else if (matches3) {
                this.buildingsData.set(this.tags.join("/") + "/" + matches3[1], matches3[2]);
            }
        }

        if (this.tags.length && this.tags[0] === "states") {
            if (matches4) {
                let t = matches4[2].split(/[ ]+/);
                t = t.filter((x) => x);
                this.statesData.set(this.tags.join("/") + "/" + matches4[1], t);
            }
            else if (matches3) {
                this.statesData.set(this.tags.join("/") + "/" + matches3[1], matches3[2]);
            }
        }

        if (!matches4 && matches1) {
            const tags = line.match(/(.+?)=?\{/gi);

            if (tags) {
                for (const tag of tags) {
                    const tt = tag.match("(.+)=");
                    if (tt) {
                        this.tags.push(tt[1]);
                    }
                }
            }

            const notags = line.match(/ {/);
            if (notags) {
                for (const notag of notags) {
                    this.tags.push(".");
                }
            }

            //this.Log(this.tags);
            this.level += matches1.length;
        }

        /*let keys = this.countryData.size + this.stateRegionData.size + this.statesData.size;
        if (keys > 0 && keys % 10000 === 0 && keys !== this.lastAnnouncedCount) {
            this.lastAnnouncedCount = keys;
            this.Log(`Keys - ${keys}`);
        }*/

        if (!matches4 && matches2) {
            this.level -= matches2.length;
            for (const i of matches2) {
                this.tags.pop();
            }
        }
    }

    public CountriesToMarkets() {
        const keys = this.marketsData.keys();
        // states/database/0/market

        const map = new Map<string, string>();

        for (const k of keys) {
            const matches = k.match(/states\/database\/([0-9]+)\/market/);

            if (matches) {
                map.set(matches[1], this.marketsData.get(k));
            }
        }

        return map;
    }

    public MarketsToCountries() {
        const keys = this.statesData.keys();
        // states/database/0/market

        const map = new Map<string, string[]>();

        // k - full key
        for (const k of keys) {
            const matches = k.match(/states\/database\/([0-9]+)\/market/);

            if (matches) {
                const country = this.statesData.get(`states/database/${matches[1]}/country`);
                const market = this.statesData.get(k);

                const arr = map.get(market) ?? new Array<string>();

                if (!arr.includes(country)) {
                    arr.push(country);
                    map.set(market, arr);
                }
            }
        }

        fs.writeFileSync(path.resolve(Config.dataPath(), "marketsize.json"), JSON.stringify(MapToObject.Convert(map)));

        return map;
    }

    public StatesToCountries() {
        const keys = this.statesData.keys();
        // states/database/0/market

        const map = new Map<string, string>();

        // k - full key
        for (const k of keys) {
            const matches = k.match(/states\/database\/([0-9]+)\/country/);

            if (matches) {
                const country = this.statesData.get(k);

                map.set(matches[1], country);
            }
        }

        return map;
    }
    public BuildingsToStates() {
        const keys = this.buildingsData.keys();
        // states/database/0/market

        const map = new Map<string, string>();

        // k - full key
        for (const k of keys) {
            const matches = k.match(/building_manager\/database\/([0-9]+)\/state/);

            if (matches) {
                const state = this.buildingsData.get(k);

                map.set(matches[1], state);
            }
        }

        return map;
    }

    private Cache = new Map<string, any>();

    public CountriesProductionMap() {
        if (this.Cache.get("CountriesProductionMap")) {
            return this.Cache.get("CountriesProductionMap") as IEntry[];
        }

        const states = this.StatesToCountries();
        const buildings = this.BuildingsToStates();

        interface IEntry {
            country: string;
            amounts: Array<{ good: string, amount: number, goodname: string }>;
        };

        const res = new Array<IEntry>();

        const goodskeys = Array.from(this.buildingsData.keys()).filter((x) => x.match(/building_manager\/database\/([0-9]+)\/output_goods\/goods\/([0-9]+)/));

        for (const k of buildings) {
            const state = k[1];
            const country = states.get(state);
            const buildingid = k[0];

            // console.log(`Building ${buildingid}, state ${state}, country ${country}`);

            if (!country) {
                continue;
            }

            let entry = res.find((x) => x.country === country);

            if (!entry) {
                entry = {
                    country,
                    amounts: new Array<{ good: string, goodname: string, amount: number }>()
                };
                res.push(entry);
            }

            const goodsentries = goodskeys.filter((x) => x.startsWith(`building_manager\/database\/${buildingid}\/`));

            for (const g of goodsentries) {
                const matches2 = g.match(`building_manager\/database\/${buildingid}\/output_goods\/goods\/([0-9]+)`);

                if (!matches2) { continue; }

                const goodid = matches2[1];
                const amount = Number.parseInt(this.buildingsData.get(g), 10);
                // console.log(`Building ${buildingid}, state ${state}, country ${country}, goods ${goodid}, amount ${amount}`);

                const goodentry = entry.amounts.find((x) => x.good === goodid);

                if (!goodentry) {
                    entry.amounts.push({
                        good: goodid,
                        goodname: Vic3Goods.GoodName(goodid),
                        amount
                    });
                }
                else {
                    goodentry.amount += amount;
                }
            }
        }

        fs.writeFileSync(path.resolve(Config.dataPath(), "goodsproduction.json"), JSON.stringify(res));

        this.Log(`CountriesProductionMap calculated`);

        this.Cache.set("CountriesProductionMap", res);
        return res;
    }

    public TotalGoodsProduction() {
        const input = this.CountriesProductionMap();

        const goods = _.uniq(_.flatMap(input, (x) => _.flatMap(x.amounts, (y) => y.good)));

        console.log(goods);

        const map = new Map<string, number>();

        for (const good of goods) {
            map.set(good, _.sum(_.flatten(input.map((x) => x.amounts.filter((y) => good === y.good).map((z) => z.amount)))));
        }

        return MapToObject.Convert(map);
    }

    // Produces weird results
    public TopGoodsProducers() {
        const input = this.CountriesProductionMap();

        const goods = _.uniq(_.flatMap(input, (x) => _.flatMap(x.amounts, (y) => y.good)));

        const map = Array();

        for (const good of goods) {
            const r = {
                good, goodname: Vic3Goods.GoodName(good),
                production: input.map((x) => {
                    return { country: this.PrettyCountry(x.country), amount: _.sum(x.amounts.filter((y) => y.good === good).map((z) => z.amount)) };
                }).filter(v => v.amount)
            } as any;

            r.total = _.sum(r.production.map((x: any) => x.amount));

            for (const t of r.production) {
                t.part = Math.round(t.amount * 100 / r.total);
            }

            r.production.sort((a: any, b: any) => b.amount - a.amount);
            map.push(r);
        }

        return map;
    }

    public GdpGrowth() {
        const res = new Map<string, { growth: number }>();


        const countries = this.GetListOfCountries();

        for (const c of countries) {
            const date = this.getCountryRaw(c, `gdp/channels/0/date`) || "1836.1.1";

            const matches = date.match(/([0-9]+)\.([0-9]+)\.([0-9]+)/);

            const year = Number.parseInt(matches[1], 10);
            const month = Number.parseInt(matches[2], 10);
            const day = Number.parseInt(matches[3], 10);

            const dayspassed = day - 1;
            const monthspassed = month + (dayspassed / 30);
            const yearspassed = year - 1836 + monthspassed / 12;

            const gdparr = this.getCountryRaw(c, `gdp/channels/0/values`);
            const basegdp = gdparr && gdparr[0] || 0;
            const gdpnow = _.last(gdparr) as number;

            const poparr = this.getCountryRaw(c, `pop_statistics/population_trend/channels/0/values`);
            const basepop = poparr[0];
            const popnow = _.last(poparr) as number;

            const gdpgrowth = (gdpnow / basegdp) * 100 * (basepop / popnow);
            const growth = Math.round(gdpgrowth / yearspassed);
            res.set(c, { growth });
        }

        return res;
    }

    public WorldGDP() {
        const res = new Array<any>();
        const countries = this.GetListOfCountries();
        console.log(`${countries.size} countries`);

        let totalgdp = 0;
        for (const c of countries) {
            const gdp = this.getCountryNumber(c, `gdp/channels/0/values`);

            res.push({
                label: this.PrettyCountry(c),
                gdp,
            });

            totalgdp += gdp;
        }

        let i = 0;
        res.sort((a, b) => b.gdp - a.gdp);

        console.log(`${countries.size} countries, ${res.length} entries`);

        const parts = _.partition(res, (x) => x.gdp >= totalgdp / 100);
        const selected = parts[0];
        const other = parts[1];

        console.log(`${selected.length} after filter, ${totalgdp} total gdp`);

        selected.push({
            label: "Other",
            gdp: other.reduce((p, c) => p + c.gdp, 0)
        });

        for (const r of selected) {
            r.backgroundColor = Color.GetBackground(i++);
        }

        return {
            labels: selected.map((x) => x.label), datasets: [{
                label: "GDP",
                data: selected.map((x) => x.gdp),
                backgroundColor: selected.map((x) => x.backgroundColor),
            }]
        };
    }

    public MarketSize() {
        const map = this.MarketsToCountries();
        const res = new Map<string, {
            pop: number, gdp: number, owner: boolean,
            ownertag: string, partofgdp: number, partofpop: number
        }>();

        for (const k of map.keys()) {
            const arr = map.get(k);

            if (!arr) {
                continue;
            }

            const owner = this.marketsData.get(`market_manager/database/${k}/owner`);

            let pop = 0;
            let gdp = 0;
            let ownertag = "";

            // find owner
            // calculate totals
            for (const c of arr) {
                const marketowner = c === owner;
                if (marketowner) {
                    ownertag = this.PrettyCountry(c);
                }

                pop += this.getCountryNumber(c, "pop_statistics/population_trend/channels/0/values", 0, true);
                gdp += this.getCountryNumber(c, "gdp/channels/0/values");
            }

            // set data
            for (const c of arr) {
                const marketowner = c === owner;
                const localgdp = this.getCountryNumber(c, "gdp/channels/0/values");
                const partofgdp = Math.round(localgdp * 100 / gdp);
                const localpop = this.getCountryNumber(c, "pop_statistics/population_trend/channels/0/values", 0, true);
                const partofpop = Math.round(localpop * 100 / pop);
                res.set(c, { pop, gdp, owner: marketowner, ownertag, partofgdp, partofpop });
            }
        }

        // fs.writeFileSync(path.resolve(Config.dataPath(), "marketsize.json"), JSON.stringify(MapToObject.Convert(res)));

        return res;
    }

    public GetListOfCountries() {
        const countriesset = new Set<string>();
        for (const k of this.countryData.keys()) {
            const matches = k.match(/country_manager\/database\/([0-9]+)\/.+/);
            if (matches) {
                countriesset.add(matches[1]);
            }
        }

        return countriesset;
    }

    public getCountryNumber(country: string, path: string, round: number = 0, silent: boolean = false) {
        const val = this.countryData.get("country_manager/database/" + country + "/" + path);
        let res = 0;

        if (!val) {
            if (!silent) {
                this.Log(`No value for country ${country} at key country_manager/database/${country}/${path}`);
            }
            return 0;
        }
        else {

            if (typeof val === "string") {
                res = Number.parseFloat(val);
            }
            else {
                res = Number.parseFloat(_.last(val) || "0");
            }
        }

        if (Number.isNaN(res)) {
            this.Log(`NaN for path ${country}/${path}`);
            res = 0;
        }

        return Math.floor(res * 10 ** round) / 10 ** round;
    }

    public getCountryRaw(country: string, path: string) {
        const val = this.countryData.get("country_manager/database/" + country + "/" + path);

        if (!val) {
            this.Log(`No value for country ${country} at key country_manager/database/${country}/${path}`);
            return null;
        }
        else {

            return val;
        }
    }

    public getCountryLatest(country: string, path: string) {
        const val = this.countryData.get("country_manager/database/" + country + "/" + path);
        const arr = new Array<{ key: number, value: number }>();


        if (!val) {
            this.Log(val);
            this.Log(`No value for country ${country} at key country_manager/database/${country}/${path}`);
            return 0;
        }

        for (const v of val) {
            const matches3 = v.match(/([A-Za-z0-9_\.-]+)=(["'A-Za-z0-9-_\. ]+)/i);

            if (matches3) {
                arr.push({
                    key: Number.parseInt(matches3[1]),
                    value: Number.parseFloat(matches3[2])
                });
            }

            arr.sort((a, b) => b.key - a.key);
            return arr[0];
        }
    }

    public PrettyCountry(id: string) {
        const def = this.getCountryRaw(id, "definition") as string;
        const tag = def.replace(/"/g, "");
        const name = Vic3Countries.TagToName(tag);
        if (name) {
            return `${tag} ${name}`;
        }
        else {
            return tag;
        }
    }

    public PrettyString(text: string) {
        return text.replace(/"/g, "");
    }

    public GetMetadata() {
        return {
            date: this.PrettyString(this.countryData.get("meta_data/game_date") || ""),
            version: this.PrettyString(this.countryData.get("meta_data/version") || ""),
            country: this.PrettyString(this.countryData.get("meta_data/name") || "")
        };
    }

    public collectCountryLedger() {
        const countries = this.GetListOfCountries();
        const list = new Array<any>();

        const marketsizes = this.MarketSize();
        const gdpgrowth = this.GdpGrowth();

        for (const c of countries) {
            /* Economics */
            const res: any = {};

            res.definition = this.PrettyCountry(c);
            res.gdp = this.getCountryNumber(c, "gdp/channels/0/values");
            res.money = this.getCountryNumber(c, "budget/money");
            res.average_productivity = this.getCountryNumber(c, "budget/average_productivity", 2);
            res.prestige = this.getCountryNumber(c, "prestige/channels/0/values");
            res.balance = this.getCountryNumber(c, "budget/balance_trend/current");

            res.marketsize = marketsizes.get(c) ||
                { pop: 0, gdp: 0, owner: false, ownertag: "", partofpop: "", partofgdp: "" };
            res.marketsize.owner = (res.marketsize.owner) ? "✔" : "❌";

            res.gdpgrowth = gdpgrowth.get(c);

            // res.construction_goods_expenses = this.getCountryLatest(c, "budget/building_budget/construction_goods_expenses");
            // res.gov_goods_expenses = this.getCountryLatest(c, "budget/building_budget/gov_goods_expenses");
            // res.gov_salaries_expenses = this.getCountryLatest(c, "budget/building_budget/gov_salaries_expenses");
            // res.mil_salaries_expenses = this.getCountryLatest(c, "budget/building_budget/mil_salaries_expenses");
            // res.mil_goods_expenses = this.getCountryLatest(c, "budget/building_budget/mil_goods_expenses");

            const weekly_income = this.getCountryRaw(c, "budget/weekly_income");
            res.income_taxes = Math.floor(weekly_income[1]);
            res.poll_taxes = Math.floor(weekly_income[2]);
            res.consumption_taxes = Math.floor(weekly_income[3]);
            res.diplomatic_pacts = Math.floor(weekly_income[4]);
            res.investment_pool_transfer = Math.floor(weekly_income[6]);
            res.minting = Math.floor(weekly_income[7]);
            res.tariffs = Math.floor(weekly_income[8]);

            const weekly_expenses = this.getCountryRaw(c, "budget/weekly_expenses");
            res.goods_for_govt_buildings = Math.floor(weekly_expenses[2]);
            res.government_wages = Math.floor(weekly_expenses[3]);
            res.goods_for_military_buildings = Math.floor(weekly_expenses[5]);
            res.military_wages = Math.floor(weekly_expenses[6]);
            res.construction_goods = Math.floor(weekly_expenses[7]);

            res.credit = this.getCountryNumber(c, "budget/credit");
            res.principal = this.getCountryNumber(c, "budget/principal", 0, true);
            res.investment_pool = this.getCountryNumber(c, "budget/investment_pool", 0, true);

            // const expenses = this.getCountryNumber(c, "gdp/channels/0/values");

            /* Social */
            res.population = this.getCountryNumber(c, "pop_statistics/population_trend/channels/0/values");
            res.lower_strata_pops = this.getCountryNumber(c, "pop_statistics/lower_strata_pops");
            res.middle_strata_pops = this.getCountryNumber(c, "pop_statistics/middle_strata_pops");
            res.upper_strata_pops = this.getCountryNumber(c, "pop_statistics/upper_strata_pops");
            res.radicals = this.getCountryNumber(c, "pop_statistics/radicals");
            res.loyalists = this.getCountryNumber(c, "pop_statistics/loyalists", 0, true);
            res.total_political = this.getCountryNumber(c, "pop_statistics/total_political");
            res.total_slave = this.getCountryNumber(c, "pop_statistics/total_slave", 0, true);
            res.slave_working_adults = this.getCountryNumber(c, "pop_statistics/slave_working_adults", 0, true);
            res.salaried_working_adults = this.getCountryNumber(c, "pop_statistics/salaried_working_adults");
            res.government_working_adults = this.getCountryNumber(c, "pop_statistics/government_working_adults", 0, true);
            res.military_working_adults = this.getCountryNumber(c, "pop_statistics/military_working_adults", 0, true);
            res.laborer_working_adults = this.getCountryNumber(c, "pop_statistics/laborer_working_adults", 0, true);
            res.subsisting_working_adults = this.getCountryNumber(c, "pop_statistics/subsisting_working_adults", 0, true);
            res.unemployed_working_adults = this.getCountryNumber(c, "pop_statistics/unemployed_working_adults", 0, true);
            res.qualifications = this.getCountryLatest(c, "pop_statistics/qualifications");
            res.employable_qualifications = this.getCountryLatest(c, "pop_statistics/employable_qualifications");

            // const government_wages = this.getCountryNumber(c, "counters/government_wages");
            // const military_wages = this.getCountryNumber(c, "counters/military_wages");
            // const diplomatic_pact = this.getCountryNumber(c, "counters/diplomatic_pact");
            // const budget_interests = this.getCountryNumber(c, "counters/budget_interests");
            // const additional_income = this.getCountryNumber(c, "counters/additional_income");
            // const income_taxes = this.getCountryNumber(c, "counters/income_taxes");
            res.supply_network = this.getCountryNumber(c, "counters/supply_network");
            // const country_trade_routes = this.getCountryNumber(c, "counters/country_trade_routes");

            res.convoys_produced = this.getCountryNumber(c, "convoys_produced");
            res.convoys_from_subjects = this.getCountryNumber(c, "convoys_from_subjects");

            // Optional, thus silent
            res.infamy = this.getCountryNumber(c, "infamy", 0, true);

            res.slave_trade = this.getCountryNumber(c, "last_week_slave_trade_statistics/immigration", 0, true);
            res.pop_immigration = this.getCountryNumber(c, "pop_migration_statistics/immigration", 0, true);
            res.pop_emigration = this.getCountryNumber(c, "pop_migration_statistics/emigration", 0, true);


            /* Goods prices */
            res.goods = {};

            for (let i = 0; i < 52; i++) {
                res.goods[i + ""] = this.getCountryNumber(c, `budget/current_price_report/goods/${i}`, 2, true);
            }

            list.push(res);
        }

        return { metadata: this.GetMetadata(), countries: list };
    }

    public topCountriesByPath(path: string) {
        const countries = this.GetListOfCountries();

        const list = new Array<{
            country: String,
            value: number;
        }>();

        for (const c of countries) {
            const definition = this.countryData.get("country_manager/database/" + c + "/definition");


            list.push({
                country: definition,
                value: this.getCountryNumber(c, path)
            });
        }

        return list.sort((a, b) => (b.value - a.value));
    }

    public getTopGDPs() {
        return this.topCountriesByPath("gdp/channels/0/values");
    }

    private ProcessResults() {
        this.Log(`Read save game with ${this.countryData.size} keys saved in Country DB.`);
        this.Log(`Read save game with ${this.stateRegionData.size} keys saved in stateRegion DB.`);
        this.Log(`Read save game with ${this.statesData.size} keys saved in states DB.`);
        this.Log(`Read save game with ${this.marketsData.size} keys saved in markets DB.`);

        const countriesfilepath = path.resolve(Config.dataPath(), `${this.name}_data.json`);
        const stateregionsfilepath = path.resolve(Config.dataPath(), `${this.name}_stateregions.json`);
        const statesfilepath = path.resolve(Config.dataPath(), `${this.name}_states.json`);
        const marketsfilepath = path.resolve(Config.dataPath(), `${this.name}_markets.json`);
        const buildingsfilepath = path.resolve(Config.dataPath(), `${this.name}_buildings.json`);
        fs.writeFileSync(countriesfilepath, JSON.stringify(MapToObject.Convert(this.countryData)));
        fs.writeFileSync(stateregionsfilepath, JSON.stringify(MapToObject.Convert(this.stateRegionData)));
        fs.writeFileSync(statesfilepath, JSON.stringify(MapToObject.Convert(this.statesData)));
        fs.writeFileSync(marketsfilepath, JSON.stringify(MapToObject.Convert(this.marketsData)));
        fs.writeFileSync(buildingsfilepath, JSON.stringify(MapToObject.Convert(this.buildingsData)));
        this.TopGoodsProducers();
        this.Log(`Export file for path ${this.saveGamePath} done`);

        this.ParsingCompleted = true;
        this.Log(`Parsing took ${(Date.now() - this.parsingStarted) / 1000} seconds`);
    }
}


// Vic3BaseSave.StartParsing();