import { Link } from 'react-router-dom';

function GuidelinesPage() {
  const sections = [
    {
      title: 'Content Standards',
      rules: [
        'All posts must be your original work. Plagiarism will result in content removal and account suspension.',
        'Provide accurate information. Deliberately misleading or false content is not permitted.',
        'Use appropriate tags to help readers find your content. Misleading tags may be edited or removed.',
        'Posts must contain substantial content — minimum 100 words. Low-effort or empty posts will be removed.',
        'AI-generated content must be clearly labeled as such in the post body.',
      ],
    },
    {
      title: 'Community Conduct',
      rules: [
        'Treat all members with respect. Harassment, hate speech, and personal attacks are strictly prohibited.',
        'Critique ideas, not people. Constructive feedback is welcome; ad hominem attacks are not.',
        'Do not spam, self-promote excessively, or post affiliate links without disclosure.',
        'Avoid derailing conversations. Stay on topic in comment threads.',
        'Respect content warnings. Mark NSFW or sensitive content appropriately.',
      ],
    },
    {
      title: 'Posting Guidelines',
      rules: [
        'Use descriptive titles that accurately reflect your post content.',
        'Format your posts for readability — use headings, paragraphs, and lists where appropriate.',
        'The word limit for a single post is 2,000 words. For longer content, consider a series.',
        'Cite your sources when referencing statistics, studies, or external data.',
        'Do not impersonate other individuals, organizations, or public figures.',
      ],
    },
    {
      title: 'Comments & Engagement',
      rules: [
        'Comments should add value to the discussion. One-word or purely emotive comments may be removed.',
        'Do not use comments to promote your own content without contributing to the discussion.',
        'Report violations rather than engaging with them. Use the report mechanism available on every post.',
        'Thread replies should stay relevant to the parent comment.',
      ],
    },
    {
      title: 'Privacy & Safety',
      rules: [
        'Do not share personal information — yours or others — in posts or comments.',
        'Do not post doxxing content, private messages without consent, or confidential information.',
        'Respect intellectual property rights. Only share content you have the right to share.',
        'Accounts found engaging in phishing, scamming, or other malicious activity will be permanently banned.',
      ],
    },
    {
      title: 'Enforcement',
      rules: [
        'Violations are reviewed on a case-by-case basis. Penalties range from content removal to permanent account ban.',
        'Repeated minor violations will result in escalating consequences, including temporary or permanent suspension.',
        'You may appeal content decisions by contacting the moderation team with a clear explanation.',
        'Attempting to circumvent moderation actions (e.g., creating alternate accounts) will result in immediate permanent ban.',
      ],
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-bold text-[#f5f5f5] mb-3">Community Guidelines</h1>
        <p className="font-body text-[#9ca3af] leading-relaxed">
          Fuglog is a community built on respect, knowledge sharing, and constructive discussion.
          These guidelines exist to keep our platform welcoming and valuable for everyone.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {sections.map((section, i) => (
          <section key={i} className="bg-[#161616] border border-[#2a2a2a] rounded-lg p-6">
            <h2 className="font-display text-lg font-bold text-[#f5f5f5] mb-4">{section.title}</h2>
            <ul className="flex flex-col gap-3 list-none p-0">
              {section.rules.map((rule, j) => (
                <li key={j} className="flex items-start gap-3 text-sm text-[#9ca3af] leading-relaxed font-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 flex-shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 bg-[#161616] border border-[#2a2a2a] rounded-lg p-6 text-center">
        <p className="text-sm text-[#9ca3af] font-body mb-4">
          These guidelines may be updated from time to time. Continued use of the platform constitutes acceptance of any changes.
        </p>
        <Link
          to="/create"
          className="inline-block bg-red-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold font-sans no-underline hover:bg-red-700 transition-colors"
        >
          Start writing
        </Link>
      </div>
    </div>
  );
}

export default GuidelinesPage;
