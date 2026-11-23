// ============================================================================================================
//  COURSES: sold as Roblox Game Passes. The pack is delivered to the buyer's DMs.
//    /coursepanel (owner)   posts the store panel: dropdown, Link Roblox, Claim, My courses
//    /link                  the moment a Roblox account is linked, every course pass it owns is sent to the DMs
//    Claim button           checks the linked Roblox account for the passes and sends the pack
//    automatic watcher      after someone opens a course, their purchase is picked up within ~30s
//    the pack (DMs)         ONE message you flick through: First / Back / Next / Last, page menu, guides menu,
//                           Contents, Mark page done (progress), Progress, Help.  Grey buttons, NO emoji in DMs.
//  Courses live in /courses/<id>/ (course.json with gamepassId + 01.md, 02.md ... + resources/*.md). Add a folder to add a course.
//  Emoji (your white icons) are only used on the store panel, never inside the DM pack.
// ============================================================================================================
const fs = require('fs');
const path = require('path');
const {
  ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
  PermissionFlagsBits: P, MessageFlags,
} = require('discord.js');
const cfg = require('./config');
const { db, save } = require('./db');
const ui = require('./ui');
const { E, tag } = require('./emojis');
const { add, sc, linkRoblox } = require('./commands');

const EPH = MessageFlags.Ephemeral;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const GREY = ButtonStyle.Secondary;
const S = () => {
  db.courseOwned ||= {}; db.courseClaims ||= {}; db.courseWatch ||= {}; db.courseProgress ||= {};
  return db;
};

