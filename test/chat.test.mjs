// Runs the rule-based chatbot against the quick replies + free-typed questions.
import { reply } from '../src/lib/chatEngine.js'
import CHAT from '../src/data/chatbot.json' with { type: 'json' }
import assert from 'assert'
const ctx = { now: new Date('2026-09-26T09:30:00'), coords: null } // a Saturday morning
const qs = [...CHAT.quickReplies, 'where can I buy tomatoes', 'is souq waqif open?', 'honey', 'what about apples', 'dates', 'show organic', 'markets this weekend', 'is it open in summer', 'camel milk', 'markets on tuesday', 'blah blah qwerty', 'can I pay by card', 'how do I export my list', 'show me dairy', 'al waab organic market hours']
for (const q of qs) {
  const r = reply(q, ctx)
  assert.ok(r.text && r.text.length > 10, q)
  console.log(`> ${q}\n  ${r.text.slice(0, 150)}${r.text.length > 150 ? '…' : ''}\n  links: ${(r.links || []).map((l) => l.to).join(' ')}`)
}
assert.match(reply('where can I buy tomatoes', ctx).text, /Tomatoes/)
assert.match(reply('is souq waqif open?', ctx).text, /Souq Waqif Market Hall/)
assert.match(reply('What markets are open today?', ctx).text, /open/)
assert.match(reply('blah blah qwerty', ctx).text, /not sure/)
console.log('chat tests passed')
assert.match(reply('How do bookmarks work?', ctx).text, /heart/)
assert.match(reply('al waab organic market hours', ctx).text, /Al Waab Organic Market, Al Waab/)
console.log('regression tests passed')
