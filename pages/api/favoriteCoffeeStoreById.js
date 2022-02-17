import { table, findRecordByFilter, getMinifiedRecords } from "../../lib/airtable";

const favoriteCoffeeStoreById = async (req, res) => {
	if (req.method === "PUT") {
		try {
			const { id } = req.body;

			const records = await findRecordByFilter(id);
			if (records.length !== 0) {
				const record = records[0];
				const calculateVoting = parseInt(record.voting) + 1;

				//* updating record
				const updateRecord = await table.update([
					{
						id: record.recordId,
						fields: {
							voting: calculateVoting,
						},
					},
				]);

        if (updateRecord) {
          const minifiedRecords = getMinifiedRecords(updateRecord);
          res.status(200).json({ msg: "Updated record" , records: minifiedRecords});
        }

				res.status(200).json({ msg: "success", records });
			}

			res.status(400).json({ msg: "Coffee store id doesn't exist", id });
		} catch (err) {
			console.error("Something went wrong", err);
			res.status(500).json({ message: "Error upvoting", err });
		}

		return;
	}

	res.status(500).json({ msg: "Invalid method, must be put" });
	return;
};

export default favoriteCoffeeStoreById;
