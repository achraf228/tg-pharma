import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)

/** Recherche texte + photo d'ordonnance + dictée vocale (si le navigateur la prend en charge). */
export default function SearchBar({ value, onChange, onSubmit, showCamera = true }) {
  const nav = useNavigate()
  const [listening, setListening] = useState(false)
  const rec = useRef(null)
  useEffect(() => () => rec.current?.abort?.(), [])

  const dictate = () => {
    if (listening) return rec.current?.stop()
    rec.current = new SpeechRecognition()
    rec.current.lang = 'fr-FR'
    rec.current.onresult = (e) => { const t = e.results[0][0].transcript; onChange(t); onSubmit?.(t) }
    rec.current.onend = () => setListening(false)
    rec.current.onerror = () => setListening(false)
    setListening(true)
    rec.current.start()
  }

  return (
    <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); onSubmit?.(value) }}>
      <Icon name="search" />
      <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Médicament ou pharmacie" aria-label="Rechercher un médicament ou une pharmacie" />
      {showCamera && <button type="button" className="icon-btn" aria-label="Envoyer une ordonnance en photo" onClick={() => nav('/demande/prescription')}><Icon name="camera" /></button>}
      {SpeechRecognition && <button type="button" className={`icon-btn ${listening ? 'active' : ''}`} aria-label="Recherche vocale" onClick={dictate}><Icon name="mic" /></button>}
    </form>
  )
}
