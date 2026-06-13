export interface Service {
  title: string;
  description: string;
  outcome: string;
}

export const services: Service[] = [
  {
    title: "Workflow Automation",
    description:
      "Eliminate repetitive manual tasks with custom AI pipelines built around how your team actually works.",
    outcome: "Hours reclaimed every week",
  },
  {
    title: "AI-Driven Marketing",
    description:
      "Social media, SEO, and content systems that run consistently without daily manual effort.",
    outcome: "Always-on visibility",
  },
  {
    title: "Operations Intelligence",
    description:
      "Scheduling, document processing, alerts, and reporting tailored to your specific business operations.",
    outcome: "Fewer errors, faster decisions",
  },
  {
    title: "Productivity Multipliers",
    description:
      "AI tools that let a small team produce output that used to require a much larger one.",
    outcome: "More capacity, same headcount",
  },
];

export const engagementPaths = [
  {
    title: "Done-for-You",
    description:
      "I build the complete custom AI system end-to-end for your specific workflow.",
  },
  {
    title: "Consulting",
    description:
      "I identify your bottlenecks, architect the right solution, and map the implementation path.",
  },
  {
    title: "Coaching",
    description:
      "I teach your team to build, maintain, and extend AI automation independently.",
  },
];