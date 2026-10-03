export type SyntaxReferenceLanguage = 'kotlin' | 'java';

export interface SyntaxReferenceRow {
  useCase: string;
  syntax: string;
  example: string;
}

export interface SyntaxReferenceConcept {
  id: string;
  title: string;
  note?: Record<SyntaxReferenceLanguage, string>;
  rows: Record<SyntaxReferenceLanguage, SyntaxReferenceRow[]>;
}

export interface SyntaxReferenceSection {
  id: string;
  title: string;
  concepts: SyntaxReferenceConcept[];
}

export const syntaxReference: SyntaxReferenceSection[] = [
  {
    id: 'data-access',
    title: 'Core data access',
    concepts: [
      {
        id: 'length-and-size',
        title: 'Find length or size',
        note: {
          kotlin: 'Kotlin String.length and array/collection size are properties, so they do not use parentheses.',
          java: 'Java String.length() and collection size() are methods; array length is a field.',
        },
        rows: {
          kotlin: [
            { useCase: 'String', syntax: '.length', example: 'input.length' },
            { useCase: 'Array', syntax: '.size', example: 'numbers.size' },
            { useCase: 'List, Set, or Map', syntax: '.size', example: 'items.size' },
          ],
          java: [
            { useCase: 'String', syntax: '.length()', example: 'input.length()' },
            { useCase: 'Array', syntax: '.length', example: 'numbers.length' },
            { useCase: 'List, Set, or Map', syntax: '.size()', example: 'items.size()' },
          ],
        },
      },
      {
        id: 'index-items',
        title: 'Get an item by index',
        rows: {
          kotlin: [
            { useCase: 'String character', syntax: 'value[index]', example: 'input[0]' },
            { useCase: 'Array or List item', syntax: 'items[index]', example: 'numbers[0]' },
          ],
          java: [
            { useCase: 'String character', syntax: 'value.charAt(index)', example: 'input.charAt(0)' },
            { useCase: 'Array or List item', syntax: 'items[index]', example: 'numbers[0]' },
          ],
        },
      },
      {
        id: 'subranges',
        title: 'Get a subrange',
        rows: {
          kotlin: [
            { useCase: 'String range', syntax: 'value.substring(start, end)', example: 'input.substring(0, 3)' },
            { useCase: 'List range', syntax: 'items.subList(start, end)', example: 'items.subList(0, 3)' },
            { useCase: 'Array range', syntax: 'items.copyOfRange(start, end)', example: 'numbers.copyOfRange(0, 3)' },
          ],
          java: [
            { useCase: 'String range', syntax: 'value.substring(start, end)', example: 'input.substring(0, 3)' },
            { useCase: 'List range', syntax: 'items.subList(start, end)', example: 'items.subList(0, 3)' },
            { useCase: 'Array range', syntax: 'Arrays.copyOfRange(items, start, end)', example: 'Arrays.copyOfRange(numbers, 0, 3)' },
          ],
        },
      },
    ],
  },
  {
    id: 'iteration',
    title: 'Iteration',
    concepts: [
      {
        id: 'range-loop',
        title: 'Loop over a range',
        rows: {
          kotlin: [{ useCase: 'Inclusive range', syntax: 'for (i in start..end)', example: 'for (i in 0..4) { println(i) }' }],
          java: [{ useCase: 'Inclusive range', syntax: 'for (int i = start; i <= end; i++)', example: 'for (int i = 0; i <= 4; i++) { System.out.println(i); }' }],
        },
      },
      {
        id: 'for-each-loop',
        title: 'Visit every item',
        rows: {
          kotlin: [{ useCase: 'Array or collection', syntax: 'for (item in items)', example: 'for (item in names) { println(item) }' }],
          java: [{ useCase: 'Array or Iterable', syntax: 'for (Type item : items)', example: 'for (String item : names) { System.out.println(item); }' }],
        },
      },
      {
        id: 'indexed-loop',
        title: 'Visit index and item',
        rows: {
          kotlin: [{ useCase: 'Collection with index', syntax: 'items.withIndex()', example: 'for ((index, item) in names.withIndex()) { println("$index: $item") }' }],
          java: [{ useCase: 'Indexed collection loop', syntax: 'items.get(index)', example: 'for (int i = 0; i < names.size(); i++) { System.out.println(i + ": " + names.get(i)); }' }],
        },
      },
      {
        id: 'map-entries',
        title: 'Visit map entries',
        rows: {
          kotlin: [{ useCase: 'Key and value', syntax: 'for ((key, value) in map)', example: 'for ((key, value) in scores) { println("$key: $value") }' }],
          java: [{ useCase: 'Key and value', syntax: 'map.entrySet()', example: 'for (var entry : scores.entrySet()) { System.out.println(entry.getKey() + ": " + entry.getValue()); }' }],
        },
      },
    ],
  },
  {
    id: 'collections',
    title: 'Collections',
    concepts: [
      {
        id: 'create-collections',
        title: 'Create collections',
        rows: {
          kotlin: [
            { useCase: 'Read-only List', syntax: 'listOf(values)', example: 'val names = listOf("Ada", "Lin")' },
            { useCase: 'Mutable List', syntax: 'mutableListOf(values)', example: 'val names = mutableListOf("Ada", "Lin")' },
            { useCase: 'Set or Map', syntax: 'setOf(...) / mapOf(...)', example: 'val scores = mapOf("Ada" to 95)' },
          ],
          java: [
            { useCase: 'Unmodifiable List', syntax: 'List.of(values)', example: 'var names = List.of("Ada", "Lin");' },
            { useCase: 'Mutable List', syntax: 'new ArrayList<>(values)', example: 'var names = new ArrayList<>(List.of("Ada", "Lin"));' },
            { useCase: 'Set or Map', syntax: 'Set.of(...) / Map.of(...)', example: 'var scores = Map.of("Ada", 95);' },
          ],
        },
      },
      {
        id: 'add-remove',
        title: 'Add or remove an item',
        rows: {
          kotlin: [
            { useCase: 'Add to mutable collection', syntax: 'items.add(value)', example: 'names.add("Sam")' },
            { useCase: 'Remove from collection', syntax: 'items.remove(value)', example: 'names.remove("Lin")' },
          ],
          java: [
            { useCase: 'Add to collection', syntax: 'items.add(value)', example: 'names.add("Sam");' },
            { useCase: 'Remove from collection', syntax: 'items.remove(value)', example: 'names.remove("Lin");' },
          ],
        },
      },
      {
        id: 'membership',
        title: 'Check whether a value exists',
        rows: {
          kotlin: [
            { useCase: 'List or Set value', syntax: 'value in items', example: '"Ada" in names' },
            { useCase: 'Map key', syntax: 'key in map', example: '"Ada" in scores' },
          ],
          java: [
            { useCase: 'List or Set value', syntax: 'items.contains(value)', example: 'names.contains("Ada")' },
            { useCase: 'Map key', syntax: 'map.containsKey(key)', example: 'scores.containsKey("Ada")' },
          ],
        },
      },
      {
        id: 'map-lookup',
        title: 'Read or update a map value',
        rows: {
          kotlin: [
            { useCase: 'Read value', syntax: 'map[key]', example: 'scores["Ada"]' },
            { useCase: 'Update mutable map', syntax: 'map[key] = value', example: 'scores["Ada"] = 98' },
          ],
          java: [
            { useCase: 'Read value', syntax: 'map.get(key)', example: 'scores.get("Ada")' },
            { useCase: 'Update map', syntax: 'map.put(key, value)', example: 'scores.put("Ada", 98);' },
          ],
        },
      },
      {
        id: 'transform-collections',
        title: 'Filter, map, or sort',
        rows: {
          kotlin: [
            { useCase: 'Filter values', syntax: 'items.filter { predicate }', example: 'numbers.filter { it > 0 }' },
            { useCase: 'Transform values', syntax: 'items.map { transform }', example: 'numbers.map { it * 2 }' },
            { useCase: 'Sort values', syntax: 'items.sorted()', example: 'numbers.sorted()' },
          ],
          java: [
            { useCase: 'Filter values', syntax: 'items.stream().filter(predicate).toList()', example: 'numbers.stream().filter(n -> n > 0).toList()' },
            { useCase: 'Transform values', syntax: 'items.stream().map(transform).toList()', example: 'numbers.stream().map(n -> n * 2).toList()' },
            { useCase: 'Sort values', syntax: 'items.stream().sorted().toList()', example: 'numbers.stream().sorted().toList()' },
          ],
        },
      },
      {
        id: 'list-creation',
        title: 'Lists: Create read-only and mutable lists',
        note: {
          kotlin: 'List is read-only through its interface, but listOf() does not guarantee a deeply immutable object.',
          java: 'List.of() creates an unmodifiable list; ArrayList is mutable.',
        },
        rows: {
          kotlin: [
            { useCase: 'Read-only List', syntax: 'listOf(values)', example: 'val names = listOf("Ada", "Lin")' },
            { useCase: 'Mutable List', syntax: 'mutableListOf(values)', example: 'val names = mutableListOf("Ada", "Lin")' },
            { useCase: 'Empty mutable List', syntax: 'mutableListOf<T>()', example: 'val names = mutableListOf<String>()' },
          ],
          java: [
            { useCase: 'Unmodifiable List', syntax: 'List.of(values)', example: 'var names = List.of("Ada", "Lin");' },
            { useCase: 'Mutable List', syntax: 'new ArrayList<>(values)', example: 'var names = new ArrayList<>(List.of("Ada", "Lin"));' },
            { useCase: 'Empty mutable List', syntax: 'new ArrayList<>()', example: 'List<String> names = new ArrayList<>();' },
          ],
        },
      },
      {
        id: 'list-access',
        title: 'Lists: Read and update items',
        rows: {
          kotlin: [
            { useCase: 'Read by index', syntax: 'list[index]', example: 'names[0]' },
            { useCase: 'Read safely by index', syntax: 'list.getOrNull(index)', example: 'names.getOrNull(5)' },
            { useCase: 'Replace at index', syntax: 'list[index] = value', example: 'names[0] = "Sam"' },
          ],
          java: [
            { useCase: 'Read by index', syntax: 'list.get(index)', example: 'names.get(0)' },
            { useCase: 'Read safely by index', syntax: 'index < list.size() ? list.get(index) : null', example: 'int i = 5; String name = i < names.size() ? names.get(i) : null;' },
            { useCase: 'Replace at index', syntax: 'list.set(index, value)', example: 'names.set(0, "Sam");' },
          ],
        },
      },
      {
        id: 'list-search',
        title: 'Lists: Find items',
        rows: {
          kotlin: [
            { useCase: 'Check for a value', syntax: 'value in list', example: '"Ada" in names' },
            { useCase: 'Find first matching item', syntax: 'list.firstOrNull { predicate }', example: 'names.firstOrNull { it.startsWith("A") }' },
            { useCase: 'Find value index', syntax: 'list.indexOf(value)', example: 'names.indexOf("Ada")' },
          ],
          java: [
            { useCase: 'Check for a value', syntax: 'list.contains(value)', example: 'names.contains("Ada")' },
            { useCase: 'Find first matching item', syntax: 'list.stream().filter(predicate).findFirst()', example: 'names.stream().filter(name -> name.startsWith("A")).findFirst()' },
            { useCase: 'Find value index', syntax: 'list.indexOf(value)', example: 'names.indexOf("Ada")' },
          ],
        },
      },
      {
        id: 'list-modify',
        title: 'Lists: Add and remove items',
        rows: {
          kotlin: [
            { useCase: 'Add to end', syntax: 'list.add(value)', example: 'names.add("Sam")' },
            { useCase: 'Insert at index', syntax: 'list.add(index, value)', example: 'names.add(0, "Sam")' },
            { useCase: 'Remove by value', syntax: 'list.remove(value)', example: 'names.remove("Lin")' },
            { useCase: 'Remove and return by index', syntax: 'list.removeAt(index)', example: 'val removed = names.removeAt(0)' },
          ],
          java: [
            { useCase: 'Add to end', syntax: 'list.add(value)', example: 'names.add("Sam");' },
            { useCase: 'Insert at index', syntax: 'list.add(index, value)', example: 'names.add(0, "Sam");' },
            { useCase: 'Remove by value', syntax: 'list.remove(value)', example: 'names.remove("Lin");' },
            { useCase: 'Remove and return by index', syntax: 'list.remove(index)', example: 'String removed = names.remove(0);' },
          ],
        },
      },
      {
        id: 'list-operations',
        title: 'Lists: Transform and join',
        rows: {
          kotlin: [
            { useCase: 'Filter items', syntax: 'list.filter { predicate }', example: 'names.filter { it.length > 3 }' },
            { useCase: 'Transform items', syntax: 'list.map { transform }', example: 'names.map { it.uppercase() }' },
            { useCase: 'Remove duplicates', syntax: 'list.distinct()', example: 'names.distinct()' },
            { useCase: 'Join as text', syntax: 'list.joinToString(separator)', example: 'names.joinToString(", ")' },
          ],
          java: [
            { useCase: 'Filter items', syntax: 'list.stream().filter(predicate).toList()', example: 'names.stream().filter(name -> name.length() > 3).toList()' },
            { useCase: 'Transform items', syntax: 'list.stream().map(transform).toList()', example: 'names.stream().map(String::toUpperCase).toList()' },
            { useCase: 'Remove duplicates', syntax: 'list.stream().distinct().toList()', example: 'names.stream().distinct().toList()' },
            { useCase: 'Join as text', syntax: 'String.join(separator, list)', example: 'String.join(", ", names)' },
          ],
        },
      },
      {
        id: 'set-creation',
        title: 'Sets: Create read-only, mutable, and hash sets',
        note: {
          kotlin: 'setOf() exposes a read-only Set; mutableSetOf() is mutable; hashSetOf() creates a HashSet.',
          java: 'Set.of() is unmodifiable; HashSet is mutable and does not guarantee iteration order.',
        },
        rows: {
          kotlin: [
            { useCase: 'Read-only Set', syntax: 'setOf(values)', example: 'val tags = setOf("kotlin", "java")' },
            { useCase: 'Mutable Set', syntax: 'mutableSetOf(values)', example: 'val tags = mutableSetOf("kotlin", "java")' },
            { useCase: 'HashSet', syntax: 'hashSetOf(values)', example: 'val tags = hashSetOf("kotlin", "java")' },
          ],
          java: [
            { useCase: 'Unmodifiable Set', syntax: 'Set.of(values)', example: 'var tags = Set.of("kotlin", "java");' },
            { useCase: 'Mutable Set', syntax: 'new HashSet<>(values)', example: 'var tags = new HashSet<>(Set.of("kotlin", "java"));' },
            { useCase: 'Empty HashSet', syntax: 'new HashSet<>()', example: 'Set<String> tags = new HashSet<>();' },
          ],
        },
      },
      {
        id: 'set-operations',
        title: 'Sets: Check, add, and remove values',
        rows: {
          kotlin: [
            { useCase: 'Check for a value', syntax: 'value in set', example: '"kotlin" in tags' },
            { useCase: 'Add to mutable Set', syntax: 'set.add(value)', example: 'tags.add("java")' },
            { useCase: 'Remove from mutable Set', syntax: 'set.remove(value)', example: 'tags.remove("java")' },
          ],
          java: [
            { useCase: 'Check for a value', syntax: 'set.contains(value)', example: 'tags.contains("kotlin")' },
            { useCase: 'Add to Set', syntax: 'set.add(value)', example: 'tags.add("java");' },
            { useCase: 'Remove from Set', syntax: 'set.remove(value)', example: 'tags.remove("java");' },
          ],
        },
      },
      {
        id: 'set-algebra',
        title: 'Sets: Combine and compare sets',
        note: {
          kotlin: 'Kotlin union/intersect/subtract return new sets and leave the original sets unchanged.',
          java: 'These Java bulk operations mutate the receiver Set.',
        },
        rows: {
          kotlin: [
            { useCase: 'Union', syntax: 'first union second', example: 'firstTags union secondTags' },
            { useCase: 'Intersection', syntax: 'first intersect second', example: 'firstTags intersect secondTags' },
            { useCase: 'Difference', syntax: 'first subtract second', example: 'firstTags subtract secondTags' },
          ],
          java: [
            { useCase: 'Union into first Set', syntax: 'first.addAll(second)', example: 'firstTags.addAll(secondTags);' },
            { useCase: 'Intersection in first Set', syntax: 'first.retainAll(second)', example: 'firstTags.retainAll(secondTags);' },
            { useCase: 'Difference from first Set', syntax: 'first.removeAll(second)', example: 'firstTags.removeAll(secondTags);' },
          ],
        },
      },
      {
        id: 'map-creation',
        title: 'Maps and HashMaps: Create read-only and mutable maps',
        note: {
          kotlin: 'Map is read-only through its interface; mutableMapOf() and hashMapOf() allow updates.',
          java: 'Map.of() is unmodifiable; HashMap is mutable and does not guarantee iteration order.',
        },
        rows: {
          kotlin: [
            { useCase: 'Read-only Map', syntax: 'mapOf(key to value)', example: 'val scores = mapOf("Ada" to 95)' },
            { useCase: 'Mutable Map', syntax: 'mutableMapOf(key to value)', example: 'val scores = mutableMapOf("Ada" to 95)' },
            { useCase: 'HashMap', syntax: 'hashMapOf(key to value)', example: 'val scores = hashMapOf("Ada" to 95)' },
          ],
          java: [
            { useCase: 'Unmodifiable Map', syntax: 'Map.of(key, value)', example: 'var scores = Map.of("Ada", 95);' },
            { useCase: 'Mutable Map', syntax: 'new HashMap<>(source)', example: 'var scores = new HashMap<>(Map.of("Ada", 95));' },
            { useCase: 'Empty HashMap', syntax: 'new HashMap<>()', example: 'Map<String, Integer> scores = new HashMap<>();' },
          ],
        },
      },
      {
        id: 'map-operations',
        title: 'Maps and HashMaps: Read and update values',
        rows: {
          kotlin: [
            { useCase: 'Read value', syntax: 'map[key]', example: 'scores["Ada"]' },
            { useCase: 'Read with a default', syntax: 'map.getOrDefault(key, default)', example: 'scores.getOrDefault("Lin", 0)' },
            { useCase: 'Insert or replace', syntax: 'map[key] = value', example: 'scores["Ada"] = 98' },
            { useCase: 'Get or create value', syntax: 'map.getOrPut(key) { default }', example: 'scores.getOrPut("Lin") { 0 }' },
          ],
          java: [
            { useCase: 'Read value', syntax: 'map.get(key)', example: 'scores.get("Ada")' },
            { useCase: 'Read with a default', syntax: 'map.getOrDefault(key, default)', example: 'scores.getOrDefault("Lin", 0)' },
            { useCase: 'Insert or replace', syntax: 'map.put(key, value)', example: 'scores.put("Ada", 98);' },
            { useCase: 'Insert only if absent', syntax: 'map.putIfAbsent(key, value)', example: 'scores.putIfAbsent("Lin", 0);' },
          ],
        },
      },
      {
        id: 'map-membership',
        title: 'Maps and HashMaps: Check keys and values',
        rows: {
          kotlin: [
            { useCase: 'Check for a key', syntax: 'key in map', example: '"Ada" in scores' },
            { useCase: 'Check for a value', syntax: 'value in map.values', example: '95 in scores.values' },
          ],
          java: [
            { useCase: 'Check for a key', syntax: 'map.containsKey(key)', example: 'scores.containsKey("Ada")' },
            { useCase: 'Check for a value', syntax: 'map.containsValue(value)', example: 'scores.containsValue(95)' },
          ],
        },
      },
      {
        id: 'map-removal',
        title: 'Maps and HashMaps: Remove entries',
        rows: {
          kotlin: [
            { useCase: 'Remove by key', syntax: 'map.remove(key)', example: 'scores.remove("Ada")' },
            { useCase: 'Remove matching key and value', syntax: 'map.remove(key, value)', example: 'scores.remove("Ada", 95)' },
          ],
          java: [
            { useCase: 'Remove by key', syntax: 'map.remove(key)', example: 'scores.remove("Ada");' },
            { useCase: 'Remove matching key and value', syntax: 'map.remove(key, value)', example: 'scores.remove("Ada", 95);' },
          ],
        },
      },
      {
        id: 'map-views',
        title: 'Maps and HashMaps: Get keys, values, and entries',
        rows: {
          kotlin: [
            { useCase: 'Keys', syntax: 'map.keys', example: 'scores.keys' },
            { useCase: 'Values', syntax: 'map.values', example: 'scores.values' },
            { useCase: 'Key-value entries', syntax: 'map.entries', example: 'scores.entries' },
          ],
          java: [
            { useCase: 'Keys', syntax: 'map.keySet()', example: 'scores.keySet()' },
            { useCase: 'Values', syntax: 'map.values()', example: 'scores.values()' },
            { useCase: 'Key-value entries', syntax: 'map.entrySet()', example: 'scores.entrySet()' },
          ],
        },
      },
      {
        id: 'collection-status',
        title: 'Collections: Check empty state and clear',
        note: {
          kotlin: 'clear() is available on mutable collections only.',
          java: 'clear() mutates the collection and may throw UnsupportedOperationException on unmodifiable collections.',
        },
        rows: {
          kotlin: [
            { useCase: 'Check empty', syntax: 'items.isEmpty()', example: 'names.isEmpty()' },
            { useCase: 'Check not empty', syntax: 'items.isNotEmpty()', example: 'names.isNotEmpty()' },
            { useCase: 'Clear mutable collection', syntax: 'items.clear()', example: 'names.clear()' },
          ],
          java: [
            { useCase: 'Check empty', syntax: 'items.isEmpty()', example: 'names.isEmpty()' },
            { useCase: 'Check not empty', syntax: '!items.isEmpty()', example: '!names.isEmpty()' },
            { useCase: 'Clear mutable collection', syntax: 'items.clear()', example: 'names.clear();' },
          ],
        },
      },
    ],
  },
  {
    id: 'everyday-syntax',
    title: 'Everyday syntax',
    concepts: [
      {
        id: 'variables',
        title: 'Declare a variable',
        rows: {
          kotlin: [
            { useCase: 'Read-only reference', syntax: 'val name = value', example: 'val name = "Ada"' },
            { useCase: 'Reassignable reference', syntax: 'var count = value', example: 'var count = 0' },
          ],
          java: [
            { useCase: 'Read-only reference', syntax: 'final Type name = value', example: 'final String name = "Ada";' },
            { useCase: 'Reassignable variable', syntax: 'Type name = value', example: 'int count = 0;' },
          ],
        },
      },
      {
        id: 'conditions',
        title: 'Choose with a condition',
        rows: {
          kotlin: [{ useCase: 'If / else', syntax: 'if (condition) { ... } else { ... }', example: 'if (score >= 60) { result = "Pass" } else { result = "Retry" }' }],
          java: [{ useCase: 'If / else', syntax: 'if (condition) { ... } else { ... }', example: 'if (score >= 60) { result = "Pass"; } else { result = "Retry"; }' }],
        },
      },
      {
        id: 'functions',
        title: 'Declare a function or method',
        rows: {
          kotlin: [{ useCase: 'Return a value', syntax: 'fun name(arg: Type): Type', example: 'fun add(a: Int, b: Int): Int = a + b' }],
          java: [{ useCase: 'Return a value', syntax: 'static Type name(Type arg)', example: 'static int add(int a, int b) { return a + b; }' }],
        },
      },
      {
        id: 'null-handling',
        title: 'Handle a possibly missing value',
        rows: {
          kotlin: [
            { useCase: 'Safe call', syntax: 'value?.property', example: 'name?.length' },
            { useCase: 'Fallback value', syntax: 'value ?: fallback', example: 'name ?: "Guest"' },
          ],
          java: [
            { useCase: 'Null check', syntax: 'value != null', example: 'if (name != null) { name.length(); }' },
            { useCase: 'Fallback value', syntax: 'value != null ? value : fallback', example: 'name != null ? name : "Guest"' },
          ],
        },
      },
      {
        id: 'conversions',
        title: 'Convert common types',
        rows: {
          kotlin: [
            { useCase: 'String to Int', syntax: 'value.toInt()', example: '"42".toInt()' },
            { useCase: 'Number to String', syntax: 'value.toString()', example: '42.toString()' },
          ],
          java: [
            { useCase: 'String to Int', syntax: 'Integer.parseInt(value)', example: 'Integer.parseInt("42")' },
            { useCase: 'Number to String', syntax: 'String.valueOf(value)', example: 'String.valueOf(42)' },
          ],
        },
      },
    ],
  },
  {
    id: 'strings',
    title: 'Strings',
    concepts: [
      {
        id: 'string-length',
        title: 'Find string length',
        note: {
          kotlin: 'String.length is a property, so it does not use parentheses.',
          java: 'String.length() is a method, so it uses parentheses.',
        },
        rows: {
          kotlin: [{ useCase: 'Character count', syntax: 'text.length', example: 'input.length' }],
          java: [{ useCase: 'Character count', syntax: 'text.length()', example: 'input.length()' }],
        },
      },
      {
        id: 'string-case',
        title: 'Change letter case',
        note: {
          kotlin: 'String operations return a new String; the original is unchanged.',
          java: 'String operations return a new String; Locale.ROOT avoids locale-specific case changes.',
        },
        rows: {
          kotlin: [
            { useCase: 'Lowercase', syntax: 'text.lowercase()', example: '"HELLO".lowercase()' },
            { useCase: 'Uppercase', syntax: 'text.uppercase()', example: '"hello".uppercase()' },
          ],
          java: [
            { useCase: 'Lowercase', syntax: 'text.toLowerCase(Locale.ROOT)', example: '"HELLO".toLowerCase(Locale.ROOT)' },
            { useCase: 'Uppercase', syntax: 'text.toUpperCase(Locale.ROOT)', example: '"hello".toUpperCase(Locale.ROOT)' },
          ],
        },
      },
      {
        id: 'string-equality',
        title: 'Compare string contents',
        note: {
          kotlin: 'Kotlin == compares String content.',
          java: 'Use equals() to compare String content; Java == compares object references.',
        },
        rows: {
          kotlin: [{ useCase: 'Equal content', syntax: 'first == second', example: '"cat" == "cat"' }],
          java: [{ useCase: 'Equal content', syntax: 'first.equals(second)', example: '"cat".equals("cat")' }],
        },
      },
      {
        id: 'string-search',
        title: 'Search within a string',
        rows: {
          kotlin: [
            { useCase: 'Contains text', syntax: 'text.contains(part)', example: '"revision".contains("vis")' },
            { useCase: 'Starts with', syntax: 'text.startsWith(prefix)', example: '"revision".startsWith("re")' },
            { useCase: 'Ends with', syntax: 'text.endsWith(suffix)', example: '"revision".endsWith("ion")' },
          ],
          java: [
            { useCase: 'Contains text', syntax: 'text.contains(part)', example: '"revision".contains("vis")' },
            { useCase: 'Starts with', syntax: 'text.startsWith(prefix)', example: '"revision".startsWith("re")' },
            { useCase: 'Ends with', syntax: 'text.endsWith(suffix)', example: '"revision".endsWith("ion")' },
          ],
        },
      },
      {
        id: 'string-trim',
        title: 'Remove surrounding whitespace',
        rows: {
          kotlin: [
            { useCase: 'Both ends', syntax: 'text.trim()', example: '"  hello  ".trim()' },
            { useCase: 'Leading whitespace', syntax: 'text.trimStart()', example: '"  hello  ".trimStart()' },
            { useCase: 'Trailing whitespace', syntax: 'text.trimEnd()', example: '"  hello  ".trimEnd()' },
          ],
          java: [
            { useCase: 'Both ends', syntax: 'text.strip()', example: '"  hello  ".strip()' },
            { useCase: 'Leading whitespace', syntax: 'text.stripLeading()', example: '"  hello  ".stripLeading()' },
            { useCase: 'Trailing whitespace', syntax: 'text.stripTrailing()', example: '"  hello  ".stripTrailing()' },
          ],
        },
      },
      {
        id: 'string-replace',
        title: 'Replace text',
        rows: {
          kotlin: [{ useCase: 'Replace literal text', syntax: 'text.replace(old, new)', example: '"red fox".replace("red", "blue")' }],
          java: [{ useCase: 'Replace literal text', syntax: 'text.replace(target, replacement)', example: '"red fox".replace("red", "blue")' }],
        },
      },
      {
        id: 'string-split',
        title: 'Split into parts',
        rows: {
          kotlin: [{ useCase: 'Split by delimiter', syntax: 'text.split(delimiter)', example: '"red,blue".split(",")' }],
          java: [{ useCase: 'Split by regex', syntax: 'text.split(regex)', example: '"red,blue".split(",")' }],
        },
      },
      {
        id: 'string-character',
        title: 'Get a character by index',
        rows: {
          kotlin: [{ useCase: 'Character at index', syntax: 'text[index]', example: '"hello"[0]' }],
          java: [{ useCase: 'Character at index', syntax: 'text.charAt(index)', example: '"hello".charAt(0)' }],
        },
      },
      {
        id: 'string-substring',
        title: 'Get part of a string',
        rows: {
          kotlin: [{ useCase: 'Start inclusive, end exclusive', syntax: 'text.substring(start, end)', example: '"hello".substring(1, 4)' }],
          java: [{ useCase: 'Start inclusive, end exclusive', syntax: 'text.substring(start, end)', example: '"hello".substring(1, 4)' }],
        },
      },
      {
        id: 'string-empty-blank',
        title: 'Check whether a string is empty or blank',
        note: {
          kotlin: 'isBlank() is true for an empty string or one containing only whitespace.',
          java: 'isBlank() is available in Java 11 and later.',
        },
        rows: {
          kotlin: [
            { useCase: 'Empty', syntax: 'text.isEmpty()', example: '"".isEmpty()' },
            { useCase: 'Empty or whitespace', syntax: 'text.isBlank()', example: '"  ".isBlank()' },
          ],
          java: [
            { useCase: 'Empty', syntax: 'text.isEmpty()', example: '"".isEmpty()' },
            { useCase: 'Empty or whitespace', syntax: 'text.isBlank()', example: '"  ".isBlank()' },
          ],
        },
      },
      {
        id: 'string-reverse',
        title: 'Reverse a string',
        rows: {
          kotlin: [{ useCase: 'Return reversed text', syntax: 'text.reversed()', example: '"hello".reversed()' }],
          java: [{ useCase: 'Return reversed text', syntax: 'StringBuilder(text).reverse()', example: 'new StringBuilder("hello").reverse().toString()' }],
        },
      },
      {
        id: 'string-concatenate',
        title: 'Join strings together',
        rows: {
          kotlin: [
            { useCase: 'Interpolate values', syntax: '"$first $second"', example: '"$firstName $lastName"' },
            { useCase: 'Concatenate', syntax: 'first + second', example: '"Hello, " + name' },
          ],
          java: [
            { useCase: 'Concatenate', syntax: 'first + second', example: 'firstName + " " + lastName' },
            { useCase: 'Join with delimiter', syntax: 'String.join(delimiter, values)', example: 'String.join(", ", names)' },
          ],
        },
      },
    ],
  },
];

