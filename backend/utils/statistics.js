const newPokerPlanningCreated = async (pokerPlanning) => {
    console.log("New Poker Planning created: ", process.env.STATISTIC_API_URL);
    if (!process.env.STATISTIC_API_URL) return;

    try {
        const res = await fetch(process.env.STATISTIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "content": null,
                "embeds": [
                    {
                        "description": "## New Poker Planning 🃏",
                        "color": parseInt((pokerPlanning.hexcode || "#ff7900").slice(1), 16),
                        "fields": [
                            {
                                "name": "Cards",
                                "value": (pokerPlanning.cards ? `\`${pokerPlanning.cards.join("`, `")}\`` : `no cards`),
                            },
                            {
                                "name": "Theme Color:",
                                "value": (`\`${pokerPlanning.hexcode || "#ff7900"}\``),
                                "inline": true
                            },
                            {
                                "name": "Auto Reveal",
                                "value": (`\`${pokerPlanning.autoReveal ? "ON" : "OFF"}\``),
                                "inline": true
                            }
                        ],
                        "footer": {
                            "text": "For the NFS team",
                            "icon_url": formatAvatar(pokerPlanning.avatar)
                        }
                    }
                ],
                "attachments": []
            })
        })
        console.log("[New STATS poker planning] response: ", res, res.status);
    }
    catch (error) {
        console.error("[New STATS poker planning] error: ", error);
    }
}

const newUserJoined = async (name, pokerPlanning) => {
    if (name == "ADMIN") return;
    try {
        const res = await fetch(process.env.STATISTIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "content": null,
                "embeds": [{
                    "footer": {
                        "text": `➜ \`${name}\` joined the ${pokerPlanning.team} room`,
                        "icon_url": formatAvatar(pokerPlanning.avatar) + `?seed=${name}&roomId=${pokerPlanning.roomId}`
                    }
                }],
                "color": parseInt((pokerPlanning.hexcode || "#ff7900").slice(1), 16),

            })
        })
        console.log("[New STATS user joined] response: ", res, res.status);
    }
    catch (error) {
        console.error("[New STATS user joined] error: ", error);
    }
}

const roomDeleted = async (roomId, pokerPlanning) => {
    try {
        const res = await fetch(process.env.STATISTIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "content": null,
                "embeds": [{
                    "footer": {
                        "text": `🗑️ ➜ Room ${pokerPlanning.team} has been deleted`
                    }
                }],
                "color": 0xff0000
            })
        })
        console.log("[New STATS room deleted] response: ", res, res.status);
    }
    catch (error) {
        console.error("[New STATS room deleted] error: ", error);
    }
}


const formatAvatar = (avatarUrl) => {
    if (!avatarUrl) return undefined

    return avatarUrl.replace("/svg", "/png")
}

module.exports = {
    newPokerPlanningCreated,
    newUserJoined,
    roomDeleted
}