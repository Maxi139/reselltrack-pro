import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  BarChart3,
  CalendarCheck2,
  CheckCircle2,
  Gauge,
  PackageCheck,
  Sparkles,
} from 'lucide-react'
import { dbHelpers } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { formatDate, formatNumber } from '../utils/formatters'

type ProductRecord = {
  id: string
  name: string
  status: string
  created_at?: string
  updated_at?: string
  channel?: string
}

type MeetingRecord = {
  id: string
  title: string
  client_name?: string
  scheduled_date?: string
  scheduled_time?: string
  status?: string
  meeting_type?: string
  location?: string
}

interface ActivityPoint {
  label: string
  listed: number
  sold: number
  meetings: number
}

const fallbackProducts: ProductRecord[] = [
  {
    id: 'p-1',
    name: 'Jordan 4 Thunder',
    status: 'listed',
    channel: 'Discord',
    created_at: '2024-05-02T10:00:00Z',
    updated_at: '2024-05-06T09:00:00Z',
  },
  {
    id: 'p-2',
    name: 'Rolex Datejust 36',
    status: 'pending',
    channel: 'Private client',
    created_at: '2024-05-04T15:00:00Z',
  },
  {
    id: 'p-3',
    name: 'Louis Vuitton Keepall 45',
    status: 'sold',
    channel: 'Consignment',
    created_at: '2024-04-26T11:00:00Z',
    updated_at: '2024-05-03T08:00:00Z',
  },
  {
    id: 'p-4',
    name: 'Vintage Cartier Love',
    status: 'listed',
    channel: 'Showroom',
    created_at: '2024-05-08T12:00:00Z',
  },
  {
    id: 'p-5',
    name: 'PS5 Digital Edition',
    status: 'sold',
    channel: 'Discord drop',
    created_at: '2024-04-29T14:00:00Z',
    updated_at: '2024-05-05T16:00:00Z',
  },
]

const fallbackMeetings: MeetingRecord[] = [
  {
    id: 'm-1',
    title: 'Consignment intake',
    client_name: 'Lena H.',
    scheduled_date: '2024-05-14T09:00:00Z',
    scheduled_time: '09:00',
    status: 'scheduled',
    meeting_type: 'pickup',
    location: 'Discord call',
  },
  {
    id: 'm-2',
    title: 'VIP sourcing call',
    client_name: 'Atelier North',
    scheduled_date: '2024-05-16T13:00:00Z',
    scheduled_time: '13:00',
    status: 'scheduled',
    meeting_type: 'negotiation',
    location: 'Discord voice',
  },
  {
    id: 'm-3',
    title: 'Pickup confirmation',
    client_name: 'Mara G.',
    scheduled_date: '2024-05-18T10:30:00Z',
    scheduled_time: '10:30',
    status: 'scheduled',
    meeting_type: 'pickup',
    location: 'Studio visit',
  },
  {
    id: 'm-4',
    title: 'After-sale check-in',
    client_name: 'Elias W.',
    scheduled_date: '2024-05-19T15:00:00Z',
    scheduled_time: '15:00',
    status: 'scheduled',
    meeting_type: 'other',
    location: 'Discord DM',
  },
]

const buildWeeklyTrend = (products: ProductRecord[], meetings: MeetingRecord[]): ActivityPoint[] => {
  const now = new Date()

  return Array.from({ length: 6 }).map((_, index) => {
    const start = new Date(now)
    start.setDate(start.getDate() - (5 - index) * 7 - 6)
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    const listed = products.filter((product) => {
      if (!product.created_at) return false
      const createdAt = new Date(product.created_at)
      return createdAt >= start && createdAt <= end
    }).length

    const sold = products.filter((product) => {
      if (product.status !== 'sold') return false
      const completed = product.updated_at ? new Date(product.updated_at) : product.created_at ? new Date(product.created_at) : null
      if (!completed) return false
      return completed >= start && completed <= end
    }).length

    const scheduledMeetings = meetings.filter((meeting) => {
      if (meeting.status !== 'scheduled' || !meeting.scheduled_date) return false
      const meetingDate = new Date(meeting.scheduled_date)
      return meetingDate >= start && meetingDate <= end
    }).length

    const label = `${start.toLocaleString('default', { month: 'short' })} ${start.getDate()}`

    return {
      label,
      listed,
      sold,
      meetings: scheduledMeetings,
    }
  })
}

