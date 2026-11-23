# FAQ and fixes
**My slash commands don't show up.** Run `node deploy-commands.js`, check `CLIENT_ID` and `GUILD_ID`, and make sure the bot was invited with the `applications.commands` scope.

**"Used disallowed intents."** You requested a privileged intent in code that is off in the Developer Portal (Bot page). Turn it on or remove it from your code.

**"Missing Permissions" or "Missing Access."** Check the bot's role position (it must be above the roles it manages) and its permissions in that channel.

**"The application did not respond."** You took more than 3 seconds. Use `await interaction.deferReply()` first, then `editReply`.

**"Interaction has already been acknowledged."** You replied twice. Reply once, then use `followUp` or `editReply`.

**"Unknown interaction."** The interaction expired (3 seconds to reply, 15 minutes to edit). Defer earlier.

**TokenInvalid.** Reset the token in the Developer Portal and paste the new one in `.env` with no quotes or spaces.

**The bot is online but ignores messages.** Reading normal messages needs the **Message Content Intent** in code and in the portal. Slash commands don't need it.

**Cannot find module.** You're in the wrong folder, or you skipped `npm install`.

**My bot went offline when I closed the terminal.** It only runs while the program runs. Host it (VPS with pm2, or a bot host).

**Is it free?** Building and running a small bot costs nothing. Hosting is the only possible cost.

**How do I learn JavaScript fast?** Build small projects and read the errors. The Videos and links menu has places to start.
