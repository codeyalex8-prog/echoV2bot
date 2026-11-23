# Glossary
**ER:LC:** Emergency Response: Liberty County, the Roblox roleplay game.

**Private server:** a server you own or manage in ER:LC. The API works per private server.

**PRC:** the team behind ER:LC and its API.

**API:** a way for programs to talk to each other with web requests.

**Endpoint:** one address of the API, like `/server/players`.

**Server key:** the secret that identifies your private server to the API. Sent in the `Server-Key` header.

**Global API key:** a special key PRC can issue to large apps serving many servers.

**Header:** extra information sent with a request (your key goes here).

**JSON:** the text format the API replies with.

**GET / POST:** GET reads data. POST sends data (like a command).

**Status code:** the number telling you how it went. 200 ok, 403 unauthorized, 429 too many requests, 500 server problem.

**Rate limit:** how fast you may call the API.

**Cache:** a short-term copy of an answer so you don't ask again too soon.

**Polling:** asking the API on a timer to look for new data.

**Timestamp:** a time as unix seconds, like `1704614400`.

**Roblox ID:** the unique number of a Roblox account. The API gives players as `Name:Id`.

**Allow-list:** a fixed list of things that are permitted. Safer than trying to block bad things.

**Slash command:** a Discord command you start with `/`.

**Interaction:** what Discord sends your bot when someone uses a command or button.

**Ephemeral:** a reply only the user can see.
