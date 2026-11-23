# Glossary: words you'll see everywhere
**Application:** your bot's identity on Discord, created in the Developer Portal.

**Token:** the secret password that lets code log in as your bot. Never share it.

**Gateway:** the live connection between your bot and Discord that delivers events.

**Intent:** a switch that decides which events Discord sends your bot. Some are *privileged* (Server Members, Message Content, Presence) and must be enabled in the portal.

**Guild:** Discord's internal word for a **server**.

**Snowflake / ID:** the long number that identifies a user, channel, role, message or server. Get them with Developer Mode on.

**Interaction:** what Discord sends when someone uses a slash command, button, select menu or modal.

**Slash command:** a command typed with `/`. Defined by its name, description and options.

**Option:** an input to a slash command (a user, a number, some text).

**Subcommand:** a command nested under another, like `/todo add`.

**Ephemeral:** a reply only the person who triggered it can see.

**Defer:** telling Discord "I'm working on it" so you get more than 3 seconds to answer.

**Embed:** a styled message box with a title, description, fields and colour.

**Component:** an interactive part of a message: buttons, select menus, modals.

**customId:** the label you give a component so your code knows which one was used.

**Components V2:** the newer layout system (containers, text displays, separators, media galleries) used by panels like these.

**Collector:** code that waits for components or messages for a limited time.

**Cache:** discord.js's memory of servers, channels and members, so it doesn't ask Discord every time.

**Partial:** an object with only some data loaded, which you may need to `fetch()` fully.

**Rate limit:** Discord's cap on how fast you can call it. discord.js waits for you, but spamming still gets you slowed down.

**Webhook:** a URL that lets something post into a channel without a full bot.

**Permission:** a flag such as `ManageRoles` or `BanMembers`, used on roles, channels and the bot's invite.

**Environment variable:** a value (like your token) stored outside the code, in `.env`.

**npm / package:** Node's package manager and the libraries you install with it, such as `discord.js` and `dotenv`.

**Async / await:** how JavaScript waits for slow things (Discord, files) without freezing. Use `await` inside `async` functions.
