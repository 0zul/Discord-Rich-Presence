
//Initialise Libraries.
const DiscordRPC = require('discord-rpc');
const winprocess = require('winprocess');
const fs         = require('fs');
//Initialise Config.
const config = Object.assign(JSON.parse(fs.readFileSync('./config.json.example', 'utf8')), JSON.parse(fs.readFileSync('./config.json', 'utf8')));
//Declaring App ID and RPC Client.
const AppID = config.appid;
const rpc = new DiscordRPC.Client({ transport: 'ipc' });

let currentArray, channel, details;
//Update Time.
function update() {
    let title = winprocess.getActiveWindowName();

    if (currentlyAsleep()) return setActivity({
        details: config.rpc.sleep.details || undefined,
        state: config.rpc.sleep.state || undefined,
        largeImageKey: config.rpc.sleep.largeImageKey || undefined,
        largeImageText: config.rpc.sleep.largeImageText || undefined,
        endTimestamp: config.rpc.sleep.endTimestamp ? awakeWhen() : undefined,
		joinSecret: config.rpc.sleep.joinButton ? true : false,
		spectateSecret: config.rpc.sleep.spectateButton ? true : false
    })

    if (typeof config.rpc.discord != "undefined" && title.endsWith(" - Discord")) {
        channel = title.replace(" - Discord", "");
        details = config.rpc.discord.details.group || undefined;
        if (channel.startsWith("#")) details = config.rpc.discord.details.channel || undefined;
        if (channel.startsWith("@")) details = config.rpc.discord.details.user || undefined;
    
        setActivity({
            details: details,
            state: channel,
            startTimestamp: config.rpc.discord.startTimestamp || undefined,
            largeImageKey: config.rpc.discord.largeImageKey || undefined,
            largeImageText: config.rpc.discord.largeImageText || undefined,
            smallImageKey: config.rpc.discord.smallImageKey || undefined,
            smallImageText: config.rpc.discord.smallImageText || undefined,
            joinSecret: config.rpc.discord.joinButton || undefined,
            spectateSecret: config.rpc.discord.spectateButton || undefined
        })
    }
}
//When Ready.
rpc.on('ready', async () => {
    console.log("Ready! The RPC Client Started Succesfully. Now Y'all Fag Discord Friend's Can See What Are You Doing On Discord.")

    setInterval(function() {
		try { update(); } catch (e) {}
    }, config.interval * 1000);
    
});
//Login.
rpc.login({ clientId: AppID }).catch(console.error);
//Adding Activity
function setActivity(array) {
    if (JSON.stringify(array, null, 4) == JSON.stringify(currentArray, null, 4)) return; // array == currentArray, prevents API spamming
    currentArray = array;

    let time = new Date();

    array = {
        details: array.details,
        state: array.state,
        startTimestamp: array.startTimestamp ? time : undefined,
        endTimestamp: array.endTimestamp,
        largeImageKey: array.largeImageKey,
        largeImageText: array.largeImageText,
        smallImageKey: array.smallImageKey,
        smallImageText: array.smallImageText,
        partyId: AppID,
        joinSecret: array.joinSecret ? AppID + "JOIN" : undefined,
		spectateSecret: array.spectateSecret ? AppID + "SPEC" : undefined,
        instance: false
    }

    rpc.setActivity(array)
}
//Sleep Time (Fetch)
function getSleepTimes() {
    let day = (new Date().getHours() > 12 ? ((new Date().getDay() + 1) == 8 ? 1 : new Date().getDay() + 1) : new Date().getDay()) - 1;

    if (config.sleepTime) return config.sleepTime[day]
    else return null;
}
//Sleep Time Update.
function currentlyAsleep() {
    let sleepTimes = getSleepTimes();

    if (!sleepTimes) return false; // the user don't want the sleep module

    if (new Date().getHours() < sleepTimes[1] || new Date().getHours() >= sleepTimes[0]) {
        return true;
    }
    return false;
}
//When Awake.
function awakeWhen() {
    let time = new Date();
    let awakeTime = new Date();

    if (time.getHours() > 12) {
        awakeTime.setDate(awakeTime.getDate() + 1)
    }

    awakeTime.setHours(getSleepTimes()[1], 0, 0, 0);
    return awakeTime;
}
//End Of The Code.