// ---------------------------------------------------------------- load courses
const dir = path.join(__dirname, '..', 'courses');
const courses = new Map();
function loadCourses() {
  courses.clear();
  for (const id of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const base = path.join(dir, id);
    if (!fs.existsSync(path.join(base, 'course.json'))) continue;
    const meta = JSON.parse(fs.readFileSync(path.join(base, 'course.json'), 'utf8'));
    const readMd = f => { const [first, ...rest] = fs.readFileSync(f, 'utf8').trim().split('\n'); return { title: first.replace(/^#\s*/, '').trim(), body: rest.join('\n').trim() }; };
    const pages = fs.readdirSync(base).filter(f => /^\d+\.md$/.test(f)).sort().map(f => readMd(path.join(base, f)));
    const resources = (meta.resources || []).map(r => {
      const f = path.join(base, 'resources', r.file);
      return fs.existsSync(f) ? { id: r.id, label: r.label, description: r.description, ...readMd(f) } : null;
    }).filter(Boolean);
    const gamepassId = String(meta.gamepassId || '').replace(/\D/g, '');
    if (pages.length && gamepassId) courses.set(meta.id || id, { ...meta, id: meta.id || id, gamepassId, pages, resources });
  }
}
loadCourses();
const all = () => [...courses.values()];
const get = id => courses.get(id);
const passUrl = c => `https://www.roblox.com/game-pass/${c.gamepassId}`;
const icon = c => tag(E[c.panelIcon] || E.logo);

// ---------------------------------------------------------------- Roblox
async function ownsPass(robloxId, passId) {
  for (let a = 0; a < 2; a++) {
    try {
      const r = await fetch(`https://inventory.roblox.com/v1/users/${robloxId}/items/GamePass/${passId}/is-owned`, { signal: AbortSignal.timeout(8000) });
      if (r.status === 429 && a === 0) { await sleep(1500); continue; }
      if (!r.ok) return null;
      return (await r.text()).trim() === 'true';
    } catch { /* retry once */ }
  }
  return null;
}
const priceOf = async c => { try { return await require('./market').priceOf({ gamepassId: c.gamepassId }); } catch { return null; } };
const fmt = n => Number(n).toLocaleString('en-US');
const owned = (userId, courseId) => !!S().courseOwned[userId]?.[courseId];
const claimKey = (link, c) => `${link.robloxId}:${c.id}`;

// ---------------------------------------------------------------- the pack (DMs). NO emoji, grey buttons.
const done = (uid, cid) => (S().courseProgress[uid]?.[cid] || []);
function view(course, uid, st = {}) {
  const total = course.pages.length;
  const page = Math.min(Math.max(st.page || 0, 0), total - 1);
  let mode = st.mode || 'page';
  if (mode === 'res' && !course.resources.find(x => x.id === st.res)) mode = 'page';                                    // page | res | toc | prog | help
  const d = done(uid, course.id);
  let body;
  if (mode === 'res') { const r = course.resources.find(x => x.id === st.res); body = `-# ${course.title} | ${r.label}\n## ${r.title}\n${r.body}`; }
  else if (mode === 'toc') body = `-# ${course.title} | Contents\n## Contents\n${course.pages.map((p, i) => `**${i + 1}.** ${p.title}${d.includes(i) ? ' (done)' : ''}`).join('\n')}\n\nUse **Jump to a page** below, or press Back to return to page ${page + 1}.`;
  else if (mode === 'prog') {
    const pct = Math.round((d.length / total) * 100), filled = Math.round(pct / 5);
    body = `-# ${course.title} | Progress\n## Your progress\n\`[${'#'.repeat(filled)}${'-'.repeat(20 - filled)}] ${pct}%\`  ${d.length} of ${total} pages done\n\n${course.pages.map((p, i) => `${d.includes(i) ? '[x]' : '[ ]'} ${i + 1}. ${p.title}`).join('\n')}\n\n${d.length === total ? '**You finished the whole course. Well done!**' : 'Press **Mark page done** on each page when you have finished its checkpoint.'}`;
  } else if (mode === 'help') body = `-# ${course.title} | Help\n## How to use this pack\n**Back / Next / First / Last:** move through the pages. The message edits itself, nothing new is sent.\n**Jump to a page:** the first menu opens any page.\n**Guides, videos and tips:** the second menu has links, tips, a glossary, a cheat sheet, project ideas and an FAQ.\n**Contents:** the full list of pages.\n**Mark page done:** tick a page off when you finish it. Your progress is saved.\n**Progress:** see how far you are.\n\nLost your place? Open **Contents**. Deleted this message? Press **My courses** then **Resend** in the server, or use \`/mycourses\`.`;
  else body = `-# ${course.title} | Page ${page + 1} of ${total}\n## ${course.pages[page].title}\n${course.pages[page].body}`;

  const c = ui.base();
  c.addTextDisplayComponents(ui.text(body));
  c.addSeparatorComponents(ui.sep());
  const b = (id, label) => new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(GREY);
  if (mode === 'page') {
    c.addActionRowComponents(ui.row(
      b(`pk_nav:${course.id}:0`, 'First').setDisabled(page === 0),
      b(`pk_nav:${course.id}:${page - 1}`, 'Back').setDisabled(page === 0),
      b(`pk_x:${course.id}`, `${page + 1} / ${total}`).setDisabled(true),
      b(`pk_nav:${course.id}:${page + 1}`, 'Next').setDisabled(page === total - 1),
      b(`pk_nav:${course.id}:${total - 1}`, 'Last').setDisabled(page === total - 1)));
  } else {
    c.addActionRowComponents(ui.row(b(`pk_nav:${course.id}:${page}`, `Back to page ${page + 1}`)));
  }
  c.addActionRowComponents(ui.row(new StringSelectMenuBuilder().setCustomId(`pk_jump:${course.id}`).setPlaceholder('Jump to a page')
    .addOptions(course.pages.map((x, i) => ({ label: `${i + 1}. ${x.title}`.slice(0, 100), value: String(i), default: mode === 'page' && i === page, ...(d.includes(i) ? { description: 'Done' } : {}) })))));
  if (course.resources.length) c.addActionRowComponents(ui.row(new StringSelectMenuBuilder().setCustomId(`pk_res:${course.id}:${page}`).setPlaceholder('Guides, videos and tips')
    .addOptions(course.resources.map(r => ({ label: r.label.slice(0, 100), value: r.id, description: r.description.slice(0, 100), default: mode === 'res' && r.id === st.res })))));
  c.addActionRowComponents(ui.row(
    b(`pk_toc:${course.id}:${page}`, 'Contents'),
    b(`pk_done:${course.id}:${page}`, d.includes(page) ? 'Unmark page' : 'Mark page done'),
    b(`pk_prog:${course.id}:${page}`, `Progress ${d.length}/${total}`),
    b(`pk_help:${course.id}:${page}`, 'Help')));
  return ui.msg(ui.foot(c));
}

async function sendPack(user, course) {
  try { await (await user.createDM()).send(view(course, user.id, { page: 0 })); return { ok: true }; }
  catch (e) { return { ok: false, closed: e.code === 50007, why: e.message }; }
}

// give the course to a Discord user (records it, then DMs the pack)
async function grant(client, user, link, course, how) {
  const s = S();
  (s.courseOwned[user.id] ||= {})[course.id] = { at: Date.now(), robloxId: link?.robloxId, how };
  if (link) s.courseClaims[claimKey(link, course)] = user.id;
  save();
  const r = await sendPack(user, course);
  return r;
}
const dmHelp = r => r.closed ? 'I could not DM you because your DMs are closed. Open them (Server > Privacy Settings > Direct Messages) and press **My courses** > **Resend**.' : `I could not DM you (${r.why}).`;

// ---------------------------------------------------------------- panel
async function panel() {
  const list = all();
  const prices = await Promise.all(list.map(priceOf));
  const c = ui.base();
  c.addTextDisplayComponents(ui.text(
    `## ${tag(E.logo)} ${cfg.brand} Courses\nLearn to build it yourself, step by step. Buy a course with Robux, link your Roblox account, and the **full pack is sent straight to your DMs**. It's yours to keep.\n\n` +
    list.map((x, k) => `${icon(x)} **${x.title}**${prices[k] != null ? ` · **R$ ${fmt(prices[k])}**` : ''}\n-# ${x.tagline} · ${x.pages.length} pages`).join('\n\n') +
    `\n\n-# Pick a course below. Already bought? Use **/link** (or Link Roblox), and I'll send it to your DMs automatically.`));
  c.addSeparatorComponents(ui.sep());
  c.addActionRowComponents(ui.row(new StringSelectMenuBuilder().setCustomId('crs_select').setPlaceholder('Choose a course')
    .addOptions(list.map(x => ({ label: x.title.slice(0, 100), value: x.id, description: `${x.pages.length} pages` + (x.level ? ` · ${x.level}` : ''), emoji: E[x.panelIcon] || E.logo })))));
  c.addActionRowComponents(ui.row(
    new ButtonBuilder().setCustomId('crs_claim:all').setLabel('Claim my purchase').setEmoji(E.gift).setStyle(GREY),
    new ButtonBuilder().setCustomId('crs_link').setLabel('Link Roblox').setEmoji(E.share).setStyle(GREY),
    new ButtonBuilder().setCustomId('crs_mine').setLabel('My courses').setStyle(GREY)));
  return ui.foot(c);
}
async function refresh(client) {
  const p = db.panels?.courses; if (!p) return false;
  try { const m = await (await client.channels.fetch(p.channelId)).messages.fetch(p.messageId); await m.edit(ui.msg(await panel())); return true; } catch { return false; }
}

add(sc('coursepanel').setDescription('Owner: post the Courses store panel here').setDefaultMemberPermissions(P.Administrator), async i => {
  if (!cfg.isOwner(i.user.id)) return i.reply({ content: '**Owner only.**', flags: EPH });
  await i.deferReply({ flags: EPH });
  const m = await i.channel.send(ui.msg(await panel()));
  db.panels ||= {}; db.panels.courses = { channelId: i.channelId, messageId: m.id }; save();
  return i.editReply(`Course panel posted. ${all().length} course(s) loaded.`);
});
add(sc('mycourses').setDescription('See your courses and resend a pack to your DMs'), async i => mine(i));

async function mine(i) {
  const ids = Object.keys(S().courseOwned[i.user.id] || {}).filter(get);
  if (!ids.length) return i.reply(ui.eph(ui.note('You don\'t own a course yet. Pick one from the course panel, buy it, then use **/link**.')));
  const c = ui.base();
  c.addTextDisplayComponents(ui.text(`## Your courses\n${ids.map(id => { const x = get(id), d = done(i.user.id, id).length; return `${icon(x)} **${x.title}** · ${d}/${x.pages.length} pages done`; }).join('\n')}`));
  c.addActionRowComponents(ui.row(...ids.slice(0, 5).map(id => new ButtonBuilder().setCustomId(`crs_resend:${id}`).setLabel(`Resend: ${get(id).title}`.slice(0, 80)).setStyle(GREY))));
  return i.reply(ui.eph(ui.foot(c)));
}

// ---------------------------------------------------------------- claim (button) + on /link + watcher
const busy = new Set();
const NOT_LINKED = "**I don't see a linked Roblox account on your profile.**\nPress **Link Roblox** (or use `/link`) with the account you bought the pass on, then claim again.";

async function scan(link, list) {
  const res = [];
  for (const c of list) res.push(await ownsPass(link.robloxId, c.gamepassId));
  const hit = list.filter((_, k) => res[k] === true);
  return { hit, unknown: res.filter(r => r === null).length };
}
// returns { sent:[course], resent:[course], blocked:[course], unknown }
async function deliverFound(client, user, link, list) {
  const { hit, unknown } = await scan(link, list);
  const out = { sent: [], resent: [], blocked: [], unknown, failed: null, owned: hit };
  for (const c of hit) {
    const by = S().courseClaims[claimKey(link, c)];
    if (by && by !== user.id) { out.blocked.push(c); continue; }          // that Roblox account already unlocked it for another Discord user
    if (owned(user.id, c.id)) { out.resent.push(c); continue; }
    const r = await grant(client, user, link, c, 'gamepass');
    if (!r.ok) out.failed = r;
    out.sent.push(c);
    const price = await priceOf(c);
    if (price) { db.stats.robuxEarned = (db.stats.robuxEarned || 0) + price; }
    db.stats.courseSales = (db.stats.courseSales || 0) + 1; save();
    require('./tickets').saleLog(client, `${tag(E.money)} **Course purchase:** ${c.title}${price ? ` (${fmt(price)} R$)` : ''} by <@${user.id}> (Roblox: ${link.name}).`);
    await sleep(300);
  }
  return out;
}

async function claim(i, which) {
  const link = db.links[i.user.id];
  if (!link) return i.reply({ content: NOT_LINKED, flags: EPH });
  if (busy.has(i.user.id)) return i.reply({ content: 'I am already checking. Give me a moment.', flags: EPH });
  const list = which === 'all' ? all() : [get(which)].filter(Boolean);
  busy.add(i.user.id);
  try {
    await i.deferReply({ flags: EPH });
    const r = await deliverFound(i.client, i.user, link, list);
    const lines = [];
    if (r.sent.length) lines.push(r.failed ? `Found **${r.sent.map(c => c.title).join(', ')}**! ${dmHelp(r.failed)}` : `Found **${r.sent.map(c => c.title).join(', ')}** on **${link.name}**! The pack was sent to your DMs.`);
    if (r.resent.length) {
      const ok = []; for (const c of r.resent) { const x = await sendPack(i.user, c); if (x.ok) ok.push(c.title); else lines.push(dmHelp(x)); }
      if (ok.length) lines.push(`You already own **${ok.join(', ')}**, so I sent it again to your DMs.`);
    }
    if (r.blocked.length) lines.push(`**${r.blocked.map(c => c.title).join(', ')}** on **${link.name}** was already unlocked by a different Discord account. If that's a mistake, open a support ticket.`);
    if (!lines.length) lines.push(r.unknown
      ? `I couldn't read **${link.name}**'s inventory. Set **Who can see my inventory** to **Everyone** in Roblox privacy settings, then try again.`
      : `I couldn't find ${list.length > 1 ? 'any of these passes' : `**${list[0].title}**`} on **${link.name}** yet.\nBuy it with **this** Roblox account, wait a minute (Roblox can be slow), then press claim again.\n-# Linked the wrong account? Use \`/unlink\`, then \`/link\`.`);
    return i.editReply(lines.join('\n\n'));
  } catch (e) {
    console.error('course claim', e);
    return i.deferred ? i.editReply('Something went wrong. Please try again.') : i.reply({ content: 'Something went wrong. Please try again.', flags: EPH });
  } finally { busy.delete(i.user.id); }
}

// called by /link and the Link Roblox button right after a successful link
async function onLinked(client, user) {
  const link = db.links[user.id]; if (!link || !all().length || busy.has(user.id)) return;
  busy.add(user.id);
  try {
    const r = await deliverFound(client, user, link, all());
    const names = r.sent.map(c => c.title);
    if (names.length) user.send(ui.msg(ui.note(`I found your purchase of **${names.join(', ')}** on **${link.name}**. ${r.failed ? '' : 'Your pack is above.'}`))).catch(() => {});
  } catch (e) { console.error('course onLinked', e.message); } finally { busy.delete(user.id); }
}

let ticking = false;
async function tick(client) {
  if (ticking) return; ticking = true;
  try {
    const now = Date.now();
    for (const [uid, w] of Object.entries(S().courseWatch)) {
      const link = db.links[uid];
      const list = (w.items || []).map(get).filter(Boolean).filter(c => link && !owned(uid, c.id));
      if (!link || w.until < now || !list.length) { delete S().courseWatch[uid]; save(); continue; }
      if (busy.has(uid)) continue;
      busy.add(uid);
      try {
        const user = await client.users.fetch(uid);
        const r = await deliverFound(client, user, link, list);
        if (r.sent.length) { delete S().courseWatch[uid]; save(); user.send(ui.msg(ui.note(`I found your purchase of **${r.sent.map(c => c.title).join(', ')}**. Your pack is above.`))).catch(() => {}); }
      } catch (e) { console.error('course watch', uid, e.message); } finally { busy.delete(uid); }
      await sleep(400);
    }
  } finally { ticking = false; }
}

// ---------------------------------------------------------------- course detail (after the dropdown)
async function detail(i, course) {
  const link = db.links[i.user.id], price = await priceOf(course), has = owned(i.user.id, course.id);
  if (link && !has) { const w = S().courseWatch[i.user.id]; S().courseWatch[i.user.id] = { items: [...new Set([...(w && w.until > Date.now() ? w.items : []), course.id])], until: Date.now() + 45 * 60e3 }; save(); }
  const c = ui.base();
  c.addTextDisplayComponents(ui.text(
    `## ${icon(course)} ${course.title}\n${course.tagline}\n\n**Price:** ${price != null ? `R$ ${fmt(price)}` : 'see Roblox'} · **Level:** ${course.level || 'All levels'} · **Length:** ${course.pages.length} pages + ${course.resources.length} guides\n\n` +
    `### What you'll learn\n${(course.learn || []).map(x => `• ${x}`).join('\n')}\n\n### Inside the pack\n${course.pages.map((p, k) => `**${k + 1}.** ${p.title}`).join('\n')}\n` +
    `**Guides menu:** ${course.resources.map(r => r.label).join(', ')}\n\n` +
    (has ? `${tag(E.thumbsup)} **You own this course.** Press Resend to get it in your DMs again.`
      : link ? `**Linked Roblox account:** [${link.name}](https://www.roblox.com/users/${link.robloxId}/profile)\n-# Buy with **this** account. I check for 45 minutes and DM you the pack automatically.`
        : `${tag(E.bell)} **Link your Roblox account first** (Link Roblox button or \`/link\`) so I can find your purchase.`)));
  c.addSeparatorComponents(ui.sep());
  c.addActionRowComponents(ui.row(
    has ? new ButtonBuilder().setCustomId(`crs_resend:${course.id}`).setLabel('Resend to my DMs').setStyle(GREY)
      : new ButtonBuilder().setLabel('Buy on Roblox').setStyle(ButtonStyle.Link).setURL(passUrl(course)),
    new ButtonBuilder().setCustomId(`crs_claim:${course.id}`).setLabel('I bought it, send it').setEmoji(E.gift).setStyle(GREY).setDisabled(has),
    link ? new ButtonBuilder().setCustomId('crs_mine').setLabel('My courses').setStyle(GREY)
      : new ButtonBuilder().setCustomId('crs_link').setLabel('Link Roblox').setEmoji(E.share).setStyle(GREY)));
  return i.reply(ui.eph(ui.foot(c)));
}

// ---------------------------------------------------------------- interactions
const linkModal = () => new ModalBuilder().setCustomId('crs_link_modal').setTitle('Link your Roblox account')
  .addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('username').setLabel('Roblox username')
    .setStyle(TextInputStyle.Short).setRequired(true).setMinLength(3).setMaxLength(20).setPlaceholder('Your exact Roblox username')));

const canRead = (uid, cid) => owned(uid, cid) || cfg.isOwner(uid);
async function onSelect(i) {
  if (i.customId === 'crs_select') { const c = get(i.values[0]); if (!c) return true; await detail(i, c); refresh(i.client).catch(() => {}); return true; }
  if (!i.customId.startsWith('pk_')) return false;
  const [id, cid, n] = i.customId.split(':');
  const course = get(cid);
  if (!course || !canRead(i.user.id, cid)) { await i.reply({ content: 'You don\'t own that course.', flags: EPH }); return true; }
  if (id === 'pk_jump') await i.update(view(course, i.user.id, { page: parseInt(i.values[0], 10) }));
  else if (id === 'pk_res') await i.update(view(course, i.user.id, { mode: 'res', res: i.values[0], page: parseInt(n, 10) }));
  else await i.deferUpdate();
  return true;
}
async function onButton(i) {
  const [id, arg, n] = i.customId.split(':');
  if (id === 'crs_claim') { await claim(i, arg); return true; }
  if (id === 'crs_link') { await i.showModal(linkModal()); return true; }
  if (id === 'crs_mine') { await mine(i); return true; }
  if (id === 'crs_resend') {
    const c = get(arg);
    if (!c || !canRead(i.user.id, arg)) { await i.reply({ content: 'You don\'t own that course.', flags: EPH }); return true; }
    await i.deferReply({ flags: EPH });
    const r = await sendPack(i.user, c);
    await i.editReply(r.ok ? 'Sent to your DMs. Check your messages.' : dmHelp(r));
    return true;
  }
  if (!id.startsWith('pk_')) return false;
  const course = get(arg);
  if (!course || !canRead(i.user.id, arg)) { await i.reply({ content: 'You don\'t own that course.', flags: EPH }); return true; }
  const page = parseInt(n, 10) || 0;
  if (id === 'pk_nav') await i.update(view(course, i.user.id, { page }));
  else if (id === 'pk_toc') await i.update(view(course, i.user.id, { mode: 'toc', page }));
  else if (id === 'pk_prog') await i.update(view(course, i.user.id, { mode: 'prog', page }));
  else if (id === 'pk_help') await i.update(view(course, i.user.id, { mode: 'help', page }));
  else if (id === 'pk_done') {
    const p = (S().courseProgress[i.user.id] ||= {}); const d = (p[arg] ||= []);
    const at = d.indexOf(page); if (at >= 0) d.splice(at, 1); else d.push(page);
    save(); await i.update(view(course, i.user.id, { page }));
  } else await i.deferUpdate();
  return true;
}
async function onModal(i) {
  if (i.customId !== 'crs_link_modal') return false;
  await i.deferReply({ flags: EPH });
  await linkRoblox(i, i.fields.getTextInputValue('username').trim());      // onLinked() runs inside linkRoblox
  return true;
}

module.exports = { onSelect, onButton, onModal, tick, onLinked, refresh, panel, reload: loadCourses, courses };
