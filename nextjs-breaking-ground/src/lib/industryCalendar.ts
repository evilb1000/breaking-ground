/**
 * Upcoming events for the site banner come from the public
 * WPA Construction Industry Calendar. No API key.
 *
 * The banner shows the soonest event that has not ended:
 * inside 14 days, otherwise inside 28, otherwise inside 42.
 * Farther out than that, the caller keeps the Sanity banner.
 */

const CALENDAR_ID = "wpaconstructionindustry@gmail.com"
const ICS_URL = `https://calendar.google.com/calendar/ical/${encodeURIComponent(CALENDAR_ID)}/public/basic.ics`
const TIME_ZONE = "America/New_York"
const LOOKAHEAD_DAYS = [14, 28, 42] as const
const REVALIDATE_SECONDS = 60 * 60

export type IndustryEvent = {
  title: string
  when: string
  venue: string | null
  href: string | null
}

type ParsedEvent = {
  title: string
  venue: string | null
  href: string | null
  allDay: boolean
  start: Date
  end: Date
  startKey: string
  endKey: string
}

function decodeIcs(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function unfold(ics: string): string {
  return ics.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "")
}

function field(body: string, name: string): string {
  const line = body.split("\n").find((entry) => entry.startsWith(name))
  if (!line) return ""
  return line.slice(line.indexOf(":") + 1).trim()
}

function easternDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}`
}

function addDays(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(Date.UTC(year, month - 1, day, 17, 0, 0))
}

function firstHref(urlField: string, description: string): string | null {
  const explicit = decodeIcs(urlField)
  if (/^https?:\/\//i.test(explicit)) return explicit
  const decoded = decodeIcs(description)
  const href = decoded.match(/href="(https?:\/\/[^"]+)"/i)?.[1]
  const bare = decoded.match(/https?:\/\/[^\s<"]+/i)?.[0]
  const link = (href || bare || "").replace(/[),.;]+$/, "")
  return /^https?:\/\//i.test(link) ? link : null
}

function venueName(location: string): string | null {
  const name = decodeIcs(location).split(",")[0]?.trim()
  return name || null
}

function parseWhen(line: string): { date: Date; key: string; allDay: boolean } | null {
  const value = line.slice(line.indexOf(":") + 1).trim()
  const allDay = /VALUE=DATE/i.test(line) || /^\d{8}$/.test(value)
  if (allDay) {
    const key = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    return { date: dateFromKey(key), key, allDay: true }
  }
  if (!/^\d{8}T\d{6}Z$/.test(value)) return null
  const date = new Date(
    Date.UTC(
      Number(value.slice(0, 4)),
      Number(value.slice(4, 6)) - 1,
      Number(value.slice(6, 8)),
      Number(value.slice(9, 11)),
      Number(value.slice(11, 13)),
      Number(value.slice(13, 15)),
    ),
  )
  return { date, key: easternDateKey(date), allDay: false }
}

function parseEvents(ics: string): ParsedEvent[] {
  const events: ParsedEvent[] = []
  for (const chunk of unfold(ics).split("BEGIN:VEVENT").slice(1)) {
    const body = chunk.split("END:VEVENT")[0] || ""
    if (/^STATUS:CANCELLED/m.test(body)) continue
    const title = decodeIcs(field(body, "SUMMARY"))
    const startLine = body.split("\n").find((entry) => entry.startsWith("DTSTART"))
    const endLine = body.split("\n").find((entry) => entry.startsWith("DTEND"))
    if (!title || !startLine || !endLine) continue
    const start = parseWhen(startLine)
    const end = parseWhen(endLine)
    if (!start || !end) continue
    events.push({
      title,
      venue: venueName(field(body, "LOCATION")),
      href: firstHref(field(body, "URL"), field(body, "DESCRIPTION")),
      allDay: start.allDay,
      start: start.date,
      end: end.date,
      startKey: start.key,
      endKey: end.key,
    })
  }
  return events
}

function hasNotEnded(event: ParsedEvent, now: Date, todayKey: string): boolean {
  if (event.allDay) return todayKey < event.endKey
  return event.end.getTime() > now.getTime()
}

function formatWhen(event: ParsedEvent): string {
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(event.allDay ? dateFromKey(event.startKey) : event.start)
  if (event.allDay) return date
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
  })
  return `${date}, ${time.format(event.start)}–${time.format(event.end)}`
}

export function pickIndustryEvent(events: ParsedEvent[], now = new Date()): IndustryEvent | null {
  const todayKey = easternDateKey(now)
  const upcoming = events
    .filter((event) => hasNotEnded(event, now, todayKey))
    .sort((a, b) => a.startKey.localeCompare(b.startKey) || a.start.getTime() - b.start.getTime())

  for (const days of LOOKAHEAD_DAYS) {
    const limit = addDays(todayKey, days)
    const match = upcoming.find((event) => event.startKey <= limit)
    if (!match) continue
    return {
      title: match.title,
      when: formatWhen(match),
      venue: match.venue,
      href: match.href,
    }
  }
  return null
}

export async function loadFeaturedIndustryEvent(now = new Date()): Promise<IndustryEvent | null> {
  const response = await fetch(ICS_URL, {
    headers: { "User-Agent": "BreakingGround/1.0" },
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!response.ok) {
    throw new Error(`Industry calendar request failed (${response.status})`)
  }
  return pickIndustryEvent(parseEvents(await response.text()), now)
}
