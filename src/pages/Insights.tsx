import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, User, ArrowLeft, Tag, BookOpen, FileText, Download, Video, Play, Eye, Search, TrendingUp, BarChart3, Filter } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { cn } from '../lib/utils'

const blogPosts = [
  {
    slug: 'ai-transforming-healthcare-claims',
    title: 'How AI is Transforming Healthcare Claims Processing in India',
    excerpt: 'Discover how artificial intelligence is revolutionizing the way Indian hospitals process insurance claims, reducing turnaround time by 70% and improving accuracy.',
    content: `The healthcare claims processing landscape in India is undergoing a seismic shift. With over 500 million Indians now covered under various insurance schemes — from Ayushman Bharat PMJAY to private health insurance — the volume of claims has exploded. Traditional manual processing simply cannot keep up.\n\nAI-powered claims automation addresses this by introducing intelligent document parsing, automatic ICD-10/CPT code assignment, and predictive pre-authorization scoring. At AyushmanLife, our SmartClaims engine processes a typical claim in under 3 minutes, compared to the industry average of 2-3 days.\n\nThe impact is measurable: hospitals using AI claims processing report 87% first-pass approval rates (up from 62%), 70% reduction in processing time, and annual savings of ₹1-3 crore depending on hospital size. The technology also catches coding errors before submission, reducing rejection rates dramatically.\n\nAs ABDM (Ayushman Bharat Digital Mission) continues to digitize India's healthcare infrastructure, AI-native claims processing will become not just an advantage but a necessity for hospitals seeking to remain competitive and financially healthy.`,
    author: 'Dr. Priya Sharma',
    authorRole: 'Chief Medical Officer, AyushmanLife',
    date: '2026-03-25',
    readTime: '6 min read',
    category: 'AI & Claims',
    tags: ['AI', 'Claims Processing', 'Healthcare IT', 'ABDM'],
    views: 4821,
    isMostRead: true,
  },
  {
    slug: 'reducing-patient-churn',
    title: 'Reducing Patient Churn: A Data-Driven Approach for Indian Hospitals',
    excerpt: 'Learn how predictive analytics helped a 300-bed Delhi hospital reduce patient churn from 35% to under 10% in just 12 months.',
    content: `Patient churn — the rate at which patients stop returning to a hospital for continued care — is a silent revenue killer for Indian healthcare providers. Our research across 50+ hospitals found average churn rates of 30-40%, with some multi-specialty hospitals as high as 50%.\n\nThe root causes are multifaceted: long wait times, poor communication, billing confusion, lack of follow-up, and competition from nearby facilities. But the most powerful insight is that churn is predictable. Using machine learning models trained on patient interaction data, appointment history, satisfaction scores, and demographic factors, we can identify at-risk patients with 85%+ accuracy.\n\nOur case study with a 300-bed Delhi hospital demonstrates the approach: we identified 12 key churn predictors, built a risk stratification model, and implemented automated interventions. High-risk patients received proactive outreach, appointment reminders, and personalized care coordination.\n\nThe results were remarkable — churn dropped from 35% to 10.2% over 12 months, translating to ₹4.2 crore in retained revenue annually. The key lesson: data-driven patient retention is far more cost-effective than patient acquisition.`,
    author: 'Rajiv Mehta',
    authorRole: 'Head of Analytics, AyushmanLife',
    date: '2026-03-20',
    readTime: '8 min read',
    category: 'Analytics',
    tags: ['Patient Retention', 'Predictive Analytics', 'Revenue', 'Data Science'],
    views: 3156,
    isMostRead: false,
  },
  {
    slug: 'abdm-integration-guide',
    title: 'ABDM Integration: What Every Indian Hospital Needs to Know in 2026',
    excerpt: 'A comprehensive guide to integrating with Ayushman Bharat Digital Mission — from ABHA IDs to Health Information Exchange.',
    content: `The Ayushman Bharat Digital Mission (ABDM) is India's ambitious plan to create a unified digital health ecosystem. By 2026, integration with ABDM is no longer optional — it's becoming a regulatory requirement for empanelled hospitals.\n\nKey ABDM components hospitals must integrate with include: ABHA (Ayushman Bharat Health Account) for unique health IDs, HFR (Health Facility Registry) for facility registration, HPR (Health Professional Registry) for doctor verification, and the Health Information Exchange & Consent Manager for patient data sharing.\n\nTechnically, ABDM integration requires implementing FHIR R4 APIs, establishing secure data channels, building consent management workflows, and ensuring PHI encryption standards. The process typically takes 3-6 months for a mid-size hospital.\n\nAyushmanLife simplifies this dramatically through our pre-built ABDM integration layer. Hospitals can go live with ABDM in under 2 weeks, with full support for ABHA verification, consent management, and health record exchange. We handle the technical complexity so hospitals can focus on care delivery.`,
    author: 'Anita Desai',
    authorRole: 'Director of Integrations, AyushmanLife',
    date: '2026-03-15',
    readTime: '10 min read',
    category: 'Compliance',
    tags: ['ABDM', 'Ayushman Bharat', 'Integration', 'FHIR', 'Digital Health'],
    views: 5230,
    isMostRead: true,
  },
  {
    slug: 'healthcare-cybersecurity-2026',
    title: 'Cybersecurity in Indian Hospitals: 2026 Threat Landscape',
    excerpt: 'Indian healthcare organizations faced 1.5 million cyberattacks in 2025. Here is what CISOs need to prioritize in 2026.',
    content: `Healthcare has become the #1 target for cybercriminals globally, and Indian hospitals are particularly vulnerable. CERT-In reported a 300% increase in attacks on healthcare organizations between 2023 and 2025, with ransomware being the primary threat vector.\n\nThe top threats for 2026 include: ransomware targeting hospital information systems, phishing campaigns against clinical staff, supply chain attacks through medical device vendors, and insider threats from inadequate access controls.\n\nCritical priorities for hospital CISOs include implementing zero-trust architecture, conducting regular penetration testing, establishing incident response playbooks, training staff on phishing recognition, and ensuring HIPAA-aligned data encryption for PHI/PII.\n\nAyushmanLife's security framework provides continuous monitoring, automated threat detection, and compliance reporting aligned with HIPAA, ABDM, and CERT-In guidelines. Our AI-powered security operations center processes 10,000+ security events daily, flagging genuine threats with 99.2% accuracy.`,
    author: 'Vikram Singh',
    authorRole: 'CISO, AyushmanLife',
    date: '2026-03-10',
    readTime: '7 min read',
    category: 'Security',
    tags: ['Cybersecurity', 'HIPAA', 'Ransomware', 'Healthcare Security'],
    views: 2890,
    isMostRead: false,
  },
  {
    slug: 'workforce-development-future',
    title: 'The Future of Healthcare Workforce Development in India',
    excerpt: 'With a projected shortage of 2 million healthcare IT professionals by 2028, innovative training approaches are critical.',
    content: `India's healthcare sector is growing at 22% CAGR, but the healthcare IT workforce is not keeping pace. Industry estimates project a shortage of 2 million qualified healthcare IT professionals by 2028, creating an urgent need for innovative workforce development approaches.\n\nTraditional training methods — classroom learning and on-the-job training — are insufficient for the scale of the challenge. The industry needs structured apprenticeship programs that combine theoretical learning with hands-on project experience.\n\nAyushmanLife's CareerPath Academy addresses this through a comprehensive approach: structured learning paths for 10+ healthcare IT specializations, AI-powered skill assessment and gap analysis, simulation-based training environments, and a mentorship program connecting learners with experienced professionals.\n\nOur apprenticeship program has trained 500+ healthcare IT professionals with a 94% placement rate. The model works because it combines domain knowledge (healthcare workflows, compliance requirements) with technical skills (cloud, AI/ML, cybersecurity) in a practical, project-based learning environment.`,
    author: 'Dr. Sunita Agarwal',
    authorRole: 'Head of Academy, AyushmanLife',
    date: '2026-03-05',
    readTime: '5 min read',
    category: 'Workforce',
    tags: ['Workforce Development', 'Training', 'Healthcare IT', 'Career'],
    views: 1845,
    isMostRead: false,
  },
  {
    slug: 'servicenow-healthcare-implementation',
    title: 'ServiceNow for Healthcare: Implementation Best Practices',
    excerpt: 'A practical guide to implementing ServiceNow ITSM in healthcare organizations, with lessons from 20+ hospital deployments.',
    content: `ServiceNow has become the de facto standard for IT service management in healthcare, but implementation in hospital environments requires unique considerations. Clinical workflows, 24x7 operations, and stringent compliance requirements make healthcare ServiceNow deployments fundamentally different from other industries.\n\nKey best practices from our 20+ hospital implementations include: mapping clinical workflows before technical configuration, implementing change management with clinical safety reviews, building a healthcare-specific service catalog, and integrating with existing hospital information systems.\n\nCommon pitfalls include over-customization (stay as close to out-of-box as possible), underestimating training needs for clinical staff, ignoring the intersection of IT and clinical operations, and failing to plan for 24x7 support requirements.\n\nThe ROI from a well-implemented ServiceNow instance in healthcare is significant: 40% reduction in IT ticket resolution time, 60% improvement in change success rate, and measurable improvements in clinical system uptime. The key is treating it as a clinical operations project, not just an IT project.`,
    author: 'Deepak Joshi',
    authorRole: 'ServiceNow Practice Lead, AyushmanLife',
    date: '2026-02-28',
    readTime: '9 min read',
    category: 'ServiceNow',
    tags: ['ServiceNow', 'ITSM', 'Implementation', 'Best Practices'],
    views: 2340,
    isMostRead: false,
  },
]

