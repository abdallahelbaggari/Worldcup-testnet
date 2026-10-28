// WorldCup competition catalogue. Each entry maps to an ID per data provider.
// fd = football-data.org v4 competition id, af = API-Football (api-sports) league id.
// null means that provider does not offer the competition; the app shows it as
// "not in the current data plan" instead of pretending to cover it.
// API-Football IDs: confirm against GET /leagues?id=<id> after you get a key —
// the competition page always shows the provider's own name for the ID.

export const GROUPS = ['World Cup', 'International', 'Qualifiers', 'Club football'];

// National-team football first. Entries the data plan doesn't cover are hidden in the app and
// switch on automatically if the plan includes them later. cup: true → bracket view.
export const CATALOGUE = [
  { key: 'wc', name: 'FIFA World Cup', country: 'World', group: 'World Cup', fd: 2000, af: 1, cup: true },
  { key: 'euro', name: 'European Championship', country: 'Europe', group: 'International', fd: 2018, af: 4, cup: true },
  { key: 'afcon', name: 'Africa Cup of Nations', country: 'Africa', group: 'International', fd: null, af: 6, cup: true },
  { key: 'copaam', name: 'WorldCup América', country: 'South America', group: 'International', fd: null, af: 9, cup: true },
  { key: 'asian', name: 'AFC Asian Cup', country: 'Asia', group: 'International', fd: null, af: 7, cup: true },
  { key: 'gold', name: 'CONCACAF Gold Cup', country: 'North America', group: 'International', fd: null, af: 22, cup: true },
  { key: 'unl', name: 'UEFA Nations League', country: 'Europe', group: 'International', fd: null, af: 5, cup: true },
  { key: 'friendlies', name: 'International Friendlies', country: 'World', group: 'International', fd: null, af: 10 },
  { key: 'wwc', name: "FIFA Women's World Cup", country: 'World', group: 'International', fd: null, af: 8, cup: true },
  { key: 'wcqeu', name: 'World Cup Qualifiers — Europe', country: 'Europe', group: 'Qualifiers', fd: null, af: 32 },
  { key: 'wcqaf', name: 'World Cup Qualifiers — Africa', country: 'Africa', group: 'Qualifiers', fd: null, af: 29 },
  { key: 'wcqsa', name: 'World Cup Qualifiers — South America', country: 'South America', group: 'Qualifiers', fd: null, af: 34 },
  { key: 'wcqas', name: 'World Cup Qualifiers — Asia', country: 'Asia', group: 'Qualifiers', fd: null, af: 30 },
  { key: 'ucl', name: 'UEFA Champions League', country: 'Europe', group: 'Club football', fd: 2001, af: 2, cup: true },
  { key: 'epl', name: 'Premier League', country: 'England', group: 'Club football', fd: 2021, af: 39 },
  { key: 'laliga', name: 'La Liga', country: 'Spain', group: 'Club football', fd: 2014, af: 140 },
  { key: 'seriea', name: 'Serie A', country: 'Italy', group: 'Club football', fd: 2019, af: 135 },
  { key: 'bundesliga', name: 'Bundesliga', country: 'Germany', group: 'Club football', fd: 2002, af: 78 },
  { key: 'ligue1', name: 'Ligue 1', country: 'France', group: 'Club football', fd: 2015, af: 61 },
  { key: 'brasileirao', name: 'Brasileirão Série A', country: 'Brazil', group: 'Club football', fd: 2013, af: 71 },
];

const FD_CODES = {2021:"PL", 2001:"CL", 2014:"PD", 2019:"SA", 2002:"BL1", 2015:"FL1", 2016:"ELC", 2003:"DED", 2017:"PPL", 2000:"WC", 2018:"EC", 2013:"BSA"};

export function catalogueFor(provider) {
  const field = provider === 'api-football' ? 'af' : 'fd';
  return CATALOGUE.map((c, i) => ({
    id: c[field] ?? null,
    key: c.key,
    name: c.name,
    country: c.country,
    group: c.group,
    priority: i,
    cup: !!c.cup,
    covered: c[field] != null,
    logo: c[field] == null ? null : field === 'af'
      ? `https://media.api-sports.io/football/leagues/${c.af}.png`
      : FD_CODES[c.fd] ? `https://crests.football-data.org/${FD_CODES[c.fd]}.png` : null,
  }));
}

export function priorityOf(provider, compId) {
  let field = provider === 'api-football' ? 'af' : 'fd';
  let id = compId;
  if (provider === 'hybrid' && /^a\d+$/.test(String(compId))) { field = 'af'; id = String(compId).slice(1); }
  const i = CATALOGUE.findIndex((c) => c[field] === Number(id));
  return i === -1 ? 999 : i;
}
