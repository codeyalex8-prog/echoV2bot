# Tips from experience
**1. Build in a test server.** Never test new code in your main server. Make a free second server just for the bot.

**2. Read the error, top line first.** Most errors tell you the file and line. Read the first lines before you search anything.

**3. Make small changes and run often.** Add one thing, restart, test. If it breaks, you know exactly what caused it.

**4. Commit your code with Git.** Even if you never share it, Git lets you undo a mistake. Keep `.env` out of it.

**5. Don't copy code you don't understand.** Paste it, then change one value and see what happens. That is how it sticks.

**6. Check permissions when something "does nothing."** Most silent failures are the bot's role being below the target role, or a missing channel permission.

**7. Always reply to an interaction within 3 seconds.** If the work is slow, use `deferReply()` first.

**8. Use ephemeral replies for private or noisy output.** Errors, settings and personal info should only be seen by the user.

**9. Validate user input.** Never trust text from users: limit lengths, check numbers, and never run it as code.

**10. Log what matters.** A `console.log` when something important happens saves hours when debugging later.

**11. Keep one file per command.** It stays tidy and you always know where to look.

**12. Update carefully.** Read the discord.js release notes before updating a big version. Updating one thing at a time is easier than fixing everything.

**13. Ask good questions.** When asking for help, include what you wanted, what happened, the full error and the code around it. Never include your token.

**14. Back up your data.** If you use `data.json`, copy it somewhere safe regularly.

**15. Take breaks.** Stuck for an hour? Walk away. Fresh eyes spot the typo in two minutes.
