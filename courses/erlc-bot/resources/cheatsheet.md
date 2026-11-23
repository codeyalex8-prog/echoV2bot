# Cheat sheet
**Base and header**
```
https://api.policeroleplay.community/v1
Server-Key: YOUR_KEY
```
**Endpoints (v1)**
```
GET  /server            status
GET  /server/players    players ("Name:Id")
GET  /server/queue      Roblox IDs in queue
GET  /server/joinlogs   joins and leaves
GET  /server/killlogs   kills
GET  /server/commandlogs commands used
GET  /server/modcalls   moderator calls
GET  /server/bans       bans
GET  /server/vehicles   vehicles
POST /server/command    { "command": ":h Hello" }
```
**Status codes**
`200` ok - `403` bad key - `429` slow down - `500` server or Roblox trouble

**Helper**
```js
const { erlc, cached } = require('./src/erlc');
await erlc('/server/command', { method: 'POST', body: { command: ':h Hi' } });
const players = await cached('/server/players');
```
**Parse a player**
```js
const [name, id] = String(p.Player).split(':');
```
**Roblox links**
`https://www.roblox.com/users/ID/profile`

**Discord time**
`<t:UNIX_SECONDS:R>` relative, `<t:UNIX_SECONDS:f>` full

**Safe command rule**
Build commands yourself (`':h ' + cleanedText`). Never forward raw input.

**Timers**
```js
setInterval(() => poll().catch(console.error), 20000);
```
