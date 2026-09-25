import { useEffect, useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import { useApp } from '../lib/context.js'

const money = (n) => `QAR ${Number(n).toFixed(0)}`

export default function BasketPanel({ open, onClose }) {
  const { basket } = useApp()
  const [step, setStep] = useState('basket')
  const [fulfilment, setFulfilment] = useState('pickup')
  const [payment, setPayment] = useState('demo-card')
  const [orderNo, setOrderNo] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })

  useEffect(() => {
    if (!open) return
    setStep('basket')
    setOrderNo('')
    const esc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open, onClose])

  const marketCount = useMemo(() => new Set(basket.detailed.map((x) => x.marketId)).size, [basket.detailed])
  if (!open) return null

  const placeOrder = (e) => {
    e.preventDefault()
    const code = `FF-${String(Date.now()).slice(-6)}`
    setOrderNo(code)
    setStep('done')
    basket.clear()
  }

  return (
    <div className="basket-modal" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <section className="basket-panel" role="dialog" aria-modal="true" aria-labelledby="basket-title">
        <header className="basket-panel__head">
          <div>
            <p className="basket-panel__eyebrow">Demo ordering · no real payment</p>
            <h2 id="basket-title">Fresh Basket</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close Fresh Basket"><Icon name="close" /></button>
        </header>

        {step === 'basket' && (
          <>
            <div className="basket-panel__body">
              {basket.detailed.length === 0 ? (
                <div className="basket-empty">
                  <Icon name="basket" size={44} />
                  <h3>Your basket is fresh and empty</h3>
                  <p>Open a market or produce item and add something you’d like to order.</p>
                  <button type="button" className="btn btn--primary" onClick={onClose}>Keep exploring</button>
                </div>
              ) : (
                <ul className="basket-list">
                  {basket.detailed.map((item) => (
                    <li key={`${item.produceId}:${item.marketId}`} className="basket-item">
                      <img src={item.produce.image} alt="" width="72" height="72" />
                      <div className="basket-item__main">
                        <strong>{item.produce.name}</strong>
                        <small>{item.market.name}</small>
                        <span>{money(item.meta.price)} · {item.meta.unit}</span>
                      </div>
                      <div className="basket-item__qty" aria-label={`Quantity for ${item.produce.name}`}>
                        <button type="button" onClick={() => basket.setQty(item.produceId, item.marketId, item.qty - 1)} aria-label="Decrease quantity">−</button>
                        <b>{item.qty}</b>
                        <button type="button" onClick={() => basket.setQty(item.produceId, item.marketId, item.qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <strong className="basket-item__total">{money(item.lineTotal)}</strong>
                      <button type="button" className="basket-item__remove" onClick={() => basket.remove(item.produceId, item.marketId)}>Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {basket.detailed.length > 0 && (
              <footer className="basket-panel__foot">
                {marketCount > 1 && <p className="basket-note">Your demo basket contains items from {marketCount} markets.</p>}
                <div className="basket-total"><span>Subtotal</span><strong>{money(basket.subtotal)}</strong></div>
                <p className="basket-demo">Illustrative prices only. Availability and payment are simulated for this prototype.</p>
                <div className="basket-actions">
                  <button type="button" className="text-btn" onClick={basket.clear}>Clear basket</button>
                  <button type="button" className="btn btn--primary" onClick={() => setStep('checkout')}>Review order <Icon name="arrow" size={17} /></button>
                </div>
              </footer>
            )}
          </>
        )}

        {step === 'checkout' && (
          <form className="checkout" onSubmit={placeOrder}>
            <button type="button" className="text-btn checkout__back" onClick={() => setStep('basket')}><Icon name="back" size={16} /> Back to basket</button>
            <div className="checkout__section">
              <h3>How would you like it?</h3>
              <div className="checkout__choice">
                <label><input type="radio" name="fulfil" checked={fulfilment === 'pickup'} onChange={() => setFulfilment('pickup')} /> <span><strong>Market pickup</strong><small>Collect from the market(s) shown in your basket.</small></span></label>
                <label><input type="radio" name="fulfil" checked={fulfilment === 'delivery'} onChange={() => setFulfilment('delivery')} /> <span><strong>Demo delivery</strong><small>Prototype only — no courier is booked.</small></span></label>
              </div>
            </div>

            <div className="checkout__section checkout__fields">
              <h3>Your details</h3>
              <label className="field"><span>Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="field"><span>Phone</span><input required inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
              <label className="field"><span>Email</span><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              {fulfilment === 'delivery' && <label className="field field--wide"><span>Delivery address</span><textarea required rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>}
            </div>

            <div className="checkout__section">
              <h3>Payment</h3>
              <div className="checkout__choice">
                <label><input type="radio" name="pay" checked={payment === 'demo-card'} onChange={() => setPayment('demo-card')} /> <span><strong>Demo card payment</strong><small>No card number is collected and no charge is made.</small></span></label>
                <label><input type="radio" name="pay" checked={payment === 'later'} onChange={() => setPayment('later')} /> <span><strong>Pay later</strong><small>Simulated pay-on-pickup / delivery option.</small></span></label>
              </div>
            </div>

            <div className="checkout__summary">
              <span>Demo total</span><strong>{money(basket.subtotal)}</strong>
            </div>
            <button type="submit" className="btn btn--primary btn--lg checkout__place">Place demo order <Icon name="arrow" size={18} /></button>
            <p className="basket-demo">Prototype only — no real order, inventory reservation or payment will occur.</p>
          </form>
        )}

        {step === 'done' && (
          <div className="basket-success">
            <div className="basket-success__mark"><Icon name="basket" size={40} /></div>
            <p className="basket-panel__eyebrow">Demo order confirmed</p>
            <h3>Fresh finds, ready in the prototype!</h3>
            <p>Order <strong>{orderNo}</strong> was created for demonstration only. No payment was processed and no real market received an order.</p>
            <button type="button" className="btn btn--primary" onClick={onClose}>Done</button>
          </div>
        )}
      </section>
    </div>
  )
}
