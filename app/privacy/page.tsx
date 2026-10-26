import type { Metadata } from 'next';
import { ContactLink, ExternalLink, LegalPage, List, Section } from '../components/LegalPage';

export const metadata: Metadata = { title: 'Privacy Policy · Slots of Flavor' };

export default function Privacy() {
    return (
        <LegalPage title="Privacy Policy">
            <p>
                Slots of Flavor (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is a small personal project that suggests a random
                restaurant near you. This policy explains what information the app collects, why, and what you can do
                about it. We try to collect as little as possible.
            </p>

            <Section title="What we collect">
                <List>
                    <li>
                        <strong>Account information.</strong> Your email address and a unique account ID. If you sign in
                        with Google, Google shares your name, email address and profile photo with our sign-in provider
                        (Firebase Authentication). Our own database stores only your email and account ID.
                    </li>
                    <li>
                        <strong>Guest sessions.</strong> If you try the app without an account, Firebase Authentication gives
                        your browser an anonymous account ID with no name or email. If you then create an account, anything
                        you liked or disliked as a guest moves to your new account.
                    </li>
                    <li>
                        <strong>Places you like or dislike.</strong> When you tap Like or Dislike, we save that restaurant&rsquo;s
                        name, address, rating, price level, Google Maps link and photo link, along with when you saved it.
                    </li>
                    <li>
                        <strong>Searches.</strong> The location, craving, distance and price you search with are sent to our
                        server and to Google to find restaurants. We don&rsquo;t keep a history of your searches.
                    </li>
                    <li>
                        <strong>A daily search count.</strong> We count the total number of searches made in the app each day
                        to enforce a daily limit. This count is shared across all users and isn&rsquo;t linked to you.
                    </li>
                    <li>
                        <strong>Cookies and browser storage.</strong> We set a cookie named <code>user</code> containing your
                        email address so the app remembers you&rsquo;re signed in. It expires after 7 days or when you sign
                        out. Firebase also keeps your sign-in session in your browser&rsquo;s storage.
                    </li>
                </List>
                <p>
                    We don&rsquo;t use advertising, analytics or tracking tools, and we don&rsquo;t ask for your device&rsquo;s
                    precise location.
                </p>
            </Section>

            <Section title="How we use it">
                <List>
                    <li>To sign you in and keep your account secure.</li>
                    <li>To find restaurants for your searches and show you your liked and disliked places.</li>
                    <li>To keep disliked places out of your future spins.</li>
                    <li>To limit how many searches the app makes each day.</li>
                </List>
            </Section>

            <Section title="Who we share it with">
                <p>We don&rsquo;t sell your information. We share it only with the services that run the app:</p>
                <List>
                    <li>
                        <strong>Google Firebase</strong> handles sign-in and stores your account and saved places.
                    </li>
                    <li>
                        <strong>Google Maps Platform</strong> receives your search details to return restaurants and photos.
                        Google&rsquo;s use of that information is covered by the{' '}
                        <ExternalLink href="https://policies.google.com/privacy">Google Privacy Policy</ExternalLink>.
                    </li>
                    <li>
                        <strong>Vercel</strong> hosts the app. Like most hosts, it may keep standard server logs, such as your
                        IP address and browser type, for security and troubleshooting.
                    </li>
                </List>
                <p>We may also share information if the law requires it.</p>
            </Section>

            <Section title="How long we keep it">
                <p>
                    We keep your account and saved places until you remove them or delete your account. Places you remove and
                    accounts you delete are erased right away.
                </p>
            </Section>

            <Section title="Your choices">
                <List>
                    <li>You can remove any liked or disliked place at any time from the My spots page.</li>
                    <li>
                        You can delete your account and everything saved with it at any time with the Delete my account
                        button at the bottom of the My spots page. Deletion is immediate and permanent.
                    </li>
                    <li>
                        To ask what we hold about you, or if you can&rsquo;t access your account, email <ContactLink />.
                        We&rsquo;ll respond within 30 days.
                    </li>
                </List>
            </Section>

            <Section title="Children">
                <p>
                    Slots of Flavor isn&rsquo;t intended for children under 13, and we don&rsquo;t knowingly collect
                    information from them. If you believe a child has created an account, contact us and we&rsquo;ll delete it.
                </p>
            </Section>

            <Section title="Security">
                <p>
                    We use the security features of our providers, including encrypted connections and database rules that
                    let each account access only its own data. No online service is perfectly secure, so we can&rsquo;t
                    guarantee absolute security.
                </p>
            </Section>

            <Section title="Changes to this policy">
                <p>
                    If we change this policy, we&rsquo;ll update the effective date above. Continuing to use the app after a
                    change means you accept the updated policy.
                </p>
            </Section>

            <Section title="Contact">
                <p>Questions about privacy? Email <ContactLink />.</p>
            </Section>
        </LegalPage>
    );
}
