//? Importing
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";

//* next components
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";

//* styles
import styles from "../../styles/coffee-store.module.css";
import cls from "classnames";

//* data
import { fetchCoffeeStores } from "../../lib/coffee-stores";
import { StoreContext } from "../../store/store-context";
import { isEmpty } from "../../utils";
import useSWR from "swr";

//? Getting data
//-------------------------------------------------------------------------------
//* pre-fetching data
export async function getStaticProps(staticProps) {
	const params = staticProps.params; // getting params

	// getting api data
	const coffeeStores = await fetchCoffeeStores();
	const findCoffeeStoreById = coffeeStores.find((coffeeStore) => {
		return coffeeStore.id.toString() === params.id;
	});

	// returning data from api
	return {
		props: {
			coffeeStore: findCoffeeStoreById || {},
		},
	};
}

//* pre-fetching paths
export async function getStaticPaths() {
	// getting api data
	const coffeeStores = await fetchCoffeeStores();

	//* getting all the path ids in json data
	const paths = coffeeStores.map((coffeeStore) => {
		return {
			params: {
				id: coffeeStore.id.toString(),
			},
		};
	});

	return {
		paths,
		fallback: true,
	};
}
//--------------------------------------------------------------------------------

//? App
function CoffeeStore(initialProps) {
	const router = useRouter();

	//* loading
	if (router.isFallback) return <div>Loading...</div>;

	//? deciding whether to use static props or dynamic data
	const queryId = router.query.id;

	//* states
	const [coffeeStore, setCoffeeStore] = useState(initialProps.coffeeStore);
	const {
		state: { coffeeStores },
	} = useContext(StoreContext);

	const handleCreateCoffeeStore = async (coffeeStore) => {
		try {
			const { id, name, voting, imgUrl, neighborhood, address } = coffeeStore;

			const response = await fetch("/api/createCoffeeStore", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id,
					name,
					voting,
					imgUrl,
					neighborhood: neighborhood || "",
					address: address || "",
				}),
			});

			const dbCoffeeStore = await response.json();
			console.log(dbCoffeeStore);
		} catch (err) {
			console.error("Error creating coffee store", err);
		}
	};

	//* updating state based on what we have
	useEffect(() => {
		if (isEmpty(initialProps.coffeeStore)) {
			if (coffeeStores.length > 0) {
				const coffeeStoreFromContext = coffeeStores.find((coffeeStore) => {
					return coffeeStore.id.toString() === queryId;
				});

				if (coffeeStoreFromContext) {
					setCoffeeStore(coffeeStoreFromContext);
					handleCreateCoffeeStore(coffeeStoreFromContext);
				} else {
					console.log("Find coffee store by id doesn't exist");
				}
			}
		} else {
			// SSG
			handleCreateCoffeeStore(initialProps.coffeeStore);
		}
	}, [queryId, initialProps, initialProps.coffeeStore]);

	//* getting data from props
	const { name, address, neighborhood, imgUrl } = coffeeStore;
	const [votingCount, setVotingCount] = useState(0);

	const { data, error } = useSWR(
		`/api/getCoffeeStoreById?id=${queryId}`,
		(url) => fetch(url).then((res) => res.json())
	);
	useEffect(() => {
		if (data && data.length > 0) {
			console.log("data from swr", data);
			setCoffeeStore(data[0]);
			setVotingCount(data[0].voting);
		}
	}, [data]);

	//* handling upvote
	const handleUpvoteButton = async () => {
		try {
			const response = await fetch("/api/favoriteCoffeeStoreById", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					id: queryId,
				}),
			});

			const dbCoffeeStore = await response.json();

			if (dbCoffeeStore.records && dbCoffeeStore.records.length > 0) {
				setVotingCount((prev) => prev + 1);
			}
		} catch (err) {
			console.error("Error upvoting coffee store", err);
		}
	};

	if (error) {
		return <div>Something went wrong retrieving coffee store page</div>;
	}

	return (
		<div className={styles.layout}>
			<Head>
				<title>{name}</title>
			</Head>

			<div className={styles.container}>
				<div className={styles.col1}>
					<div className={styles.backToHomeLink}>
						<Link href="/">
							<a>🠔 Back to home</a>
						</Link>
					</div>

					<div className={styles.nameWrapper}>
						<h1 className={styles.name}>{name}</h1>
					</div>

					<Image
						src={
							imgUrl ||
							"https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
						}
						width={600}
						height={360}
						className={styles.storeImg}
						alt={name}
					/>
				</div>

				{/* Glass card */}
				<div className={cls("glass", styles.col2)}>
					<div className={styles.iconWrapper}>
						<Image src="/static/icons/places.svg" width="24" height="24" />
						<p className={styles.text}>{address}</p>
					</div>

					<div className={styles.iconWrapper}>
						<Image src="/static/icons/nearMe.svg" width="24" height="24" />
						<p className={styles.text}>{neighborhood}</p>
					</div>

					<div className={styles.iconWrapper}>
						<Image src="/static/icons/star.svg" width="24" height="24" />
						<p className={styles.text}>{votingCount}</p>
					</div>

					<button className={styles.upvoteButton} onClick={handleUpvoteButton}>
						Upvote!
					</button>
				</div>
			</div>
		</div>
	);
}

export default CoffeeStore;
