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
    id: 'demo-welcome',
    title: 'Demo Welcome Deck',
    path: '/slides/demo/index.html',
    updatedAt: '2026-04-03',
    description: '초기 세팅 검증을 위한 샘플 발표입니다.',
    tags: ['demo', 'hub'],
    author: 'Team',
    featured: true,
  },
];
