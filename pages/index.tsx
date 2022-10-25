import axios from "axios";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
    const [ids, setIds] = useState("");
    const [isId, setIsId] = useState("");
    const router = useRouter();
    const onSubmit = (e: any) => {
        e.preventDefault();

        router.push(
            `/api/youtube?isIdFinal=${isId}&channelsFinal=${JSON.stringify(
                ids.split(",")
            )}`
        );
    };
    return (
        <div className={styles.container}>
            <Head>
                <title>YouTube Channels Links Scraper</title>
            </Head>

            <main className={styles.main}>
                <form onSubmit={onSubmit}>
                    <textarea
                        placeholder=""
                        onChange={(e) => setIds(e.target.value)}
                    ></textarea>
                    <div>
                        <input
                            type="radio"
                            onChange={(e) => setIsId(e.target.value)}
                            id="isid-1"
                            value="id"
                            name="isid"
                        />
                        <label htmlFor="isid-1">ID</label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            onChange={(e) => setIsId(e.target.value)}
                            id="isid-2"
                            value="nickname"
                            name="isid"
                        />
                        <label htmlFor="isid-2">Nickname</label>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </main>
        </div>
    );
};

export default Home;
