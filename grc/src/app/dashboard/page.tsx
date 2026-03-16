import Link from 'next/link'

const modules = [
  {
    title: 'AI Assistant',
    description: 'Ask questions about ISO 27001 and ISO 42001 requirements. Answers are grounded exclusively in the original standard documents.',
    href: '/dashboard/ask',
    badge: 'Pending ISO docs',
    badgeColor: 'bg-amber-50 text-amber-700',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Controls',
    description: 'Track implementation status of ISO 27001 Annex A controls and ISO 42001 AI management controls.',
    href: '/dashboard/controls',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Risk Register',
    description: 'Identify, score, and track information security risks. Assign treatment plans and review cycles.',
    href: '/dashboard/risks',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    title: 'Policies',
    description: 'Version-control and manage your information security policy library. Align policies to standard requirements.',
    href: '/dashboard/policies',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
]

export default function Dashboard() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          ISO 27001 &amp; ISO 42001 compliance workspace. Upload your ISO PDFs to activate AI-assisted guidance.
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Standards covered', value: '2' },
          { label: 'ISO docs indexed', value: '0' },
          { label: 'AI model', value: 'Perplexity' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-brand-200 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                {mod.icon}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mod.badgeColor}`}>
                {mod.badge}
              </span>
            </div>
            <h2 className="font-semibold text-gray-900 mb-1">{mod.title}</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
