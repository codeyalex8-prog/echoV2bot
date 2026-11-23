# FAQ and fixes
**I get 403.** The key is wrong, has spaces or quotes, or the header name is wrong. It must be `Server-Key`.

**Where is my API key?** In your ER:LC private server settings, search "API key" under the ER:LC API header. If it's missing, the API pack may not be enabled on that server.

**I get 429.** You're sending too many requests. Add caching and wait for the retry time before trying again.

**I get 500 or "no players."** Roblox or the game server had trouble, or the action needs at least one player in game.

**My command did nothing in game.** Check the command text, that someone is in the server, and your in-game permission level. Log the response to see the result.

**Player data looks different from the guide.** The API can change. Print one raw object and use the fields you actually receive. Check PRC's docs.

**Logs repost after a restart.** Save the last timestamp to a file and load it on startup.

**Can several servers use one bot?** Yes. Store one key per server and pass it to the helper with `key`.

**Do I need a global key?** Not for a normal bot. Global keys are for large apps and are issued by PRC.

**Is it safe to show the join code?** Only show it where you trust the audience. Use staff channels or ephemeral replies.

**The bot works locally but not on my host.** Check the `.env` values exist on the host, Node is 18 or newer, and the host allows outgoing web requests.
