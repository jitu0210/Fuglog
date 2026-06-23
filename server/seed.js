require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');

const usersData = [
  { username: 'sarah_chen', email: 'sarah@example.com', password: 'password123', bio: 'Full-stack developer & writer. I build things and write about them.' },
  { username: 'alex_martin', email: 'alex@example.com', password: 'password123', bio: 'Data scientist by day, fiction writer by night. Exploring the intersection of technology and creativity.' },
  { username: 'jordan_writes', email: 'jordan@example.com', password: 'password123', bio: 'Tech journalist covering AI, startups, and the future of work.' },
  { username: 'priya_k', email: 'priya@example.com', password: 'password123', bio: 'UX designer who loves to write about design systems, accessibility, and user research.' },
  { username: 'marcus_dev', email: 'marcus@example.com', password: 'password123', bio: 'Open source contributor. Rust enthusiast. Building the next generation of developer tools.' },
  { username: 'elena_writes', email: 'elena@example.com', password: 'password123', bio: 'Product manager turned writer. Sharing lessons from the trenches of tech.' },
  { username: 'raj_codes', email: 'raj@example.com', password: 'password123', bio: 'Backend engineer specializing in distributed systems and cloud architecture.' },
  { username: 'lily_art', email: 'lily@example.com', password: 'password123', bio: 'Creative technologist blending art and code. Generative art, creative coding, and digital design.' },
];

const tags = [
  'javascript', 'react', 'nodejs', 'python', 'typescript',
  'design', 'ux', 'ai', 'machine-learning', 'career',
  'web-dev', 'devops', 'database', 'api', 'testing',
  'performance', 'security', 'mobile', 'css', 'open-source',
];

