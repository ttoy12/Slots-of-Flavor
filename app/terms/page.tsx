import type { Metadata } from 'next';
import Link from 'next/link';
import { ContactLink, ExternalLink, LegalPage, List, Section } from '../components/LegalPage';
import { DAILY_SEARCH_LIMIT } from '@/lib/searchLimit';

export const metadata: Metadata = { title: 'Terms of Service · Slots of Flavor' };

export default function Terms() {
    return (
        <LegalPage title="Terms of Service">
            <p>
                These terms cover your use of Slots of Flavor (&ldquo;the app&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
                By creating an account or using the app, you agree to them. If you don&rsquo;t agree, please don&rsquo;t
                use the app.
            </p>

            <Section title="What the app does">
                <p>
                    Slots of Flavor suggests a random restaurant based on your location and preferences. It&rsquo;s a free
                    personal project meant for fun. Suggestions are random, not recommendations or endorsements, and
                    we&rsquo;re not affiliated with any restaurant shown.
                </p>
            </Section>

            <Section title="Restaurant information">
                <p>
                    Restaurant details such as opening hours, prices, ratings, photos and addresses come from Google Maps and
                    may be incomplete, out of date or wrong. Always check important details, like whether a place is open,
                    before you go. We aren&rsquo;t responsible for your experience at any restaurant.
                </p>
            </Section>

            <Section title="Google Maps">
                <p>
                    The app uses Google Maps features and content. Your use of them is subject to the{' '}
                    <ExternalLink href="https://maps.google.com/help/terms_maps/">Google Maps / Google Earth Additional Terms of Service</ExternalLink>{' '}
                    and the <ExternalLink href="https://policies.google.com/privacy">Google Privacy Policy</ExternalLink>.
                </p>
            </Section>

            <Section title="Your account">
                <List>
                    <li>You must be at least 13 years old to use the app.</li>
                    <li>Keep your sign-in details secure. You&rsquo;re responsible for activity on your account.</li>
                    <li>Give accurate information when you sign up, and use the account only for yourself.</li>
                </List>
            </Section>

            <Section title="Acceptable use">
                <p>Please don&rsquo;t:</p>
                <List>
                    <li>use bots, scripts or other automated tools to search or collect data from the app;</li>
                    <li>try to get around the daily search limit or any security measures;</li>
                    <li>interfere with the app, other users or the services the app relies on;</li>
                    <li>use the app for anything illegal.</li>
                </List>
            </Section>

            <Section title="Search limit and availability">
                <p>
                    To keep the app free, it allows {DAILY_SEARCH_LIMIT} searches per day, shared across all users and reset at
                    midnight Pacific Time. We may change this limit, change or remove features, or stop running the app at any
                    time, with or without notice.
                </p>
            </Section>

            <Section title="Ending your use">
                <p>
                    You can stop using the app at any time and delete your account from the My spots page (see the{' '}
                    <Link href="/privacy" className="font-medium text-primary underline underline-offset-2">Privacy Policy</Link>).
                    We may suspend or close accounts that break these terms.
                </p>
            </Section>

            <Section title="No warranty">
                <p>
                    The app is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind,
                    including that it will be accurate, uninterrupted or error-free.
                </p>
            </Section>

            <Section title="Limitation of liability">
                <p>
                    To the fullest extent allowed by law, we aren&rsquo;t liable for any indirect, incidental or consequential
                    damages, or for any loss arising from your use of the app or from any restaurant you visit because of it.
                </p>
            </Section>

            <Section title="Changes to these terms">
                <p>
                    We may update these terms. When we do, we&rsquo;ll change the effective date above. Continuing to use the
                    app after a change means you accept the updated terms.
                </p>
            </Section>

            <Section title="Contact">
                <p>Questions about these terms? Email <ContactLink />.</p>
            </Section>
        </LegalPage>
    );
}
