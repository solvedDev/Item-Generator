class LootTable {
	constructor(pName, pItem, pData, pCount) {
		this._name = pName;
		this._rawTable = new RawTable();

		this.setItem(pItem);
		this.setData(pData);
		this.setCount(pCount);
	}

	setCount(pCount) {
		this._rawTable.setCount(pCount);
	}

	setData(pData) {
		this._rawTable.setData(pData);
	}

	setItem(pItemName) {
		this._rawTable.setItem(pItemName);
	}

	getJSON() {
		return JSON.stringify( this._rawTable, null, "\t" );
	}

	downloadTable() {
		addToZip( loot_tables_folder, this._name + ".json", this.getJSON() );
	}
}

class RawTable {
	constructor() {
		this.pools = [
			{
				rolls: 1,
				entries: [
					{
						type: "item",
						name: "",
						weight: 1,
						functions: [
							{
								function: "set_count",
								count: 1
							},
							{
								function: "set_data",
								data: 1
							}
						]
					}
				]
			}
		]
	}

	setCount(pCount) {
		this.pools[0].entries[0].functions[0].count = pCount;
	}

	setData(pData) {
		this.pools[0].entries[0].functions[1].data = pData;
	}

	setItem(pItemName) {
		this.pools[0].entries[0].name = pItemName;
	}
}