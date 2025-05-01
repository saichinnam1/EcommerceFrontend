import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container my-8 mx-auto px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>
      <p className="text-lg mb-4">
        At <strong>TechnoTitans</strong>, we value your trust and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you visit our website, purchase our products, or interact with our services. By using our website, you agree to the practices described in this policy.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
        <p className="text-lg mb-2">We collect information to provide you with a seamless shopping experience. This includes:</p>
        <ul className="list-disc pl-6 text-lg">
          <li><strong>Personal Information:</strong> Name, email address, phone number, billing and shipping addresses, and payment details when you create an account or make a purchase.</li>
          <li><strong>Usage Data:</strong> Information about how you interact with our website, such as IP address, browser type, pages visited, and time spent on our site.</li>
          <li><strong>Communications:</strong> Information you provide when you contact us via email (<a href="mailto:support@technotitans.com" className="text-blue-600 hover:underline">support@technotitans.com</a>) or engage with us on social media (e.g., <a href="https://instagram.com/technotitans" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@technotitans on Instagram</a>).</li>
          <li><strong>Cookies and Tracking:</strong> We use cookies to enhance your experience, analyze site performance, and deliver personalized content. You can manage cookie preferences through your browser settings.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
        <p className="text-lg mb-2">We use your data to:</p>
        <ul className="list-disc pl-6 text-lg">
          <li>Process and fulfill your orders, including shipping and payment processing.</li>
          <li>Communicate with you about your account, orders, or customer service inquiries.</li>
          <li>Improve our website, products, and services based on usage trends and feedback.</li>
          <li>Send promotional offers, newsletters, or updates (you can opt out at any time).</li>
          <li>Prevent fraud, ensure security, and comply with legal obligations.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">3. Sharing Your Information</h2>
        <p className="text-lg mb-2">We do not sell your personal information. We may share your data with:</p>
        <ul className="list-disc pl-6 text-lg">
          <li><strong>Service Providers:</strong> Trusted partners who assist with payment processing, shipping, or website analytics.</li>
          <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and safety.</li>
          <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of the transaction.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
        <p className="text-lg">
          We implement industry-standard security measures, including encryption and secure servers, to protect your data. However, no online platform can guarantee absolute security. Please safeguard your account credentials and contact us immediately at <a href="mailto:support@technotitans.com" className="text-blue-600 hover:underline">support@technotitans.com</a> if you suspect unauthorized activity.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">5. Your Rights and Choices</h2>
        <p className="text-lg mb-2">You have the right to:</p>
        <ul className="list-disc pl-6 text-lg">
          <li>Access, update, or delete your personal information by contacting us.</li>
          <li>Opt out of marketing emails by clicking the “unsubscribe” link in our emails.</li>
          <li>Disable cookies through your browser settings, though this may affect website functionality.</li>
        </ul>
        <p className="text-lg mt-2">
          To exercise these rights, please email us at <a href="mailto:support@technotitans.com" className="text-blue-600 hover:underline">support@technotitans.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">6. Third-Party Links</h2>
        <p className="text-lg">
          Our website may contain links to third-party sites, such as our Instagram page (<a href="https://instagram.com/technotitans" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@technotitans</a>). We are not responsible for the privacy practices of these sites. Please review their policies before sharing information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">7. Children’s Privacy</h2>
        <p className="text-lg">
          Our services are not intended for individuals under 13. We do not knowingly collect data from children. If you believe a child has provided us with information, please contact us at <a href="mailto:support@technotitans.com" className="text-blue-600 hover:underline">support@technotitans.com</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>
        <p className="text-lg">
          We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of significant changes by posting the updated policy on our website with the effective date.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-3">9. Contact Us</h2>
        <p className="text-lg">
          If you have questions or concerns about this Privacy Policy, please reach out to us at:
        </p>
        <p className="text-lg mt-2">
          <strong>Email:</strong>{' '}
          <a href="mailto:support@technotitans.com" className="text-blue-600 hover:underline">support@technotitans.com</a>
        </p>
        <p className="text-lg">
          <strong>Follow Us:</strong>{' '}
          <a href="https://instagram.com/technotitans" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@technotitans on Instagram</a>
        </p>
      </section>

      <p className="text-lg text-center mt-8">
        <em>Last Updated: April 28, 2025</em>
      </p>
    </div>
  );
};

export default PrivacyPolicy;