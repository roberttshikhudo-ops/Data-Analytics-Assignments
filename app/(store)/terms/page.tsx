import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the terms and conditions for using Agri Hub SA services.',
}

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold md:text-4xl">Terms & Conditions</h1>
        <p className="mb-6 text-muted-foreground">Last updated: June 2026</p>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Agri Hub SA website and services, you agree to be bound by these 
              Terms and Conditions. If you do not agree with any part of these terms, please do not 
              use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Products and Pricing</h2>
            <p className="text-muted-foreground">
              All prices are displayed in South African Rand (ZAR) and include VAT where applicable. 
              We reserve the right to change prices without prior notice. Product availability is 
              subject to stock levels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Orders and Payment</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Orders are subject to acceptance and availability</li>
              <li>Payment must be received before order dispatch</li>
              <li>We accept various payment methods including card payments and EFT</li>
              <li>All transactions are processed securely</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Delivery</h2>
            <p className="text-muted-foreground">
              Free delivery is available on orders over R1,000. Delivery times vary based on location. 
              We deliver nationwide across South Africa. Please see our Delivery Policy for more details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              We offer returns within 7 days of delivery for unused items in original packaging. 
              Refunds will be processed within 7-14 business days. Please see our Returns & Refunds 
              policy for full details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Product Information</h2>
            <p className="text-muted-foreground">
              We strive to provide accurate product descriptions and images. However, colours may 
              vary slightly due to screen settings. If you receive a product that differs significantly 
              from the description, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content on this website, including logos, images, and text, is the property of 
              Agri Hub SA and is protected by copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Agri Hub SA shall not be liable for any indirect, incidental, or consequential damages 
              arising from the use of our products or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms & Conditions, contact us at:
            </p>
            <p className="mt-2 text-muted-foreground">
              Email: robert.tshikhudo@gmail.com<br />
              Phone: 079 109 9490
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
