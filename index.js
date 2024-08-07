const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");
const sharp = require("sharp");
const fs = require("fs-extra");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const channelKeywords = ["gen", "general", "chat", "talk", "lobby"];
const filename = "mellanspel_on_ig.gif";

const prefixConfigs = {
    "!snow": {
        prefixes: ["i feel so alone", "genshin", "rust", "fortnite", "sigilkore"],
        searchQuery: "i pedophile"
    },
    "!anon": {
        prefixes: ["anon", "anonymous", "larp", "hacking", "stealing", "larper", "larping", "skid", "script kiddie", "code", "b4b", "dodge", "dodging", "im ctfu", "Im ctfu😂😂", "noobdog", "dodging", "larper caught", "oh aii"],
        searchQuery: "anonymous mask middle finger"
    },
    "!datura": {
        prefixes: ["daturahill", "imar gaspar", "chess", "andrew tate", "cuck", "imar-gaspar", "sigma", "rizz", "kai cenat", "skibidi", "rizzler", "lumi athena", "akoge", "indian", "doxbin"],
        searchQuery: "unibrow man anthony davis"
    }
};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    try {
        if (message.author.bot) return;

        const content = message.content.toLowerCase().trim();

        for (const prefix in prefixConfigs) {
            const config = prefixConfigs[prefix];
            if (config.prefixes.some(p => content.includes(p))) {
                const imageUrl = await scrapeImage(config.searchQuery);
                if (imageUrl) {
                    const imagePath = await downloadImage(imageUrl);
                    if (imagePath) {
                        message.channel.send({ files: [imagePath] }).then(() => {
                            console.log(`Sent image successfully in channel: ${message.channel.name}`);
                            fs.remove(imagePath);
                        }).catch(err => {
                            console.error(`Error sending image: ${err.message}`);
                        });
                    } else {
                        console.error("Error: Image path is null or undefined");
                    }
                } else {
                    console.error("Error: Image URL is null or undefined");
                }
                break; 
            }
        }
    } catch (error) {
        console.error("Error in messageCreate event:", error);
    }
});

client.login(process.env.DISCORD_TOKEN)
    .then(() => {
        console.log("Bot logged in successfully!");
    })
    .catch(error => {
        console.error("Error logging in:", error);
    });

async function scrapeImage(query) {
    try {
        const response = await axios.get(
            `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`,
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
                },
            },
        );
        const $ = cheerio.load(response.data);
        const images = $("img");
        const imageUrls = [];
        images.each((index, image) => {
            const src = $(image).attr("src");
            if (src && src.startsWith("http")) {
                imageUrls.push(src);
            }
        });
        if (imageUrls.length > 0) {
            const randomIndex = Math.floor(Math.random() * imageUrls.length);
            return imageUrls[randomIndex];
        } else {
            console.error("No images found in response");
            return null;
        }
    } catch (error) {
        console.error("## fetch error:", error);
        return null;
    }
}

async function downloadImage(url) {
    try {
        const response = await axios({
            url,
            responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "binary");
        const imagePath = `./${filename}`;

        await sharp(buffer).gif().toFile(imagePath);

        return imagePath;
    } catch (error) {
        console.error("## download error:", error);
        return null;
    }
}

const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('Discord bot is running!');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
