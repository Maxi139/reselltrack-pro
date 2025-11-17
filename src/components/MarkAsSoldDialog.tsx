import { useState } from 'react'
import { Calendar, CheckCircle, DollarSign, X } from 'lucide-react'

interface MarkAsSoldDialogProps {
  product: any | null
  onClose: () => void
  onConfirm: (payload: { soldPrice: number; soldDate: string; note?: string }) => void
  isSubmitting?: boolean
}

export function MarkAsSoldDialog({ product, onClose, onConfirm, isSubmitting = false }: MarkAsSoldDialogProps) {
  const [soldPrice, setSoldPrice] = useState(() => (product?.sold_price ? String(product.sold_price) : ''))
  const [soldDate, setSoldDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState(() => product?.notes || '')
  const [error, setError] = useState<string | null>(null)

  if (!product) return null

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    if (!soldPrice || Number(soldPrice) <= 0) {
      setError('Bitte gib einen gültigen Verkaufspreis ein.')
      return
    }

    setError(null)
    onConfirm({ soldPrice: Number(soldPrice), soldDate, note })
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-500">Verkauf abschließen</p>
            <h2 className="text-2xl font-bold text-slate-900">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Verkaufspreis *</p>
                <div className="flex items-center text-2xl font-bold text-slate-900">
                  <span className="mr-1 text-base text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={soldPrice}
                    onChange={(event) => setSoldPrice(event.target.value)}
                    className="w-full border-none bg-transparent text-2xl focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <label className="text-sm font-medium text-slate-600" htmlFor="sold-date">
              Verkaufsdatum
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                id="sold-date"
                type="date"
                value={soldDate}
                onChange={(event) => setSoldDate(event.target.value)}
                className="w-full border-0 bg-transparent text-sm text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600" htmlFor="sold-note">
              Notiz zum Verkauf (optional)
            </label>
            <textarea
              id="sold-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
              placeholder="Z. B. Käufername, Übergabeort oder besondere Hinweise"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <CheckCircle className="h-4 w-4 text-success-500" />
              So sieht dein Abschluss aus
            </div>
            <p>
              Wir berechnen automatisch deinen Profit sobald du speicherst. Du kannst den Verkauf später jederzeit erneut bearbeite
n.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 sm:w-auto"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:from-primary-600 hover:to-primary-700 disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? 'Speichere...' : 'Als verkauft markieren'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MarkAsSoldDialog
