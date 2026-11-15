# Relational Databases and ER Models

Source: [Note_27_Feb_2022.pdf](<../../Scalar java backend contents/Note_27_Feb_2022.pdf>) (11 pages)

The opening page outlines a DBMS course: relational database basics, normalization, indexing and B-trees, then SQL queries. The remaining handwritten pages introduce DBMS types, entities, relationships, and keys. This guide puts those pieces in learning order; use the PDF diagrams for the original examples.

## 1. What a DBMS does

A **database management system (DBMS)** stores and organizes data and provides operations to read and change it. A relational DBMS (RDBMS) represents data in **tables** with rows and columns. SQL is the common language for defining and querying relational data.

Typical DBMS responsibilities include:

- Persisting data and retrieving it by query.
- Enforcing constraints such as unique identifiers and valid references.
- Managing concurrent transactions.
- Providing recovery and durability after failures.
- Controlling access to data.

The source compares relational and non-relational database types and lists RDBMS basics, normalization, indexing, and SQL as course topics ([pages 1–2](<../../Scalar java backend contents/Note_27_Feb_2022.pdf#page=1>)).

## 2. Model the domain with entities and attributes

An **entity** is a distinguishable real-world concept the application needs to store, such as a `Student`, `Course`, or `Professor`. An **entity instance** is one particular student or course. In a relational design, an entity commonly becomes a table and each instance a row.

An **attribute** describes an entity and commonly becomes a column. For example:

```text
STUDENT(student_id, name, email)
COURSE(course_id, title)
```

Attributes may be:

- **Simple or composite:** a simple value such as a postal code versus a value that can be decomposed, such as a full address.
- **Single-valued or multi-valued:** one date of birth versus multiple phone numbers.
- **Required or optional:** an email that must be present versus an optional middle name.

If a value has useful independent structure, consider representing it as separate columns or a related table rather than storing an opaque combined string. A multi-valued attribute usually becomes a separate related table in a relational schema.

An **Entity-Relationship (ER) diagram** is a conceptual view of entities, attributes, and relationships. The source uses rectangles for entities, ellipses for attributes, and connecting lines for relationships.

## 3. Relationships and cardinality

**Cardinality** describes how many instances on one side of a relationship may be associated with instances on the other side:

- **One-to-one (1:1):** one person has at most one passport record, and each passport belongs to one person.
- **One-to-many (1:N):** one department has many employees; each employee belongs to one department.
- **Many-to-many (M:N):** many students can enroll in many courses.

For the student/course example, use an associative entity such as `Enrollment`:

```text
STUDENT 1 ---- * ENROLLMENT * ---- 1 COURSE

STUDENT(student_id, ...)
COURSE(course_id, ...)
ENROLLMENT(student_id, course_id, enrolled_at, grade)
```

`Enrollment` turns the many-to-many relation into two one-to-many relations. Attributes that describe the relationship itself, such as enrollment date or grade, belong on the linking entity.

Also ask whether participation is optional or mandatory. For example, a department may exist before it has employees, while each employee might be required to belong to a department. Cardinality and optionality together express relationship constraints more accurately than a line alone.

## 4. Keys identify and connect rows

- A **superkey** is any set of one or more attributes that uniquely identifies a row. It may contain unnecessary attributes.
- A **candidate key** is a *minimal* superkey: removing any attribute would make it stop uniquely identifying rows.
- A **primary key** is the candidate key selected as the table's main identifier. It must identify each row uniquely and should not be null. DBMSs commonly create an index for it.
- An **alternate key** is a candidate key not chosen as the primary key.
- A **composite key** uses multiple columns together, such as `(student_id, course_id)` in `Enrollment`.
- A **foreign key** references a key in another table and ensures that a relationship points to a valid row, subject to the DBMS's constraints and configured delete/update behavior.

Example:

```text
STUDENT(student_id PK, email UNIQUE, name)
ENROLLMENT(student_id FK, course_id FK, PRIMARY KEY(student_id, course_id))
```

`email` may also be unique, so it is a candidate key; `student_id` is chosen as the primary key. The pair in `Enrollment` prevents the same student/course relationship from being inserted twice.

Keep identifiers stable when possible. Using a mutable value such as an email as a foreign key makes changes more difficult; a stable ID is often a better relationship key.

## 5. Turn an ER model into tables

These are common mapping rules:

1. Make a table for each entity and define its primary key.
2. Put a foreign key on the “many” side of a one-to-many relation.
3. For many-to-many, make a linking table whose foreign keys reference both sides; use the pair as a composite key when one pair should occur only once.
4. For one-to-one, place a foreign key on one side and enforce uniqueness; choose the side based on optionality and lifecycle.
5. Represent a multi-valued attribute with its own table that references the owning entity.
6. Put attributes describing the relationship on the linking table.

Example for a department and employees:

```sql
CREATE TABLE Department (
    department_id INTEGER PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Employee (
    employee_id INTEGER PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES Department(department_id),
    name VARCHAR(100) NOT NULL
);
```

The foreign key is on `Employee`, the many side. Exact SQL syntax varies by database.

## 6. Normalization: reduce update anomalies

**Normalization** organizes relations to reduce duplicated facts and insertion, update, and deletion anomalies. The source's course outline names first and second normal forms; the following examples show the core progression.

### First normal form (1NF)

Store one value per cell and avoid repeating groups of columns. A student's list of phone numbers should not be placed in one comma-separated column if the application needs to query each number.

```text
Not atomic:
STUDENT(student_id, name, phone_numbers = "555-0101, 555-0102")

Separate values:
STUDENT(student_id, name)
STUDENT_PHONE(student_id, phone_number)
```

Atomicity depends on how the application uses the value: keep a value together when it is treated as one indivisible unit; split it when its pieces have independent meaning or queries.

### Second normal form (2NF)

A relation is in 2NF when it is in 1NF and every non-key attribute depends on the *whole* candidate key, not just part of a composite key.

Suppose `ENROLLMENT(student_id, course_id, student_name, course_title, grade)` has composite key `(student_id, course_id)`. `student_name` depends only on `student_id`; `course_title` depends only on `course_id`. Store student and course facts in their own tables, leaving relationship facts such as `grade` in `ENROLLMENT`.

### Third normal form (3NF)

A relation is in 3NF when it is in 2NF and non-key attributes do not depend transitively on the key through another non-key attribute. If `employee_id -> department_id -> department_name`, store the department name with the department rather than repeating it on every employee row.

Normalization reduces inconsistent duplication. Some read-heavy systems deliberately denormalize for performance, but then the application must manage duplicated values consistently.

## 7. Indexes and B-trees

An **index** is an additional data structure that helps a DBMS find rows without scanning an entire table. A B-tree-family index keeps keys ordered and balanced, supporting efficient equality lookup and range scans. The source's course outline specifically lists indexing and B-trees.

```text
SELECT * FROM Employee WHERE department_id = 12;
```

An index on `department_id` may help this query, depending on table size and the query plan.

Indexes have costs:

- They consume disk and memory.
- Inserts, updates, and deletes must maintain affected indexes.
- An index that is not selective or is not used by important queries may add cost without benefit.

Choose indexes from observed query filters, joins, ordering, and range conditions. A primary-key index is common, but not every column should automatically receive an index.

## 8. SQL: define, insert, query

SQL statements commonly include:

- **DDL (data definition):** create or alter schema objects, such as `CREATE TABLE`.
- **DML (data manipulation):** insert or change rows, such as `INSERT`, `UPDATE`, and `DELETE`.
- **Queries:** retrieve data with `SELECT`.

Example query:

```sql
SELECT e.name, d.name AS department
FROM Employee AS e
JOIN Department AS d ON d.department_id = e.department_id
WHERE d.name = 'Engineering'
ORDER BY e.name;
```

Use parameters for values supplied by users rather than building SQL by string concatenation. Constraints belong in the database as well as application validation when they protect fundamental data invariants.

For multi-step changes that must succeed together, use a transaction. The common ACID properties are atomicity, consistency, isolation, and durability; the DBMS's exact isolation behavior depends on its transaction model and configuration.

## Relational vs. non-relational models

Relational systems represent data as tables and relationships, queried with SQL. Non-relational (NoSQL) systems use other models such as key-value, document, or wide-column. NoSQL is not a single schema or consistency model. Choose a database based on the data relationships, access patterns, transaction needs, scale, and operational requirements—not on a blanket claim that one type is always faster.

## Quick self-check

1. How does an entity differ from an attribute?
2. What is the difference between a 1:N and M:N relationship?
3. Why does a relational schema use a linking table for an M:N relationship?
4. How do a superkey, candidate key, primary key, and foreign key differ?
5. What does 2NF prevent when a table has a composite key?
6. How can normalization reduce update anomalies?
7. Why can an index speed up reads but slow down writes?
8. What does a B-tree index help the database do?
9. Why should database choice follow access patterns and constraints?

## Source page guide

- [Pages 1–2](<../../Scalar java backend contents/Note_27_Feb_2022.pdf#page=1>): RDBMS course topics and database-type overview.
- [Pages 3–6](<../../Scalar java backend contents/Note_27_Feb_2022.pdf#page=3>): entities, attributes, relationships, and cardinality diagrams.
- [Pages 7–11](<../../Scalar java backend contents/Note_27_Feb_2022.pdf#page=7>): key examples and ER-to-relational concepts.

The handwritten examples are difficult to recover in places. Normalization, indexes, B-trees, and SQL are included because they appear in the source's opening course outline; refer to the original notes for any additional class examples or exact notation.