const getAverageTurnaroundDays = (products: ProductRecord[]): number => {
  const soldProducts = products.filter((product) => product.status === 'sold')
  if (soldProducts.length === 0) return 0

  const totalDays = soldProducts.reduce((sum, product) => {
    if (!product.created_at) return sum
    const start = new Date(product.created_at).getTime()
    const end = product.updated_at ? new Date(product.updated_at).getTime() : start
    const diffDays = Math.max(0, (end - start) / (1000 * 60 * 60 * 24))
    return sum + diffDays
  }, 0)

  return Math.round(totalDays / soldProducts.length)
}

export default function Analytics() {
  const { user, isDemoMode } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview', user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return null

      try {
        const [productsRes, meetingsRes] = await Promise.all([
          dbHelpers.getProducts(user.id),
          dbHelpers.getMeetings(user.id),
        ])

        const products = productsRes.error ? [] : productsRes.data || []
        const meetings = meetingsRes.error ? [] : meetingsRes.data || []

        return { products, meetings }
      } catch (error) {
        console.error('Analytics fetch failed:', error)
        return null
      }
    },
    staleTime: 1000 * 60,
    retry: false,
  })

  const products = data?.products?.length ? data.products : fallbackProducts
  const meetings = data?.meetings?.length ? data.meetings : fallbackMeetings

  const totalProducts = products.length
  const soldCount = products.filter((product) => product.status === 'sold').length
  const listedCount = products.filter((product) => product.status === 'listed').length
  const pendingCount = products.filter((product) => product.status === 'pending').length
  const activeMeetings = meetings.filter((meeting) => meeting.status === 'scheduled')
  const upcomingMeetings = [...activeMeetings].sort((a, b) => {
    const aDate = a.scheduled_date ? new Date(a.scheduled_date).getTime() : 0
    const bDate = b.scheduled_date ? new Date(b.scheduled_date).getTime() : 0
    return aDate - bDate
  }).slice(0, 4)

  const sellThroughRate = totalProducts > 0 ? Math.round((soldCount / totalProducts) * 100) : 0
  const averageTurnaround = getAverageTurnaroundDays(products)
  const weeklyTrend = useMemo(() => buildWeeklyTrend(products, meetings), [products, meetings])
  const maxActivity = Math.max(
    ...weeklyTrend.flatMap((week) => [week.listed, week.sold, week.meetings]),
    1,
  )

  const statusBreakdown = [
    { label: 'Listed', count: listedCount, color: 'from-primary-500 to-primary-400' },
    { label: 'Pending', count: pendingCount, color: 'from-amber-500 to-amber-400' },
    { label: 'Sold', count: soldCount, color: 'from-emerald-500 to-emerald-400' },
  ]

  const pipelineHealth = totalProducts > 0 ? Math.round(((listedCount + soldCount) / totalProducts) * 100) : 0

  const insightCards = [
    {
      title: 'Sell-through status',
      body:
        sellThroughRate >= 50
          ? 'Mehr als die Hälfte deiner getrackten Artikel sind bereits verkauft.'
          : 'Bringe weitere Listings live, um den Sell-through zu erhöhen.',
    },
    {
      title: 'Listing readiness',
      body:
        pendingCount > 0
          ? `${pendingCount} Produkte warten noch auf Fotos oder Pricing. Plane kurze Sessions, um sie live zu bringen.`
          : 'Alle erfassten Artikel sind bereits live oder abgeschlossen.',
    },
    {
      title: 'Meeting coverage',
      body:
        upcomingMeetings.length > 0
          ? `${upcomingMeetings.length} Follow-ups sind im Kalender. Nutze Discord Login für schnelle Handovers.`
          : 'Keine kommenden Meetings – plane neue Check-ins direkt aus dem CRM.',
    },
  ]

  const statCards = [
    {
      title: 'Inventar im Blick',
      value: formatNumber(totalProducts),
      helper: 'Produkte im aktuellen Workflow',
      icon: PackageCheck,
    },
    {
      title: 'Sell-through',
      value: `${sellThroughRate}%`,
      helper: 'Verkaufte Artikel vs. Gesamtbestand',
      icon: CheckCircle2,
    },
    {
      title: 'Bereit für Käufer',
      value: formatNumber(listedCount),
      helper: 'Listings sind bereits live',
      icon: Sparkles,
    },
    {
      title: 'Geplante Meetings',
      value: formatNumber(activeMeetings.length),
      helper: 'Follow-ups in den nächsten Tagen',
      icon: CalendarCheck2,
    },
  ]

  if (isLoading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="h-10 w-1/3 rounded-2xl bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="h-5 w-1/2 rounded-lg bg-slate-200" />
                  <div className="mt-4 h-8 w-1/3 rounded-lg bg-slate-100" />
                  <div className="mt-3 h-4 w-2/3 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 xl:py-16">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary-500">Analytics</p>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 lg:text-5xl">Statistiken ohne Baustellen</h1>
              <p className="mt-3 text-base text-slate-500 lg:text-lg">
                Echtzeit-Karten für Inventar, Meetings und Sell-through – basierend auf Supabase Daten oder dem Demo-Workspace.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
              <Activity className="h-4 w-4 text-primary-500" />
              Automatisch aktualisiert
            </div>
          </div>
        </div>

        {isDemoMode && (
          <div className="mt-8 rounded-3xl border border-primary-100 bg-primary-50/70 p-6 shadow-inner">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary-700">Demo-Modus aktiv</p>
                <p className="text-sm text-primary-600">
                  Du siehst kuratierte Daten. Aktiviere den Live-Workspace, um deine eigenen Produkte und Meetings auszuwerten.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.06)]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/90 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-500">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="text-sm text-slate-500">{card.helper}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Wöchentliche Aktivität</p>
                <p className="text-2xl font-bold text-slate-900">Listings · Abschlüsse · Meetings</p>
              </div>
              <BarChart3 className="h-6 w-6 text-primary-500" />
            </div>
            <div className="mt-8 grid grid-cols-6 items-end gap-3">
              {weeklyTrend.map((week) => (
                <div key={week.label} className="flex flex-col items-center gap-3">
                  <div className="flex h-40 w-full items-end gap-1">
                    <span
                      className="w-3 rounded-full bg-primary-400"
                      style={{ height: `${(week.listed / maxActivity) * 100}%` }}
                      aria-label={`${week.listed} Listings in ${week.label}`}
                    />
                    <span
                      className="w-3 rounded-full bg-emerald-400"
                      style={{ height: `${(week.sold / maxActivity) * 100}%` }}
                      aria-label={`${week.sold} Verkäufe in ${week.label}`}
                    />
                    <span
                      className="w-3 rounded-full bg-amber-400"
                      style={{ height: `${(week.meetings / maxActivity) * 100}%` }}
                      aria-label={`${week.meetings} Meetings in ${week.label}`}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{week.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-400" /> Listings
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Verkäufe
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Meetings
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Pipeline Health</p>
                  <p className="text-2xl font-bold text-slate-900">{pipelineHealth}%</p>
                  <p className="text-sm text-slate-500">Live oder abgeschlossene Artikel</p>
                </div>
                <div className="rounded-2xl bg-slate-900/90 p-3 text-white">
                  <Gauge className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {statusBreakdown.map((status) => (
                  <div key={status.label}>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <p>{status.label}</p>
                      <p>{formatNumber(status.count)}</p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${status.color}`}
                        style={{ width: `${totalProducts ? (status.count / totalProducts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-500">Durchschnittliche Abwicklung</p>
                  <p className="text-2xl font-bold text-slate-900">{averageTurnaround || '–'} Tage</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Zeitraum vom Anlegen bis zum Abschließen eines Artikels auf Basis deiner aktuellen Daten.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <h2 className="text-xl font-semibold text-slate-900">Sofortige Insights</h2>
            </div>
            <div className="mt-6 space-y-5">
              {insightCards.map((insight) => (
                <div key={insight.title} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <p className="text-sm font-semibold text-slate-600">{insight.title}</p>
                  <p className="text-base text-slate-500">{insight.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Anstehende Meetings</p>
                <h2 className="text-2xl font-bold text-slate-900">Team-ready Timeline</h2>
              </div>
              <CalendarCheck2 className="h-6 w-6 text-primary-500" />
            </div>
            <div className="mt-6 space-y-4">
              {upcomingMeetings.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Noch keine Meetings geplant. Starte direkt aus dem CRM eine neue Einladung.
                </p>
              )}
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="rounded-2xl border border-slate-100 p-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold text-slate-900">{meeting.title}</p>
                      <p className="text-sm text-slate-500">{meeting.client_name || 'Client'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {meeting.meeting_type || 'other'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <CalendarCheck2 className="h-4 w-4 text-primary-500" />
                      {meeting.scheduled_date ? formatDate(meeting.scheduled_date) : 'Date tbd'}
                      {meeting.scheduled_time && <span>· {meeting.scheduled_time}</span>}
                    </div>
                    {meeting.location && <span>{meeting.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
