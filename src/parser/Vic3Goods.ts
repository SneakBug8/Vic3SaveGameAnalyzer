export class Vic3Goods {
    private static GoodsMap = new Map<string, string>([
    ["0", "Ammunition"],
    ["1", "Small Arms"],
    ["2", "Artillery"],
    ["3", "Tanks"],
    ["4", "Aeroplanes"],
    ["5", "Man'o'wars"],
    ["6", "Ironclads"],
    ["7", "Grain"],
    ["8", "Fish"],
    ["9", "Fabric"],
    ["10", "Wood"],
    ["11", "Groceries"],
    ["12", "Clothes"],
    ["13", "Furniture"],
    ["14", "Paper"],
    ["15", "Services"],
    ["16", "Transportation"],
    ["17", "Electricity"],
    ["18", "Clippers"],
    ["19", "Steamers"],
    ["20", "Silk"],
    ["21", "Dye"],
    ["22", "Sulfur"],
    ["23", "Coal"],
    ["24", "Iron"],
    ["25", "Lead"],
    ["26", "Hardwood"],
    ["27", "Rubber"],
    ["28", "Oil"],
    ["29", "Engines"],
    ["30", "Steel"],
    ["31", "Glass"],
    ["32", "Ferilizer"],
    ["33", "Tools"],
    ["34", "Explosives"],
    ["35", "Porcelain"],
    ["36", "Meat"],
    ]);
    public static GoodName(id: string) {
        return this.GoodsMap.get(id) || "";
    }
}