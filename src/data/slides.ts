export interface PresentationMeta {
  id: string;
  title: string;
  path: string;
  updatedAt: string;
  description?: string;
  tags?: string[];
  thumbnail?: string;
  author?: string;
  featured?: boolean;
}

export const presentations: PresentationMeta[] = [
  {
    id: 'ai-mentoring',
    title: 'AI Mentoring',
    path: '/slides/ai-mentoring (1).html',
    updatedAt: '2026-04-05',
    description: 'AI 멘토링 발표자료',
    tags: ['ai', 'mentoring'],
    author: 'Team',
    featured: false,
  },
];
