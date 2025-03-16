import Link from 'next/link';
import dynamic from 'next/dynamic';

const EarthModel = dynamic(() => import('./components/EarthModel'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-primary animate-pulse">Loading 3D Model...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="relative min-h-screen">

      <main>
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Building the future of open source software
            </h1>
            <p className="hero-description">
              Creating universal and simple software that empowers developers and users alike.
            </p>
            <div className="flex gap-4 mt-8">
              <Link href="/products" className="btn btn-primary">
                Explore Products
              </Link>
              <Link
                href="/about"
                className="btn bg-accent hover:bg-accent/80"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 bg-accent">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Our Products</h2>
            <div className="feature-grid">
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">EonfluxTech Chat</h3>
                <p className="text-secondary mb-4">
                  A secure, open-source messaging platform designed for teams and communities.
                </p>
                <div className="flex gap-2 text-sm text-primary">
                  <span>Messaging</span>
                  <span>•</span>
                  <span>Collaboration</span>
                </div>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Tunneled</h3>
                <p className="text-secondary mb-4">
                  Expose local servers to the internet securely with end-to-end encryption.
                </p>
                <div className="flex gap-2 text-sm text-primary">
                  <span>Networking</span>
                  <span>•</span>
                  <span>Security</span>
                </div>
              </div>
              <div className="card">
                <h3 className="text-xl font-semibold mb-2">Benchmark</h3>
                <p className="text-secondary mb-4">
                  Performance testing and monitoring tools for modern web applications.
                </p>
                <div className="flex gap-2 text-sm text-primary">
                  <span>Performance</span>
                  <span>•</span>
                  <span>Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">About EonfluxTech</h2>
                <p className="text-secondary text-lg">
                  EonfluxTech is a technology company focused on creating open-source software that is both powerful and accessible. Our mission is to build tools that empower developers and enhance the digital experience for everyone.
                </p>
                <ul className="grid sm:grid-cols-2 gap-4">
                  <li className="flex gap-2 items-start">
                    <div className="rounded-full p-1.5 bg-primary/10 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Open Source</h3>
                      <p className="text-sm text-secondary">Transparency and community-driven</p>
                    </div>
                  </li>
                  <li className="flex gap-2 items-start">
                    <div className="rounded-full p-1.5 bg-primary/10 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">Cross-Platform</h3>
                      <p className="text-sm text-secondary">Works on all devices</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
                <div className="absolute inset-0">
                  <EarthModel />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
