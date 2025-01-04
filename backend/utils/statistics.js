const newPokerPlanningCreated = async (pokerPlanning) => {
    if (!process.env.STATISTIC_API_URL) return;

    try {
        await fetch(process.env.STATISTIC_API_URL, {
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
                            "text": `For the \`${pokerPlanning.team}\` room`,
                            "icon_url": formatAvatar(pokerPlanning.avatar)
                        }
                    }
                ],
                "attachments": []
            })
        })
    }
    catch (error) {
        console.error("[New STATS poker planning] error: ", error);
    }
}

const newUserJoined = async (name, pokerPlanning, roomId) => {
    if (name == "ADMIN") return;
    try {
        await fetch(process.env.STATISTIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "content": null,
                "embeds": [{
                    "footer": {
                        "text": `➜ ${name} joined the \`${pokerPlanning.team}\` room`,
                        "icon_url": formatAvatar(pokerPlanning.avatar) + `?seed=${name}&roomId=${roomId}`
                    },
                    "color": parseInt((pokerPlanning.hexcode || "#ff7900").slice(1), 16),
                }],
            })
        })
    }
    catch (error) {
        console.error("[New STATS user joined] error: ", error);
    }
}

const userLeft = async (name, pokerPlanning, roomId) => {
    if (name == "ADMIN") return;
    try {
        await fetch(process.env.STATISTIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "content": null,
                "embeds": [{
                    "footer": {
                        "text": `⬅ ${name} left the \`${pokerPlanning.team}\` room`,
                        "icon_url": formatAvatar(pokerPlanning.avatar) + `?seed=${name}&roomId=${roomId}`
                    },
                    "color": parseInt((pokerPlanning.hexcode || "#ff7900").slice(1), 16),
                }],
            })
        })
    }
    catch (error) {
        console.error("[New STATS user left] error: ", error);
    }
}

const roomDeleted = async (pokerPlanning) => {
    try {
        const res = await fetch(process.env.STATISTIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "content": null,
                "embeds": [{
                    "author": {
                        "name": `🗑️ Room \`${pokerPlanning.team}\` has been deleted`,
                        "icon_url": formatAvatar(pokerPlanning.avatar)
                    },
                    "color": parseInt((pokerPlanning.hexcode || "#ff7900").slice(1), 16),
                }],
            })
        })
        console.log("[New STATS room deleted] response: ", res, res.status);
    }
    catch (error) {
        console.error("[New STATS room deleted] error: ", error);
    }
}

const stateUpdate = async (pokerPlanning, roomId, state) => {
    try {
        await fetch(process.env.STATISTIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "content": null,
                "embeds": [{
                    "author": {
                        "name": `🔄 ➜ Room \`${pokerPlanning.team}\` state updated to \`${state}\``
                    },
                    "color": parseInt((pokerPlanning?.hexcode || "#ff7900").slice(1), 16),
                }],
            })
        })
    }
    catch (error) {
        console.error("[New STATS state update] error: ", error);
    }
}


const formatAvatar = (avatarUrl) => {
    if (!avatarUrl) return undefined

    return avatarUrl.replace("/svg", "/png")
}

module.exports = {
    newPokerPlanningCreated,
    newUserJoined,
    roomDeleted,
    userLeft,
    stateUpdate
}