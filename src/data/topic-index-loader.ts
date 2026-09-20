import type { ProblemTopic, TopicIndexEntry } from './roadmap';

const topicFiles: Record<string, () => Promise<unknown>> = {
  './topics/string.json': () => import('./topics/string.json'),
  './topics/hash-map.json': () => import('./topics/hash-map.json'),
  './topics/hash-set.json': () => import('./topics/hash-set.json'),
  './topics/array.json': () => import('./topics/array.json'),
  './topics/sorting.json': () => import('./topics/sorting.json'),
  './topics/list.json': () => import('./topics/list.json'),
  './topics/two-pointers.json': () => import('./topics/two-pointers.json'),
  './topics/kotlin-collections.json': () => import('./topics/kotlin-collections.json'),
  './topics/stack.json': () => import('./topics/stack.json'),
  './topics/linked-list.json': () => import('./topics/linked-list.json'),
  './topics/binary-search.json': () => import('./topics/binary-search.json'),
  './topics/sliding-window.json': () => import('./topics/sliding-window.json'),
  './topics/prefix-sum.json': () => import('./topics/prefix-sum.json'),
  './topics/tree.json': () => import('./topics/tree.json'),
  './topics/graph.json': () => import('./topics/graph.json'),
};

const topicCache = new Map<string, TopicIndexEntry[]>();

const topicSlug = (topic: ProblemTopic): string => topic
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .toLowerCase()
  .replace(/\s*\/\s*/g, '-')
  .replace(/\s+/g, '-')
  .replace(/[^a-z0-9-]/g, '');

export async function loadTopicIndex(topic: ProblemTopic): Promise<TopicIndexEntry[]> {
  const cached = topicCache.get(topic);
  if (cached) return cached;

  const loader = topicFiles[`./topics/${topicSlug(topic)}.json`];
  if (!loader) {
    throw new Error(`No topic index found for ${topic}`);
  }

  const module = await loader() as { default: TopicIndexEntry[] };
  const entries = module.default;
  topicCache.set(topic, entries);
  return entries;
}
