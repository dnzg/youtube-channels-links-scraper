import axios from "axios";
import { stringify } from "csv-stringify/sync";

const URLs = [
    "vk.com",
    "vk.ru",
    "tiktok.com",
    "pinterest.com",
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "t.me",
];

export default async function handler(request: any, response: any) {
    if (request.method !== "GET") {
        return response.status(400).json({ status: "wrong method" });
    }

    const { channelsFinal, isIdFinal } = request.query;
    const isId = isIdFinal === "id";
    const channels = JSON.parse(channelsFinal);

    const baseLink = "https://yt.lemnoslife.com/channels?part=about&";
    const link = isId ? `${baseLink}id=` : `${baseLink}forUsername=`;

    try {
        const results = await Promise.all(
            channels.map(async (username: string) => {
                const un = username.replace("\n", "").replace(" ", "");

                if (!un) {
                    return null;
                }

                const res = await axios.get(link + un);

                let linksAbout: any = {};

                if (!res.data || !res.data.items || !res.data.items[0]) {
                    return null;
                }

                res?.data?.items?.[0]?.about?.links?.forEach((link: any) => {
                    const foundURL = URLs.find((url) =>
                        link?.url?.includes(url)
                    );

                    if (foundURL) {
                        const key = foundURL.split(".")[0];
                        linksAbout[key] = link.url;
                    } else {
                        linksAbout.other = linksAbout.other
                            ? linksAbout.other + ", " + link.url
                            : link.url;
                    }
                });

                return {
                    username,
                    viewCount: res.data.items[0].about.stats.viewCount || 0,
                    location: res.data.items[0].about.details.location || "",
                    ...linksAbout,
                };
            })
        );

        let keysAvailable: any = {};
        results.forEach((link) => {
            Object.keys(link).forEach((key) => (keysAvailable[key] = true));
        });

        const finaldata = results.map((link) => {
            Object.keys(keysAvailable).forEach((key) => {
                link[key] = link[key] || "";
            });
            return link;
        });

        const output = stringify(finaldata, {
            header: true,
        });

        response.setHeader(
            "Content-Disposition",
            "attachment;filename=channels.csv"
        );
        response.setHeader("Content-Type", "text/csv");
        return response.status(200).send(output);
    } catch (error) {
        console.error("Error processing channels:", JSON.stringify(error));
        return response
            .status(500)
            .json({ error: "Failed to process channels" });
    }
}