const caseStudies = [
  {
    slug: 'delhi-hospital-churn-reduction',
    title: '300-Bed Delhi Hospital: 35% to 10% Patient Churn in 12 Months',
    clientType: 'Multi-Specialty Hospital',
    challenge: 'A leading 300-bed multi-specialty hospital in Delhi NCR was losing 35% of patients annually due to long wait times, poor follow-up, and lack of personalized care coordination.',
    solution: 'Deployed AyushmanLife predictive analytics for churn identification, V-Care AI for proactive patient engagement, and automated care coordination workflows.',
    results: ['Patient churn reduced from 35% to 10.2%', 'Annual revenue retention: ₹4.2 crore', 'Patient satisfaction: 72% → 94%', 'Follow-up compliance: 45% → 88%'],
    metrics: [{ label: 'Churn Reduction', value: '71%' }, { label: 'Revenue Retained', value: '₹4.2 Cr' }, { label: 'Satisfaction', value: '94%' }],
  },
  {
    slug: 'multi-hospital-claims-savings',
    title: 'Multi-Hospital Network: AI Claims Processing Saves ₹2.3 Crore Annually',
    clientType: 'Hospital Chain',
    challenge: 'A 5-hospital network processing 50,000+ claims annually faced 38% rejection rates, 15-day average processing time, and significant revenue leakage.',
    solution: 'Implemented SmartClaims AI engine with automated ICD-10 coding, pre-auth prediction, and payer-specific claim formatting.',
    results: ['Claim rejection rate: 38% → 8%', 'Processing time: 15 days → 2 days', 'Annual savings: ₹2.3 crore', 'First-pass approval rate: 89%'],
    metrics: [{ label: 'Rejection Reduction', value: '79%' }, { label: 'Time Saved', value: '87%' }, { label: 'Annual Savings', value: '₹2.3 Cr' }],
  },
  {
    slug: 'government-hospital-abdm',
    title: 'Government Hospital: ABDM Integration & Ayushman Bharat Digitization',
    clientType: 'Government Hospital',
    challenge: 'A 500-bed government hospital needed to digitize operations and integrate with ABDM to process Ayushman Bharat claims efficiently.',
    solution: 'Full digital transformation including HIS deployment, ABDM integration, ABHA-based patient identification, and automated PMJAY claim submission.',
    results: ['ABDM integration in 2 weeks', 'PMJAY claim processing: manual → automated', 'Patient identification time: 15 min → 30 sec', 'Monthly claims volume: 200 → 1,500'],
    metrics: [{ label: 'Go-Live Time', value: '2 Weeks' }, { label: 'Claims Volume', value: '7.5x' }, { label: 'Processing Speed', value: '30 sec' }],
  },
  {
    slug: 'corporate-hospital-cloud',
    title: 'Corporate Hospital Chain: Cloud Migration & Zero-Downtime Operations',
    clientType: 'Corporate Hospital Chain',
    challenge: 'A premium hospital chain with 8 locations needed to migrate legacy on-premise systems to cloud while maintaining zero downtime for clinical operations.',
    solution: 'Phased cloud migration to AWS with AyushmanLife orchestration, hybrid architecture during transition, and 24x7 managed services support.',
    results: ['Zero downtime during migration', 'Infrastructure cost reduced by 40%', 'System performance improved by 60%', 'Disaster recovery: 24 hrs → 15 min'],
    metrics: [{ label: 'Downtime', value: 'Zero' }, { label: 'Cost Reduction', value: '40%' }, { label: 'DR Time', value: '15 min' }],
  },
]

