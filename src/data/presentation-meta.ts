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
