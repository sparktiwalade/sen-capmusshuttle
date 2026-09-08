'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, Bell, Bus, CalendarDays, Check, ChevronRight,
  CircleHelp, Clock3, Crosshair, ExternalLink, Heart, Home, LocateFixed,
  MapPin, Menu, Navigation, Search,   Settings2, Star, X,
} from 'lucide-react'
import { AccountControls } from '@/components/account-controls'

// -----------------------------------------------------------------------------
// Campus data: edit routes and stops here.
// -----------------------------------------------------------------------------
type View = 'home' | 'routes' | 'route' | 'stops' | 'schedules' | 'about'
type RouteId = 'A' | 'B' | 'C'
type Stop = { name: string; short: string; lat: number; lng: number }
type Route = { id: RouteId; name: string; color: string; description: string; minutes: number; stops: Stop[] }

const stops: Stop[] = [
  { name: 'Campus Gate', short: 'CG', lat: 7.5188, lng: 4.5276 },
  { name: 'SUB', short: 'SB', lat: 7.5153, lng: 4.5291 },
  { name: 'Faculty Area', short: 'FA', lat: 7.513, lng: 4.534 },
  { name: 'Student Union', short: 'SU', lat: 7.5109, lng: 4.5312 },
  { name: 'Halls of Residence', short: 'HR', lat: 7.5066, lng: 4.5354 },
  { name: 'Student Village', short: 'SV', lat: 7.5035, lng: 4.5279 },
]

const routes: Route[] = [
  { id: 'A', name: 'Route A', color: '#2463d4', description: 'Campus Gate → Halls of Residence', minutes: 20, stops: [stops[0], stops[1], stops[3], stops[2], stops[4]] },
  { id: 'B', name: 'Route B', color: '#14a064', description: 'Campus Gate → Faculty Area', minutes: 15, stops: [stops[0], stops[1], stops[2]] },
  { id: 'C', name: 'Route C', color: '#8b4fdb', description: 'Student Village → Campus Gate', minutes: 25, stops: [stops[5], stops[3], stops[0]] },
]

const departures = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM']

function getNextDeparture() {
  const now = new Date()
  const hour = now.getHours()
  const minute = now.getMinutes()
  const nextHour = Math.max(8, Math.min(16, hour + (minute > 0 ? 1 : 0)))
  if (hour >= 16) return { label: '8:00 AM', remaining: 'Tomorrow morning' }
  const minutesAway = nextHour * 60 - (hour * 60 + minute)
  const labelHour = nextHour > 12 ? nextHour - 12 : nextHour
  return { label: `${labelHour}:00 ${nextHour >= 12 ? 'PM' : 'AM'}`, remaining: `${minutesAway} min away` }
}

// -----------------------------------------------------------------------------
// Homepage hero: this is the main area to edit when changing the homepage.
// -----------------------------------------------------------------------------
function HeroSection({ goTo }: { goTo: (view: View) => void }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h2>Welcome to</h2>
        <h1>Campus <span>Shuttle</span></h1>
        <p>Find your campus shuttle route, check bus stops, view schedules and never miss your ride.</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => goTo('routes')}><Navigation size={16} /> View routes</button>
          <button className="secondary-button" onClick={() => goTo('stops')}><MapPin size={16} /> View bus stops</button>
          <button className="secondary-button" onClick={() => goTo('schedules')}><Clock3 size={16} /> View schedules</button>
        </div>
      </div>
      <div className="hero-visual">
        <img className="bus-hero-image" src="/images/campus-shuttle-bus.png" alt="Blue Campus Shuttle bus on the OAU campus road" />
      </div>
    </section>
  )
}

function Header({ view, goTo, onMenu }: { view: View; goTo: (view: View) => void; onMenu: () => void }) {
  const links: View[] = ['home', 'routes', 'stops', 'schedules']
  return <header className="topbar"><button className="brand" onClick={() => goTo('home')}><span className="brand-icon"><Bus size={20} /></span><span>Campus <b>Shuttle</b></span></button><nav className="desktop-nav" aria-label="Primary navigation">{links.map(link => <button key={link} className={view === link || (link === 'routes' && view === 'route') ? 'active' : ''} onClick={() => goTo(link)}>{link[0].toUpperCase() + link.slice(1)}</button>)}</nav><div className="header-actions"><button className="icon-button" aria-label="Search" onClick={() => goTo('routes')}><Search size={18} /></button><AccountControls /><button className="menu-button icon-button" aria-label="Open menu" onClick={onMenu}><Menu size={20} /></button></div></header>
}

