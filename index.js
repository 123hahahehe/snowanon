// index.js

// Install dependencies by running:
// npm install discord.js@14 axios cheerio sharp fs-extra dotenv

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

// Configurations for different prefixes
const prefixConfigs = {
    "!snow": {
        prefixes: ["snow", "leopard", "snow leopard", "winter", "cold", "mountains", "snowy", "blizzard", "frost", "ice", "freezing", "glacier", "hibernate", "alpine", "white fur", "big cat", "stealthy", "camouflage", "high altitude", "endangered", "wildlife", "nature", "conservation", "snowfall", "christmas", "holiday", "festive", "icy", "snowstorm", "snowflake", "snowman", "sleigh", "reindeer", "polar", "arctic", "sub-zero", "winter wonderland", "frostbite", "snowball", "frozen"],
        searchQuery: "snow leopard"
    },
    "!anon": {
        prefixes: ["anon", "anonymous", "hacker", "hack", "larp", "hacking", "stealing", "larper", "larping", "skid", "script kiddie", "code", "b4b", "dodge", "dodging", "scared", "im ctfu", "Im ctfu😂😂", "noobdog", "faggot", "nigger", "dodging", "larper caught", "oh aii"],
        searchQuery: "anonymous middle finger"
    },
    "!datura": {
        prefixes: ["daturahill", "imar gaspar", "chess", "checkers", "tate", "cuck", "imar-gaspar", "sigma", "rizz", "kai cenat", "skibidi", "rizzler", "lumi athena", "akoge", "indian", "doxbin"],
        searchQuery: "unibrow man anthony davis"
    }
    // Add more prefix configurations as needed
};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
    try {
        if (message.author.bot) return;

        const content = message.content.toLowerCase().trim();

        // Check each prefix configuration
        for (const prefix in prefixConfigs) {
            const config = prefixConfigs[prefix];
            // Check if any of the prefixes are found anywhere in the message
            if (config.prefixes.some(p => content.includes(p))) {
                const imageUrl = await scrapeImage(config.searchQuery);
                if (imageUrl) {
                    const imagePath = await downloadImage(imageUrl);
                    if (imagePath) {
                        message.channel.send({ files: [imagePath] }).then(() => {
                            console.log(`Sent image successfully in channel: ${message.channel.name}`);
                            fs.remove(imagePath); // Clean up after sending
                        }).catch(err => {
                            console.error(`Error sending image: ${err.message}`);
                        });
                    } else {
                        console.error("Error: Image path is null or undefined");
                    }
                } else {
                    console.error("Error: Image URL is null or undefined");
                }
                break; // Exit loop after finding matching prefix
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
