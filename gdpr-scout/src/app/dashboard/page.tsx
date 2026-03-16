import Link from 'next/link'

const modules = [
  {
    title: 'AI Assistant',
    description: 'Ask questions about GDPR obligations, rights, and requirements. Answers are grounded in the original regulation text.',
    href: '/dashboard/ask',
    badge: 'Live',
    badgeColor: 'bg-green-50 text-green-700',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Data Mapping',
    description: 'Build and maintain your Record of Processing Activities (ROPA). Map data flows across your organisation.',
    href: '/dashboard/data-mapping',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    title: 'Gap Assessment',
    description: 'Review your compliance status against all 99 GDPR articles. Identify gaps and assign remediation actions.',
    href: '/dashboard/gap-assessment',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Breach Register',
    description: 'Log and track personal data breaches. Manage notification timelines and regulatory reporting obligations.',
    href: '/dashboard/breach-register',
    badge: 'Coming soon',
    badgeColor: 'bg-gray-100 text-gray-500',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
]

export default function Dashboard() {
  return (
    <div className="p-8 max-w-4xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          GDPR compliance workspace — 384 regulation articles indexed and ready to query.
        </p>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Articles indexed', value: '99' },
          { label: 'Chunks in Vectorize', value: '384' },
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
