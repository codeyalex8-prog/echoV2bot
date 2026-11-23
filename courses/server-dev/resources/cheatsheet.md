# Cheat sheet: layouts and permissions
**Starter channel layout**
```
INFORMATION: welcome, rules, announcements, faq
COMMUNITY:   general, media, suggestions
SUPPORT:     open-a-ticket, help
VOICE:       General, Chill
STAFF:       staff-chat, mod-logs, staff-commands
```
**Role order (top to bottom)**
```
Owner > Admin > Moderator > Helper > Bots > Client/Booster > Member > Unverified > @everyone
```
**Permissions recipes**
- *Hidden staff channel:* `@everyone` deny View Channel, Staff allow View Channel
- *Read-only channel:* `@everyone` allow View, deny Send Messages
- *Verification channel:* `Unverified` allow View + read, `Member` deny View
- *Announcements:* only staff allow Send Messages and Mention @everyone

**Punishment ladder**
Warn, short timeout, long timeout or kick, ban. Severe cases skip straight to ban.

**Safe defaults**
Verification: Medium or higher. Explicit filter: all members. 2FA for moderation: on. Notifications: only @mentions.

**Where things are**
- Roles: Server Settings > Roles
- AutoMod and verification: Server Settings > Safety Setup / Moderation
- Onboarding: Server Settings > Onboarding
- Insights: Server Settings > Server Insights
- Audit Log: Server Settings > Audit Log
- Template: Server Settings > Server Template
- Check role view: Roles > menu > View Server As Role

**Moderator quick actions**
Right click a member to **Timeout** or **Ban**. Always add a reason so it appears in the log.
