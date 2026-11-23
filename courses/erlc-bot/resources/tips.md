# Tips
**1. Test requests outside your bot first.** Use a tool like Postman to see the real JSON, then write code for it.

**2. Print the raw response once.** Field names are case sensitive. Look before you code.

**3. Cache everything you can.** 10 to 15 seconds of cache prevents rate limits when many people use a command.

**4. Never hammer the API.** Poll logs every 15 to 30 seconds, not every second.

**5. Treat the server key like a password.** Env file only, never in chat or Git.

**6. Allow-list commands.** Never forward raw user text as an in-game command.

**7. Log every in-game command sent from Discord.** Who, what and when.

**8. Handle an empty server.** Some calls fail or return nothing when nobody is in game. Show a friendly message.

**9. Use timestamps correctly.** The API gives unix seconds, and Discord shows them with `<t:SECONDS:R>`.

**10. Store the last log timestamp.** Save it to a file so a restart doesn't repost old logs.

**11. Wrap every API call in try/catch.** The game server and Roblox can have bad moments.

**12. Keep a staff-only channel for errors.** You'll spot problems before users do.

**13. Version your code with Git** (without secrets), so you can roll back a bad update.

**14. Respect PRC's rules** and expect the API to evolve.
