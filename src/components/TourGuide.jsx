import { useEffect, useState } from 'react'

const steps = [
  {
    target: '#school-select',
    title: 'Choose your school',
    text: 'Start by selecting Day school or Open school. This keeps the student list accurate.',
  },
  {
    target: '#form-select',
    title: 'Choose your form',
    text: 'After choosing a school, select the student\'s current form to load that class list.',
  },
  {
    target: '#student-search',
    title: 'Search the student name',
    text: 'Type a first name or surname. The list updates instantly as you search.',
  },
  {
    target: '.student-option',
    title: 'Open the result',
    text: 'Select the correct student, confirm the details, then choose View results.',
  },
]

export default function TourGuide({ open, onClose }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const step = steps[stepIndex]

  const goNext = () => {
    if (stepIndex === steps.length - 1) {
      onClose()
      return
    }
    setStepIndex((currentStep) => currentStep + 1)
  }

  return (
    <div className="tour-backdrop" role="presentation">
      <div className="tour-card" role="dialog" aria-modal="true" aria-labelledby="tour-title">
        <div className="tour-card-topline"><span>Quick guide</span><button type="button" onClick={onClose} aria-label="Close tour">&times;</button></div>
        <div className="tour-progress"><span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}></span></div>
        <p className="eyebrow">Step {stepIndex + 1} of {steps.length}</p>
        <h2 id="tour-title">{step.title}</h2>
        <p>{step.text}</p>
        <div className="tour-actions">
          <button className="tour-skip" type="button" onClick={onClose}>Skip tour</button>
          <div><button className="tour-back" type="button" onClick={() => setStepIndex((currentStep) => currentStep - 1)} disabled={stepIndex === 0}>Back</button><button className="primary-button" type="button" onClick={goNext}>{stepIndex === steps.length - 1 ? 'Finish' : 'Next'}</button></div>
        </div>
      </div>
    </div>
  )
}
