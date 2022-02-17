import { findRecordByFilter } from "../../lib/airtable";

const getCoffeeStoreById = async (req, res) => {
	const { id } = req.query;

	try {
		if (id) {
			//* finding a record
			const records = await findRecordByFilter(id);
			if (records.length !== 0) {
				res.status(200).json(records);
				return;
			}

			res.status(404).json({ msg: "No record found" });
			return;
		}

		res.status(400).json({ msg: "You need to provide an id" });
	} catch (err) {
		res.status(500).json({ message: "Something went wrong", err });
	}
};

export default getCoffeeStoreById;