function BottomNav({ view, goTo }: { view: View; goTo: (view: View) => void }) {
  const items = [['home', Home], ['routes', Navigation], ['stops', MapPin], ['schedules', CalendarDays] ] as const
  return <nav className="bottom-nav">{items.map(([name, Icon]) => <button key={name} className={view === name || (name === 'routes' && view === 'route') ? 'active' : ''} onClick={() => goTo(name)}><Icon size={18} /><span>{name[0].toUpperCase() + name.slice(1)}</span></button>)}</nav>
}

function QuickAccess({ goTo, locate }: { goTo: (view: View) => void; locate: () => void }) {
  const items = [
    ['Routes', 'Explore campus routes', 'blue', Navigation, 'routes'],
    ['Bus stops', 'Find a nearby stop', 'green', MapPin, 'stops'],
    ['Schedules', 'Check departure times', 'purple', Clock3, 'schedules'],
    ['Estimated departure', 'See next available bus time', 'orange', Clock3, 'locate'],
  ] as const
  return <section className="section-block"><div className="section-heading"><div><span className="section-kicker">Quick access</span><h2>Plan your trip</h2></div><button className="text-button" onClick={() => goTo('about')}>How it works <ArrowRight size={15} /></button></div><div className="quick-grid">{items.map(([title, text, color, Icon, action]) => <button key={title} onClick={() => action === 'locate' ? locate() : goTo(action as View)}><span className={`quick-icon ${color}`}><Icon size={20} /></span><strong>{title}</strong><small>{text}</small></button>)}</div></section>
}

function MapPanel({ activeRoute, locating, locate }: { activeRoute?: Route; locating: boolean; locate: () => void }) {
  return <div className="map-panel" aria-label="Campus shuttle map"><div className="map-grid" /><div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" /><div className="map-label map-label-one">OAU CAMPUS</div><div className="map-label map-label-two">Ile-Ife</div>{activeRoute?.stops.map((stop, index) => <div className="map-stop" key={stop.name} style={{ left: `${18 + index * 17}%`, top: `${62 - (index % 3) * 15}%`, background: activeRoute.color }} title={stop.name}>{index + 1}</div>)}<div className="map-control-stack"><button className="map-control" onClick={locate} aria-label="Use my location"><LocateFixed size={17} /></button><button className="map-control" aria-label="Open Google Maps" onClick={() => window.open('https://maps.google.com/?q=Obafemi+Awolowo+University', '_blank')}><ExternalLink size={16} /></button></div><div className="map-credit">Google Maps ready · OAU campus</div>{locating && <div className="location-toast"><Crosshair size={15} /> Requesting your location…</div>}</div>
}

function RouteCard({ route, favorite, onSelect, onFavorite }: { route: Route; favorite: boolean; onSelect: () => void; onFavorite: () => void }) {
  return <article className="route-card" onClick={onSelect}><div className="route-badge" style={{ background: route.color }}>{route.id}</div><div className="route-card-copy"><div className="route-card-title"><h3>{route.name}</h3><span className="favorite-wrap"><button className={`favorite ${favorite ? 'saved' : ''}`} aria-label={`${favorite ? 'Remove' : 'Save'} ${route.name}`} onClick={event => { event.stopPropagation(); onFavorite() }}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button><ChevronRight size={18} /></span></div><p>{route.description}</p><span className="route-time"><Clock3 size={13} /> {route.minutes} min</span></div></article>
}

function PageHeading({ title, description, query, setQuery, placeholder = '' }: { title: string; description: string; query?: string; setQuery?: (query: string) => void; placeholder?: string }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{setQuery && <label className="search-box"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>}</div>
}

function ScheduleTable() {
  return <div className="schedule-table"><div><b>Departure</b><b>Arrival (est.)</b></div>{departures.map(time => <div key={time}><span>{time}</span><span>{time.replace(/(\d+):00/, (_, hour) => `${Number(hour)}:20`)}</span></div>)}</div>
}

