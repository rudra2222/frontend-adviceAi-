import React from "react";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = ({ onBack }) => {
    return (
        <div className="flex-1 bg-zinc-950 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-4 px-6 py-4">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                    </button>
                    <h1 className="text-zinc-100 text-[20px] font-medium">
                        Help
                    </h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[900px] mx-auto p-6">
                    <div className="privacy-policy-content">
                        <h1>Privacy Policy</h1>
                        <p>
                            <strong>Effective Date:</strong> 10th October 2025
                        </p>

                        <p>
                            At <strong>Adviseai.in</strong>, we are committed to
                            protecting your privacy. This Privacy Policy
                            explains how we collect, use, disclose, and
                            safeguard your information when you use our website
                            and services. By accessing or using our services,
                            you agree to the terms of this Privacy Policy.
                        </p>

                        <h2>1. Information We Collect</h2>
                        <p>
                            We may collect the following types of information:
                        </p>

                        <h3>a. Personal Information</h3>
                        <ul>
                            <li>
                                <strong>Contact Information:</strong> Name,
                                email address, phone number, and other contact
                                details you provide.
                            </li>
                            <li>
                                <strong>Account Information:</strong> Username,
                                password, and preferences related to your
                                account.
                            </li>
                            <li>
                                <strong>Payment Information:</strong> Billing
                                address and payment details when you make
                                purchases (processed securely by third-party
                                payment processors).
                            </li>
                        </ul>

                        <h3>b. Usage Data</h3>
                        <ul>
                            <li>
                                <strong>Device Information:</strong> IP address,
                                browser type, operating system, and device
                                identifiers.
                            </li>
                            <li>
                                <strong>Log Data:</strong> Pages visited, time
                                spent on pages, and other analytics data.
                            </li>
                            <li>
                                <strong>
                                    Cookies and Tracking Technologies:
                                </strong>{" "}
                                We use cookies and similar technologies to
                                enhance user experience and analyze usage
                                patterns.
                            </li>
                        </ul>

                        <h3>c. Third-Party Data</h3>
                        <p>
                            We may receive information about you from
                            third-party services if you integrate them with our
                            platform (e.g., WhatsApp, Google Analytics).
                        </p>

                        <h2>2. How We Use Your Information</h2>
                        <p>
                            We use the collected information for the following
                            purposes:
                        </p>
                        <ul>
                            <li>
                                <strong>Service Delivery:</strong> To provide,
                                operate, and maintain our services.
                            </li>
                            <li>
                                <strong>Communication:</strong> To send you
                                updates, newsletters, promotional materials, and
                                respond to inquiries.
                            </li>
                            <li>
                                <strong>Personalization:</strong> To tailor
                                content and features to your preferences.
                            </li>
                            <li>
                                <strong>Analytics:</strong> To analyze usage
                                trends and improve our platform.
                            </li>
                            <li>
                                <strong>Security:</strong> To detect and prevent
                                fraud, unauthorized access, and other security
                                issues.
                            </li>
                            <li>
                                <strong>Legal Compliance:</strong> To comply
                                with legal obligations and enforce our terms of
                                service.
                            </li>
                        </ul>

                        <h2>3. How We Share Your Information</h2>
                        <p>
                            We do not sell your personal information. However,
                            we may share your information in the following
                            circumstances:
                        </p>
                        <ul>
                            <li>
                                <strong>Service Providers:</strong> With
                                third-party vendors who assist us in operating
                                our platform (e.g., hosting, payment
                                processing).
                            </li>
                            <li>
                                <strong>Business Transfers:</strong> In
                                connection with mergers, acquisitions, or asset
                                sales.
                            </li>
                            <li>
                                <strong>Legal Requirements:</strong> When
                                required by law, regulation, or legal process.
                            </li>
                            {/* <li>
                                <strong>With Your Consent:</strong> When you
                                explicitly agree to share your information.
                            </li> */}
                        </ul>

                        <h2>4. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to
                            protect your information from unauthorized access,
                            disclosure, alteration, or destruction. However, no
                            method of transmission over the internet is 100%
                            secure, and we cannot guarantee absolute security.
                        </p>

                        <h2>5. Your Rights and Choices</h2>
                        <p>
                            You have the following rights regarding your
                            personal information:
                        </p>
                        <ul>
                            <li>
                                <strong>Access and Update:</strong> You can
                                access and update your account information at
                                any time.
                            </li>
                            <li>
                                <strong>Deletion:</strong> You can request the
                                deletion of your personal data, subject to legal
                                and contractual obligations.
                            </li>
                            <li>
                                <strong>Opt-Out:</strong> You can opt out of
                                receiving promotional emails by following the
                                unsubscribe link in our emails.
                            </li>
                            <li>
                                <strong>Cookies:</strong> You can manage cookie
                                preferences through your browser settings.
                            </li>
                        </ul>

                        <h2>6. Third-Party Links</h2>
                        <p>
                            Our platform may contain links to third-party
                            websites or services. We are not responsible for the
                            privacy practices of these external sites. We
                            encourage you to review their privacy policies
                            before providing any personal information.
                        </p>

                        <h2>7. Children's Privacy</h2>
                        <p>
                            Our services are not intended for individuals under
                            the age of 18. We do not knowingly collect personal
                            information from children. If we become aware that
                            we have collected data from a child, we will take
                            steps to delete it.
                        </p>

                        <h2>8. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed
                            in countries other than your own. By using our
                            services, you consent to such transfers. We ensure
                            appropriate safeguards are in place to protect your
                            data in compliance with applicable laws.
                        </p>

                        <h2>9. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time.
                            Any changes will be posted on this page with an
                            updated "Effective Date." We encourage you to review
                            this policy periodically.
                        </p>

                        <h2>10. Contact Us</h2>
                        <p>
                            If you have any questions or concerns about this
                            Privacy Policy, please contact us at:
                        </p>
                        <p>
                            <strong>Email:</strong>{" "}
                            <a href="mailto:advise0007@gmail.com">
                                advise0007@gmail.com
                            </a>
                            <br />
                            <strong>Phone:</strong> +91 89108 49189
                            <br />
                            <strong>Address:</strong> Balaji tower Dankuni West Bengal, 712311
                        </p>

                        <hr
                            style={{ margin: "2rem 0", borderColor: "#3f3f46" }}
                        />

                        <p style={{ fontSize: "0.9rem", color: "#a1a1aa" }}>
                            By using Advise AI, you acknowledge that you have
                            read and understood this Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Styles for Privacy Policy Content */}
            <style>{`
                .privacy-policy-content {
                    color: #e4e4e7;
                    line-height: 1.8;
                }
                .privacy-policy-content h1 {
                    color: #fafafa;
                    font-weight: 600;
                    font-size: 2rem;
                    margin-bottom: 1.5rem;
                }
                .privacy-policy-content h2 {
                    color: #fafafa;
                    font-weight: 600;
                    font-size: 1.5rem;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                }
                .privacy-policy-content h3 {
                    color: #fafafa;
                    font-weight: 600;
                    font-size: 1.25rem;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                }
                .privacy-policy-content p {
                    margin-bottom: 1rem;
                    color: #d4d4d8;
                }
                .privacy-policy-content ul {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                    list-style-type: disc;
                }
                .privacy-policy-content li {
                    margin-bottom: 0.5rem;
                    color: #d4d4d8;
                }
                .privacy-policy-content a {
                    color: #22c55e;
                    text-decoration: underline;
                }
                .privacy-policy-content a:hover {
                    color: #16a34a;
                }
                .privacy-policy-content strong {
                    color: #fafafa;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default PrivacyPolicy;