const whitepapers = [
  { title: 'The State of Healthcare AI in India 2026', pages: 45, downloads: 1240 },
  { title: 'Building ABDM-Compliant Health Systems', pages: 32, downloads: 890 },
  { title: 'AI-Native vs AI-Enabled: The Healthcare IT Paradigm Shift', pages: 28, downloads: 2100 },
]

const featuredWebinar = {
  title: 'Live Webinar: AI-Native Healthcare IT — Lessons from $560M in Acquisitions',
  date: '15 Apr 2026 · 3:00 PM IST',
  speaker: 'Dr. Arjun Mehta, Chief Strategy Officer',
}

const videos = [
  {
    title: 'Platform Demo: SmartClaims AI in Action',
    duration: '12:34',
    views: 3847,
    date: '2026-03-20',
    category: 'Product Demo',
  },
  {
    title: 'V-Care AI Assistant: Complete Walkthrough',
    duration: '18:22',
    views: 2519,
    date: '2026-03-15',
    category: 'Product Demo',
  },
  {
    title: 'Cloud Migration for Healthcare: AWS vs Azure',
    duration: '24:15',
    views: 1892,
    date: '2026-03-10',
    category: 'Technical',
  },
  {
    title: 'ABDM Integration: Step-by-Step Guide',
    duration: '31:08',
    views: 4231,
    date: '2026-03-05',
    category: 'Technical',
  },
  {
    title: 'Reducing Patient Churn with Predictive Analytics',
    duration: '16:45',
    views: 2067,
    date: '2026-02-28',
    category: 'Case Study',
  },
  {
    title: 'Cybersecurity for Indian Hospitals: 2026 Threat Landscape',
    duration: '22:10',
    views: 1456,
    date: '2026-02-20',
    category: 'Industry',
  },
]