function EmptyState({ text }: { text: string }) { return <div className="empty-state"><Search size={20} /><p>{text}</p></div> }

export default function Page() {
  const [view, setView] = useState<View>('home')
  const [selectedRoute, setSelectedRoute] = useState<Route>(routes[0])
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<RouteId[]>([])
  const [locating, setLocating] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [now, setNow] = useState(getNextDeparture())

  useEffect(() => {
    const saved = window.localStorage.getItem('oau-favorite-routes')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  useEffect(() => { window.localStorage.setItem('oau-favorite-routes', JSON.stringify(favorites)) }, [favorites])
  useEffect(() => { const timer = window.setInterval(() => setNow(getNextDeparture()), 30000); return () => window.clearInterval(timer) }, [])

  const filteredRoutes = useMemo(() => routes.filter(route => `${route.name} ${route.description}`.toLowerCase().includes(query.toLowerCase())), [query])
  const filteredStops = useMemo(() => stops.filter(stop => stop.name.toLowerCase().includes(query.toLowerCase())), [query])

  const goTo = (nextView: View) => { setView(nextView); setMenuOpen(false); setQuery('') }
  const selectRoute = (route: Route) => { setSelectedRoute(route); goTo('route') }
  const toggleFavorite = (id: RouteId) => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id])
  const locate = () => {
    setLocating(true); setLocationMessage('')
    if (!navigator.geolocation) { setLocationMessage('Location is not supported on this device.'); setLocating(false); return }
    navigator.geolocation.getCurrentPosition(() => { setLocationMessage('Location found. Map centered near you.'); setLocating(false) }, () => { setLocationMessage('Location permission was not granted.'); setLocating(false) }, { enableHighAccuracy: true, timeout: 10000 })
  }

  return <div className="app-shell"><Header view={view} goTo={goTo} onMenu={() => setMenuOpen(open => !open)} />{menuOpen && <div className="mobile-menu"><AccountControls /><button onClick={() => goTo('about')}><CircleHelp size={17} /> Help & about</button><button onClick={() => goTo('routes')}><Star size={17} /> Saved routes <span>{favorites.length}</span></button></div>}<main className="main-content">
    {view === 'home' && <><HeroSection goTo={goTo} /><QuickAccess goTo={goTo} locate={locate} /></>}
    {view === 'routes' && <><PageHeading title="Available routes" description="Choose a route to view stops, schedules and estimated departure times." query={query} setQuery={setQuery} placeholder="Search routes..." /><div className="route-list full-list">{filteredRoutes.map(route => <RouteCard key={route.id} route={route} onSelect={() => selectRoute(route)} favorite={favorites.includes(route.id)} onFavorite={() => toggleFavorite(route.id)} />)}{filteredRoutes.length === 0 && <EmptyState text="No routes match your search." />}</div></>}
    {view === 'route' && <RouteDetails route={selectedRoute} now={now} favorite={favorites.includes(selectedRoute.id)} toggleFavorite={() => toggleFavorite(selectedRoute.id)} goTo={goTo} locating={locating} locate={locate} locationMessage={locationMessage} clearMessage={() => setLocationMessage('')} />}
    {view === 'stops' && <StopsPage query={query} setQuery={setQuery} stops={filteredStops} route={selectedRoute} selectRoute={selectRoute} locating={locating} locate={locate} />}
    {view === 'schedules' && <SchedulesPage route={selectedRoute} setRoute={setSelectedRoute} now={now} />}
    {view === 'about' && <AboutPage goTo={goTo} />}
  </main><BottomNav view={view} goTo={goTo} /><footer><span><Bus size={14} /> Campus Shuttle</span><span>Safe · Reliable · On campus</span><span>OAU, Ile-Ife</span></footer></div>
}