const syntaxReturnTypes: Record<string, Record<SyntaxReferenceLanguage, string[]>> = {
  'length-and-size': { kotlin: ['Int', 'Int', 'Int'], java: ['int', 'int', 'int'] },
  'index-items': { kotlin: ['Char', 'T'], java: ['char', 'T'] },
  subranges: { kotlin: ['String', 'List<T>', 'Array<T>'], java: ['String', 'List<T>', 'T[]'] },
  'range-loop': { kotlin: ['No value (loop)'], java: ['No value (loop)'] },
  'for-each-loop': { kotlin: ['No value (loop)'], java: ['No value (loop)'] },
  'indexed-loop': { kotlin: ['Iterable<IndexedValue<T>>'], java: ['T'] },
  'map-entries': { kotlin: ['No value (loop)'], java: ['Set<Map.Entry<K, V>>'] },
  'create-collections': {
    kotlin: ['List<T>', 'MutableList<T>', 'Set<T> / Map<K, V>'],
    java: ['List<T>', 'ArrayList<T>', 'Set<T> / Map<K, V>'],
  },
  'add-remove': { kotlin: ['Boolean', 'Boolean'], java: ['boolean', 'boolean'] },
  membership: { kotlin: ['Boolean', 'Boolean'], java: ['boolean', 'boolean'] },
  'map-lookup': { kotlin: ['V?', 'Unit (assignment)'], java: ['V', 'V (previous value)'] },
  'transform-collections': {
    kotlin: ['List<T>', 'List<R>', 'List<T>'],
    java: ['List<T>', 'List<R>', 'List<T>'],
  },
  'list-creation': {
    kotlin: ['List<T>', 'MutableList<T>', 'MutableList<T>'],
    java: ['List<T>', 'ArrayList<T>', 'ArrayList<T>'],
  },
  'list-access': {
    kotlin: ['T', 'T?', 'Unit (assignment)'],
    java: ['T', 'T?', 'T (previous value)'],
  },
  'list-search': {
    kotlin: ['Boolean', 'T?', 'Int'],
    java: ['boolean', 'Optional<T>', 'int'],
  },
  'list-modify': {
    kotlin: ['Boolean', 'Unit', 'Boolean', 'T'],
    java: ['boolean', 'void', 'boolean', 'T'],
  },
  'list-operations': {
    kotlin: ['List<T>', 'List<R>', 'List<T>', 'String'],
    java: ['List<T>', 'List<R>', 'List<T>', 'String'],
  },
  'set-creation': {
    kotlin: ['Set<T>', 'MutableSet<T>', 'HashSet<T>'],
    java: ['Set<T>', 'HashSet<T>', 'HashSet<T>'],
  },
  'set-operations': {
    kotlin: ['Boolean', 'Boolean', 'Boolean'],
    java: ['boolean', 'boolean', 'boolean'],
  },
  'set-algebra': {
    kotlin: ['Set<T>', 'Set<T>', 'Set<T>'],
    java: ['boolean', 'boolean', 'boolean'],
  },
  'map-creation': {
    kotlin: ['Map<K, V>', 'MutableMap<K, V>', 'HashMap<K, V>'],
    java: ['Map<K, V>', 'HashMap<K, V>', 'HashMap<K, V>'],
  },
  'map-operations': {
    kotlin: ['V?', 'V', 'Unit (assignment)', 'V'],
    java: ['V', 'V', 'V (previous value)', 'V (previous value)'],
  },
  'map-membership': {
    kotlin: ['Boolean', 'Boolean'],
    java: ['boolean', 'boolean'],
  },
  'map-removal': {
    kotlin: ['V?', 'Boolean'],
    java: ['V', 'boolean'],
  },
  'map-views': {
    kotlin: ['Set<K>', 'Collection<V>', 'Set<Map.Entry<K, V>>'],
    java: ['Set<K>', 'Collection<V>', 'Set<Map.Entry<K, V>>'],
  },
  'collection-status': {
    kotlin: ['Boolean', 'Boolean', 'Unit'],
    java: ['boolean', 'boolean', 'void'],
  },
  variables: { kotlin: ['String', 'Int'], java: ['String', 'int'] },
  conditions: { kotlin: ['No value (statement)'], java: ['No value (statement)'] },
  functions: { kotlin: ['Int'], java: ['int'] },
  'null-handling': { kotlin: ['Int?', 'String'], java: ['No value (statement)', 'String'] },
  conversions: { kotlin: ['Int', 'String'], java: ['int', 'String'] },
  'string-length': { kotlin: ['Int'], java: ['int'] },
  'string-case': { kotlin: ['String', 'String'], java: ['String', 'String'] },
  'string-equality': { kotlin: ['Boolean'], java: ['boolean'] },
  'string-search': { kotlin: ['Boolean', 'Boolean', 'Boolean'], java: ['boolean', 'boolean', 'boolean'] },
  'string-trim': { kotlin: ['String', 'String', 'String'], java: ['String', 'String', 'String'] },
  'string-replace': { kotlin: ['String'], java: ['String'] },
  'string-split': { kotlin: ['List<String>'], java: ['String[]'] },
  'string-character': { kotlin: ['Char'], java: ['char'] },
  'string-substring': { kotlin: ['String'], java: ['String'] },
  'string-empty-blank': { kotlin: ['Boolean', 'Boolean'], java: ['boolean', 'boolean'] },
  'string-reverse': { kotlin: ['String'], java: ['String'] },
  'string-concatenate': { kotlin: ['String', 'String'], java: ['String', 'String'] },
};

export function getSyntaxReturnType(conceptId: string, rowIndex: number, language: SyntaxReferenceLanguage) {
  return syntaxReturnTypes[conceptId]?.[language][rowIndex] ?? 'Not specified';
}