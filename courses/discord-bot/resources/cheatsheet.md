# Quick cheat sheet
**Replying**
```js
await interaction.reply('text');
await interaction.reply({ content: 'private', flags: MessageFlags.Ephemeral });
await interaction.deferReply();            // then:
await interaction.editReply('done');
await interaction.followUp('another message');
```
**Reading options**
```js
interaction.options.getString('name');
interaction.options.getInteger('amount');
interaction.options.getUser('user');
interaction.options.getSubcommand();
```
**Who / where**
```js
interaction.user.id        interaction.member.roles.cache
interaction.guild.name     interaction.channel.send('hi')
```
**Fetching things**
```js
const member = await guild.members.fetch(userId);
const channel = await client.channels.fetch(channelId);
const role = guild.roles.cache.get(roleId);
```
**Roles and moderation**
```js
await member.roles.add(role);
await member.roles.remove(role);
await member.timeout(10 * 60 * 1000, 'reason');   // 10 minutes
await member.kick('reason');
await guild.members.ban(userId, { reason: 'reason' });
await channel.bulkDelete(10, true);
```
**Permission check**
```js
if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
  return interaction.reply({ content: 'No permission.', flags: MessageFlags.Ephemeral });
}
```
**Embed**
```js
new EmbedBuilder().setTitle('Title').setDescription('Text').setColor(0x2b2d31)
```
**Buttons and menus**
```js
if (interaction.isButton()) { /* interaction.customId */ }
if (interaction.isStringSelectMenu()) { /* interaction.values[0] */ }
await interaction.update({ content: 'edited in place' });
await interaction.deferUpdate();
```
**Timestamps in text**
`<t:1700000000:R>` shows "2 hours ago". Get seconds with `Math.floor(Date.now() / 1000)`.

**Mentions without pinging**
`allowedMentions: { parse: [] }` on any message.

**Commands you run in the terminal**
```
npm install discord.js dotenv     node deploy-commands.js
npm start                         pm2 logs my-bot
```