function RouteDetails({ route, now, favorite, toggleFavorite, goTo, locating, locate, locationMessage, clearMessage }: { route: Route; now: ReturnType<typeof getNextDeparture>; favorite: boolean; toggleFavorite: () => void; goTo: (view: View) => void; locating: boolean; locate: () => void; locationMessage: string; clearMessage: () => void }) {
  return <><button className="back-button" onClick={() => goTo('routes')}><ArrowLeft size={15} /> Back to routes</button><div className="detail-header"><div className="route-badge large" style={{ background: route.color }}>{route.id}</div><div><h1>{route.name}</h1><p>{route.description}</p></div><button className={`favorite detail-favorite ${favorite ? 'saved' : ''}`} onClick={toggleFavorite}><Heart size={18} fill={favorite ? 'currentColor' : 'none'} /> {favorite ? 'Saved' : 'Save route'}</button></div><div className="detail-grid"><section className="panel"><div className="panel-heading"><h2>Stops in order</h2><span>{route.stops.length} stops</span></div><ol className="stop-order">{route.stops.map((stop, index) => <li key={stop.name}><span className="stop-number" style={{ background: route.color }}>{index + 1}</span><span>{stop.name}</span>{index < route.stops.length - 1 && <span className="connector" />}</li>)}</ol></section><section className="panel next-panel"><div className="next-departure"><div className="live-dot" /><div><span>Next departure</span><strong>{now.label}</strong><small>{now.remaining} · from Campus Gate</small></div><Bell size={19} /></div><div className="panel-heading"><h2>Schedule</h2><span>Weekdays</span></div><ScheduleTable /></section></div><MapPanel activeRoute={route} locating={locating} locate={locate} />{locationMessage && <div className="info-banner"><Check size={16} /> {locationMessage}<button onClick={clearMessage}><X size={15} /></button></div>}</>
}

function StopsPage({ query, setQuery, stops: visibleStops, route, selectRoute, locating, locate }: { query: string; setQuery: (query: string) => void; stops: Stop[]; route: Route; selectRoute: (route: Route) => void; locating: boolean; locate: () => void }) {
  return <><PageHeading title="Bus stops" description="View all shuttle stops across the OAU campus and the routes that pass through them." query={query} setQuery={setQuery} placeholder="Search stops..." /><div className="stop-directory">{visibleStops.map(stop => <button key={stop.name} onClick={() => selectRoute(routes.find(item => item.stops.some(itemStop => itemStop.name === stop.name)) || route)}><span className="stop-pin"><MapPin size={18} /></span><span><strong>{stop.name}</strong><small>{routes.filter(item => item.stops.some(itemStop => itemStop.name === stop.name)).map(item => item.name).join(' · ')}</small></span><ChevronRight size={18} /></button>)}{visibleStops.length === 0 && <EmptyState text="No stops match your search." />}</div><MapPanel activeRoute={route} locating={locating} locate={locate} /></>
}

function SchedulesPage({ route, setRoute, now }: { route: Route; setRoute: (route: Route) => void; now: ReturnType<typeof getNextDeparture> }) {
  return <><PageHeading title="Shuttle schedules" description="Check departure and estimated arrival times for each route." /><div className="schedule-tabs">{routes.map(item => <button key={item.id} className={route.id === item.id ? 'active' : ''} onClick={() => setRoute(item)}><span style={{ background: item.color }}>{item.id}</span>{item.name}</button>)}</div><section className="schedule-card"><div className="schedule-card-heading"><div className="route-badge" style={{ background: route.color }}>{route.id}</div><div><h2>{route.name}</h2><p>{route.description}</p></div><span className="route-time"><Clock3 size={13} /> {route.minutes} min</span></div><ScheduleTable /><div className="next-departure compact"><Clock3 size={16} /><span><b>Next departure:</b> {now.label} <small>Approximately {now.remaining}</small></span></div></section></>
}

function AboutPage({ goTo }: { goTo: (view: View) => void }) {
  return <section className="about-page"><h1>Campus mobility, made simple.</h1><p className="lead">Campus Shuttle helps OAU students and staff move between lecture halls, residences and the campus gate without the guesswork.</p><div className="about-grid"><div className="panel"><Bus size={22} /><h2>How to use it</h2><p>Pick a route, check the stop order and use the live schedule to plan when to leave.</p></div><div className="panel"><Bell size={22} /><h2>Stay informed</h2><p>Departure times update from your device clock. Save a route for quick access.</p></div><div className="panel"><Settings2 size={22} /><h2>Built for OAU</h2><p>Routes and stop names are based on the campus transport plan for Obafemi Awolowo University.</p></div></div><button className="primary-button" onClick={() => goTo('routes')}>Explore routes <ArrowRight size={16} /></button></section>
}
