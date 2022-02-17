import {
	findRecordByFilter,
	getMinifiedRecords,
	table,
} from "../../lib/airtable";

const createCoffeeStore = async (req, res) => {
	const { id, name, neighborhood, address, imgUrl, voting } = req.body;

	if (req.method === "POST") {
		try {
			//* if there is id
			if (id) {
				//* finding a record
				const records = await findRecordByFilter(id);

				if (records.length !== 0) {
					res.status(200).json(records);
					return; //* if there is a record, return it
				}

				//* if name is there
				if (name) {
					//* if there is no record
					//* creating a record
					const createRecords = await table.create([
						{
							fields: {
								id,
								name,
								address,
								neighborhood,
								voting,
								imgUrl,
							},
						},
					]);

					res.json({
						msg: "Created a record",
						records: getMinifiedRecords(createRecords),
					});
				} else {
					res.status(400).json({ msg: "Name missing" });
				}
			} else {
				res.status(400).json({ msg: "Id missing" });
			}
			return;
		} catch (e) {
			//* handling ERRORS
			console.error("Error finding store", e);
			res.status(500).json({ msg: "Something went wrong", error: e });
			return;
		}
	}

	res.status(400).json({ msg: "Method not allowed" });
};

export default createCoffeeStore;
