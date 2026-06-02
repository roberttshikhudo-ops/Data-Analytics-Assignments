import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Agri Hub SA',
  description: 'Learn how Agri Hub SA collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
        <p className="mb-6 text-muted-foreground">Last updated: June 2026</p>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, 
              make a purchase, subscribe to our newsletter, or contact us for support. This may include:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Name and contact information (email, phone number, address)</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Order history and preferences</li>
              <li>Communications with our support team</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our products and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Delivery partners to fulfill your orders</li>
              <li>Payment processors to handle transactions securely</li>
              <li>Service providers who assist our operations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground">
              In accordance with the Protection of Personal Information Act (POPIA), you have the right to:
            </p>
            <ul className="list-disc pl-6 mt-2 text-muted-foreground space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 text-muted-foreground">
              Email: info@agrihubsa.co.za<br />
              Phone: 079 109 9490
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
