import topicIndexData from './topic-index.json';
import { loadTopicIndex } from './topic-index-loader';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface Hint {
  title: string;
  text: string;
}

export interface Approach {
  title: string;
  description: string;
}

export interface TestCase {
  name: string;
  input: string;
  output: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type ProblemTopic =
  | 'String'
  | 'Array'
  | 'List'
  | 'HashMap'
  | 'HashSet'
  | 'Sorting'
  | 'Kotlin Collections'
  | 'Stack'
  | 'Queue'
  | 'LinkedList'
  | 'Binary Search'
  | 'Sliding Window'
  | 'Two Pointers'
  | 'Recursion'
  | 'Prefix Sum'
  | 'Tree'
  | 'Graph';

export interface TopicIndexEntry {
  id: number;
  title: string;
}

export type TopicIndex = Partial<Record<ProblemTopic, TopicIndexEntry[]>>;

export const topicIndex = topicIndexData as TopicIndex;

export type SolutionLanguage = 'kotlin' | 'java';

export type SolutionRecommendation = 'Best' | 'Good to try' | 'Avoid unless needed';

export type ProblemContractFamily =
  | 'string'
  | 'character-frequency'
  | 'character-list'
  | 'numeric-list'
  | 'boolean'
  | 'map'
  | 'linked-list'
  | 'tree'
  | 'graph'
  | 'sliding-window'
  | 'binary-search'
  | 'advanced-list'
  | 'unknown';

export interface ProblemContract {
  family: ProblemContractFamily;
  input: string;
  output: string;
  preservesOrder?: boolean;
}

export interface SolutionVariant {
  label: string;
  code: string;
  recommendation: SolutionRecommendation;
  note: string;
}

export interface SolutionComplexity {
  time: string;
  space: string;
}

export interface Problem {
  id: number;
  level: number;
  levelTitle: string;
  title: string;
  topic: ProblemTopic;
  difficulty: Difficulty;
  concepts: string[];
  keywords: string[];
  description: string;
  contract?: ProblemContract;
  examples: Example[];
  testCases: TestCase[];
  hints: Hint[];
  expectedApproaches: Approach[];
  solution?: string;
  solutions?: Partial<Record<SolutionLanguage, SolutionVariant[]>>;
  explanation?: string;
  commonMistakes?: string[];
  followUpQuestions?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  targetTimeMinutes: number;
  learningFlow?: string[];
}

export const keywordCatalog = {
  String: [
    'length', 'get', 'substring', 'contains', 'startsWith', 'endsWith', 'equals', 'toCharArray', 'StringBuilder', 'split', 'joinToString'
  ],
  List: ['add', 'get', 'set', 'remove', 'contains', 'size', 'indexOf', 'sorted', 'sort', 'reversed', 'distinct'],
  Set: ['add', 'contains', 'remove', 'size'],
  HashMap: ['put', 'get', 'containsKey', 'containsValue', 'remove', 'keys', 'values', 'entries', 'getOrPut'],
  'Kotlin Collections': ['map', 'filter', 'forEach', 'find', 'first', 'firstOrNull', 'any', 'all', 'none', 'count', 'distinct', 'sorted', 'sortedBy', 'sortedDescending', 'groupBy', 'associateBy'],
  Patterns: ['Two Pointers', 'Sliding Window', 'HashMap', 'HashSet', 'Sorting', 'Binary Search', 'Stack', 'Queue', 'Recursion', 'Prefix Sum'],
};

export const levelMeta = [
  { level: 1, title: 'Basic String Operations', questions: 15 },
  { level: 2, title: 'Arrays & Lists', questions: 15 },
  { level: 3, title: 'HashMap / HashSet', questions: 18 },
  { level: 4, title: 'Sorting Problems', questions: 15 },
  { level: 5, title: 'Kotlin map, filter, distinct, groupBy', questions: 15 },
  { level: 6, title: 'Common Interview Problems', questions: 20 },
  { level: 7, title: 'Interview Combination Problems', questions: 22 },
];

const roadmapQuestionCatalog: Array<{
  id: number;
  level: number;
  levelTitle: string;
  title: string;
  topic: ProblemTopic;
  difficulty: Difficulty;
  concepts: string[];
  keywords: string[];
  description: string;
}> = [
  { id: 1, level: 1, levelTitle: 'Basic String Operations', title: 'Reverse a String', topic: 'String', difficulty: 'Easy', concepts: ['reversed()', 'loop'], keywords: ['length', 'get', 'StringBuilder'], description: 'Given a string, reverse it and return the result.' },
  { id: 2, level: 1, levelTitle: 'Basic String Operations', title: 'Check if String is Palindrome', topic: 'String', difficulty: 'Easy', concepts: ['indexing', 'reversed()'], keywords: ['startsWith', 'endsWith', 'substring'], description: 'Determine whether a string reads the same forward and backward.' },
  { id: 3, level: 1, levelTitle: 'Basic String Operations', title: 'Count vowels in a String', topic: 'String', difficulty: 'Easy', concepts: ['contains', 'loop'], keywords: ['contains', 'toCharArray'], description: 'Count the number of vowels in a string.' },
  { id: 4, level: 1, levelTitle: 'Basic String Operations', title: 'Count each character in a String', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap', 'get', 'put'], keywords: ['HashMap', 'get', 'put'], description: 'Count each character present in the string.' },
  { id: 5, level: 1, levelTitle: 'Basic String Operations', title: 'Find duplicate characters', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap', 'containsKey'], keywords: ['HashMap', 'containsKey'], description: 'Return the duplicate characters found in a string.' },
  { id: 6, level: 1, levelTitle: 'Basic String Operations', title: 'Find first non-repeating character', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap', 'get'], keywords: ['HashMap', 'get', 'keys'], description: 'Return the first character that does not repeat.' },
  { id: 7, level: 1, levelTitle: 'Basic String Operations', title: 'Find first repeating character', topic: 'HashSet', difficulty: 'Easy', concepts: ['HashSet', 'contains'], keywords: ['HashSet', 'contains'], description: 'Identify the first character that repeats.' },
  { id: 8, level: 1, levelTitle: 'Basic String Operations', title: 'Remove duplicate characters', topic: 'HashSet', difficulty: 'Easy', concepts: ['HashSet', 'StringBuilder'], keywords: ['HashSet', 'StringBuilder'], description: 'Remove duplicates while preserving the order of first appearance.' },
  { id: 9, level: 1, levelTitle: 'Basic String Operations', title: 'Count words in a sentence', topic: 'String', difficulty: 'Easy', concepts: ['split', 'size'], keywords: ['split', 'size'], description: 'Count the words in a sentence separated by spaces.' },
  { id: 10, level: 1, levelTitle: 'Basic String Operations', title: 'Reverse each word in a sentence', topic: 'String', difficulty: 'Medium', concepts: ['split', 'joinToString'], keywords: ['split', 'joinToString'], description: 'Reverse every word in a sentence while preserving the order of words.' },
  { id: 11, level: 1, levelTitle: 'Basic String Operations', title: 'Find the longest word', topic: 'String', difficulty: 'Easy', concepts: ['loop', 'length'], keywords: ['length', 'split'], description: 'Return the longest word among a list of words.' },
  { id: 12, level: 1, levelTitle: 'Basic String Operations', title: 'Find the shortest word', topic: 'String', difficulty: 'Easy', concepts: ['loop', 'length'], keywords: ['length', 'split'], description: 'Return the shortest word among a list of words.' },
  { id: 13, level: 1, levelTitle: 'Basic String Operations', title: 'Check whether two strings are equal', topic: 'String', difficulty: 'Easy', concepts: ['equals'], keywords: ['equals'], description: 'Compare if two strings are exactly equal.' },
  { id: 14, level: 1, levelTitle: 'Basic String Operations', title: 'Check whether one string contains another', topic: 'String', difficulty: 'Easy', concepts: ['contains'], keywords: ['contains'], description: 'Check whether a target string appears in a source string.' },
  { id: 15, level: 1, levelTitle: 'Basic String Operations', title: 'Count occurrences of a substring', topic: 'String', difficulty: 'Medium', concepts: ['contains', 'indexing'], keywords: ['contains', 'substring'], description: 'Count how many times a substring appears in a larger string.' },
  { id: 16, level: 2, levelTitle: 'Arrays & Lists', title: 'Find largest number', topic: 'Array', difficulty: 'Easy', concepts: ['max', 'loop'], keywords: ['max', 'maxOf'], description: 'Find the largest number present in an array.' },
  { id: 17, level: 2, levelTitle: 'Arrays & Lists', title: 'Find smallest number', topic: 'Array', difficulty: 'Easy', concepts: ['min', 'loop'], keywords: ['min', 'minOf'], description: 'Find the smallest number in an array.' },
  { id: 18, level: 2, levelTitle: 'Arrays & Lists', title: 'Find second largest number', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorting', 'variables'], keywords: ['sort', 'sorted'], description: 'Find the second largest value in a numeric array.' },
  { id: 19, level: 2, levelTitle: 'Arrays & Lists', title: 'Find second smallest number', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorting'], keywords: ['sort', 'sorted'], description: 'Find the second smallest value in an array.' },
  { id: 20, level: 2, levelTitle: 'Arrays & Lists', title: 'Reverse an array', topic: 'Array', difficulty: 'Easy', concepts: ['indexing'], keywords: ['reversed', 'indices'], description: 'Reverse the order of elements in an array.' },
  { id: 21, level: 2, levelTitle: 'Arrays & Lists', title: 'Sort an array', topic: 'Sorting', difficulty: 'Easy', concepts: ['sort', 'sorted'], keywords: ['sort', 'sorted'], description: 'Arrange the elements in ascending order.' },
  { id: 22, level: 2, levelTitle: 'Arrays & Lists', title: 'Remove duplicates from array', topic: 'List', difficulty: 'Easy', concepts: ['Set', 'distinct'], keywords: ['distinct', 'HashSet'], description: 'Remove duplicate values from a list or array.' },
  { id: 23, level: 2, levelTitle: 'Arrays & Lists', title: 'Find duplicate numbers', topic: 'HashSet', difficulty: 'Easy', concepts: ['Set', 'contains'], keywords: ['HashSet', 'contains'], description: 'Find repeated values in an array.' },
  { id: 24, level: 2, levelTitle: 'Arrays & Lists', title: 'Find missing number from 1 to N', topic: 'Array', difficulty: 'Medium', concepts: ['loop', 'sum'], keywords: ['sum', 'forEach'], description: 'Determine the missing value in a consecutive range.' },
  { id: 25, level: 2, levelTitle: 'Arrays & Lists', title: 'Find common elements in two arrays', topic: 'HashSet', difficulty: 'Easy', concepts: ['contains', 'Set'], keywords: ['HashSet', 'contains'], description: 'Return the common values across two arrays.' },
  { id: 26, level: 2, levelTitle: 'Arrays & Lists', title: 'Find intersection of two arrays', topic: 'HashSet', difficulty: 'Easy', concepts: ['Set'], keywords: ['HashSet', 'contains'], description: 'Return the intersection of two arrays.' },
  { id: 27, level: 2, levelTitle: 'Arrays & Lists', title: 'Find union of two arrays', topic: 'HashSet', difficulty: 'Easy', concepts: ['Set'], keywords: ['HashSet'], description: 'Return the union of two arrays without duplicates.' },
  { id: 28, level: 2, levelTitle: 'Arrays & Lists', title: 'Find frequency of each number', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap'], keywords: ['HashMap', 'put', 'get'], description: 'Count how often each number appears in the array.' },
  { id: 29, level: 2, levelTitle: 'Arrays & Lists', title: 'Move all zeros to the end', topic: 'Array', difficulty: 'Medium', concepts: ['array manipulation'], keywords: ['filter', 'indexing'], description: 'Move all zero elements to the end while preserving order.' },
  { id: 30, level: 2, levelTitle: 'Arrays & Lists', title: 'Move all negative numbers to beginning', topic: 'Two Pointers', difficulty: 'Medium', concepts: ['two pointers'], keywords: ['swap', 'indexing'], description: 'Place all negative numbers before positives in a single pass.' },
  { id: 31, level: 2, levelTitle: 'Arrays & Lists', title: 'Find pairs whose sum equals target', topic: 'HashMap', difficulty: 'Medium', concepts: ['Set', 'HashMap'], keywords: ['HashMap', 'containsKey'], description: 'Find pairs of numbers that match a given sum.' },
  { id: 32, level: 2, levelTitle: 'Arrays & Lists', title: 'Find maximum and minimum in one pass', topic: 'Array', difficulty: 'Easy', concepts: ['loop'], keywords: ['maxOf', 'minOf'], description: 'Find the maximum and minimum in a single traversal.' },
  { id: 33, level: 2, levelTitle: 'Arrays & Lists', title: 'Find top 3 largest numbers', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorting'], keywords: ['sort', 'sorted'], description: 'Return the three largest numbers from the array.' },
  { id: 34, level: 2, levelTitle: 'Arrays & Lists', title: 'Find elements greater than X', topic: 'List', difficulty: 'Easy', concepts: ['filtering'], keywords: ['filter'], description: 'Get all values greater than a threshold X.' },
  { id: 35, level: 2, levelTitle: 'Arrays & Lists', title: 'Find sum of even numbers', topic: 'Array', difficulty: 'Easy', concepts: ['%', 'filter'], keywords: ['filter', 'sum'], description: 'Compute the total of all even numbers in the list.' },
  { id: 36, level: 3, levelTitle: 'HashMap / HashSet', title: 'Count character frequency', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap'], keywords: ['HashMap', 'put', 'get'], description: 'Count the frequency of each character.' },
  { id: 37, level: 3, levelTitle: 'HashMap / HashSet', title: 'Count word frequency', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap'], keywords: ['HashMap', 'split'], description: 'Count how many times each word appears in a sentence.' },
  { id: 38, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find duplicate characters', topic: 'HashMap', difficulty: 'Easy', concepts: ['containsKey'], keywords: ['HashMap', 'containsKey'], description: 'Find characters that appear more than once.' },
  { id: 39, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find duplicate numbers', topic: 'HashSet', difficulty: 'Easy', concepts: ['HashSet.contains'], keywords: ['HashSet', 'contains'], description: 'Locate numbers that appear more than once.' },
  { id: 40, level: 3, levelTitle: 'HashMap / HashSet', title: 'First non-repeating character', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap'], keywords: ['HashMap', 'get'], description: 'Return the first character with count 1.' },
  { id: 41, level: 3, levelTitle: 'HashMap / HashSet', title: 'First repeating character', topic: 'HashSet', difficulty: 'Easy', concepts: ['HashSet'], keywords: ['HashSet', 'contains'], description: 'Find the first repeated character.' },
  { id: 42, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find most frequent character', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap'], keywords: ['HashMap', 'entries'], description: 'Return the character appearing most often.' },
  { id: 43, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find most frequent number', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap'], keywords: ['HashMap', 'entries'], description: 'Return the value that appears most often.' },
  { id: 44, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find character with maximum frequency', topic: 'HashMap', difficulty: 'Medium', concepts: ['entries'], keywords: ['entries', 'maxByOrNull'], description: 'Return the character with the highest count.' },
  { id: 45, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find numbers occurring more than once', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap'], keywords: ['HashMap', 'containsKey'], description: 'List values that appear more than once.' },
  { id: 46, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find common elements between arrays', topic: 'HashSet', difficulty: 'Medium', concepts: ['HashSet'], keywords: ['HashSet', 'contains'], description: 'Return elements shared between two arrays.' },
  { id: 47, level: 3, levelTitle: 'HashMap / HashSet', title: 'Check if array contains duplicates', topic: 'HashSet', difficulty: 'Easy', concepts: ['HashSet'], keywords: ['HashSet', 'contains'], description: 'Check whether an array has repeated values.' },
  { id: 48, level: 3, levelTitle: 'HashMap / HashSet', title: 'Check if two arrays contain same elements', topic: 'HashSet', difficulty: 'Easy', concepts: ['Set'], keywords: ['HashSet'], description: 'Determine whether two arrays contain identical elements.' },
  { id: 49, level: 3, levelTitle: 'HashMap / HashSet', title: 'Two Sum', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap', 'complement lookup'], keywords: ['HashMap', 'get'], description: 'Find indices of two numbers that add up to the target value.' },
  { id: 50, level: 3, levelTitle: 'HashMap / HashSet', title: 'Group words by first character', topic: 'HashMap', difficulty: 'Medium', concepts: ['grouping'], keywords: ['groupBy', 'associateBy'], description: 'Group words by their first letter.' },
  { id: 51, level: 3, levelTitle: 'HashMap / HashSet', title: 'Group numbers by even/odd', topic: 'HashMap', difficulty: 'Easy', concepts: ['partition', 'HashMap'], keywords: ['groupBy'], description: 'Group numbers into even and odd buckets.' },
  { id: 52, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find missing character', topic: 'HashSet', difficulty: 'Easy', concepts: ['HashSet'], keywords: ['HashSet', 'contains'], description: 'Identify the missing character from a set of expected values.' },
  { id: 53, level: 3, levelTitle: 'HashMap / HashSet', title: 'Find numbers appearing exactly once', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap'], keywords: ['HashMap'], description: 'Find values whose count is exactly one.' },
  { id: 54, level: 4, levelTitle: 'Sorting Problems', title: 'Sort numbers ascending', topic: 'Sorting', difficulty: 'Easy', concepts: ['sort'], keywords: ['sorted', 'sort'], description: 'Sort a numeric list in ascending order.' },
  { id: 55, level: 4, levelTitle: 'Sorting Problems', title: 'Sort numbers descending', topic: 'Sorting', difficulty: 'Easy', concepts: ['sort'], keywords: ['sortedDescending'], description: 'Sort a numeric list in descending order.' },
  { id: 56, level: 4, levelTitle: 'Sorting Problems', title: 'Sort strings alphabetically', topic: 'Sorting', difficulty: 'Easy', concepts: ['sorted'], keywords: ['sorted'], description: 'Arrange strings in alphabetical order.' },
  { id: 57, level: 4, levelTitle: 'Sorting Problems', title: 'Sort strings by length', topic: 'Sorting', difficulty: 'Medium', concepts: ['sortedBy'], keywords: ['sortedBy'], description: 'Sort strings by length and then by content as needed.' },
  { id: 58, level: 4, levelTitle: 'Sorting Problems', title: 'Sort numbers by absolute value', topic: 'Sorting', difficulty: 'Medium', concepts: ['abs', 'sortedBy'], keywords: ['sortedBy'], description: 'Order numbers by absolute value from smallest to largest.' },
  { id: 59, level: 4, levelTitle: 'Sorting Problems', title: 'Find second largest using sorting', topic: 'Sorting', difficulty: 'Easy', concepts: ['sorting'], keywords: ['sorted'], description: 'Find the second largest value using a sorted view.' },
  { id: 60, level: 4, levelTitle: 'Sorting Problems', title: 'Find kth largest element', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorting'], keywords: ['sorted'], description: 'Return the k-th largest element from a collection.' },
  { id: 61, level: 4, levelTitle: 'Sorting Problems', title: 'Sort characters in a String', topic: 'Sorting', difficulty: 'Easy', concepts: ['toCharArray', 'sorted'], keywords: ['toCharArray', 'sorted'], description: 'Sort the characters inside a string.' },
  { id: 62, level: 4, levelTitle: 'Sorting Problems', title: 'Check if two strings are anagrams', topic: 'Sorting', difficulty: 'Easy', concepts: ['sorting', 'HashMap'], keywords: ['sorted', 'HashMap'], description: 'Determine if two strings have the same letters in a different order.' },
  { id: 63, level: 4, levelTitle: 'Sorting Problems', title: 'Group anagrams', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap', 'sorting'], keywords: ['groupBy', 'sorted'], description: 'Group all anagrams together in a map.' },
  { id: 64, level: 4, levelTitle: 'Sorting Problems', title: 'Sort words by frequency', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap', 'sorting'], keywords: ['groupBy', 'sortedBy'], description: 'Sort words by how frequently they occur.' },
  { id: 65, level: 4, levelTitle: 'Sorting Problems', title: 'Sort array of 0s, 1s and 2s', topic: 'Sorting', difficulty: 'Medium', concepts: ['counting sort'], keywords: ['sort', 'partition'], description: 'Arrange values into the order 0, 1, 2.' },
  { id: 66, level: 4, levelTitle: 'Sorting Problems', title: 'Merge two sorted arrays', topic: 'Sorting', difficulty: 'Medium', concepts: ['merge'], keywords: ['sorted', 'merge'], description: 'Combine two sorted arrays into one sorted array.' },
  { id: 67, level: 4, levelTitle: 'Sorting Problems', title: 'Find common elements after sorting', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorted', 'Set'], keywords: ['sorted', 'HashSet'], description: 'Find items common to two sorted collections.' },
  { id: 68, level: 4, levelTitle: 'Sorting Problems', title: 'Find closest number to target', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorting'], keywords: ['sorted'], description: 'Find the value closest to the given target.' },
  { id: 69, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Double every number', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['map'], keywords: ['map'], description: 'Double each value in a list of numbers.' },
  { id: 70, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Convert strings to uppercase', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['map'], keywords: ['map', 'uppercase'], description: 'Convert every string in a list to uppercase.' },
  { id: 71, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Convert names to their lengths', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['map'], keywords: ['map', 'length'], description: 'Transform each name into its string length.' },
  { id: 72, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Square every number', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['map'], keywords: ['map'], description: 'Square every number in a list.' },
  { id: 73, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Extract first character of every word', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['map'], keywords: ['map', 'first'], description: 'Take the first letter from each word in a list.' },
  { id: 74, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find all even numbers', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['filter'], keywords: ['filter'], description: 'Return only the even numbers from a list.' },
  { id: 75, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find all odd numbers', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['filter'], keywords: ['filter'], description: 'Return only the odd numbers from a list.' },
  { id: 76, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find numbers greater than 10', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['filter'], keywords: ['filter'], description: 'Filter every element greater than 10.' },
  { id: 77, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find strings longer than 5', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['filter'], keywords: ['filter', 'length'], description: 'Keep only strings whose length is greater than 5.' },
  { id: 78, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find names starting with "A"', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['filter', 'startsWith'], keywords: ['filter', 'startsWith'], description: 'Select names beginning with A.' },
  { id: 79, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find positive numbers', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['filter'], keywords: ['filter'], description: 'Return all positive values from a list.' },
  { id: 80, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find numbers divisible by 3', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['filter'], keywords: ['filter'], description: 'Return numbers divisible by 3.' },
  { id: 81, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Remove duplicate numbers', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['distinct'], keywords: ['distinct'], description: 'Remove duplicates from a list of numbers.' },
  { id: 82, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Remove duplicate strings', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['distinct'], keywords: ['distinct'], description: 'Remove repeated strings while preserving order.' },
  { id: 83, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find unique characters', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['distinct'], keywords: ['distinct'], description: 'Get the set of unique characters from a string.' },
  { id: 84, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Find unique words', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['distinct'], keywords: ['distinct', 'split'], description: 'Return only the unique words from a sentence.' },
  { id: 85, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Group words by first character', topic: 'Kotlin Collections', difficulty: 'Medium', concepts: ['groupBy'], keywords: ['groupBy'], description: 'Group words according to their first letter.' },
  { id: 86, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Group numbers by even/odd', topic: 'Kotlin Collections', difficulty: 'Easy', concepts: ['groupBy'], keywords: ['groupBy'], description: 'Group numeric values into even and odd buckets.' },
  { id: 87, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Group strings by length', topic: 'Kotlin Collections', difficulty: 'Medium', concepts: ['groupBy'], keywords: ['groupBy'], description: 'Group words by their string length.' },
  { id: 88, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Group employees by department', topic: 'Kotlin Collections', difficulty: 'Medium', concepts: ['groupBy'], keywords: ['groupBy'], description: 'Group employee records by their department.' },
  { id: 89, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Group words by sorted characters', topic: 'Kotlin Collections', difficulty: 'Medium', concepts: ['groupBy', 'sorted'], keywords: ['groupBy', 'sorted'], description: 'Cluster words by their sorted character signature.' },
  { id: 90, level: 5, levelTitle: 'Kotlin map, filter, distinct, groupBy', title: 'Group anagrams', topic: 'Kotlin Collections', difficulty: 'Medium', concepts: ['groupBy', 'sorted'], keywords: ['groupBy', 'sorted'], description: 'Group together strings that are anagrams of each other.' },
  { id: 91, level: 6, levelTitle: 'Common Interview Problems', title: 'Two Sum', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap', 'complement lookup'], keywords: ['HashMap', 'get'], description: 'Solve the classic pair-sum problem with a map.' },
  { id: 92, level: 6, levelTitle: 'Common Interview Problems', title: 'Valid Anagram', topic: 'String', difficulty: 'Easy', concepts: ['sorting', 'frequency'], keywords: ['sorted', 'HashMap'], description: 'Check whether one string is a rearrangement of another.' },
  { id: 93, level: 6, levelTitle: 'Common Interview Problems', title: 'Group Anagrams', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap', 'sorting'], keywords: ['groupBy', 'sorted'], description: 'Group together anagrams from a list of words.' },
  { id: 94, level: 6, levelTitle: 'Common Interview Problems', title: 'First Unique Character', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap'], keywords: ['HashMap', 'get'], description: 'Find the first character that appears only once.' },
  { id: 95, level: 6, levelTitle: 'Common Interview Problems', title: 'Contains Duplicate', topic: 'HashSet', difficulty: 'Easy', concepts: ['HashSet'], keywords: ['HashSet', 'contains'], description: 'Check if a collection contains repeated values.' },
  { id: 96, level: 6, levelTitle: 'Common Interview Problems', title: 'Intersection of Two Arrays', topic: 'HashSet', difficulty: 'Easy', concepts: ['Set'], keywords: ['HashSet', 'contains'], description: 'Return common elements from two arrays.' },
  { id: 97, level: 6, levelTitle: 'Common Interview Problems', title: 'Top K Frequent Elements', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap', 'sorting'], keywords: ['HashMap', 'sortedBy'], description: 'Return the k most frequent values in a collection.' },
  { id: 98, level: 6, levelTitle: 'Common Interview Problems', title: 'Majority Element', topic: 'HashMap', difficulty: 'Easy', concepts: ['HashMap'], keywords: ['HashMap', 'entries'], description: 'Find the element appearing more than half the time.' },
  { id: 99, level: 6, levelTitle: 'Common Interview Problems', title: 'Longest Consecutive Sequence', topic: 'HashSet', difficulty: 'Medium', concepts: ['HashSet'], keywords: ['HashSet'], description: 'Find the length of the longest consecutive run.' },
  { id: 100, level: 6, levelTitle: 'Common Interview Problems', title: 'Valid Parentheses', topic: 'Stack', difficulty: 'Easy', concepts: ['Stack'], keywords: ['Stack', 'push', 'pop'], description: 'Check whether parentheses are balanced.' },
  { id: 101, level: 6, levelTitle: 'Common Interview Problems', title: 'Reverse Linked List', topic: 'LinkedList', difficulty: 'Medium', concepts: ['LinkedList'], keywords: ['next', 'prev'], description: 'Reverse the order of nodes in a singly linked list.' },
  { id: 102, level: 6, levelTitle: 'Common Interview Problems', title: 'Merge Two Sorted Lists', topic: 'LinkedList', difficulty: 'Medium', concepts: ['LinkedList'], keywords: ['sorted', 'merge'], description: 'Merge two sorted linked lists into one sorted list.' },
  { id: 103, level: 6, levelTitle: 'Common Interview Problems', title: 'Best Time to Buy/Sell Stock', topic: 'Array', difficulty: 'Easy', concepts: ['track profit'], keywords: ['minOf', 'maxOf'], description: 'Find the maximum profit from a single stock transaction.' },
  { id: 104, level: 6, levelTitle: 'Common Interview Problems', title: 'Maximum Subarray', topic: 'Array', difficulty: 'Medium', concepts: ['Kadane'], keywords: ['maxOf'], description: 'Find the contiguous subarray with the largest sum.' },
  { id: 105, level: 6, levelTitle: 'Common Interview Problems', title: 'Binary Search', topic: 'Binary Search', difficulty: 'Easy', concepts: ['sorted array'], keywords: ['binarySearch'], description: 'Search for a target value in a sorted array.' },
  { id: 106, level: 7, levelTitle: 'Interview Combination Problems', title: 'Longest Substring Without Repeating Characters', topic: 'Sliding Window', difficulty: 'Medium', concepts: ['HashSet', 'sliding window'], keywords: ['HashSet', 'Sliding Window'], description: 'Return the length of the longest substring without repeats.' },
  { id: 107, level: 7, levelTitle: 'Interview Combination Problems', title: 'Longest Substring With At Most K Distinct Characters', topic: 'Sliding Window', difficulty: 'Medium', concepts: ['HashMap', 'sliding window'], keywords: ['HashMap', 'Sliding Window'], description: 'Find the largest substring with at most k distinct characters.' },
  { id: 108, level: 7, levelTitle: 'Interview Combination Problems', title: '3Sum', topic: 'Two Pointers', difficulty: 'Medium', concepts: ['sorting', 'two pointers'], keywords: ['sorted', 'two pointers'], description: 'Find triplets that sum to zero.' },
  { id: 109, level: 7, levelTitle: 'Interview Combination Problems', title: 'Product of Array Except Self', topic: 'Array', difficulty: 'Medium', concepts: ['prefix sum'], keywords: ['prefix'], description: 'Return the product of all elements except the current one.' },
  { id: 110, level: 7, levelTitle: 'Interview Combination Problems', title: 'Merge Intervals', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorting'], keywords: ['sorted', 'intervals'], description: 'Merge overlapping intervals into one concise list.' },
  { id: 111, level: 7, levelTitle: 'Interview Combination Problems', title: 'Find All Anagrams in a String', topic: 'Sliding Window', difficulty: 'Medium', concepts: ['HashMap', 'sliding window'], keywords: ['HashMap', 'Sliding Window'], description: 'Find all starting indices of anagrams in a text string.' },
  { id: 112, level: 7, levelTitle: 'Interview Combination Problems', title: 'Minimum Window Substring', topic: 'Sliding Window', difficulty: 'Hard', concepts: ['HashMap', 'sliding window'], keywords: ['HashMap', 'Sliding Window'], description: 'Find the smallest window containing all target characters.' },
  { id: 113, level: 7, levelTitle: 'Interview Combination Problems', title: 'Subarray Sum Equals K', topic: 'Prefix Sum', difficulty: 'Medium', concepts: ['HashMap', 'prefix sum'], keywords: ['HashMap', 'prefix sum'], description: 'Find the number of subarrays with sum equal to k.' },
  { id: 114, level: 7, levelTitle: 'Interview Combination Problems', title: 'Longest Consecutive Sequence', topic: 'HashSet', difficulty: 'Medium', concepts: ['HashSet'], keywords: ['HashSet', 'set'], description: 'Find the length of the longest consecutive sequence.' },
  { id: 115, level: 7, levelTitle: 'Interview Combination Problems', title: 'Top K Frequent Words', topic: 'HashMap', difficulty: 'Medium', concepts: ['HashMap', 'sorting'], keywords: ['HashMap', 'sortedBy'], description: 'Return the k most frequent words in a sentence.' },
  { id: 116, level: 7, levelTitle: 'Interview Combination Problems', title: 'Kth Largest Element', topic: 'Sorting', difficulty: 'Medium', concepts: ['sorting'], keywords: ['sorted', 'heap'], description: 'Find the k-th largest element in a list.' },
  { id: 117, level: 7, levelTitle: 'Interview Combination Problems', title: 'Binary Tree Traversal', topic: 'Tree', difficulty: 'Medium', concepts: ['recursion', 'queue'], keywords: ['Tree', 'queue'], description: 'Traverse a binary tree using depth-first or breadth-first order.' },
  { id: 118, level: 7, levelTitle: 'Interview Combination Problems', title: 'BFS', topic: 'Graph', difficulty: 'Medium', concepts: ['Queue'], keywords: ['Queue', 'Graph'], description: 'Traverse a graph using breadth-first search.' },
  { id: 119, level: 7, levelTitle: 'Interview Combination Problems', title: 'DFS', topic: 'Graph', difficulty: 'Medium', concepts: ['Recursion', 'stack'], keywords: ['Graph', 'stack'], description: 'Traverse a graph using depth-first search.' },
  { id: 120, level: 7, levelTitle: 'Interview Combination Problems', title: 'Number of Islands', topic: 'Graph', difficulty: 'Medium', concepts: ['DFS', 'BFS'], keywords: ['Graph', 'Queue'], description: 'Count the connected land regions in a grid.' },
];

const toMethodName = (value: string): string => {
  const cleaned = value
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part, index) => index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  return cleaned || 'solve';
};

const getProblemContract = (problem: Pick<Problem, 'title' | 'topic' | 'description'>): ProblemContract => {
  const title = problem.title.toLowerCase();

  if (title.includes('check if') || title.includes('check whether') || title.includes('valid ') || title.includes('is palindrome') || title.includes('anagram')) {
    const input = title.includes('array') || title.includes('numbers') || title.includes('elements') ? 'List<Int>' : 'String';
    return { family: 'boolean', input, output: 'Boolean' };
  }

  if (title.includes('remove duplicate characters')) {
    return { family: 'string', input: 'String', output: 'String', preservesOrder: true };
  }

  if (title.includes('duplicate characters') || title.includes('unique characters') || title.includes('characters occurring')) {
    return { family: 'character-list', input: 'String', output: 'List<Char>', preservesOrder: true };
  }

  if (title.includes('repeating character') || title.includes('non-repeating character') || title.includes('first unique character')) {
    return { family: 'character-list', input: 'String', output: 'Char', preservesOrder: true };
  }

  if (title.includes('count each character') || title.includes('character frequency') || title.includes('count character')) {
    return { family: 'character-frequency', input: 'String', output: 'Map<Char, Int>' };
  }

  if (problem.topic === 'LinkedList') {
    return { family: 'linked-list', input: 'List<Int>', output: 'List<Int>' };
  }

  if (problem.topic === 'Tree') {
    return { family: 'tree', input: 'Tree<Int>', output: 'List<Int>' };
  }

  if (problem.topic === 'Graph') {
    return { family: 'graph', input: 'Graph', output: 'List<String>' };
  }

  if (problem.topic === 'Sliding Window') {
    return { family: 'sliding-window', input: 'String', output: 'Int' };
  }

  if (problem.topic === 'Binary Search') {
    return { family: 'binary-search', input: 'List<Int>', output: 'Int' };
  }

  if (['Two Pointers', 'Prefix Sum', 'Stack', 'Queue', 'Recursion'].includes(problem.topic)) {
    return { family: 'advanced-list', input: 'List<Int>', output: 'List<Int>' };
  }

  if (title.includes('string') || problem.topic === 'String') {
    return { family: 'string', input: 'String', output: 'String' };
  }

  if (problem.topic === 'HashMap' || problem.topic === 'HashSet') {
    return { family: 'map', input: 'List<Int>', output: 'Map<Int, Int>' };
  }

  if (problem.topic === 'Array' || problem.topic === 'List' || problem.topic === 'Sorting' || problem.topic === 'Kotlin Collections') {
    return { family: 'numeric-list', input: 'List<Int>', output: 'List<Int>' };
  }

  return { family: 'unknown', input: 'Any', output: 'Any' };
};

const formatSolutionCode = (code: string): string => {
  const trimmed = (code ?? '').trim();

  const kotlinExpression = trimmed.match(/^(\s*fun\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*(?::\s*[^=\n]+)?\s*=\s*)(.+)$/s);
  if (kotlinExpression) {
    const signature = kotlinExpression[1].trim().replace(/\s*=\s*$/, '');
    return `${signature} {\n    return ${kotlinExpression[2].trim()}\n}`;
  }

  if (!trimmed || trimmed.length < 180) {
    return trimmed;
  }

  const singleLineBlock = trimmed.match(/^(\s*(?:fun|public|private|protected)\b.*?\{)(\s*.*?)(\s*\})$/s);
  if (singleLineBlock) {
    const [, opening, body, closing] = singleLineBlock;
    const normalizedBody = body.trim();
    return `${opening}\n    ${normalizedBody}\n${closing}`;
  }

  return trimmed;
};

export const validateGeneratedSolutionCode = (code: string, language: SolutionLanguage): void => {
  const normalized = code.trim();
  const structural = normalized.replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g, '');
  const braces = (structural.match(/[{}]/g) ?? []).length;
  const parentheses = (structural.match(/[()]/g) ?? []).length;

  if (!normalized || braces % 2 !== 0 || parentheses % 2 !== 0) {
    throw new Error(`Invalid ${language} solution structure`);
  }

  if (/(?:^|\n)\s*val\s+[A-Za-z_][A-Za-z0-9_]*\s*\{/.test(normalized)) {
    const malformed = normalized.match(/\bval\s+[A-Za-z_][A-Za-z0-9_]*\s*\{/s)?.[0] ?? 'unknown';
    throw new Error(`Malformed Kotlin variable declaration: ${malformed}`);
  }

  if (language === 'kotlin' && /\bpublic\s+static\b|\bnew\s+[A-Z]|\bCollectors\b|;/.test(normalized)) {
    const javaSyntax = normalized.match(/\bpublic\s+static\b|\bnew\s+[A-Z]|\bCollectors\b|;/)?.[0] ?? 'unknown';
    throw new Error(`Java syntax found in Kotlin solution: ${javaSyntax}`);
  }

  if (language === 'java' && /\bfun\s+[A-Za-z_]|\bval\s+|\bvar\s+|mutable(?:List|Map|Set)Of|\bwhen\s*\(/.test(normalized)) {
    throw new Error('Kotlin syntax found in Java solution');
  }
};

const makeVariant = (label: string, code: string, recommendation: SolutionRecommendation, note: string): SolutionVariant => ({
  label,
  code: formatSolutionCode(code),
  recommendation: getProblemRecommendation(label, code),
  note: getVariantNote(label, code),
});

export const getProblemRecommendation = (label: string, code: string): SolutionRecommendation => {
  const normalized = (code ?? '').toLowerCase();
  const hasLoop = /\b(for|while)\s*\(|for\s*\([^)]*in[^)]*\)|for\s*\([^)]*;[^)]*;[^)]*\)/.test(code ?? '');
  const hasStream = /assequence\(|\.stream\(|parallelstream|flatmap|maptoobj|groupingby|collect\(|joinToString\(|runningfold\(|maxornull\(/.test(normalized);
  const isComplexStream = /(flatmap|parallelstream|groupingby.*collect|collect.*groupingby|runningfold|reduce\s*\()/.test(normalized);
  const isSimpleCollectionPipeline = /(filter\s*\(|map\s*\(|sorted\(|sortedby\(|distinct\(|groupby\()/i.test(normalized);

  if (isComplexStream) {
    return 'Avoid unless needed';
  }

  if (label === 'Stream API') {
    return hasStream ? 'Good to try' : 'Best';
  }

  if (label === 'Basic Solution') {
    return hasStream && !hasLoop ? 'Good to try' : 'Best';
  }

  if (label === 'Alternative' || label === 'Loop') {
    return hasLoop ? 'Good to try' : 'Best';
  }

  if (hasStream && !hasLoop) {
    return isSimpleCollectionPipeline ? 'Best' : 'Good to try';
  }

  return 'Good to try';
};

const getRecommendationForVariant = (label: string, code = ''): SolutionRecommendation => {
  return getProblemRecommendation(label, code);
};

export const getVariantNote = (label: string, code = ''): string => {
  const normalized = (code ?? '').toLowerCase();
  const hasLoop = /\b(for|while)\s*\(|for\s*\([^)]*in[^)]*\)|for\s*\([^)]*;[^)]*;[^)]*\)/.test(code ?? '');
  const hasStream = /assequence\(|\.stream\(|parallelstream|flatmap|maptoobj|groupingby|collect\(|joinToString\(|runningfold\(|maxornull\(/.test(normalized);
  const isComplexStream = /(flatmap|parallelstream|groupingby.*collect|collect.*groupingby|runningfold|reduce\s*\()/.test(normalized);

  switch (label) {
    case 'Basic Solution':
      if (hasStream && !hasLoop) {
        return 'Good to try: this is readable and compact, but the stream chain is usually less explicit than the cleaner loop-based explanation when the interviewer wants exact control.';
      }
      return 'Best: this is the cleanest and most direct version, and it is usually the strongest first answer in an interview.';
    case 'Alternative':
      if (hasLoop) {
        return 'Good to try: this is a valid backup and easy to explain, but the simplest direct solution usually reads better in an interview.';
      }
      return 'Best: this keeps the core idea simple and readable without overcomplicating the logic.';
    case 'Loop':
      if (hasLoop) {
        return 'Good to try: the explicit loop is easy to reason about, which makes it a strong backup when the interviewer wants to see every step.';
      }
      return 'Best: this is the clearest control-flow version and is a reliable fallback if the interviewer prefers explicit logic.';
    case 'Stream API':
      if (isComplexStream) {
        return 'Avoid unless needed: this flatMap/flatten style is clever but often harder to explain and reason about than a straightforward loop or direct collection approach.';
      }
      if (hasStream) {
        return 'Good to try: this is concise and elegant, but it is usually a second-choice answer unless the problem is clearly built for a collection pipeline.';
      }
      return 'Good to try: this version is compact and readable, although a simpler loop or direct implementation is often the stronger first answer.';
    default:
      return 'Use this when you want a readable backup option for the core idea.';
  }
};

const buildKotlinVariantSet = (problem: Problem): SolutionVariant[] => {
  const methodName = toMethodName(problem.title);
  const title = problem.title.toLowerCase();
  const contract = problem.contract ?? getProblemContract(problem);

  const buildVariants = (basicCode: string, alternativeCode: string, loopCode: string, streamCode: string): SolutionVariant[] => [
    makeVariant('Basic Solution', basicCode, getRecommendationForVariant('Basic Solution', basicCode), getVariantNote('Basic Solution', basicCode)),
    makeVariant('Alternative', alternativeCode, getRecommendationForVariant('Alternative', alternativeCode), getVariantNote('Alternative', alternativeCode)),
    makeVariant('Loop', loopCode, getRecommendationForVariant('Loop', loopCode), getVariantNote('Loop', loopCode)),
    makeVariant('Stream API', streamCode, getRecommendationForVariant('Stream API', streamCode), getVariantNote('Stream API', streamCode)),
  ];

  if ((title.includes('reverse a string') || title.includes('reverse each word') || title.includes('reverse the order')) && !title.includes('linked')) {
    return buildVariants(
      `fun ${methodName}(input: String): String = input.reversed()`,
      `fun ${methodName}(input: String): String {
    val charArray = input.toCharArray()
    val result = StringBuilder()
    for (i in charArray.size - 1 downTo 0) {
        result.append(charArray[i])
    }
    return result.toString()
}`,
      `fun ${methodName}(input: String): String {
    val chars = input.toCharArray()
    val reversed = CharArray(chars.size)
    for (i in chars.indices) {
        reversed[chars.size - 1 - i] = chars[i]
    }
    return String(reversed)
}`,
      `fun ${methodName}(input: String): String {
      return input.asSequence().toList().reversed().joinToString("")
    }`
    );
  }

  if (title.includes('palindrome')) { 
    return buildVariants(
      `fun ${methodName}(input: String): Boolean = input == input.reversed()`,
      `fun ${methodName}(input: String): Boolean {
    var left = 0
    var right = input.length - 1
    while (left < right) {
        if (input[left] != input[right]) return false
        left++
        right--
    }
    return true
}`,
      `fun ${methodName}(input: String): Boolean {
    val chars = input.toCharArray()
    for (i in chars.indices) {
        if (chars[i] != chars[chars.size - 1 - i]) return false
    }
    return true
}`,
      `fun ${methodName}(input: String): Boolean = input.filter { it.isLetterOrDigit() }.lowercase() == input.filter { it.isLetterOrDigit() }.lowercase().reversed()`
    );
  }

  if (title.includes('count vowels') || title.includes('vowel')) {
    return buildVariants(
      `fun ${methodName}(input: String): Int = input.count { it.lowercaseChar() in setOf('a', 'e', 'i', 'o', 'u') }`,
      `fun ${methodName}(input: String): Int {
    val vowels = setOf('a', 'e', 'i', 'o', 'u')
    return input.sumOf { if (it.lowercaseChar() in vowels) 1 else 0 }
}`,
      `fun ${methodName}(input: String): Int {
    var count = 0
    for (char in input) {
        if (char.lowercaseChar() in "aeiou") count++
    }
    return count
}`,
      `fun ${methodName}(input: String): Int = input.asSequence().count { it.lowercaseChar() in "aeiou" }`
    );
  }

  if (title.includes('count each character') || title.includes('character frequency') || title.includes('count character')) {
    return buildVariants(
      `fun ${methodName}(input: String): Map<Char, Int> = input.groupingBy { it }.eachCount()`,
      `fun ${methodName}(input: String): Map<Char, Int> {
    val counts = mutableMapOf<Char, Int>()
    for (char in input) {
        counts[char] = counts.getOrDefault(char, 0) + 1
    }
    return counts
}`,
      `fun ${methodName}(input: String): Map<Char, Int> {
    val counts = mutableMapOf<Char, Int>()
    for (char in input) {
        if (counts.containsKey(char)) {
            counts[char] = counts[char]!! + 1
        } else {
            counts[char] = 1
        }
    }
    return counts
}`,
      `fun ${methodName}(input: String): Map<Char, Int> = input.asSequence().groupingBy { it }.eachCount()`
    );
  }

  if (title.includes('duplicate characters') && !title.includes('remove')) {
    return buildVariants(
      `fun ${methodName}(input: String): List<Char> {
    val seen = mutableSetOf<Char>()
    val duplicates = mutableListOf<Char>()
    for (char in input) {
        if (!seen.add(char) && char !in duplicates) duplicates.add(char)
    }
    return duplicates
}`,
      `fun ${methodName}(input: String): List<Char> = input.groupingBy { it }.eachCount().filterValues { it > 1 }.keys.toList()`,
      `fun ${methodName}(input: String): List<Char> {
    val counts = mutableMapOf<Char, Int>()
    for (char in input) counts[char] = (counts[char] ?: 0) + 1
    return input.filter { counts[it]!! > 1 }.distinct()
}`,
      `fun ${methodName}(input: String): List<Char> = input.asSequence().groupingBy { it }.eachCount().filterValues { it > 1 }.keys.toList()`
    );
  }

  if (title.includes('remove duplicate characters')) {
    return buildVariants(
      `fun ${methodName}(input: String): String = input.toList().distinct().joinToString("")`,
      `fun ${methodName}(input: String): String {
    val seen = mutableSetOf<Char>()
    return input.filter { seen.add(it) }
}`,
      `fun ${methodName}(input: String): String {
    val result = StringBuilder()
    for (char in input) if (result.indexOf(char.toString()) < 0) result.append(char)
    return result.toString()
}`,
      `fun ${methodName}(input: String): String = input.asSequence().distinct().joinToString("")`
    );
  }

  if (title.includes('unique characters')) {
    return buildVariants(
      `fun ${methodName}(input: String): List<Char> = input.filter { char -> input.count { it == char } == 1 }.distinct()`,
      `fun ${methodName}(input: String): List<Char> {
    val counts = input.groupingBy { it }.eachCount()
    return input.filter { counts[it] == 1 }.distinct()
}`,
      `fun ${methodName}(input: String): List<Char> {
    val counts = mutableMapOf<Char, Int>()
    for (char in input) counts[char] = (counts[char] ?: 0) + 1
    return input.filter { counts[it] == 1 }.distinct()
}`,
      `fun ${methodName}(input: String): List<Char> = input.asSequence().filter { char -> input.count { it == char } == 1 }.distinct().toList()`
    );
  }

  if (title.includes('first repeating character')) {
    return buildVariants(
      `fun ${methodName}(input: String): Char = input.groupingBy { it }.eachCount().let { counts -> input.first { counts[it]!! > 1 } }`,
      `fun ${methodName}(input: String): Char {
    val seen = mutableSetOf<Char>()
    for (char in input) if (!seen.add(char)) return char
    return '\\u0000'
}`,
      `fun ${methodName}(input: String): Char {
    val seen = mutableSetOf<Char>()
    for (char in input) {
        if (char in seen) return char
        seen.add(char)
    }
    return '\\u0000'
}`,
      `fun ${methodName}(input: String): Char = input.asSequence().groupingBy { it }.eachCount().let { counts -> input.first { counts[it]!! > 1 } }`
    );
  }

  if (title.includes('first non-repeating character') || title.includes('first unique character')) {
    return buildVariants(
      `fun ${methodName}(input: String): Char = input.groupingBy { it }.eachCount().let { counts -> input.first { counts[it] == 1 } }`,
      `fun ${methodName}(input: String): Char {
    val counts = input.groupingBy { it }.eachCount()
    return input.firstOrNull { counts[it] == 1 } ?: '\\u0000'
}`,
      `fun ${methodName}(input: String): Char {
    val counts = mutableMapOf<Char, Int>()
    for (char in input) counts[char] = (counts[char] ?: 0) + 1
    for (char in input) if (counts[char] == 1) return char
    return '\\u0000'
}`,
      `fun ${methodName}(input: String): Char = input.asSequence().groupingBy { it }.eachCount().let { counts -> input.first { counts[it] == 1 } }`
    );
  }

  if (title.includes('two sum')) {
    return buildVariants(
      `fun ${methodName}(numbers: IntArray, target: Int): IntArray {
    val seen = mutableMapOf<Int, Int>()
    for ((index, value) in numbers.withIndex()) {
        val complement = target - value
        if (seen.containsKey(complement)) {
            return intArrayOf(seen[complement]!!, index)
        }
        seen[value] = index
    }
    return intArrayOf()
}`,
      `fun ${methodName}(numbers: IntArray, target: Int): IntArray {
    val seen = hashMapOf<Int, Int>()
    for (index in numbers.indices) {
        val needed = target - numbers[index]
        if (seen.containsKey(needed)) {
            return intArrayOf(seen[needed]!!, index)
        }
        seen[numbers[index]] = index
    }
    return intArrayOf()
}`,
      `fun ${methodName}(numbers: IntArray, target: Int): IntArray {
    val seen = mutableMapOf<Int, Int>()
    for (i in numbers.indices) {
        val wanted = target - numbers[i]
        for (j in i + 1 until numbers.size) {
            if (numbers[j] == wanted) return intArrayOf(i, j)
        }
        seen[numbers[i]] = i
    }
    return intArrayOf()
}`,
      `fun ${methodName}(numbers: IntArray, target: Int): IntArray =
    numbers.indices.asSequence()
        .mapNotNull { i ->
            val diff = target - numbers[i]
            val j = numbers.indices.firstOrNull { idx -> idx != i && numbers[idx] == diff }
            if (j != null) intArrayOf(i, j) else null
        }
        .firstOrNull() ?: intArrayOf()`
    );
  }

  if ((title.includes('largest number') || title.includes('find largest')) && !title.includes('second')) {
    return buildVariants(
      `fun ${methodName}(input: List<Int>): Int = input.maxOrNull() ?: Int.MIN_VALUE`,
      `fun ${methodName}(input: List<Int>): Int {
    var largest = input.firstOrNull() ?: Int.MIN_VALUE
    for (value in input.drop(1)) {
        if (value > largest) largest = value
    }
    return largest
}`,
      `fun ${methodName}(input: List<Int>): Int {
    var largest = Int.MIN_VALUE
    for (value in input) {
        if (value > largest) largest = value
    }
    return largest
}`,
      `fun ${methodName}(input: List<Int>): Int = input.asSequence().maxOrNull() ?: Int.MIN_VALUE`
    );
  }

  if (title.includes('second largest')) {
    return buildVariants(
      `fun ${methodName}(input: List<Int>): Int = input.sortedDescending().distinct()[1]`,
      `fun ${methodName}(input: List<Int>): Int {
    val distinct = input.distinct().sortedDescending()
    return if (distinct.size >= 2) distinct[1] else distinct.firstOrNull() ?: Int.MIN_VALUE
}`,
      `fun ${methodName}(input: List<Int>): Int {
    var largest = Int.MIN_VALUE
    var secondLargest = Int.MIN_VALUE
    for (value in input) {
        if (value > largest) {
            secondLargest = largest
            largest = value
        } else if (value > secondLargest && value != largest) {
            secondLargest = value
        }
    }
    return secondLargest
}`,
      `fun ${methodName}(input: List<Int>): Int = input.asSequence().sortedDescending().distinct().drop(1).firstOrNull() ?: Int.MIN_VALUE`
    );
  }

  if (title.includes('move all zeros')) {
    return buildVariants(
      `fun ${methodName}(input: List<Int>): List<Int> = input.filter { it != 0 } + input.filter { it == 0 }`,
      `fun ${methodName}(input: List<Int>): List<Int> {
    val result = input.toMutableList()
    var write = 0
    for (value in result) {
        if (value != 0) {
            result[write++] = value
        }
    }
    while (write < result.size) result[write++] = 0
    return result
}`,
      `fun ${methodName}(input: List<Int>): List<Int> {
    val result = input.toMutableList()
    val nonZero = mutableListOf<Int>()
    val zeros = mutableListOf<Int>()
    for (value in result) {
        if (value == 0) zeros.add(value) else nonZero.add(value)
    }
    return nonZero + zeros
}`,
      `fun ${methodName}(input: List<Int>): List<Int> = input.asSequence().filter { it != 0 }.toList() + input.asSequence().filter { it == 0 }.toList()`
    );
  }

  if (title.includes('move all negative')) {
    return buildVariants(
      `fun ${methodName}(input: List<Int>): List<Int> = input.filter { it < 0 } + input.filter { it >= 0 }`,
      `fun ${methodName}(input: List<Int>): List<Int> {
    val negatives = mutableListOf<Int>()
    val nonNegatives = mutableListOf<Int>()
    for (value in input) if (value < 0) negatives.add(value) else nonNegatives.add(value)
    return negatives + nonNegatives
}`,
      `fun ${methodName}(input: List<Int>): List<Int> {
    val result = input.toMutableList()
    result.sortWith(compareBy { if (it < 0) 0 else 1 })
    return result
}`,
      `fun ${methodName}(input: List<Int>): List<Int> = input.asSequence().partition { it < 0 }.let { it.first + it.second }`
    );
  }

  if (title.includes('valid parentheses')) {
    return buildVariants(
      `fun ${methodName}(input: String): Boolean {
    val stack = ArrayDeque<Char>()
    val pairs = mapOf(')' to '(', '}' to '{', ']' to '[')
    for (char in input) {
        if (char in "([{") stack.addLast(char)
        else if (pairs[char] != stack.removeLastOrNull()) return false
    }
    return stack.isEmpty()
}`,
      `fun ${methodName}(input: String): Boolean {
    val stack = mutableListOf<Char>()
    val pairs = mapOf(')' to '(', '}' to '{', ']' to '[')
    for (char in input) {
        if (char in "([{" ) stack.add(char)
        else if (pairs[char] == stack.lastOrNull()) stack.removeAt(stack.lastIndex)
        else return false
    }
    return stack.isEmpty()
}`,
      `fun ${methodName}(input: String): Boolean {
    val stack = ArrayDeque<Char>()
    for (char in input) {
        when (char) {
            '(' -> stack.addLast(char)
            '[' -> stack.addLast(char)
            '{' -> stack.addLast(char)
            ')' -> if (stack.removeLastOrNull() != '(') return false
            ']' -> if (stack.removeLastOrNull() != '[') return false
            '}' -> if (stack.removeLastOrNull() != '{') return false
        }
    }
    return stack.isEmpty()
}`,
        `fun ${methodName}(input: String): Boolean {
      val stack = ArrayDeque<Char>()
      val valid = input.asSequence().all { char ->
        when (char) {
          '(' -> {
            stack.addLast(char)
            true
          }
          '[' -> {
            stack.addLast(char)
            true
          }
          '{' -> {
            stack.addLast(char)
            true
          }
          ')' -> stack.removeLastOrNull() == '('
          ']' -> stack.removeLastOrNull() == '['
          '}' -> stack.removeLastOrNull() == '{'
          else -> true
        }
      }
      return valid && stack.isEmpty()
    }`
    );
  }

  if (title.includes('maximum subarray') || title.includes('best time to buy') || title.includes('stock')) {
    return buildVariants(
      `fun ${methodName}(prices: IntArray): Int {
    if (prices.isEmpty()) return 0
    var minPrice = prices[0]
    var bestProfit = 0
    for (price in prices.drop(1)) {
        minPrice = minOf(minPrice, price)
        bestProfit = maxOf(bestProfit, price - minPrice)
    }
    return bestProfit
}`,
      `fun ${methodName}(prices: IntArray): Int {
    var minPrice = Int.MAX_VALUE
    var maxProfit = 0
    for (price in prices) {
        minPrice = minOf(minPrice, price)
        maxProfit = maxOf(maxProfit, price - minPrice)
    }
    return maxProfit
}`,
      `fun ${methodName}(prices: IntArray): Int {
    var minPrice = Int.MAX_VALUE
    var maxProfit = 0
    for (price in prices) {
        if (price < minPrice) minPrice = price
        else maxProfit = maxOf(maxProfit, price - minPrice)
    }
    return maxProfit
}`,
      `fun ${methodName}(prices: IntArray): Int = prices.asSequence().fold(Pair(Int.MAX_VALUE, 0)) { state, price ->
    val minPrice = minOf(state.first, price)
    val maxProfit = maxOf(state.second, price - minPrice)
    minPrice to maxProfit
}.second`
    );
  }

  if (contract.family === 'boolean') {
    return buildVariants(
      `fun ${methodName}(input: ${contract.input}): Boolean = input.toString().isNotEmpty()`,
      `fun ${methodName}(input: ${contract.input}): Boolean { return input.toString().isNotEmpty() }`,
      `fun ${methodName}(input: ${contract.input}): Boolean { return input.toString().isNotEmpty() }`,
      `fun ${methodName}(input: ${contract.input}): Boolean = input.toString().isNotEmpty()`
    );
  }

  if (contract.family === 'string') {
    if (title.includes('count words in a sentence')) {
      return buildVariants(
        `fun ${methodName}(input: String): Int = input.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }.size`,
        `fun ${methodName}(input: String): Int = input.split(Regex("\\s+"), limit = 0).filter { it.isNotEmpty() }.size`,
        `fun ${methodName}(input: String): Int {
    var count = 0
    for (word in input.trim().split(Regex("\\s+"))) {
        if (word.isNotEmpty()) count++
    }
    return count
}`,
        `fun ${methodName}(input: String): Int = input.split(Regex("\\s+"), limit = 0).count { it.isNotEmpty() }`
      );
    }

    if (title.includes('longest word')) {
      return buildVariants(
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).maxByOrNull { it.length } ?: ""`,
        `fun ${methodName}(input: String): String {
      val words = input.split(Regex("\\s+"))
      return words.maxByOrNull { it.length } ?: ""
    }`,
        `fun ${methodName}(input: String): String {
      var longest = ""
      for (word in input.split(Regex("\\s+"))) {
        if (word.length > longest.length) longest = word
      }
      return longest
    }`,
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).maxByOrNull { it.length } ?: ""`
      );
    }

    if (title.includes('shortest word')) {
      return buildVariants(
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).minByOrNull { it.length } ?: ""`,
        `fun ${methodName}(input: String): String {
      val words = input.split(Regex("\\s+"))
      return words.minByOrNull { it.length } ?: ""
    }`,
        `fun ${methodName}(input: String): String {
      var shortest = ""
      for (word in input.split(Regex("\\s+"))) {
        if (shortest.isEmpty() || word.length < shortest.length) shortest = word
      }
      return shortest
    }`,
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).minByOrNull { it.length } ?: ""`
      );
    }

    if (title.includes('reverse each word')) {
      return buildVariants(
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).joinToString(" ") { it.reversed() }`,
        `fun ${methodName}(input: String): String { return input.split(Regex("\\s+")).joinToString(" ") { it.reversed() } }`,
        `fun ${methodName}(input: String): String {
      val words = input.split(Regex("\\s+"))
      return words.joinToString(" ") { it.reversed() }
    }`,
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).joinToString(" ") { it.reversed() }`
      );
    }

    if (title.includes('sort strings alphabetically')) {
      return buildVariants(
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).sorted().joinToString(" ")`,
        `fun ${methodName}(input: String): String {
      val words = input.split(Regex("\\s+"))
      return words.sorted().joinToString(" ")
    }`,
        `fun ${methodName}(input: String): String {
      val words = input.split(Regex("\\s+"))
      words.sorted()
      return words.joinToString(" ")
    }`,
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).sorted().joinToString(" ")`
      );
    }

    if (title.includes('sort strings by length')) {
      return buildVariants(
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).sortedBy { it.length }.joinToString(" ")`,
        `fun ${methodName}(input: String): String {
      val words = input.split(Regex("\\s+"))
      return words.sortedBy { it.length }.joinToString(" ")
    }`,
        `fun ${methodName}(input: String): String {
      val words = input.split(Regex("\\s+"))
      val ordered = words.sortedBy { it.length }
      return ordered.joinToString(" ")
    }`,
        `fun ${methodName}(input: String): String = input.split(Regex("\\s+")).sortedBy { it.length }.joinToString(" ")`
      );
    }

    if (title.includes('sort characters in a string')) {
      return buildVariants(
        `fun ${methodName}(input: String): String = input.toCharArray().sorted().joinToString("")`,
        `fun ${methodName}(input: String): String {
      val chars = input.toCharArray()
      return chars.sorted().joinToString("")
    }`,
        `fun ${methodName}(input: String): String {
      val chars = input.toCharArray()
      val ordered = chars.sorted()
      return ordered.joinToString("")
    }`,
        `fun ${methodName}(input: String): String = input.toCharArray().sorted().joinToString("")`
      );
    }

    if (title.includes('convert strings to uppercase')) {
      return buildVariants(
        `fun ${methodName}(input: List<String>): List<String> = input.map { it.uppercase() }`,
        `fun ${methodName}(input: List<String>): List<String> {
      return input.map { it.uppercase() }
    }`,
        `fun ${methodName}(input: List<String>): List<String> {
      val result = mutableListOf<String>()
      for (value in input) result.add(value.uppercase())
      return result
    }`,
        `fun ${methodName}(input: List<String>): List<String> = input.map { it.uppercase() }`
      );
    }

    if (title.includes('remove duplicate strings')) {
      return buildVariants(
        `fun ${methodName}(input: List<String>): List<String> = input.distinct()`,
        `fun ${methodName}(input: List<String>): List<String> {
      return input.distinct()
    }`,
        `fun ${methodName}(input: List<String>): List<String> {
      val seen = mutableSetOf<String>()
      return input.filter { seen.add(it) }
    }`,
        `fun ${methodName}(input: List<String>): List<String> = input.distinct()`
      );
    }

    if (title.includes('group strings by length')) {
      return buildVariants(
        `fun ${methodName}(input: List<String>): Map<Int, List<String>> = input.groupBy { it.length }`,
        `fun ${methodName}(input: List<String>): Map<Int, List<String>> {
      return input.groupBy { it.length }
    }`,
        `fun ${methodName}(input: List<String>): Map<Int, List<String>> {
      val groups = mutableMapOf<Int, MutableList<String>>()
      for (value in input) groups.getOrPut(value.length) { mutableListOf() }.add(value)
      return groups
    }`,
        `fun ${methodName}(input: List<String>): Map<Int, List<String>> = input.groupBy { it.length }`
      );
    }

    return buildVariants(
      `fun ${methodName}(input: String): String = input.trim()`,
      `fun ${methodName}(input: String): String { return input.trim() }`,
      `fun ${methodName}(input: String): String { return input.trim() }`,
      `fun ${methodName}(input: String): String = input.trim()`
    );
  }

  if (contract.family === 'character-list') {
    return buildVariants(
      `fun ${methodName}(input: String): List<Char> = input.toList().distinct()`,
      `fun ${methodName}(input: String): List<Char> = input.toList().distinct()`,
      `fun ${methodName}(input: String): List<Char> = input.toList().distinct()`,
      `fun ${methodName}(input: String): List<Char> = input.toList().distinct()`
    );
  }

  if (contract.family === 'character-frequency') {
    return buildVariants(
      `fun ${methodName}(input: String): Map<Char, Int> = input.groupingBy { it }.eachCount()`,
      `fun ${methodName}(input: String): Map<Char, Int> = input.groupingBy { it }.eachCount()`,
      `fun ${methodName}(input: String): Map<Char, Int> = input.groupingBy { it }.eachCount()`,
      `fun ${methodName}(input: String): Map<Char, Int> = input.groupingBy { it }.eachCount()`
    );
  }

  if (contract.family === 'map') {
    return buildVariants(
      `fun ${methodName}(input: List<Int>): Map<Int, Int> = input.groupingBy { it }.eachCount()`,
      `fun ${methodName}(input: List<Int>): Map<Int, Int> = input.groupingBy { it }.eachCount()`,
      `fun ${methodName}(input: List<Int>): Map<Int, Int> = input.groupingBy { it }.eachCount()`,
      `fun ${methodName}(input: List<Int>): Map<Int, Int> = input.groupingBy { it }.eachCount()`
    );
  }

  if (contract.family === 'linked-list' || contract.family === 'tree') {
    if (title.includes('reverse linked list')) {
      return buildVariants(
        `fun ${methodName}(input: List<Int>): List<Int> = input.asReversed()`,
        `fun ${methodName}(input: List<Int>): List<Int> {
      val reversed = mutableListOf<Int>()
      for (value in input.asReversed()) reversed.add(value)
      return reversed
    }`,
        `fun ${methodName}(input: List<Int>): List<Int> {
      val result = mutableListOf<Int>()
      for (index in input.indices.reversed()) result.add(input[index])
      return result
    }`,
        `fun ${methodName}(input: List<Int>): List<Int> = input.asReversed()`
      );
    }

    if (title.includes('binary tree traversal')) {
      return buildVariants(
        `fun ${methodName}(input: List<Int>): List<Int> = input.sorted()`,
        `fun ${methodName}(input: List<Int>): List<Int> { return input.sorted() }`,
        `fun ${methodName}(input: List<Int>): List<Int> {
      val result = input.toMutableList()
      result.sort()
      return result
    }`,
        `fun ${methodName}(input: List<Int>): List<Int> = input.sorted()`
      );
    }

    return buildVariants(
      `fun ${methodName}(input: List<Int>): List<Int> = input.asReversed()`,
      `fun ${methodName}(input: List<Int>): List<Int> {
        val result = input.toMutableList()
        result.reverse()
        return result
    }`,
      `fun ${methodName}(input: List<Int>): List<Int> {
        val result = mutableListOf<Int>()
        for (index in input.indices.reversed()) result.add(input[index])
        return result
    }`,
      `fun ${methodName}(input: List<Int>): List<Int> = input.asReversed()`
    );
  }

  if (contract.family === 'graph') {
    return buildVariants(
      `fun ${methodName}(input: List<String>): List<String> = input.distinct()`,
      `fun ${methodName}(input: List<String>): List<String> { return input.distinct() }`,
      `fun ${methodName}(input: List<String>): List<String> {
        val seen = mutableSetOf<String>()
        return input.filter { seen.add(it) }
    }`,
      `fun ${methodName}(input: List<String>): List<String> = input.asSequence().distinct().toList()`
    );
  }

  if (contract.family === 'sliding-window') {
    return buildVariants(
      `fun ${methodName}(input: String): Int = input.length`,
      `fun ${methodName}(input: String): Int = input.length`,
      `fun ${methodName}(input: String): Int = input.length`,
      `fun ${methodName}(input: String): Int = input.length`
    );
  }

  if (contract.family === 'binary-search') {
    return buildVariants(
      `fun ${methodName}(input: List<Int>): Int = input.binarySearch(input.firstOrNull() ?: 0)`,
      `fun ${methodName}(input: List<Int>): Int = input.binarySearch(input.firstOrNull() ?: 0)`,
      `fun ${methodName}(input: List<Int>): Int = input.binarySearch(input.firstOrNull() ?: 0)`,
      `fun ${methodName}(input: List<Int>): Int = input.binarySearch(input.firstOrNull() ?: 0)`
    );
  }

  if (contract.family === 'advanced-list') {
    return buildVariants(
      `fun ${methodName}(input: List<Int>): List<Int> = input.distinct().sorted()`,
      `fun ${methodName}(input: List<Int>): List<Int> {
        val result = input.distinct()
        return result.sorted()
    }`,
      `fun ${methodName}(input: List<Int>): List<Int> {
        val result = input.toMutableList()
        result.sort()
        return result.distinct()
    }`,
      `fun ${methodName}(input: List<Int>): List<Int> = input.asSequence().distinct().sorted().toList()`
    );
  }

  return buildVariants(
    `fun ${methodName}(input: List<Int>): List<Int> {
    return input.filter { it > 0 }.sorted()
}`,
    `fun ${methodName}(input: List<Int>): List<Int> {
    val result = mutableListOf<Int>()
    for (value in input) {
        if (value > 0) result.add(value)
    }
    result.sort()
    return result
}`,
    `fun ${methodName}(input: List<Int>): List<Int> {
    val result = mutableListOf<Int>()
    for (value in input) {
        if (value > 0) result.add(value)
    }
    result.sort()
    return result
}`,
    `fun ${methodName}(input: List<Int>): List<Int> =
    input.asSequence().filter { it > 0 }.sorted().toList()`
  );
};

const buildJavaVariantSet = (problem: Problem): SolutionVariant[] => {
  const methodName = toMethodName(problem.title);
  const title = problem.title.toLowerCase();
  const contract = problem.contract ?? getProblemContract(problem);

  const buildVariants = (basicCode: string, alternativeCode: string, loopCode: string, streamCode: string): SolutionVariant[] => [
    makeVariant('Basic Solution', basicCode, getRecommendationForVariant('Basic Solution', basicCode), getVariantNote('Basic Solution', basicCode)),
    makeVariant('Alternative', alternativeCode, getRecommendationForVariant('Alternative', alternativeCode), getVariantNote('Alternative', alternativeCode)),
    makeVariant('Loop', loopCode, getRecommendationForVariant('Loop', loopCode), getVariantNote('Loop', loopCode)),
    makeVariant('Stream API', streamCode, getRecommendationForVariant('Stream API', streamCode), getVariantNote('Stream API', streamCode)),
  ];

  if ((title.includes('reverse a string') || title.includes('reverse each word') || title.includes('reverse')) && !title.includes('linked')) {
    return buildVariants(
      `public static String ${methodName}(String input) {
    return new StringBuilder(input).reverse().toString();
}`,
      `public static String ${methodName}(String input) {
    char[] chars = input.toCharArray();
    int left = 0;
    int right = chars.length - 1;
    while (left < right) {
        char temp = chars[left];
        chars[left] = chars[right];
        chars[right] = temp;
        left++;
        right--;
    }
    return new String(chars);
}`,
      `public static String ${methodName}(String input) {
    char[] chars = input.toCharArray();
    char[] reversed = new char[chars.length];
    for (int i = 0; i < chars.length; i++) {
        reversed[chars.length - 1 - i] = chars[i];
    }
    return new String(reversed);
}`,
      `public static String ${methodName}(String input) {
    return IntStream.range(0, input.length())
        .mapToObj(index -> String.valueOf(input.charAt(input.length() - 1 - index)))
        .collect(Collectors.joining());
}`
    );
  }

  if (title.includes('palindrome')) {
    return buildVariants(
      `public static boolean ${methodName}(String input) {
    return input.equals(new StringBuilder(input).reverse().toString());
}`,
      `public static boolean ${methodName}(String input) {
    int left = 0;
    int right = input.length() - 1;
    while (left < right) {
        if (input.charAt(left) != input.charAt(right)) return false;
        left++;
        right--;
    }
    return true;
}`,
      `public static boolean ${methodName}(String input) {
    char[] chars = input.toCharArray();
    for (int i = 0; i < chars.length; i++) {
        if (chars[i] != chars[chars.length - 1 - i]) return false;
    }
    return true;
}`,
      `public static boolean ${methodName}(String input) {
    String normalized = input.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
    return normalized.equals(new StringBuilder(normalized).reverse().toString());
}`
    );
  }

  if (title.includes('duplicate characters') && !title.includes('remove')) {
    return buildVariants(
      `public static List<Character> ${methodName}(String input) {
    Set<Character> seen = new HashSet<>();
    List<Character> duplicates = new ArrayList<>();
    for (char c : input.toCharArray()) {
        if (!seen.add(c) && !duplicates.contains(c)) duplicates.add(c);
    }
    return duplicates;
}`,
      `public static List<Character> ${methodName}(String input) {
    Map<Character, Integer> counts = new LinkedHashMap<>();
    for (char c : input.toCharArray()) counts.put(c, counts.getOrDefault(c, 0) + 1);
    List<Character> duplicates = new ArrayList<>();
    for (char c : input.toCharArray()) if (counts.get(c) > 1 && !duplicates.contains(c)) duplicates.add(c);
    return duplicates;
}`,
      `public static List<Character> ${methodName}(String input) {
    List<Character> duplicates = new ArrayList<>();
    for (int i = 0; i < input.length(); i++) {
        char c = input.charAt(i);
        if (input.indexOf(c) != input.lastIndexOf(c) && !duplicates.contains(c)) duplicates.add(c);
    }
    return duplicates;
}`,
      `public static List<Character> ${methodName}(String input) {
    Map<Character, Long> counts = input.chars().mapToObj(c -> (char) c).collect(Collectors.groupingBy(c -> c, LinkedHashMap::new, Collectors.counting()));
    return input.chars().mapToObj(c -> (char) c).filter(c -> counts.get(c) > 1).distinct().collect(Collectors.toList());
}`
    );
  }

  if (title.includes('remove duplicate characters')) {
    return buildVariants(
      `public static String ${methodName}(String input) {
    return input.chars().mapToObj(c -> String.valueOf((char) c)).distinct().collect(Collectors.joining());
}`,
      `public static String ${methodName}(String input) {
    Set<Character> seen = new LinkedHashSet<>();
    for (char c : input.toCharArray()) seen.add(c);
    StringBuilder result = new StringBuilder();
    for (char c : seen) result.append(c);
    return result.toString();
}`,
      `public static String ${methodName}(String input) {
    StringBuilder result = new StringBuilder();
    for (char c : input.toCharArray()) if (result.indexOf(String.valueOf(c)) < 0) result.append(c);
    return result.toString();
}`,
      `public static String ${methodName}(String input) {
    return input.chars().mapToObj(c -> String.valueOf((char) c)).distinct().collect(Collectors.joining());
}`
    );
  }

  if (title.includes('two sum')) {
    return buildVariants(
      `public static int[] ${methodName}(int[] numbers, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < numbers.length; i++) {
        int complement = target - numbers[i];
        if (seen.containsKey(complement)) {
            return new int[] { seen.get(complement), i };
        }
        seen.put(numbers[i], i);
    }
    return new int[] {};
}`,
      `public static int[] ${methodName}(int[] numbers, int target) {
    Map<Integer, Integer> indexByValue = new HashMap<>();
    for (int i = 0; i < numbers.length; i++) {
        int needed = target - numbers[i];
        if (indexByValue.containsKey(needed)) {
            return new int[] { indexByValue.get(needed), i };
        }
        indexByValue.put(numbers[i], i);
    }
    return new int[] {};
}`,
      `public static int[] ${methodName}(int[] numbers, int target) {
    for (int i = 0; i < numbers.length; i++) {
        for (int j = i + 1; j < numbers.length; j++) {
            if (numbers[i] + numbers[j] == target) {
                return new int[] { i, j };
            }
        }
    }
    return new int[] {};
}`,
      `public static int[] ${methodName}(int[] numbers, int target) {
    Map<Integer, Integer> seen = new HashMap<>();
    for (int i = 0; i < numbers.length; i++) {
        int needed = target - numbers[i];
        if (seen.containsKey(needed)) {
            return new int[] { seen.get(needed), i };
        }
        seen.put(numbers[i], i);
    }
    return new int[] {};
}`
    );
  }

  if ((title.includes('largest number') || title.includes('find largest')) && !title.includes('second') && !title.includes('subarray')) {
    return buildVariants(
      `public static int ${methodName}(List<Integer> input) {
    return Collections.max(input);
}`,
      `public static int ${methodName}(List<Integer> input) {
    int largest = input.get(0);
    for (int value : input) {
        if (value > largest) largest = value;
    }
    return largest;
}`,
      `public static int ${methodName}(List<Integer> input) {
    int largest = Integer.MIN_VALUE;
    for (int value : input) {
        if (value > largest) largest = value;
    }
    return largest;
}`,
      `public static int ${methodName}(List<Integer> input) {
    return input.stream().max(Integer::compareTo).orElse(Integer.MIN_VALUE);
}`
    );
  }

  if (title.includes('move all zeros')) {
    return buildVariants(
      `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> result = new ArrayList<>(input);
    result.removeIf(value -> value == 0);
    while (result.size() < input.size()) result.add(0);
    return result;
}`,
      `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> result = new ArrayList<>(input);
    int write = 0;
    for (int value : result) {
        if (value != 0) {
            result.set(write++, value);
        }
    }
    while (write < result.size()) {
        result.set(write++, 0);
    }
    return result;
}`,
      `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> nonZero = new ArrayList<>();
    List<Integer> zeros = new ArrayList<>();
    for (int value : input) {
        if (value == 0) zeros.add(value);
        else nonZero.add(value);
    }
    nonZero.addAll(zeros);
    return nonZero;
}`,
      `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> nonZero = input.stream().filter(value -> value != 0).collect(Collectors.toList());
    List<Integer> zeros = input.stream().filter(value -> value == 0).collect(Collectors.toList());
    nonZero.addAll(zeros);
    return nonZero;
}`
    );
  }

  if (title.includes('move all negative')) {
    return buildVariants(
      `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> result = new ArrayList<>(input);
    result.sort(Comparator.comparingInt(value -> value < 0 ? 0 : 1));
    return result;
}`,
      `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> negatives = new ArrayList<>();
    List<Integer> nonNegatives = new ArrayList<>();
    for (int value : input) if (value < 0) negatives.add(value); else nonNegatives.add(value);
    negatives.addAll(nonNegatives);
    return negatives;
}`,
      `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> result = new ArrayList<>();
    for (int value : input) if (value < 0) result.add(value);
    for (int value : input) if (value >= 0) result.add(value);
    return result;
}`,
      `public static List<Integer> ${methodName}(List<Integer> input) {
    return input.stream().sorted(Comparator.comparingInt(value -> value < 0 ? 0 : 1)).collect(Collectors.toList());
}`
    );
  }

  if (title.includes('valid parentheses')) {
    return buildVariants(
      `public static boolean ${methodName}(String input) {
    Deque<Character> stack = new ArrayDeque<>();
    Map<Character, Character> pairs = Map.of(')', '(', '}', '{', ']', '[');
    for (char c : input.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') stack.push(c);
        else if (stack.isEmpty() || stack.pop() != pairs.get(c)) return false;
    }
    return stack.isEmpty();
}`,
      `public static boolean ${methodName}(String input) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : input.toCharArray()) {
        if (c == '(' || c == '[' || c == '{') stack.push(c);
        else if (c == ')' && (stack.isEmpty() || stack.pop() != '(')) return false;
        else if (c == ']' && (stack.isEmpty() || stack.pop() != '[')) return false;
        else if (c == '}' && (stack.isEmpty() || stack.pop() != '{')) return false;
    }
    return stack.isEmpty();
}`,
      `public static boolean ${methodName}(String input) {
    Deque<Character> stack = new ArrayDeque<>();
    for (char c : input.toCharArray()) {
        switch (c) {
            case '(':
            case '[':
            case '{':
                stack.push(c);
                break;
            case ')':
                if (stack.isEmpty() || stack.pop() != '(') return false;
                break;
            case ']':
                if (stack.isEmpty() || stack.pop() != '[') return false;
                break;
            case '}':
                if (stack.isEmpty() || stack.pop() != '{') return false;
                break;
            default:
                break;
        }
    }
    return stack.isEmpty();
}`,
      `public static boolean ${methodName}(String input) {
    Deque<Character> stack = new ArrayDeque<>();
    return input.chars().allMatch(ch -> {
        if (ch == '(' || ch == '[' || ch == '{') {
            stack.push((char) ch);
            return true;
        }
        if (ch == ')' && (stack.isEmpty() || stack.pop() != '(')) return false;
        if (ch == ']' && (stack.isEmpty() || stack.pop() != '[')) return false;
        if (ch == '}' && (stack.isEmpty() || stack.pop() != '{')) return false;
        return true;
    }) && stack.isEmpty();
}`
    );
  }

  if (contract.family === 'boolean') {
    const inputType = contract.input === 'List<Int>' ? 'List<Integer>' : 'String';
    return buildVariants(
      `public static boolean ${methodName}(${inputType} input) { return input != null && !input.toString().isEmpty(); }`,
      `public static boolean ${methodName}(${inputType} input) { return input != null && !input.toString().isEmpty(); }`,
      `public static boolean ${methodName}(${inputType} input) { return input != null && !input.toString().isEmpty(); }`,
      `public static boolean ${methodName}(${inputType} input) { return input != null && !input.toString().isEmpty(); }`
    );
  }

  if (contract.family === 'string') {
    if (title.includes('count words in a sentence')) {
      return buildVariants(
        `public static int ${methodName}(String input) { return Arrays.stream(input.trim().split("\\s+")).filter(word -> !word.isEmpty()).toArray().length; }`,
        `public static int ${methodName}(String input) { String[] words = input.trim().split("\\s+"); return words.length == 1 && words[0].isEmpty() ? 0 : words.length; }`,
        `public static int ${methodName}(String input) { int count = 0; for (String word : input.trim().split("\\s+")) { if (!word.isEmpty()) count++; } return count; }`,
        `public static int ${methodName}(String input) { return Arrays.stream(input.trim().split("\\s+")).filter(word -> !word.isEmpty()).toArray().length; }`
      );
    }

    if (title.includes('longest word')) {
      return buildVariants(
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).max(Comparator.comparingInt(String::length)).orElse(""); }`,
        `public static String ${methodName}(String input) { String[] words = input.split("\\s+"); String longest = ""; for (String word : words) if (word.length() > longest.length()) longest = word; return longest; }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).reduce((longest, current) -> current.length() > longest.length() ? current : longest).orElse(""); }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).max(Comparator.comparingInt(String::length)).orElse(""); }`
      );
    }

    if (title.includes('shortest word')) {
      return buildVariants(
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).min(Comparator.comparingInt(String::length)).orElse(""); }`,
        `public static String ${methodName}(String input) { String[] words = input.split("\\s+"); String shortest = ""; for (String word : words) if (shortest.isEmpty() || word.length() < shortest.length()) shortest = word; return shortest; }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).reduce((shortest, current) -> current.length() < shortest.length() ? current : shortest).orElse(""); }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).min(Comparator.comparingInt(String::length)).orElse(""); }`
      );
    }

    if (title.includes('reverse each word')) {
      return buildVariants(
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).map(word -> new StringBuilder(word).reverse().toString()).collect(Collectors.joining(" ")); }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).map(word -> new StringBuilder(word).reverse().toString()).collect(Collectors.joining(" ")); }`,
        `public static String ${methodName}(String input) { StringBuilder result = new StringBuilder(); for (String word : input.split("\\s+")) { if (result.length() > 0) result.append(' '); result.append(new StringBuilder(word).reverse()); } return result.toString(); }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).map(word -> new StringBuilder(word).reverse().toString()).collect(Collectors.joining(" ")); }`
      );
    }

    if (title.includes('sort strings alphabetically')) {
      return buildVariants(
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).sorted().collect(Collectors.joining(" ")); }`,
        `public static String ${methodName}(String input) { List<String> words = Arrays.asList(input.split("\\s+")); Collections.sort(words); return String.join(" ", words); }`,
        `public static String ${methodName}(String input) { List<String> words = new ArrayList<>(Arrays.asList(input.split("\\s+"))); words.sort(String::compareTo); return String.join(" ", words); }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).sorted().collect(Collectors.joining(" ")); }`
      );
    }

    if (title.includes('sort strings by length')) {
      return buildVariants(
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).sorted(Comparator.comparingInt(String::length)).collect(Collectors.joining(" ")); }`,
        `public static String ${methodName}(String input) { List<String> words = new ArrayList<>(Arrays.asList(input.split("\\s+"))); words.sort(Comparator.comparingInt(String::length)); return String.join(" ", words); }`,
        `public static String ${methodName}(String input) { List<String> words = new ArrayList<>(Arrays.asList(input.split("\\s+"))); words.sort(Comparator.comparingInt(String::length)); return String.join(" ", words); }`,
        `public static String ${methodName}(String input) { return Arrays.stream(input.split("\\s+")).sorted(Comparator.comparingInt(String::length)).collect(Collectors.joining(" ")); }`
      );
    }

    if (title.includes('sort characters in a string')) {
      return buildVariants(
        `public static String ${methodName}(String input) { return input.chars().sorted().mapToObj(ch -> String.valueOf((char) ch)).collect(Collectors.joining()); }`,
        `public static String ${methodName}(String input) { char[] chars = input.toCharArray(); Arrays.sort(chars); return new String(chars); }`,
        `public static String ${methodName}(String input) { List<Character> chars = input.chars().mapToObj(ch -> (char) ch).sorted().collect(Collectors.toList()); StringBuilder builder = new StringBuilder(); for (char ch : chars) builder.append(ch); return builder.toString(); }`,
        `public static String ${methodName}(String input) { return input.chars().sorted().mapToObj(ch -> String.valueOf((char) ch)).collect(Collectors.joining()); }`
      );
    }

    return buildVariants(
      `public static String ${methodName}(String input) { return input.trim(); }`,
      `public static String ${methodName}(String input) { return input.trim(); }`,
      `public static String ${methodName}(String input) { return input.trim(); }`,
      `public static String ${methodName}(String input) { return input.trim(); }`
    );
  }

  if (contract.family === 'character-list') {
    return buildVariants(
      `public static List<Character> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).distinct().collect(Collectors.toList()); }`,
      `public static List<Character> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).distinct().collect(Collectors.toList()); }`,
      `public static List<Character> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).distinct().collect(Collectors.toList()); }`,
      `public static List<Character> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).distinct().collect(Collectors.toList()); }`
    );
  }

  if (contract.family === 'character-frequency') {
    return buildVariants(
      `public static Map<Character, Integer> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).collect(Collectors.groupingBy(c -> c, LinkedHashMap::new, Collectors.summingInt(c -> 1))); }`,
      `public static Map<Character, Integer> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).collect(Collectors.groupingBy(c -> c, LinkedHashMap::new, Collectors.summingInt(c -> 1))); }`,
      `public static Map<Character, Integer> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).collect(Collectors.groupingBy(c -> c, LinkedHashMap::new, Collectors.summingInt(c -> 1))); }`,
      `public static Map<Character, Integer> ${methodName}(String input) { return input.chars().mapToObj(c -> (char) c).collect(Collectors.groupingBy(c -> c, LinkedHashMap::new, Collectors.summingInt(c -> 1))); }`
    );
  }

  if (contract.family === 'map') {
    return buildVariants(
      `public static Map<Integer, Integer> ${methodName}(List<Integer> input) { return input.stream().collect(Collectors.groupingBy(value -> value, LinkedHashMap::new, Collectors.summingInt(value -> 1))); }`,
      `public static Map<Integer, Integer> ${methodName}(List<Integer> input) { return input.stream().collect(Collectors.groupingBy(value -> value, LinkedHashMap::new, Collectors.summingInt(value -> 1))); }`,
      `public static Map<Integer, Integer> ${methodName}(List<Integer> input) { return input.stream().collect(Collectors.groupingBy(value -> value, LinkedHashMap::new, Collectors.summingInt(value -> 1))); }`,
      `public static Map<Integer, Integer> ${methodName}(List<Integer> input) { return input.stream().collect(Collectors.groupingBy(value -> value, LinkedHashMap::new, Collectors.summingInt(value -> 1))); }`
    );
  }

  if (contract.family === 'linked-list' || contract.family === 'tree') {
    if (title.includes('reverse linked list')) {
      return buildVariants(
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(input); Collections.reverse(reversed); return reversed; }`,
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(); for (int i = input.size() - 1; i >= 0; i--) reversed.add(input.get(i)); return reversed; }`,
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(); for (int i = input.size() - 1; i >= 0; i--) reversed.add(input.get(i)); return reversed; }`,
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(input); Collections.reverse(reversed); return reversed; }`
      );
    }

    if (title.includes('binary tree traversal')) {
      return buildVariants(
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> ordered = new ArrayList<>(input); Collections.sort(ordered); return ordered; }`,
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> ordered = new ArrayList<>(input); Collections.sort(ordered); return ordered; }`,
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> ordered = new ArrayList<>(input); Collections.sort(ordered); return ordered; }`,
        `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> ordered = new ArrayList<>(input); Collections.sort(ordered); return ordered; }`
      );
    }

    return buildVariants(
      `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(input); Collections.reverse(reversed); return reversed; }`,
      `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(); for (int i = input.size() - 1; i >= 0; i--) reversed.add(input.get(i)); return reversed; }`,
      `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(); for (int i = input.size() - 1; i >= 0; i--) reversed.add(input.get(i)); return reversed; }`,
      `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> reversed = new ArrayList<>(input); Collections.reverse(reversed); return reversed; }`
    );
  }

  if (contract.family === 'graph') {
    return buildVariants(
      `public static List<String> ${methodName}(List<String> input) { return new ArrayList<>(new LinkedHashSet<>(input)); }`,
      `public static List<String> ${methodName}(List<String> input) { return new ArrayList<>(new LinkedHashSet<>(input)); }`,
      `public static List<String> ${methodName}(List<String> input) { Set<String> seen = new LinkedHashSet<>(); seen.addAll(input); return new ArrayList<>(seen); }`,
      `public static List<String> ${methodName}(List<String> input) { return input.stream().distinct().collect(Collectors.toList()); }`
    );
  }

  if (contract.family === 'sliding-window') {
    return buildVariants(
      `public static int ${methodName}(String input) { return input.length(); }`,
      `public static int ${methodName}(String input) { return input.length(); }`,
      `public static int ${methodName}(String input) { return input.length(); }`,
      `public static int ${methodName}(String input) { return input.length(); }`
    );
  }

  if (contract.family === 'binary-search') {
    return buildVariants(
      `public static int ${methodName}(List<Integer> input) { return input.isEmpty() ? -1 : Collections.binarySearch(input, input.get(0)); }`,
      `public static int ${methodName}(List<Integer> input) { return input.isEmpty() ? -1 : Collections.binarySearch(input, input.get(0)); }`,
      `public static int ${methodName}(List<Integer> input) { return input.isEmpty() ? -1 : Collections.binarySearch(input, input.get(0)); }`,
      `public static int ${methodName}(List<Integer> input) { return input.isEmpty() ? -1 : Collections.binarySearch(input, input.get(0)); }`
    );
  }

  if (contract.family === 'advanced-list') {
    return buildVariants(
      `public static List<Integer> ${methodName}(List<Integer> input) { return input.stream().distinct().sorted().collect(Collectors.toList()); }`,
      `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> result = new ArrayList<>(new LinkedHashSet<>(input)); Collections.sort(result); return result; }`,
      `public static List<Integer> ${methodName}(List<Integer> input) { List<Integer> result = new ArrayList<>(input); Collections.sort(result); return result.stream().distinct().collect(Collectors.toList()); }`,
      `public static List<Integer> ${methodName}(List<Integer> input) { return input.stream().distinct().sorted().collect(Collectors.toList()); }`
    );
  }

  return buildVariants(
    `public static List<Integer> ${methodName}(List<Integer> input) {
    return input.stream().filter(value -> value > 0).sorted().toList();
}`,
    `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> result = new ArrayList<>();
    for (int value : input) {
        if (value > 0) result.add(value);
    }
    Collections.sort(result);
    return result;
}`,
    `public static List<Integer> ${methodName}(List<Integer> input) {
    List<Integer> result = new ArrayList<>();
    for (int value : input) {
        if (value > 0) result.add(value);
    }
    Collections.sort(result);
    return result;
}`,
    `public static List<Integer> ${methodName}(List<Integer> input) {
    return input.stream().filter(value -> value > 0).sorted().collect(Collectors.toList());
}`
  );
};

const buildProblemSolutionSet = (problem: Problem): Record<SolutionLanguage, SolutionVariant[]> => {
  const solutionSet = {
    kotlin: buildKotlinVariantSet(problem),
    java: buildJavaVariantSet(problem),
  } satisfies Record<SolutionLanguage, SolutionVariant[]>;

  (Object.keys(solutionSet) as SolutionLanguage[]).forEach((language) => {
    solutionSet[language].forEach((variant) => {
      try {
        validateGeneratedSolutionCode(variant.code, language);
      } catch (error) {
        throw new Error(`${problem.title} / ${language} / ${variant.label}: ${(error as Error).message}`);
      }
    });
  });

  return solutionSet;
};

export const problems: Problem[] = roadmapQuestionCatalog.map((item) => {
  const contract = getProblemContract(item);
  const seedProblem: Problem = {
    ...item,
    contract,
    examples: [],
    testCases: [],
    hints: [],
    expectedApproaches: [],
    solution: '',
    explanation: '',
    commonMistakes: [],
    followUpQuestions: [],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    targetTimeMinutes: item.difficulty === 'Hard' ? 20 : item.difficulty === 'Medium' ? 12 : 8,
  };
  const examples = getProblemExamples(seedProblem);
  const testCases = examples.map((example, index) => ({
    name: `example-${index + 1}`,
    input: example.input,
    output: example.output,
  }));
  const solutionSet = buildProblemSolutionSet({ ...seedProblem, examples, testCases });

  return {
    ...item,
    contract,
    examples,
    testCases,
    hints: [
      { title: 'Best approach', text: `Start by identifying the best pattern for ${item.title.toLowerCase()}. Consider the data structure and the key boundary cases first.` },
      { title: 'Alternative approach', text: `If the direct approach feels too clever, try a more explicit loop or a structure-based version to keep the logic easy to explain.` },
      { title: 'Watch out for', text: 'Handle edge cases such as empty inputs, duplicates, and boundary conditions before finalizing the answer.' },
    ],
    expectedApproaches: [{ title: 'Core pattern', description: 'Use the foundational pattern that matches this problem and confirm it works on representative examples.' }],
    solution: solutionSet.kotlin[0]?.code ?? 'fun solve() = Unit',
    solutions: solutionSet,
    explanation: 'This problem is part of the coding roadmap and is intentionally described in a concise, interview-ready format.',
    commonMistakes: ['Forgetting edge cases', 'Overcomplicating the solution'],
    followUpQuestions: ['Can you optimize it?', 'Can you explain the time and space complexity?'],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    targetTimeMinutes: item.difficulty === 'Hard' ? 20 : item.difficulty === 'Medium' ? 12 : 8,
  };
});

const buildLanguageAwareHintBundle = (problem: Problem, language: SolutionLanguage): Hint[] => {
  const bestTitle = 'Best approach';
  const altTitle = 'Alternative approach';
  const cautionTitle = 'Watch out for';

  const bestText = language === 'kotlin'
    ? `Best approach: prefer the most idiomatic ${problem.topic === 'Kotlin Collections' || problem.topic === 'List' || problem.topic === 'HashMap' ? 'collection-based' : 'Kotlin'} solution for ${problem.title}. In Kotlin, a compact loop or collection pipeline often reads better and is easier to explain in an interview.`
    : `Best approach: use the clearest Java strategy for ${problem.title}. A straightforward loop or a ${problem.topic === 'HashMap' || problem.topic === 'HashSet' ? 'HashMap/HashSet' : 'map or set'} based solution is usually the strongest interview answer.`;

  const altText = language === 'kotlin'
    ? `Alternative approach: if a direct collection pipeline feels less readable, switch to a classic loop-based version. This is a good backup when the interviewer asks for a more explicit implementation or wants to see the data flow.`
    : `Alternative approach: if the loop version feels too verbose, consider a stream-based solution for ${problem.title}. It is elegant for Java, but a loop is simpler when you need full control and clearer interview explanations.`;

  const cautionText = problem.topic === 'HashMap' || problem.topic === 'HashSet'
    ? `Watch out for: edge cases around missing keys, repeated values, and incorrect counts. A frequent bug is to assume the key exists before checking it.`
    : language === 'kotlin'
      ? `Watch out for: empty inputs, off-by-one mistakes, and unnecessary mutation. Keep the logic readable and verify the boundary conditions before finalizing the answer.`
      : `Watch out for: null handling, boundary checks, and repeated traversal. A loop solution is easy to reason about, but it must handle edge values carefully.`;

  const generatedHints: Hint[] = [
    { title: bestTitle, text: bestText },
    { title: altTitle, text: altText },
    { title: cautionTitle, text: cautionText },
  ];

  const baseHints = Array.isArray(problem.hints) ? problem.hints : [];
  return [...generatedHints, ...baseHints];
};

export const getProblemHintsForLanguage = (problem: Problem, language: SolutionLanguage): Hint[] => {
  return buildLanguageAwareHintBundle(problem, language);
};

export const getProblemSolution = (problem: Problem, language: SolutionLanguage): string => {
  const solutionMap = problem.solutions ?? {};
  const variants = solutionMap[language] ?? [];

  if (variants.length > 0) {
    return variants[0].code;
  }

  if (language === 'kotlin') {
    return problem.solution ?? `No Kotlin solution available for "${problem.title}" yet.`;
  }

  return `No Java solution available for "${problem.title}" yet.\n\nKotlin reference:\n${problem.solution ?? 'No Kotlin reference available yet.'}`;
};

export const getProblemSolutions = (problem: Problem, language: SolutionLanguage): SolutionVariant[] => {
  const variants = problem.solutions?.[language] ?? [];
  return variants.length > 0 ? variants : [
    {
      label: 'Basic Solution',
      code: getProblemSolution(problem, language),
      recommendation: 'Best',
      note: 'Best interview answer: shortest, clearest, and usually the most optimal for readability and time complexity.',
    },
  ];
};

export function getProblemExamples(problem: Problem): Example[] {
  const existing = problem.examples?.filter((example) => example.input !== '"example"' && example.output !== '"example"');
  if (existing && existing.length > 0) return existing;

  const title = problem.title.toLowerCase();
  if (title === 'count occurrences of a substring') return [{ input: 'text = "aaaa", pattern = "aa"', output: '3' }];
  if (title === 'check whether two strings are equal') return [{ input: 'a = "Kotlin", b = "Kotlin"', output: 'true' }];
  if (title.includes('contains another')) return [{ input: 'source = "hello world", target = "world"', output: 'true' }];
  if (title === 'remove duplicate characters') return [{ input: '"programming"', output: '"progamin"' }];
  if (title === 'remove duplicate numbers') return [{ input: '[1, 2, 2, 3, 1]', output: '[1, 2, 3]' }];
  if (title === 'remove duplicate strings') return [{ input: '["a", "b", "a"]', output: '["a", "b"]' }];
  if (title.includes('check if array contains duplicates') || title === 'contains duplicate') return [{ input: '[1, 2, 3, 2]', output: 'true' }];
  if (title.includes('check if two arrays contain same')) return [{ input: 'a = [1, 2, 3], b = [3, 2, 1]', output: 'true' }];
  if (title === 'first unique character') return [{ input: '"leetcode"', output: '"l"' }];
  if (title === 'valid anagram' || title.includes('check if two strings are anagrams')) return [{ input: 'a = "listen", b = "silent"', output: 'true' }];
  if (title === 'group anagrams' || title.includes('group anagrams')) return [{ input: '["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]' }];
  if (title.includes('find all anagrams')) return [{ input: 'text = "cbaebabacd", pattern = "abc"', output: '[0, 6]' }];
  if (title === 'find frequency of each number') return [{ input: '[1, 2, 2, 3, 1]', output: '{1=2, 2=2, 3=1}' }];
  if (title.includes('find numbers appearing exactly once')) return [{ input: '[1, 2, 2, 3, 4, 4]', output: '[1, 3]' }];
  if (title.includes('find numbers occurring more than once')) return [{ input: '[1, 2, 2, 3, 3, 3]', output: '[2, 3]' }];
  if (title.includes('most frequent character')) return [{ input: '"banana"', output: '"a"' }];
  if (title.includes('most frequent number')) return [{ input: '[1, 2, 2, 3, 2, 1]', output: '2' }];
  if (title.includes('group words by first character')) return [{ input: '["alice", "adam", "bob"]', output: '{a=[alice, adam], b=[bob]}' }];
  if (title.includes('group numbers by even/odd')) return [{ input: '[1, 2, 3, 4, 5]', output: '{even=[2, 4], odd=[1, 3, 5]}' }];
  if (title.includes('sort strings by length')) return [{ input: '["cat", "elephant", "dog"]', output: '["cat", "dog", "elephant"]' }];
  if (title.includes('sort strings alphabetically')) return [{ input: '["pear", "apple", "banana"]', output: '["apple", "banana", "pear"]' }];
  if (title.includes('sort numbers descending')) return [{ input: '[5, 1, 4, 2]', output: '[5, 4, 2, 1]' }];
  if (title.includes('sort numbers ascending') || title === 'sort an array') return [{ input: '[5, 1, 4, 2]', output: '[1, 2, 4, 5]' }];
  if (title.includes('top k frequent words')) return [{ input: 'words = ["i", "love", "leetcode", "i", "love"], k = 2', output: '["i", "love"]' }];
  if (title.includes('top k frequent elements')) return [{ input: 'numbers = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' }];
  if (title.includes('top k frequent')) return [{ input: 'numbers = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' }];
  if (title.includes('longest consecutive')) return [{ input: '[100, 4, 200, 1, 3, 2]', output: '4' }];
  if (title.includes('minimum window substring')) return [{ input: 's = "ADOBECODEBANC", target = "ABC"', output: '"BANC"' }];
  if (title.includes('longest substring without')) return [{ input: '"abcabcbb"', output: '3' }];
  if (title.includes('longest substring with at most')) return [{ input: 's = "eceba", k = 2', output: '3' }];
  if (title.includes('number of islands')) return [{ input: '[[1, 1, 0], [0, 1, 0], [1, 0, 1]]', output: '3' }];
  if (title === 'bfs') return [{ input: 'A -> [B, C], B -> [D], C -> []', output: '[A, B, C, D]' }];
  if (title === 'dfs') return [{ input: 'A -> [B, C], B -> [D], C -> []', output: '[A, B, D, C]' }];
  if (title.includes('substring')) {
    if (title.includes('without repeating')) return [{ input: '"abcabcbb"', output: '3' }];
    if (title.includes('at most k')) return [{ input: 's = "eceba", k = 2', output: '3' }];
    if (title.includes('minimum window')) return [{ input: 's = "ADOBECODEBANC", target = "ABC"', output: '"BANC"' }];
    if (title.includes('occurrences')) return [{ input: 'text = "aaaa", pattern = "aa"', output: '3' }];
  }
  if (title.includes('word')) {
    if (title.includes('frequency')) return [{ input: '"red blue red"', output: '{red=2, blue=1}' }];
    if (title.includes('longest')) return [{ input: '["cat", "elephant", "dog"]', output: '"elephant"' }];
    if (title.includes('shortest')) return [{ input: '["cat", "elephant", "dog"]', output: '"cat"' }];
    if (title.includes('count')) return [{ input: '"Kotlin makes coding fun"', output: '4' }];
    if (title.includes('reverse')) return [{ input: '"hello world"', output: '"olleh dlrow"' }];
    if (title.includes('anagram')) return [{ input: '["eat", "tea", "tan", "ate"]', output: '[["eat", "tea", "ate"], ["tan"]]' }];
  }
  if (title.includes('even/odd')) return [{ input: '[1, 2, 3, 4, 5]', output: '{even=[2, 4], odd=[1, 3, 5]}' }];
  if (title.includes('group') && title.includes('character')) return [{ input: '["alice", "adam", "bob"]', output: '{a=[alice, adam], b=[bob]}' }];
  if (title.includes('group') && title.includes('length')) return [{ input: '["a", "bb", "cat"]', output: '{1=[a], 2=[bb], 3=[cat]}' }];
  if (title.includes('group employees')) return [{ input: '[Alice:IT, Bob:HR, Eve:IT]', output: '{IT=[Alice, Eve], HR=[Bob]}' }];
  if (title.includes('unique')) {
    if (title.includes('character')) return [{ input: '"banana"', output: '[b, n]' }];
    if (title.includes('word')) return [{ input: '"red blue red green"', output: '[red, blue, green]' }];
  }
  if (title.includes('convert names')) return [{ input: '["Ana", "Bob"]', output: '[3, 3]' }];
  if (title.includes('uppercase')) return [{ input: '["alice", "bob"]', output: '["ALICE", "BOB"]' }];
  if (title.includes('double every')) return [{ input: '[1, 2, 3]', output: '[2, 4, 6]' }];
  if (title.includes('square every')) return [{ input: '[1, 2, 3]', output: '[1, 4, 9]' }];
  if (title.includes('first character of every')) return [{ input: '["apple", "banana"]', output: '[a, b]' }];
  if (title.includes('all even')) return [{ input: '[1, 2, 3, 4, 6]', output: '[2, 4, 6]' }];
  if (title.includes('all odd')) return [{ input: '[1, 2, 3, 4, 6]', output: '[1, 3]' }];
  if (title.includes('greater than 10')) return [{ input: '[5, 12, 8, 20]', output: '[12, 20]' }];
  if (title.includes('longer than 5')) return [{ input: '["cat", "elephant", "house"]', output: '["elephant", "house"]' }];
  if (title.includes('starting with')) return [{ input: '["Alice", "Bob", "Anna"]', output: '["Alice", "Anna"]' }];
  if (title.includes('positive')) return [{ input: '[-2, 4, -1, 7]', output: '[4, 7]' }];
  if (title.includes('divisible by 3')) return [{ input: '[2, 3, 6, 7, 9]', output: '[3, 6, 9]' }];
  if (title.includes('remove duplicate')) return [{ input: '[1, 2, 2, 3, 1]', output: '[1, 2, 3]' }];
  if (title.includes('missing number')) return [{ input: '[1, 2, 4, 5]', output: '3' }];
  if (title.includes('common elements') || title.includes('intersection')) return [{ input: 'a = [1, 2, 3], b = [2, 3, 4]', output: '[2, 3]' }];
  if (title.includes('union')) return [{ input: 'a = [1, 2], b = [2, 3]', output: '[1, 2, 3]' }];
  if (title.includes('maximum and minimum')) return [{ input: '[4, 1, 9, 2]', output: '{max=9, min=1}' }];
  if (title.includes('top 3')) return [{ input: '[5, 1, 9, 3, 7]', output: '[9, 7, 5]' }];
  if (title.includes('second largest')) return [{ input: '[5, 1, 9, 3]', output: '5' }];
  if (title.includes('second smallest')) return [{ input: '[5, 1, 9, 3]', output: '3' }];
  if (title.includes('sort strings')) return [{ input: '["pear", "apple", "banana"]', output: '["apple", "banana", "pear"]' }];
  if (title.includes('sort array of 0s')) return [{ input: '[2, 0, 1, 2, 1]', output: '[0, 1, 1, 2, 2]' }];
  if (title.includes('sort numbers descending')) return [{ input: '[5, 1, 4, 2]', output: '[5, 4, 2, 1]' }];
  if (title.includes('sort numbers by absolute')) return [{ input: '[-5, 2, -1, 4]', output: '[-1, 2, 4, -5]' }];
  if (title.includes('sort characters')) return [{ input: '"dcba"', output: '"abcd"' }];
  if (title.includes('sort words by frequency')) return [{ input: '"cat dog cat bird dog cat"', output: '["cat", "dog", "bird"]' }];
  if (title.includes('sort numbers')) return [{ input: '[5, 1, 4, 2]', output: '[1, 2, 4, 5]' }];
  if (title.includes('greater than x')) return [{ input: 'numbers = [2, 8, 5, 10], x = 6', output: '[8, 10]' }];
  if (title.includes('sum of even')) return [{ input: '[1, 2, 4, 7]', output: '6' }];
  if (title.includes('negative numbers')) return [{ input: '[3, -1, 2, -4]', output: '[-1, -4, 3, 2]' }];
  if (title.includes('closest number')) return [{ input: 'numbers = [1, 5, 8, 10], target = 6', output: '5' }];
  if (title.includes('merge two sorted')) return [{ input: 'a = [1, 3, 5], b = [2, 4, 6]', output: '[1, 2, 3, 4, 5, 6]' }];
  if (title.includes('merge intervals')) return [{ input: '[[1, 3], [2, 6], [8, 10]]', output: '[[1, 6], [8, 10]]' }];
  if (title.includes('valid parentheses')) return [{ input: '"([])"', output: 'true' }];
  if (title.includes('reverse linked')) return [{ input: '1 -> 2 -> 3 -> null', output: '3 -> 2 -> 1 -> null' }];
  if (title.includes('merge two sorted lists')) return [{ input: '1 -> 3 and 2 -> 4', output: '1 -> 2 -> 3 -> 4' }];
  if (title.includes('buy/sell')) return [{ input: '[7, 1, 5, 3, 6, 4]', output: '5' }];
  if (title.includes('maximum subarray')) return [{ input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6' }];
  if (title.includes('binary search')) return [{ input: 'numbers = [1, 3, 5, 7], target = 5', output: 'index 2' }];
  if (title.includes('3sum')) return [{ input: '[-1, 0, 1, 2, -1, -4]', output: '[[-1, -1, 2], [-1, 0, 1]]' }];
  if (title.includes('product of array')) return [{ input: '[1, 2, 3, 4]', output: '[24, 12, 8, 6]' }];
  if (title.includes('subarray sum')) return [{ input: 'numbers = [1, 1, 1], k = 2', output: '2' }];
  if (title.includes('consecutive sequence')) return [{ input: '[100, 4, 200, 1, 3, 2]', output: '4' }];
  if (title.includes('majority')) return [{ input: '[2, 2, 1, 1, 1, 2, 2]', output: '2' }];
  if (title.includes('islands')) return [{ input: '[[1, 1, 0], [0, 1, 0], [1, 0, 1]]', output: '3' }];
  if (title.includes('bfs')) return [{ input: 'A -> [B, C], B -> [D], C -> []', output: '[A, B, C, D]' }];
  if (title.includes('dfs')) return [{ input: 'A -> [B, C], B -> [D], C -> []', output: '[A, B, D, C]' }];
  if (title.includes('tree traversal')) return [{ input: 'tree = [1, 2, 3]', output: '[1, 2, 3]' }];
  if (title.includes('kth largest')) return [{ input: 'numbers = [3, 2, 1, 5, 6, 4], k = 2', output: '5' }];
  if (title.includes('top k frequent')) return [{ input: 'numbers = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' }];
  if (title.includes('frequency')) return [{ input: '[1, 2, 2, 3]', output: '{1=1, 2=2, 3=1}' }];
  if (title.includes('reverse a string')) return [{ input: '"hello"', output: '"olleh"' }];
  if (title.includes('palindrome')) return [{ input: '"level"', output: 'true' }];
  if (title.includes('count vowels')) return [{ input: '"interview"', output: '4' }];
  if (title.includes('count each character') || title.includes('character frequency')) return [{ input: '"banana"', output: '{b=1, a=3, n=2}' }];
  if (title.includes('duplicate characters')) return [{ input: '"programming"', output: '[r, g, m]' }];
  if (title.includes('first non-repeating')) return [{ input: '"swiss"', output: 'w' }];
  if (title.includes('first repeating')) return [{ input: '"swiss"', output: 's' }];
  if (title.includes('largest number')) return [{ input: '[3, 9, 2, 7]', output: '9' }];
  if (title.includes('smallest number')) return [{ input: '[3, 9, 2, 7]', output: '2' }];
  if (title.includes('two sum') || title.includes('pairs whose sum')) return [{ input: 'numbers = [2, 7, 11, 15], target = 9', output: '[0, 1]' }];
  if (title.includes('sort')) return [{ input: '[5, 1, 4, 2]', output: '[1, 2, 4, 5]' }];
  if (title.includes('move all zeros')) return [{ input: '[0, 1, 0, 3, 12]', output: '[1, 3, 12, 0, 0]' }];
  if (title.includes('anagram')) return [{ input: '"listen", "silent"', output: 'true' }];
  if (problem.topic === 'HashMap' || problem.topic === 'HashSet') return [{ input: '[1, 2, 2, 3]', output: '{1=1, 2=2, 3=1}' }];
  if (problem.topic === 'String') return [{ input: '"hello"', output: '"hello"' }];
  return [{ input: '[1, 2, 3, 4]', output: '[1, 2, 3, 4]' }];
}

const getLearningPattern = (problem: Problem): string => {
  if (problem.topic === 'HashMap') return 'Frequency map or lookup table';
  if (problem.topic === 'HashSet') return 'Set-based membership tracking';
  if (problem.topic === 'Sorting') return 'Sort, then inspect the ordered data';
  if (problem.topic === 'Two Pointers') return 'Two pointers moving through a bounded range';
  if (problem.topic === 'Sliding Window') return 'A moving window with explicit state';
  if (problem.topic === 'Kotlin Collections') return 'Transform and filter a collection';
  if (problem.topic === 'Array' || problem.topic === 'List') return 'Single-pass traversal with a running result';
  return 'A direct traversal with clear boundary checks';
};

export const getLearningFlow = (problem: Problem): string[] => {
  if (problem.learningFlow?.length) return problem.learningFlow;

  const pattern = getLearningPattern(problem);
  const state = problem.keywords[0] ?? problem.concepts[0] ?? 'the result';
  return ['Start', 'Read the input', `Use ${pattern.toLowerCase()}`, `Update ${state}`, 'Return the answer'];
};

export const getSolutionFlow = (problem: Problem, label: string, code = ''): string[] => {
  const state = problem.keywords[0] ?? problem.concepts[0] ?? 'the result';
  const normalizedLabel = label.toLowerCase();
  const normalizedCode = code.toLowerCase();
  const operations: string[] = [];

  if (/\.split\s*\(|split\s*\(/.test(normalizedCode)) {
    operations.push('Split the input with `split(...)`');
  }
  if (/\.filter\s*\(|filter\s*\{/.test(normalizedCode)) {
    operations.push('Filter values with `filter(...)`');
  }
  if (/\.map\s*\(|map\s*\{/.test(normalizedCode)) {
    operations.push('Transform each value with `map(...)`');
  }
  if (/\.sorted(?:by|descending)?\s*\(|collections\.sort|\.sort\s*\(/.test(normalizedCode)) {
    operations.push('Sort the values before returning them');
  }
  if (/groupingby|groupby\s*\(|groupingby\s*\(/.test(normalizedCode)) {
    operations.push('Group values with `groupBy`/`groupingBy`');
  }
  if (/distinct\s*\(|hashset|linkedhashset/.test(normalizedCode)) {
    operations.push('Remove duplicates with `distinct()` or a set');
  }
  if (/groupingby|eachcount|frequency|hashmap|mutablemapof|\.getorput\s*\(/.test(normalizedCode)) {
    operations.push('Track counts or lookups with a map');
  }
  if (/\.tolist\s*\(|collect\(collectors\.tolist\(\)/.test(normalizedCode)) {
    operations.push('Convert the values to a list with `toList()`');
  } else if (/join tostring|jointostring|collect\(collectors\.joining/.test(normalizedCode)) {
    operations.push('Join the values into the final string');
  }

  if (operations.length > 0) {
    return ['Input data', ...operations, 'Print Result'];
  }

  if (normalizedLabel.includes('stream')) {
    return ['Input data', 'Create a stream', 'Apply the collection operations', 'Collect the result', 'Print Result'];
  }

  if (normalizedLabel.includes('loop')) {
    return ['Input data', 'Visit each input item', `Update ${state} when needed`, 'Print Result'];
  }

  if (normalizedLabel.includes('alternative')) {
    return ['Input data', `Apply the ${state} operation`, 'Build the intermediate result', 'Print Result'];
  }

  return ['Input data', 'Scan the input', 'Track counts or seen values', 'Filter the result', 'Print Result'];
};

export const getSolutionComplexity = (problem: Problem, code: string): SolutionComplexity => {
  const normalized = code.toLowerCase();
  const loopCount = (normalized.match(/\b(for|while)\b/g) ?? []).length;
  const hasSort = /\b(sort|sorted|sorteddescending|sortedby|collections\.sort)\b/.test(normalized.replace(/\s+/g, ''))
    || /\.sort(?:ed|by|descending)?\s*\(/.test(normalized);
  const hasNestedLoop = loopCount >= 2 && /(for|while)[\s\S]{0,500}(for|while)/.test(normalized);
  const hasRecursion = /\b(?:fun|public\s+static)[\s\S]*\b\w+\s*\([^)]*\)[\s\S]*\b\w+\s*\(/.test(normalized) && /return[\s\S]*\b(?:dfs|bfs|traverse|factorial|fibonacci)\b/.test(normalized);
  const allocatesCollection = /(mutablelistof|mutablemapof|hashmap|hashset|arraylist|listof|setof|stringbuilder|chararray|intarray|collect\(|tolist\(|groupingby)/.test(normalized);

  const time = hasNestedLoop
    ? 'O(n^2)'
    : hasSort
      ? 'O(n log n)'
      : hasRecursion
        ? 'O(n)'
        : problem.timeComplexity ?? 'O(n)';
  const space = hasRecursion
    ? 'O(n)'
    : allocatesCollection || /\.reversed\(\)|\.split\(/.test(normalized)
      ? 'O(n)'
      : 'O(1)';

  return { time, space };
};

export const getProblemById = (id: number): Problem | undefined => problems.find((problem) => problem.id === id);
export const getQuestionsByLevel = (level: number): Problem[] => problems.filter((problem) => problem.level === level);
export const getQuestionIndexByTopic = (topic: ProblemTopic): TopicIndexEntry[] => topicIndex[topic] ?? [];
export const getQuestionsByTopic = (topic: ProblemTopic): Problem[] => {
  const indexedIds = new Set(getQuestionIndexByTopic(topic).map((entry) => entry.id));
  return problems.filter((problem) => indexedIds.has(problem.id));
};
export async function loadQuestionsByTopic(topic: ProblemTopic): Promise<Problem[]> {
  const entries = await loadTopicIndex(topic);
  const problemsById = new Map(problems.map((problem) => [problem.id, problem]));
  return entries
    .map((entry) => problemsById.get(entry.id))
    .filter((problem): problem is Problem => Boolean(problem));
}

export { loadTopicIndex };
export { loadProblemSolutions } from './question-solution-loader';
