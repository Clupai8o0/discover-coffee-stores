//? unsplash api
// importing api creator
import { createApi } from "unsplash-js";
// initializing api
const unsplashApi = createApi({
	accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY,
});

//* getting images
const getListOfCoffeeStorePhotos = async () => {
	const photos = await unsplashApi.search.getPhotos({
		query: "coffee shops",
		perPage: 40,
	});
	const unsplashResults = photos.response.results;

	return unsplashResults.map((result) => result.urls["small"]);
};

//-----------------------------------------

//? get coffee stores from foursquare api
//* get api
const getCoffeeStoresUrl = (latLong, query, limit) => {
	return `https://api.foursquare.com/v3/places/nearby?ll=${latLong}&query=${query}&v=20220105&limit=${limit}`;
};

//* fetch the data from api
export const fetchCoffeeStores = async (
	latLong = "43.6532,-79.3832",
	limit = 6
) => {
	//* getting photos
	const photos = await getListOfCoffeeStorePhotos();

	//? using api and fetching the data
	//* fetching the data
	const response = await fetch(
		getCoffeeStoresUrl(latLong, "coffee stores", limit),
		{
			headers: {
				Authorization: process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
			},
		}
	);

	//* parsing the data
	const json = await response.json();

	//* editing the data to fit our needs
	const data = json?.results?.map((venue, i) => {
		const neighborhood = venue.location.neighborhood;

		return {
			id: venue.fsq_id,
			address: venue.location.address || "",
			name: venue.name,
			neighborhood:
				(neighborhood && neighborhood.length > 0 && neighborhood[0]) ||
				venue.location.cross_street ||
				"",
			imgUrl: photos[i],
			voting: 0,
		};
	});

	//? returning data
	return data;
};
