import React from 'react';
import { Gavel, Users, Info, Scale } from 'lucide-react';
import { LegalLayout, LegalSection } from '../components/LegalLayout';

export const Terms: React.FC = () => {
    return (
        <LegalLayout
            icon={<Gavel size={16} />}
            title="Small"
            italicTitle="Print"
            subtitle="Our terms are built on mutual respect and the shared mission of celebrating makers and heritage craft in our community."
            lastUpdated="February 25, 2026"
            footerQuote="Fostering community through integrity and shared values."
        >
            <LegalSection icon={<Users size={20} />} title="1. Community & Use">
                <p>Heritage Craft Media is a community space. By using our platform, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Use the platform for lawful purposes only.</li>
                    <li>Respect other community members, makers, and contributors.</li>
                    <li>Provide accurate information in any submissions (stories, events, feedback).</li>
                </ul>
            </LegalSection>

            <LegalSection icon={<Info size={20} />} title="2. Maker Profiles & Stories">
                <p>For makers and craftspeople featured on our platform:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>**Authenticity**: You certify that your work represents genuine craft practice. We reserve the right to remove profiles that misrepresent handmade or heritage work.</li>
                    <li>**Ownership**: You retain ownership of your stories and images, but grant us permission to feature them on the Heritage Craft Media platform.</li>
                    <li>**Opt-out**: You may request removal of your profile at any time by contacting us.</li>
                </ul>
            </LegalSection>

            <LegalSection icon={<Scale size={20} />} title="3. Our Mission">
                <p>Heritage Craft Media is dedicated to celebrating makers, heritage crafts, and community through storytelling, radio, and media. Any revenue generated supports our community radio, maker storytelling, and ongoing media production.</p>
                <p>We reserve the right to modify these terms as our community grows and evolves. We will always notify you of significant changes.</p>
            </LegalSection>
        </LegalLayout>
    );
};
