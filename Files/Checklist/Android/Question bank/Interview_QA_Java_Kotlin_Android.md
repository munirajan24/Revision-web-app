# Interview Questions & Answers – Java, Kotlin & Android

> Answers come from your source file wherever it has them. Entries marked **✦ Added answer** were not answered in your file; they are supplementary, so please review them.


## Java

### J001. What is OOPs?

Answer:

   1. Object-Oriented Programming is a methodology to design a program using classes and objects. It simplifies software development and maintenance by providing some concepts:
      * Inheritance
      * Polymorphism
      * Abstraction
      * Encapsulation

### J002. What is class?

Answer:

   1.  A class is a template or blueprint from which objects are created.
   2. A class will contain some member variables and member functions
      * It represents the set of properties or methods that are common to all objects of one type.

### J003. What is Object?

Answer:

   1.  It is a basic unit of Object-Oriented Programming and represents the real life entities.
   2. We can say that classes are user defined data types and objects are variables of that type.
   3. The object class refers to a class created to group various objects which are instances of that class.

### J004. What is Inheritance and types?

Answer:

   1.  Inheritance in Java is a mechanism in which one object acquires all the properties and behaviors of a parent object. It is an important part of OOPs.
   2. **(Alternative explanation):** Inheritance is a method through which one class inherits the properties from its parent class

      **Note: Multiple inheritance is not supported in Java through class.**

### J005. What is Polymorphism and types?

Answer:

    1. Polymorphism is a concept by which **we can perform a single action in different ways**.
       * Method Overloading (compile-time/static)
       * Method Overriding (run-time/dynamic)
    2. **Method Overloading**: Method overloading refers to the process of creation of methods with the same name but with different parameters.
    3.  **Method Overriding:** When the child class has the method which has the same name, same parameters and same return type as a method in its parent class(or super-class), then the child method has overridden the parent class method.

### J006. What is Abstraction?

Answer:

    1. Abstraction is the **process of hiding certain details and showing only essential information** to the user.
       Or
    2. Abstraction is the concept of **hiding the implementation details** and **showing** only the **necessary features of an object.**
    3. Abstraction can be achieved with either **abstract** classes or **interfaces**

### J007. What is Encapsulation?

Answer:

    1. Encapsulation in Java is a **process of wrapping fields and methods inside a single unit**.
    2. It is a way to achieve **data hiding.**
    3. It can be done by access modifiers like **private, public and protected**.

### J008. What are literals and identifiers in java?

Answer:

    1. Literals are syntactic representations of boolean, character, numeric, or string data. Literals provide a means of expressing specific values in our program.
    2. Identifiers are the names of variables, methods, classes, packages and interfaces.

### J009. What is constructor?

Answer:

    1. Constructors are **special member functions** that are responsible for **initializing an instance of a class**.
    2. Constructors are called **when you create a new object** of the class.

### J010. What is singleton class?

Answer:

    1. \*Writing one instance and accessing the same instance to the whole application.

| public static Singleton getInstance() {    if (single\_instance \== null)        single\_instance \= new Singleton();    return single\_instance; } |
| :---- |

### J011. JRE vs JDK?

Answer:

   1. **JDK(Java Development Kit) is used to develop Java applications**. JDK also contains numerous development tools like compilers, debuggers, etc. JRE(Java Runtime Environment) is the implementation of JVM(Java Virtual Machine) and it is specially designed to execute Java programs.

### J012. Can you compile with JRE?

Answer:

   1. **No you can't develop java programs only with JRE**. You will need JDK for compiling our programs. JRE provides only runtime environment,but JDK is something you will need to compile our code to make it executable by our JRE. You will need javac for compiling our code which is present in JDK.
   2. If you have a compiled Java application (.class files or a Java Archive .jar file), you can run it using the JRE without needing the JDK.

### J013. What is thread?

Answer:

    1. Thread is a lightweight process that can run concurrently with other threads within the same process.

### J014. What is thread lifecycle?

Answer:

    1. **New**: The thread is in the new state if it has been **created but has not yet started**. In this state, the thread has not yet been associated with a processor.

    2. **Runnable**: When a thread is in the runnable state, it is ready to run, but it has not been selected by the thread scheduler to run. In other words, **the thread is waiting for a processor**.

    3. **Running**: When the thread scheduler selects a thread from the runnable pool and assigns a processor to it, the thread enters the running state. In this state, **the thread is actively executing its code.**

    4. **Blocked or Waiting**: Whenever a thread is **inactive for a span of time (not permanently)** then, either the thread is in the blocked state or is in the waiting state.

    5. **Terminated**: When a thread has **completed** its task or has been **terminated** by an exception, it enters the terminated state. Once a thread is in this state, it cannot be restarted.

    6. It's important to note that a thread can move back and forth between the runnable and blocked states, depending on the availability of resources. Additionally, a thread can be suspended or resumed using methods such as sleep(), wait(), and notify().

### J015. Tell me about java collections?