function ArticleDetail({ slug }: { slug: string }) {
  const post = blogPosts.find(p => p.slug === slug) || caseStudies.find(c => c.slug === slug)
  if (!post) return <div className="text-center py-20 text-muted">Article not found</div>

  const isBlog = 'content' in post
  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <Link to="/insights" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Insights
        </Link>
        <article>
          <div className="flex items-center gap-3 text-sm text-muted mb-4">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {isBlog ? (post as typeof blogPosts[0]).category : (post as typeof caseStudies[0]).clientType}
            </span>
            {isBlog && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date((post as typeof blogPosts[0]).date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>}
            {isBlog && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{(post as typeof blogPosts[0]).readTime}</span>}
          </div>
          <h1 className="font-display font-bold text-3xl text-text dark:text-text-dark mb-4">{post.title}</h1>
          {isBlog && (
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border dark:border-border-dark">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                {(post as typeof blogPosts[0]).author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-medium text-sm text-text dark:text-text-dark">{(post as typeof blogPosts[0]).author}</p>
                <p className="text-xs text-muted">{(post as typeof blogPosts[0]).authorRole}</p>
              </div>
            </div>
          )}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {isBlog
              ? (post as typeof blogPosts[0]).content.split('\n\n').map((p, i) => <p key={i} className="text-muted leading-relaxed mb-4">{p}</p>)
              : (
                <div className="space-y-6">
                  <div><h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">Challenge</h3><p className="text-muted">{(post as typeof caseStudies[0]).challenge}</p></div>
                  <div><h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">Solution</h3><p className="text-muted">{(post as typeof caseStudies[0]).solution}</p></div>
                  <div>
                    <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">Results</h3>
                    <ul className="space-y-1">{(post as typeof caseStudies[0]).results.map((r, i) => <li key={i} className="text-muted flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success" />{r}</li>)}</ul>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {(post as typeof caseStudies[0]).metrics.map(m => (
                      <div key={m.label} className="text-center p-4 rounded-xl bg-primary/5">
                        <p className="font-display font-bold text-2xl text-primary">{m.value}</p>
                        <p className="text-xs text-muted mt-1">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </div>
          {isBlog && (
            <div className="mt-8 pt-6 border-t border-border dark:border-border-dark flex flex-wrap gap-2">
              {(post as typeof blogPosts[0]).tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-xs text-muted">{tag}</span>
              ))}
            </div>
          )}
        </article>
      </div>
      <Footer />
    </div>
  )
}

function InsightsListing() {
  const [activeTab, setActiveTab] = useState<'blog' | 'cases' | 'whitepapers' | 'videos'>('blog')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const allCategories = useMemo(() => {
    const cats = new Set(blogPosts.map(p => p.category))
    return ['all', ...Array.from(cats)]
  }, [])

  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      const matchesSearch = searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const filteredCaseStudies = useMemo(() => {
    return caseStudies.filter(cs => {
      return searchQuery === '' ||
        cs.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cs.clientType.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [searchQuery])

  const totalViews = blogPosts.reduce((sum, p) => sum + p.views, 0) + videos.reduce((sum, v) => sum + v.views, 0) + whitepapers.reduce((sum, w) => sum + w.downloads, 0)

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl text-text dark:text-text-dark mb-3">Insights & Resources</h1>
          <p className="text-lg text-muted">Expert perspectives on healthcare technology, AI, and digital transformation in India.</p>
        </div>

        {/* Content Analytics Bar */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/10 dark:border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-sm text-text dark:text-text-dark flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Content Analytics
            </h3>
            <span className="text-xs text-muted">{totalViews.toLocaleString()} total engagements</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { count: blogPosts.length, label: 'Blog Posts', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
              { count: caseStudies.length, label: 'Case Studies', icon: FileText, color: 'text-secondary', bg: 'bg-secondary/10' },
              { count: whitepapers.length, label: 'Whitepapers', icon: Download, color: 'text-accent', bg: 'bg-accent/10' },
              { count: videos.length, label: 'Video Demos', icon: Video, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-dark border border-border dark:border-border-dark">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', item.bg)}>
                  <item.icon className={cn('w-4.5 h-4.5', item.color)} />
                </div>
                <div>
                  <p className={cn('font-display font-bold text-lg', item.color)}>{item.count}</p>
                  <p className="text-xs text-muted">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search articles, case studies, tags..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-border-dark bg-white dark:bg-surface-dark text-sm text-text dark:text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {activeTab === 'blog' && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted" />
              <div className="flex gap-1.5">
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      selectedCategory === cat
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-muted hover:bg-gray-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {cat === 'all' ? 'All' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 mb-10">
          {([['blog', 'Blog', BookOpen], ['cases', 'Case Studies', FileText], ['whitepapers', 'Whitepapers', Download], ['videos', 'Videos', Video]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => { setActiveTab(id); setSearchQuery(''); setSelectedCategory('all'); }} className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors',
              activeTab === id ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-slate-800 text-muted hover:bg-gray-200 dark:hover:bg-slate-700'
            )}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {activeTab === 'blog' && (
          <div>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-muted mx-auto mb-3" />
                <p className="text-muted">No articles found matching &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link key={post.slug} to={`/insights/${post.slug}`} className="group bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden hover:shadow-lg transition-all relative">
                {post.isMostRead && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-white text-[10px] font-bold uppercase tracking-wide">
                    <TrendingUp className="w-3 h-3" /> Most Read
                  </div>
                )}
                <div className="h-40 gradient-primary flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/30" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">{post.category}</span>
                    <span className="text-xs text-muted">{post.readTime}</span>
                    <span className="text-xs text-muted flex items-center gap-0.5 ml-auto"><Eye className="w-3 h-3" />{post.views.toLocaleString()}</span>
                  </div>
                  <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border dark:border-border-dark">
                    <User className="w-3 h-3 text-muted" />
                    <span className="text-xs text-muted">{post.author}</span>
                    <span className="text-xs text-muted ml-auto">{new Date(post.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
            )}
          </div>
        )}

        {activeTab === 'cases' && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredCaseStudies.map(cs => (
              <Link key={cs.slug} to={`/insights/${cs.slug}`} className="group bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6 hover:shadow-lg transition-all">
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">{cs.clientType}</span>
                <h3 className="font-display font-semibold text-lg text-text dark:text-text-dark mt-3 mb-2 group-hover:text-primary transition-colors">{cs.title}</h3>
                <p className="text-sm text-muted mb-4">{cs.challenge.substring(0, 120)}...</p>
                <div className="grid grid-cols-3 gap-3">
                  {cs.metrics.map(m => (
                    <div key={m.label} className="text-center p-2 rounded-lg bg-primary/5">
                      <p className="font-display font-bold text-lg text-primary">{m.value}</p>
                      <p className="text-[10px] text-muted">{m.label}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'whitepapers' && (
          <div className="grid md:grid-cols-3 gap-6">
            {whitepapers.map(wp => (
              <div key={wp.title} className="bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-text dark:text-text-dark mb-2">{wp.title}</h3>
                <div className="flex items-center gap-4 text-xs text-muted mb-4">
                  <span>{wp.pages} pages</span>
                  <span>{wp.downloads.toLocaleString()} downloads</span>
                </div>
                <button className="w-full py-2 rounded-lg bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-8">
            {/* Featured Webinar Banner */}
            <div className="relative overflow-hidden rounded-2xl gradient-primary p-8 md:p-10">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full bg-secondary text-white text-xs font-bold uppercase tracking-wide">Upcoming</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-xl md:text-2xl text-white mb-2">{featuredWebinar.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{featuredWebinar.date}</span>
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{featuredWebinar.speaker}</span>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-secondary text-white font-semibold text-sm hover:bg-secondary-dark transition-colors flex-shrink-0">
                  Register Now
                </button>
              </div>
            </div>

            {/* Video Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map(video => (
                <div key={video.title} className="group bg-white dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark overflow-hidden hover:shadow-lg transition-all cursor-pointer">
                  <div className="relative h-44 gradient-primary flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-7 h-7 text-white ml-1" />
                    </div>
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-medium">{video.duration}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        video.category === 'Product Demo' && 'bg-primary/10 text-primary',
                        video.category === 'Technical' && 'bg-accent/10 text-accent',
                        video.category === 'Case Study' && 'bg-secondary/10 text-secondary',
                        video.category === 'Industry' && 'bg-warning/10 text-warning',
                      )}>{video.category}</span>
                    </div>
                    <h3 className="font-display font-semibold text-text dark:text-text-dark mb-3 group-hover:text-primary transition-colors line-clamp-2">{video.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted pt-3 border-t border-border dark:border-border-dark">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views.toLocaleString()} views</span>
                      <span className="flex items-center gap-1 ml-auto"><Calendar className="w-3.5 h-3.5" />{new Date(video.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 rounded-2xl gradient-primary p-10 text-center">
          <h2 className="font-display font-bold text-2xl text-white mb-3">Stay Updated</h2>
          <p className="text-white/70 mb-6">Get the latest healthcare technology insights delivered to your inbox.</p>
          <div className="flex max-w-md mx-auto">
            <input type="email" placeholder="your@email.com" className="flex-1 px-4 py-2.5 rounded-l-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none" />
            <button className="px-6 py-2.5 rounded-r-xl bg-secondary text-white font-semibold text-sm hover:bg-secondary-dark transition-colors">Subscribe</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function Insights() {
  const { slug } = useParams()
  if (slug) return <ArticleDetail slug={slug} />
  return <InsightsListing />
}
