import axios from "axios";
import { stringify } from "csv-stringify/sync";

export default function handler(request: any, response: any) {
    if (request.method !== "GET") {
        response.status(400).json({ status: "wrong method" });
    }

    const { channelsFinal, isIdFinal } = request.query;
    const isId = isIdFinal === "id";
    const channels = JSON.parse(channelsFinal);

    const link = isId
        ? "https://yt.lemnoslife.com/channels?part=about&id="
        : "https://yt.lemnoslife.com/channels?part=about&forUsername=";

    const obj = channels.map(async (username: string) => {
        return await axios.get(link + username).then(async (res) => {
            let linksAbout: any = {};
            if (res.data && res.data.items && res.data.items[0]) {
                res.data.items[0].about.links.forEach((link: any) => {
                    if (link?.url?.includes("vk.com")) {
                        linksAbout.VK = link.url;
                    } else if (link?.url?.includes("tiktok.com")) {
                        linksAbout.tiktok = link.url;
                    } else if (link?.url?.includes("pinterest.com")) {
                        linksAbout.pinterest = link.url;
                    } else if (link?.url?.includes("facebook.com")) {
                        linksAbout.facebook = link.url;
                    } else if (link?.url?.includes("twitter.com")) {
                        linksAbout.twitter = link.url;
                    } else if (link?.url?.includes("instagram.com")) {
                        linksAbout.instagram = link.url;
                    } else if (link?.url?.includes("instagram.com")) {
                        linksAbout.instagram = link.url;
                    } else if (link?.url?.includes("t.me")) {
                        linksAbout.telegram = link.url;
                    } else {
                        linksAbout.other = linksAbout.other
                            ? linksAbout.other + ", " + link.url
                            : link.url;
                    }
                });
                const object = {
                    username,
                    viewCount: res.data.items[0].about.stats.viewCount,
                    location: res.data.items[0].about.details.location,
                    ...linksAbout,
                };
                return object;
            }
            return { username };
        });
    });

    Promise.all(obj).then((data) => {
        let keysAvailable: any = {};
        data.forEach((link) => {
            Object.keys(link).forEach((key) => (keysAvailable[key] = true));
        });

        const finaldata = data.map((link) => {
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
        response.status(200).send(output);
    });
}
