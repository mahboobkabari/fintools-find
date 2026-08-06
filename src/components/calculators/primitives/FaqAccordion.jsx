import { useState } from 'preact/hooks';

export default function FaqAccordion({ faqs = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div class="space-y-4" role="region" aria-label="Frequently Asked Questions Accordion">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const answerId = `faq-answer-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <div
            key={index}
            class={`bg-canvas border rounded-2xl transition-all ${
              isOpen ? 'border-primary shadow-soft' : 'border-hairline hover:border-hairline-soft'
            }`}
          >
            <button
              type="button"
              id={buttonId}
              onClick={() => toggleFaq(index)}
              class="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-2xl"
              aria-expanded={isOpen}
              aria-controls={answerId}
            >
              <span class="font-heading font-bold text-base md:text-lg text-ink leading-snug">
                {faq.question}
              </span>
              <span
                class={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  isOpen ? 'bg-primary text-white' : 'bg-surface-strong text-muted'
                }`}
                aria-hidden="true"
              >
                <svg
                  class={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {isOpen && (
              <div
                id={answerId}
                role="region"
                aria-labelledby={buttonId}
                class="px-6 pb-6 pt-2 text-body text-sm md:text-base leading-relaxed border-t border-hairline/50"
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
