import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/landing/Hero'
import Features from '../components/landing/Features'
import PlatformPreview from '../components/landing/PlatformPreview'
import ServiceStack from '../components/landing/ServiceStack'
import HowItWorks from '../components/landing/HowItWorks'
import Testimonials from '../components/landing/Testimonials'
import Pricing from '../components/landing/Pricing'
import Partners from '../components/landing/Partners'
import CTA from '../components/landing/CTA'

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <PlatformPreview />
      <ServiceStack />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <Partners />
      <CTA />
      <Footer />
    </div>
  )
}
