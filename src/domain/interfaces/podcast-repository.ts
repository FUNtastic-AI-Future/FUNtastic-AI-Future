import { PodcastEntity } from '../entities/podcast';

export interface PodcastRepository {
  findById(id: string): Promise<PodcastEntity | null>;
  findAll(): Promise<PodcastEntity[]>;
  save(podcast: PodcastEntity): Promise<PodcastEntity>;
  delete(id: string): Promise<void>;
}

export interface AIGenerator {
  generatePodcastContent(prompt: string, options?: GenerationOptions): Promise<string>;
  isAvailable(): boolean;
}

export interface GenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export type RepositoryError = {
  code: string;
  message: string;
  context?: Record<string, unknown>;
};