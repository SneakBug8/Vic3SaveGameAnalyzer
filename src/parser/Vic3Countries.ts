class Vic3CountriesClass {
    public TagsMap = new Map<string,string>(
        [
            ["FRA", "France"],
            ["AUS", "Austria"],
            ["SIC", "Two Sicilies"],
            ["BRZ", "Brazil"],
            ["BAV", "Bavaria"],
            ["BUR", "Burma"],
            ["TIB", "Tibet"],
            ["PHI", "Philippines"],
            ["SAR", "Sardinia-Piedmont"],
            ["FIN", "Finland"],
            ["TUS", "Tuscany"],
            ["DEN", "Denmark"],
            ["CHI", "Chile"],
            ["URU", "Uruguay"],
            ["DEI", "Dutch East Indies"],
            ["LUX", "Luxembourg"],

            ["PAP", "Papal states"],
            ["ARG", "Argentina"],
            ["SER", "Serbia"],
            ["BIC", "British Raj"],
            ["EGY", "Egypt"],
            ["AFG", "Afghanistan"],
            ["PRU", "Prussia"],
            ["GBR", "Great Britain"],
            ["RUS", "Russia"],
            ["MEX", "Mexico"],
            ["BEL", "Belgium"],
            ["NET", "Netherlands"],
            ["CHI", "Qing"],
            ["BOL", "Bolivia"],
            ["BUL", "Bulgaria"],
            ["CUB", "Cuba"],
            ["GRE", "Greece"],
            ["JAP", "Japan"],
            ["PER", "Persia"],
            ["MOL", "Moldavia"],
            ["NOR", "Norway"],
            ["SWE", "Sweden"],
            ["TUR", "Ottomans"],
            ["TUN", "Tunisia"],
            ["VNZ", "Venezuela"],
            ["POR", "Portgual"],
            ["SPA", "Spain"],
            ["MOR", "Morocco"],
            ["KOR", "Joseon"],
            ["CAN", "Canada"],

        ]
    );
    public TagToName(tag: string) {
        return this.TagsMap.get(tag.toUpperCase());
    }
}

export const Vic3Countries = new Vic3CountriesClass();