const longContent = (topic) => {
  const paragraphs = [
    `When we first encounter the concept of ${topic}, it's easy to get lost in the technical details. The ecosystem has grown enormously over the past few years, with new tools, frameworks, and best practices emerging at a rapid pace. But beneath all the complexity lies a simple truth: the fundamentals matter more than ever. Understanding the core principles allows us to evaluate new tools critically and make informed decisions about what to adopt and what to leave behind.`,

    `The landscape of ${topic} has shifted dramatically. What was once considered best practice is now often seen as an anti-pattern. This constant evolution can be exhausting, but it's also what makes this field so exciting. Every year brings new innovations that challenge our assumptions and push the boundaries of what's possible. The key is to stay curious while maintaining a healthy skepticism toward hype cycles.`,

    `Let's break down the essential concepts. At its core, ${topic} is about solving real problems for real people. The technology is just a means to an end. When we lose sight of this, we end up building complex solutions to problems nobody has. The most successful practitioners in this space share a common trait: they focus on outcomes rather than outputs, on impact rather than activity.`,

    `One of the most common mistakes I see is over-engineering. Developers reach for the most complex solution before understanding the problem fully. They add layers of abstraction, introduce new dependencies, and create systems that are elegant on paper but brittle in practice. The best code is the code you don't write. The best architecture is the one that can evolve as requirements change.`,

    `Performance is another area where ${topic} demands attention. In a world where users expect instant responses, every millisecond counts. Studies have shown that a one-second delay in page load time can lead to a 7% reduction in conversions. But performance isn't just about speed — it's about perceived performance, about managing user expectations, and about delivering a smooth experience even when network conditions are less than ideal.`,

    `Accessibility is often treated as an afterthought, but it should be woven into the fabric of every project from the start. Building inclusive experiences isn't just the right thing to do — it's good business. Approximately 15% of the world's population lives with some form of disability. When we design for accessibility, we create better products for everyone.`,

    `The community around ${topic} is one of its greatest strengths. Open source contributions, conference talks, blog posts, and online discussions have created a rich knowledge ecosystem that benefits everyone. But with abundance comes the challenge of information overload. Learning how to filter signal from noise, how to identify credible sources, and how to build a personal learning path is a skill in itself.`,

    `Testing is not optional. Whether you're building a simple prototype or a mission-critical system, having confidence in your code is essential. Automated tests give you the freedom to refactor, the safety net to deploy with confidence, and the documentation that stays in sync with your code. The upfront investment pays dividends many times over as your project grows.`,

    `Security considerations should be baked into your ${topic} workflow from day one. Too many teams treat security as a checklist item to be addressed at the end of a project. This reactive approach inevitably leads to vulnerabilities. A proactive security mindset means thinking about threat models, data validation, authentication, authorization, and encryption as integral parts of the design process.`,

    `Looking ahead, the future of ${topic} is bright but uncertain. Emerging technologies like AI-assisted development, edge computing, and WebAssembly are reshaping the landscape. The tools we use today may become obsolete tomorrow. But the principles that guide good design, clean architecture, and thoughtful engineering will remain relevant regardless of the specific technologies in vogue.`,

    `Collaboration is at the heart of great software development. No matter how skilled an individual developer might be, the most impactful projects are built by teams. Code reviews, pair programming, and collaborative design sessions produce better results than solitary work. The social aspects of ${topic} — communication, empathy, and shared understanding — are just as important as technical skills.`,

    `Documentation is the unsung hero of software projects. Good documentation reduces onboarding time, prevents misunderstandings, and preserves institutional knowledge. But writing good documentation is hard. It requires empathy for the reader, clarity of thought, and a willingness to update content as the code evolves. Treat documentation as a first-class citizen in your ${topic} projects.`,

    `The debate between simplicity and flexibility is one that every practitioner of ${topic} must navigate. Simple solutions are easy to understand, easy to maintain, and easy to change. But they may not handle edge cases well. Flexible solutions can handle a wide range of scenarios but come with complexity costs. Finding the right balance depends on context, requirements, and the team's expertise.`,

    `Error handling is often glossed over in tutorials, but it's critical in production systems. Every edge case, every network failure, every unexpected input must be handled gracefully. Users may forgive a bug, but they won't forgive an application that crashes without explanation. Invest time in thoughtful error handling, logging, and monitoring from the start.`,

    `Continuous learning is non-negotiable in ${topic}. The half-life of technical knowledge is shrinking. What you learned two years ago may be outdated today. The ability to learn quickly, unlearn outdated patterns, and relearn new approaches is the most valuable skill you can cultivate. Build learning into your routine, experiment with new tools, and share what you discover with the community.`,

    `Ethical considerations in ${topic} deserve more attention than they currently receive. The tools we build have real-world consequences. Algorithmic bias, privacy concerns, environmental impact, and the digital divide are not abstract problems — they are the direct result of decisions we make as technologists. Taking responsibility for these outcomes is part of being a professional.`,

    `The relationship between ${topic} and business value is sometimes overlooked by technical practitioners. Understanding the business context, user needs, and market dynamics makes you a more effective contributor. Code that doesn't solve a real problem is just an expensive hobby. Learn to speak the language of business while maintaining your technical excellence.`,

    `Version control is the foundation of collaborative development. Beyond just tracking changes, a good Git workflow enables experimentation through branching, facilitates code reviews through pull requests, and provides a safety net for disaster recovery. Invest time in learning Git deeply — it will pay off countless times throughout your career in ${topic}.`,

    `Deployment and operations are where theory meets reality. No matter how elegant your ${topic} solution is in development, it's only valuable if it works reliably in production. Understanding deployment pipelines, monitoring, alerting, and incident response is essential for building systems that users can depend on. DevOps is not a role — it's a philosophy that every developer should embrace.`,

    `As we wrap up this exploration of ${topic}, remember that mastery is a journey, not a destination. Every expert was once a beginner. Every complex system started as a simple idea. Keep building, keep learning, keep sharing. The community thrives on generosity and collaboration. Your unique perspective has value — don't be afraid to contribute your voice to the conversation.`,
  ];
  return paragraphs.join('\n\n');
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      Notification.deleteMany({}),
      Comment.deleteMany({}),
      Post.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const users = await User.create(usersData);
    console.log(`Created ${users.length} users`);

    const postTemplates = [
      { title: 'Building Scalable APIs with Node.js and Express', tags: ['nodejs', 'api', 'web-dev'], topic: 'building scalable APIs' },
      { title: 'Understanding React Server Components', tags: ['react', 'javascript', 'web-dev'], topic: 'React Server Components' },
      { title: 'A Practical Guide to TypeScript Generics', tags: ['typescript', 'javascript', 'web-dev'], topic: 'TypeScript generics' },
      { title: 'The Future of CSS: What You Need to Know', tags: ['css', 'web-dev', 'design'], topic: 'modern CSS' },
      { title: 'Machine Learning for Beginners: A Hands-On Approach', tags: ['ai', 'machine-learning', 'python'], topic: 'machine learning fundamentals' },
      { title: 'Designing Accessible User Interfaces', tags: ['design', 'ux', 'css'], topic: 'accessible UI design' },
      { title: 'Deep Dive into Database Indexing Strategies', tags: ['database', 'performance', 'web-dev'], topic: 'database indexing' },
      { title: 'Containerization with Docker: Beyond the Basics', tags: ['devops', 'web-dev', 'nodejs'], topic: 'Docker containerization' },
      { title: 'Writing Clean Code: Principles That Stand the Test of Time', tags: ['javascript', 'python', 'web-dev'], topic: 'writing clean code' },
      { title: 'State Management in React: From Context to Zustand', tags: ['react', 'javascript', 'typescript'], topic: 'React state management' },
      { title: 'Building Resilient Microservices', tags: ['nodejs', 'api', 'devops'], topic: 'microservices architecture' },
      { title: 'Introduction to WebAssembly for Web Developers', tags: ['web-dev', 'javascript', 'performance'], topic: 'WebAssembly' },
      { title: 'Testing Strategies for Modern Web Applications', tags: ['testing', 'react', 'javascript'], topic: 'web application testing' },
      { title: 'Authentication and Authorization Best Practices', tags: ['security', 'api', 'nodejs'], topic: 'authentication and authorization' },
      { title: 'GraphQL vs REST: Making the Right Choice', tags: ['api', 'nodejs', 'web-dev'], topic: 'GraphQL vs REST APIs' },
      { title: 'Getting Started with Python for Data Science', tags: ['python', 'ai', 'machine-learning'], topic: 'Python for data science' },
      { title: 'Progressive Web Apps: Building for the Modern Web', tags: ['web-dev', 'javascript', 'mobile'], topic: 'Progressive Web Apps' },
      { title: 'Open Source Contribution: A Beginner Guide', tags: ['open-source', 'web-dev', 'career'], topic: 'open source contribution' },
      { title: 'Career Growth in Tech: Lessons from the Trenches', tags: ['career', 'web-dev', 'design'], topic: 'tech career growth' },
      { title: 'Understanding Event-Driven Architecture', tags: ['nodejs', 'api', 'devops'], topic: 'event-driven architecture' },
      { title: 'CSS Grid and Flexbox: When to Use What', tags: ['css', 'design', 'web-dev'], topic: 'CSS Grid and Flexbox' },
      { title: 'Building CLI Tools with Node.js', tags: ['nodejs', 'javascript', 'open-source'], topic: 'building CLI tools' },
      { title: 'The Art of Code Review', tags: ['career', 'web-dev', 'testing'], topic: 'code review best practices' },
      { title: 'Responsive Design in 2026: New Approaches', tags: ['css', 'design', 'ux'], topic: 'responsive design' },
    ];

    const posts = [];
    for (let i = 0; i < postTemplates.length; i++) {
      const t = postTemplates[i];
      const author = users[i % users.length];
      const published = i < 20;
      const post = await Post.create({
        title: t.title,
        content: longContent(t.topic),
        tags: t.tags,
        author: author._id,
        published,
      });
      posts.push(post);
      console.log(`  Created post: "${t.title}" (${published ? 'published' : 'draft'})`);
    }
    console.log(`Created ${posts.length} posts`);

    const commentTexts = [
      'This is incredibly well written. I especially appreciated the practical examples throughout.',
      'Great article! I have been working with this for years and still learned something new.',
      'Thanks for sharing this. Would love to see a follow-up on more advanced topics.',
      'I disagree with some points here, but the clarity of your explanation is admirable.',
      'Bookmarking this for later reference. The section on best practices is gold.',
      'Really comprehensive overview. This should be required reading for anyone starting out.',
      'I implemented this approach last week and it made a huge difference. Highly recommend.',
      'Could you elaborate more on the performance implications? Curious about real-world metrics.',
      'This filled in several gaps in my understanding. Thank you for taking the time to write this.',
      'Excellent breakdown of complex concepts. Making this accessible is a real skill.',
      'I shared this with my team and it sparked a great discussion. Thanks for the insights.',
      'One thing I would add is considering edge cases in production environments.',
      'The comparison table was particularly helpful for visual learners like myself.',
      'I have been looking for a clear explanation like this for weeks. Thank you!',
      'Practical, well-structured, and easy to follow. More content like this please!',
    ];

    let commentCount = 0;
    for (const post of posts.slice(0, 18)) {
      const numComments = Math.floor(Math.random() * 4) + 1;
      for (let c = 0; c < numComments; c++) {
        const commenter = users[Math.floor(Math.random() * users.length)];
        const comment = await Comment.create({
          content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          author: commenter._id,
          post: post._id,
        });
        await Post.findByIdAndUpdate(post._id, { $inc: { commentsCount: 1 } });
        commentCount++;
      }
    }
    console.log(`Created ${commentCount} comments`);

    for (const post of posts.slice(0, 15)) {
      const numLikes = Math.floor(Math.random() * 6) + 2;
      const likers = users.sort(() => Math.random() - 0.5).slice(0, numLikes);
      for (const liker of likers) {
        await Post.findByIdAndUpdate(post._id, { $addToSet: { likes: liker._id } });
      }
    }
    console.log('Added likes to posts');

    for (const post of posts.slice(0, 10)) {
      const numWishlists = Math.floor(Math.random() * 3) + 1;
      const wishers = users.sort(() => Math.random() - 0.5).slice(0, numWishlists);
      for (const wisher of wishers) {
        await Post.findByIdAndUpdate(post._id, { $addToSet: { wishlistedBy: wisher._id } });
        await User.findByIdAndUpdate(wisher._id, { $addToSet: { wishlist: post._id } });
      }
    }
    console.log('Added wishlists');

    for (let i = 1; i < users.length; i++) {
      const follower = users[i];
      const followed = users[0];
      await User.findByIdAndUpdate(follower._id, { $addToSet: { following: followed._id } });
      await User.findByIdAndUpdate(followed._id, { $addToSet: { followers: follower._id } });
    }
    console.log('Added follows (everyone follows sarah_chen)');

    for (let i = 0; i < 5; i++) {
      const sender = users[Math.floor(Math.random() * users.length)];
      const recipient = users[0];
      if (sender._id.toString() !== recipient._id.toString()) {
        await Notification.create({
          recipient: recipient._id,
          sender: sender._id,
          type: 'like',
          post: posts[Math.floor(Math.random() * posts.length)]._id,
          read: Math.random() > 0.5,
        });
      }
    }
    console.log('Added sample notifications');

    console.log('\nSeed complete!');
    console.log('---');
    console.log('Login credentials for all users: password = "password123"');
    console.log('Example emails: sarah@example.com, alex@example.com, jordan@example.com');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