Answer:

    1. [Interview Questions tables.xlsx](https://docs.google.com/spreadsheets/d/1RA_WMm__wgo40siLDjZX0XocHAJA9z_G/edit?usp=sharing&ouid=113168893825646304938&rtpof=true&sd=true)\- Collections excel sheet
       * \- \- \- \- \- \- \- \- implements
       * \_\_\_\_\_\_\_\_\_ extends

|  |
| :---- |

    2. **Collection**: The **Collection** interface is the root interface of the collections hierarchy. It defines the basic operations and behaviors that all collections should have, such as adding, removing, and querying elements. Subinterfaces of **Collection** include **List**, **Set**, and **Queue**.
       * **List**: The **List** interface extends **Collection** and represents an ordered collection of elements with duplicate values allowed. Implementations of **List** include **ArrayList**, **LinkedList**, and **Vector**.
       * **Set**: The **Set** interface extends **Collection** and represents a collection of unique elements with no duplicates. Implementations of **Set** include **HashSet**, **LinkedHashSet**, and **TreeSet**.
       * **Queue**: The **Queue** interface extends **Collection** and represents a collection that follows the First-In-First-Out (FIFO) order. Implementations of **Queue** include **LinkedList**, **PriorityQueue**, and **ArrayDeque**.

    3. **Map**: The **Map** interface represents a mapping between keys and values. It allows you to store and retrieve values based on a unique key. Implementations of **Map** include **HashMap**, **LinkedHashMap**, and **TreeMap**.
       * SortedMap: The **SortedMap** interface extends **Map** and represents a map that maintains its keys in a sorted order. Implementations of **SortedMap** include **TreeMap**.
       * NavigableMap: The **NavigableMap** interface extends **SortedMap** and provides additional navigation methods. Implementations of **NavigableMap** include **TreeMap**.
    4. **Deque**: The **Deque** interface extends **Queue** and represents a double-ended queue. It allows elements to be added or removed from both ends. Implementations of **Deque** include **ArrayDeque** and **LinkedList**.

### J016. Map vs set vs hashtable difference?

Answer:

    1. All are all collections used to store and retrieve data.

    2. A Map is a collection of key-value pairs.
    3. A Set is a collection that contains unique elements.
    4. A Hashtable is a **legacy** implementation of a Map, which maps keys to values. Hashtable is a concrete implementation of the Map interface.
       ***Null***
    5. A null value can be used as a **key** but can only be used **once** in the Map.
    6. A null value can be added to a Set, but can only be added **once**.
    7.  null **cannot** be used in HashTable.
       ***Duplicate***
    8. Duplicate values are allowed in a Map, but duplicate keys are not allowed.
    9. Not allowed in set.
    10. Duplicate keys and values are **not allowed** in a Hashtable.

### J017. Map vs HashMap vs LinkedHashMap vs TreeMap?

Answer:

    1. Map is a collection interface, while HashMap and TreeMap are specific implementations of the Map interface.
    2. LinkedHashMap is a subclass of HashMap. That means it inherits the features of HashMap. In addition, the linked list preserves the insertion-order.

    3. HashMap does not maintain insertion order.
    4. Map maintains insertion order.
    5. LinkedHashMap maintains the insertion order.
    6. TreeMap maintains ascending order.

    7. The map does not allow a single null key or value.
    8. HashMap can store multiple null values along with a single null key.
    9. TreeMap allows null values only, not null keys.

### J018. List, Set, and Vector Difference?

Answer:

    1. If you need an **ordered** collection that **allows duplicates**, use a **List**.
       * **Operations: get(index), set(index, element), add(index, element), remove(index), indexOf(element)**
    2. If you need an **unordered** collection that does **not allow duplicates**, use a **Set**.
       * **Operations: add(element), remove(element), contains(element),size()**
       * **Implementations:** HashSet, LinkedHashSet, TreeSet.
    3. If you need a **synchronized, thread-safe list implementation**, use a **Vector**.

### J019. What is vector?

Answer:

    1. A Vector is a **synchronized, thread-safe implementation** of the **List** interface that is similar to an **ArrayList**, but with some differences in behavior.
    2. It supports all of the operations of the List interface, and also provides synchronized access to its elements.
    3. Multiple threads can access a Vector object safely.

### J020. HashSet vs TreeSet?

Answer:

    1. HashSet allows a null
    2. TreeSet does not allow null.
    3.

### J021. Types of Complexity in java?

Answer:

    1.  There are two main types of complexity.
       * Time complexity
       * Space complexity.
    2. **Time Complexity:** This refers to how much **time an algorithm takes to execute,** **based on the size of the input**.
    3. It is usually expressed using big **O notation**, which describes the **worst-case performance** of an algorithm.
    4. Common time complexity classes include ***O(1), O(log n), O(n), O(n log n), O(n^2), O(2^n), and O(n\!)***.

    5. **Space Complexity:** This refers to how much **memory an algorithm requires to execute, based on the size of the input.**
    6. It is also usually expressed using big O notation.
    7. Common space complexity classes include O(1), O(n), O(n^2), and O(2^n).

### J022. What is time complexity?

Answer:

    [https\://dev.to/christinamcmahon/runtime-analysis-big-o-notation-906](https://dev.to/christinamcmahon/runtime-analysis-big-o-notation-906)

    1. This refers to how much **time an algorithm takes to execute,** **based on the size of the input**.
    2. It is usually expressed using big **O notation**, which describes the **worst-case performance** of an algorithm.

       *Some common time complexity classes in Java include:*

    3. **O(1):** **Constant** time complexity:
       * where the running time of the algorithm remains the same, regardless of the input size.
       * Examples of constant time operations would be assigning a value to a variable, **inserting an element into an array**, or **retrieving a value from a hash table with a key**.

         **int n \= 1000**

    4. **O(log n): Logarithmic** time complexity:
       *  where the running time of the algorithm increases logarithmically with the input size.
       * Logarithmic time grows slower as the input grows.
       *

         **for (int i \= 0; i \< n; i \*= 2) {**

            ***// some constant time operation***

         **}**

    5. **O(n):** **Linear** time complexity:
       *  where the running time of the algorithm increases linearly with the input size.
       * A common example is a **loop with a constant time operation inside**. Other examples could be **finding an item in an unsorted collection** or **sorting an array with bubble sort**.

         **for (int i \=0; i \< n; i++) {**
            ***// some constant time operation***
         **}**

    6. **O(n^2):Quadratic** time complexity, where the running time of the algorithm increases with the square of the input size.

       **for (int i \= 0; i \< n; i++) {**

          **for (int j \= 0; j \< n; j++) {**

              ***// some constant time operation***

          **}**

       **}**

    7. **O(2^n)**: **Exponential** time complexity, where the running time of the algorithm increases exponentially with the input size.

    8. **O(n Log n) \- Linearithmic** Time complexity: Linearithmic algorithms are good with a very large data set. Examples would be **quick sort, merge sort, and heap sort**. In the following example, note that the first loop is linear and the nested loop is logarithmic.
    9.

       **for (int i \= 0; i \< n; i++ )**

          **for (int j \= 1; j \< n; j \*= 2) {**

              ***// some constant time operation***

          **}**

       **}**

       *Here are the time complexities of some common operations in Java data structures:*

       * Array access: O(1)
       * Array search: O(n)
       * LinkedList add/remove at beginning: O(1)
       * LinkedList add/remove at end: O(1) if tail pointer is maintained, O(n) otherwise
       * LinkedList search: O(n)
       * HashSet/HashMap add/search/remove: O(1) on average, O(n) in worst case
       * TreeSet/TreeMap add/search/remove: O(log n)
       * Priority Queue add/remove: O(log n) for both
       * ArrayList add/remove at end: O(1) if capacity is available, O(n) otherwise
       * ArrayList add/remove at beginning/middle: O(n)
       * Binary search: O(log n)
       * QuickSort: O(n log n) on average, O(n^2) in worst case
       * MergeSort: O(n log n) on average and in worst case
       * BubbleSort/SelectionSort/InsertionSort: O(n^2)

[](https://www.bigocheatsheet.com/img/big-o-cheat-sheet-poster.png)

### J023. Sorting methods in Java?

Answer:

    1. In Java, sorting is generally performed using a modified version of the quicksort algorithm called "**dual-pivot quicksort**" for primitive types(Array.sort()) and "**TimSort**" for objects(Collection.sort()).
    2. The performance of the sorting methods can vary depending on the type and size of the data being sorted.
    3. Here are some commonly used sorting methods in Java:
    4. Arrays.sort():
       * This method is used to sort arrays of primitive types or objects in ascending order.
       * Example: **int\[\] numbers \= {5, 2, 8, 1, 9}; Arrays.*sort*(numbers);**

    5. Arrays.parallelSort():
       * Introduced in Java 8, this method performs a parallel sort on arrays, utilizing multiple threads for improved performance.
       * Example: **int\[\] numbers \= {5, 2, 8, 1, 9}; Arrays.*parallelSort*(numbers);**
    6. Collections.sort():
       * This method is used to sort collections (such as ArrayList, LinkedList, etc.) in ascending order.
       * Example: **List\<Integer\> numbers \= new ArrayList\<\>(Arrays.*asList*(5, 2, 8, 1, 9)); 	 Collections.*sort*(numbers);**
       *
    7. Collections.sort() with Comparator:
       * In addition to sorting in natural order, you can use a custom Comparator to specify a different sorting order.
       * Example: **List\<String\> names \= new ArrayList\<\>(Arrays.*asList*("John", "Alice", "Bob")); Collections.*sort*(names, Comparator.*reverseOrder*());**
    8. Arrays.sort() and Collections.sort() with custom Comparator:
       * You can use a custom Comparator to define a specific sorting order for arrays and collections.
       * Example:

         **String\[\] names \= {"John", "Alice", "Bob"};**

         **Arrays.*sort*(names, (a, b) \-\> b.compareTo(a));**

### J024. Sorting algorithms?

Answer:

    1. Common Sorting Algorithms
       * Bubble Sort : Swapping \- Stable✅
       * Quick Sort : Swapping \- non stable❌
       * Selection Sort : Swapping \- non stable❌
       * Heap Sort : Swapping \- non stable❌

       * Insertion Sort : Shifting \- Stable✅
       * Merge Sort : Allocation of extra memory and data copy \- Stable✅

       * Timsort
       *

       * Counting Sort
       * Radix Sort \- Stable✅
       * Bucket Sort
       * Tree Sort
       *
    2. Explanations:

       * Bubble Sort:⭐
         1. Bubble Sort **repeatedly swaps adjacent elements** if they are in the wrong order until the entire array is sorted.
         2. Time Complexity: O(n^2) in the worst and average case, O(n) in the best case (when the array is already sorted).
         3. Space Complexity: O(1).
       * Insertion Sort:⭐
         1. Insertion Sort builds the final sorted array one element at a time by inserting each element into its correct position within the sorted portion of the array.
         2. It's faster than bubble, merge, quick, heap sort when already sorted(best case).
         3. Time Complexity: O(n^2) in the worst and average case, O(n) in the best case (when the array is already sorted).
         4. Space Complexity: O(1).
       * Merge Sort:⭐⭐⭐
         1. Merge Sort is a **divide-and-conquer algorithm** that recursively divides the array into two halves, sorts them independently, and then merges them back together.
         2. Compared to Quick sort, merge sort is a good choice for sorting **large arrays**.
         3. Time Complexity: O(n log n) in all cases.
         4. Space Complexity: O(n) due to the need for temporary arrays during the merging process.
       * Quick Sort: ⭐⭐⭐
         1. Quick Sort is another **divide-and-conquer algorithm** that selects a **pivot element** and partitions the array into **two sub-arrays**, one with elements smaller than the pivot and the other with elements larger than the pivot.
         2. It then recursively applies the **same process to the sub-arrays**.
         3. Compared to merge sort, quick sort is a good choice for sorting **small arrays**.
         4. Time Complexity: O(n^2) in the worst case, O(n log n) in the average and best case.
         5. Space Complexity: O(log n) due to the recursive calls on the stack, but it can be O(n) in the worst case if the partitioning is unbalanced.
       * Heap Sort:⭐
         1. Heap Sort uses a **binary heap data structure** to sort elements. It builds a max-heap (or min-heap) from the array and repeatedly extracts the maximum (or minimum) element, resulting in a sorted array.
         2. Time Complexity: O(n log n) in all cases.
         3. Space Complexity: O(1).
       * Timsort: ⭐⭐⭐
         1. Timsort is a **hybrid** algorithm that combines the best features of **quicksort and merge sort**.
         2. It is generally considered to be the **fastest** sorting algorithm for many real-world inputs.
         3. Time complexity: O(n log n) in the average case and O(n log n) in the worst case.
         4. Space Complexity: O(n).
       * Dual-pivot quicksort:⭐⭐⭐
         1. Dual-pivot quicksort is a sorting algorithm that is a **variant of the quicksort algorithm**.
         2. It works by choosing **two pivots**, one at the **beginning** of the array and one at the **end** of the array.
         3. Time Complexity: O(n^2) in the worst case, O(n log n) in the average and best case.
         4. Space Complexity: O(log n) (average and best cases), O(n) (worst case)
       * Selection Sort:
         1. Selection Sort **divides** the array into **sorted and unsorted portions**, and in each iteration, it selects the smallest element from the unsorted portion and places it in the correct position in the sorted portion.
         2. Time Complexity: O(n^2) in all cases.
         3. Space Complexity: O(1).
       *
    3. Notes:
       * For small input data, a simple algorithm like insertion sort can work best.
       * However, for larger data sets, more efficient algorithms like quicksort, merge sort, or heapsort are the best choices.

### J025. What is Stream in java?

Answer:

    1. The Stream interface represents a **sequence of elements** that can be **processed in a pipeline**. It is part of the **java.util.stream package**.
    2. We can create a stream from various data sources like **collections, arrays**, or other sources using **stream()** or **of()** methods.

| *// From a List* List\<Integer\> numbers \= List.*of*(1, 2, 3, 4, 5); Stream\<Integer\> streamFromList \= numbers.stream(); |
| :---- |

### J026. What are the operations in stream in Java?

Answer:

    1. **Intermediate Operations:**
    2. Intermediate operations are operations that can be applied to a stream **to transform, filter, or modify its elements.**
    3. These operations are lazily evaluated, which means they **do not execute until a terminal operation is called.**

       **Example:**
    1. **filter(Predicate\<T\> predicate)**: Filters elements based on a condition.
    2. **map(Function\<T, R\> mapper)**: Transforms each element to another object using a function.
    3. **distinct()**: Removes duplicate elements from the stream.
    4. **sorted():** Sorts the stream elements in natural order.
    5. **limit(long maxSize):** Truncates the stream to a specified size.
    6. **skip(long n):** Skips the first n elements from the stream.
    7. **forEach  :** to perform an action on each element of a collection in a concise and expressive way.

| List\<String\> names \= new ArrayList\<\>(); names.add("Alice"); names.add("Bob"); names.add("Charlie"); *// Using forEach to print each element* names.forEach(name \-\> System.*out*.println(name)); |
| :---- |

    8. **Terminal Operations:**
    9. Terminal operations are operations that **trigger the processing of the stream** and **produce a result**.
    10. Once a terminal operation is called, the stream **cannot be reused**.

        **Example:**
    11. **forEach(Consumer\<T\> action):** Performs an action for each element in the stream.
    12. **collect(Collector\<T, A, R\> collector):** Accumulates elements into a collection or a summary result.
    13. **count():** Returns the number of elements in the stream.
    14. **anyMatch(Predicate\<T\> predicate):** Checks if any element satisfies a given condition.
    15. **allMatch(Predicate\<T\> predicate):** Checks if all elements satisfy a given condition.
    16. **noneMatch(Predicate\<T\> predicate):** Checks if no element satisfies a given condition.
    17. **min(Comparator\<T\> comparator):** Finds the minimum element based on a comparator.
    18. **max(Comparator\<T\> comparator)**: Finds the maximum element based on a comparator.

    19. **Short-Circuiting Operations:**
    20. Some terminal operations are short-circuiting, meaning they **may not process all elements** in the stream **if the result can be determined early**.

        **Example:**
    21. **findAny():** Returns any element from the stream.
    22. **findFirst()**: Returns the first element in the stream.
    23. **anyMatch(Predicate\<T\> predicate)**: Stops processing when any element matches the condition.

### J027. Difference between flatMap and map?

Answer:

    1. *FlatMap()* is used to **combine** **all the items of lists into *one list***.
    2. *Map()* is used to **transform a list based on *certain conditions***.
    3. *flatMap()* is more useful for flattening **one-to-many** mappings.
    4. *map()* is usually useful for **one-to-one** mappings.
    5. **One line answer: flatMap helps to flatten a Collection\<Collection\<T\>\> into a Collection\<T\>**.
    6. [https\://stackoverflow.com/questions/26684562/whats-the-difference-between-map-and-flatmap-methods-in-java-8](https://stackoverflow.com/questions/26684562/whats-the-difference-between-map-and-flatmap-methods-in-java-8)

### J028. What are generics in Java?

Answer:

    1. **Generics means unspecified type.**
    2. Generics allow the **creation of classes and functions that operate on types specified at runtime**. They enhance code reusability and flexibility.
    3. Generics allow us to create classes, interfaces, and methods that can work with different types while providing type safety at compile time.
    4. They **reduce the need for explicit type casting.**
    5. To use generics, we can specify a type parameter in **angle brackets (\<\>)** when defining a class, interface, or method.
    6. They enable you to create **reusable code** that can **operate on a variety of data types** without the need for casting.

### J029. Why do we use generics in Java?

Answer:

    1. Generics provide **compile-time type safety**
       **(or)**
    1. This helps in **preventing type mismatch errors** **at compile time** rather than at runtime.
    2. They also help in creating **reusable code**.
    3. reduces the need for **explicit type casting**.

### J030. What is a type parameter?

Answer:

    1. A type parameter is a **placeholder** for a **specific type** that is specified when using a generic class, interface, or method.
    2. It **represents the type** that will be used in place of the type parameter.

### J031. How do you define a generic class in Java?

Answer:

    1. A generic class in Java is defined by specifying the type parameter in angle brackets after the class name. For example, class MyClass\<T\> { ... } represents a generic class with a type parameter T.

### J032. What is a bounded type parameter?

Answer:

    1. A bounded type parameter in generics allows us to restrict the types that can be used as type arguments. We can specify upper bounds (extends) or lower bounds (super) for the type parameter.

### J033. What is the difference between upper bounded and lower bounded wildcards?

Answer:

    1. An upper bounded wildcard (\<? extends T\>) allows any type that is a subtype of T or T itself. A lower bounded wildcard (\<? super T\>) allows any type that is a supertype of T or T itself.

### J034. How can you restrict the types that can be used as type arguments in generics?

Answer:

    1. We can use bounded type parameters or wildcards to restrict the types that can be used as type arguments. Bounded type parameters specify an upper or lower bound, while wildcards provide more flexibility in accepting different types.

### J035. What is type erasure in Java generics?

Answer:

    1. Type erasure is a process where the type parameters used in generic code are replaced with their upper bounds or erased to their raw types during compilation. This is done to maintain backward compatibility with older Java code that does not support generics.

### J036. How does the diamond operator (<>) improve code readability in Java generics?

Answer:

    1. The diamond operator (\<\>) is used to infer the type arguments of a generic class or method based on the context, eliminating the need to explicitly specify the type arguments. It improves code readability by reducing verbosity.

### J037. What is the difference between <? extends T> and <? super T> wildcards?

Answer:

    1. \<? extends T\> represents an upper bounded wildcard, allowing any subtype of T or T itself. \<? super T\> represents a lower bounded wildcard, allowing any supertype of T or T itself.

### J038. How do you create a generic interface in Java?

Answer:

    1. A generic interface is created by declaring the type parameter(s) in the interface definition, similar to a generic class. For example, interface MyInterface\<T\> { ... } represents a generic interface with a type parameter T.

### J039. Can you use primitives as type arguments in generics?

Answer:

    1. No, primitives (such as int, char, etc.) cannot be used as type arguments in generics directly. Instead, we can use their corresponding wrapper classes (e.g., Integer, Character) as type arguments.

### J040. How does the Comparable interface relate to generics?

Answer:

    1. The Comparable interface is a generic interface that allows objects of a class to define their natural ordering. It is commonly used in sorting algorithms and collections that require elements to be comparable.

### J041. Tell me about major updates in Java 8 features?

Answer:

    1. It was released in March 2014\.
       * Lambda Expressions
       * Method References
       * Functional Interfaces
       * Stream API
       * Date and Time API
       * Default Methods
       * Optional Class
       * Parallel Array Sorting \- Arrays.parallelSort()

### J042. What is Lambda Expression in java?

Answer:

    1. **Lambda Expression**: Lambda expression allows us to write more concise and expressive code **for** **functional interfaces**. They enable the use of functional programming paradigms in Java.

### J043. What is Method Reference in java?

Answer:

    1. **Method References**: Method references provide a **shorthand notation for lambda expressions** when invoking a method that matches the lambda's signature.

| Without Lambda(Java 1.7):  List\<String\> names \= Arrays.*asList*("John", "Alice", "Bob", "Eve"); *// Before Java 1.8, you need to use an anonymous Comparator implementation* names.sort(new Comparator\<String\>() {    @Override    public int compare(String name1, String name2) {        return name1.compareTo(name2);    } }); *// Print the sorted list* System.*out*.println(names); |
| :---- |
| **With Lambda(Java 1.8): List\<String\> names \= Arrays.*asList*("John", "Alice", "Bob", "Eve"); *// With Lambda expression, it's much more concise* names.sort((name1, name2) \-\> name1.compareTo(name2)); *// Print the sorted list* System.*out*.println(names);**   |
| **With method reference (Java 1.8):  List\<String\> names \= Arrays.*asList*("John", "Alice", "Bob", "Eve"); *// With method reference* names.sort(String::compareTo);   *// Print the sorted list* System.*out*.println(names);**  |

### J044. What is Stream API?

Answer:

    1. The Stream API provides a way to process collections of data in a **functional style**. It allows us to perform various operations on data streams such as filtering, mapping, and reducing.

|        List\<Integer\> numbers \= Arrays.*asList*(1, 2, 3, 4, 5); *// Use Stream API to filter even numbers and calculate their sum*        int sumOfEvens \= numbers.stream()                .filter(num \-\> num % 2 \== 0)                .mapToInt(Integer::intValue)                .sum();        System.*out*.println("Sum of even numbers: " \+ sumOfEvens); |
| :---- |

### J045. Tell me about the Date and Time API?

Answer:

    1. Java 1.8 introduced the **java.time** package, which provides a new Date and Time API that is more flexible, comprehensive, and easier to use than the **old java.util.Date and java.util.Calendar classes.**

| import java.time.LocalDate; import java.time.LocalTime; import java.time.LocalDateTime; import java.time.format.DateTimeFormatter; public class Main {    public static void main(String\[\] args) {        *// Current date*        LocalDate currentDate \= LocalDate.*now*();        System.*out*.println("Current Date: " \+ currentDate);        *// Current time*        LocalTime currentTime \= LocalTime.*now*();        System.*out*.println("Current Time: " \+ currentTime);        *// Current date and time*        LocalDateTime currentDateTime \= LocalDateTime.*now*();        System.*out*.println("Current Date and Time: " \+ currentDateTime);        *// Formatting date and time*        DateTimeFormatter formatter \= DateTimeFormatter.*ofPattern*("yyyy-MM-dd HH:mm:ss");        String formattedDateTime \= currentDateTime.format(formatter);        System.*out*.println("Formatted Date and Time: " \+ formattedDateTime);    } }  |
| :---- |

### J046. What is Default Method?

Answer:

    1. **Default Methods:** Default methods allow you **to add new methods to interfaces without breaking the classes that implement them**.
    2. This feature was introduced to support backward compatibility in existing interfaces.

| interface Vehicle {    void start();    default void honk() {        System.*out*.println("Honking the horn\!");    } } class Car implements Vehicle {    @Override    public void start() {        System.*out*.println("Car starting...");    } } public class Main {    public static void main(String\[\] args) {        Car car \= new Car();        car.start();        car.honk(); *// Default method from the interface*    } } |
| :---- |

### J047. What is Functional Interface?

Answer:

    1. **Functional Interfaces**: functional interfaces are interfaces with **exactly one abstract method**. Functional interfaces are **used with lambda expressions and method references**. The **@FunctionalInterface** annotation is used to indicate that an interface is a functional interface.

| @FunctionalInterface interface MyFunction {    void doSomething(); } public class Main {    public static void main(String\[\] args) {        MyFunction func \= () \-\> System.*out*.println("Doing something");        func.doSomething(); *// Output: Doing something*    } } |
| :---- |

### J048. What is Optional Class?

Answer:

    1. **Optional Class**:
       * The Optional class is used to represent optional values **that may or may not be present.**
       * It helps **to avoid null pointer exceptions** and makes code more robust.

| String name \= null; *// Create an Optional from a possibly null value* Optional\<String\> optionalName \= Optional.*ofNullable*(name); *// Check if the value is present before using it* if (optionalName.isPresent()) {    System.*out*.println("Name: " \+ optionalName.get()); } else {    System.*out*.println("Name not available."); } |
| :---- |

### J049. What is Parallel Array Sorting?

Answer:

    1. **Parallel Array Sorting**: The new **Arrays.parallelSort()** method was added to the java.util.Arrays class, allowing for parallel sorting of arrays, taking advantage of multi-core processors.

### J050. Features of Java 9?

Answer:

    1. **Flow** **API** \- equivalent to **RxJava** (RxJava observer and Observable deprecated in Java 9\)
    2. Modules
    3. private methods in interface etc.

### J051. Features of Java 10?

Answer:

    1. Released in March 2018\.
    2. Local Variable Type Inference: This version introduced the **var** keyword for local variable type inference.
    3. Improved Garbage Collection: Introduced a new Garbage Collector called G1 (Garbage-First) as the default garbage collector.

### J052. Features of Java 11?

Answer:

    1. Local value syntax for lambda parameters.
    2. HTTP Client: A new, standard HTTP client API was introduced, providing a more modern and flexible way to interact with HTTP resources.
    3. Launch Single-File Source-Code Programs: Developers can now run Java source files directly without compiling them into a class file.

### J053. Features of Java 12?

Answer:

> ✦ **Added answer**

- **Switch expressions** (preview): `case X ->` arrow form that returns a value.
- **Compact Number Formatting** (`NumberFormat.getCompactNumberInstance`) – e.g. 1K, 1M.
- **`Collectors.teeing()`** – runs two collectors on a stream and merges the results.
- **New String methods**: `indent()`, `transform()`.
- **`Files.mismatch()`** – finds the first differing byte of two files.
- **Shenandoah GC** (experimental), G1 GC improvements, default CDS archive for faster startup.

### J054. Features of Java 14?

Answer:

    1. **Switch expression**
       * Switch expressions provide a more concise and powerful syntax for switch statements.
       * This is almost equivalent to **when** expression **in kotlin.** It does not contains **case** and instead of **default** keyword, **else** is used
       * Feature	Java 14	Java 15	Java 17
       * Availability	Preview	Permanent	Permanent
       * Can return values  \-		No		Yes

| int dayOfWeek \= 3; String dayName \= switch (dayOfWeek) {    case 1 \-\> "Sunday";    case 2 \-\> "Monday";    case 3 \-\> "Tuesday";    case 4 \-\> "Wednesday";    case 5 \-\> "Thursday";    case 6 \-\> "Friday";    case 7 \-\> "Saturday";    default \-\> throw new IllegalArgumentException("Invalid day of week"); }; System.*out*.println(dayName); *// Output: Tuesday* |
| :---- |

    2. **record**:
       * That provides a concise way to define classes whose main purpose is to store data.
       * They automatically generate accessor methods, equals(), hashCode(), and toString() methods, making it easier to work with data classes.
       * This is equivalent to **data** class **in kotlin.**

| record Person(String name, int age) {        *// Constructor, accessor methods, equals(), hashCode(), and toString() are generated automatically*        } *// Usage of records*        Person person \= new Person("John", 30); |
| :---- |

### J055. Features of Java 15?

Answer:

    1. Sealed Classes(preview in java 15, released in java 17\)
       * Sealed classes allow you to define a class hierarchy in a more restricted way, specifying which **subclasses can extend a given class**. This feature is useful for creating closed class hierarchies, enhancing code robustness and maintainability.

### J056. Features of Java 17?

Answer:

> ✦ **Added answer**

Java 17 is an **LTS** release. It finalised many earlier previews:
- **Sealed classes** (`sealed ... permits ...`) – restrict which classes can extend a type.
- **Records** (since 16) – compact immutable data carriers.
- **Pattern matching for `instanceof`** (since 16).
- **Text blocks** (`""" ... """`) and **switch expressions** (since 14/15).
- **Helpful `NullPointerException` messages** (since 14).
- New `RandomGenerator` API, strong encapsulation of JDK internals, Security Manager deprecated for removal.

### J057. How are variables passed to methods? pass by value or pass by reference?

Answer:

    1. Java uses a "**pass-by-value**" approach, which means that when a method is called, copies of the values of the actual arguments (or variables) are passed to the method's parameters.
    2. When a primitive type variable is passed to a method, a copy of its value is made, and any changes made to the parameter within the method do not affect the original variable outside the method.
    3. When an object reference variable is passed to a method, a copy of the reference is made, but both the original reference and the copy still point to the same object in memory. However, changes made to the object's state within the method are reflected in the original object since both references point to the same object.

### J058. What is the difference between final, finally, and finalize?

Answer:

    1. **final** is a keyword used in Java to declare a **constant value** or a method that **cannot be extended** (in subclass).

    2. **Finally** is used in **try-catch** block in exception handling. The finally block contains code that is **guaranteed to be executed**, regardless of whether an exception is thrown or not. Even if there is a return statement, it will be executed.

    3. **finalize** is a method defined in the **Object** class in Java. starting from **Java 9** it is a **deprecated** method of an Object class. This method is called by the garbage collector for cleanup operations on an object before it is destroyed.

### J059. What is a String pool?

Answer:

    1. string pool, is a specific area of memory in Java where String objects are stored.
    2. It facilitates efficient memory management and string reuse to improve performance and reduce memory overhead.
    3. if an equivalent string already exists in the pool, the existing string reference is returned instead of creating a new object.

### J060. What is reflection?

Answer:

    1. Reflection in Java is a powerful feature that allows you to inspect and **interact** with the structure, behavior, and **metadata** of classes, interfaces, enums, fields, methods, and other program entities at runtime.
    2. It provides a way to inspect and manipulate classes, interfaces, fields, methods, and constructors dynamically, without knowing their names at compile time.

| Class\<?\> clazz \= Class.*forName*("com.example.MyClass"); Object instance \= clazz.newInstance(); |
| :---- |

### J061. How is java platform independent?

Answer:

   1. We can write code on one platform and We can run it on other platforms.
   2. Because Java have **JVM**. It will convert bytecode into the machine language with respect to the platform.

### J062. JVM?

Answer:

   1. It will **convert bytecode into the machine language** with respect to the platform.

### J063. SOLID principle?

Answer:

| Principle | What it means | Android / Kotlin Example |
| :---- | :---- | :---- |
| **Single Responsibility Principle (SRP)** | A class should have only one job, and therefore only one reason to change. **Encapsulation**  | A ViewModel should only manage UI state. It should not make direct Retrofit network calls or parse JSON. |
| **Open/Closed Principle (OCP)** | Classes should be open for extension but closed for modification. **Abstraction & Polymorphism**  | Instead of modifying a DiscountCalculator class with if/else for every new sale, create a DiscountStrategy interface and implement it for new sales. |
| **Liskov Substitution Principle (LSP)** | Subclasses must be substitutable for their base classes without breaking the app. (**Inheritance)** | If Bird has a fly() method, Penguin shouldn't inherit Bird if it just throws an UnsupportedOperationException when forced to fly. |
| **Interface Segregation Principle (ISP)** | Don't force classes to implement interfaces (methods) they don't actually use. (**Abstraction)** | Instead of one massive GestureListener interface with onTap(), onSwipe(), and onPinch(), split them into smaller interfaces so a simple button only implements onTap(). |
| **Dependency Inversion Principle (DIP)** | High-level modules should depend on abstractions (interfaces), not concrete implementations. **Tools : Dagger / Hilt**  | A ViewModel should require an UserRepository interface passed in via constructor (using Hilt/Dagger), rather than instantiating UserRepositoryImpl() directly inside it. |

### J064. Difference between static and singleton?

Answer:

    1. Similarities :
       * Both classes can be **used for holding the global state of an application**.
    2. Difference :
       * If our application requires a single instance of a class that encapsulates some state or resources, the Singleton pattern is more appropriate.
       * Static methods/variables do not enforce a single instance; they are shared across all instances of the class.

| Feature | Singleton Pattern | Static Class |
| :---- | :---- | :---- |
| **Definition** | A design pattern that ensures that **only one instance of a class** exists. | A class that **contains only static members. It isn't associated with instance.**  |
| **Lazy Loading** | Can be lazy loaded when need | static classes are always loaded |
| **Creation** | The instance is created using a private constructor | The instance is created when the class is loaded |
| **Access** | The **instance is accessed using a static method** | The **instance is accessed directly** |
| **Inheritance** | The class can be inherited | The class cannot be inherited |

### J065. What is annotation?

Answer:

    1. An annotation is like a **special note** that we can add to parts of our code, such as **classes, methods, or variables**, to provide **extra information** about them.
    2. These notes act as **metadata** and help the **compiler, runtime environment, or tools** understand and handle the code in a specific manner.
    3. Example : Junit

### J066. What is Garbage collection?

Answer:

    1. Garbage collection is a **process** in computer programming and **memory management**, where the **runtime environment** automatically **identifies and deallocates memory** that is **no longer in use** or **unreachable by the program**.
    2. It is a critical feature of modern programming languages, including Java and C\#, to manage memory effectively and prevent memory leaks.

### J067. What is the difference between processes and threads?

Answer:

    1. **Processes**:
       * Processes are **independent execution environments** that contain their **own memory space, code, and data.**
       * Processes can communicate with each other through shared memory or message passing.
       * Processes are typically used to run large, complex applications that require multiple threads or to isolate different parts of an application from each other.
    2. **Threads**:
       * Thread is a unit of process.
       * A Process can have many threads.
       * Threads are **lightweight processes** that share the same memory space, code, and data as the process they belong to.
       * Threads can run concurrently and communicate with each other through shared variables.
       * Threads are typically **used to run multiple tasks within the same process**, such as handling user input or updating the UI.

### J068. Sleep vs wait vs yield in thread?

Answer:

    1. **Thread.sleep(), Thread.yield()** and **Object.wait()**

    2. **sleep(n) :** The OS doesn’t even try to schedule the sleeping thread until requested time has passed.
       * In human terms, **sleep(n)** says “**I’m done with my timeslice, and please don’t give me another one for at least n milliseconds.**”

    3. **wait() :** As with sleep(), the OS won’t even try to schedule our task unless someone calls notify() (or one of a few other wakeup scenarios occurs).
       * **wait()** says “**I’m done with my timeslice. Don’t give me another timeslice until someone calls notify().**”

    4. **yield()** :The OS is free to immediately give the thread another timeslice, or to give some other thread or process the CPU the yielding thread just gave up.
       * **yield()** says “**I’m done with my timeslice, but I still have work to do.**”
    5. Differences:

|  | Sleep | Wait |
| ----- | ----- | ----- |
| 1 | sleep() method **doesn't release the lock**. | wait() method **releases the lock**. |
| 2 | sleep() is the method of **java.lang.Thread** class. | wait() is the method of **Object** class. |
| 3 | sleep() is the **static** method \- public static void sleep(long millis, int nanos) throws **InterruptedException** { //... } | wait() is the **non-static** method \- public final void wait() throws **InterruptedException** { //...} |
| 4 | after the **specified amount of time**, sleep() is completed. | wait() should be notified by **notify()** or **notifyAll()** methods. |
| 5 | sleep() better **not to call from loop**(i.e. see code below). | wait() method **needs to be called from a loop** in order to deal with false alarm. |
|  | sleep() may be **called from anywhere**. There is no specific requirement. | wait() method **must be** **called from synchronized context** (i.e. synchronized method or block), otherwise it will throw **IllegalMonitorStateException** |

### J069. What is the difference between String vs StringBuffer vs StringBuilder?

Answer:

    1. String is **immutable** in Java. So it’s suitable to use in a multi-threaded environment.
    2. StringBuffer and StringBuilder are **mutable** objects in Java.
    3. They provide append(), insert(), delete(), and substring() methods for String manipulation.
    4.

### J070. ArrayList vs LinkedList?

Answer:

    1. We can select with respect to time complexity.
    2. Arraylist is best for getting by index.
    3. LinkedList is better for add and remove.

| Operation | ArrayList | LinkedList |
| :---- | :---- | :---- |
| **Get by Index** | O(1) | O(n) |
| **Insert at End** | O(1) | O(1) |
| **Insert at Start** | O(n) | O(1) |
| **Insert in Middle** | O(n) | O(n) |
| **Delete at End** | O(1) | O(1) |
| **Delete at Start** | O(n) | O(1) |
| **Delete in Middle** | O(n) | O(n) |
| **Search (contains)** | O(n) | O(n) |
| **Iterating** | O(n) | O(n) |

    4.

| ArrayList | LinkedList |
| :---- | :---- |
| 1\) ArrayList internally uses a **dynamic array** to store the elements. | LinkedList internally uses a **doubly linked list** to store the elements. |
| 2\) ArrayList is **better for storing and accessing** data.**Accessing elements by index** has a constant time **complexity O(1)**, | LinkedList is **better for manipulating** data.**Insertions and deletions** have a constant time **complexity O(1)** |
| 3\) Manipulation with ArrayList is **slow** because it internally uses an array. If any element is removed from the array, all the other elements are shifted in memory. | Manipulation with LinkedList is **faster** than ArrayList because it uses a doubly linked list, so no bit shifting is required in memory. |
| 4\) An ArrayList class can **act as a list** only because it implements List only. | LinkedList class can **act as a list and queue** both because it implements List and Deque interfaces. |
| 5\) The memory location for the elements of an ArrayList is contiguous. | The location for the elements of a linked list is not contagious. |
| 6\) Generally, when an ArrayList is initialized, a default capacity of 10 is assigned to the ArrayList. | There is no case of default capacity in a LinkedList. In LinkedList, an empty list is created when a LinkedList is initialized. |
| 7\) To be precise, an **ArrayList is a resizable array**. | LinkedList implements the **doubly linked list of the list interface.** |

    5.

### J071. Stream vs Collection?

Answer:

> ✦ **Added answer**

| | Collection | Stream |
|---|---|---|
| Purpose | **Stores** data in memory | **Processes** data from a source (pipeline of operations) |
| Storage | Holds elements | Does not store elements |
| Evaluation | Eager | **Lazy** – runs only when a terminal operation is called |
| Reuse | Can be iterated many times | **Consumed once** |
| Iteration | External (`for` loop) | Internal (`forEach`, `map`, `filter`) |
| Parallelism | Manual | Easy with `parallelStream()` |

### J072. Features of Java 21?

Answer:

    1. ⭐**Virtual Threads** (JEP 444): Provide **lightweight threads** for efficient and scalable concurrency, reducing resource consumption and context switching overhead.
       * Almost tried to replace coroutines in kotlin.
    2. ⭐**Pattern Matching for switch** (JEP 441): Enables more concise and expressive switch statements based on patterns rather than just values.
    3. **Record Patterns** (JEP 440): Introduce a new syntax for pattern matching against record instances, enhancing type safety and readability.
    4. **Sequenced Collections** (JEP 431): Offer new interfaces for ordered collections, simplifying operations like accessing the first and last elements.
    5. **Generational ZGC** (JEP 439): A low-pause garbage collector (GC) with improved scalability and performance, especially for applications with diverse heap sizes.
    6. ⭐(Preview only) String Templates \- equivalent to **string interpolation in kotlin and also do processing** like arithmetic operations
       * **STR**: performs the standard interpolation
       * **FMT**: performs interpolation, as well as interprets the format specifiers which appear to the left of embedded expressions
       * **RAW**: is a standard template processor that produces an unprocessed StringTemplate object.

| String name\= "Alex"; String message \= *STR*."Greetings \\{ name }\!"; System.*out*.println(message); |
| :---- |
|        String name \= "Lokesh"; *//STR*        String message \= *STR*."Greetings \\{name}."; *//FMT*        String message \= *STR*."Greetings %-12s\\{name}."; *//RAW*        StringTemplate st \= RAW."Greetings \\{name}.";        String message \= *STR*.process(st);  |

    7.

### J073. Output of equals() with the usual string and String object with the same content?

Answer:

    1. For strings, the equals() method **compares the actual contents** of the strings, **not just their references**.

| String s1 \= "Hello"; String s2 \= new String("Hello"); System.*out*.println(s1.equals(s2)); *// Output: true*✅ |
| :---- |
| //visualization of the memory allocation Heap:     "Hello"       \<-- s1 String Pool:     "Hello"       \<-- s2 |

### J074. Difference between == vs equals()?

Answer:

    1. The \== operator is used to **compare the references** of two objects.
    2. The equals() method **compares the actual contents** of the strings, **not just their references**.

| String s1 \= new String("Hello"); String s2 \= new String("Hello"); System.*out*.println(s1 \== s2); *// Output: false*❌ |
| :---- |
| String s1 \= "Hello"; String s2 \= new String("Hello"); System.*out*.println(s1 \== s2); *// Output: **false*****❌** |
| String s1 \= "Hello"; String s2 \= "Hello"; System.*out*.println(s1 \== s2); *// Output: **true***✅ |

### J075. Can we force garbage collection?

Answer:

    1. We can write code for garbage collection with some code. But It will collect as it requires only. Not immediately.

### J076. Difference between hashcode() and equals() methods used in collections?

Answer:

    1. Whenever two objects are equal, then the hashcode should be equal.
    2. Vise versa is not the same.  When the hashcodes are equal, objects may not be equal.

### J077. When can we use abstract and interface?

Answer:

    1. **Interface:** Use if you want **100% mandatory implementation** in child classes.
    2. **Abstract class:** Use if you want **optional implementation and** want to provide **some default** methods.
       * `abstract` methods → **must** be implemented in the first concrete (non-abstract) subclass.
       * If you don’t want it mandatory → use a **normal method** or **default method** (in interface).

    💡 Just remember: interfaces also allow **default methods** in Java 8+, so not all methods are strictly mandatory anymore.

### J078. Why do we use generics in Java? Or What Are Advantages of Using Generic Types?

Answer:

    1. Generics provide **compile-time type safety**
       **(or)**
    1. This helps in **preventing type mismatch errors** **at compile time** rather than at runtime.
    2. They also help in creating **reusable code**.
    3. reduces the need for **explicit type casting**.

### J079. What is a Generic type parameter?

Answer:

    1. A type parameter is a **placeholder** for a **specific type** that is specified when using a generic class, interface, or method.
    2. It **represents the type** that will be used in place of the type parameter.

### J080. Explain the difference between a generic method and a generic class.

Answer:

    1. A generic method is a method that declares its own type parameters, which can be different from the type parameters of the enclosing class. A generic class, on the other hand, is a class that declares type parameters at the class level, which are then used by its methods and members.

### J081. Which java version are you using? And tell the features?

Answer:

    1. It was released in March 2014\.
       * Lambda Expressions
       * Method References
       * Functional Interfaces
       * Stream API
       * Date and Time API
       * Default Methods
       * Optional Class
       * Parallel Array Sorting \- Arrays.parallelSort()

### J082. Oops concepts?

Answer:

   1. Object-Oriented Programming is a methodology to design a program using classes and objects. It simplifies software development and maintenance by providing some concepts:
      * Inheritance
      * Polymorphism
      * Abstraction
      * Encapsulation

### J083. How can I create a "static "method for enum?

Answer:

> ✦ **Added answer**

Enums can declare `static` methods like any class – put the method inside the enum body:

```java
enum Color {
    RED("r"), GREEN("g");
    private final String code;
    Color(String code) { this.code = code; }

    public static Color fromCode(String code) {
        for (Color c : values()) if (c.code.equals(code)) return c;
        throw new IllegalArgumentException("Unknown code: " + code);
    }
}
```
In Kotlin the equivalent is a `companion object` inside the `enum class`.

### J084. Diff b/w class & objects?

Answer:

**What is class?**

   1.  A class is a template or blueprint from which objects are created.
   2. A class will contain some member variables and member functions
      * It represents the set of properties or methods that are common to all objects of one type.

**What is Object?**

   1.  It is a basic unit of Object-Oriented Programming and represents the real life entities.
   2. We can say that classes are user defined data types and objects are variables of that type.
   3. The object class refers to a class created to group various objects which are instances of that class.

### J085. Threading?

Answer:

**What is thread?**

    1. Thread is a lightweight process that can run concurrently with other threads within the same process.

**What is the thread lifecycle?**

    1. **New**: The thread is in the new state if it has been **created but has not yet started**. In this state, the thread has not yet been associated with a processor.

    2. **Runnable**: When a thread is in the runnable state, it is ready to run, but it has not been selected by the thread scheduler to run. In other words, **the thread is waiting for a processor**.

    3. **Running**: When the thread scheduler selects a thread from the runnable pool and assigns a processor to it, the thread enters the running state. In this state, **the thread is actively executing its code.**

    4. **Blocked or Waiting**: Whenever a thread is **inactive for a span of time (not permanently)** then, either the thread is in the blocked state or is in the waiting state.

    5. **Terminated**: When a thread has **completed** its task or has been **terminated** by an exception, it enters the terminated state. Once a thread is in this state, it cannot be restarted.

    6. It's important to note that a thread can move back and forth between the runnable and blocked states, depending on the availability of resources. Additionally, a thread can be suspended or resumed using methods such as sleep(), wait(), and notify().

### J086. Singleton?

Answer:

    1. \*Writing one instance and accessing the same instance to the whole application.

| public static Singleton getInstance() {    if (single\_instance \== null)        single\_instance \= new Singleton();    return single\_instance; } |
| :---- |

### J087. Abstract class vs interface?

Answer:

    1. **Interface:** Use if you want **100% mandatory implementation** in child classes.
    2. **Abstract class:** Use if you want **optional implementation and** want to provide **some default** methods.
       * `abstract` methods → **must** be implemented in the first concrete (non-abstract) subclass.
       * If you don’t want it mandatory → use a **normal method** or **default method** (in interface).

    💡 Just remember: interfaces also allow **default methods** in Java 8+, so not all methods are strictly mandatory anymore.

### J088. Collection questions like vector or Hashmap?

Answer:

    1. [Interview Questions tables.xlsx](https://docs.google.com/spreadsheets/d/1RA_WMm__wgo40siLDjZX0XocHAJA9z_G/edit?usp=sharing&ouid=113168893825646304938&rtpof=true&sd=true)\- Collections excel sheet
       * \- \- \- \- \- \- \- \- implements
       * \_\_\_\_\_\_\_\_\_ extends

|  |
| :---- |

    2. **Collection**: The **Collection** interface is the root interface of the collections hierarchy. It defines the basic operations and behaviors that all collections should have, such as adding, removing, and querying elements. Subinterfaces of **Collection** include **List**, **Set**, and **Queue**.
       * **List**: The **List** interface extends **Collection** and represents an ordered collection of elements with duplicate values allowed. Implementations of **List** include **ArrayList**, **LinkedList**, and **Vector**.
       * **Set**: The **Set** interface extends **Collection** and represents a collection of unique elements with no duplicates. Implementations of **Set** include **HashSet**, **LinkedHashSet**, and **TreeSet**.
       * **Queue**: The **Queue** interface extends **Collection** and represents a collection that follows the First-In-First-Out (FIFO) order. Implementations of **Queue** include **LinkedList**, **PriorityQueue**, and **ArrayDeque**.

    3. **Map**: The **Map** interface represents a mapping between keys and values. It allows you to store and retrieve values based on a unique key. Implementations of **Map** include **HashMap**, **LinkedHashMap**, and **TreeMap**.
       * SortedMap: The **SortedMap** interface extends **Map** and represents a map that maintains its keys in a sorted order. Implementations of **SortedMap** include **TreeMap**.
       * NavigableMap: The **NavigableMap** interface extends **SortedMap** and provides additional navigation methods. Implementations of **NavigableMap** include **TreeMap**.
    4. **Deque**: The **Deque** interface extends **Queue** and represents a double-ended queue. It allows elements to be added or removed from both ends. Implementations of **Deque** include **ArrayDeque** and **LinkedList**.

### J089. Write code for thread safe singleton in Java?

Answer:

> ✦ **Added answer**

**Double-checked locking (with `volatile`)**
```java
public class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) instance = new Singleton();
            }
        }
        return instance;
    }
}
```
**Bill Pugh (holder) – lazy and thread-safe without `synchronized`**
```java
public class Singleton {
    private Singleton() {}
    private static class Holder { static final Singleton INSTANCE = new Singleton(); }
    public static Singleton getInstance() { return Holder.INSTANCE; }
}
```
**Enum singleton** – `enum Singleton { INSTANCE; }` (also safe against reflection and serialization).

### J090. Write code to reverse any array?

Answer:

> ✦ **Added answer**

```kotlin
fun reverse(a: IntArray) {
    var i = 0; var j = a.size - 1
    while (i < j) { val t = a[i]; a[i] = a[j]; a[j] = t; i++; j-- }
}
// or simply: a.reversedArray()
```
```java
static void reverse(int[] a) {
    for (int i = 0, j = a.length - 1; i < j; i++, j--) { int t = a[i]; a[i] = a[j]; a[j] = t; }
}
```


## Kotlin

### K001. What is Kotlin?

Answer:

   1. Kotlin is a modern, **statically typed**, general purpose programming language that runs on the Java Virtual Machine (JVM).
   2. It **combines object-oriented and functional programming** features. Java has OOP only. (later Java \[1.8\] has functional programming)
   3. It requires **less code** and it’s more efficient.
   4. It’s easy to read and write.

### K002. What is Functional Programming in Java?

Answer:

   1. In Functional programming , the basic unit of computation is a function.
   2. That means, they can be passed as arguments to other functions, returned as values, and stored in data structures.
   3. It avoids mutable data and side effects.
   4. It is based on concepts such as lambda calculus .

### K003. Difference between kotlin and java?

Answer:

   1. Kotlin combines features of both object-oriented and functional programming, whereas Java is limited to object-oriented programming.

      * Null Safety
      * Extension Functions
      * Higher order function
      * Coroutines Support
      * Data classes
      * Smart casts
      * Type inference
      * No checked exceptions
   2. ✍️From java 8, It supports Functional programming. But Java does not truly support functional programming as Kotlin, Python or JavaScript does. However, using lambda expressions, functional interfaces, method references, streams, and the Optional class in Java allows us to imitate the behavior of functional programming.

### K004. Difference between Kotlin and Java on Functional programming?

Answer:

   1. **Kotlin**
      * Kotlin **natively supports** functional programming concepts.
      * Provides a **more concise and expressive syntax** for functional programming.
      * **less boilerplate** code and **improved null safety features**.
      * Kotlin supports higher-order functions, lambda expressions, extension functions, smart casts, and more.
   2. Java
      * require more boilerplate code.
      * Java supports lambda expressions, functional interfaces, method references, streams, and the Optional class.

### K005. For loop changes in kotlin?

Answer:

   1. There are two main types of "for" loops: the **for-in** loop and the **for-each** loop.

| FOR LOOP MEMORY SHORTCUT 1. item in collection 2. i in collection.indices 3. i in start..end 4. i in start until end 5. (index, item) in collection.withIndex() 6. collection.forEach {item \-\>  } 7. collection.forEachIndexed {index, item \-\>  } 8. i step n 9. i downTo n 10. break@label / continue@label |
| :---- |

   2. **For-In Loop:**

| for (variable in rangeOrCollection) {    *// Code to be executed for each iteration* } |
| :---- |

   3. Using for-in loop with a **range of values**:

| for (i in 1..5) {    *println*(i) *// Output: 1, 2, 3, 4, 5* } |
| :---- |

   4. Using for-in loop **with a collection**:

| val fruits \= *listOf*("Apple", "Banana", "Orange")  for (fruit in fruits) {     *println*(fruit) *// Output: Apple, Banana, Orange* } |
| :---- |

   5. Until Keyword: **until**

| for (i in 0 *until* 5) {    *println*(i) *// Output: 0, 1, 2, 3, 4* } |
| :---- |

   6. **ForEach Loop:**

| val numbers \= *listOf*(1, 2, 3, 4, 5) numbers.*forEach* { number \-\>    *println*(number) } |
| :---- |

      **Other advanced features and variations**

   7. For Loop with Index**: withIndex() \- to get position**

      **val fruits \= *listOf*("Apple", "Banana", "Orange")**

      **for ((index, fruit) in fruits.*withIndex*()) {**
         ***println*("Index: \$index, Fruit: \$fruit")**
      **}**

   8. **Indices: \- to get position**

      **for (i in fruits.indices) {**

         **println("Position: \$i \-\> \${fruits\[i\]}")**

      **}**

   9. For Loop with Steps: **step**

      **for (i in 0..10 *step* 2) {**
         ***println*(i) *// Output: 0, 2, 4, 6, 8, 10***
      **}**

   10. DownTo Keyword: **downTo**

       **for (i in 10 *downTo* 0 *step* 2) {**
          ***println*(i) *// Output: 10, 8, 6, 4, 2, 0***
       **}**

   11. Labeled For Loop: **@**
       * This is useful when you have **nested** loops and want to **break or continue** a specific loop.

       **loop@ for (i in 1..3) {**

          **for (j in 1..3) {**

              **if (i \== 2 && j \== 2) {**

                  **break@loop**

              **}**

              ***println*("i: \$i, j: \$j")**

          **}**

       **}**

### K006. What is object keyword?

Answer:

   1. **Singleton Object:**
      * It is used to **declare a singleton object**.
      * A singleton class is a class that can only have one instance. Which can be accessed globally, such as a database connection, retrofit instance or a logger.

      **// singleton Object declaration**

      **object** Singleton{

         **var variableName** \= **"I am Var"**

      }

   2. **Anonymous Object:**
      * It also used to define **anonymous classes and objects**.
      * An object expression **creates** an **instance of an anonymous class**.
      * Anonymous classes are useful for creating **temporary objects,** these are useful for one-time use.
      * Anonymous objects are objects that are created without explicitly declaring a named class.

      ***// Object expression***

      **val myObject \= object : MouseAdapter() {**

         **override fun mouseClicked(e: MouseEvent) {**

             ***// Do something***

         **}**

      **}**

### K007. What is companion object in kotlin?

Answer:

   1. It is used to define **static methods and properties** for the class.
   2.  \*A companion object is a special object which is **bound to the class**. It can be accessed using the name of the enclosing class.
   3. Use companion object when you want to define **static members** (properties and methods) that are **associated with a specific class**.
   4. \*It’s an alternative to static in Java.
   5. It can contain properties and methods.
   6. Some other points:
      * Each class can have **only one** companion object.
      * The members of the companion object can be **accessed using the class name** as the qualifier, similar to calling a static method or property in Java.
      * The companion object **can have a name**, which can be used to access its members from outside the class.
      * The companion object can implement interfaces and inherit from other classes.
      * The members of the companion object can be declared as private, protected, internal, or public, just like class members.
   7. Ex:
      **class** MyClass {
         **companion object** {
             **const val CONSTANT** \= 42

             **fun** myFunction() {
                 *println*(**"This is a function in the companion object"**)
             }
         }
      }

   In other Class:

      **val myConstant** \= MyClass.**CONSTANT**

      MyClass.*myFunction()*

   Some other points 2:

   8. The companion object does not create a shared instance across the application; each class with a companion object has its own separate instance of the companion object.
   9. Definition 2 : It’s used to define members (properties and methods) that are tied to the class itself rather than to instances of the class.
   10. Definition 3 : We can write in any class with companion object and it can be accessed in any other classes.

### K008. What is higher order function?

Answer:

    1. \*Higher order function (Higher level function) is **a function which accepts function as a parameter or returns a function** is called **Higher-Order function**.

| fun higherOrderFunction(operation: (Int, Int) \-\> Int): Int {    return operation(5, 3) } fun main() {    val sum \= *higherOrderFunction* { a, b \-\> a \+ b }    *println*("Sum: \$sum") *// Output: Sum: 8*    val product \= *higherOrderFunction* { a, b \-\> a \* b }    *println*("Product: \$product") *// Output: Product: 15* } |
| :---- |
| fun operationSelector(operationType: String): **(Int, Int) \-\> Int** {    return when (operationType) {        "sum" \-\> **{** a, b **\-\>** a \+ b **}**        "difference" \-\> **{** a, b **\-\>** a \- b **}**        else \-\> **{** \_, \_ **\-\>** 0 **}**    } } fun main() {    val sumFunction \= ***operationSelector*****("sum")**    val result1 \= sumFunction(5, 3) *// result1 \= 8    println*("Sum: \$result1")    val differenceFunction \= ***operationSelector*****("difference")**    val result2 \= differenceFunction(5, 3) *// result2 \= 2    println*("Difference: \$result2") } |

### K009. What is Safe call operator?

Answer:

    1. Kotlin null safety is a procedure to **eliminate the risk of null reference** from the code.
    2. (?.) is the null safety operator. Also called **safe call operator**.
    3. The safe call operator ?. is used to safely **access** properties or call methods **on nullable objects**.
    4. This operator executes only when the reference has a **non-null value**.
    5. If the reference is null, the **expression** using the null safety operator will result in a **null value**.

### K010. What is Elvis operator (?:) Means in Kotlin?

Answer:

    1. The Elvis operator ?: is used **to provide a default value** when dealing with **nullable** types.
    2. It is used for null safety.
    3. **a ?: b** is just shorthand for **if** **(a \!= null) a else b**

### K011. What is Not Null Assertion operator?

Answer:

    1. The Not Null Assertion operator \!\! is used to assert that a nullable type is not null and **convert it to a non-nullable type**.
    2. we use Null checks (\!\!) only when we are confident that the property **can't have a null value.**
    3. It tells the compiler that you are certain the value is not null, and if it happens to be null, a **NullPointerException** will be thrown at runtime.

### K012. What is data class?

Answer:

    1. Using the data class, we can **hold the data** like **POJO Class** in Java.
    2. And it can’t hold any other functionality.
    3. It has some in-built functions such as **equals(), hashCode(), toString(),** and **copy()**, which are automatically generated based on the class properties.
    4. It **reduces the boilerplate code** which needs to be written.
    5. It can be used with **destructuring declarations**, allowing you to easily extract the values of properties into separate variables.

### K013. What is destructuring?

Answer:

    1. Destructuring declaration is a technique that allows you to **extract values** from **data stored in objects and arrays** into separate variables.
    2. It allows you to **declare multiple variables at once**.
    3. [https\://www\.baeldung.com/kotlin/destructuring-declarations](https://www.baeldung.com/kotlin/destructuring-declarations)
       **val** person \= Person(1, "Jon Snow", 20)
       val(id, name, age) \= person //→ Destructuring
       (or)
       val(id, name) \= person	//→ Destructuring
        //ignore the age if it's not needed

       //call
       println(id)     //1
       println(name)   //Jon Snow
       println(age)    //20

       //----- will be compiled as
       **val** id \= person.component1();
       **val** name \= person.component2();
       **val** age \= person.component3();

### K014. What is string interpolation?

Answer:

    1. String interpolation is **variable substitution with its value inside a string**. In Kotlin, we use the \$ character to interpolate a variable and \${} to interpolate an expression.

### K015. Val vs var difference in Kotlin?

Answer:

    1. val is used to declare immutable variables, while var is used to declare mutable variables.
    2. Once a value is assigned to a val, it cannot be reassigned.
    3. var can be reassigned.

### K016. Val vs const difference in Kotlin?

Answer:

    1. val is used to declare an immutable variable
    2. For val, Its **value is determined at runtime** and cannot be changed thereafter.
    3. If we want to declare its value at compile time, we can use const val.

    4. Both are used to declare a variable that cannot be reassigned, once they are initialized.
    5. const is used to declare a **compile-time constant.** Its value is determined at compile-time and cannot be changed at runtime.
    6. const can be used with val only. Not with var.

### K017. When to use the lateinit keyword?

Answer:

    1. The lateinit keyword is used **for the variables, which are initialized later,** before its first access**.**
    2.  It can only be used with **mutable** data types, such as **var**.

       **//Example1: Initializing in a Separate Method:**

       **class MyClass {**
          **private lateinit var someProperty: SomeClass**

          **fun initialize() {**
              ***// Perform complex initialization logic***
              **someProperty \= SomeClass()**
          **}**

          **fun useProperty() {**
              ***// Ensure someProperty is initialized before using it***
              **if (::someProperty.*isInitialized*) {**
                  ***// Access and use someProperty***
                  **someProperty.doSomething()**
              **}**
          **}**
       **}**

**//Example2: Android Views:**

**class MyFragment : Fragment() {**
   **//declared**
   **private lateinit var textView: TextView**

   **override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {**
       **val view \= inflater.inflate(R.layout.fragment\_my, container, false)**
      	 **//initialized**
 **textView \= view.findViewById(R.id.textView)**
       **return view**
   **}**

   **override fun onViewCreated(view: View, savedInstanceState: Bundle?) {**
       **super.onViewCreated(view, savedInstanceState)**
       **//(check .isInitializing when we need it in logic. Here not needed)**
 **textView.text \= "Hello, World\!"**
   **}**
**}**

### K018. How to check if a "lateinit" variable has been initialized?

Answer:

    1. Using the **.isInitialized** property we can check the initialization state of a lateinit variable.
    2. otherwise, a  **LateInitializationException**  will be thrown.

### K019. What is lazy?

Answer:

    1. The object **will be initialized only when it is accessed for the first time** in the application.
    2. It is for efficient memory management.
    3.  lazy will always be used with **val** property.

       **fun** main(args: Array\<String\>) {
          **val** name: String **by** *lazy* **{**
              *println*(**"Initializing name"**)
              **"John"**
          **}**

          **fun** printName() {
              *println*(name)
          }
          printName();
          printName();
       }

       **Output :**
       Initializing name
       John
       John

       **Explanation:** Here, The lambda expression used to initialize the property. That is **only executed when the first time the property is accessed**.

### K020. What is the difference between lateinit and lazy kotlin?

Answer:

    1. **lateinit can only be used with a var property whereas lazy will always be used with val property**.
    2. A lateinit property **can be** **reinitialised** **again** and again as per the use whereas the lazy property can only be initialized once.

    **class** Demo {

       **lateinit var name**: String

       **val myName**: String **by** *lazy* **{**

           **"www\.tutorialspoint.com"**

       **}**

    }

    **fun** main() {

       **var** obj \= Demo();

    *//lazy call*

       *println*(obj.**myName**);

    *// latinit call*

       obj.**name** \= **"www\.tutorialspoint.com/"**

       **if** (obj::**name**.isInitialized)*//check initialization*

           *println*(obj.**name**)

    }

|  | `lateinit` | `lazy` |
| ----- | ----- | ----- |
| **Meaning** | "I'll initialize it later." | "Initialize it when I need it." |
| **Declared with** | `var` | `val` |
| **Example** | `lateinit var name: String``name = "Munirajan"` | `val name by lazy { "Munirajan" }` |
| **Who sets the value?** | You, manually | The lambda, on first access |
| **Mutable?** | Yes | No (read-only) |
| **Allowed types** | Non-null, non-primitive | Any type |
| **If accessed too early** | Throws `UninitializedPropertyAccessException` | Can't happen, it self-initializes |
| **Check if initialized** | `::name.isInitialized` | Not needed |
| **Typical Android use** | Views, injected dependencies, `binding` | Expensive objects, `by lazy { ViewModel }` |

### K021. Const equivalent in Java?

Answer:

    1. const is used to declare **compile-time constants**.
    2. its value **cannot be changed at runtime**.
    3. Const is equivalent to **static final** keyword in Java

| Kotlin | Java equivalent | Example |
| ----- | ----- | ----- |
| var | Normal variable/field | int age \= 30; |
| val | final | final int age \= 30; |
| const val | static final | static final int MAX \= 100; |

### K022. What is the reference operator/ reflection in kotlin?

Answer:

    1. **::** is used to create references to functions, properties, or classes.
    2. **::** is used for **Reflection** in kotlin
    3. Example:

| Class Reference  | val myClass \= MyClass::class |
| :---- | :---- |
| Function Reference  | **this::isEmpty** |
| Property Reference | **::someProperty.*isInitialized*** |
| Constructor Reference | **::MyClass** |

### K023. What is Visibility modifiers in kotlin?

Answer:

    1. used to **restrict the accessibility** of classes, objects, interfaces, constructors, functions, properties, and their setters to a certain level.
    2.
    3.

### K024. Protected vs internal?

Answer:

    1. Protected cannot be accessed in other classes. But internal can be accessed in other classes in the same module.

### K025. What are the different class declaration / inheritance modifiers in kotlin?

Answer:

    * open
      * final
      * sealed
      * abstract
    2. **open**: Indicates that the class **can be inherited** from by other classes.
    3. **final**: Indicates that the class **cannot be inherited**. This modifier is the opposite of "open". In Kotlin this is the **default** **modifier**.
    4. **sealed:**  Indicates that the class is a **restricted form of "open" class**. It **can be extended only within the same file** where the sealed class is declared.
    5. **abstract**: This keyword is used to mark a class as abstract. This means that the class **cannot be instantiated,** and **must be subclassed**.

### K026. What is inner in kotlin?

Answer:

    1. By default, the child **does not have access** to the outer class members.
    2. The inner keyword allows the inner class **to access the members of the outer class**.

    3. **Access to Outer Class Members**: An inner class can access the members (properties, functions) of its outer class directly, **even if they are private**.
    4. **Inner Class Visibility:** By default, an inner class is public if the outer class is public, or internal if the outer class is internal. You can specify the visibility explicitly using access modifiers.
    5. **Outer Class Instance**: Each instance of the inner class holds a reference to the specific instance of the outer class that it was created from. This reference is accessed using the **this@OuterClassName** syntax.
    6. **Non-Static**: Inner classes are non-static by nature and are tied to a specific instance of the outer class. They cannot be accessed without an instance of the outer class.

| class ClassA {    class ClassB {    } } *//In the above example, ClassB does not have access to any of the properties within the outer class.*  |
| :---- |
| *//In the example below **ClassB now has access** to the myProperty variable belonging to ClassA:* **class ClassA {    var myProperty: Int \= 10       inner class ClassB {        val result \= 20 \+ myProperty    } }** |

### K027. Tell me about constructors in kotlin?

Answer:

    1. **Primary Constructor:**
       * The primary constructor is defined as **part of the class header**. It is declared after the class name and can include constructor parameters.
       * The primary constructor for the data class **must have at least one parameter**.
       * The primary constructor parameters can be declared with **optional val or var** keywords to create corresponding properties.
       * If the primary constructor does not have any annotations or visibility modifiers, the constructor keyword can be omitted.
       * The initialization logic of properties and other code can be placed directly in the class body.

       **class Person(val name: String, var age: Int) {**

          **init {**

              ***println*("Initializing Person object")**

          **}**

          **fun introduce() {**

              ***println*("My name is \$name, and I am \$age years old.")**

          **}**

       **}**

    2. **Secondary Constructors:**
       * Secondary constructors are optional and are declared using the **constructor** keyword. They provide additional ways to create objects of a class.
       * Secondary constructors must delegate to the primary constructor using the ‘**this’** keyword. This can be done either directly or indirectly through other secondary constructors.
       * Each secondary constructor can have its own initialization code.

       **class Person(val name: String, var age: Int) {**

          **constructor(name: String) : this(name, 0) {**

              ***println*("Secondary constructor called")**

          **}**

          **init {**

              ***println*("Initializing Person object")**

          **}**

          **fun introduce() {**

              ***println*("My name is \$name, and I am \$age years old.")**

          **}**

       **}**

    3. **Execution order:**
       * Primary constructor
       * Init block

       **(or)**

       1. Init block
       2. Secondary constructor
    4. **Notes**:
       * Constructor parameters are **val** by default in Kotlin.
       * You can explicitly declare them using either the **val** or **var** keyword.

### K028. What are coroutines?

Answer:

    1. Coroutines are a **concurrency design pattern** in Kotlin that simplify asynchronous programming.
    2. coroutines are **lightweight threads.**
    3. **a new way of writing asynchronous, non-blocking code**. It is called non-blocking since it does not block the main thread.
    4. Coroutines allow execution to be suspended and resumed later at some point in the future which is best suited for performing non-blocking operations in the case of multithreading.
    5. ⭐Link for complete explanation: [Coroutines \- medium](https://medium.com/swlh/coroutines-pilove-notes-cb83654a88d4)

### K029. What is lightweight?

Answer:

    1. *it means that creating coroutines doesn’t allocate new threads. Instead, they use **predefined thread pools and smart scheduling** for the purpose of which task to execute next and which tasks later.*
       * **

### K030. What is scope in kotlin?

Answer:

**What is coroutine scope in kotlin?**

    1. There are scopes which specify the **lifetime of coroutine**. If we specify ***GlobalScope***, the coroutine will work until application lifetime ends.

**What are the scopes we have?**

    1. **GlobalScope** — If we specify ***GlobalScope***, the coroutine will work until application lifetime ends.
       * If we just want to have a simple launch without worrying about managing it, we can use GlobalScope.launch { }. However, this is not ideal, as per [this article](https://medium.com/mobile-app-development-publication/kotlin-coroutine-scope-context-and-job-made-simple-5adf89fcfe94#:~:text=CoroutineScope%20%E2%80%94%20This%20allows%20you%20to,end%20of%20Android%20Activity%20lifecycle.).
    2. **MainScope** — This will launch the coroutine in the main thread (UI thread) by default when using MainScope().launch { }.
    3. **CoroutineScope** — This allows us to define a custom scope by providing our own context.
       * CoroutineScope is the default scope for coroutines.
       * e.g. *CoroutineScope*(Dispatchers.**IO**).*launch* **{ }**.
    4. **LifecycleScope** —
       * This is an Android-specific coroutine scope.
       * It lives as long as the Lifecycle object such as **Activity/Fragment** is active.
    5. **ViewModelScope —** This scope will live as long the view model is alive.
       1\. 	Use ViewModelScope if you want to run coroutine in **ViewModel**.
       2\. 	Use LifecycleScope if you want to run coroutine in **Activity/Fragment**
       3\. 	Use CoroutineScope if you want to run coroutine for places **other than ViewModel and lifecycle owner**.
       4\.	 Use GlobalScope if you want to run coroutine with **application scope running task**.
       5\.	 Use RunBlocking if you want to run suspend function or library on regular blocking code. (runBlocking is a coroutine builder )
    6. (new) **supervisorScope —** SupervisorScope is used when you want to create a scope where the failure of one child coroutine doesn't cancel the others.
       * **Use it only with suspend function or within the coroutine.**

| //supervisorScope private fun fetchUsers() {    *viewModelScope*.*launch* {        uiState.postValue(UiState.Loading)        *// supervisorScope is needed, so that we can ignore error and continue        // here, more than two child jobs are running in parallel under a supervisor, one child job gets failed, we can continue with the other.*        supervisorScope {            val usersFromApiDeferred \= *async* { apiHelper.getUsersWithError() }            val moreUsersFromApiDeferred \= *async* { apiHelper.getMoreUsers() }            val usersFromApi \= try {                usersFromApiDeferred.await()            } catch (e: Exception) {                *emptyList*()            }            val moreUsersFromApi \= try {                moreUsersFromApiDeferred.await()            } catch (e: Exception) {                *emptyList*()            }            val allUsersFromApi \= *mutableListOf*\<ApiUser\>()            allUsersFromApi.addAll(usersFromApi)            allUsersFromApi.addAll(moreUsersFromApi)            uiState.postValue(UiState.Success(allUsersFromApi))        }    } }  |
| :---- |
| //SupervisorJob class AndroidViewModel() : ViewModel() {    val parentJob \= SupervisorJob()    val coroutineScope \= CoroutineScope(parentJob \+ Dispatchers.Default)    fun startCoroutine() {        val job1 \= coroutineScope.launch **{**            delay(500)            *// do things*        **}**        val job2 \= coroutineScope.launch **{**            delay(500)            *// do things*        **}**    }    override fun onCleared() {        super.onCleared()        this.parentJob.cancel()    }  |

### K031. What are the scopes we have?

Answer:

    1. **GlobalScope** — If we specify ***GlobalScope***, the coroutine will work until application lifetime ends.
       * If we just want to have a simple launch without worrying about managing it, we can use GlobalScope.launch { }. However, this is not ideal, as per [this article](https://medium.com/mobile-app-development-publication/kotlin-coroutine-scope-context-and-job-made-simple-5adf89fcfe94#:~:text=CoroutineScope%20%E2%80%94%20This%20allows%20you%20to,end%20of%20Android%20Activity%20lifecycle.).
    2. **MainScope** — This will launch the coroutine in the main thread (UI thread) by default when using MainScope().launch { }.
    3. **CoroutineScope** — This allows us to define a custom scope by providing our own context.
       * CoroutineScope is the default scope for coroutines.
       * e.g. *CoroutineScope*(Dispatchers.**IO**).*launch* **{ }**.
    4. **LifecycleScope** —
       * This is an Android-specific coroutine scope.
       * It lives as long as the Lifecycle object such as **Activity/Fragment** is active.
    5. **ViewModelScope —** This scope will live as long the view model is alive.
       1\. 	Use ViewModelScope if you want to run coroutine in **ViewModel**.
       2\. 	Use LifecycleScope if you want to run coroutine in **Activity/Fragment**
       3\. 	Use CoroutineScope if you want to run coroutine for places **other than ViewModel and lifecycle owner**.
       4\.	 Use GlobalScope if you want to run coroutine with **application scope running task**.
       5\.	 Use RunBlocking if you want to run suspend function or library on regular blocking code. (runBlocking is a coroutine builder )
    6. (new) **supervisorScope —** SupervisorScope is used when you want to create a scope where the failure of one child coroutine doesn't cancel the others.
       * **Use it only with suspend function or within the coroutine.**

| //supervisorScope private fun fetchUsers() {    *viewModelScope*.*launch* {        uiState.postValue(UiState.Loading)        *// supervisorScope is needed, so that we can ignore error and continue        // here, more than two child jobs are running in parallel under a supervisor, one child job gets failed, we can continue with the other.*        supervisorScope {            val usersFromApiDeferred \= *async* { apiHelper.getUsersWithError() }            val moreUsersFromApiDeferred \= *async* { apiHelper.getMoreUsers() }            val usersFromApi \= try {                usersFromApiDeferred.await()            } catch (e: Exception) {                *emptyList*()            }            val moreUsersFromApi \= try {                moreUsersFromApiDeferred.await()            } catch (e: Exception) {                *emptyList*()            }            val allUsersFromApi \= *mutableListOf*\<ApiUser\>()            allUsersFromApi.addAll(usersFromApi)            allUsersFromApi.addAll(moreUsersFromApi)            uiState.postValue(UiState.Success(allUsersFromApi))        }    } }  |
| :---- |
| //SupervisorJob class AndroidViewModel() : ViewModel() {    val parentJob \= SupervisorJob()    val coroutineScope \= CoroutineScope(parentJob \+ Dispatchers.Default)    fun startCoroutine() {        val job1 \= coroutineScope.launch **{**            delay(500)            *// do things*        **}**        val job2 \= coroutineScope.launch **{**            delay(500)            *// do things*        **}**    }    override fun onCleared() {        super.onCleared()        this.parentJob.cancel()    }  |

### K032. What is Scope functions?

Answer:

    1. Scope functions are functions that **execute a block of code** within the **context of an object**.
    2. Scope functions make code more **readable, clear and concise**.
    3. Scope Functions gives **temporary scope to the object**, where specific operations can be applied to the object within the block of code.
    4. There are five scoped functions in Kotlin: **let , run , with , also and apply.**
    5.
    6. Functionality wise, all scope functions have almost the same functionality. Each one has some different properties.
    7. **Readability tips**
       * Prefer **apply/also** for object configuration/side effects — that signals intent to readers.
       * Use **let** when you intentionally want an it variable or short null-safe scope.
       * Use **run** or **with** when this makes code clearer (avoid it for multi-line blocks).

### K033. Use of scope functions?

Answer:

    1. **Object Configuration**
    2. **Chained Calls**
    3. **Nullable Object Handling**
    4. **Data Transformation**

    5. Some other Purposes(may be confusing. So skip it):
       * Executing a lambda(block of code) on non-null objects: **let**
       * Introducing an expression as a variable in local scope: **let**
       * Object configuration: **apply**
       * Object configuration and computing the result: **run**
       * Running statements where an expression is required: **non-extension run**
       * Additional effects: **also**
       * Grouping function calls on an object: **with**

### K034. Suspend function?

Answer:

    1. A suspending function is simply a function that can be paused and resumed at a later time.
    2. They can execute a long running operation and wait for it to complete without blocking.
    3. suspending functions can only be invoked by another suspending function or within a coroutine.

### K035. What is inline function?

Answer:

    1. Without an inline function, When we handle higher order functions, the compiler **substitutes the actual code of the lambda** directly into the calling code.
    2. Without an inline function, the compiler replaces the lambda with an **anonymous object of Function type**. It will reduce performance. So we can use inline in this case.
    3. This can **improve performance** for small, frequently-called functions.

    4. However, inline functions **can also increase the size** of the resulting code as the function code is **duplicated** at each time. It's generally **recommended** to use inline functions for **small functions** that are called frequently.
    5. With inline functions, you **will not be able to access** **private** members/methods of our enclosing class. You will need to make those members/methods **internal** and then annotate them with **@PublishedApi**.
    6. Other keywords similar to inline to study in Advanced: **noinline, crossinline, @Volatile, synchronized**
    7. Stack overflow  explanation: [Use inline for preventing object creation](https://stackoverflow.com/a/66478722)
    8. Explanation: [inline, noinline, crossinline — What do they mean?](https://medium.com/android-news/inline-noinline-crossinline-what-do-they-mean-b13f48e113c2#:~:text=Say%20you%20have%20multiple%20lambdas,return%20to%20the%20calling%20function.)

| //Say you have a higher order function in Kotlin,      fun higherOrderFunction(aLambda: () \-\> Unit) {                  doSomething()         aLamda()         doAnotherThing()              }  |
| :---- |
| //converted to Java  public void higherOrderFunction(Function aLambda) {       doSomething();     aLambda.invoke();//invoke will execute the logic in our lambda.     doAnotherThing(); }  |
| //Java translated code: compiler replaces the lambda with an anonymous object of Function type public void callingFunction(){      higherOrderFunction(new **Function**() {         @Override         public void invoke() {           //aLambda's logic here.             **System.out.print("lambda logic")**         }     }); }  |
|  |
| //add the inline keyword to improve the higher order function's performance. inline fun higherOrderFunction(**aLambda**: () \-\> Unit) {     doSomething()     **aLamda**()     doAnotherThing() } fun callingFunction() {      higherOrderFunction{ print("lambda logic") }    }  |
| //Java translated code //note that the entire \`higherOrderFunction\` method //was copied into this method during the inlining. public void callingFunction() {      doSomething()   **System.out.print("lambda logic")**   doAnotherThing() }  |

    9.

### K036. What is actual function?

Answer:

    1. The **actual** function and **expect**ed function pair are used for a feature in Kotlin called "multiplatform programming".
    2. With multiplatform programming, a **common module** can **declare expected functions that have no implementation** with expect keyword.
    3. and **platform-specific modules** can provide **actual implementations** of those functions for each platform with actual keyword.
       **Common module:**
       **expect fun** getNameOfPlatform(): String
       **class** Greeting{
          **fun** sayWelcome(): String \= **"Welcome,  \${***getNameOfPlatform*()**}"**
       }

       **Android/iOS specific module:**

       **actual fun** getNameOfPlatform(): String {
          **return "Android \${**Build.VERSION.*RELEASE***}"**
       }

### K037. What are Coroutine Builders?

Answer:

    1. Coroutine builders are functions or classes that allow you to create, launch and manage coroutines.
       * **Launch** \- does not blocks main thread
       * **Async** \- does not  blocks main thread
       * **runBlocking**  \- **blocks main thread**
       * **withContext \-** not block the main thread.
    2.

### K038. What is launch?

Answer:

    1. launch { } starts a coroutine simultaneously.
    2. When we require multiple tasks to run in parallel, we can use this.
    3. It returns a **Job** object that can be used to control the coroutine (like job.cancel(), job.join() ..etc).
       *
       *

### K039. What is async?

Answer:

    1. async starts a coroutine in parallel similar to launch. But, it **provides a way to wait** for one coroutine before starting another coroutine in parallel.
    2. returns a **Deferred object** that represents that **result** and has some other functions like **await()**.
    3.

### K040. What is await?

Answer:

    1. When we need to wait for any async's completion, we need to call .await()
    2. At the time the await() function is called, it will block the main thread.

### K041. What is runBlocking { }?

Answer:

    1. runBlocking is a coroutine builder.
    2. It **blocks** the current executing thread, until the coroutine gets completed.
    3. It's generally used to write test cases to test suspend functions.
       * *⚠ Compiler Error due to calling suspend function on test case.*
       * *✅Solved with runBlocking.*

### K042. What is withContext?

Answer:

    1. used to **switch the context** of a coroutine to a **different thread**.
    2. Sometimes, we would like to have our coroutine switching between the Context, while being in the same coroutine. We can do so using withContext.
    3. This function will **shift execution of the block** into a **different thread** if a new dispatcher is specified. And it will get back to its original dispatcher when it completes.
    4. It’s a **suspend function**.
       * It **doesn’t create a new coroutine** (unlike `launch` or `async`)
         It just **suspends** the current coroutine, switches to the given context (like `Dispatchers.IO` or `Dispatchers.Default`), runs the block, and then returns the result.

### K043. Launch vs Async?

Answer:

    1. The launch is basically fire and forget.
    2. Async basically performs a task and returns a result.

    3. launch{} does not return the result.
    4. async{ }, which has an await() function returns the result of the coroutine.

    5. launch{} will not block our main thread.
    6. Async will block the main thread at the entry point of the await() function.

    7. Launch will return the Job object.
    8. Async will return the Deferred object.

### K044. What are Dispatchers?

Answer:

    1. Dispatchers are used for **deciding the thread** on which the work has to be done **in coroutine**.

### K045. List useful higher-order functions for collections in Kotlin?

Answer:

    1. All functions are higher-order functions on various collection types and can be **used with List, Set, Map, and other collection types**.
       * any
       * all
       * none
       * find
       * firstOrNull
       * groupBy
       * count
       * filter
       * map
       * distinct
       * distinctBy
       * flatMap
       * reduce
       * maxByOrNull / minByOrNull
       * associateBy
       * partition
       * drop / take
       * plus / minus operators (+/-)

### K046. Explain the any function for collections in Kotlin?

Answer:

    1. **any**: The any function is used to check if **at least one element in the collection satisfies** a given **condition** (predicate).
    2. matches, returns true; otherwise, it returns false
    3. Java equivalent : stream.**anyMatch**(predicate)

| val *numbers* \= *listOf*(1, 2, 3, 4, 5) val *hasEvenNumber* \= *numbers*.*any* { it % 2 \== 0 } println(hasEvenNumber) *// Output: true (at least one element is even)* |
| :---- |

### K047. Explain the all function for collections in Kotlin?

Answer:

    1. **all**:The all function checks if **all elements** in the collection **satisfy a given condition** (predicate).
    2. matches, returns **true**; otherwise, it returns **false**
    3. Java equivalent : stream.**allMatch**(predicate)

| val numbers \= *listOf*(2, 4, 6, 8, 10) val allEven \= numbers.*all* { it % 2 \== 0 } *println*(allEven) *// Output: true (all elements are even)* |
| :---- |

### K048. Explain the none function for collections in Kotlin?

Answer:

    1. **none**: The none function is used to **check if none of the elements** in the collection **satisfy a given condition** (predicate).
    2. matches, returns **true**; otherwise, it returns **false**
    3. Java equivalent : stream.**noneMatch**(predicate)

| val numbers \= *listOf*(1, 3, 5, 7, 9) val noneEven \= numbers.*none* { it % 2 \== 0 } *println*(noneEven) *// Output: true (none of the elements are even)* |
| :---- |

### K049. Explain the find function for collections in Kotlin?

Answer:

    1. **find**: The find function returns the first element in the collection that **satisfies a given condition** (predicate).
    2. returns the number of elements.
    3. Java equivalent :
       * stream.**filter**(predicate).**findFirst**()  \-\> (returns the first element that matches the given predicate)
       * stream().**findAny**()   \-\>(Not same: Returns any element from the stream)

| val numbers \= *listOf*(1, 2, 3, 4, 5) val firstEven \= numbers.*find* { it % 2 \== 0 } *println*(firstEven) *// Output: 2 (the first even element found)* |
| :---- |

### K050. Explain the firstOrNull function for collections in Kotlin?

Answer:

    1. **firstOrNull**:The firstOrNull function **returns the first element** of the collection, **or null** if the collection is empty.
    2. returns the number of elements.
    3. Java equivalent : stream.filter(predicate).**findFirst**().**orElse(null)**  \-\> (returns the first element that matches the given predicate, or null if none found)

| val numbers \= *listOf*(1, 2, 3) val firstEven \= numbers.*firstOrNull* { it % 2 \== 0 } *println*(firstEven) *// Output: 2 (the first even element found)* |
| :---- |

### K051. Explain the groupBy function for collections in Kotlin?

Answer:

    1. **groupBy**: The groupBy function **groups elements** of the collection **by the result of a given key** selector function.
    2. It **returns a map** where the keys are the results of the key selector function, and the values are lists of elements that have the same key.
    3. Java equivalent : stream.collect(Collectors.**groupingBy**(classifier))  \-\> (groups elements by the result of a classifier function)

| val words \= *listOf*("apple", "banana", "cherry") val groupedByFirstLetter \= words.*groupBy* { it\[0\] } *println*(groupedByFirstLetter) *// Output: {a=\[apple\], b=\[banana\], c=\[cherry\]}* |
| :---- |

### K052. Explain the count function for collections in Kotlin?

Answer:

    1. **count**: The count function is used to **count the number of elements** in the collection that **satisfy a given condition** (predicate).
    2. returns the number of elements.
    3. Java equivalent : **count()**

| val numbers \= *listOf*(1, 2, 3, 4, 5) val evenCount \= numbers.*count* { it % 2 \== 0 } *println*(evenCount) *// Output: 2 (there are 2 even numbers in the list)* |
| :---- |

### K053. Explain the filter function for collections in Kotlin?

Answer:

     1. **filter**: The filter function **returns a new collection** containing only the elements that **satisfy a given condition** (predicate).
     2.  returns a new collection with elements for which the predicate is true.
     3. Java equivalent : stream.**filter**(predicate) \-\>(filters elements based on the given predicate)

| val numbers \= *listOf*(1, 2, 3, 4, 5) val evenNumbers \= numbers.*filter* { it % 2 \== 0 } *println*(evenNumbers) *// Output: \[2, 4\]* |
| :---- |

### K054. Explain the map function for collections in Kotlin?

Answer:

     1. **map**: The map function **transforms each element** in the collection **based on a given transform function.**

     2. It takes a **transform function as a parameter** and **returns a new collection** with the transformed elements.
     3. Java equivalent : stream.**map**(mapper)  \-\> (transforms elements based on the given mapper function)

| val numbers \= *listOf*(1, 2, 3, 4, 5) val squaredNumbers \= numbers.*map* { it \* it } *println*(squaredNumbers) *// Output: \[1, 4, 9, 16, 25\]* |
| :---- |

### K055. Explain the distinct function for collections in Kotlin?

Answer:

     1. **distinct (தனித்துவமான )**: The distinct function **returns a new collection** with **duplicate elements removed**.

     2. It is useful for getting a list of **unique elements** from a collection.
     3. Java equivalent : **stream.distinct()**   \-\> (removes duplicates from the stream)

| val numbers \= *listOf*(1, 2, 2, 3, 3, 4, 5, 5) val uniqueNumbers \= numbers.*distinct*() *println*(uniqueNumbers) *// Output: \[1, 2, 3, 4, 5\]* |
| :---- |

### K056. Explain the distinctBy function for collections in Kotlin?

Answer:

     1. **distinctBy**: The distinctBy function returns a new collection with duplicate elements removed based on a selector function.

     2. It is similar to distinct, but it considers the result of the selector function for determining uniqueness.
     3. Java equivalent : \- not available. But can achieve with **collectingAndThen()** and **toMap()**

| data class Person(val name: String, val city: String)    val people \= *listOf*(        Person("Alice", "New York"),        Person("Bob", "Los Angeles"),        Person("Charlie", "New York")    )    val uniqueCities \= people.*distinctBy* { it.city }    *println*(uniqueCities) *// Output: \[Person(name=Alice, city=New York), Person(name=Bob, city=Los Angeles)\]* |
| :---- |

### K057. Explain the flatMap function for collections in Kotlin?

Answer:

     1. **flatMap**: The flatMap function transforms each element in the collection to a new collection and then **flattens the results into a single list**.

     2. It takes a transform function that returns an iterable (e.g., list) for each element, and **returns a single flattened list.**
     3. Java equivalent :stream.**flatMap**(mapper)  \-\> (flattens elements after applying the mapper function)

| val words \= *listOf*("hello", "world") val letters \= words.*flatMap* { it.*toList*() } *println*(letters) *// Output: \[h, e, l, l, o, w, o, r, l, d\]* |
| :---- |

### K058. Explain the reduce function for collections in Kotlin?

Answer:

     1. **reduce**: The reduce function applies a binary operation to elements of the collection, starting from the first element and accumulating the result.

     2. It takes a binary operation as a parameter and returns a single accumulated result.
     3. Java equivalent **:** stream.**reduce**(identity, accumulator)  \-\> (reduces the stream to a single value using the accumulator function and an identity value)

| val numbers \= *listOf*(1, 2, 3, 4, 5) val sum \= numbers.*reduce* { acc, num \-\> acc \+ num } *println*(sum) *// Output: 15 (1 \+ 2 \+ 3 \+ 4 \+ 5\)* |
| :---- |

### K059. Explain the maxByOrNull / minByOrNull function for collections in Kotlin?

Answer:

     1. **maxByOrNull / minByOrNull**: The maxByOrNull function returns the maximum element of the collection based on the result of the given selector function.

     2. The minByOrNull function returns the minimum element of the collection based on the result of the given selector function.
     3. Java equivalent **:** stream.max(comparator) / stream.min(comparator)   \-\> (returns the maximum/minimum element based on the given comparator)

| data class Person(val name: String, val age: Int) val people \= *listOf*(    Person("Alice", 25),    Person("Bob", 30),    Person("Charlie", 20) ) val oldestPerson \= people.*maxByOrNull* { it.age } val youngestPerson \= people.*minByOrNull* { it.age } *println*(oldestPerson) *// Output: Person(name=Bob, age=30) println*(youngestPerson) *// Output: Person(name=Charlie, age=20)* |
| :---- |

### K060. Explain the associateBy function for collections in Kotlin?

Answer:

     4. **associateBy**: The associateBy function creates a map where keys are determined by the key selector function and values are the elements of the collection.

     5. It is useful for **converting a list into a map** based **on a specific property**.
     6. Java equivalent **:** Not available. But can be achieved with **Collectors.toMap()**

| data class Person(val name: String, val id: Int) val people \= *listOf*(    Person("Alice", 1),    Person("Bob", 2),    Person("Charlie", 3) ) val peopleById \= people.*associateBy* { it.id } *println*(peopleById) *// Output: {1=Person(name=Alice, id=1), 2=Person(name=Bob, id=2), 3=Person(name=Charlie, id=3)}* |
| :---- |

### K061. Explain the partition function for collections in Kotlin?

Answer:

     7. **partition**: The partition function **divides the collection into two lists** based on a given predicate.

     8. It returns a pair of two lists, where the **first list contains elements that satisfy the predicate**, and the second list contains elements that do not.
     9. Java equivalent **: Collectors.partitioningBy(Predicate\<T\> predicate)**

| val numbers \= *listOf*(1, 2, 3, 4, 5) val (evenNumbers, oddNumbers) \= numbers.*partition* { it % 2 \== 0 } *println*(evenNumbers) *// Output: \[2, 4\] println*(oddNumbers) *// Output: \[1, 3, 5\]* |
| :---- |

### K062. Explain the drop / take function for collections in Kotlin?

Answer:

     10. **drop / take**: The **drop** function returns a new collection with the **first N elements removed** from the original collection.
     11. The **take** function **returns** a new collection **with only the first N elements** from the original collection.
     12. Equivalent in java :
         1. drop \- stream.**skip**(long n);
         2. take \- stream.**Limit**(long n)

| val numbers \= *listOf*(1, 2, 3, 4, 5) val droppedNumbers \= numbers.*drop*(2) *// \[3, 4, 5\]* val takenNumbers \= numbers.*take*(3) *// \[1, 2, 3\]* |
| :---- |

### K063. Explain the plus / minus operators for collections in Kotlin?

Answer:

     13. **plus / minus operators (+ and \-)**: The plus operator (+) combines two collections into a new collection.

     14. The minus operator (-) removes elements from a collection based on another collection.
     15. Java equivalent **: addAll()** and **removeAll()**

| val list1 \= *listOf*(1, 2, 3) val list2 \= *listOf*(3, 4, 5) val combinedList \= list1 \+ list2 *// \[1, 2, 3, 3, 4, 5\]* val subtractedList \= list1 \- list2 *// \[1, 2\]* |
| :---- |

\====================================================================

### K064. Why do some developers switch to Kotlin from Java?

Answer:

   1. Kotlin combines features of both object-oriented and functional programming, whereas Java is limited to object-oriented programming.

      * Null Safety
      * Extension Functions
      * Higher order function
      * Coroutines Support
      * Data classes
      * Smart casts
      * Type inference
      * No checked exceptions
   2. ✍️From java 8, It supports Functional programming. But Java does not truly support functional programming as Kotlin, Python or JavaScript does. However, using lambda expressions, functional interfaces, method references, streams, and the Optional class in Java allows us to imitate the behavior of functional programming.

> ✦ **Additional notes**

Null safety in the type system, much less boilerplate (data classes, properties, type inference), coroutines for async code, extension functions, smart casts, sealed classes / `when` expressions, 100% Java interoperability, and Google's *Kotlin-first* support for Android.

### K065. Difference between companion object and object? How to choose?

Answer:

   1. **Best Explanation:** [Objects in Kotlin | Baeldung on Kotlin](https://www.baeldung.com/kotlin/objects#:~:text=Companion%20objects%20are%20essentially%20the,features%20to%20make%20development%20easier.&text=Companion%20objects%20allow%20their%20members,class%20without%20specifying%20the%20name.)
      * **Companion objects are basically the same as objects.** It has some **additional features** to make development easier. ✅
      * Companion objects allow their members to be accessed from inside the companion class **without specifying the name**.
   2. Similarity:
      * Both are used to create **static** instances like in Java.
      * Both can have an **init (initializer) block.**
      * Both can be used to create singleton instances.

| Aspect | companion object | object |
| :---- | ----- | ----- |
| **declaration** | It is always declared **inside** of another class. | It is **not** declared inside of another class. |
| **Scope** | Associated with a specific class. | Standalone, not tied to any class. |
| **Access** | Accessed using the class name. Within the same class it doesn’t need the class name. | Accessed directly using its name everywhere. |
| **Purpose** | To create **static variables and methods.** Class-level properties, functions, constants, class-specific utility.  The **companion object** also will create singletons. But it needs to be called with the **classname**. | To create **singletons**, utility objects, shared resources. |
| **Number per Class** | Each class can have its own companion object. | Multiple object instances can be defined. |
| **Example** | class TestClass{    **companion object** {     private val FILL\_COLOR \=      Color.parseColor("\#ABF44336")    } } //Use:  **FILL\_COLOR** //within same class **TestClass.FILL\_COLOR**  //within other classes (if not private) | class TestClass{  } **object** **MySingleton**{     val FILL\_COLOR \= Color.parseColor("\#ABF44336") } //Use:  **MySingleton.FILL\_COLOR** |

| KOTLIN | JAVA |
| ----- | ----- |
| **//for static**  class Utils {    **companion object** {        fun print() {}        val PI \= 3.14    } } | public class Utils {    public static void print() {    }    public **static final** double *PI* \= 3.14; }  |
| **//for singleton**  **object** MyManager {    fun doSomething() {} } | public class MyManager {    private static MyManager *instance*;    private MyManager() {    }    public static MyManager getInstance() {        if (*instance* \== null) {            *instance* \= new MyManager();        }        return *instance*;    }    public void doSomething() {    } }  |

### K066. What are the various data types available in Kotlin? Explain them.

Answer:

    1. These data types can be broadly categorized into two groups:
       * **Primitive data types**
       * **Reference data types**
    2. Primitive Data Types:
       * Byte
       * Short
       * Int
       * Long
       * Float
       * Double
       * Char
       * Boolean

    3. Reference Data Types:
       * String
       * Array
       * List
       * Set
       * Map
       * Class

### K067. What are the operators available in kotlin?

Answer:

    1. Elvis Operator (**?:**)
    2. Safe Call Operator (**?.**)
    3. Not-Null Assertion Operator (**\!\!.**)
    4. Range Operator (**..**)
    5. in Operator (**in**)
    6. is Operator (**is**) (in java **instanceof**)
    7. Assertion Operator (**assert**) \- used in testing
    8. Spread Operator (**\***)

### K068. Difference b/w Safe calls(?.) vs Null checks(!!) in Kotlin?

Answer:

    1. we use Null checks (\!\!) only when we are confident that the property **can't have a null value.** Otherwise, crash (**NullPointerException** will be thrown).
    2. If we are **not sure** that the value of the property is null or not, then we can prefer to use Safe calls(?.)

### K069. What is lambda function?

Answer:

    1. It is a concise way to represent an anonymous function in programming.
    2. Lambdas are often **used to pass behavior as an argument** to **higher-order functions**.

| val sum \= { a: Int, b: Int \-\> a \+ b } *println*(sum(3, 5)) *// Output: 8* |
| :---- |

### K070. Where do we use higher-order functions?

Answer:

    1. Collections & functional operations
       * Filtering, mapping, reducing, grouping.

| val numbers \= listOf(1, 2, 3, 4, 5) val evenNumbers \= numbers.filter { it % 2 \== 0 }   *// filter is a HOF* val squared \= numbers.map { it \* it }             *// map is a HOF* |
| :---- |

    2. Callbacks \- Passing behavior to asynchronous functions.

| fun fetchData(callback: (String) \-\> Unit) {    *// simulate network call*    callback("Data received") } fetchData { data \-\> println(data) } |
| :---- |

    3. event listeners in UI

| button.setOnClickListener {    *// this lambda is passed as a function* } |
| :---- |

### K071. What is value class?

Answer:

    1. It is designed to represent a single simple value, such as a Int or a String . This is because value classes are intended to represent simple values, and adding additional complexity would make them less efficient and less useful.
    2.

| @JvmInline value class Degree(val value: Double) {    fun toRadians(): Double \= Math.toRadians(value)    fun toRotations(): Double \= value / 360.0    fun sin(): Double \= Math.sin(toRadians())    fun cos(): Double \= Math.cos(toRadians())    fun tan(): Double \= Math.tan(toRadians())    fun cot(): Double \= 1.0 / tan()    fun sec(): Double \= 1.0 / cos()    fun csc(): Double \= 1.0 / sin() } |
| :---- |

### K072. Data class vs value class?

Answer:

    1. Data classes in Kotlin are used **to represent immutable data**, with automatically generated useful methods.
    2. Value classes are a concept in Kotlin for **creating type-safe wrappers around primitive types.**

### K073. Type Inference in Kotlin?

Answer:

    1. Type inference means Kotlin **automatically determines a variable or expression's type** from its **context**, so **explicit type declarations are often unnecessary.**

| val number \= 42 *// Compiler infers type Int* val message \= "Hello, Kotlin\!" *// Compiler infers type String*  fun add(a: Int, b: Int) \= a \+ b val result \= add(3, 5) *// Compiler infers type Int* |
| :---- |

### K074. What are varargs in Kotlin?

Answer:

    1. varargs (short for "variable-length arguments") is a feature that **allows a function to accept a variable number of arguments of the same type**.
    2. It allows you to pass a varying number of arguments to a function without explicitly defining an array.

    3. In the function declaration, you use the vararg modifier followed by the type of the elements that the function can accept.
    4. The varargs parameter is then **treated as an array** inside the function body, allowing you to access and manipulate the individual elements.
    5. You can **also pass an array directly** to a vararg parameter by using the spread operator **(\*)** when calling the function.

| fun sumNumbers(vararg numbers: Int): Int {    var sum \= 0    for (num in numbers) {        sum \+= num    }    return sum } fun main() {    val result1 \= sumNumbers(1, 2, 3, 4, 5) *// Pass multiple arguments*    val result2 \= sumNumbers(10, 20) *// Pass two arguments*    println("Result 1: \$result1")    println("Result 2: \$result2") } |
| :---- |
| ***//passing an array directly with \****  **val numbersArray \= intArrayOf(1, 2, 3) val sum3 \= sum(\*numbersArray)**  |

### K075. Explain sealed class? What are the benefits of Sealed class over Enum?

Answer:

    1. Sealed class is a restricted form of open class.
       * Which means, It **can be extended only within the same file** where the sealed class is declared
    2. Enum classes allow us to define a fixed set of options or choices, while sealed classes enabling the creation of restricted class hierarchies with distinct states or outcomes.
    3.

| Enum | Sealed class |
| ----- | ----- |
| Enum classes allow us **to define a fixed set of options** or choices | It's often used to represent restricted hierarchies, where we want **to define a limited set of subclasses** and **prevent the creation of additional subclasses outside** that set.  |
|  | Sealed classes **can contain data** and **behavior**, making them more flexible than enums. |
|  | works well with when expressions for pattern matching. |
|  | **can be extended** in the future **without breaking** existing code. |

    4.

| enum class Color {    RED, GREEN, BLUE } fun main() {    val selectedColor: Color \= Color.RED    when (selectedColor) {        Color.RED \-\> println("Selected color is Red")        Color.GREEN \-\> println("Selected color is Green")        Color.BLUE \-\> println("Selected color is Blue")    } } |
| :---- |
| **sealed class Result {    data class Success(val data: String) : Result()    data class Error(val message: String) : Result() } fun handleResult(result: Result) {    when (result) {        is Result.Success \-\> println("Success: \${result.data}")        is Result.Error \-\> println("Error: \${result.message}")    } }** |

    5.

### K076. What is `noinline`?

Answer:

    1. prevents certain lambda parameters from being inlined (useful if you need to store or pass them around).

### K077. What is `crossinline`?

Answer:

    1. ensures a lambda cannot use non‑local returns when inlined.

### K078. What is `reified`?

Answer:

    1. only possible in inline functions, allowing type checks at runtime.

### K079. What is the use of extension function?

Answer:

    1. **Add functionality without inheritance** → Don’t need to subclass.
    2. **Better readability** → Makes code feel natural (`textView.visible()`).
    3. **Organized utilities** → Instead of static helper classes.
    4. **Android-friendly** → Used a lot for UI helpers, `Fragment` transactions, `Context` helpers.
    5. When to use:
       * When I need to add reusable helper logic to a class I don’t own (like Android’s `View` or `Context`). For example, I use extension functions to easily show a `Toast`, change `View` visibility, or format dates. They keep my code clean and more expressive.

### K080. What do @JvmStatic and @JvmField mean in Kotlin?

Answer:

    1. Both improve **Java interoperability** and **remove Companion/INSTANCE boilerplate code**.
    2. Reason:
       * Kotlin **doesn’t have true `static` members** like Java.
       * Instead, it uses **objects** and **companion objects**.
    3. **Solution:**
       * **@JvmStatic** and **@JvmFiled** will make it look like a true static function and field.

| Actual problem: class Utils {    companion object {        fun greet() \= *println*("Hello")        val version \= "1.0"    } } object Config {    val API\_KEY \= "XYZ123" }  |
| :---- |
| Calling from java:  Utils.Companion.greet(); System.out.println(Utils.**Companion**.getVersion()); System.out.println(Config.**INSTANCE**.getAPI\_KEY());  `That’s awkward for Java developers — it doesn’t look natural.` |

       *

| Solution with @JvmStatic and @JvmFiled: class Utils {    companion object {        @JvmStatic         fun greet() \= *println*("Hello")        @JvmField         val version \= "1.0"    } }  |
| :---- |
| Calling directly from java:  Utils.greet(); System.out.println(Utils.getVersion()); |

       *

| Annotation | Used For | Applies To | What It Does | Example |
| ----- | ----- | ----- | ----- | ----- |
| @JvmStatic | Expose Kotlin static-like methods to Java | Functions inside **object**, **companion object** | Makes a method or property callable as a true static member in Java | ✅ Utils.printName() instead of Utils.Companion.printName() |
| @JvmField | Expose Kotlin property as a public Java field (without getters/setters) | For **val** or **var** inside **object**, **companion object**  | Removes generated get() / set() methods | ✅ Config.API\_KEY instead of Config.INSTANCE.getAPI\_KEY() |

### K081. @JvmStatic vs @JvmOverloads?

Answer:

| Annotation | Purpose | Example Use |
| ----- | ----- | ----- |
| @JvmStatic | Make a function static for Java calls | Utils.sayHello() |
| @JvmOverloads | Java doesn't support default values in parameters. It generate Java-friendly overloads for **default values** | fun show(name: String, age: Int \= 18\) → multiple Java overloads |

    1.

| object Utils {    @JvmStatic fun greet() \= println("Hello")  *// Acts as static method in Java*    @JvmField val version \= "1.0"              *// Acts as static field in Java* } |
| :---- |
| class Helper {    @JvmOverloads    fun show(name: String, age: **Int \= 18**) {  *// Now Java will support default value.*        println("Name: \$name, Age: \$age")    } } |

    2.

### K082. What are some of the disadvantages of Kotlin?

Answer:

    1. **Learning resources are limited.** The number of developers who are moving to Kotlin is growing, yet there is a small developer community accessible to help them understand the language or address problems during development.
    2. **A lot of what happens in Kotlin is hidden**. You can almost always trace the logic of a program in Java. When it comes to bug hunting, this can be really useful. In case, If you define a data class in Kotlin, getters, setters, equality testing, tostring, and hashcode are automatically added for you.
    3. **Kotlin has variable compilation speed.** In some situations, Kotlin outperforms Java, particularly when executing incremental builds. However, we must remember that when it comes to clean builds, Java is the clear winner.
    4. **We still need Java**: Even though you are planning to completely program our application in Kotlin, we might still want to use Java For certain things. Especially accessing the **advanced functionalities of the hardware**, you might still want to make use of Java to make those things work. So technically, you will be **incorporating a lot of Java code** inside our Kotlin project.
    5.
    6. **Checked exceptions are likewise absent in Kotlin.** Although checked exceptions have become less prominent, many programmers believe them to be an effective technique to ensure that their code is stable.
    7. **In Kotlin, there are a few keywords that have non-obvious meanings**: internal, crossinline, expect, reified, sealed, inner, open. Java has none of these.

### K083. Coroutine lifecycle?

Answer:

> ✦ **Added answer**

A coroutine's `Job` moves through states: **New → Active → Completing → Completed**, or **Cancelling → Cancelled** when cancelled or failed. Check them with `isActive`, `isCompleted`, `isCancelled`. A parent completes only after all its children complete, and cancelling a parent cancels its children. Cancellation is *cooperative* – suspending functions check for it.

### K084. What is Structured Concurrency?

Answer:

    1. Structured concurrency means that **coroutines are launched within a well‑defined scope, and their lifecycle is tied to that scope**.

| ⭐It ensures that when a parent scope completes or is canceled, all its child coroutines are also canceled — preventing leaks and guaranteeing predictable cleanup.  |
| :---- |

    3. **structured concurrency is the default behavior** when you launch coroutines.
    4. Here child coroutines are tied to a parent scope.
    5. **It ensures proper cancellation and completion of all childs**.
    6. Scenarios of structured concurrency :
       * Using Scope Extension Functions (`launch` / `async`) with `viewModelScope` or `lifecycleScope` , **`CoroutineScope`**.
    7. ✅ Structured (using `coroutineScope` or `supervisorScope(modified)`)

| suspend fun doWork() \= coroutineScope {    *launch* { fetchData() }    *launch* { logAnalytics() }    *// function will not return until both coroutines finish or are canceled* } |
| :---- |

    8.

| Scenario | Structured Concurrency? | If a child fails, will it cancel all siblings? | Why / What happens? |
| :---- | :---- | :---- | :---- |
| **CoroutineScope().launch (Default setup)** | 🟢 Yes | 🟢 Yes | Uses a standard Job.One child failing cancels the parent and all sibling coroutines. |
| **viewModelScope.launch / lifecycleScope.launch** | 🟢 Yes | 🟢 Yes | Uses a standard Job.One child failing cancels the parent and all sibling coroutines. |
| **coroutineScope { ... } (Scope Builder)** | 🟢 Yes | 🟢 Yes | Designed for parallel tasks that depend on each other. One child failing cancels the parent and all sibling coroutines. |
| **supervisorScope { ... }** | 🛡️ yes but partially. | 🛑 No | Failure is isolated. The exception does not move up to the parent, so all other sibling coroutines keep running normally. |
| **GlobalScope.launch** | ❌ No | 🛑 No | Breaks the hierarchy completely. The coroutines run as independent "free agents" on the application level; they are not actual siblings. |
| **Passing a Job() manually (e.g., launch(Job()))** | ❌ No | 🛑 No | Breaks the hierarchy. Independent free-agents. |

    9.

### K085. `supervisorScope` vs `CoroutineScope` with (SupervisorJob() difference?

Answer:

    **`supervisorScope`**

    1. **Use Case**: When we want **structured concurrency** (scope tied to a suspending function) but need **failure isolation** between child coroutines.
    2. **Behavior**:
       * Child coroutines run independently.
       * If one child fails, it **does not cancel siblings**.
       * The scope itself will only complete when all children complete.

| suspend fun fetchData() \= supervisorScope {    val user \= *async* { fetchUser() }    val posts \= *async* { fetchPosts() }    *// if fetchPosts fails, fetchUser still runs*    user.await()    posts.await() } |
| :---- |

    **`supervisorScope`** :

    1. **Use Case**: Long‑lived scopes (e.g., ViewModel, application‑level) where you want independent coroutines but still need cancellation control.
    2. **Behavior**:
       * Similar failure isolation: one child’s failure doesn’t cancel others.
       * But this scope is **not bound to structured concurrency** — you must manage its lifecycle manually (cancel it when appropriate).

| class MyViewModel : ViewModel() {    private val scope \= *CoroutineScope*(*SupervisorJob*() \+ Dispatchers.Main)    fun loadData() {        scope.*launch* { fetchUser() }        scope.*launch* { fetchPosts() }    }    override fun onCleared() {        scope.*cancel*() *// must cancel manually*    } } |
| :---- |

| Aspect | supervisorScope | CoroutineScope(SupervisorJob()) |
| :---: | ----- | ----- |
| **Lifecycle** | Bound to the suspending function call | Long‑lived, cancel with manual lifecycle |
| **Structured Concurrency** | Yes (scope ends when function ends) | No (lives until explicitly canceled) |
| **Failure Handling** | Child failure doesn’t cancel siblings | Same (failure isolation) |
| **Cancellation** | Automatic when function completes | Manual via scope.cancel() |

    3.

### K086. What is Job?

Answer:

    1. A **Job** is a handle to a coroutine.
    2. With a job we can cancel or do some operations on the coroutines
    3.  Cancelling a parent `Job` **cancels all its child coroutines.**

### K087. What is SupervisorJob?

Answer:

    1. A special Job where one child failing does **not cancel its sibling coroutines**.

### K088. Job vs SupervisorJob?

Answer:

    1.

| Feature | Job (Standard) | SupervisorJob |
| :---- | :---- | :---- |
| **Child Failure** | **Cascades:** Cancels the parent and **all sibling** coroutines. | **Isolated:** Parent stays alive; **siblings keep running** unaffected. |
| **Exception Handling** | Throws upward immediately to the parent scope. | Caught at the child boundary; must be handled *inside* the child. |
| **Real-World Use Case** | **All-or-nothing tasks:** (e.g., Loading a checkout page where if the payment step fails, the whole process must stop). | **Independent tasks:** (e.g., A dashboard loading a Profile Card and an Ad Banner simultaneously; if the Ad fails, the Profile shouldn't break). |

### K089. What is CoroutineExceptionHandler?

Answer:

    1. A handler for uncaught exceptions in root coroutines, typically used for logging or displaying error messages.

### K090. Why avoid GlobalScope?

Answer:

    1. It is not lifecycle-aware, can continue running after the UI is destroyed, and **may cause memory leaks or wasted work.**

### K091. lifecycleScope vs viewModelScope?

Answer:

    1. `lifecycleScope` is tied to an Activity or Fragment lifecycle. `viewModelScope` is tied to the ViewModel and **survives configuration changes.**

### K092. What happens to a coroutine on rotation?

Answer:

    1. A coroutine launched in `lifecycleScope` is **cancelled** because the Activity or Fragment is recreated.
    2. A coroutine launched in `viewModelScope` continues running because the ViewModel **survives the configuration change.**

### K093. What is rememberCoroutineScope?

Answer:

    1. Provides a **CoroutineScope tied to the composable lifecycle**.
    2. Mainly for launching coroutines from event handlers like button clicks.

### K094. What is collectAsStateWithLifecycle()?

Answer:

    1. **Collects a Flow while respecting the Lifecycle**, preventing unnecessary work when the UI is not active.
    2. it starts and stops collecting based on the Lifecycle, saving resources and avoiding leaks.

### K095. What is the difference between coroutines, processes and threads?

Answer:

                          Process

                       /   		 \\

                  Thread          Thread

                     /            \\

           Coroutine  Coroutine

    1. As you can see, a process can have multiple threads, and each thread can have multiple coroutines.

    2. **Processes**:
       * Processes are **independent execution environments** that contain their **own memory space, code, and data.**
       * Processes can communicate with each other through shared memory or message passing.
       * Processes are typically used to run large, complex applications that require multiple threads or to isolate different parts of an application from each other.
    3. **Threads**:
       * A thread is the **smallest unit** of execution within a process. Threads **within the same process** **share the same memory space** and resources.
       * Threads are **lightweight processes** that share the same memory space, code, and data as the process they belong to.
       * Threads can run concurrently and communicate with each other through shared variables.
       * Threads are typically **used to run multiple tasks within the same process**, such as handling user input or updating the UI.
    4. **Coroutines**:
       * Coroutines are **lightweight functions** that can be **suspended and resumed at any point**.
       * Each thread can have multiple coroutines.
       * They are often used to implement asynchronous tasks, such as network requests or file I/O.
       * Coroutines are not tied to any particular thread, so they can be used to run multiple tasks concurrently without blocking the main thread.
    5.
    6.

### K096. What is the difference between LiveData, StateFlow, Flow and SharedFlow and ComposableState?

Answer:

    1.

|  | LiveData | Flow | StateFlow | SharedFlow | Compose State |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **Definition** | LiveData is an **lifecycle aware observable data holder**. (means it knows the lifecycle of the activity or an fragment) | Flow is a new **reactive stream** that was introduced in Kotlin Coroutines. It is similar to LiveData in that it allows us to **observe a stream of data** | StateFlow(hot stream) does similar things **like LiveData** but it is made using flow from kotlin.it's not lifecycle aware but this is also been solved using **repeatOnLifecycle** api. | SharedFlow(hot stream) \- name itself says it is shared, this flow can be shared by **multiple consumers**. (If multiple collect calls happening on the sharedflow there will be a single flow which will get shared across all the consumers unlike normal flow.) |  |
| **Saving State**  | It **saves the state**. | It **doesn't** save the state. | It **saves the state**. | It **doesn't** save the state. |  |
| **Launching**  | **Doesn’t need coroutines**  | it have to call within **coroutines** and we can use **launch()** | it have to call within **coroutines** and **launchWhenStarted()** | it have to call within **coroutines** and we can use **launch()** |  |
| **Reactive operations** | **No** | Flows are **reactive** and can be transformed and processed using operators like **map, filter, and reduce**  |  |  |  |
| **Hot/Cold flow** |  | **ColdFlow**. it emits value only when it have collectors | StateFlow is a **hotFlow**. which means it emits value even it doesn't have collectors | SharedFlow is a **hotFlow**. which means it emits value even it doesn't have collectors |  |
| **Triggering method** |  | We have to construct flow builder to use. To trigger the value, use **emit()** function. | to trigger set value to **stateFlow.value** | to trigger use **emit()** function |  |
| **Triggering** |  | with one time trigger, we can send multiple values one by one | usually it's used for a one time event, if the value has not changed, it will not be triggered even if we called again. | it will be triggered whenever it is called. |  |
| **Mutable State** |  | immutable | mutable | immutable |  |
| **Activity recreation state** |  | if activity recreated **nothing** will happen | if activity is recreated it **will trigger the value last stored.** | if activity recreated **nothing** will happen |  |
| **State Preservation** | No | No | StateFlow retains the most recent state | StateFlow retains the most recent value |  |
| **thread-safe** |  | **thread-safe** | **thread-safe** | **thread-safe** |  |
| **multiple collectors** |  | No | No | SharedFlow is designed for **multiple collectors** |  |
| **Use Case** | use it when you play with UI elements(views). | Use it if you want to emit multiple values over a period of time | Use it if you want to save state | Use it if you want to send events to UI |  |

    2.

| Recommended Use Cases Type Use Case Example LiveData Old XML-based UI (`observe` in Activity/Fragment). Use only if project already has LiveData. Flow DB queries (`dao.getUsersFlow()` in Room), streaming data (timer, websocket). StateFlow ViewModel → UI state (count, list, loading flag). Replaces LiveData in new apps. SharedFlow UI events → Snackbar, Toast, Navigation. (One-shot, not state). Compose State Local screen state only (text field, toggle, expanded state). Doesn’t survive config changes.  |
| ----- |

### K097. collectAsState vs observeAsState?

Answer:

    1. **observeAsState** is an extension on **LiveData**.
       * Starts observing this LiveData and represents its values via State.
       * Uses Lifecycle internally for safely observing the data.

    2. **collectAsState** is an extension on **StateFlow**.
       * Collects values from this StateFlow and represents its latest value via State.
       * You need to handle the collection as per appropriate Lifecycle

### K098. For threading do you use Coroutines or RxJava? Why?

Answer:

    1. **Kotlin vs. Java**: If you're using Kotlin, Coroutines may be a more straightforward choice. If you're working with Java or need multi-platform compatibility, RxJava is a solid option.

    2. **Project Complexity**: For relatively simple asynchronous tasks, Coroutines can provide a more concise and readable solution. For complex reactive scenarios with many operators, RxJava might be better.

### K099. How do you use Channels in kotlin?

Answer:

    1. Channels in Kotlin are a way **to communicate and pass data between different coroutines**.
    2. They are a core part of Kotlin's coroutines library and provide a convenient mechanism for sending and receiving data asynchronously.

| launch {    channel.send(42) *// Send an integer to the channel* } |
| :---- |
| **launch {    val data \= channel.receive() *// Receive data from the channel*    println("Received: \$data") }** |

### K100. What do you understand about the backing field in Kotlin?

Answer:

    1. A backing field refers to the **automatically generated field that holds the actual value** of a property declared in a class.
    2. When you define a property in Kotlin, the compiler **automatically generates** the backing field along with the **getter and setter methods** for that property.

| class Person {    private var \$name: String \= "John"  *//backing field*     var name: String        get() \= \$name    set(value) {        \$name \= value    } } |
| :---- |

### K101. What is Function Invocation?

Answer:

    1. In Kotlin, you can call functions using a more concise syntax, omitting parentheses for functions with no arguments.

    2.  ➜ Just for reference

| *// Error when testing this \- recheck other solutions*  fun sayHello() {    *println*("Hello, World\!") } sayHello() *// Normal function call* sayHello *// Function call without parentheses*   |
| :---- |

### K102. What is operator fun invoke?

Answer:

    1. In Kotlin, the operator fun invoke is a special function that allows you to call an instance of a class as if it were a function.
    2. This is achieved by overloading the invoke operator in a class.
    3. Mostly it’s used in unit testing.

| class MyFunction {    operator fun invoke(x: Int, y: Int): Int {       return x \+ y    } } fun main() {    val myFunction \= MyFunction()    val result \= myFunction(5, 3) *// This calls the invoke function*    *println*(result) *// Output: 8* } |
| :---- |

### K103. How to access a kotlin function from java?

Answer:

    1. No Change- Standard Class Functions
    2. Companion Object Functions
       * By default, functions inside a `companion object` are accessed via the `Companion` field in Java. To expose them as true static methods, use **`@JvmStatic`**.
    3.

| class Config {    companion object {        @JvmStatic        fun getVersion(): Int \= 1    } } |
| :---- |

    4. **Default Parameters:** Use **`@JvmOverloads`** in Kotlin so Java can see the variations.

### K104. Kotlin Collections?

Answer:

    1.

| Type | Kotlin Equivalent | Ordering Behavior | Allows Duplicates | Mutation Type | Code Sample \+ Explanation |
| ----- | ----- | ----- | ----- | ----- | ----- |
| **Kotlin List Implementations** |  |  |  |  |  |
| **List (Interface)** | List\<T\> | Maintains insertion order | ✅ Yes | Immutable (read‑only) | **val l: List\<Int\> \= *listOf*(1,2,2,3) *// \[1,2,2,3\]*** |
| **MutableList (Interface)** | MutableList\<T\> | Maintains insertion order | ✅ Yes | Mutable (can add/remove/update) | **val ml: MutableList\<String\> \= *mutableListOf*("a","b"); ml.add("c")** |
| **ArrayList** | arrayListOf\<T\>() or ArrayList\<T\>() | Maintains insertion order | ✅ Yes |  Mutable | **val al \= *arrayListOf*(1,2,3) *// \[1,2,3\]*** |
| ***LinkedList (Java)*** | *java.util.LinkedList\<T\>()* | *Maintains insertion order* | *✅ Yes* | *Mutable* | ***val ll \= java.util.LinkedList(listOf(1,2,3))*** |
| **Kotlin Set Implementations** |  |  |  |  |  |
| **Set (Interface)** | Set\<T\> | No guaranteed order | ❌ No duplicates | Immutable (read‑only) | **val s: Set\<Int\> \= *setOf*(1,2,2,3) *// \[1,2,3\]*** |
| **MutableSet (Interface)** | MutableSet\<T\> | No guaranteed order | ❌ No duplicates | Mutable | **val ms \= *mutableSetOf*("a","b"); ms.add("c")** |
| **HashSet** | hashSetOf\<T\>() / HashSet\<T\>() | No order guarantee (hash‑based) | ❌ No duplicates | Mutable | **val hs \= *hashSetOf*("a","b","c") *// order not guaranteed*** |
| **LinkedHashSet** | linkedSetOf\<T\>() / LinkedHashSet\<T\>() | Maintains insertion order | ❌ No duplicates | Mutable | **val lhs \= *linkedSetOf*(3,1,2) *// \[3,1,2\]*** |
| **TreeSet** | sortedSetOf\<T\>() / java.util.TreeSet\<T\>() | Maintains sorted order (natural/comparator) | ❌ No duplicates | Mutable | **val ts \= *sortedSetOf*(3,1,2) *// \[1,2,3\]*** |
| **Kotlin Map Implementations** |  |  |  |  |  |
| **Type** | **Kotlin Equivalent** | **Ordering Behavior** | **Allows Duplicate Keys** | **Mutation Type** | **Code Sample \+ Explanation** |
| **Map (Interface)** | Map\<K,V\> | No guaranteed order | ❌ No duplicate keys | Immutable (read‑only) | **val m: Map\<Int,String\> \= *mapOf*(1 *to* "a", 2 *to* "b")** |
| **MutableMap (Interface)** | MutableMap\<K,V\> | No guaranteed order | ❌ No duplicate keys | Mutable (can put/remove/update) | **val mm \= *mutableMapOf*(1 *to* "a"); mm\[2\] \= "b"** |
| **HashMap** | hashMapOf\<K,V\>() or HashMap\<K,V\>() | No order guarantee (hash‑based) | ❌ No duplicate keys | Mutable | **val hm \= *hashMapOf*(1 *to* "a", 2 *to* "b")** |
| **LinkedHashMap** | linkedMapOf\<K,V\>() or LinkedHashMap\<K,V\>() | Maintains insertion order | ❌ No duplicate keys | Mutable | **val lhm \= *linkedMapOf*(1 *to* "a", 2 *to* "b") *// preserves order*** |
| **SortedMap / TreeMap** | sortedMapOf\<K,V\>() or java.util.TreeMap\<K,V\>() | Maintains sorted order (by key) | ❌ No duplicate keys | Mutable | **val sm \= *sortedMapOf*(2 *to* "b", 1 *to* "a") *// {1=a,2=b}*** |

    2.

### K105. Kotlin collection functions segregation?

Answer:

    1. Creation: ⭐⭐⭐⭐⭐⭐

| Function | Block / Param must return | Overall return type | Code Sample |
| ----- | ----- | ----- | ----- |
| **emptyList  ⭐** | — | Empty List | **emptyList\<Int\>() // \[\]** |
| **emptyMap   ⭐** | — | Empty Map | **emptyMap\<Int,String\>() // {}** |
| **emptySet  ⭐** | — | Empty Set | **emptySet\<String\>() // \[\]** |
|  |  |  |  |
| **listOf  ⭐** | elements | Read‑only List | **listOf(1,2,3) // \[1,2,3\]** |
| **mapOf  ⭐** | key → value pairs | Read‑only Map | **mapOf(1 to "a", 2 to "b") // {1=a,2=b}** |
| **setOf  ⭐** | elements | Read‑only Set | **setOf(1,2,2,3) // \[1,2,3\]** |
|  |  |  |  |
| **mutableListOf  ⭐** | elements | Mutable List | **mutableListOf("a","b") // \["a","b"\]** |
| **mutableMapOf  ⭐** | key → value pairs | Mutable Map | **mutableMapOf(1 to "a") // {1=a}** |
| **mutableSetOf  ⭐** | elements | Mutable Set | **mutableSetOf(1,2,3) // \[1,2,3\]** |
| **arrayListOf  ⭐** | elements | Mutable ArrayList | **arrayListOf(1,2,3) // \[1,2,3\]** |
|  |  |  |  |
| **linkedMapOf** | key → value pairs | Linked Map | **linkedMapOf(1 to "a", 2 to "b")** |
| **linkedSetOf** | elements | Linked Set | **linkedSetOf("a","b")** |
| **sortedMapOf** | key → value pairs | Sorted Map | **sortedMapOf(2 to "b", 1 to "a") // {1=a,2=b}** |
| **sortedSetOf** | elements | Sorted Set | **sortedSetOf(3,1,2) // \[1,2,3\]** |
| **hashMapOf** | key → value pairs | HashMap | **hashMapOf(1 to "a", 2 to "b")** |
| **hashSetOf** | elements | HashSet | **hashSetOf("a","b")** |
|  |  |  |  |
| **buildList** | block → add elements | List | **buildList { add(1); add(2) } // \[1,2\]** |
| **buildMap** | block → put key/value | Map | **buildMap { put(1,"a"); put(2,"b") } // {1=a,2=b}** |
| **buildSet** | block → add elements | Set | **buildSet { add("x"); add("y") } // \[x,y\]** |
|  |  |  |  |
| **List** | size \+ init lambda | List | **List(3) { it \* 2 } // \[0,2,4\]** |
| **MutableList** | size \+ init lambda | MutableList | **MutableList(3) { it \+ 1 } // \[1,2,3\]** |
| **Iterable** | implemented manually | Iterable | **object: Iterable\<Int\> { override fun iterator() \= listOf(1,2).iterator() }** |

    2. Changers:

| Function | Block / Param must return | Overall return type | Code Sample |
| ----- | ----- | ----- | ----- |
| Transformers (lambda → new List) \- **Immutable** (Returns New Collection)  |  |  |  |
| **map** | transformed element | new List | **listOf(1,2,3).map { it \* it } // \[1,4,9\]** |
| **mapIndexed** | transformed element | new List | **listOf("a","b").mapIndexed { i, v \-\> "\$i:\$v" }** |
| **flatMap** | List of elements | new flattened List | **listOf(1,2).flatMap { listOf(it, \-it) }** |
| **sorted** |  |  |  |
| **sortedBy** | key (Comparable) | new sorted List | **listOf("aa","b").sortedBy { it.length }** |
| **sortedDescending** | key (Comparable) | new sorted List | **listOf(1,3,2).sortedDescending()** |
| **distinctBy** | key | new distinct List | **listOf("a","aa").distinctBy { it.length }** |
| Selectors (predicate → List/Single) \- **Immutable** (Returns New Collection)  |  |  |  |
| **filter** | Boolean (true \= keep) | new filtered List | **listOf(1,2,3).filter { it % 2 \== 0 }** |
| **filterNot** | Boolean (true \= exclude) | new filtered List | **listOf(1,2,3).filterNot { it % 2 \== 0 }** |
| **find** | Boolean (true \= match) | returns the **first element**  (nullable) | **listOf(1,2,3).find { it \> 2 }** |
| **firstOrNull** | Boolean (true \= match) | returns the **first element**  (nullable) | **listOf(1,2,3).firstOrNull { it % 2 \== 0 }** |
| **lastOrNull** | Boolean | returns the **last element**  (nullable) | **listOf(1,2,3).lastOrNull { it % 2 \== 0 }** |
| **indexOfFirst** | Boolean | returns the **index of first element**  (nullable) | **listOf(1,2,3).indexOfFirst { it \> 2 }** |
| **indexOfLast** | Boolean | returns the **index of last element**  (nullable) | **listOf(1,2,3).indexOfLast { it % 2 \== 0 }** |
| Checkers (predicate → Boolean)  |  |  |  |
| **any** | Boolean (true \= match) | Boolean | **listOf(1,2,3).any { it \> 2 }** |
| **all** | Boolean | Boolean | **listOf(2,4,6).all { it % 2 \== 0 }** |
| **none** | Boolean | Boolean | **listOf(1,2,3).none { it \< 0 }** |
| **Counters / Index Finders (predicate → Int)**  |  |  |  |
| **count** | Boolean | Int | **listOf(1,2,3).count { it % 2 \== 0 }** |
| Grouping / Mapping (lambda → Map)  |  |  |  |
| **groupBy** | key | Map\<K, List\<V\>\> | **listOf(1,2,3).groupBy { it % 2 }** |
| **associateBy** | key | Map\<K, V\> | **listOf("a","bb").associateBy { it.length }** |
| **associateWith** | value | Map\<K, V\> | **listOf("a","bb").associateWith { it.length }** |
| **associate** | Pair\<K,V\> | Map\<K, V\> | **listOf(1,2).associate { it to it\*it }** |
| Dropping / Taking (param → new List)  |  |  |  |
| **drop(n)** | param \= Int (1st **n** elements remove) | new List | **listOf(1,2,3,4).drop(2)//1st 2 elements removed** |
| **dropLast(n)** | param \= Int | new List | **listOf(1,2,3,4).dropLast(2)//last 2 elements removed** |
| **take(n)** | param \= Int | new List | **listOf(1,2,3,4).take(2)//1st 2 elements added** |
| **takeLast(n)** | param \= Int | new List | **listOf(1,2,3,4).takeLast(2)//last 2 elements added**  |
| Aggregators (lambda/param → Number/Single)  |  |  |  |
| **reduce** | param \= lambda (acc, element) → accumulated value | single value (non‑nullable, throws if list empty) | **listOf(1,2,3).reduce { acc, e \-\> acc \+ e } // stepwise combine elements into one result** |
| **fold** | param \= initial value \+ lambda (acc, element) → accumulated value | single value (safe on empty list because of initial value) | **listOf(1,2,3).fold(10) { acc, e \-\> acc \+ e } // same as reduce but starts with initial value** |
| **sum / sumOf** | param \= none (or selector lambda for sumOf) → Number | Number | **listOf(1,2,3).sum() // adds all elements directly listOf("a","bb").sumOf { it.length } // sums transformed values** |
| **average** | param \= none | Double | **listOf(1,2,3).average() // computes mean value of elements** |
| **maxBy / minBy** | param \= lambda (element) → key (Comparable) | single element (nullable if list empty) | **listOf("a","bb").maxBy { it.length } // returns element with largest key** |
| **maxOf / minOf** | param \= lambda (element) → key (Comparable/Number) | Number (or Comparable type) | **listOf("a","bb").maxOf { it.length } // returns numeric max of key** |
| Utility (various return types) \- **forEach, forEachIndexed \- only mutable functions** |  |  |  |
| **forEach** | Unit (side effect) | Unit | **listOf(1,2).forEach { println(it) }** |
| **forEachIndexed** | Unit (side effect) | Unit | **listOf("a","b").forEachIndexed { i,v \-\> println("\$i:\$v") }** |
| **plus / minus** | param \= element/collection | new List/Set | **listOf(1,2).plus(3)** |
| **union / intersect / subtract** | param \= collection | new Set/List | **setOf(1,2).union(setOf(2,3))** |
| **get / elementAt** | param \= index | single element | **listOf(1,2,3).get(1)** |
| **getOrNull / elementAtOrNull** | param \= index | single element (nullable) | **listOf(1,2,3).getOrNull(5)** |
| **getOrElse / elementAtOrElse** | default value | single element | **listOf(1,2,3).getOrElse(5) { \-1 }** |
| **zip** | param \= other collection | List of Pairs | **listOf(1,2).zip(listOf("a","b"))** |
| **unzip** | — | Pair of Lists | **listOf(1 to "a", 2 to "b").unzip()** |
| **chunked / windowed** | param \= size | List of sublists | **listOf(1,2,3,4).chunked(2)** |
| **partition** | Boolean | Pair of Lists | **listOf(1,2,3,4).partition { it % 2 \== 0 }** |
| **Mutating Functions (comparator on MutableList)** |  |  |  |
| **sort()** | optional comparator (natural order if none) | Unit (list sorted in place) | **val nums \= mutableListOf(3,1,2); nums.sort() // nums becomes \[1,2,3\]** |
| **sortBy / sortWith** | key selector (Comparable) / comparator | Unit (list sorted in place) | **val words \= mutableListOf("aa","b"); words.sortBy { it.length } // words becomes \["b","aa"\]** |
| **shuffle()** | optional Random | Unit (list order randomized in place) | **val nums \= mutableListOf(1,2,3,4); nums.shuffle() // nums order randomized** |
| **Aggregators / Utility** |  |  |  |
| **min / max** | param \= none | single element (nullable if empty) | **listOf(1,2,3).min() // 1 listOf(1,2,3).max() // 3** |
| **isEmpty / isNotEmpty** | param \= none | Boolean | **listOf\<Int\>().isEmpty() // true listOf(1,2,3).isNotEmpty() // true** |
| **contains** | param \= element | Boolean | **listOf(1,2,3).contains(2) // true** |
| **Sequence / Advanced** |  |  |  |
| **asSequence()** | param \= none | Sequence\<T\> (lazy evaluation) | **listOf(1,2,3).asSequence().map { it\*2 }.toList() // \[2,4,6\]** |
| **toList / toSet / toMap** | param \= none | new List / Set / Map | **setOf(1,2,3).toList() // \[1,2,3\] listOf(1,2,2).toSet() // \[1,2\] mapOf(1 to "a").toMap() // {1="a"}** |

### K106. What is map in transforming elements?

Answer:

    1. **map for transforming elements:** In Kotlin, map is a higher-order function that is **used to transform each element of a collection into another form.**

|    val numbers \= *listOf*(1, 2, 3, 4, 5) *// Using map to square each number in the list*    val squaredNumbers \= numbers.*map* { it \* it }     *println*(squaredNumbers) *// Output: \[1, 4, 9, 16, 25\]* |
| :---- |

    [**Kotlin collection cheat sheet**](https://drive.google.com/file/d/1ItzblBJS417lIpJa4QJc2hsobcVzA9R4/view?usp=drive_link) **(**[Medium](https://medium.com/mobile-app-development-publication/kotlin-collection-functions-cheat-sheet-975371a96c4b)**):**

    [****](https://drive.google.com/file/d/1ItzblBJS417lIpJa4QJc2hsobcVzA9R4/view?usp=drive_link)

    **Creation:**

**1\. Creation — instantiate new collection**

* // Empty Collection
  * **emptyList, emptyMap, emptySet**
* // Read-only Collection
  * **listOf, mapOf, setOf**
* // Mutable Collection
  * **mutableListOf, mutableMapOf, mutableSetOf, arrayListOf**
* // Build Collection from mix sources
  * **buildList, buildMap, buildSet**
* // Linked Collection
  * **linkedMapOf, linkedSetOf** (more in stackOverflow)
* // Sorted Collection
  * **sortedMapOf, sortedSetOf** (more in stackOverflow)
* // Hash Collection
  * **hashMapOf, hashSetOf** (more in stackOverflow)
* // Programmatically create Collection
  * **List, MutableList, Iterable**

	**2\. Creation Copy — replicate of collection**

* **copyInto**     // Can into array
* **copyOfRange**  // Partially copy
* **copyOf**       // Copy fully
* **toCollection** // Copy into collection

	**3\. Creation Catch —** like **try-catch** to create otherwise

* **ifEmpty**         // if empty give a default
* **orEmpty**         // change null into empty
* **requireNoNulls**  // crash if any element is null
* **listOfNotNull**   // make single element list or null

**Conversion:**

	**1\. Conversion Copy —** convert to another type of a new collection

* // to array type

  **toBooleanArray, toByteArray, toCharArray, toDoubleArray, toFloatArray, toIntArray, toLongArray, toShortArray, toTypedArray, toUByteArray, toUIntArray, toULongArray, toUShortArray**

* // to read-only collection

  **toList, toMap, toSet**

* // to mutable collection

  **toMutableList, toMutableMap, toMutableSet, toHashSet**

* // to sorted collection

  **toSortedMap, toSortedSet**

* // Convert Entries to Pair

  **toPair**       // to convert map entry to Pair instead

* // Convert Map to Properties

  **toProperties** // to convert Map to Properties (a Java native class). It is a subclass of **Map\<String, String\>** though.

	**2\. Conversion Cite —** convert to another type with a reference to the origin

* // as array type
* **asByteArray, asIntArray, asLongArray, asShortArray, asUByteArray, asUIntArray, asULongArray, asUShortArray,**
* // as collection type. For list vs sequences, check this blog
* **asIterable, asList, asSequence**
* // Convert to indexed iterator
* **withIndex**    // to convert List to IndexedValue iterable (iterator with index).
* // Convert to Map with customized default
* **withDefault**  // to convert Map to a Map with customized DefaultValue

	**Change:**

	**1\. Change Content — change the content but not the structure**

		**Types:**

- **Generate a new collection** and change the content of it, and **return** it
- **Mutate itself** by changing its content without returning anything.

* // Changing content

  **set, setValue**

* // Adding content

  **plus, plusElement,**

  **plusAssign,**

  **add, addAll, put, putAll**

* // Removing content

  **minus, minusElement,** **minusAssign, remove**

* // Remove away from the front or behind of the collection

  **drop, dropLast, dropLastWhile, dropWhile,**

  **removeFirst, removeFirstOrNull, removeLast, removeLastOrNull,**

* // Pick from the front or behind part of the collection

  **take, takeLastWhile, takeLast, takeWhile,**

* // Pick from the center section of the collection

  **slice, sliceArray**

*
*
*

### K107. kotlin generics in, out, where terms with examples?

Answer:

   1. [kotlin generics \<in, out, where\> terms with examples 📝 | by Betul Necanli](https://betulnecanli.medium.com/kotlin-generics-in-out-where-terms-with-examples-445dc0bb45d6)
   2. **In** : The in keyword is used to specify that a generic type is an "**input**" type, meaning it will **only be used as parameter** to a function or a class
   3. **Out** : The out keyword is used to specify that a generic type is an "**output**" type, meaning it will **only be used as a return type** from a function or a class.
   4. Where : The where keyword is used **to specify constraints** on the types that can be used **as arguments or return types**.

### K108. What is Kotlin Null Safety?

Answer:

**What is Safe call operator?**

    1. Kotlin null safety is a procedure to **eliminate the risk of null reference** from the code.
    2. (?.) is the null safety operator. Also called **safe call operator**.
    3. The safe call operator ?. is used to safely **access** properties or call methods **on nullable objects**.
    4. This operator executes only when the reference has a **non-null value**.
    5. If the reference is null, the **expression** using the null safety operator will result in a **null value**.

**What is Not Null Assertion operator?**

    1. The Not Null Assertion operator \!\! is used to assert that a nullable type is not null and **convert it to a non-nullable type**.
    2. we use Null checks (\!\!) only when we are confident that the property **can't have a null value.**
    3. It tells the compiler that you are certain the value is not null, and if it happens to be null, a **NullPointerException** will be thrown at runtime.

**What is Elvis operator (?:) Means in Kotlin?**

    1. The Elvis operator ?: is used **to provide a default value** when dealing with **nullable** types.
    2. It is used for null safety.
    3. **a ?: b** is just shorthand for **if** **(a \!= null) a else b**

> ✦ **Additional notes**

Kotlin's type system separates **non-null** (`String`) from **nullable** (`String?`) types, so most `NullPointerException`s are caught at compile time. Tools: safe call `?.`, Elvis `?:`, not-null assertion `!!`, `let`, safe cast `as?`, and `lateinit`.

### K109. Do primary and secondary constructors have any relationship?

Answer:

    1. **Primary Constructor:**
       * The primary constructor is defined as **part of the class header**. It is declared after the class name and can include constructor parameters.
       * The primary constructor for the data class **must have at least one parameter**.
       * The primary constructor parameters can be declared with **optional val or var** keywords to create corresponding properties.
       * If the primary constructor does not have any annotations or visibility modifiers, the constructor keyword can be omitted.
       * The initialization logic of properties and other code can be placed directly in the class body.

       **class Person(val name: String, var age: Int) {**

          **init {**

              ***println*("Initializing Person object")**

          **}**

          **fun introduce() {**

              ***println*("My name is \$name, and I am \$age years old.")**

          **}**

       **}**

    2. **Secondary Constructors:**
       * Secondary constructors are optional and are declared using the **constructor** keyword. They provide additional ways to create objects of a class.
       * Secondary constructors must delegate to the primary constructor using the ‘**this’** keyword. This can be done either directly or indirectly through other secondary constructors.
       * Each secondary constructor can have its own initialization code.

       **class Person(val name: String, var age: Int) {**

          **constructor(name: String) : this(name, 0) {**

              ***println*("Secondary constructor called")**

          **}**

          **init {**

              ***println*("Initializing Person object")**

          **}**

          **fun introduce() {**

              ***println*("My name is \$name, and I am \$age years old.")**

          **}**

       **}**

    3. **Execution order:**
       * Primary constructor
       * Init block

       **(or)**

       1. Init block
       2. Secondary constructor
    4. **Notes**:
       * Constructor parameters are **val** by default in Kotlin.
       * You can explicitly declare them using either the **val** or **var** keyword.

### K110. Tell about some features of Kotlin that are not present in Java?

Answer:

   1. Kotlin combines features of both object-oriented and functional programming, whereas Java is limited to object-oriented programming.

      * Null Safety
      * Extension Functions
      * Higher order function
      * Coroutines Support
      * Data classes
      * Smart casts
      * Type inference
      * No checked exceptions
   2. ✍️From java 8, It supports Functional programming. But Java does not truly support functional programming as Kotlin, Python or JavaScript does. However, using lambda expressions, functional interfaces, method references, streams, and the Optional class in Java allows us to imitate the behavior of functional programming.

### K111. What is the Key Difference between ‘ fold’ and ‘reduce’ in Kotlin?

Answer:

     1. **reduce**: The reduce function applies a binary operation to elements of the collection, starting from the first element and accumulating the result.

     2. It takes a binary operation as a parameter and returns a single accumulated result.
     3. Java equivalent **:** stream.**reduce**(identity, accumulator)  \-\> (reduces the stream to a single value using the accumulator function and an identity value)

| val numbers \= *listOf*(1, 2, 3, 4, 5) val sum \= numbers.*reduce* { acc, num \-\> acc \+ num } *println*(sum) *// Output: 15 (1 \+ 2 \+ 3 \+ 4 \+ 5\)* |
| :---- |

> ✦ **Additional notes**

- **`fold(initial)`** takes an initial value, the result type can differ from the element type, and it returns the initial value on an empty collection.
- **`reduce`** uses the first element as the starting value, the result type is the same as the element type, and it throws on an empty collection (use `reduceOrNull`).

```kotlin
listOf(1, 2, 3).fold(10) { acc, x -> acc + x }   // 16
listOf(1, 2, 3).reduce { acc, x -> acc + x }     // 6
```

### K112. What is Ranges Operator?

Answer:

> ✦ **Added answer**

The `..` operator (`rangeTo`) creates a range: `1..5`. Related: `until` (excludes end), `downTo`, `step`, and `in` / `!in` for membership.

```kotlin
for (i in 1..5) {}          // 1,2,3,4,5
for (i in 1 until 5) {}     // 1,2,3,4
for (i in 5 downTo 1 step 2) {} // 5,3,1
if (x in 1..10) { }
```

### K113. What is the method to Compare Two Strings in Kotlin?

Answer:

> ✦ **Added answer**

- `==` → **structural** equality (calls `equals()`), so `"a" == "a"` is `true`.
- `===` → **referential** equality (same object).
- `a.equals(b, ignoreCase = true)` → case-insensitive comparison.
- `a.compareTo(b)` → ordering (negative, 0, positive).

### K114. Is there a ternary operator in Kotlin like there is in Java?

Answer:

> ✦ **Added answer**

No. `if` is an expression, so use `val max = if (a > b) a else b`. For null defaults use the Elvis operator: `val name = input ?: "Unknown"`.

### K115. In Kotlin, can we use primitive types like int, double, and float?

Answer:

> ✦ **Added answer**

Not directly – you write `Int`, `Double`, `Float` (they look like classes). The compiler maps non-null values to JVM primitives (`int`, `double`) for performance, and uses boxed types (`Integer`) when the type is nullable (`Int?`) or used as a generic argument (`List<Int>`).

### K116. What is the main difference between FlatMap and Map?

Answer:

> ✦ **Added answer**

`map` transforms each element **one-to-one** (result has the same size). `flatMap` transforms each element into a collection and then **flattens** all results into one list.

```kotlin
val l = listOf("ab", "cd")
l.map { it.toList() }      // [[a, b], [c, d]]
l.flatMap { it.toList() }  // [a, b, c, d]
```

### K117. What is the critical difference between List and Array types in Kotlin?

Answer:

> ✦ **Added answer**

- **Array** has a fixed size, elements are mutable, it maps to a Java array, and it is invariant (`Array<T>`).
- **List** is a read-only interface (use `MutableList` / `ArrayList` to modify, which can grow), it is covariant, and it has many more collection functions.
- Arrays have primitive-specialised versions such as `IntArray`.

### K118. In Kotlin, can we use the new keyword to create a class object?

Answer:

> ✦ **Added answer**

No. Kotlin has no `new` keyword – call the constructor like a function: `val p = Person("Ann")`.

### K119. What is the double-bang!! Operator in Kotlin?

Answer:

    1. The Not Null Assertion operator \!\! is used to assert that a nullable type is not null and **convert it to a non-nullable type**.
    2. we use Null checks (\!\!) only when we are confident that the property **can't have a null value.**
    3. It tells the compiler that you are certain the value is not null, and if it happens to be null, a **NullPointerException** will be thrown at runtime.

### K120. What's the difference between blocking and suspending?

Answer:

> ✦ **Added answer**

- **Blocking** (`Thread.sleep`, blocking I/O) holds the thread until the work finishes, so the thread is wasted.
- **Suspending** (`delay`, `await`) pauses only the *coroutine*, frees the thread for other work, and resumes later (possibly on another thread).
- `suspend` functions can be called only from a coroutine or another suspend function; `runBlocking` bridges blocking and suspending code.

### K121. In Kotlin, what is the main difference between open and public?

Answer:

> ✦ **Added answer**

They answer different questions. **`public`** is a *visibility* modifier (the default) – who can see the declaration. **`open`** is an *inheritance* modifier – whether a class can be subclassed or a member overridden (Kotlin classes and members are `final` by default).

### K122. In Kotlin, what is used as an equivalent of Java static?

Answer:

   1. It is used to define **static methods and properties** for the class.
   2.  \*A companion object is a special object which is **bound to the class**. It can be accessed using the name of the enclosing class.
   3. Use companion object when you want to define **static members** (properties and methods) that are **associated with a specific class**.
   4. \*It’s an alternative to static in Java.
   5. It can contain properties and methods.
   6. Some other points:
      * Each class can have **only one** companion object.
      * The members of the companion object can be **accessed using the class name** as the qualifier, similar to calling a static method or property in Java.
      * The companion object **can have a name**, which can be used to access its members from outside the class.
      * The companion object can implement interfaces and inherit from other classes.
      * The members of the companion object can be declared as private, protected, internal, or public, just like class members.
   7. Ex:
      **class** MyClass {
         **companion object** {
             **const val CONSTANT** \= 42

             **fun** myFunction() {
                 *println*(**"This is a function in the companion object"**)
             }
         }
      }

   In other Class:

      **val myConstant** \= MyClass.**CONSTANT**

      MyClass.*myFunction()*

   Some other points 2:

   8. The companion object does not create a shared instance across the application; each class with a companion object has its own separate instance of the companion object.
   9. Definition 2 : It’s used to define members (properties and methods) that are tied to the class itself rather than to instances of the class.
   10. Definition 3 : We can write in any class with companion object and it can be accessed in any other classes.

### K123. What is the meaning of Pair and Triple in Kotlin?

Answer:

> ✦ **Added answer**

Small generic data classes that hold 2 (`Pair<A, B>`) or 3 (`Triple<A, B, C>`) values without declaring a class. Access with `.first`, `.second`, `.third` or destructure them.

```kotlin
val p = Pair("age", 30)       // or "age" to 30
val (key, value) = p
val t = Triple(1, "a", true)
```

### K124. What do you mean by Label?

Answer:

> ✦ **Added answer**

A label (`name@`) marks an expression so you can say exactly which loop or lambda to jump out of or refer to.

```kotlin
outer@ for (i in 1..3) { for (j in 1..3) { if (j == 2) continue@outer } }
list.forEach { if (it == 0) return@forEach }
this@MainActivity   // refer to an outer `this`
```

### K125. Which one is better to use - val mutableList or var immutableList in the context of Kotlin?

Answer:

> ✦ **Added answer**

Both prevent some mistakes, with different trade-offs:
- **`val list = mutableListOf()`** – the reference can't change but contents can. Fine for local building.
- **`var list: List<T>`** – contents can't change; you replace the whole list on each update (copy-on-write). Safer to share between threads and works well for UI state (`StateFlow<List<T>>`).

A common rule: prefer **immutable data** (`val`/`List`) and expose read-only types, keeping mutable ones private.

### K126. How can you create a singleton in Kotlin?

Answer:

   1. **Singleton Object:**
      * It is used to **declare a singleton object**.
      * A singleton class is a class that can only have one instance. Which can be accessed globally, such as a database connection, retrofit instance or a logger.

      **// singleton Object declaration**

      **object** Singleton{

         **var variableName** \= **"I am Var"**

      }

   2. **Anonymous Object:**
      * It also used to define **anonymous classes and objects**.
      * An object expression **creates** an **instance of an anonymous class**.
      * Anonymous classes are useful for creating **temporary objects,** these are useful for one-time use.
      * Anonymous objects are objects that are created without explicitly declaring a named class.

      ***// Object expression***

      **val myObject \= object : MouseAdapter() {**

         **override fun mouseClicked(e: MouseEvent) {**

             ***// Do something***

         **}**

      **}**

### K127. How would you ensure Null safety in Kotlin?

Answer:

**What is Safe call operator?**

    1. Kotlin null safety is a procedure to **eliminate the risk of null reference** from the code.
    2. (?.) is the null safety operator. Also called **safe call operator**.
    3. The safe call operator ?. is used to safely **access** properties or call methods **on nullable objects**.
    4. This operator executes only when the reference has a **non-null value**.
    5. If the reference is null, the **expression** using the null safety operator will result in a **null value**.

**What is Not Null Assertion operator?**

    1. The Not Null Assertion operator \!\! is used to assert that a nullable type is not null and **convert it to a non-nullable type**.
    2. we use Null checks (\!\!) only when we are confident that the property **can't have a null value.**
    3. It tells the compiler that you are certain the value is not null, and if it happens to be null, a **NullPointerException** will be thrown at runtime.

**What is Elvis operator (?:) Means in Kotlin?**

    1. The Elvis operator ?: is used **to provide a default value** when dealing with **nullable** types.
    2. It is used for null safety.
    3. **a ?: b** is just shorthand for **if** **(a \!= null) a else b**

### K128. Using an example, show how you would create a lambda expression in Kotlin?

Answer:

    1. It is a concise way to represent an anonymous function in programming.
    2. Lambdas are often **used to pass behavior as an argument** to **higher-order functions**.

| val sum \= { a: Int, b: Int \-\> a \+ b } *println*(sum(3, 5)) *// Output: 8* |
| :---- |

### K129. How can you sort a list in Kotlin?

Answer:

> ✦ **Added answer**

```kotlin
val l = listOf(3, 1, 2)
l.sorted()                      // ascending
l.sortedDescending()
people.sortedBy { it.age }
people.sortedWith(compareBy({ it.age }, { it.name }))
mutable.sort()                  // in place on a MutableList
```

### K130. Is it possible to use Array<Int> and IntArray interchangeably in Kotlin?

Answer:

> ✦ **Added answer**

No. `Array<Int>` compiles to `Integer[]` (boxed), while `IntArray` compiles to `int[]` (primitive, faster, less memory). They are different types – convert with `toIntArray()` / `toTypedArray()`.

### K131. Can you figure out what is wrong with this code? How would you fix it?

Answer:

> ✦ **Added answer**

*The code snippet for this question isn't included in your source file.* Typical things to look for: nullable access without a safe call, mutating a `val`/read-only list, blocking the main thread inside a coroutine, using `!!`, missing `override` or `open`, and platform-type surprises from Java.

### K132. How would you refactor this code using apply?

Answer:

> ✦ **Added answer**

`apply` configures an object and returns the object itself (`this` inside the block):

```kotlin
// before
val p = Person()
p.name = "Ann"
p.age = 25
// after
val p = Person().apply { name = "Ann"; age = 25 }
```

### K133. Can you explain the differences between a lambda expression and an anonymous function?

Answer:

    1. It is a concise way to represent an anonymous function in programming.
    2. Lambdas are often **used to pass behavior as an argument** to **higher-order functions**.

| val sum \= { a: Int, b: Int \-\> a \+ b } *println*(sum(3, 5)) *// Output: 8* |
| :---- |

> ✦ **Additional notes**

- **Lambda**: `{ x: Int -> x * 2 }` – concise; `return` isn't allowed unqualified (use `return@label`), though in an *inline* lambda a plain `return` returns from the enclosing function (non-local return).
- **Anonymous function**: `fun(x: Int): Int { return x * 2 }` – can declare an explicit return type, and `return` returns from the anonymous function itself.

### K134. Can you explain what kind of class is being instantiated in the code below?

Answer:

> ✦ **Added answer**

*The code snippet isn't included in your source file.* In this kind of question the answer is usually an **anonymous object** (`object : SomeInterface { ... }`, an anonymous class), a **data class**, a **companion/object** declaration, or a **sealed class subclass** – identify it from the keyword used (`object :`, `data`, `sealed`, `enum`).

### K135. What are reified types in Kotlin?

Answer:

    1. only possible in inline functions, allowing type checks at runtime.

> ✦ **Additional notes**

Normally generic type information is erased at runtime. In an **`inline` function**, marking the type parameter `reified` keeps the real type so you can use `T::class`, `is T`, etc.

```kotlin
inline fun <reified T> Gson.fromJson(json: String): T = fromJson(json, T::class.java)
```

### K136. What is an Inline class? How does it work in code?

Answer:

> ✦ **Added answer**

A **value class** (formerly inline class) wraps a single value to give it a distinct type with little or no runtime overhead – the compiler uses the underlying value where it can.

```kotlin
@JvmInline
value class Password(val value: String)
fun login(p: Password) { }
```
It can have only one property in the primary constructor and is boxed when used as a nullable or generic type.

### K137. Modifiers in Kotlin?

Answer:

**What is Visibility modifiers in kotlin?**

    1. used to **restrict the accessibility** of classes, objects, interfaces, constructors, functions, properties, and their setters to a certain level.
    2.
    3.

**What are the different class declaration / inheritance modifiers in kotlin?**

    * open
      * final
      * sealed
      * abstract
    2. **open**: Indicates that the class **can be inherited** from by other classes.
    3. **final**: Indicates that the class **cannot be inherited**. This modifier is the opposite of "open". In Kotlin this is the **default** **modifier**.
    4. **sealed:**  Indicates that the class is a **restricted form of "open" class**. It **can be extended only within the same file** where the sealed class is declared.
    5. **abstract**: This keyword is used to mark a class as abstract. This means that the class **cannot be instantiated,** and **must be subclassed**.

### K138. Inline classes vs. Type aliases?

Answer:

> ✦ **Added answer**

- **`typealias`** is only another *name* for an existing type – no new type and no type safety (`typealias Id = Int` accepts any `Int`).
- **Value (inline) class** creates a *new, distinct type* (`Id` ≠ `Int`) with compile-time type safety, with little runtime cost.

### K139. What is the use of with scope function?

Answer:

    1. Scope functions are functions that **execute a block of code** within the **context of an object**.
    2. Scope functions make code more **readable, clear and concise**.
    3. Scope Functions gives **temporary scope to the object**, where specific operations can be applied to the object within the block of code.
    4. There are five scoped functions in Kotlin: **let , run , with , also and apply.**
    5.
    6. Functionality wise, all scope functions have almost the same functionality. Each one has some different properties.
    7. **Readability tips**
       * Prefer **apply/also** for object configuration/side effects — that signals intent to readers.
       * Use **let** when you intentionally want an it variable or short null-safe scope.
       * Use **run** or **with** when this makes code clearer (avoid it for multi-line blocks).

### K140. what is Singleton class how to create it in Kotlin?

Answer:

   1. **Singleton Object:**
      * It is used to **declare a singleton object**.
      * A singleton class is a class that can only have one instance. Which can be accessed globally, such as a database connection, retrofit instance or a logger.

      **// singleton Object declaration**

      **object** Singleton{

         **var variableName** \= **"I am Var"**

      }

   2. **Anonymous Object:**
      * It also used to define **anonymous classes and objects**.
      * An object expression **creates** an **instance of an anonymous class**.
      * Anonymous classes are useful for creating **temporary objects,** these are useful for one-time use.
      * Anonymous objects are objects that are created without explicitly declaring a named class.

      ***// Object expression***

      **val myObject \= object : MouseAdapter() {**

         **override fun mouseClicked(e: MouseEvent) {**

             ***// Do something***

         **}**

      **}**

### K141. What are new features in Kotlin over Java?

Answer:

   1. Kotlin combines features of both object-oriented and functional programming, whereas Java is limited to object-oriented programming.

      * Null Safety
      * Extension Functions
      * Higher order function
      * Coroutines Support
      * Data classes
      * Smart casts
      * Type inference
      * No checked exceptions
   2. ✍️From java 8, It supports Functional programming. But Java does not truly support functional programming as Kotlin, Python or JavaScript does. However, using lambda expressions, functional interfaces, method references, streams, and the Optional class in Java allows us to imitate the behavior of functional programming.

### K142. Types of constructors in kotlin? If we want to run a function before the constructor what to do?

Answer:

    1. **Primary Constructor:**
       * The primary constructor is defined as **part of the class header**. It is declared after the class name and can include constructor parameters.
       * The primary constructor for the data class **must have at least one parameter**.
       * The primary constructor parameters can be declared with **optional val or var** keywords to create corresponding properties.
       * If the primary constructor does not have any annotations or visibility modifiers, the constructor keyword can be omitted.
       * The initialization logic of properties and other code can be placed directly in the class body.

       **class Person(val name: String, var age: Int) {**

          **init {**

              ***println*("Initializing Person object")**

          **}**

          **fun introduce() {**

              ***println*("My name is \$name, and I am \$age years old.")**

          **}**

       **}**

    2. **Secondary Constructors:**
       * Secondary constructors are optional and are declared using the **constructor** keyword. They provide additional ways to create objects of a class.
       * Secondary constructors must delegate to the primary constructor using the ‘**this’** keyword. This can be done either directly or indirectly through other secondary constructors.
       * Each secondary constructor can have its own initialization code.

       **class Person(val name: String, var age: Int) {**

          **constructor(name: String) : this(name, 0) {**

              ***println*("Secondary constructor called")**

          **}**

          **init {**

              ***println*("Initializing Person object")**

          **}**

          **fun introduce() {**

              ***println*("My name is \$name, and I am \$age years old.")**

          **}**

       **}**

    3. **Execution order:**
       * Primary constructor
       * Init block

       **(or)**

       1. Init block
       2. Secondary constructor
    4. **Notes**:
       * Constructor parameters are **val** by default in Kotlin.
       * You can explicitly declare them using either the **val** or **var** keyword.

> ✦ **Additional notes**

To run code at construction time use an **`init` block** – it runs as part of the primary constructor, in order with property initialisers, before any secondary-constructor body. To run something *before* the object is created, call the function in the delegation argument (`constructor(x: Int) : this(compute(x))`) or use a factory function in a `companion object`.

### K143. What are the operators in Kotlin?

Answer:

    1. Elvis Operator (**?:**)
    2. Safe Call Operator (**?.**)
    3. Not-Null Assertion Operator (**\!\!.**)
    4. Range Operator (**..**)
    5. in Operator (**in**)
    6. is Operator (**is**) (in java **instanceof**)
    7. Assertion Operator (**assert**) \- used in testing
    8. Spread Operator (**\***)

### K144. Why do we use lateinit? Difference without lateinit?

Answer:

**When to use the lateinit keyword?**

    1. The lateinit keyword is used **for the variables, which are initialized later,** before its first access**.**
    2.  It can only be used with **mutable** data types, such as **var**.

       **//Example1: Initializing in a Separate Method:**

       **class MyClass {**
          **private lateinit var someProperty: SomeClass**

          **fun initialize() {**
              ***// Perform complex initialization logic***
              **someProperty \= SomeClass()**
          **}**

          **fun useProperty() {**
              ***// Ensure someProperty is initialized before using it***
              **if (::someProperty.*isInitialized*) {**
                  ***// Access and use someProperty***
                  **someProperty.doSomething()**
              **}**
          **}**
       **}**

**//Example2: Android Views:**

**class MyFragment : Fragment() {**
   **//declared**
   **private lateinit var textView: TextView**

   **override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {**
       **val view \= inflater.inflate(R.layout.fragment\_my, container, false)**
      	 **//initialized**
 **textView \= view.findViewById(R.id.textView)**
       **return view**
   **}**

   **override fun onViewCreated(view: View, savedInstanceState: Bundle?) {**
       **super.onViewCreated(view, savedInstanceState)**
       **//(check .isInitializing when we need it in logic. Here not needed)**
 **textView.text \= "Hello, World\!"**
   **}**
**}**

**What is the difference between lateinit and lazy kotlin?**

    1. **lateinit can only be used with a var property whereas lazy will always be used with val property**.
    2. A lateinit property **can be** **reinitialised** **again** and again as per the use whereas the lazy property can only be initialized once.

    **class** Demo {

       **lateinit var name**: String

       **val myName**: String **by** *lazy* **{**

           **"www\.tutorialspoint.com"**

       **}**

    }

    **fun** main() {

       **var** obj \= Demo();

    *//lazy call*

       *println*(obj.**myName**);

    *// latinit call*

       obj.**name** \= **"www\.tutorialspoint.com/"**

       **if** (obj::**name**.isInitialized)*//check initialization*

           *println*(obj.**name**)

    }

|  | `lateinit` | `lazy` |
| ----- | ----- | ----- |
| **Meaning** | "I'll initialize it later." | "Initialize it when I need it." |
| **Declared with** | `var` | `val` |
| **Example** | `lateinit var name: String``name = "Munirajan"` | `val name by lazy { "Munirajan" }` |
| **Who sets the value?** | You, manually | The lambda, on first access |
| **Mutable?** | Yes | No (read-only) |
| **Allowed types** | Non-null, non-primitive | Any type |
| **If accessed too early** | Throws `UninitializedPropertyAccessException` | Can't happen, it self-initializes |
| **Check if initialized** | `::name.isInitialized` | Not needed |
| **Typical Android use** | Views, injected dependencies, `binding` | Expensive objects, `by lazy { ViewModel }` |

### K145. Difference between enum and sealed class?

Answer:

    1. Sealed class is a restricted form of open class.
       * Which means, It **can be extended only within the same file** where the sealed class is declared
    2. Enum classes allow us to define a fixed set of options or choices, while sealed classes enabling the creation of restricted class hierarchies with distinct states or outcomes.
    3.

| Enum | Sealed class |
| ----- | ----- |
| Enum classes allow us **to define a fixed set of options** or choices | It's often used to represent restricted hierarchies, where we want **to define a limited set of subclasses** and **prevent the creation of additional subclasses outside** that set.  |
|  | Sealed classes **can contain data** and **behavior**, making them more flexible than enums. |
|  | works well with when expressions for pattern matching. |
|  | **can be extended** in the future **without breaking** existing code. |

    4.

| enum class Color {    RED, GREEN, BLUE } fun main() {    val selectedColor: Color \= Color.RED    when (selectedColor) {        Color.RED \-\> println("Selected color is Red")        Color.GREEN \-\> println("Selected color is Green")        Color.BLUE \-\> println("Selected color is Blue")    } } |
| :---- |
| **sealed class Result {    data class Success(val data: String) : Result()    data class Error(val message: String) : Result() } fun handleResult(result: Result) {    when (result) {        is Result.Success \-\> println("Success: \${result.data}")        is Result.Error \-\> println("Error: \${result.message}")    } }** |

    5.

### K146. Where have you used lazy in real time projects?

Answer:

> ✦ **Added answer**

Typical real uses: `by lazy` for expensive objects created once on first use – a Retrofit/OkHttp instance, Room database, `Gson`, a ViewBinding in a Fragment, `by viewModels()`/`by activityViewModels()` (lazy delegates), heavy regex or formatters, and values read from `intent.extras`.

### K147. Where have you used Scope functions in real time projects?

Answer:

> ✦ **Added answer**

- `let` – null checks (`user?.let { ... }`) and mapping a value.
- `apply` – configuring objects (Intent, Bundle, Fragment arguments, Retrofit builders, View properties).
- `also` – side effects such as logging.
- `run` / `with` – grouping calls on one object, e.g. `with(binding) { ... }`.

### K148. Where have you used coroutines in real time projects?

Answer:

> ✦ **Added answer**

Network calls with Retrofit `suspend` functions, Room queries off the main thread, `viewModelScope.launch` for loading data, `withContext(Dispatchers.IO)` for file or database work, `async`/`await` for parallel API calls, `Flow` / `StateFlow` for streams and UI state, and `lifecycleScope` with `repeatOnLifecycle` for collecting in the UI.

### K149. How /where will you use unconfined dispatcher practically?

Answer:

    1. There are majorly 4 types of Dispatchers.
       * **Default** Dispatcher
       * **Main**  Dispatcher
       * **IO** Dispatcher
       * **Unconfined** Dispatcher

       1. Dispatchers.**Default**
       2. Dispatchers.**IO**
       3. Dispatchers.**Main**
       4. Dispatchers.**Unconfined**

    1.

| Dispatcher | Used For | Thread Type |
| ----- | ----- | ----- |
| Default | Heavy CPU work | Background (CPU optimized) |
| IO | Network / DB / File I/O | Background (I/O optimized) |
| Main | UI work | Main/UI thread |
| Unconfined | Lightweight / Testing | Starts on current thread |

    2.
    3. **Default dispatcher**:
       1.  It starts the coroutine in the **Default Thread**.
       2. The default dispatcher is used when no other dispatcher is specified.
       3. The Default dispatcher uses a **pool of threads intended for CPU-bound tasks.**
       4. **Used for:** CPU-intensive tasks
          1. Heavy calculations
          2. Parsing JSON
          3. Large sorting or filtering
          4. Data encryption, compression, or encoding etc.
       5. **Runs on:** Shared background thread pool

| *//filtering: viewModelScope*.*launch*(Dispatchers.IO) {    val flightList \= repository.getFlights()    withContext(Dispatchers.Default) {        flightList.groupBy { it.airline }            .mapValues { (\_, flights) \-\> flights.sortedBy { it.price } }    } } |
| :---- |

       6.
    4. **IO Dispatcher:**
       1. It starts the coroutine in the **IO thread.**
       2. **Used for:** Input/Output operations (network calls, database read/write, file read/write)
       3. **Runs on:** Optimized thread pool for blocking I/O tasks

| launch(Dispatchers.IO) {    val response \= apiService.getFlights() } |
| :---- |

    5. **Main Dispatcher:**
       1. It starts the coroutine in the **main thread**.
       2. It is mostly used when we need to perform the UI operations within the coroutine. Because we can change the UI from the main thread only.
       3. **Used for:** Updating UI (works on the main thread)
          1. Use for UI updates or calling **suspend functions that return data to display**.
       4. **Runs on:** Android main/UI thread

| launch(Dispatchers.Main) {    textView.text \= "Flight data loaded" } |
| :---- |
| **Example use of io/main dispatcher \- in project**  class FlightViewModel : ViewModel() {    private val repository \= FlightRepository()    val flights \= MutableLiveData\<List\<Flight\>\>()    val loading \= MutableLiveData\<Boolean\>()    val error \= MutableLiveData\<String\>()    fun fetchFlights() {        viewModelScope.launch(**Dispatchers.IO**) **{**            try {                *// Start loading (need Main dispatcher for UI)*                withContext(**Dispatchers.Main**) **{**                    loading.*value* \= true                **}**                val response \= repository.getFlights()                *// Switch to main thread to update LiveData/UI*                withContext(**Dispatchers.Main**) **{**                    loading.*value* \= false                    flights.*value* \= response                **}**            } catch (e: Exception) {                withContext(**Dispatchers.Main**) **{**                    loading.*value* \= false                    error.*value* \= e.message                **}**            }        **}**    } } |
| *viewModelScope*.**launch**(**Dispatchers.IO**) {    val response \= repository.getFlights()    val filteredFlights \= **withContext**(**Dispatchers.Default**) {        response            .filter { it.price \< 10000 }   *// heavy in-memory filtering*            .sortedBy { it.departureTime } *// sorting logic*    }    **withContext**(**Dispatchers.Main**) {        flightsLiveData.value \= filteredFlights    } } |

    6. **Unconfined Dispatcher:**
       1. It **does not confine** the coroutine to **any specific thread.**
       2. Instead it uses the thread in which the coroutine is currently executing **until the first suspension point**,
       3. After that, the coroutine **may continue** its execution on **any thread that is available**.

       4. ⭐When a coroutine starts with `Dispatchers.Unconfined`, it **runs immediately** in the **current thread** (no thread switching).
       5. If that coroutine later suspends (like waiting for a network call, delay, etc.), when it **resumes**, it can continue on **a different thread** — depending on who resumes it (e.g., a callback, another coroutine, etc.).

       6. It can be used mostly for testing purposes.
       7. ⭐Use Case: If your ViewModel (or any coroutine) uses the **main dispatcher**, then **yes**, you must call this.
          1. eg:  **withContext(Dispatchers.Main)**
          2. ***viewModelScope*****.*launch*(Dispatchers.Main)**
       8. In unit tests, **there’s no real Android Main thread**. So without setting it, your test will **crash with** `IllegalStateException: Module with the Main dispatcher had failed to initialize`.
       9. *It is not recommended normally by doc.*

| //testing example @OptIn(ExperimentalCoroutinesApi::class) class FlightViewModelTest {    private val testRepo \= FakeFlightRepository()    private lateinit var viewModel: FlightViewModel    @Before    fun setup() {        Dispatchers.setMain(Dispatchers.Unconfined)        viewModel \= FlightViewModel(testRepo)    }     @Test    fun \`test fetchFlights emits data\`() \= runBlocking {        viewModel.fetchFlights()        *// Observe instantly because Unconfined runs immediately*        val result \= viewModel.flights.getOrAwaitValue()        *assert*(result.isNotEmpty())    }    @After    fun tearDown() {        Dispatchers.resetMain()    } } |
| :---- |
| //normal use case(not recommended- just for understanding purpose) fun main() \= runBlocking **{**    *launch*(**Dispatchers.Unconfined**) **{**        *println*("Before delay on \${Thread.currentThread().*name*}")        **delay(100)**        *println*("After delay on \${Thread.currentThread().*name*}")    **} }** |
| Before delay on **main** After delay on **kotlinx.coroutines.DefaultExecutor** |

    7. Test case recommended is StandardTestDispatcher not **Dispatchers.Unconfined**

| Dispatcher | When to use | Recommended? | Why |
| ----- | ----- | ----- | ----- |
| Dispatchers.Unconfined | Quick, simple tests (no Main access) | ❌ Not ideal | Unpredictable timing |
| Dispatchers.IO / Default | Real code, not tests | ✅ For production | Proper threading |
| StandardTestDispatcher \+ MainDispatcherRule | Unit & instrumentation tests | ✅✅✅ Best practice | Stable, deterministic, official support |

    8.
    9.
    10. Other explanation from [stock overflow](https://stackoverflow.com/questions/55169711/when-should-i-use-dispatchers-unconfined-vs-emptycoroutinecontext):
        1. It executes coroutine immediately on the current thread and later resumes it in whatever thread called resume.
        2. It is usually a good fit for things like intercepting regular non-suspending API or invoking coroutine-related code from blocking world callbacks.
        3.
    11.

> ✦ **Additional notes**

`Dispatchers.Unconfined` starts the coroutine in the caller's thread and, after the first suspension, resumes on whatever thread the suspending function used. It's rarely right for application code; practical uses are **unit tests** or code that is not thread-sensitive and must run immediately (similar to `Dispatchers.Main.immediate`).

### K150. where will you use withContext?

Answer:

    1. used to **switch the context** of a coroutine to a **different thread**.
    2. Sometimes, we would like to have our coroutine switching between the Context, while being in the same coroutine. We can do so using withContext.
    3. This function will **shift execution of the block** into a **different thread** if a new dispatcher is specified. And it will get back to its original dispatcher when it completes.
    4. It’s a **suspend function**.
       * It **doesn’t create a new coroutine** (unlike `launch` or `async`)
         It just **suspends** the current coroutine, switches to the given context (like `Dispatchers.IO` or `Dispatchers.Default`), runs the block, and then returns the result.

### K151. write code for a coroutine run in io thread will return the result a string. then write it for withContext.

Answer:

> ✦ **Added answer**

```kotlin
// 1) async on IO, await the result
val deferred: Deferred<String> = scope.async(Dispatchers.IO) { "data from IO" }
val result: String = deferred.await()

// 2) withContext – switch context inside a suspend function
suspend fun loadData(): String = withContext(Dispatchers.IO) {
    "data from IO"
}
// usage
scope.launch { val s = loadData() }
```

### K152. Why do we use Coroutines?

Answer:

    1. Coroutines are a **concurrency design pattern** in Kotlin that simplify asynchronous programming.
    2. coroutines are **lightweight threads.**
    3. **a new way of writing asynchronous, non-blocking code**. It is called non-blocking since it does not block the main thread.
    4. Coroutines allow execution to be suspended and resumed later at some point in the future which is best suited for performing non-blocking operations in the case of multithreading.
    5. ⭐Link for complete explanation: [Coroutines \- medium](https://medium.com/swlh/coroutines-pilove-notes-cb83654a88d4)

### K153. Write syntax of Coroutines, Sealed Classes, Extension function, Generics in Kotlin

Answer:

> ✦ **Added answer**

```kotlin
// Coroutine
viewModelScope.launch { val r = withContext(Dispatchers.IO) { api.get() } }
suspend fun fetch(): String = "x"

// Sealed class
sealed class Result {
    data class Success(val data: String) : Result()
    data class Error(val e: Throwable) : Result()
    object Loading : Result()
}

// Extension function
fun String.isEmail(): Boolean = contains("@")

// Generics
class Box<T>(val item: T)
fun <T> List<T>.second(): T = this[1]
```

### K154. Write down logic in Kotlin for removing similar repeated characters with alternate case

Answer:

> ✦ **Added answer**

Examples: `aAbBcC → ""`, `abcCde → abde` – remove adjacent pairs of the same letter in different case (a stack solves it).

```kotlin
fun clean(s: String): String {
    val st = StringBuilder()
    for (c in s) {
        if (st.isNotEmpty() && st.last() != c && st.last().equals(c, ignoreCase = true))
            st.deleteCharAt(st.length - 1)
        else st.append(c)
    }
    return st.toString()
}
```

### K155. Scopes?

Answer:

    1. **GlobalScope** — If we specify ***GlobalScope***, the coroutine will work until application lifetime ends.
       * If we just want to have a simple launch without worrying about managing it, we can use GlobalScope.launch { }. However, this is not ideal, as per [this article](https://medium.com/mobile-app-development-publication/kotlin-coroutine-scope-context-and-job-made-simple-5adf89fcfe94#:~:text=CoroutineScope%20%E2%80%94%20This%20allows%20you%20to,end%20of%20Android%20Activity%20lifecycle.).
    2. **MainScope** — This will launch the coroutine in the main thread (UI thread) by default when using MainScope().launch { }.
    3. **CoroutineScope** — This allows us to define a custom scope by providing our own context.
       * CoroutineScope is the default scope for coroutines.
       * e.g. *CoroutineScope*(Dispatchers.**IO**).*launch* **{ }**.
    4. **LifecycleScope** —
       * This is an Android-specific coroutine scope.
       * It lives as long as the Lifecycle object such as **Activity/Fragment** is active.
    5. **ViewModelScope —** This scope will live as long the view model is alive.
       1\. 	Use ViewModelScope if you want to run coroutine in **ViewModel**.
       2\. 	Use LifecycleScope if you want to run coroutine in **Activity/Fragment**
       3\. 	Use CoroutineScope if you want to run coroutine for places **other than ViewModel and lifecycle owner**.
       4\.	 Use GlobalScope if you want to run coroutine with **application scope running task**.
       5\.	 Use RunBlocking if you want to run suspend function or library on regular blocking code. (runBlocking is a coroutine builder )
    6. (new) **supervisorScope —** SupervisorScope is used when you want to create a scope where the failure of one child coroutine doesn't cancel the others.
       * **Use it only with suspend function or within the coroutine.**

| //supervisorScope private fun fetchUsers() {    *viewModelScope*.*launch* {        uiState.postValue(UiState.Loading)        *// supervisorScope is needed, so that we can ignore error and continue        // here, more than two child jobs are running in parallel under a supervisor, one child job gets failed, we can continue with the other.*        supervisorScope {            val usersFromApiDeferred \= *async* { apiHelper.getUsersWithError() }            val moreUsersFromApiDeferred \= *async* { apiHelper.getMoreUsers() }            val usersFromApi \= try {                usersFromApiDeferred.await()            } catch (e: Exception) {                *emptyList*()            }            val moreUsersFromApi \= try {                moreUsersFromApiDeferred.await()            } catch (e: Exception) {                *emptyList*()            }            val allUsersFromApi \= *mutableListOf*\<ApiUser\>()            allUsersFromApi.addAll(usersFromApi)            allUsersFromApi.addAll(moreUsersFromApi)            uiState.postValue(UiState.Success(allUsersFromApi))        }    } }  |
| :---- |
| //SupervisorJob class AndroidViewModel() : ViewModel() {    val parentJob \= SupervisorJob()    val coroutineScope \= CoroutineScope(parentJob \+ Dispatchers.Default)    fun startCoroutine() {        val job1 \= coroutineScope.launch **{**            delay(500)            *// do things*        **}**        val job2 \= coroutineScope.launch **{**            delay(500)            *// do things*        **}**    }    override fun onCleared() {        super.onCleared()        this.parentJob.cancel()    }  |

### K156. Lambda expression?

Answer:

> ✦ **Added answer**

An anonymous function that can be passed around as a value. Kotlin: `val sum = { a: Int, b: Int -> a + b }`; the single parameter is `it` (`list.filter { it > 2 }`); a lambda that is the last argument can go outside the parentheses. Java 8: `(a, b) -> a + b` for functional interfaces.

### K157. What is enum?

Answer:

> ✦ **Added answer**

A type with a fixed set of named constants. Kotlin: `enum class Direction { NORTH, SOUTH }`, which can have properties, methods and implement interfaces. Use `entries` (or `values()`) and `valueOf()`. Unlike a `sealed class`, each enum constant is a single instance and can't carry different data per constant type.


## Android

### A001. What is the Android architecture?

Answer:

   1. Android architecture is **a software stack of components to support mobile device needs**. Android software stack contains a Linux Kernel, collection of libraries, Android runtime, application framework, and application.

### A002. Android Architecture components?

Answer:

   1. [https\://developer.android.com/topic/architecture](https://developer.android.com/topic/architecture)
   2. [https\://developer.android.com/codelabs/android-room-with-a-view-kotlin\#1](https://developer.android.com/codelabs/android-room-with-a-view-kotlin#1)
   3.

### A003. What is Linux kernel in Android Architecture?

Answer:

   1. Linux Kernel is the **heart of the android architecture**. It manages all the available drivers such as display drivers, camera drivers, Bluetooth drivers, audio drivers, memory drivers, etc. which are required during the runtime.

### A004. What does Android ART mean?

Answer:

   1. a.      Android Runtime is an application runtime environment used by the Android operating system.
      2. b.      ART performs the translation of the application's bytecode into native instructions that are later executed by the device's runtime environment.
      3. When an Android app is installed on a device, the app's bytecode is compiled into a machine code format called an "Ahead-of-Time" (AOT) compilation.
      4. This AOT compilation process happens **during the app installation**, rather than the just-in-time (JIT) compilation used by Dalvik at runtime.

### A005. What is ADB?

Answer:

   1. ADB, or Android Debug Bridge, is a **command-line tool** that is used to communicate with an Android device or emulator.
   2. We can use it for,
      1. Installing and uninstalling apps
      2. Debugging applications
      3. Copying files to and from the device
      4. Launching and controlling apps on the device
      5. Examining log output and performance data

### A006. What is Activity?

Answer:

    1. It represents a **single screen with a user interface (UI)** that the user can interact with.
    2. Each screen in an Android app is typically implemented as an activity.
    3.

### A007. What is fragment in Android?

Answer:

    1. a.      **Android Fragment** is the part of activity, it is also known as sub-activity. There can be more than one fragment in an activity. Fragments represent multiple screens inside one activity.
       2. b.
       3.

### A008. What is Android Activity “launchMode”?

Answer:

    1. an activity's "launchMode" is an attribute in manifest that determines how the activity is launched and **how it interacts with the system's task stack**.
    2. The launch mode determines how the activity is created and managed, and affects how it behaves when the user navigates back to it.
    3. There are four main launch modes in Android:
* [Launch modes of Android Activity \- DEV Community](https://dev.to/mohitrajput987/launch-modes-of-android-activity-59eo)
* [Android “launchMode” (Visualized) | by Mert SIMSEK](https://iammert.medium.com/android-launchmode-visualized-8843fc833dbe)
* [Android Launch Mode](https://medium.com/mindorks/android-launch-mode-787d28952959)
* ⭐[Android launchModes — Understanding the less understood\! | by Vishal Ratna | Medium](https://medium.com/@kiitvishal89/android-launchmodes-understanding-the-less-understood-e5530f28a058)
  1. **standard**: This is the **default** launch mode.
     1. It **creates a new instance of activity every time** even if the activity instance is already present.

     2. **singleTop**: This launch mode will **create a new instance of the activity only when it is not present on the top** of the task stack.
        1. **Otherwise** it will be **reused**. (If the activity is already at the top, the same instance will be reused ).
        2. **onNewIntent()** will be called with updated data.
        3.  This is the behavior expected from a combination of flag **FLAG\_ACTIVITY\_CLEAR\_TOP | FLAG\_ACTIVITY\_NEW\_TASK**

     3. **singleTask**: it will create a new Task and put an Activity as a root Activity. You need to assign **taskAffinity** attribute to the singleTask Activity like this.
        1. In this launch mode, if the activity doesn't exist in the current Task stack, a new task, and activity. otherwise onNewIntent() is called. Additionally, activities above it in the stack get destroyed.

| A →B →C launching D that has a singleTask launch mode A →B →C →D |
| :---- |
| if we **launch B** that also have has a **singleTask** launch mode **A →B**  **old instance of B** gets called and intent data route through **onNewIntent()** callback. Also, notice that **C and D activities get destroyed**. |

     4. **singleInstance**: This launch mode creates a new task and **places the activity in its own task**, so that it is the only activity in the task. **Other activities cannot be launched in the same task.**
        1. **singleInstance Activities cannot share a task with other Activities**

### A009. Tell activity lifecycle when switching to another activity?

Answer:

    1. **FIRST Activity onPause**
    2. SECOND Activity onCreate
    3. SECOND Activity onStart
    4. SECOND Activity onResume
    5. **FIRST Activity onStop**

### A010. Tell activity lifecycle when Onbackpress->?

Answer:

    1. TOP Activity onPause
    2. BACK Activity **onRestart**
    3. BACK Activity onStart
    4. BACK Activity onResume
    5. TOP Activity onStop

### A011. On Home press lifecycle ->?

Answer:

    1. onPause() \-\> onStop()
    2. onRestart() \-\> onStart() \-\> onResume()

### A012. What happen when orientation changed in lifecycle?

Answer:

    1. onPause();
    2. onSaveInstanceState();
    3. onStop();
    4. onDestroy();

    5. onCreate();
    6. onStart();
    7. onRestoreInstanceState();
    8. onResume();
       If you do long operation in onCreate() and want **prevent** re-create our activity add ***configChanges*** attribute in our **manifest**

### A013. How to pass data to another activity?

Answer:

    1. Using Intent putExtra()
    2. **Or** use Listeners
    3. Using ViewModel (for Shared Data):
    4. Using a Singleton (not recommended)
    5. Using a static variable (not recommended)

### A014. How to pass data to another fragment?

Answer:

    1. **ViewModel(latest)**:
       1. Create a shared ViewModel instance between the fragments or use a shared ViewModel from an activity.
       2. Store the data in the ViewModel in the sending fragment.
       3. Retrieve the data from the ViewModel in the receiving fragment.
       4. If  shared ViewModel instance between the fragments , Make sure that both fragments use the **activityViewModels()**
       5. Because both needs to share same **viewModelProvider**
       6. We can use normal variables or **Livedata**(recommended).

       private val sharedViewModel: SharedViewModel by activityViewModels()

    2. **interface callbacks(traditional method)**:
       1. Create an interface in the sending fragment with a method declaration.
       2. Implement the interface in the parent activity or another fragment that hosts both the sending and receiving fragments.
       3. Pass the data through the interface method from the sending fragment to the activity/parent fragment, and then to the receiving fragment.
    3. **Bundle as Arguments**:
       1. In the sending fragment, create a Bundle object and add data to it using key-value pairs.
       2. Set the arguments of the receiving fragment to the created Bundle.
       3. Access the data in the receiving fragment using the getArguments() method.

       e.g.  // Set Fragmentclass Arguments

          HomeFragment fragobj \= new HomeFragment();

          fragobj.setArguments(bundle);

          **Receiving in OnCreateView()**

          getArguments().getString("message");

    4. **startActivityForResult**:
       1. Start the receiving fragment from the sending fragment using startActivityForResult() method.
       2. In the receiving fragment, set the result using setResult() before finishing.
       3. Implement onActivityResult() in the sending fragment to receive the data passed back from the receiving fragment.

### A015. How to pass ArrayList to next activity?

Answer:

    * Object should be serializable or parcelable.
    * To get , use getIntent().getSerializableExtra()

### A016. Why we set setContentView in OnCreate not in onStart?

Answer:

    1. During the lifetime of Activity class onCreate gets called exactly once. onResume and onStart will get called multiple times without our Activity getting destroyed.

### A017. What is service?

Answer:

    1. A Service is an application component that can perform long-running operations in the background.
    2. It does not provide a user interface.
    3. Once started, a service might continue running for some time, even after the user switches to another application.

### A018. How to notify UI from the service?

Answer:

    1. Use a [bound service](https://developer.android.com/guide/components/bound-services.html) which enables the Activity to get a direct reference to the Service, thus allowing direct calls on it, rather than using Intents.
       1. Use RxJava to execute asynchronous operations to update UI.
       2. If the Service needs to continue background operations even when no Activity is running, also **start the service from the Application class** so that it does not get stopped when unbound.

    2.  Otherwise the simplest solution was to send a broadcast Message.

### A019. What is BoundService?

Answer:

    1. A BoundService is a Service that is bound to an activity/fragment. This means that the activity/fragment always knows if the service is running or not and, in addition, it gets access to the service’s public methods.

### A020. What is IntentService?

Answer:

    1. Like *Service*, ***IntentService*** runs on a separate thread, and **stops itself** automatically after it **completes its work**.
    2. It's like fire and forget.
    3. IntentService is usually used for **short tasks** that don’t need to be attached to any UI.

### A021. What is pending intent?

Answer:

    1. **Normal Use** : to launch an activity or service when the notification is tapped.
    2. Pending intent is the same as intent but will be triggered later in future **by some other applications**. Normal intent starts immediately.
    3. The most common use of PendingIntent is as the action associated with a notification.
    4. **Complete Explanation:** A PendingIntent is a token that you give to a foreign application (e.g. NotificationManager, AlarmManager, Home Screen AppWidgetManager, or other 3rd party applications), **which allows the foreign application to use our application's permissions to execute a predefined piece of code.**
    5. If you give the foreign application an Intent, it will execute our Intent with its own permissions. But if you give the foreign application a PendingIntent, that application will execute our Intent using our application's permission.

### A022. How can you handle background tasks in Android 11 and later versions?

Answer:

    1. In Android 11 and later versions, background task restrictions have become more stringent.
    2. **Foreground Services:** Perform long-running tasks by running them in a foreground service, which shows a persistent notification to the user.
    3. **WorkManager:** Schedule and manage background tasks efficiently, taking advantage of battery optimizations and network connectivity.
    4. **JobScheduler:** Schedule tasks based on specific conditions, such as device charging or network availability.
    5. **Firebase Cloud Messaging:** Utilize Firebase Cloud Messaging to trigger background tasks when a device receives a specific message.

### A023. How can you handle background tasks in Android 10 and before versions?

Answer:

    1. **Background** **Service**: You can use a background service to perform long-running tasks even when the app is not in the foreground. Services run on the main thread by default, so you need to handle background tasks on a separate thread to avoid blocking the main UI thread and prevent ANR (Application Not Responding) errors.
    2. **IntentService**: IntentService is a subclass of Service that handles each Intent in a worker thread, making it a good choice for handling background tasks sequentially.
    3. **Thread or AsyncTask**: You can use traditional Java threads or AsyncTask to execute background tasks. However, AsyncTask is now considered deprecated in favor of more robust approaches like Executors or Kotlin coroutines.
    4. **JobScheduler**: JobScheduler is available from Android 5.0 (API level 21\) and provides an efficient way to schedule background tasks based on conditions like network availability, charging status, etc. For Android 10 and before versions, you can use this as an alternative to foreground services to perform tasks periodically or under specific conditions.
    5. **AlarmManager**: AlarmManager allows you to schedule tasks at specific times or intervals, even if our app is not running. It is commonly used for repetitive tasks or tasks that need to occur at specific times.
    6. **BroadcastReceiver**: You can use a BroadcastReceiver to receive system-wide broadcasts and perform background tasks based on those events. For example, listening for network connectivity changes or receiving device boot-up events.

### A024. Difference between serializable and parcelable? Which is the best approach in Android?

Answer:

    1. **Serializable**
       1. Serializable is an empty interface.
       2. It is a Standard Java Interface
       3. It doesn’t have any pre-implemented methods.
       4. The main advantage of serializable is the creation and passing of data is very ***easy*** but it is a ***slow process*** compared to parcelable.
       5. Stores data as a file.
       6. It is slow because of creating a lot of garbage objects.
    2. **Parcelable**
       1. Parcelable is recommended approach(by google) for data transfers.
       2. It is an Android specific Interface.
       3. Parcelable is ***faster*** than serializable.
       4. Writing parcelable code is little bit ***complex*** compare to serialization.
       5. Stores data as IPC(Inter process communication)
       6.
    3.

### A025. What is the difference between a regular .png and a nine-patch image?

Answer:

    1. It is a **resizable bitmaps.**
    2. Usually that is used for background images.
    3. Ex. **background of a chat message**.
    4.
    5. 9 patch images will **never loose its sharpness** of its edges for bigger size or smaller size.
    6. 9-patch images are **lighter** than png images.
    7. We can convert png to 9-patch with the **draw-9-patch tool** in android.

### A026. Recyclerview vs listview?

Answer:

    1. Recyclerview 	Contains ViewHolder by default.
    2. In recycler view Mandatory ViewHolder pattern providing better performance
    3. In recycler view Advanced Layout Management capabilities for vertical and horizontal lists, grids and staggered grids. But list view has Vertical list only.
    4. recycler view supports notification of individual item changes. But in list view entire data change notification only available.
    5. Recyclerview has itemAnimator to make easy animations. In listview it’s very complex to implement.
    6. recyclerview has ItemTouchHelper enables you to implement drag and drop and swipe functionalities. Listview has not this.

### A027. What is meant by viewholder pattern?

Answer:

    1. A ViewHolder holds the reference to the id of the view resource and calls to the resource.
    2. it avoids the frequent call of findViewById() for each item when binding data, which will make it smooth.

### A028. View vs Viewgroup?

Answer:

> ✦ **Added answer**

A **View** is the basic UI building block that draws itself and handles events (`TextView`, `Button`). A **ViewGroup** is an invisible container that extends `View`, holds child views and defines how they are laid out (`LinearLayout`, `ConstraintLayout`, `RecyclerView`).

### A029. how to optimize recyclerview android?

Answer:

    1. Use Image-Loading Library. ...
       1. By using the Bitmap pool to avoid continuous allocation and deallocation of memory in our application, you reduce GC overhead, which results in a smooth-running application.
       2. Glide Using Bitmap Pool concept
    2. Use Notify Item...
    3. Do less in onBindViewHolder method. ...
    4. Avoid a nested views and try to use constraint layout
    5. Use setHasFixedSize. ...

### A030. What is Okhttp interceptor in Android?

Answer:

    1. *Interceptors are a powerful mechanism that can monitor, rewrite, and retry the API call. So basically, when we do some API call, we can monitor the call or perform some tasks.*
    2. *In simple words, Interceptors are like the security personnel in the security check process at the Airport.*
    3. *We can Add the Header like Authorization Token centrally*
    4. *We can Log the errors centrally*
    5. *We can cache the API response for offline-first App.*

### A031. How http caching will work in android?

Answer:

    1. Caching is nothing but a way to **store network fetched data** on a device’s storage and access later when the device is offline or we want the same data again and again.
    2. We can do it with Adding intercepters
    3. \* **Interceptors**
       1. Interceptor is a powerful component of this okhttp through which we can read and modify the requests and obviously, we will use this interceptor for our Cache control. There are two types of interceptor:
          1. Application Interceptors — Gets you the final response.
          2. Network Interceptors — To intercept intermediate requests.
       2. For caching, we will use Network interceptor.
    4. [Retrofit 2: Http Caching in Android | by SHISHIR](https://shishirthedev.medium.com/retrofit-2-http-response-caching-e769a27af29f)

### A032. Can you tell me about RxJava? How it works? And its functionalities?

Answer:

     1. RxJava is a ***3rd party library developed by Netflix.(ReactiveX for Java)***
     2. ***That uses observable sequences to perform asynchronous and event-based programming***.
     3. Its primary building blocks are triple O's, which stand for ***Operator, Observer, and Observables***.
     4. And we use them to complete asynchronous tasks in our project.

### A033. How will you handle error in RxJava?

Answer:

> ✦ **Added answer**

- Handle it in `subscribe(onNext, onError)`.
- Operators: `onErrorReturn`, `onErrorReturnItem`, `onErrorResumeNext`, `retry`, `retryWhen`, `doOnError`.
- For errors that can't be delivered (after disposal) set a global handler: `RxJavaPlugins.setErrorHandler { }`.

### A034. How custom error handler works?

Answer:

> ✦ **Added answer**

Options: a global `RxJavaPlugins.setErrorHandler { e -> ... }` for undeliverable errors, or a reusable `ObservableTransformer` / extension that maps exceptions (HTTP, IO) into domain error types (e.g. a sealed `Result`/`Error` class) before they reach the UI.

### A035. Explain the concept of dependency injection and its benefits in Android development?

Answer:

     1. Dependency injection (DI) is a design pattern that allows you to **separate the creation of objects from their usage**.
     2. This makes our code more modular and easier to test.
     3. Dependency injection frameworks
        1. **Dagger** \- Complex but have to learn
        2. **Koin** \- not recommended \- it’s easy but runtime DI. (Compile time is better)
        3. **Hilt, Dagger2 \-** better
        4. **Butter Knife \-** old \- not using now
     4. They are used to manage and inject dependencies, making the code **more testable, maintainable, and flexible**.

### A036. What is meant by dagger? How it works?

Answer:

     1. Dagger is a fully static, compile-time dependency injection framework.

### A037. What is meant by Hilt? How it works?

Answer:

     1. Hilt is a newer DI framework from jetpack components, that is built on top of Dagger. It is designed to make DI easier to use in Android development.
     2. [Androidexample365.com \- github example](https://github.com/isilsubasi08/Kotlin-Hilt?ref=androidexample365.com)

### A038. What is content provider?

Answer:

    1. SQLite database created on Android by one application is **usable only by that application**, not by other applications.
    2. If you need to **share data between applications**, you need to use the content provider model as recommended in Android.

### A039. What is MVVM pattern?Explain

Answer:

    1. That overcomes all drawbacks of MVP and MVC design patterns.
    2. MVVM **separates our UI (i.e. Activities and Fragments) from our business logic**.
    3. **Model**: This layer is responsible for the abstraction of the data sources. Model and ViewModel work together to get and save the data.
    4. **View**: The purpose of this layer is to inform the ViewModel about the user’s action. This layer observes the ViewModel and does not contain any kind of application logic.
    5. **ViewModel**: It serves as a link between the Model and the View.
    6. MVVM is a modern architectural pattern that leverages **data binding and reactive programming.**

### A040. What is ViewModel in MVVM?

Answer:

    1. It serves as a **link between the Model and the View**.
    2. The ViewModel class is designed to store and manage UI-related data in a lifecycle conscious way.
    3. The ViewModel class allows data to survive configuration changes such as screen rotations.

### A041. What is Model in MVVM?

Answer:

    1. This layer is **responsible for the abstraction of the data sources**.
    2. Model can be applied to a class which represents our application's data model, and will cause instances of the class to become observable, such that a read of a property of an instance of this class during the invocation of a composable function will cause that component to be "subscribed" to mutations of that instance.
    3. Composable functions which directly or indirectly read properties of the model class, the composables will be recomposed whenever any properties of the model are written to.

### A042. What is Repository in MVVM?

Answer:

    1. Repository modules handle data operations. They provide a clean API so that the rest of the app can retrieve this data easily.
    2. They know where to get the data from and what API calls to make when data is updated. You can consider repositories to be mediators between different data sources, such as persistent models, web services, and caches.

### A043. Steps to create MVVM in Android using Kotlin?

Answer:

    1. Add ViewModel and LiveData dependencies
    2. Create 4 packages namely \- model(data class), repository, view, viewmodel
    3. Create a Model(data class) class inside model package
    4. Create a ViewModel class inside ViewModel package
    5. Make a ViewModel class object using ViewProviders in our Activity/Fragment class
    6. Make a singleton Retrofit class for Retrofit client and attach a logger and write code for Retrofit
    7. Make a Repository class and link it to the Retrofit as shown in the code

### A044. MVVM sample project explanation?

Answer:

    1. Project Name: TaskList
    2. Project Description:
       1. TaskList is a simple Android application that allows users to manage their tasks. Users can add tasks, mark them as completed, and delete tasks.
    3. Project Structure:
       1. **Model**: Task.kt (data class representing a task)
       2. **View**: MainActivity.kt (activity displaying the task list and user interface)
       3. **ViewModel**: TaskViewModel.kt (manages the data and logic for the task list)
    4. Project Setup:
       1. Create a new Android project in Android Studio.
       2. Set up the necessary dependencies for MVVM, such as ViewModel and LiveData.
       3. Create the **Task model class** with **properties** like taskName, taskDescription, and isCompleted.
       4. Create the layout for the **MainActivity**, **contains views** including a RecyclerView to display the tasks.
       5. Create the **TaskViewModel** class, which **holds the list of tasks and exposes methods for adding, marking** **as completed**, and **deleting** tasks.
       6. Bind the MainActivity to the TaskViewModel using the **ViewModelProvider**.
       7. In the MainActivity, **observe changes** in the task list **using LiveData** and **update the RecyclerView** accordingly.
       8. Implement the necessary logic in the MainActivity to add new tasks, mark tasks as completed, and delete tasks.
    5.

### A045. Alternatives for AsyncTask?

Answer:

    1. ExecutorService(BG) with handler(UI)
    2. Thread(BG) with runOnUiThread(UI)
    3. RxJava
    4. CoroutineScope (in kotlin)

### A046. difference between Thread and Handler?

Answer:

    1. Thread : creates a **new thread** and runs tasks asynchronously.
    2. Handler : execute the code **later** in the **same thread**.

### A047. What is handler?

Answer:

    1. To update UI From Background thread.

### A048. View Binding Vs databinding?

Answer:

    1. With View binding we can access views by id directly without using findViewById()
    2. Data binding also includes view binding and we can use variables in xml files also and it has binding adapter support.

### A049. What is the purpose of the ConstraintLayout in Android?

Answer:

    1. ConstraintLayout allows you to position views **relative to each other**, rather than relative to the edges of the layout.
    2. This makes it much easier to create layouts that are **flexible and responsive to changes in screen size or orientation**.
    3. Benefits:
       1. **Flexibility**: ConstraintLayout layouts are **very flexible** and can be **resized or rotated without any problems.** This makes them ideal for apps that need to be able to adapt to different screen sizes or orientations.
       2. **Performance**: ConstraintLayout layouts are very performant, even on devices with limited resources. This is because ConstraintLayout layouts are **not nested**, which can lead to performance problems with other layout managers.
       3. **Ease of use:** ConstraintLayout is very easy to use, even for beginners. The Layout Editor in Android Studio provides a **good graphical interface that makes it easy to create** and edit ConstraintLayout layouts.
    4. Limitations:
       1. **Complexity**: ConstraintLayout layouts can be more complex than layouts created with other layout managers.
          This is because you need to explicitly define the constraints between views, rather than relying on the layout manager to automatically position the views.

### A050. Features of ConstraintLayout?

Answer:

    1. Guideline
    2. Bias
    3. Width/Height percent
    4. Barrier
    5. Chain
    6. Dimension Ratio
    7. Placeholder(for animating views by id like transition)
    8. Constraintsets(https\://www\.youtube.com/watch?v=-sPOtGqd5OA)

### A051. How to make ConstraintLayout work with percentage values?

Answer:

> ✦ **Added answer**

Set the dimension to `0dp` (match constraint) and use `app:layout_constraintWidth_percent="0.5"` (or `layout_constraintHeight_percent`). Alternatively place a **Guideline** with `app:layout_constraintGuide_percent="0.3"` and constrain views to it.

### A052. Barrier in constraint layout?

Answer:

    1. Similar to a guideline, a barrier is **an invisible line that you can use to constrain views**.
    2. Barriers were introduced t**o address an issue** that occurs with some frequency involving **overlapping components**.
    3. Except a barrier does not define its own position — instead, the barrier position moves based on the position of views contained within it.
    4.
    5.
       \<android.support.constraint.Barrier
               android:id\="@+id/barrier"
               android:layout\_width\="wrap\_content"
               android:layout\_height\="wrap\_content"
               app:barrierDirection\="right"
               app:constraint\_referenced\_ids\="button\_example,text\_view\_status" /\>

### A053. What is Chain in Constraint layout?

Answer:

    1. By using chain, for multiple views, we can control how the available space is divided between them.
    2. Types
       1. Spread Chain
       2. Spread inside Chain
       3. Packed chain
       4. Weighted Chain
    3. Spread Chain
       1.
    4. Spread Inside Chain
    5. Weighted Chain
    6. Packed Chain
    7.
    8.
    9.
    10.
    11.

### A054. What is dimension ratio?

Answer:

    1.
    2.
    3.    app:layout\_constraintDimensionRatio="h,15:9"

    **Android Advanced Questions**

### A055. What are Android Jetpack components.?

Answer:

    1. Jetpack Components is a **collection of Android libraries** that are **designed to simplify app development** and **improve app performance.**
    2. Some of the most commonly used Jetpack components are:
       1. Work Manager
       2. Room DB
       3. Navigation   \- My doc  \>\>  [Jetpack navigation](https://docs.google.com/document/d/1YLZqRkS73cF_ytI7H7zyXzOF6H3omeTruWb0w39oUtQ/edit?usp=sharing)**⭐**
       4. Paging
       5. Databinding
       6. LiveData
       7. ViewModel

### A056. Advantages of jetpack components?

Answer:

    1. **Increased Developer Productivity:** Jetpack components provide a set of ready-to-use libraries, tools, and architectural guidelines that help developers build Android apps more efficiently. They provide high-level abstractions and simplify complex tasks, reducing boilerplate code and saving development time.

    2. **Consistent and Modern APIs:** Jetpack components follow modern Android development practices and provide consistent APIs, making it easier to build robust and maintainable apps. They promote best practices such as separation of concerns, lifecycle awareness, and modularity, which leads to cleaner and more maintainable codebases.

    3. **Backward Compatibility:** Jetpack components are designed to be backward-compatible, meaning they work on a wide range of Android devices, including older versions of the Android platform. This allows developers to leverage new features and functionality without excluding users on older devices.

    4. **Lifecycle Management:** Jetpack components offer lifecycle-awareness, which simplifies managing Android lifecycle events. They provide built-in mechanisms to handle activities, fragments, services, and other components' lifecycles, reducing the risk of memory leaks and ensuring efficient resource management.

    5. **Architecture Guidance:** Jetpack components provide architectural guidelines and libraries like ViewModel, LiveData, Room, and DataBinding that support the adoption of modern architectural patterns such as MVVM (Model-View-ViewModel). These patterns promote separation of concerns, testability, and maintainability of the codebase.

    6. **Testability:** Jetpack components are designed to facilitate unit testing and integration testing. They provide test-friendly APIs, utilities, and frameworks that enable developers to write tests for their app's components, increasing code quality and reducing the likelihood of bugs.

    7. **Modular Design:** Jetpack components promote a modular approach to app development, allowing developers to break down their apps into smaller, reusable modules. This modular design facilitates code reusability, maintainability, and enables easier collaboration among team members.

    8. **Integration with Kotlin:** Jetpack components are designed to work seamlessly with the Kotlin programming language. They leverage Kotlin language features such as coroutines, extension functions, null safety, and Kotlin-specific APIs, enhancing the developer experience and productivity when using Kotlin for Android development.

    **Work Manager⭐**

### A057. What is meant by livedata?

Answer:

     1. LiveData is **an observable data holder class**.
     2. Unlike a regular observable,LiveData is **lifecycle-aware**, meaning it respects the lifecycle of other app components, such as activities, fragments, or services.
     3. So, it only updates app component observers that are in an active lifecycle state.

### A058. LiveData setValue vs postValue?

Answer:

     1. **setValue**  must be called from the main thread.
     2. If you need to set a value from a background thread, you can use **postValue(Object).**
        1. It Posts a task to a main thread to set the given value.

### A059. Advantages of Using LiveData?

Answer:

     1. \*\***Ensures our UI matches our data state**:\*\* LiveData follows the observer pattern. LiveData notifies Observer objects when the lifecycle state changes. You can consolidate our code to update the UI in these Observer objects. Instead of updating the UI every time the app data changes, our observer can update the UI every time there's a change.
     2. \*\***No memory leaks:**\*\*  Observers are bound to Lifecycle objects and clean up after themselves when their associated lifecycle is destroyed.
     3. \*\***No crashes due to stopped activities:**\*\* If the observer's lifecycle is inactive, such as in the case of an activity in the back stack, then it doesn't receive any LiveData events.
     4. \*\***No more manual lifecycle handling**:\*\* UI components just observe relevant data and don't stop or resume observation. LiveData automatically manages all of this since it's aware of the relevant lifecycle status changes while observing.
     5. \*\***Always up to date data:**\*\* If a lifecycle becomes inactive, it receives the latest data upon becoming active again. For example, an activity that was in the background receives the latest data right after it returns to the foreground.
     6. \*\***Proper configuration changes:**\*\* If an activity or fragment is recreated due to a configuration change, like device rotation, it immediately receives the latest available data.
     7. \*\***Sharing resources**:\*\* You can extend a LiveData object using the singleton pattern to wrap system services so that they can be shared in our app. The LiveData object connects to the system service once, and then any observer that needs the resource can just watch the LiveData object. For more information, see Extend LiveData.

### A060. What is WorkManager?

Answer:

    1. Android WorkManager simplifies and manages background tasks in Android applications.
    2. It guarantees to schedule and execute tasks **reliably**, even across device **reboots**.
    3. But it **will not execute in exact time**.⭐

       ***(explanation 2\)***
    4. It's used for background work that needs a combination of **opportunistic** and **guaranteed execution**.
    5. Opportunistic execution means that WorkManager will do our background work as soon as it can.
    6. Guaranteed execution means that WorkManager will take care of the logic to start our work under a variety of situations, even if you navigate away from our app.
    7. **Sample Uses:**
       1. Uploading logs
       2. Applying filters to images and saving the image
       3. Periodically syncing local data with the network

### A061. Work manager vs coroutine / background processing in latest Android Components?

Answer:

    1.

    2.
    3.

       **Approaches to background work:**
    1. **All persistent(பிடிவாதமான) work**: You should use [WorkManager](https://developer.android.com/guide/background/persistent#workmanager-features) for all forms of persistent work.
    2. **Immediate impersistent(உறுதியற்ற) work**: You should use [Kotlin coroutines](https://developer.android.com/kotlin/coroutines) for immediate impersistent work. For Java programming language users, read the [guide on threading](https://developer.android.com/guide/background/asynchronous/java-threads) for recommended options.
    3. **Long-running and deferrable(ஒத்திவைக்கக்கூடிய) impersistent work**: You shouldn't use long-running and deferrable impersistent work. You should instead complete such tasks through persistent work using WorkManager.
    4.
    5. Replace foreground service with workmanager:
       1. **Android 12** restricts launching foreground services from the background. For most cases, you should use setForeground() from **WorkManager** rather than handle foreground services ourself.
       2. Some use cases for using **foreground services directly** are as follows:
          1. Media playback
          2. Activity tracking
          3. Location sharing
          4. Voice or video calls

    6. Replaced Old APIs with workmanager:

### A062. What is navigation components in jetpack?

Answer:

     1. Jetpack's Navigation component helps you **implement navigation**, from simple button clicks to more complex patterns, such as app bars and the navigation drawer.
     2. The Navigation component also ensures a ***consistent and predictable user experience***
     3. Main Advantages:
        1. Handles Navigation
        2. Handles back stack
        3. Handles correct button
     4. ******

### A063. Major Parts of Jetpack Navigation components?

Answer:

     1. Navigation Graph
     2. NavHost
     3. NavController

### A064. What is Navigation Graph?

Answer:

     1. A *navigation graph* is a resource file that **contains all of our destinations and actions**. The graph represents all of our app's **navigation paths**.
     2. *Destinations* are the different content areas in our app.
     3. *Actions* are logical connections between our destinations that represent paths that users can take.

### A065. What is NavHost?

Answer:

     1. The navigation host is an empty **container** that **displays destinations from our navigation graph**.
     2. A navigation host must derive from [NavHost](https://developer.android.com/reference/androidx/navigation/NavHost). The Navigation component's default NavHost implementation, [NavHostFragment](https://developer.android.com/reference/androidx/navigation/fragment/NavHostFragment), handles swapping fragment destinations.

### A066. What is NavController?

Answer:

     1. It is an object that manages app navigation within a NavHost .
     2. Each NavHost has its own corresponding NavController .
     3. Navigating to a destination is done using a NavController.

### A067. What is room database?

Answer:

     1. Room acts as a layer on top of SQLite
     2. With the help of room we can quickly create sqlite databases and perform the crud operations.
     3. Room makes everything very easy and quick.

### A068. Primary components of Room Database?

Answer:

     1. The **database class** that holds the database and serves as the main access point for the underlying connection to our app's persisted data.
     2. **Data entities** that represent tables in our app's database.
     3. **Data access objects (DAOs)** that provide methods that our app can use to query, update, insert, and delete data in the database.

### A069. Important parts of Jetpack compose?

Answer:

     1. Composable Functions
     2. State Management
        1. ViewModel SaveableState
     3. Theming and Styles
        1. Custom Theming
     4. Layouts
        1. Column⭐
        2. Row⭐
        3. LazyColumn⭐
        4. LazyRow⭐
        5. LazyVerticalGrid
     5. Containers
        1. Box⭐
        2. Surface ⭐⭐⭐
        3. Card⭐
        4. ConstraintLayout⭐
        5. SubcomposeLayout
        6. Scaffold⭐
     6. Composable Modifiers⭐
     7. Foundation
        1. Canvas
        2. Image
        3. Shape
        4. Text
     8. Material Design Components
        1. AlertDialog
        2. Button
        3. Card
        4. Checkbox
        5. CircularProgressIndicator
        6. DropdownMenu
        7. FloatingActionButton
        8. ModalDrawerLayout
        9. RadioButton
        10. Scaffold
        11. Slider
        12. Snackbar
        13. Switch
        14. TextField
     9. Lazy Composition
        1. LazyColumn
        2. LazyRow
     10. Navigation component
     11. Animations
         1. Crossfade
     12. Custom Drawing with Canvas
     13. Compose Preview and Testing
     14. Custom Composables
     15. Side Effects APIs
     16. Compose Integration with Other Libraries:
         1. ViewModel Integration
         2. CoroutineScope
     17.

### A070. What are Composable Functions?

Answer:

     1. Jetpack Compose UI elements are created using composable functions, which are annotated with **@Composable**.
     2. These functions describe how UI elements should be rendered.
        @Composable
        fun Greeting(name: String) {
        Text(text \= "Hello, \$name\!")
        }

### A071. How State Management works in compose?

Answer:

     1. Compose provides **mutableStateOf** and **remember** to manage state in a composable function. State changes trigger recomposition of relevant parts of the UI.
        @Composable
        fun Counter() {

        var count by remember **{** mutableStateOf(0) **}**

        Button(onClick \= **{** count++ **}**) **{**

        Text("Count: \$count")

        **}**

        }

### A072. What is remember()?

Answer:

     1. The remember() function in Jetpack Compose is a **composable function that** creates a new mutable state variable that is backed by a function.
     2. It allows you to create a state object that will be remembered and maintained by Compose.
     3. This means that the value of the variable is only computed when it is first accessed, and it is then cached.
     4. This can be useful for improving performance, especially if the value of the variable is expensive to compute.

        val username \= remember { *mutableStateOf*(TextFieldValue()) }

### A073. What is MutableState?

Answer:

     1. The **MutableState** object can be used to store and manage the state of the value.
     2. **mutableStateOf** is a helper function that creates a state holder for a given value and returns a **MutableState** object.
     3.  The **initial value** of the MutableState object is set to TextFieldValue(), which is a value that represents the **content of a TextField** (in the above example).

### A074. Approach for Theming and Styles in compose?

Answer:

     1. Jetpack Compose allows you to customize the theme and styles for our app using **MaterialTheme** and **Typography**.

### A075. What are Composable Modifiers?

Answer:

     1. Modifiers are used to **apply styling and behavior** to composable functions. You can use them to set **padding, size, alignment**, and more.

        @Composable
        fun CustomButton() {

        Button(

        onClick \= **{** */\* Do something \*/* **}**,
        modifier \= Modifier
        .*padding*(16.*dp*)
        .*fillMaxWidth*()

        ) **{**
        Text("Click me\!")
        **}**

        }

     2. Compose allows you to compose multiple modifiers together using the **then** function, enabling more organized and reusable code.

        val customModifier \= Modifier.padding(16.dp).then(Modifier.fillMaxWidth())

### A076. What is Navigation in compose?

Answer:

     1. Jetpack Compose includes the **Navigation component** for **handling navigation between composables using routes and actions**.

        @Composable
        fun MyApp() {

        val navController \= rememberNavController()

        NavHost(navController, startDestination \= "home") **{**

        *composable*("home") **{** HomeScreen(navController) **}**
        *composable*("details/{itemId}") **{** backStackEntry **\-\>**

        val itemId \= backStackEntry.arguments?.getString("itemId")
        DetailsScreen(itemId)

        **}**

        **}**

        }

### A077. What are Side Effect APIs?

Answer:

     1. Jetpack Compose provides various side effect APIs like **LaunchedEffect, DisposableEffect, onCommit, and onDispose** to handle asynchronous tasks, perform cleanup, or interact with the Android system at specific points in the composition lifecycle.

     **### **RxJava**

### A078. Latest Android version?

Answer:

   1. Android 17(Cinnamon Bun)
      1. . It is currently rolling out to Pixel devices and will expand to other manufacturers in the coming months. Android 17 introduces **AI-driven features, mandatory large-screen resizability, enhanced privacy/security, and API level 37**.
   2. [Android version history \- Wikipedia](https://en.wikipedia.org/wiki/Android_version_history)
   3. Things to Note
      1. **Privacy Shift:** Background audio restrictions may affect music or podcast apps.
      2.

| Feature | Android 16 (Baklava) | Android 17 (Cinnamon Bun) |
| ----- | ----- | ----- |
| **Release Date** | June 2025 | June 2026 |
| **API Level** | 36 | 37 |
| **AI Features** | Limited Gemini integration | Full Gemini Omni, Lyria 3, AudioLM |
| **Resizability** | Optional for large screens | Mandatory resizability |
| **Security** | Standard threat detection | Live Threat Detection \+ Mark as Lost |
| **Media** | AV1 codec | VVC codec support |

### A079. Android Packaging process?

Answer:

   1. [Native Android Build Generation Process](https://basecamp.temenos.com/s/article-detail/a046A00000DNExWQAX/native-android-build-generation-process)
   2. Step1:
   3. Step 2 :
   4. Step 3 :
   5.  Complete Process:
   6.

### A080. What is DDMS?

Answer:

   1. DDMS stands for Dalvik Debug Monitor Server. It is a debugging tool provided by the Android SDK (Software Development Kit)
   2. It allows developers to monitor and debug Android applications running on an emulator or a connected Android device.
   3. Features and tools:
      1. Logcat
      2. Heap Viewer
      3. Allocation Tracker
      4. Network Statistics
      5. File Explorer
      6. Screen Capture
      7. Emulator Control

### A081. What is sdk and ndk?

Answer:

> ✦ **Added answer**

- **SDK** (Software Development Kit): the Android APIs, build tools, emulator and platform libraries used to write apps in Kotlin/Java.
- **NDK** (Native Development Kit): tools for writing parts of an app in **C/C++** and calling them through **JNI** – used for performance-critical code (games, audio/video, image processing) or reusing native libraries.

### A082. What are the (solid) S.O.L.I.D Principles in android?

Answer:

    [S.O.L.I.D Principles](https://www.linkedin.com/pulse/solid-principles-examples-kotlin-aalishan-ansari/?trackingId=PaBySuptRxCWscq%2BHW%2BX6A%3D%3D)

### A083. What is Activity & its Lifecycle?

Answer:

    1. It represents a **single screen with a user interface (UI)** that the user can interact with.
    2. Each screen in an Android app is typically implemented as an activity.
    3.

### A084. Tell all the Android application components.

Answer:

    1\)  Activities. An activity is a class that is considered as an entry point for users that represents a single screen. ...

    2\)    Services. ...

    3\)    Content Providers. ...

    4\)    Broadcast Receiver. ...

                                                        **i.** 	**Additional Components**

    1. Intents
       2. Views
          3. Notifications
             4. Fragments
             5. Layout XML Files
             6. Resources
             7. Widgets etc…

### A085. What is SavedStateHandle?Why do we need it?

Answer:

    1. ViewModel survives rotation, but **does not survive process death**.

    2. SavedStateHandle allows small UI state to be restored after the process is recreated.

    3. **Real-World Example:** Storing user-selected search filters or a multi-step form progress. If the user takes a call and the app process dies, their progress isn't wiped out.

    4. **Bonus Use Case**: ***Jetpack Navigation automatically injects destination arguments*** (like a \`userId\`) directly into the \`SavedStateHandle\` of the target ViewModel.

    5.

### A086. How many sensors in Android?

Answer:

    1. **Accelerometer**: Measures the acceleration of the device in three dimensions. It is commonly used for tilt and motion-based interactions.

    2. **Gyroscope**: Measures the rotation of the device around its three axes. It is used for precise motion tracking and orientation detection.

    3. **Proximity Sensor**: Detects the presence of an object near the device, often used to control the screen behavior during phone calls (turning off the screen when the device is held to the ear).

    4. **Ambient Light Sensor**: Measures the ambient light level, enabling automatic brightness adjustments of the display.

    5. **Magnetometer (Compass)**: Measures the magnetic field around the device, allowing it to act as a compass.

    6. **Fingerprint Sensor**: Allows biometric authentication and unlocking of the device.

    7. GPS (Global Positioning System): Provides geolocation information, enabling location-based services and navigation.

    8. Camera (Image Sensor): Captures still images and videos, essential for photography and video recording apps.

    9. Microphone (Audio Sensor): Captures audio input, used for voice recognition, audio recording, and other audio-related tasks.

    10. Orientation Sensor: Provides orientation data, including pitch, roll, and azimuth angles.

    11. Barometer: Measures atmospheric pressure, useful for altitude and weather-related applications.

    12. Step Counter and Step Detector: Counts the number of steps taken by the user.

    13. Heart Rate Sensor: Measures the user's heart rate.

    14. Pedometer: Counts the number of steps taken by the user.

### A087. how to use sensors in android?

Answer:

    1. use the **SensorManager** class to get the **list of available sensors**.

    2. Register a **SensorEventListener** to receive **sensor data updates**.

    3. Implement the **onSensorChanged** method in the SensorEventListener **to handle sensor data updates.**

    4. Get specific sensor data with **SensorEvent getType()** method
       @Override
       public void onSensorChanged(SensorEvent event) {
          if (event.sensor.getType() \== Sensor.TYPE\_ACCELEROMETER) {
              *// Get accelerometer sensor data*
              float xAxis \= event.values\[0\];
              float yAxis \= event.values\[1\];
              float zAxis \= event.values\[2\];

              *// Do something with the sensor data*
              *// For example, update UI based on the sensor data*
          }
       }

### A088. What do you know about deeplink?

Answer:

    1. Opening Apps specific activity with some data with respect to a link which we configured in manifest.
    2. For example, clicking on Registration email or forgot password email which moves us to a specific activity containing some specific data like user data.

### A089. how to improve memory management in android?

Answer:

    1. Release unused resources.
    2. Unregister listeners when no longer needed.
    3. Cancel tasks when not needed.
    4. Forward lifecycle methods to release resources.
    5. Use the latest versions of the SDKs

### A090. What is memory leak?

Answer:

    1. **The objects, which can not be collected by Garbage collector** that are not needed anymore are called memory leaks.
    2. A memory leak is a type of resource leak that occurs when a computer program does not release allocated memory that is no longer needed.
    3. It can be allocated to our app, leading to **OutOfMemoryError** which ultimately crashes the app.

### A091. What are some of the common improvements that fix memory leaks?

Answer:

    1. Broadcast Receivers
       1. properly **unregister** the **broadcast receiver**.
    2. **Never use static variables** to declare **views or activity context.**
       1. Use WeakReference.
    3. **Do not pass activity context to the Singleton** class.
       1. Instead pass **application Context.** (Or)
       2. Unregister the singleton class when **onDestroy** Called.
       3. Use WeakReference.
    4. Other:
       1. **Use `WeakReference`**: When holding references to **`Context`**, **`Activity`**, or other objects that should not prevent garbage collection, use **`WeakReference`** instead of strong references.
       2. **Avoid Static References**: Avoid using static references to **`Activity`** or **`Context`**, as they can prevent the activity from being garbage collected when it's no longer needed.
       3. **Use `Application` Context**: Use the **`Application`** context instead of the **`Activity`** context when possible, as the **`Application`** context has a longer lifecycle and is less likely to cause memory leaks.
       4. **Release Resources**: Ensure that you release resources such as **`Bitmaps`**, **`Cursors`**, or **`FileDescriptors`** when they are no longer needed, especially in long-running tasks or background threads.
       5. **Use `LeakCanary or Profiler`**: Use a tool like **`LeakCanary`** to detect and fix memory leaks in your app. **`LeakCanary`** can help you identify the source of the leak and provide guidance on how to fix it.

       6. **Avoid Excessive Memory Usage**: Be mindful of your app's memory usage and avoid loading large amounts of data into memory unnecessarily. Use efficient data structures and algorithms to minimize memory usage.
       7. **`View` Binding**: When using **`View`** binding, ensure that you properly release the binding in **`onDestroyView()`** to avoid holding onto references to **`View`** objects after the view is destroyed.
       8. **Use `Handler` with `WeakReference`**: When using a **`Handler`** in a **`Thread`** or **`AsyncTask`**, use a **`WeakReference`** to the **`Activity`** or **`Fragment`** to avoid holding a strong reference to it.
       9. **Avoid Anonymous Inner Classes**: Avoid using anonymous inner classes, especially when registering callbacks or listeners, as they can hold implicit references to the outer class and prevent it from being garbage collected.
       10.

### A092. What is WeakReference?

Answer:

    1. WeakReference is a class in Java that allows you **to maintain a reference to an object without preventing it from being garbage collected.**

### A093. Types of services in Android?

Answer:

    1. Foreground Service:

       1. A foreground service is a type of service that has a **high priority** and is designed to perform tasks that are **noticeable to the user**.

       2. It **must display a notification** to the user while running to indicate its ongoing operation.

       3. Foreground services are used for tasks that require continuous processing and should not be interrupted by the system, such as **playing music** in background while using other apps and **downloading files**.

       4. These services are **less likely to be killed by the system**, even under memory pressure.

       5. To create a foreground service, you must call **startForeground()** within the service to show the notification.

    2. Background Service:

       1. A background service is a type of service that runs in the background but **does not require a foreground notification** to be displayed.

       2. It is suitable for tasks that **can be performed without direct user interaction** and **do not require constant user awareness**.

       3. Background services are **more likely to be affected by the system's memory management** and **can be killed** if the system needs resources.

       4. Background services are typically used for tasks that run in the background, such as **syncing data** or **storing data**.

       5. To create a background service, you extend the Service class and **override** the **onStartCommand()** method.

    3. Bound Service:

       1. Bound services are services that can be **bound to other application components**, such as **activities and fragments**.

       2. This allows other components to **interact with the service** and send requests to it.

       3. Bound services are typically used for tasks **that require two-way communication**, such as **playing music within the app or receiving location updates**.

       4. To create a bound service, you extend the Service class and **implement** the **onBind()** **method**.

       5. When all clients unbind from the service, the system automatically stops the service.

### A094. What is the difference between MVP and MVVM?

Answer:

    1. In MVP, **view will have some functions** to make interactions with the presenter.
    2. In MVVM, **view don't have any functions**. ViewModel will directly updates views with databinding .
    3. Unlike MVVM, where the **view model might not be aware of the fragment or activity,** in MVP, there's a **mutual understanding between the presenter and the view.**

    4. in MVP, the Presenter is tied with the View.
    5. The view knows about the presenter because it holds a reference to the presenter, and presenter in turns holds the reference of the View.
    6. But in MVVM the view model is not tied to the view.
    7. Also the view still holds the reference to the ViewModels, the ViewModel knows nothing about the view.
    8. And MVVM promotes decoupling because we can have multiple views that are bound to the same ViewModel.

### A095. Difference MVC vs MVP?

Answer:

    1. In MVVM, ViewModel is **loosely coupled** with View. In MVC, controller is **tightly coupled** with view

    2. MVC:

       1. View and Controller are tightly coupled.

       2. Model is independent of View and Controller.

       3. Changes in View or Controller can impact each other.

       4. Violates separation of concerns.

       5. Difficult to write independent test cases for View and Controller.

    3. MVP (Model-View-Presenter):

       1. Presenter acts as an intermediary between Model and View.

       2. View is more passive and delegates user interactions to Presenter.

       3. Model remains independent of View and Presenter.

       4. Better separation of concerns compared to MVC.

       5. Better to write independent test cases for View and Presenter.

### A096. Clean Architecture?

Answer:

    1. Clean Architecture **emphasizes the separation of concerns and the dependency rule**.

    2. Use Clean Architecture **for large, complex projects** with a focus on maintainability and testability.

    3. It divides the codebase into layers: **Presentation, Domain, and Data,** each with its own responsibilities and dependencies.

    4. Clean Architecture allows for easy replacement of components and facilitates unit testing.

    5. However, it introduces **additional complexity** and can be over-engineered for smaller projects.

    6.

### A097. What are the advantages of MVVM?

Answer:

    1. The code is decoupled. Easily testable.
    2. Package structure is even easier to navigate.
    3. Project is even easier to maintain.
    4. Scalable — easy to add new features.

    Advantages of MVVM: (detailed)

    5. **Easier to Test**: Because the **ViewModel** and **Model** are **completely independent** from the **View**, developers **can write tests for both** without having to use the View.

    6. **Easier to maintain**: The separation between the different components of the application makes the code simpler and cleaner.

### A098. Disadvantages of MVVM?

Answer:

    1. Complexity: **MVVM is overkill when it comes to creating simple user interfaces**. When working on larger projects, designing the ViewModel in order to get the right amount of generality can be quite difficult.

    2. **Can be difficult to debug**: Because data binding is declarative, it can be harder to debug than traditional, imperative code.

### A099. What is the use of ViewModelFactory?

Answer:

    1. By default, `ViewModelProvider` can **only create ViewModels with empty constructors**.
    2. If your `ViewModel` **needs parameters** (like a repository, context, or API service), you must provide a **factory** that tells Android *how to create it*.

### A100. What is guideLine in constraint layout?

Answer:

    1. It is useful when multiple composables need to be aligned along an axis.

### A101. What is Build Type in android?

Answer:

    1. Build types are used to create **multiple versions** of our app **with different characteristics**, such as **debug** or **release** builds.
    2. Each build type can have its own unique settings, such as **signing configurations**, optimization levels, and more.

| [How to configure build types vs. product flavors? \- Stack Overflow](https://stackoverflow.com/questions/42029224/how-to-configure-build-types-vs-product-flavors) //Approach with simple flavors Build types:  debug release |
| :---- |
| **Flavors:**  dev test live |
| Which would **result** in these **build variants** (you don't have to use all of them): devDebug devRelease testDebug testRelease liveDebug liveRelease |

| //Approach with combining multiple flavors using dimensions Flavor dimensions:  backend target |
| :---- |
| **Build types:**  debug release |
| **Flavors**: ***target*** dimension: dev test live ***backend*** dimension: production test |
| Which would **result** in these **build variants** (you don't have to use all of them): productionDevDebug productionDevRelease productionTestDebug productionTestRelease productionLiveDebug productionLiveRelease testDevDebug testDevRelease testTestDebug testTestRelease testLiveDebug testLiveRelease |

    3.

### A102. What is flavor in android?

Answer:

    1. Android Product Flavors are used **to create different versions of an app**.
    2. These versions can have different features, such as being free or paid, having different themes or using different environments or APIs.

### A103. What is exported In Manifest?

Answer:

    1. If we want an **activity** or **service** **to be launched by components from other applications**, we will set **android:exported\="true"**.
    2. This is often used for activities that serve as entry points for the application.
       1. Ex: with respect to the broadcast receiver
          1. true : broadcast receiver can receive events sent by same or others applications
          2. false‍ : broadcast receiver can receive events sent by same application

    **###**

    **Security and data protection**

### A104. What is a Multi-Layered Security Approach?

Answer:

    1.

| Layer | Technique/Tool | Purpose |
| ----- | ----- | ----- |
| Key Management | Android Keystore | Protects encryption keys in hardware |
| Data Encryption | EncryptedSharedPreferences / EncryptedFile | Encrypts sensitive data at rest |
| Access Control | BiometricPrompt | Optional control over who accesses the data |
| Secure Communication | HTTPS \+ Cert Pinning | Secures data in transit |
| Safe Deletion | Token cleanup on logout | Ensures no residual data remains |
| App Hardening (Bonus) | ProGuard, SafetyNet, root detection, etc. | Prevent reverse engineering |

### A105. What is proguard?

Answer:

    1. ProGuard is a **code shrinker, obfuscator, and optimizer** for Java and Android applications.

    2. It helps reduce the size of the compiled code, making the application more efficient and improving its performance.

### A106. What is an SSL certificate?

Answer:

    1. SSL certificates are used **to enable encrypted communication** between a client (usually a web browser or application) and a server, ensuring data security during transmission.

### A107. What is SSL binding?

Answer:

    1. SSL binding in Android is the process of configuring the app to only connect to servers that have a **valid SSL certificate**.

    2. SSL binding is commonly used in **web server configurations**, such as those for HTTP servers like Apache, Nginx, or Microsoft IIS, **to secure communication over the HTTPS protocol**.

    3. This can help to protect the app from **man-in-the-middle attacks**, where an attacker can intercept the app's traffic and steal our data.

    4. There are two main ways to do SSL binding in Android:

       1. **Certificate pinning**: SSL pinning is the process of **embedding the server's certificate in our app's code**.  At runtime, our app will **compare** the server's certificate to the one it has embedded. If the certificates match, our app will connect to the server. If the certificates do not match, our app will abort the connection.

       2. **Trusting only specific CAs**: This involves **specifying a list of CAs(Certificate Authorities) that our app trusts**. When our app connects to a server, it will only connect if the server's certificate is issued by one of the CAs in our list.

    5. Setup with okhttpclient.

| OkHttpClient client \= new OkHttpClient.Builder()         .sslSocketFactory(sslContext.getSocketFactory(), trustManager)         .build(); |
| :---- |

### A108. What is SSL pinning?

Answer:

    1. SSL pinning is the process of **embedding the server's certificate or public key in our app's code**.

    2. At runtime, our app will **compare** the server's certificate or public key to the one it has embedded. If the certificates match, our app will connect to the server. If the certificates do not match, our app will abort the connection.

    3. Setup:

       1. Network\_security\_config.xml

### A109. SSL pinning vs SSL binding?

Answer:

    1.

| Aspect | SSL Pinning (Client-side) 🛡️ | SSL Binding (Server-side) 🌐 |
| ----- | ----- | ----- |
| Where | In the **mobile app** (client) | On the **server** (web server / load balancer) |
| Purpose | Prevent MITM, only trust pinned cert/key | Ensure correct cert is attached to domain/port |
| Control | Developer controls in Android/iOS app | Server admin controls in server config |
| Failure | If cert changes & app not updated → app breaks ❌ | If misconfigured binding → site won’t load ❌ |
| Example | OkHttp CertificatePinner | IIS binding cert → www\.example.com:443 |

    2.

### A110. How will you protect data in Android (with latest)?

Answer:

    [FULL Guide to Encryption & Decryption in Android (Keystore, Ciphers and more)](https://www.youtube.com/watch?v=aaSck7jBDbw)

    1. **KeyStore**:

       1. We use encryption and decryption to protect data. Previously we save encryption keys in internal storage or shared preference. It can be accessed by attackers easily.

       2. So Android Introduced Keystore. We can store keys in the keystore. This keystore will be saved in **TEE(Trusted Execution Environment)**. That is a piece of separate **hardware** which can not be rooted like rooting android OS. So It’s safe to save using Keystore.

       3. Our app can make a request to the keystore system to encrypt or decrypt with the key it owns.

### A111. How can you update the UI from workers?

Answer:

    1. Using WorkManager’s WorkInfo (Best Practice)

       1. Workers return a `Result.success()` with `Data`.

       2. UI observes the WorkManager via `LiveData` or `Flow`.

       3. Using **getWorkInfoByIdLiveData** and **workID**

    2. Using **setProgress()** for intermediate updates

       1. Using **getWorkInfoByIdLiveData** and **workID**

| workManager.getWorkInfoByIdLiveData(workId)            .observe(this, { workInfo \-\>        if (workInfo \!= null && workInfo.state \== WorkInfo.State.RUNNING) {            val progress \= workInfo.progress.getInt("progress", 0)            *// Update UI with progress*        }    }) |
| :---- |
| **//worker override fun doWork(): Result {     for (i in 1..100) {         setProgress(workDataOf("progress" to i))         Thread.sleep(50)     }     return Result.success() } //Activity: WorkManager.getInstance(this).getWorkInfoByIdLiveData(workRequest.id)     .observe(this) { workInfo \-\>         val progress \= workInfo.progress.getInt("progress", 0\)         progressBar.progress \= progress     }**  |

### A112. What are Workers in WorkManager, and how are they used?

Answer:

    1. Worker class performs the actual background work in WorkManager.
    2. We can create custom Workers by **extending** the **Worker** class and **override** the **doWork()** method to define the work to be done.
    3. Workers are **used in work requests** to execute specific tasks.
    4. Two types:
       1. Worker \- for non suspending functions.
       2. coroutineWorker \- for suspend functions.

| //worker  class MyWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {    override suspend fun doWork(): Result {        *// background task*        return Result.success()    } } |
| :---- |
| //use  val workRequest: OneTimeWorkRequest \= OneTimeWorkRequest.Builder(MyWorker::class.*java*).build() |

### A113. What are the key features of WorkManager?

Answer:

    1. **Guaranteed task execution**, even across device **reboots**.
    2. It supports **one-time** and **periodic** tasks.

| *// One-time task*    val myWorkRequest: OneTimeWorkRequest \= OneTimeWorkRequest.Builder(MyWorker::class.*java*).build() |
| :---- |
| *// Periodic task*    val myPeriodicWorkRequest: PeriodicWorkRequest \=        PeriodicWorkRequest.Builder(MyWorker::class.*java*, 1, TimeUnit.*HOURS*).build() |

    3. Ability to define **constraints** for task execution, such as **network availability** or **device charging status**.

| val constraints \= Constraints.Builder()    .setRequiredNetworkType(NetworkType.*UNMETERED*)    .build() val workRequest \= *OneTimeWorkRequestBuilder*\<MyWorker\>()    .setConstraints(constraints)    .build() |
| :---- |

    4. Backward Compatible: It uses **JobScheduler** on Android 6.0 (API level 23\) and **higher**, while falling back to **Firebase JobDispatcher or AlarmManager** on **lower** API levels.

### A114. What are the different types of constraints that can be applied to a WorkRequest?

Answer:

    1. NetworkType
    2. BatteryNotLow
    3. RequiresCharging
    4. DeviceIdle
    5. StorageNotLow
    6. UnmeteredNetwork

| Constraints.Builder().setRequiredNetworkType(NetworkType.*CONNECTED*) |
| :---- |
| Constraints.Builder().setRequires**BatteryNotLow**(true) |
| Constraints.Builder().setRequires**Charging**(true) |
| Constraints.Builder().setRequires**DeviceIdle**(true) |
| Constraints.Builder().setRequires**StorageNotLow**(true) |

### A115. What is the difference between OneTimeWorkRequest and PeriodicWorkRequest?

Answer:

| Feature | OneTimeWorkRequest | PeriodicWorkRequest |
| ----- | ----- | ----- |
| **Task Type** | Single, non-repeating task | Repeating task at specified intervals |
| **Use Case Examples** | Uploading a file, one-time background task | Syncing data periodically, regular maintenance |
| **Cancelability** | No❌ | Yes✔️ |
| **Interval** | No | Need to set |
| **Builder Class** | **OneTimeWorkRequest**.Builder | **PeriodicWorkRequest**.Builder |

### A116. How can you pass data to a Worker class?

Answer:

    1. By using setInputData()

| //pass val inputData: Data \= Data.Builder()    .putString("key", "value")    .putInt("count", 42)    .build()  val uploadWorkRequest: OneTimeWorkRequest \= OneTimeWorkRequest.Builder(MyWorker::class.*java*)    .setInputData(inputData)    .build()  |
| :---- |
| //receive  class MyWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {    override suspend fun **doWork**(): Result {        *// Retrieve input data*        **val stringValue \= *inputData*.getString("key")        val intValue \= *inputData*.getInt("count", 0)**         *// background task*        return Result.success()    } } |

### A117. How can you observe the progress or output of a Worker class?

Answer:

    1. By using the **WorkInfoByIdLivedata()**⭐ method we can get **workInfo** live data.
    2. For result : **workInfo.outputData**
    3. For progress: **workInfo.progress**
    4. To get the state of work:  **workInfo.state**

|  val workInfoLiveData \= WorkManager.getInstance(context).getWorkInfoByIdLiveData(uploadWorkRequest.id) workInfoLiveData.observe(owner, { workInfo \-\>    if (workInfo \!= null) {        when (workInfo.state) {            WorkInfo.State.*ENQUEUED* \-\> {                *// Work is enqueued, waiting to run*            }            WorkInfo.State.*RUNNING* \-\> {                *// Work is currently running*                val progress \= workInfo.progress.getInt("progress", 0)                *// Update UI with progress information*            }            WorkInfo.State.*SUCCEEDED* \-\> {                *// Work completed successfully*                val outputData \= workInfo.outputData                val result \= outputData.getString("resultKey")                *// Update UI or perform further actions*            }            WorkInfo.State.*FAILED* \-\> {                *// Work failed*                val errorMessage \= workInfo.outputData.getString("errorKey")                *// Handle errors or retry logic*            }            *// Add more cases as needed*        }    } }) |
| :---- |

### A118. How can you chain multiple work requests together?

Answer:

    1. We can use **WorkManager.beginWith()** and **then()** method on a WorkRequest object.
    2.  If **any one** of the work requests fail (returning **Result.failure()**), the **entire chain will be considered failed**.

| *// first work request*    val firstWorkRequest \= *OneTimeWorkRequestBuilder*\<FirstWorker\>().build() *// second work request*     val secondWorkRequest \= *OneTimeWorkRequestBuilder*\<SecondWorker\>()        .setConstraints(Constraints.Builder().setRequiresCharging(true).build())        .build() *// third work request*    val thirdWorkRequest \= *OneTimeWorkRequestBuilder*\<ThirdWorker\>().build() *// Chain the work requests using the then method*    WorkManager.getInstance(context)        .beginWith(firstWorkRequest)        .then(secondWorkRequest)        .then(thirdWorkRequest)        .enqueue() |
| :---- |

### A119. How to Cancel a Work?

Answer:

    1. We can cancel ongoing works with methods in WorkManager instance.
       1. cancelWorkById
       2. cancelAllWork()
       3. cancelAllWorkByTag
       4. cancelUniqueWork

| WorkManager.getInstance(this).cancelWorkById(oneTimeWorkRequest.id) |
| :---- |

### A120. Differences between Alarm Manager and Work Manager?

Answer:

**What is AlarmManager ?**

     1. AlarmManager is used for time-sensitive tasks that need to be executed even when the app is not running.
     2. It allows you to schedule an intent to be executed at a specified time or interval.

| AlarmManager alarmManager \= (AlarmManager)getSystemService(Context.ALARM\_SERVICE); Intent intent \= new Intent(this, YourBroadcastReceiver.class); PendingIntent pendingIntent \= PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG\_UPDATE\_CURRENT); Calendar calendar \= Calendar.getInstance(); calendar.setTimeInMillis(System.currentTimeMillis()); calendar.set(Calendar.HOUR\_OF\_DAY, 8); // Set the hour of the day (e.g., 8 AM) calendar.set(Calendar.MINUTE, 0);      // Set the minute (e.g., 0 minutes) long alarmTime \= calendar.getTimeInMillis(); alarmManager.set(AlarmManager.RTC\_WAKEUP, alarmTime, pendingIntent); |
| :---- |
| public class YourBroadcastReceiver extends BroadcastReceiver {     @Override     public void onReceive(Context context, Intent intent) {         // Handle the alarm task here         // This method will be called when the alarm goes off     } } |

     **Other Components**

**Work manager vs coroutine / background processing in latest Android Components?**

    1.

    2.
    3.

       **Approaches to background work:**
    1. **All persistent(பிடிவாதமான) work**: You should use [WorkManager](https://developer.android.com/guide/background/persistent#workmanager-features) for all forms of persistent work.
    2. **Immediate impersistent(உறுதியற்ற) work**: You should use [Kotlin coroutines](https://developer.android.com/kotlin/coroutines) for immediate impersistent work. For Java programming language users, read the [guide on threading](https://developer.android.com/guide/background/asynchronous/java-threads) for recommended options.
    3. **Long-running and deferrable(ஒத்திவைக்கக்கூடிய) impersistent work**: You shouldn't use long-running and deferrable impersistent work. You should instead complete such tasks through persistent work using WorkManager.
    4.
    5. Replace foreground service with workmanager:
       1. **Android 12** restricts launching foreground services from the background. For most cases, you should use setForeground() from **WorkManager** rather than handle foreground services ourself.
       2. Some use cases for using **foreground services directly** are as follows:
          1. Media playback
          2. Activity tracking
          3. Location sharing
          4. Voice or video calls

    6. Replaced Old APIs with workmanager:

### A121. How can you handle and retry failed tasks in WorkManager?

Answer:

     1. We can use the **setBackoffCriteria()** method, which allows you to define the **initial and maximum delay for retries**.

| *// OneTimeWorkRequest with retry policy*    val retryWorkRequest \= *OneTimeWorkRequestBuilder*\<MyWorker\>()        .setBackoffCriteria(BackoffPolicy.*LINEAR*, WorkRequest.MIN\_BACKOFF\_MILLIS, TimeUnit.*MILLISECONDS*)        .build() *// Enqueue the work request*    WorkManager.getInstance(context).enqueue(retryWorkRequest)  |
| :---- |

### A122. What is AlarmManager?

Answer:

     1. AlarmManager is used for time-sensitive tasks that need to be executed even when the app is not running.
     2. It allows you to schedule an intent to be executed at a specified time or interval.

| AlarmManager alarmManager \= (AlarmManager)getSystemService(Context.ALARM\_SERVICE); Intent intent \= new Intent(this, YourBroadcastReceiver.class); PendingIntent pendingIntent \= PendingIntent.getBroadcast(this, 0, intent, PendingIntent.FLAG\_UPDATE\_CURRENT); Calendar calendar \= Calendar.getInstance(); calendar.setTimeInMillis(System.currentTimeMillis()); calendar.set(Calendar.HOUR\_OF\_DAY, 8); // Set the hour of the day (e.g., 8 AM) calendar.set(Calendar.MINUTE, 0);      // Set the minute (e.g., 0 minutes) long alarmTime \= calendar.getTimeInMillis(); alarmManager.set(AlarmManager.RTC\_WAKEUP, alarmTime, pendingIntent); |
| :---- |
| public class YourBroadcastReceiver extends BroadcastReceiver {     @Override     public void onReceive(Context context, Intent intent) {         // Handle the alarm task here         // This method will be called when the alarm goes off     } } |

     **Other Components**

### A123. Why use Room DB?

Answer:

     1. Compile Time Verification (e.g., wrong column name)
     2. Boilerplate Code

### A124. What is Jetpack Security?

Answer:

     1. Jetpack Security is a set of libraries and tools provided by Android Jetpack to help you secure data on our Android app.
     2. It offers various components to help you encrypt and store sensitive information securely, such as passwords, keys, and other confidential data.
     3. **Note**: Jetpack Security **uses Android Keystore to store encryption keys securely**. Make sure to handle key management properly and follow best practices.

### A125. Components of Jetpack Security?

Answer:

     1. **EncryptedSharedPreferences:**
        1. A secure version of SharedPreferences for storing sensitive data.
        2. Data is encrypted and decrypted automatically when read or written.
        3. Provides a simplified API for secure data storage.
     2. **EncryptedFile:**
        1. Helps you create and manipulate encrypted files securely.
        2. Suitable for storing files with sensitive data such as images, documents, or other content.
     3. **BiometricPrompt:**
        1. Integrates biometric authentication (fingerprint, face, etc.) into our app.
        2. Enhances security by adding an extra layer of user verification.
        3. Provides a consistent and user-friendly authentication experience.
     4. **SecretsManager:**
        1. Manages secrets (API keys, OAuth tokens, etc.) securely.
        2. Offers APIs for storing, retrieving, and deleting secrets.
        3. Seamlessly integrates with Android Keystore.
     5. **IdentityCredential API:**
        1. Facilitates secure storage and management of identity credentials.
        2. Suitable for scenarios like digital driver's licenses or other forms of digital identity.
     6. **Android Keystore Integration:**
        1. Provides access to the secure hardware-backed Android Keystore.
        2. Enables secure storage and retrieval of cryptographic keys and sensitive data.
     7. **Network Security Config:**
        1. Allows you to define network security policies for our app.
        2. Controls which domains should be accessed over secure connections (HTTPS).
        3. Helps prevent man-in-the-middle attacks and ensures secure communication.
     8. **SQLCipher for Android (Third-party):**
        1. A widely used third-party library for encrypting database files.
        2. Enables transparent 256-bit AES encryption for local databases.
     9.

### A126. Principles of jetpack compose?

Answer:

     1. See [Jetpack Compose & Kotlin - Flow](https://docs.google.com/document/d/1xftq7B_T4OKaeG6WKjv_szUByK_BTLMyNDMUe6VjlpA/edit)
     2. In the past, Android UIs were manipulated using a tree of widgets, which had to be updated using methods like **findViewById() and** which led to **errors** and **maintenance challenges** and **complexity** when updating views.

     3. Declarative UI models, like Compose, have become the **industry standard.**
     4. (declarative means, UI components are described as functions of the application state)

     5. The technique works by **conceptually regenerating the entire screen** from scratch, then applying only the necessary changes.

     6. **Dynamic content:** Because composable functions are written in Kotlin instead of XML, they can be as dynamic as any other Kotlin code.
     7. It reduces boiler plate code.
     8. Ex: in xml for listing, we need,
        1. Recyclerview
        2. Adapter
        3. ViewHolder

### A127. What is recomposition?

Answer:

     1. Recomposition is the **process of automatically updating only the parts of the UI that have changed** when the state variables of a Composable function are modified.

### A128. What triggers Recomposition?

Answer:

     1. Changes to observed state, such as:
        1. `mutableStateOf`
        2. `StateFlow`
        3. `LiveData`
        4. `remember`
        5. `rememberSaveable`

### A129. What is the state?

Answer:

     1. State in an application is any value that can change over time.It depends on the data flow. Since data flow is unidirectional then, when an event is triggered the state is updated and then the state is displayed. Advantages are testability, state encapsulation and UI consistency.

### A130. Unidirectional data flow?

Answer:

     1.
     2. Advantages
        1. Testability
        2. State encapsulation
        3. UI consistency

### A131. What is state hoisting and reason?

Answer:

     1. State hoisting is lifting the state to a higher-level composable.
     2. This promotes reusability and testability.

        (other better explanation)

     3. State hoisting in Jetpack Compose is the practice of **moving state out of a Composable and into its parent or ViewModel**.
     4. The **Composable then becomes stateless**: it only displays data and exposes events (like button clicks).
     5. This makes the Composable reusable, testable, and ensures unidirectional data flow. The main reasons are: single source of truth, reusability, and predictability.

### A132. Where to hoist state?

Answer:

     1. State should be hoisted **to the nearest common ancestor of the components** that need to observe or modify it.

### A133. What is Derived State?

Answer:

     1. If we want a state value that’s computed from other states.
     2. Here, **displayMessage** will update when **isLoading** does.

| val isLoading \= remember { mutableStateOf(true) } val displayMessage \= derivedStateOf { if (isLoading.value) "Loading..." else "Loaded\!" } |
| :---- |

### A134. Why are side effects problematic?

Answer:

     1. **Unpredictable recompositions:** Compose can recompose parts of your UI at any time due to changes in state, events, or other factors. If a composable function has side effects, they could run repeatedly or at unintended times, leading to unexpected behavior or performance issues.
     2. **Testing difficulties**: Side effects can make testing Composables challenging, as you need to mock or control external interactions during tests.

### A135. Launched effect - how to use them?

Answer:

     1. LaunchedEffect is used for executing side effects in Compose.
     2. It is typically used **to perform actions such as starting a coroutine** for tasks like fetching data or updating UI based on certain conditions.

### A136. When should LaunchedEffect be used?

Answer:

     1. For one-time or key-based side effects such as:
        1. API calls
        2. Navigation
        3. Collecting Flows

### A137. Disposal effect - what happens on calling this and can it be called with coroutine scope?

Answer:

     1. Used for cleanup work. `onDispose()` runs when the effect leaves the composition or its key changes.
     2. DisposableEffect is used **for cleanup the resources** **when a composable is removed from the UI or its key changes.**

### A138. DisposableEffect vs LaunchedEffect?

Answer:

**LaunchedEffect and DisposableEffect are composable functions and can only be used inside another composable function.**

   2. LaunchedEffect and DisposableEffect both take **key/keys** to execute blocks of code when passed **key/keys changes** and **during initial composition phase**.
   3. LaunchedEffect **cancels previous running coroutine** before starting a new one. Whereas DisposableEffect **calls onDispose for the previous running block of code to cleanup resources** before executing a new block of code.

	**Differences**

**LaunchedEffect executes suspend functions whereas DisposableEffect is used for non suspending functions.**

   5. DisposableEffect provides onDispose block where we can cleanup resources whereas LaunchedEffect does not provide any such thing but it runs coroutine within the scope of the composable so its lifecycle is managed automatically.
   6. LaunchedEffect should only be used to perform UI related tasks whereas DisposableEffect is mostly used to perform other tasks which are not UI specific e.g logging analytics events

### A139. How do you improve performance in Jetpack Compose?

Answer:

     1. I usually focus on avoiding unnecessary recompositions and heavy work inside Composables. Some common practices are:
     2. Use **remember** – to cache values and avoid recalculating expensive operations on every recomposition.
     3. Use **derivedStateOf** – for derived state so that it only recomputes when the dependent state actually changes.
     4. Use **@Immutable / @Stable** data classes – this helps Compose know when an object hasn’t changed and skip recomposition.
     5. Optimize **LazyColumn/LazyRow** – by providing stable keys and contentType so items can be efficiently reused.
     6. Avoid unnecessary **Modifier chains** – reuse common modifiers instead of creating new ones on every recomposition.
     7. Move heavy work off the **UI thread** – keep network/database operations inside a ViewModel or coroutine, not directly in Composables.
     8. Profile and measure – use Layout Inspector and recomposition counts to detect unnecessary recompositions.
        1. Use **Layout Inspector** → recompositions highlight.
        2. Use **@Composable @Stable and @Immutable** annotations wisely.
        3. Minimize **LaunchedEffect** and **SideEffect** usage

### A140. What is rememberSaveable?

Answer:

     1. rememberSaveable **ensures that temporary data survives configuration changes.**

| val userInput \= rememberSaveable { mutableStateOf("Initial Input") } |
| :---- |

### A141. What happens when a Composable leaves Composition?

Answer:

     1. `LaunchedEffect` is cancelled
     2. `rememberCoroutineScope` is cancelled
     3. `DisposableEffect.onDispose()` is called
     4. `remember` state is forgotten

### A142. What and Why Composition Locals?

Answer:

     [Mastering Jetpack Compose State Management: A Deep Dive into Modern UI Data Flow | by Joseph James (JJ)](https://iamjosephmj.medium.com/mastering-jetpack-compose-state-management-a-deep-dive-into-modern-ui-data-flow-8392e298e56)
     1. It simplifies **sharing data** (like configurations, themes, or view models) between distant parts of the view hierarchy by allowing data to be shared seamlessly across composables.

| val *LocalUserPreferences* \= compositionLocalOf { UserPreferences() } |
| :---- |

### A143. Two types of navigation in jetpack compose?

Answer:

     1. **Implicit Navigation**
     2. **Explicit Navigation (Navigation Component):**

     3. Implicit:

| // Implicit navigation Button(onClick \= { /\* Navigate to another composable \*/ }) {     Text("Click me") } |
| :---- |

     4. Explicit Navigation (Navigation Component):
     5.

| // Explicit navigation using Navigation Component val navController \= rememberNavController() NavHost(navController \= navController, startDestination \= "screen1") {     composable("screen1") {         Screen1(navController \= navController)     }     composable("screen2/{param}") { backStackEntry \-\>         val param \= backStackEntry.arguments?.getString("param")         Screen2(param \= param)     } } |
| :---- |

### A144. Why should you use compose?

Answer:

     1. It brings **one language for everything, including UI** : Kotlin.
     2. **Declarative approach** instead of imperative approach.
     3. Follows dynamic content concepts. Meaning depending on what data is passed to the composables the UI changes based on it.

### A145. Why is it called Compose?

Answer:

     1. **Follows composition pattern** rather than inheritance pattern, which is followed by previous android ui patterns.
     2. All the UI extends **View** class (directly or indirectly) in inheritance pattern.

### A146. What is setContent?

Answer:

     1.  It basically allows the user to display the actual UI to the user after the onCreate method has been called. It is similar to setContentView which we have in the XML layout but instead it takes composable functions.

### A147. What is @Composable?

Answer:

     1.  It can be applied to a function or lambda to indicate that the function/lambda can be used as part of a composition to describe a transformation from application data into tree or hierarchy. Which means transforming the code/function/logic into UI shown on the screen, which is handled by the compiler.

### A148. What is @Preview in Compose?

Answer:

     1. It’s a function which shows how the composable inside it will look. Like a preview of the UI. It’s also helpful when you want to see which composable function created the UI by clicking on it in the preview section of the IDE.

### A149. What are the Core UI elements of Compose?

Answer:

     1. Surface Composable, Wrap content of Composable, Align Composables, Row Column Box Composables, Layout with Row and Columns, Extract Composables for reuse, Arrangements for Rows and Columns and, Combine and nest Rows with Columns.

### A150. What is Surface Composable?

Answer:

     1. One of the easiest composable which is a block of UI that is displayed on the screen, which can have a color and background color.

### A151. What is Wrap content of Composable?

Answer:

     1. It’s basically to tell the compose that take only that much space to fit the content, not more than that.

### A152. What is Align Composables?

Answer:

     1. This is used to align a composable on the screen like centre, top end, bottom start, etc. which is relative to its parent.

### A153. What is Declarative approach?

Answer:

     1. It means we have a data flow and an events flow.
     2. In compose hierarchy the data flows from top to bottom, meaning the parent composable flows data to its child composable.
     3. And the events are triggered from child to parent i.e. bottom to top.

### A154. What is a Navigation Stack in Compose?

Answer:

     1. It’s a container similar to the stack that we had in our program manager in which we holds composables. And they are those composables that we have defined in the navigation graph that are represented as screens.

### A155. Can a singleton be dependency injected:

Answer:

     1. Yes, a singleton can be injected using dependency injection frameworks.
     2. Dependency injection containers can manage the lifecycle and provide instances of singletons when needed.

### A156. What are the differences between the @Provides and @Binds annotations?

Answer:

     1. **@Binds**
        1. it is almost **equivalent** to @Provides.
        2. It is (slightly) more **compact**: You can skip the implementation.
        3. it reduces the amount of code generated.
        4. @Binds methods are **abstract** methods **without implementations**
     2.

| @Binds | @Provides |
| :---- | :---- |
| @Binds methods are **abstract** methods **without implementations** | @Provides methods **have implementation** code within them |
| **Does not create instances.** | **Creates** and **returns** **instances**. |
| **Reduces** the amount of **generated code** which can **improve performance.** | It has **more generated code** due to method implementations. So comparatively **less** **performance**. |
| Used when the implementation doesn't require. | Used when performing complex instantiation logic, and using third-party libraries. |

     3.

### A157. What are the important annotations in hilt?

Answer:

     **Firebase**

	Important topics:

* FCM
* Authentication
* Crashlytics
* Firebase Console
* Remote Config

### A158. What is Firebase Crashlytics?

Answer:

> ✦ **Added answer**

A real-time crash reporting tool from Firebase. It collects stack traces, groups crashes, shows affected users and devices, supports non-fatal logging, custom keys and user IDs, and velocity alerts. Add the Crashlytics Gradle plugin and SDK; upload ProGuard/R8 mapping files so traces are readable.

### A159. Why do we use Remote Config?

Answer:

     1. For update app with version difference

     **Analytics**

	Important topics:

* Braze \- easy and good approach
* Firebase \- big
* Flurry
* NewRelic
* AppFlyer

### A160. Types of storage in android?

Answer:

> ✦ **Added answer**

- **Preferences/DataStore** – small key-value data.
- **Internal storage** – private app files (`filesDir`, `cacheDir`).
- **External / scoped storage** – shared files, `MediaStore`.
- **SQLite / Room** – structured relational data.
- **Cloud/network** – Firebase, REST backends.

### A161. How do you deploy android projects? What changes will you change in codes before it?

Answer:

> ✦ **Added answer**

Set `versionCode` / `versionName`, build with the **release** build type, sign with your keystore (or use Play App Signing), enable **R8/ProGuard** minification and resource shrinking, remove debug logs and test flags, point to production URLs/keys, build an **AAB**, test it, then upload to Google Play Console (internal → closed → open → production, ideally with a staged rollout).

### A162. Diff between grid view and card view?

Answer:

> ✦ **Added answer**

They are not alternatives. **GridView** is an adapter-based layout that shows items in a 2-D grid (today you'd use `RecyclerView` + `GridLayoutManager`). **CardView** is a container widget with rounded corners and elevation used to wrap content, and is often used for each item inside a list or grid.

### A163. What is GIS?

Answer:

> ✦ **Added answer**

**Geographic Information System** – software that captures, stores and analyses spatial/location data. On Android it shows up as maps and location features (Google Maps SDK, location services, or Esri/ArcGIS SDKs).

### A164. What are Signing conflicts?

Answer:

> ✦ **Added answer**

They happen when an APK is signed with a different key than the one already installed or published (e.g. debug vs release keystore): installs fail with `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, or a Play upload is rejected. Fix by using the same keystore (or Play App Signing with the correct upload key) or uninstalling the existing app.

### A165. What are the features of Firebase?

Answer:

> ✦ **Added answer**

Authentication, Cloud Firestore and Realtime Database, Cloud Storage, Cloud Messaging (FCM), Remote Config, Analytics, Crashlytics, Performance Monitoring, Cloud Functions, App Distribution, Test Lab, In-App Messaging, Hosting and App Check.

### A166. Which Android version did you work on in the last project?

Answer:

> ✦ **Added answer**

*Personal question.* Mention your project's `minSdk`, `targetSdk` and `compileSdk` and the main API-level changes you handled (runtime permissions, background limits, scoped storage, notification permission).

### A167. Disadvantages of Android?

Answer:

> ✦ **Added answer**

Fragmentation (many devices, screen sizes and OS versions to test), slow OS updates on many devices, security/malware risk on open distribution, battery drain from background apps, hardware-dependent performance, and bloatware.

### A168. What is Base 64?

Answer:

> ✦ **Added answer**

An encoding that turns binary data into text using 64 ASCII characters. It is **not encryption**. Used to send images/files in JSON, in Basic-Auth headers, and in data URIs; it increases size by about 33%.

```kotlin
val s = Base64.encodeToString(bytes, Base64.NO_WRAP)
val b = Base64.decode(s, Base64.NO_WRAP)
```

### A169. What are compile options?

Answer:

> ✦ **Added answer**

Gradle settings that control how code is compiled:
```kotlin
android {
    compileSdk = 34
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
        isCoreLibraryDesugaringEnabled = true   // use newer Java APIs on old devices
    }
    kotlinOptions { jvmTarget = "17" }
}
```

### A170. Google Maps?

Answer:

> ✦ **Added answer**

Use the **Maps SDK for Android**: add `play-services-maps`, put the API key in the manifest, add a `SupportMapFragment` (or `MapView`), call `getMapAsync`, then add markers, polylines and camera updates. Use `FusedLocationProviderClient` and runtime location permissions for the user's position. In Compose use the `maps-compose` library.

### A171. Explain the version of Android SDK you worked on?

Answer:

> ✦ **Added answer**

*Personal question.* Explain `minSdk` (lowest supported), `targetSdk` (version you tested the behaviour against) and `compileSdk` (APIs you compile with), and name the ones used in your project.

### A172. Explain Jetpack compose?

Answer:

**Principles of jetpack compose?**

     1. See [Jetpack Compose & Kotlin - Flow](https://docs.google.com/document/d/1xftq7B_T4OKaeG6WKjv_szUByK_BTLMyNDMUe6VjlpA/edit)
     2. In the past, Android UIs were manipulated using a tree of widgets, which had to be updated using methods like **findViewById() and** which led to **errors** and **maintenance challenges** and **complexity** when updating views.

     3. Declarative UI models, like Compose, have become the **industry standard.**
     4. (declarative means, UI components are described as functions of the application state)

     5. The technique works by **conceptually regenerating the entire screen** from scratch, then applying only the necessary changes.

     6. **Dynamic content:** Because composable functions are written in Kotlin instead of XML, they can be as dynamic as any other Kotlin code.
     7. It reduces boiler plate code.
     8. Ex: in xml for listing, we need,
        1. Recyclerview
        2. Adapter
        3. ViewHolder

**Important parts of Jetpack compose?**

     1. Composable Functions
     2. State Management
        1. ViewModel SaveableState
     3. Theming and Styles
        1. Custom Theming
     4. Layouts
        1. Column⭐
        2. Row⭐
        3. LazyColumn⭐
        4. LazyRow⭐
        5. LazyVerticalGrid
     5. Containers
        1. Box⭐
        2. Surface ⭐⭐⭐
        3. Card⭐
        4. ConstraintLayout⭐
        5. SubcomposeLayout
        6. Scaffold⭐
     6. Composable Modifiers⭐
     7. Foundation
        1. Canvas
        2. Image
        3. Shape
        4. Text
     8. Material Design Components
        1. AlertDialog
        2. Button
        3. Card
        4. Checkbox
        5. CircularProgressIndicator
        6. DropdownMenu
        7. FloatingActionButton
        8. ModalDrawerLayout
        9. RadioButton
        10. Scaffold
        11. Slider
        12. Snackbar
        13. Switch
        14. TextField
     9. Lazy Composition
        1. LazyColumn
        2. LazyRow
     10. Navigation component
     11. Animations
         1. Crossfade
     12. Custom Drawing with Canvas
     13. Compose Preview and Testing
     14. Custom Composables
     15. Side Effects APIs
     16. Compose Integration with Other Libraries:
         1. ViewModel Integration
         2. CoroutineScope
     17.

> ✦ **Additional notes**

Android's modern **declarative** UI toolkit written in Kotlin: you describe the UI as `@Composable` functions that take state, and the framework **recomposes** only what changed. It replaces XML layouts, with less boilerplate, built-in state management, easy theming (Material 3), and interoperability with Views.

### A173. What components have you used in firebase?

Answer:

> ✦ **Added answer**

*Personal question.* Common answers: Authentication, Firestore/Realtime Database, Cloud Messaging (push), Crashlytics, Analytics, Remote Config, Cloud Storage.

### A174. Fragment lifecycle?

Answer:

> ✦ **Added answer**

`onAttach` → `onCreate` → `onCreateView` → `onViewCreated` → `onViewStateRestored` → `onStart` → `onResume` → (running) → `onPause` → `onStop` → `onDestroyView` → `onDestroy` → `onDetach`. The fragment *view* has its own lifecycle (`viewLifecycleOwner`), from `onCreateView` to `onDestroyView`.

### A175. When you press back what lifecycle will be called from the fragment stack?

Answer:

> ✦ **Added answer**

When the top fragment is popped: `onPause` → `onStop` → `onDestroyView` → `onDestroy` → `onDetach`. The fragment below it (if it was `replace`d) goes through `onCreateView` → `onViewCreated` → `onStart` → `onResume`; if it was only hidden, it simply becomes visible again.

### A176. When you press back what can be used for fragment result to back fragment (equivalent to onActivityResult)?

Answer:

> ✦ **Added answer**

The **Fragment Result API**: the sender calls `setFragmentResult("key", bundleOf(...))`, and the receiver registers `setFragmentResultListener("key") { _, bundle -> ... }` on the `FragmentManager`. With Navigation you can also use `savedStateHandle`. For activities use the Activity Result API.

### A177. How do you handle data protection?

Answer:

    [FULL Guide to Encryption & Decryption in Android (Keystore, Ciphers and more)](https://www.youtube.com/watch?v=aaSck7jBDbw)

    1. **KeyStore**:

       1. We use encryption and decryption to protect data. Previously we save encryption keys in internal storage or shared preference. It can be accessed by attackers easily.

       2. So Android Introduced Keystore. We can store keys in the keystore. This keystore will be saved in **TEE(Trusted Execution Environment)**. That is a piece of separate **hardware** which can not be rooted like rooting android OS. So It’s safe to save using Keystore.

       3. Our app can make a request to the keystore system to encrypt or decrypt with the key it owns.

> ✦ **Additional notes**

HTTPS with certificate pinning, encrypt local data (`EncryptedSharedPreferences`, Android Keystore, SQLCipher), don't store secrets in code, use R8/ProGuard, avoid logging sensitive data, minimal permissions, biometric auth, secure WebView and backups, and Play Integrity checks.

### A178. How do you integrate SSL to an android application?

Answer:

    1. SSL pinning is the process of **embedding the server's certificate or public key in our app's code**.

    2. At runtime, our app will **compare** the server's certificate or public key to the one it has embedded. If the certificates match, our app will connect to the server. If the certificates do not match, our app will abort the connection.

    3. Setup:

       1. Network\_security\_config.xml

> ✦ **Additional notes**

Use HTTPS endpoints; add a **Network Security Config** (`res/xml/network_security_config.xml`) and, for SSL pinning, an OkHttp `CertificatePinner` or `<pin-set>` entries. Never trust all certificates or disable hostname verification.

### A179. Retrofit and how to Debug Response in Retrofit

Answer:

> ✦ **Added answer**

Retrofit is a type-safe REST client built on OkHttp (annotations + converters like Gson/Moshi). To debug responses: add `HttpLoggingInterceptor` (level `BODY`, **debug builds only**), inspect `response.code()` and `response.errorBody()`, use Android Studio's **Network Inspector**, Chucker, or a proxy such as Charles.

### A180. What is service?Activity?

Answer:

**What is service?***

    1. A Service is an application component that can perform long-running operations in the background.
    2. It does not provide a user interface.
    3. Once started, a service might continue running for some time, even after the user switches to another application.

**What is Activity & its Lifecycle?**

    1. It represents a **single screen with a user interface (UI)** that the user can interact with.
    2. Each screen in an Android app is typically implemented as an activity.
    3.

> ✦ **Additional notes**

A **Service** runs work in the background without UI (music playback, sync). An **Activity** is a single screen with a UI that the user interacts with. Both are manifest-declared components with their own lifecycles.

### A181. broadcast receiver?

Answer:

> ✦ **Added answer**

A component that responds to system-wide or app broadcasts (`BOOT_COMPLETED`, connectivity or battery changes). Declare it in the manifest (limited for most implicit broadcasts since Android 8) or register it dynamically with `registerReceiver`. `onReceive()` must finish quickly (~10 s) — start a service/WorkManager for long work.

### A182. What is rxjava etc

Answer:

     1. RxJava is a ***3rd party library developed by Netflix.(ReactiveX for Java)***
     2. ***That uses observable sequences to perform asynchronous and event-based programming***.
     3. Its primary building blocks are triple O's, which stand for ***Operator, Observer, and Observables***.
     4. And we use them to complete asynchronous tasks in our project.

> ✦ **Additional notes**

RxJava is a library for composing asynchronous and event-based code using **Observables** (Observable, Flowable, Single, Maybe, Completable), operators (`map`, `flatMap`, `filter`) and **Schedulers** (`io()`, `mainThread()`). Today coroutines and Flow are the common alternative.

### A183. Other Design Patterns?

Answer:

> ✦ **Added answer**

Singleton, Builder, Factory, Observer (LiveData/Flow), Adapter (RecyclerView), Repository, Dependency Injection, Strategy, Facade, Delegate, plus architecture patterns MVC / MVP / MVVM / MVI.

### A184. Dagger 2?

Answer:

     1. Dagger is a fully static, compile-time dependency injection framework.

### A185. Pipelining?

Answer:

> ✦ **Added answer**

The question is ambiguous. Common meanings: **HTTP pipelining** (sending several requests without waiting for each response), **CPU instruction pipelining**, **operator chaining** in RxJava/Flow/Streams, and **CI/CD pipelines**. Ask which one the interviewer means.

### A186. Communication b/w fragments?

Answer:

    1. **ViewModel(latest)**:
       1. Create a shared ViewModel instance between the fragments or use a shared ViewModel from an activity.
       2. Store the data in the ViewModel in the sending fragment.
       3. Retrieve the data from the ViewModel in the receiving fragment.
       4. If  shared ViewModel instance between the fragments , Make sure that both fragments use the **activityViewModels()**
       5. Because both needs to share same **viewModelProvider**
       6. We can use normal variables or **Livedata**(recommended).

       private val sharedViewModel: SharedViewModel by activityViewModels()

    2. **interface callbacks(traditional method)**:
       1. Create an interface in the sending fragment with a method declaration.
       2. Implement the interface in the parent activity or another fragment that hosts both the sending and receiving fragments.
       3. Pass the data through the interface method from the sending fragment to the activity/parent fragment, and then to the receiving fragment.
    3. **Bundle as Arguments**:
       1. In the sending fragment, create a Bundle object and add data to it using key-value pairs.
       2. Set the arguments of the receiving fragment to the created Bundle.
       3. Access the data in the receiving fragment using the getArguments() method.

       e.g.  // Set Fragmentclass Arguments

          HomeFragment fragobj \= new HomeFragment();

          fragobj.setArguments(bundle);

          **Receiving in OnCreateView()**

          getArguments().getString("message");

    4. **startActivityForResult**:
       1. Start the receiving fragment from the sending fragment using startActivityForResult() method.
       2. In the receiving fragment, set the result using setResult() before finishing.
       3. Implement onActivityResult() in the sending fragment to receive the data passed back from the receiving fragment.

> ✦ **Additional notes**

Best practice: a **shared ViewModel** (`activityViewModels()`), the **Fragment Result API**, or Navigation arguments (Safe Args). Older approach: an interface callback implemented by the host activity.

### A187. Diff. B/w service and intent Service. On which thread it works?

Answer:

    1. Like *Service*, ***IntentService*** runs on a separate thread, and **stops itself** automatically after it **completes its work**.
    2. It's like fire and forget.
    3. IntentService is usually used for **short tasks** that don’t need to be attached to any UI.

> ✦ **Additional notes**

A normal **Service** runs on the **main thread** (you must create your own thread/coroutine). **IntentService** (deprecated since API 30) created a worker thread, handled requests one at a time, and stopped itself when done. Replace with WorkManager, JobIntentService or coroutines.

### A188. Push Notifications process , what is Notification channel?

Answer:

> ✦ **Added answer**

Push flow: add Firebase → get the FCM token (`onNewToken`) → server sends a message → `FirebaseMessagingService.onMessageReceived` builds the notification. A **NotificationChannel** (Android 8+) groups notifications with an id, name and importance that the user can configure; it is required to show notifications. Android 13+ also needs the `POST_NOTIFICATIONS` permission.

### A189. Jet pack components- Navigation, Data binding concepts (cross questions)?

Answer:

**What is navigation components in jetpack?**

     1. Jetpack's Navigation component helps you **implement navigation**, from simple button clicks to more complex patterns, such as app bars and the navigation drawer.
     2. The Navigation component also ensures a ***consistent and predictable user experience***
     3. Main Advantages:
        1. Handles Navigation
        2. Handles back stack
        3. Handles correct button
     4. ******

**ViewBinding Vs databinding?**

    1. With View binding we can access views by id directly without using findViewById()
    2. Data binding also includes view binding and we can use variables in xml files also and it has binding adapter support.

### A190. How much would you rate yourself as Android developer out of 10?

Answer:

> ✦ **Added answer**

*Personal question.* A balanced answer is usually 7–8: confident in the core (Kotlin, Jetpack, MVVM, networking) and honest about areas you are still improving.

### A191. Write down code to store data in shared preference?

Answer:

> ✦ **Added answer**

```kotlin
val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
prefs.edit().putString("name", "Ann").putInt("age", 30).apply()   // write
val name = prefs.getString("name", "")                            // read
```
`apply()` writes asynchronously; `commit()` is synchronous. Prefer **DataStore** for new code.

### A192. Difference between shared preference and Sqlite database? when will you use SQLite and when Shared preferences?

Answer:

> ✦ **Added answer**

- **SharedPreferences**: small key-value pairs (settings, flags, tokens); simple; no queries.
- **SQLite / Room**: structured relational data, large datasets, queries, joins, relations.

Use preferences for settings and small state; use SQLite/Room for lists of records, offline caches and anything you need to query.

### A193. What is difference between activity and fragment?

Answer:

> ✦ **Added answer**

An **Activity** is a full screen entry point with its own window, declared in the manifest. A **Fragment** is a reusable portion of UI with its own lifecycle (plus a view lifecycle) hosted inside an Activity (or another Fragment) and managed by `FragmentManager`; fragments aren't declared in the manifest and make multi-pane and single-activity designs possible.

### A194. What are services? Types of services?

Answer:

    1. A Service is an application component that can perform long-running operations in the background.
    2. It does not provide a user interface.
    3. Once started, a service might continue running for some time, even after the user switches to another application.

> ✦ **Additional notes**

A Service performs work without UI. Types: **Foreground** (shows a notification, e.g. music or tracking), **Background** (limited since Android 8) and **Bound** (clients bind and interact through `onBind`). A service can be *started* and/or *bound*.

### A195. What do you know about material design?

Answer:

> ✦ **Added answer**

Google's design system: components (buttons, cards, FAB, bottom navigation, snackbars), theming (colour roles, typography, shape), motion and accessibility guidance. **Material 3 / Material You** adds dynamic colour. Available as the `material` library for Views and `material3` for Compose.

### A196. How did you handle the requirement of supporting different screen sizes?

Answer:

> ✦ **Added answer**

Use `dp`/`sp` units, `ConstraintLayout`, resource qualifiers (`layout-sw600dp`, `layout-land`, density folders), vector drawables, `WindowSizeClass` and adaptive layouts in Compose, and test on phones, tablets and foldables.

### A197. What have you done to achieve security in your app?

Answer:

> ✦ **Added answer**

*Personal question.* Typical points: HTTPS and certificate pinning, encrypted storage (Keystore / `EncryptedSharedPreferences`), R8 obfuscation, no secrets in code, root detection, biometric authentication, minimal permissions and Play Integrity.

### A198. Integrating push notifications in Android app explain the steps?

Answer:

> ✦ **Added answer**

1. Create a Firebase project and add `google-services.json`.
2. Add the Firebase Messaging dependency.
3. Create a `FirebaseMessagingService`; override `onNewToken` (send the token to your server) and `onMessageReceived`.
4. Create a notification channel (Android 8+) and build the notification with `NotificationCompat.Builder`.
5. Request `POST_NOTIFICATIONS` permission (Android 13+).
6. Send a test message from the Firebase console or your server.

### A199. Write the code to set title, icon, sound of notifications?

Answer:

> ✦ **Added answer**

```kotlin
val channel = NotificationChannel("id", "General", NotificationManager.IMPORTANCE_HIGH)
getSystemService(NotificationManager::class.java).createNotificationChannel(channel)

val n = NotificationCompat.Builder(this, "id")
    .setContentTitle("Title")
    .setContentText("Message")
    .setSmallIcon(R.drawable.ic_notification)
    .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
    .setAutoCancel(true)
    .build()
NotificationManagerCompat.from(this).notify(1, n)
```
On Android 8+ the sound is set on the **channel** (`channel.setSound(...)`).

### A200. How did you integrate the Facebook SDK in Android app?

Answer:

> ✦ **Added answer**

Add the Facebook Login dependency, put the App ID and client token in `strings.xml` and the manifest metadata, register the package name and key hash in the Facebook developer console, then use `LoginManager` with a `CallbackManager` (forward `onActivityResult`) and request read permissions. *Mention your own experience.*

### A201. Difference between Volley and retrofit library? Which one would you prefer?

Answer:

> ✦ **Added answer**

- **Retrofit**: type-safe REST client (annotations, Gson/Moshi converters), works with coroutines/Rx, built on OkHttp.
- **Volley**: request-queue based, built-in caching and image loading, good for small, frequent requests, but more manual parsing and only in maintenance.

Most teams prefer **Retrofit + OkHttp** (with Coil/Glide for images).

### A202. How will you use Httpclient to make server requests?

Answer:

> ✦ **Added answer**

Apache `HttpClient` was removed from Android in API 23. Use `HttpURLConnection` (on a background thread) or OkHttp/Retrofit.

```kotlin
val conn = URL(url).openConnection() as HttpURLConnection
conn.requestMethod = "GET"
val body = conn.inputStream.bufferedReader().readText()
conn.disconnect()
```

### A203. What are other ways than using 3rd party libraries for network calls?

Answer:

> ✦ **Added answer**

`HttpURLConnection` / `java.net.URL`, `DownloadManager` for downloads, `WebView`, and Google's Cronet library. Run them on a background thread or coroutine, and parse JSON yourself (`org.json` or kotlinx.serialization).

### A204. Have you used jetpack compose?

Answer:

     1. See [Jetpack Compose & Kotlin - Flow](https://docs.google.com/document/d/1xftq7B_T4OKaeG6WKjv_szUByK_BTLMyNDMUe6VjlpA/edit)
     2. In the past, Android UIs were manipulated using a tree of widgets, which had to be updated using methods like **findViewById() and** which led to **errors** and **maintenance challenges** and **complexity** when updating views.

     3. Declarative UI models, like Compose, have become the **industry standard.**
     4. (declarative means, UI components are described as functions of the application state)

     5. The technique works by **conceptually regenerating the entire screen** from scratch, then applying only the necessary changes.

     6. **Dynamic content:** Because composable functions are written in Kotlin instead of XML, they can be as dynamic as any other Kotlin code.
     7. It reduces boiler plate code.
     8. Ex: in xml for listing, we need,
        1. Recyclerview
        2. Adapter
        3. ViewHolder

> ✦ **Additional notes**

*Personal question.* If yes, mention what you built and the concepts you used: state and `remember`, state hoisting, ViewModel with `StateFlow`, Navigation Compose, side effects (`LaunchedEffect`), and Material 3 theming.

### A205. Tell me about jetpack Components? Explain major 5

Answer:

**What are Android Jetpack components.?**

    1. Jetpack Components is a **collection of Android libraries** that are **designed to simplify app development** and **improve app performance.**
    2. Some of the most commonly used Jetpack components are:
       1. Work Manager
       2. Room DB
       3. Navigation   \- My doc  \>\>  [Jetpack navigation](https://docs.google.com/document/d/1YLZqRkS73cF_ytI7H7zyXzOF6H3omeTruWb0w39oUtQ/edit?usp=sharing)**⭐**
       4. Paging
       5. Databinding
       6. LiveData
       7. ViewModel

**Tell all the Android Jetpack components.?**

    1. **Data Binding** \- allows you to bind UI components in our layouts to data sources in our app.
    2. **LiveData** \- is an observable data holder that is lifecycle-aware. It can be used to update UI components when data changes.
    3. **ViewModel** \- helps you manage UI-related data in a lifecycle-conscious way, surviving configuration changes such as screen rotations.
    4. **Room** \- provides an abstraction layer over SQLite to allow you to store and retrieve data easily.
    5. **Navigation** \- that simplifies the implementation of navigation within an app, such as creating a back stack and handling deep linking.
    6. **Paging** \- helps you load and display large data sets gradually, while minimizing memory usage.
    7. **WorkManager** \- that allows developers to schedule and run background tasks, even when the app is not in the foreground.

> ✦ **Additional notes**

Five major ones: **ViewModel** (UI state that survives configuration changes), **LiveData/Flow** (observable data), **Room** (local database), **Navigation** (in-app navigation), **WorkManager** (deferrable background work). Also: Compose, DataStore, Paging, Hilt.

### A206. Why is ViewModel preferred in Android?

Answer:

**What is ViewModel in MVVM?**

    1. It serves as a **link between the Model and the View**.
    2. The ViewModel class is designed to store and manage UI-related data in a lifecycle conscious way.
    3. The ViewModel class allows data to survive configuration changes such as screen rotations.

**What is the use of ViewModelFactory?**

    1. By default, `ViewModelProvider` can **only create ViewModels with empty constructors**.
    2. If your `ViewModel` **needs parameters** (like a repository, context, or API service), you must provide a **factory** that tells Android *how to create it*.

> ✦ **Additional notes**

It survives configuration changes (rotation), is lifecycle-aware, keeps UI logic separate from UI classes, gives `viewModelScope` for coroutines, and with `SavedStateHandle` can restore state after process death. Never hold a View or Activity `Context` in it.

### A207. Explain control flow with MVVM and compose? Deep explanations with packages.

Answer:

> ✦ **Added answer**

**Flow:** user action → Composable calls a ViewModel function → ViewModel calls a UseCase/Repository (Retrofit + Room) inside `viewModelScope` → result updates a `StateFlow`/`State` → Composable observes it (`collectAsStateWithLifecycle`) → recomposes.

**Packages:** `ui/` (screens, components, theme), `viewmodel/`, `domain/` (models, use cases), `data/` (repository, `remote/`, `local/`), `di/` (Hilt modules).

### A208. How do you trigger a notification in a cycle of time gap like 1 hour or 2 hour or 12 pm in android?

Answer:

> ✦ **Added answer**

- **WorkManager `PeriodicWorkRequest`** – repeating work (minimum interval 15 min, not exact).
- **AlarmManager** (`setExactAndAllowWhileIdle`, with `SCHEDULE_EXACT_ALARM` permission on Android 12+) for an exact time like 12 pm; reschedule after each trigger.
- Alarms are lost on reboot, so re-register them in a `BOOT_COMPLETED` receiver.

### A209. How did you migrate android versions? Issues faced on that?

Answer:

> ✦ **Added answer**

*Personal question.* Typical issues when raising `targetSdk`: runtime permissions (6), background execution limits and notification channels (8), scoped storage (10), exact-alarm and foreground-service rules (12/14), `POST_NOTIFICATIONS` (13), deprecated APIs, and library compatibility. Process: read behaviour changes, update dependencies, test, release gradually.

### A210. What is Jetpack?

Answer:

    1. Jetpack Components is a **collection of Android libraries** that are **designed to simplify app development** and **improve app performance.**
    2. Some of the most commonly used Jetpack components are:
       1. Work Manager
       2. Room DB
       3. Navigation   \- My doc  \>\>  [Jetpack navigation](https://docs.google.com/document/d/1YLZqRkS73cF_ytI7H7zyXzOF6H3omeTruWb0w39oUtQ/edit?usp=sharing)**⭐**
       4. Paging
       5. Databinding
       6. LiveData
       7. ViewModel

> ✦ **Additional notes**

A suite of Google libraries, tools and guidance that helps build Android apps with less boilerplate and better backward compatibility – including ViewModel, LiveData, Room, Navigation, WorkManager, Compose, DataStore, Paging and Hilt.

### A211. Intent vs intentFilter

Answer:

> ✦ **Added answer**

An **Intent** is a messaging object that requests an action (explicit: names the component; implicit: describes an action/data). An **IntentFilter** is declared by a component (in the manifest or when registering a receiver) to say which implicit intents (action, category, data) it can handle.

### A212. Used things in firebase?

Answer:

> ✦ **Added answer**

*Personal question* – same as above: Authentication, Firestore/Realtime Database, FCM, Crashlytics, Analytics, Remote Config, Storage.

### A213. Used tools for Unit testing?

Answer:

   1. If you want to verify whether application code works as you expect.
   2. And you want to verify it over and over again to be sure that you do not break any existing functionalities.
   3. Unit Test is a piece of code that is not a part of our application.
   4. It can create and call all of our application’s public classes and methods.

> ✦ **Additional notes**

Typically **JUnit** (tests), **Mockito/MockK** (mocks), **Robolectric** (Android framework on the JVM), **Espresso/Compose test** (UI), **kotlinx-coroutines-test** and **Turbine** (coroutines/Flow), and Truth or AssertJ (assertions).

### A214. What are the design patterns used in android app development?

Answer:

> ✦ **Added answer**

Architecture: **MVVM**, MVP, MVC, MVI, Clean Architecture. Creational: Singleton, Builder, Factory. Structural: Adapter, Facade. Behavioural: Observer, Strategy. Others: Repository, Dependency Injection, Delegate.

### A215. What is the lifecycle of compose?

Answer:

     1. `LaunchedEffect` is cancelled
     2. `rememberCoroutineScope` is cancelled
     3. `DisposableEffect.onDispose()` is called
     4. `remember` state is forgotten

> ✦ **Additional notes**

A composable **enters the Composition**, is **recomposed 0 or more times** when the state it reads changes, and **leaves the Composition**. `remember` keeps values across recompositions, and side-effect APIs (`LaunchedEffect`, `DisposableEffect`) start when it enters and clean up when it leaves.

### A216. Explain the same for login page to home page.

Answer:

> ✦ **Added answer**

`LoginScreen` collects input → `LoginViewModel.login()` → repository calls the API → on success store the token (DataStore/`EncryptedSharedPreferences`) → UI state becomes *Success* → navigate with `navController.navigate("home") { popUpTo("login") { inclusive = true } }` (so back doesn't return to login) → `HomeViewModel` loads home data and exposes state to `HomeScreen`.

### A217. Difference between onStart, onPause, onDestroy?

Answer:

> ✦ **Added answer**

- **`onStart`** – the activity becomes *visible* but not yet interactive.
- **`onPause`** – the activity is losing focus (partly obscured); do light saves and pause animations; keep it quick.
- **`onDestroy`** – final cleanup; the activity is finishing (`isFinishing`) or being recreated on a configuration change.

### A218. Long running background task?

Answer:

    1. In Android 11 and later versions, background task restrictions have become more stringent.
    2. **Foreground Services:** Perform long-running tasks by running them in a foreground service, which shows a persistent notification to the user.
    3. **WorkManager:** Schedule and manage background tasks efficiently, taking advantage of battery optimizations and network connectivity.
    4. **JobScheduler:** Schedule tasks based on specific conditions, such as device charging or network availability.
    5. **Firebase Cloud Messaging:** Utilize Firebase Cloud Messaging to trigger background tasks when a device receives a specific message.

> ✦ **Additional notes**

Use a **foreground service** with a notification for ongoing user-visible work, or **WorkManager** (long-running/expedited workers with `setForeground`) for guaranteed deferrable work. Coroutines in `viewModelScope` are for work tied to the UI, not for work that must survive the app being closed. Mind the Android 12+ background-start restrictions.

### A219. How did you handle Live location tracking?

Answer:

> ✦ **Added answer**

Typical approach: runtime location permissions (foreground, then background if needed) → **FusedLocationProviderClient** with a `LocationRequest` (interval, priority) → run in a **foreground service** with a notification for continuous tracking → send updates to the backend (Retrofit/Firebase) → draw them on Google Maps; handle battery and permission-denied cases.


## Testing & Others

### T001. What is a Unit Test?

Answer:

   1. If you want to verify whether application code works as you expect.
   2. And you want to verify it over and over again to be sure that you do not break any existing functionalities.
   3. Unit Test is a piece of code that is not a part of our application.
   4. It can create and call all of our application’s public classes and methods.

### T002. Important points in Unit test?

Answer:

   1. **Arrange, Act, Assert (AAA) Pattern**: Structure our tests using the AAA pattern.

### T003. What is a Test Double?

Answer:

   1. A test double is a replacement for a real dependency used during testing.
   2. There are different kinds of test doubles:
      1.

| Test Doubles │ ├── Dummy ├── Stub ├── Mock ├── Fake └── Spy |
| :---- |

         1.

| *//Actual Files* interface UserRepository{    fun getUser(): User } class UserViewModel(        userRepository: UserRepository,        logger: Logger ):ViewModel{    fun gerUsername():String{        return userRepository.getUser().name()    }    fun loadUser():User{        return userRepository.getUser()    } } |
| :---- |
| class FakeUserRepository : UserRepository{           *//Fake*    private val users \= *listOf*(User(1,"Raja"),User(2,"Rani"))    override getUsers():List\<User\>{        return users    } } |
| class UserViewModelTest{    val userRepository : UserRepository \= mock(UserRepository::class.java)  *//1. Mock*    \`when\`(userRepository.getUser())thenReturn(User(1,"raja")) *//2. Stub*    val logger \= Logger()    *//3. Dummy*       val userViewModel:UserViewModel \= UserViewModel(userRepository, logger)    val name \= userViewModel.getUsername()    assetEquals("raja", name)    *//------Mock verify*    userViewModel.loadUser()    verify(repository).getUser()     *//Verify that getUser() was called.    //------Fake verify*    val fakeUserRepository :FakeUserRepository \= FakeUserRepository()      *//Fake*    val users \= userViewModel.getUsers()    assetEquals(2,users.size) } |

      2.
   3.

### T004. What is a Mock?

Answer:

   1. Mock is mainly used to **verify interactions with a dependency** which is happening or not.
   2. Example:

| @Test fun \`loadUser should call repository\`() {    val repository \= mock(UserRepository::class.java)    val viewModel \= UserViewModel(repository)    viewModel.loadUser()    verify(repository).getUser() } |
| :---- |
| ViewModel     │     │ login("john", "1234")     ↓ Mock Repository     │     ↓ Verify it was called |

   3.

### T005. What is a Fake?

Answer:

   1. A Fake is a **working but simplified implementation**.
   2. Use a **fake** when you want to **test real behavior without heavy dependencies**.
   3. Example: Faking API response

| class FakeUserRepository : UserRepository {    //fake data    private val users \= listOf(            User(1, "John"),            User(2, "Alex")    )     override fun getUsers(): List\<User\> {        return users    } } |
| :---- |
| @Test fun \`login should succeed with correct credentials\`() {    val repository \= **FakeLoginRepository()**     val viewModel \= LoginViewModel(repository)    val result \= viewModel.login("john", "1234")    assertTrue(result) } |
| ViewModel      ↓ FakeLoginRepository      ↓ Checks username/password      ↓ returns true |

   4.

### T006. Mock vs Fake?

Answer:

   1. Use a **fake** when you want to **test real behavior without heavy dependencies**.
   2. Use a **mock** when you want to **test interactions between objects**

### T007. Test Doubles and its uses?

Answer:

   1. A test double is a replacement for a real dependency used during testing.
   2. There are different kinds of test doubles:
      1.

| Test Doubles │ ├── Dummy ├── Stub ├── Mock ├── Fake └── Spy |
| :---- |

         1.

| *//Actual Files* interface UserRepository{    fun getUser(): User } class UserViewModel(        userRepository: UserRepository,        logger: Logger ):ViewModel{    fun gerUsername():String{        return userRepository.getUser().name()    }    fun loadUser():User{        return userRepository.getUser()    } } |
| :---- |
| class FakeUserRepository : UserRepository{           *//Fake*    private val users \= *listOf*(User(1,"Raja"),User(2,"Rani"))    override getUsers():List\<User\>{        return users    } } |
| class UserViewModelTest{    val userRepository : UserRepository \= mock(UserRepository::class.java)  *//1. Mock*    \`when\`(userRepository.getUser())thenReturn(User(1,"raja")) *//2. Stub*    val logger \= Logger()    *//3. Dummy*       val userViewModel:UserViewModel \= UserViewModel(userRepository, logger)    val name \= userViewModel.getUsername()    assetEquals("raja", name)    *//------Mock verify*    userViewModel.loadUser()    verify(repository).getUser()     *//Verify that getUser() was called.    //------Fake verify*    val fakeUserRepository :FakeUserRepository \= FakeUserRepository()      *//Fake*    val users \= userViewModel.getUsers()    assetEquals(2,users.size) } |

      2.
   3.

### T008. Can a singleton class be unit tested?

Answer:

    1. Yes,but writing unit tests for singletons can be very difficult.
    2. We can use reflection to reset the singleton object to prevent tests from affecting each other.
    3.
    4.

### T009. What is natural naming in unit tests?

Answer:

    1. The name of the function accurately reflects what the function does.
    2. The name of the function uses spaces to separate the words, which makes it easy to read and understand.
          @Test
           fun \`login with correct login and password\`() {

           }

### T010. What is Junit?

Answer:

    1. It is a “Unit Testing” framework for Java Applications.
    2. It is an automation framework for Unit as well as UI Testing.
    3. It contains annotations such as @Test, @Before, @After etc.
    4. Other annotations : @Ignore, @RunWith, @Rule, @ClassRule

### T011. What are the Testing Exceptions in JUnit Tests?

Answer:

    1. JUnit provides several methods and annotations that can be used to test for expected exceptions,
    2. including the @Test(expected) annotation and the assertThrows() method.
    3. Ex:

       @Test(expected \= ArithmeticException.**class**)

       **public void** testDivideByZero() {

          **int** result \= 5 / 0;

       }

### T012. What are JUnit Annotations?

Answer:

    1. **@Tes**t: This annotation is used to mark a method as a test method. JUnit will execute all methods annotated with @Test when running the test suite.

    2. **@Before**: This annotation is used to indicate that a method should be executed before each test method. It is commonly used to set up preconditions or common test data.

    3. **@After**: This annotation is used to indicate that a method should be executed after each test method. It is commonly used for cleanup tasks.

    4. **@BeforeClass**: This annotation is used to indicate that a method should be executed once before any test methods are run. It is typically used for expensive setup tasks that can be shared among all test methods.

    5. **@AfterClas**s: This annotation is used to indicate that a method should be executed once after all test methods are run. It is typically used for cleanup tasks that need to be done after all tests have finished.

       **Secondary Annotations:**
    6. **@Ignore**: This annotation is used to temporarily disable a test method or an entire test class from being executed. It is useful when you want to skip certain tests without removing them permanently.
       @Ignore
       @Test
       fun testMethod2() {
       *// This test will be ignored and not executed*
       }

    7. **@RunWith**: JUnit allows you to use different runners to customize test execution. For example, you can use @RunWith(Parameterized::class) for parameterized tests or @RunWith(Suite::class) to create test suites.
       *// Use the MockitoJUnitRunner to enable Mockito annotations*
       @RunWith(MockitoJUnitRunner::class)
       class SearchRecipesTest {
       }

    8. **@Rule**: JUnit rules are used to add additional behavior or apply external resources to our tests. You can use built-in rules like TemporaryFolder, ExpectedException, or create custom rules.

    9. **@ClassRule**: Similar to @Rule, but applies to the whole test class instead of individual test methods.

       **JUnit Jupiter Annotations (JUnit 5):**
    10. **@DisplayName**: This annotation allows you to provide a custom display name for our test methods or test classes, which will be shown in test reports.
        @Test
        @DisplayName("Test Method 1")
        fun testMethod1() {
        *// Test method 1 implementation*
        }

    11. **@Nested**: This annotation is used to create nested test classes within an outer test class. It helps in organizing related tests.

    12. **@Tag**: Used to tag tests with user-defined labels. Tags are useful for filtering and grouping tests based on specific criteria.

    13. **@RepeatedTest**: Used to repeat a test a specified number of times.
        @RepeatedTest(5) *// Repeat this test 5 times*
        fun testMethod() {
        *// Test method implementation*
        }

    14. **@ParameterizedTest**: Used for parameterized testing, allowing you to run the same test with different sets of parameters.

    15. **@TestFactory**: Used to create dynamic tests at runtime. It is useful when the number of tests or test cases is not known until runtime.

### T013. What is Mockito?

Answer:

    1. Mockito is a popular **mocking framework** used for **unit testing** in Java and Android applications.
    2. It allows you to **create mock objects of classes or interfaces** that are difficult or impossible to test, such as system services or third-party libraries.
    3. It provides annotations such as @Mock.

### T014. What are annotations in mockito?

Answer:

    1. **@Mock**: This annotation is used to create a mock object. It tells Mockito to create a mock instance of the specified class or interface.

    2. **@InjectMocks**: This annotation is used to inject mock objects into the tested object. It automatically injects the mocks marked with @Mock into the object being tested.

    3. **@Spy**: This annotation is used to create a spy object. A spy is a partial mock that wraps a real object while allowing selective stubbing or verification.

    4. **@Captor**: This annotation is used to create an ArgumentCaptor, which is used to capture arguments passed to mocked methods for further assertions.

    5. **@MockitoSettings**: This annotation allows you to configure various settings for Mockito behavior, such as whether to enable or disable static mocking, lenient mocks, etc.

    6. **@MockedStatic**: Used to mock static methods in a class. Introduced in Mockito 3\.

    7. **@SpyBean**: A Spring-specific annotation used to create a spy bean when performing integration tests with Spring Boot.

    8. **@MockBean**: A Spring-specific annotation used to create a mock bean when performing integration tests with Spring Boot.
    9.

### T015. What is Robolectric?

Answer:

    1. [Robolectric, Unit testing framework for Android | by Umang Kothari | AndroidPub | Medium](https://medium.com/android-news/robolectric-unit-testing-framework-for-android-b78ebac0b411)
    2. It is a **unit testing framework** that allows Android applications to be **tested on the JVM without an emulator or device**.
    3. These are the main features of it:
       1. It provides a way to run our **tests inside Android Studio, without launching app** on Device or Emulator.
       2. Shadow Classes, rewritten android core libraries by Robolectric, are the real magic of Robolectric. It is a replica of Android class with some exposed useful functions.
       3. You can test on Android components like:
          1. Activity
          2. Services
          3. Broadcast Receiver

### T016. What are the collections used in swift?

Answer:

   1. Array
      2. Set
      3. Tuple
      4. Dictionary
   2. **Arrays**: Arrays are **ordered collections of elements** of the **same type.** They can be declared using square brackets and **can be mutable or immutable**.
      *// Declaring a mutable array of integers*
         **var numbers** \= \[1, 2, 3, 4, 5\]

      *// Accessing and modifying elements in an array*
         print(numbers\[0\]) *// 1*

     numbers\[0\] \= 10

   3. **Sets**: Sets are **unordered collections of unique elements** of the **same type.** They can be declared using curly braces and can also be **mutable or immutable**.
        *// Declaring a mutable set of integers*
         **var uniqueNumbers**: Set \= \[1, 2, 3, 4, 5\]

      *// Adding and removing elements from a set*
        uniqueNumbers.insert(6)
        uniqueNumbers.remove(3)

      *// Iterating over elements in a set*
         **for** number **in** uniqueNumbers {
             print(number)
         }

   4. **Tuples**: Tuples are **ordered collections of elements** of **different types**. They can be declared using parentheses and **can contain up to 10 elements**. Tuples are often used to return multiple values from a function.
      *// Declaring a tuple*
        let myTuple \= (name: **"John"**, age: 30, isMale: **true**)

      *// Accessing values in a tuple*
        print(myTuple.name) *// "John"*
          print(myTuple.1) *// 30*

   5. **Dictionaries**: Dictionaries are **unordered collections of key-value pairs**, where **each key must be unique**. They can be declared using square brackets and a colon to separate the keys and values, and **can be mutable or immutable**.


## General / Project / HR

### G001. Tell me about previous projects?

Answer:

> ✦ **Added answer**

*Personal question – answer with your own experience.* A good structure: project name and purpose → your role → tech stack (Kotlin, MVVM, Retrofit, Room, Hilt, Compose …) → a challenge you solved → the result.

### G002. Agile Methodology?

Answer:

> ✦ **Added answer**

An iterative way of delivering software in short cycles (sprints) with continuous feedback. In **Scrum**: roles (Product Owner, Scrum Master, Team), artifacts (backlog, sprint backlog, increment) and ceremonies (planning, daily stand-up, review, retrospective). Values: working software, collaboration, responding to change.

### G003. What are the difficulties you faced during app development?

Answer:

> ✦ **Added answer**

*Personal question.* Pick one or two real examples and show how you solved them – e.g. memory leaks, ANR/performance, configuration changes and process death, API/version fragmentation, background-work limits, or complex state handling.

### G004. Tell me about yourself?

Answer:

> ✦ **Added answer**

*Personal question.* Keep it to about a minute: current role and years of experience → main skills (Android, Kotlin, Jetpack, MVVM) → one or two achievements → why this role.

### G005. What will you do after a ticket is assigned to you?

Answer:

> ✦ **Added answer**

Read and clarify requirements and acceptance criteria → ask questions → estimate and break the work down → create a branch → implement with tests → self-review → raise a pull request → address review feedback → QA/testing → merge and update the ticket status.

### G006. Tell me about your job role?

Answer:

> ✦ **Added answer**

*Personal question.* Describe your responsibilities (feature development, bug fixing, code reviews, releases, mentoring) and your tech stack and team setup.
