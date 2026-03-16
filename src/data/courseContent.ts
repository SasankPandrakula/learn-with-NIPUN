export type Lesson = {
  id: string;
  title: string;
  content: string; // markdown
};

export type CourseData = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

export const courseContent: Record<string, CourseData> = {
  c: {
    id: "c",
    title: "C Programming",
    description: "Master the fundamentals of programming with C.",
    lessons: [
      {
        id: "c-intro",
        title: "Introduction to C",
        content: `# Introduction to C

C is a **general-purpose programming language** created by Dennis Ritchie at Bell Labs in 1972. It is one of the most widely used languages and forms the foundation of many modern languages like C++, Java, and Python.

## Why Learn C?

- It gives you a deep understanding of how computers work
- It's the language behind operating systems (Linux, Windows kernel)
- Extremely fast and efficient
- Foundation for learning other languages

## Your First C Program

\`\`\`c
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
\`\`\`

### How It Works

| Part | Meaning |
|------|---------|
| \`#include <stdio.h>\` | Includes the Standard Input/Output library |
| \`int main()\` | The main function — entry point of the program |
| \`printf()\` | Prints text to the console |
| \`return 0;\` | Tells the OS the program finished successfully |

## Compilation Process

C is a **compiled language**. You write source code in a \`.c\` file and compile it to machine code:

\`\`\`bash
gcc hello.c -o hello
./hello
\`\`\`

> **Tip:** Install GCC (GNU Compiler Collection) to compile C programs on your machine.
`,
      },
      {
        id: "c-variables",
        title: "Variables & Data Types",
        content: `# Variables & Data Types

A **variable** is a named location in memory that stores a value.

## Declaring Variables

\`\`\`c
int age = 25;
float price = 9.99;
char grade = 'A';
\`\`\`

## Common Data Types

| Type | Size | Description | Example |
|------|------|-------------|---------|
| \`int\` | 4 bytes | Integer numbers | \`42\` |
| \`float\` | 4 bytes | Decimal numbers (6-7 digits) | \`3.14\` |
| \`double\` | 8 bytes | Decimal numbers (15 digits) | \`3.14159265\` |
| \`char\` | 1 byte | Single character | \`'A'\` |

## Format Specifiers

Used with \`printf()\` and \`scanf()\`:

\`\`\`c
int x = 10;
float y = 3.14;
char c = 'Z';

printf("Integer: %d\\n", x);
printf("Float: %.2f\\n", y);
printf("Character: %c\\n", c);
\`\`\`

## Constants

Use \`const\` to create read-only variables:

\`\`\`c
const float PI = 3.14159;
// PI = 3.0;  // ❌ Error: cannot modify a const
\`\`\`

## User Input

\`\`\`c
int age;
printf("Enter your age: ");
scanf("%d", &age);
printf("You are %d years old\\n", age);
\`\`\`

> **Note:** The \`&\` operator passes the memory address of the variable to \`scanf()\`.
`,
      },
      {
        id: "c-operators",
        title: "Operators",
        content: `# Operators in C

Operators perform operations on variables and values.

## Arithmetic Operators

\`\`\`c
int a = 10, b = 3;

printf("%d\\n", a + b);   // 13 (Addition)
printf("%d\\n", a - b);   // 7  (Subtraction)
printf("%d\\n", a * b);   // 30 (Multiplication)
printf("%d\\n", a / b);   // 3  (Division - integer)
printf("%d\\n", a % b);   // 1  (Modulus - remainder)
\`\`\`

## Comparison Operators

\`\`\`c
int x = 5, y = 10;

printf("%d\\n", x == y);  // 0 (false)
printf("%d\\n", x != y);  // 1 (true)
printf("%d\\n", x < y);   // 1 (true)
printf("%d\\n", x >= y);  // 0 (false)
\`\`\`

## Logical Operators

\`\`\`c
int a = 1, b = 0;

printf("%d\\n", a && b);  // 0 (AND)
printf("%d\\n", a || b);  // 1 (OR)
printf("%d\\n", !a);      // 0 (NOT)
\`\`\`

## Assignment Operators

\`\`\`c
int x = 10;
x += 5;   // x = 15
x -= 3;   // x = 12
x *= 2;   // x = 24
x /= 4;   // x = 6
x %= 4;   // x = 2
\`\`\`

## Increment & Decrement

\`\`\`c
int i = 5;
i++;  // i = 6 (post-increment)
++i;  // i = 7 (pre-increment)
i--;  // i = 6 (post-decrement)
\`\`\`
`,
      },
      {
        id: "c-conditions",
        title: "Conditions (if/else)",
        content: `# Conditions in C

Conditions let your program make decisions.

## if Statement

\`\`\`c
int age = 18;

if (age >= 18) {
    printf("You can vote!\\n");
}
\`\`\`

## if...else

\`\`\`c
int temp = 35;

if (temp > 30) {
    printf("It's hot outside\\n");
} else {
    printf("Nice weather\\n");
}
\`\`\`

## else if

\`\`\`c
int score = 75;

if (score >= 90) {
    printf("Grade: A\\n");
} else if (score >= 80) {
    printf("Grade: B\\n");
} else if (score >= 70) {
    printf("Grade: C\\n");
} else {
    printf("Grade: F\\n");
}
\`\`\`

## Switch Statement

\`\`\`c
int day = 3;

switch (day) {
    case 1: printf("Monday\\n"); break;
    case 2: printf("Tuesday\\n"); break;
    case 3: printf("Wednesday\\n"); break;
    default: printf("Other day\\n");
}
\`\`\`

## Ternary Operator

A shorthand for simple if/else:

\`\`\`c
int age = 20;
char *status = (age >= 18) ? "Adult" : "Minor";
printf("%s\\n", status);  // Adult
\`\`\`
`,
      },
      {
        id: "c-loops",
        title: "Loops",
        content: `# Loops in C

Loops repeat a block of code multiple times.

## for Loop

\`\`\`c
for (int i = 0; i < 5; i++) {
    printf("i = %d\\n", i);
}
// Output: i = 0, i = 1, i = 2, i = 3, i = 4
\`\`\`

## while Loop

\`\`\`c
int count = 0;

while (count < 5) {
    printf("count = %d\\n", count);
    count++;
}
\`\`\`

## do...while Loop

Executes at least once, then checks the condition:

\`\`\`c
int num;
do {
    printf("Enter a positive number: ");
    scanf("%d", &num);
} while (num <= 0);
\`\`\`

## break & continue

\`\`\`c
// break - exit the loop early
for (int i = 0; i < 10; i++) {
    if (i == 5) break;
    printf("%d ", i);  // 0 1 2 3 4
}

// continue - skip current iteration
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    printf("%d ", i);  // 1 3 5 7 9
}
\`\`\`

## Nested Loops

\`\`\`c
// Print a multiplication table
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= 5; j++) {
        printf("%4d", i * j);
    }
    printf("\\n");
}
\`\`\`
`,
      },
      {
        id: "c-functions",
        title: "Functions",
        content: `# Functions in C

A function is a reusable block of code that performs a specific task.

## Defining a Function

\`\`\`c
// Function declaration (prototype)
int add(int a, int b);

// Function definition
int add(int a, int b) {
    return a + b;
}

// Using the function
int main() {
    int result = add(5, 3);
    printf("Sum: %d\\n", result);  // Sum: 8
    return 0;
}
\`\`\`

## void Functions

Functions that don't return a value:

\`\`\`c
void greet(char name[]) {
    printf("Hello, %s!\\n", name);
}

int main() {
    greet("Nipun");  // Hello, Nipun!
    return 0;
}
\`\`\`

## Pass by Value vs Reference

\`\`\`c
// Pass by value (copy)
void doubleVal(int x) {
    x = x * 2;  // Only changes local copy
}

// Pass by reference (pointer)
void doubleRef(int *x) {
    *x = *x * 2;  // Changes the original
}

int main() {
    int num = 5;
    doubleVal(num);
    printf("%d\\n", num);  // 5 (unchanged)

    doubleRef(&num);
    printf("%d\\n", num);  // 10 (changed!)
    return 0;
}
\`\`\`

## Recursion

A function that calls itself:

\`\`\`c
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

printf("%d\\n", factorial(5));  // 120
\`\`\`
`,
      },
      {
        id: "c-arrays",
        title: "Arrays",
        content: `# Arrays in C

An array stores multiple values of the same type in a single variable.

## Declaring Arrays

\`\`\`c
int numbers[5] = {10, 20, 30, 40, 50};

// Access elements (0-indexed)
printf("%d\\n", numbers[0]);  // 10
printf("%d\\n", numbers[4]);  // 50
\`\`\`

## Looping Through Arrays

\`\`\`c
int scores[] = {85, 92, 78, 96, 88};
int size = sizeof(scores) / sizeof(scores[0]);

for (int i = 0; i < size; i++) {
    printf("Score %d: %d\\n", i + 1, scores[i]);
}
\`\`\`

## 2D Arrays

\`\`\`c
int matrix[3][3] = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

printf("%d\\n", matrix[1][2]);  // 6
\`\`\`

## Common Array Operations

\`\`\`c
// Find the maximum value
int max = numbers[0];
for (int i = 1; i < 5; i++) {
    if (numbers[i] > max) {
        max = numbers[i];
    }
}
printf("Max: %d\\n", max);  // 50

// Calculate the sum
int sum = 0;
for (int i = 0; i < 5; i++) {
    sum += numbers[i];
}
printf("Sum: %d\\n", sum);   // 150
\`\`\`

> **Warning:** C does not check array bounds! Accessing \`numbers[10]\` won't give an error but will read garbage memory.
`,
      },
      {
        id: "c-pointers",
        title: "Pointers",
        content: `# Pointers in C

A pointer is a variable that stores the **memory address** of another variable.

## Basics

\`\`\`c
int age = 25;
int *ptr = &age;  // ptr stores the address of age

printf("Value: %d\\n", age);     // 25
printf("Address: %p\\n", &age);  // 0x7ffd5e8a...
printf("Pointer: %p\\n", ptr);   // Same address
printf("Dereferenced: %d\\n", *ptr); // 25
\`\`\`

## Pointer Arithmetic

\`\`\`c
int arr[] = {10, 20, 30, 40, 50};
int *p = arr;  // Points to first element

printf("%d\\n", *p);       // 10
printf("%d\\n", *(p + 1)); // 20
printf("%d\\n", *(p + 2)); // 30

p++;  // Move to next element
printf("%d\\n", *p);       // 20
\`\`\`

## Pointers and Functions

\`\`\`c
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 5, y = 10;
    swap(&x, &y);
    printf("x=%d, y=%d\\n", x, y);  // x=10, y=5
}
\`\`\`

## NULL Pointers

\`\`\`c
int *ptr = NULL;  // Points to nothing

if (ptr != NULL) {
    printf("%d\\n", *ptr);
} else {
    printf("Pointer is NULL\\n");
}
\`\`\`

> **Key Concept:** \`&\` gives the address, \`*\` gives the value at an address.
`,
      },
      {
        id: "c-strings",
        title: "Strings",
        content: `# Strings in C

In C, strings are arrays of characters terminated by a null character \`'\\0'\`.

## Declaring Strings

\`\`\`c
char greeting[] = "Hello";
// Equivalent to: char greeting[] = {'H','e','l','l','o','\\0'};

printf("%s\\n", greeting);         // Hello
printf("Length: %lu\\n", strlen(greeting)); // 5
\`\`\`

## String Functions (\`#include <string.h>\`)

\`\`\`c
#include <string.h>

char str1[20] = "Hello";
char str2[] = "World";

// Length
printf("%lu\\n", strlen(str1));     // 5

// Copy
strcpy(str1, "Hi");
printf("%s\\n", str1);             // Hi

// Concatenate
strcat(str1, " World");
printf("%s\\n", str1);             // Hi World

// Compare
int result = strcmp("abc", "abd");
printf("%d\\n", result);           // negative (a < d)
\`\`\`

## Reading Strings

\`\`\`c
char name[50];

// scanf reads until space
printf("Enter first name: ");
scanf("%s", name);

// fgets reads entire line
printf("Enter full name: ");
fgets(name, 50, stdin);
\`\`\`

> **Warning:** Always ensure your char arrays are large enough to hold the string plus the null terminator!
`,
      },
      {
        id: "c-structs",
        title: "Structures",
        content: `# Structures in C

A **struct** groups related variables of different types under one name.

## Defining a Struct

\`\`\`c
struct Student {
    char name[50];
    int age;
    float gpa;
};

int main() {
    struct Student s1;
    strcpy(s1.name, "Nipun");
    s1.age = 20;
    s1.gpa = 3.8;

    printf("Name: %s\\n", s1.name);
    printf("Age: %d\\n", s1.age);
    printf("GPA: %.1f\\n", s1.gpa);
}
\`\`\`

## Using typedef

\`\`\`c
typedef struct {
    char title[100];
    char author[50];
    int pages;
    float price;
} Book;

Book b1 = {"C Programming", "K&R", 272, 49.99};
printf("%s by %s\\n", b1.title, b1.author);
\`\`\`

## Array of Structs

\`\`\`c
Book library[3] = {
    {"C Programming", "K&R", 272, 49.99},
    {"Python Crash Course", "Matthes", 544, 35.99},
    {"Clean Code", "Martin", 464, 39.99}
};

for (int i = 0; i < 3; i++) {
    printf("%s - $%.2f\\n", library[i].title, library[i].price);
}
\`\`\`

## Pointers to Structs

\`\`\`c
Book *ptr = &b1;

// Arrow operator (shorthand)
printf("%s\\n", ptr->title);    // C Programming
printf("%d\\n", ptr->pages);    // 272

// Equivalent to:
printf("%s\\n", (*ptr).title);
\`\`\`
`,
      },
    ],
  },

  python: {
    id: "python",
    title: "Python Programming",
    description: "From basics to advanced Python.",
    lessons: [
      {
        id: "py-intro",
        title: "Introduction to Python",
        content: `# Introduction to Python

Python is a **high-level, interpreted** programming language known for its simplicity and readability. Created by Guido van Rossum in 1991.

## Why Learn Python?

- Simple, readable syntax — great for beginners
- Versatile: web dev, data science, AI, automation
- Huge ecosystem of libraries
- In-demand skill in the job market

## Your First Python Program

\`\`\`python
print("Hello, World!")
\`\`\`

That's it! No semicolons, no brackets, no \`main()\` function needed.

## Python vs C

| Feature | C | Python |
|---------|---|--------|
| Typing | Static | Dynamic |
| Compilation | Compiled | Interpreted |
| Syntax | Verbose | Concise |
| Memory | Manual | Automatic (GC) |
| Speed | Very fast | Slower |

## Running Python

\`\`\`bash
# Run a file
python hello.py

# Interactive mode
python
>>> 2 + 2
4
\`\`\`

> **Tip:** Use Python 3.x (not Python 2 which is deprecated).
`,
      },
      {
        id: "py-variables",
        title: "Variables & Data Types",
        content: `# Variables & Data Types

Python variables don't need type declarations — the type is inferred automatically.

## Creating Variables

\`\`\`python
name = "Nipun"       # str
age = 20             # int
gpa = 3.85           # float
is_student = True    # bool

print(type(name))    # <class 'str'>
print(type(age))     # <class 'int'>
\`\`\`

## Strings

\`\`\`python
greeting = "Hello"
name = "World"

# Concatenation
print(greeting + " " + name)   # Hello World

# f-strings (Python 3.6+)
print(f"{greeting}, {name}!")   # Hello, World!

# String methods
text = "  Hello World  "
print(text.strip())     # "Hello World"
print(text.upper())     # "  HELLO WORLD  "
print(text.lower())     # "  hello world  "
print(text.split())     # ['Hello', 'World']
print(len(text.strip()))  # 11
\`\`\`

## Numbers

\`\`\`python
x = 10      # int
y = 3.14    # float
z = 2 + 3j  # complex

# Type conversion
print(float(x))    # 10.0
print(int(y))      # 3
print(str(x))      # "10"
\`\`\`

## Multiple Assignment

\`\`\`python
a, b, c = 1, 2, 3
x = y = z = 0
\`\`\`
`,
      },
      {
        id: "py-lists",
        title: "Lists & Tuples",
        content: `# Lists & Tuples

## Lists (Mutable)

\`\`\`python
fruits = ["apple", "banana", "cherry"]

# Access
print(fruits[0])     # apple
print(fruits[-1])    # cherry

# Modify
fruits[1] = "blueberry"
fruits.append("date")
fruits.insert(1, "avocado")
fruits.remove("cherry")

# Slicing
print(fruits[1:3])   # ['avocado', 'blueberry']

# List comprehension
squares = [x**2 for x in range(10)]
# [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

evens = [x for x in range(20) if x % 2 == 0]
# [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
\`\`\`

## Useful List Methods

\`\`\`python
nums = [3, 1, 4, 1, 5, 9, 2, 6]

nums.sort()              # [1, 1, 2, 3, 4, 5, 6, 9]
nums.reverse()           # [9, 6, 5, 4, 3, 2, 1, 1]
print(len(nums))         # 8
print(min(nums))         # 1
print(max(nums))         # 9
print(sum(nums))         # 31
\`\`\`

## Tuples (Immutable)

\`\`\`python
point = (3, 4)
colors = ("red", "green", "blue")

x, y = point  # Unpacking
print(x)       # 3

# Tuples can't be modified
# colors[0] = "yellow"  ❌ TypeError
\`\`\`

> **When to use what?** Use lists when data changes, tuples when it shouldn't.
`,
      },
      {
        id: "py-dictionaries",
        title: "Dictionaries & Sets",
        content: `# Dictionaries & Sets

## Dictionaries (Key-Value Pairs)

\`\`\`python
student = {
    "name": "Nipun",
    "age": 20,
    "courses": ["Python", "DSA"]
}

# Access
print(student["name"])        # Nipun
print(student.get("gpa", 0))  # 0 (default)

# Modify
student["age"] = 21
student["gpa"] = 3.8

# Loop
for key, value in student.items():
    print(f"{key}: {value}")

# Dictionary comprehension
squares = {x: x**2 for x in range(6)}
# {0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
\`\`\`

## Common Dict Methods

\`\`\`python
d = {"a": 1, "b": 2, "c": 3}

print(d.keys())     # dict_keys(['a', 'b', 'c'])
print(d.values())   # dict_values([1, 2, 3])
print("a" in d)     # True
d.pop("b")          # Removes key 'b'
\`\`\`

## Sets (Unique Values)

\`\`\`python
colors = {"red", "green", "blue", "red"}
print(colors)  # {'red', 'green', 'blue'}

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)   # Union: {1, 2, 3, 4, 5, 6}
print(a & b)   # Intersection: {3, 4}
print(a - b)   # Difference: {1, 2}
\`\`\`
`,
      },
      {
        id: "py-functions",
        title: "Functions",
        content: `# Functions in Python

## Defining Functions

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

print(greet("Nipun"))  # Hello, Nipun!
\`\`\`

## Default & Keyword Arguments

\`\`\`python
def power(base, exp=2):
    return base ** exp

print(power(3))        # 9
print(power(2, 10))    # 1024
print(power(exp=3, base=5))  # 125
\`\`\`

## *args and **kwargs

\`\`\`python
def total(*args):
    return sum(args)

print(total(1, 2, 3, 4))  # 10

def info(**kwargs):
    for key, val in kwargs.items():
        print(f"{key} = {val}")

info(name="Nipun", age=20)
\`\`\`

## Lambda Functions

\`\`\`python
square = lambda x: x ** 2
print(square(5))  # 25

# With map/filter
nums = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, nums))
evens = list(filter(lambda x: x%2==0, nums))
\`\`\`

## Decorators

\`\`\`python
def timer(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time()-start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    import time
    time.sleep(1)
    return "Done"

slow_function()  # slow_function took 1.00xxs
\`\`\`
`,
      },
      {
        id: "py-oop",
        title: "Object-Oriented Programming",
        content: `# Object-Oriented Programming

## Classes & Objects

\`\`\`python
class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        self.courses = []

    def enroll(self, course):
        self.courses.append(course)
        print(f"{self.name} enrolled in {course}")

    def __str__(self):
        return f"Student({self.name}, age={self.age})"

s = Student("Nipun", 20)
s.enroll("Python")
print(s)  # Student(Nipun, age=20)
\`\`\`

## Inheritance

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} says Meow!"

pets = [Dog("Rex"), Cat("Whiskers")]
for pet in pets:
    print(pet.speak())
\`\`\`

## Class Methods & Static Methods

\`\`\`python
class Circle:
    pi = 3.14159

    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return Circle.pi * self.radius ** 2

    @classmethod
    def from_diameter(cls, diameter):
        return cls(diameter / 2)

    @staticmethod
    def is_valid_radius(r):
        return r > 0

c = Circle.from_diameter(10)
print(c.area())  # 78.53975
\`\`\`
`,
      },
      {
        id: "py-files",
        title: "File Handling",
        content: `# File Handling in Python

## Reading Files

\`\`\`python
# Read entire file
with open("data.txt", "r") as f:
    content = f.read()
    print(content)

# Read line by line
with open("data.txt", "r") as f:
    for line in f:
        print(line.strip())

# Read into list
with open("data.txt", "r") as f:
    lines = f.readlines()
\`\`\`

## Writing Files

\`\`\`python
# Write (overwrites)
with open("output.txt", "w") as f:
    f.write("Hello, World!\\n")
    f.write("Second line\\n")

# Append
with open("output.txt", "a") as f:
    f.write("Third line\\n")
\`\`\`

## Working with CSV

\`\`\`python
import csv

# Reading CSV
with open("students.csv") as f:
    reader = csv.DictReader(f)
    for row in reader:
        print(row["name"], row["grade"])

# Writing CSV
with open("output.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Score"])
    writer.writerow(["Nipun", 95])
\`\`\`

## Working with JSON

\`\`\`python
import json

data = {"name": "Nipun", "scores": [95, 88, 92]}

# Write JSON
with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

# Read JSON
with open("data.json") as f:
    loaded = json.load(f)
    print(loaded["name"])  # Nipun
\`\`\`

> **Always use \`with\` statements** — they automatically close the file even if an error occurs.
`,
      },
      {
        id: "py-errors",
        title: "Error Handling",
        content: `# Error Handling

## try / except

\`\`\`python
try:
    num = int(input("Enter a number: "))
    result = 10 / num
    print(f"Result: {result}")
except ValueError:
    print("That's not a valid number!")
except ZeroDivisionError:
    print("Cannot divide by zero!")
except Exception as e:
    print(f"Unexpected error: {e}")
finally:
    print("This always runs")
\`\`\`

## Raising Exceptions

\`\`\`python
def set_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    if age > 150:
        raise ValueError("Age seems unrealistic")
    return age

try:
    set_age(-5)
except ValueError as e:
    print(e)  # Age cannot be negative
\`\`\`

## Custom Exceptions

\`\`\`python
class InsufficientFundsError(Exception):
    def __init__(self, balance, amount):
        self.balance = balance
        self.amount = amount
        super().__init__(
            f"Cannot withdraw \${amount}. Balance: \${balance}"
        )

class BankAccount:
    def __init__(self, balance):
        self.balance = balance

    def withdraw(self, amount):
        if amount > self.balance:
            raise InsufficientFundsError(self.balance, amount)
        self.balance -= amount

account = BankAccount(100)
try:
    account.withdraw(150)
except InsufficientFundsError as e:
    print(e)  # Cannot withdraw $150. Balance: $100
\`\`\`
`,
      },
    ],
  },

  java: {
    id: "java",
    title: "Java Programming",
    description: "Comprehensive Java course covering OOP and enterprise patterns.",
    lessons: [
      {
        id: "java-intro",
        title: "Introduction to Java",
        content: `# Introduction to Java

Java is a **class-based, object-oriented** programming language designed to be portable across platforms ("Write Once, Run Anywhere").

## Your First Java Program

\`\`\`java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### Key Points

| Concept | Description |
|---------|-------------|
| \`public class\` | Every Java program needs at least one class |
| \`main()\` | Entry point of the program |
| \`System.out.println()\` | Prints to console with newline |
| File name | Must match the class name (\`HelloWorld.java\`) |

## Compile & Run

\`\`\`bash
javac HelloWorld.java    # Compile to bytecode
java HelloWorld          # Run on JVM
\`\`\`

## Java vs Python vs C

| Feature | Java | Python | C |
|---------|------|--------|---|
| Typing | Static | Dynamic | Static |
| OOP | Required | Optional | None |
| Memory | GC | GC | Manual |
| Speed | Fast | Slow | Fastest |
| Platform | JVM | Interpreter | Native |
`,
      },
      {
        id: "java-variables",
        title: "Variables & Data Types",
        content: `# Variables & Data Types in Java

## Primitive Types

\`\`\`java
int age = 25;
double price = 9.99;
float rate = 3.14f;
char grade = 'A';
boolean isActive = true;
long bigNumber = 9999999999L;
byte small = 127;
short medium = 32767;
\`\`\`

## Type Sizes

| Type | Size | Range |
|------|------|-------|
| \`byte\` | 1 byte | -128 to 127 |
| \`short\` | 2 bytes | -32,768 to 32,767 |
| \`int\` | 4 bytes | ±2.1 billion |
| \`long\` | 8 bytes | ±9.2 quintillion |
| \`float\` | 4 bytes | ~7 decimal digits |
| \`double\` | 8 bytes | ~15 decimal digits |
| \`char\` | 2 bytes | Unicode character |
| \`boolean\` | 1 bit | true/false |

## Strings (Reference Type)

\`\`\`java
String name = "Nipun";

System.out.println(name.length());       // 5
System.out.println(name.toUpperCase());  // NIPUN
System.out.println(name.charAt(0));      // N
System.out.println(name.contains("ip")); // true

// String formatting
String msg = String.format("Hello, %s! Age: %d", name, 20);
\`\`\`

## Type Casting

\`\`\`java
// Widening (automatic)
int x = 10;
double y = x;  // 10.0

// Narrowing (manual)
double a = 9.78;
int b = (int) a;  // 9
\`\`\`
`,
      },
      {
        id: "java-oop",
        title: "OOP in Java",
        content: `# Object-Oriented Programming

## Classes & Objects

\`\`\`java
public class Student {
    // Fields
    private String name;
    private int age;

    // Constructor
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // Getter
    public String getName() { return name; }

    // Method
    public void introduce() {
        System.out.println("Hi, I'm " + name + ", age " + age);
    }
}

// Usage
Student s = new Student("Nipun", 20);
s.introduce();  // Hi, I'm Nipun, age 20
\`\`\`

## Inheritance

\`\`\`java
class Animal {
    String name;

    Animal(String name) { this.name = name; }

    void speak() {
        System.out.println(name + " makes a sound");
    }
}

class Dog extends Animal {
    Dog(String name) { super(name); }

    @Override
    void speak() {
        System.out.println(name + " barks!");
    }
}
\`\`\`

## Interfaces

\`\`\`java
interface Drawable {
    void draw();
    default void color() {
        System.out.println("Default color: black");
    }
}

class Circle implements Drawable {
    public void draw() {
        System.out.println("Drawing a circle");
    }
}
\`\`\`

## Abstract Classes

\`\`\`java
abstract class Shape {
    abstract double area();

    void describe() {
        System.out.println("Area: " + area());
    }
}

class Rectangle extends Shape {
    double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    double area() { return w * h; }
}
\`\`\`
`,
      },
      {
        id: "java-collections",
        title: "Collections Framework",
        content: `# Collections Framework

Java Collections provide dynamic data structures.

## ArrayList

\`\`\`java
import java.util.ArrayList;

ArrayList<String> names = new ArrayList<>();
names.add("Alice");
names.add("Bob");
names.add("Charlie");

System.out.println(names.get(0));  // Alice
System.out.println(names.size());  // 3
names.remove("Bob");

for (String name : names) {
    System.out.println(name);
}
\`\`\`

## HashMap

\`\`\`java
import java.util.HashMap;

HashMap<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
scores.put("Charlie", 92);

System.out.println(scores.get("Alice"));  // 95
System.out.println(scores.containsKey("Bob"));  // true

for (var entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
\`\`\`

## HashSet

\`\`\`java
import java.util.HashSet;

HashSet<String> unique = new HashSet<>();
unique.add("apple");
unique.add("banana");
unique.add("apple");  // Duplicate ignored

System.out.println(unique.size());  // 2
\`\`\`

## Sorting

\`\`\`java
import java.util.Collections;

ArrayList<Integer> nums = new ArrayList<>(List.of(5, 2, 8, 1, 9));
Collections.sort(nums);
System.out.println(nums);  // [1, 2, 5, 8, 9]

// Custom sort
names.sort((a, b) -> a.length() - b.length());
\`\`\`
`,
      },
      {
        id: "java-exceptions",
        title: "Exception Handling",
        content: `# Exception Handling in Java

## try-catch-finally

\`\`\`java
try {
    int[] nums = {1, 2, 3};
    System.out.println(nums[5]);  // ArrayIndexOutOfBoundsException
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Index out of bounds: " + e.getMessage());
} catch (Exception e) {
    System.out.println("Error: " + e.getMessage());
} finally {
    System.out.println("This always executes");
}
\`\`\`

## Throwing Exceptions

\`\`\`java
public static int divide(int a, int b) {
    if (b == 0) {
        throw new ArithmeticException("Cannot divide by zero");
    }
    return a / b;
}
\`\`\`

## Custom Exceptions

\`\`\`java
class InsufficientFundsException extends Exception {
    private double amount;

    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Short by: $" + amount);
        this.amount = amount;
    }
}

class BankAccount {
    private double balance;

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
    }
}
\`\`\`

## Checked vs Unchecked

| Type | Examples | Must Handle? |
|------|----------|--------------|
| Checked | IOException, SQLException | Yes (\`throws\` or \`try-catch\`) |
| Unchecked | NullPointerException, ArithmeticException | No (optional) |
`,
      },
    ],
  },

  dsa: {
    id: "dsa",
    title: "Data Structures & Algorithms",
    description: "Deep dive into fundamental data structures and algorithms.",
    lessons: [
      {
        id: "dsa-intro",
        title: "Introduction to DSA",
        content: `# Introduction to Data Structures & Algorithms

## What is a Data Structure?

A data structure is a way of **organizing and storing data** so it can be accessed and modified efficiently.

## What is an Algorithm?

An algorithm is a **step-by-step procedure** for solving a problem or performing a task.

## Why Learn DSA?

- Write efficient code
- Ace coding interviews (FAANG, startups)
- Build scalable applications
- Think like a computer scientist

## Time Complexity (Big O)

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Linear search |
| O(n log n) | Linearithmic | Merge sort |
| O(n²) | Quadratic | Bubble sort |
| O(2ⁿ) | Exponential | Recursive Fibonacci |

## Example: Comparing Approaches

\`\`\`python
# O(n²) - Check for duplicates with nested loops
def has_duplicate_slow(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] == arr[j]:
                return True
    return False

# O(n) - Check for duplicates with a set
def has_duplicate_fast(arr):
    seen = set()
    for item in arr:
        if item in seen:
            return True
        seen.add(item)
    return False
\`\`\`

> For 1,000,000 items: the slow version does ~500 billion comparisons, the fast version does ~1 million.
`,
      },
      {
        id: "dsa-arrays",
        title: "Arrays & Strings",
        content: `# Arrays & Strings

## Arrays — The Foundation

\`\`\`python
# Static array (fixed size in C/Java, dynamic in Python)
arr = [10, 20, 30, 40, 50]

# Access: O(1)
print(arr[2])  # 30

# Search: O(n)
print(30 in arr)  # True

# Insert at end: O(1) amortized
arr.append(60)

# Insert at beginning: O(n) — shifts all elements
arr.insert(0, 5)
\`\`\`

## Common Array Techniques

### Two Pointers

\`\`\`python
# Check if array is a palindrome
def is_palindrome(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        if arr[left] != arr[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome([1, 2, 3, 2, 1]))  # True
\`\`\`

### Sliding Window

\`\`\`python
# Max sum of subarray of size k
def max_subarray_sum(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)

    return max_sum

print(max_subarray_sum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4))  # 24
\`\`\`

### Prefix Sum

\`\`\`python
# Range sum queries in O(1)
nums = [1, 2, 3, 4, 5]
prefix = [0]
for n in nums:
    prefix.append(prefix[-1] + n)

# Sum of range [1, 3] (inclusive)
print(prefix[4] - prefix[1])  # 2+3+4 = 9
\`\`\`
`,
      },
      {
        id: "dsa-linked-lists",
        title: "Linked Lists",
        content: `# Linked Lists

A linked list stores elements as **nodes**, where each node points to the next.

## Implementation

\`\`\`python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node

    def display(self):
        elements = []
        current = self.head
        while current:
            elements.append(str(current.data))
            current = current.next
        print(" -> ".join(elements))

    def delete(self, data):
        if self.head and self.head.data == data:
            self.head = self.head.next
            return
        current = self.head
        while current.next:
            if current.next.data == data:
                current.next = current.next.next
                return
            current = current.next

ll = LinkedList()
ll.append(10)
ll.append(20)
ll.append(30)
ll.display()   # 10 -> 20 -> 30
ll.delete(20)
ll.display()   # 10 -> 30
\`\`\`

## Array vs Linked List

| Operation | Array | Linked List |
|-----------|-------|-------------|
| Access by index | O(1) | O(n) |
| Insert at beginning | O(n) | O(1) |
| Insert at end | O(1)* | O(n) |
| Search | O(n) | O(n) |
| Memory | Contiguous | Scattered |
`,
      },
      {
        id: "dsa-stacks-queues",
        title: "Stacks & Queues",
        content: `# Stacks & Queues

## Stack (LIFO — Last In, First Out)

\`\`\`python
class Stack:
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()

    def peek(self):
        return self.items[-1]

    def is_empty(self):
        return len(self.items) == 0

# Example: Balanced parentheses
def is_balanced(s):
    stack = Stack()
    mapping = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in '([{':
            stack.push(char)
        elif char in ')]}':
            if stack.is_empty() or stack.pop() != mapping[char]:
                return False
    return stack.is_empty()

print(is_balanced("({[]})"))   # True
print(is_balanced("({[})"))    # False
\`\`\`

## Queue (FIFO — First In, First Out)

\`\`\`python
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()

    def enqueue(self, item):
        self.items.append(item)

    def dequeue(self):
        return self.items.popleft()

    def is_empty(self):
        return len(self.items) == 0

# BFS uses a queue
q = Queue()
q.enqueue("Task 1")
q.enqueue("Task 2")
print(q.dequeue())  # Task 1
\`\`\`

| Feature | Stack | Queue |
|---------|-------|-------|
| Principle | LIFO | FIFO |
| Insert | push (top) | enqueue (rear) |
| Remove | pop (top) | dequeue (front) |
| Use case | Undo, DFS | BFS, scheduling |
`,
      },
      {
        id: "dsa-sorting",
        title: "Sorting Algorithms",
        content: `# Sorting Algorithms

## Bubble Sort — O(n²)

\`\`\`python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
\`\`\`

## Merge Sort — O(n log n)

\`\`\`python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result
\`\`\`

## Quick Sort — O(n log n) average

\`\`\`python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quick_sort(left) + middle + quick_sort(right)
\`\`\`

## Comparison

| Algorithm | Best | Average | Worst | Space | Stable? |
|-----------|------|---------|-------|-------|---------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
`,
      },
      {
        id: "dsa-trees",
        title: "Binary Trees & BST",
        content: `# Binary Trees & Binary Search Trees

## Binary Tree Node

\`\`\`python
class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
\`\`\`

## Binary Search Tree (BST)

In a BST: **left < parent < right**

\`\`\`python
class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        self.root = self._insert(self.root, val)

    def _insert(self, node, val):
        if not node:
            return TreeNode(val)
        if val < node.val:
            node.left = self._insert(node.left, val)
        else:
            node.right = self._insert(node.right, val)
        return node

    def search(self, val):
        return self._search(self.root, val)

    def _search(self, node, val):
        if not node or node.val == val:
            return node
        if val < node.val:
            return self._search(node.left, val)
        return self._search(node.right, val)
\`\`\`

## Tree Traversals

\`\`\`python
# In-order (Left, Root, Right) — gives sorted order
def inorder(node):
    if node:
        inorder(node.left)
        print(node.val, end=" ")
        inorder(node.right)

# Pre-order (Root, Left, Right)
def preorder(node):
    if node:
        print(node.val, end=" ")
        preorder(node.left)
        preorder(node.right)

# Post-order (Left, Right, Root)
def postorder(node):
    if node:
        postorder(node.left)
        postorder(node.right)
        print(node.val, end=" ")
\`\`\`

## BST Operations Complexity

| Operation | Average | Worst (unbalanced) |
|-----------|---------|---------------------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
`,
      },
    ],
  },

  fullstack: {
    id: "fullstack",
    title: "Full Stack Development",
    description: "Build modern web apps from frontend to backend.",
    lessons: [
      {
        id: "fs-html",
        title: "HTML Fundamentals",
        content: `# HTML Fundamentals

HTML (HyperText Markup Language) is the **skeleton** of every web page.

## Basic Structure

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
</body>
</html>
\`\`\`

## Common Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| \`<h1>-<h6>\` | Headings | \`<h1>Title</h1>\` |
| \`<p>\` | Paragraph | \`<p>Text here</p>\` |
| \`<a>\` | Link | \`<a href="url">Click</a>\` |
| \`<img>\` | Image | \`<img src="pic.jpg" alt="Photo">\` |
| \`<ul>/<ol>\` | Lists | \`<ul><li>Item</li></ul>\` |
| \`<div>\` | Division/container | \`<div class="box">...</div>\` |

## Semantic HTML

\`\`\`html
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about">About</a>
    </nav>
</header>

<main>
    <article>
        <h2>Article Title</h2>
        <p>Article content...</p>
    </article>

    <aside>
        <h3>Related Links</h3>
    </aside>
</main>

<footer>
    <p>&copy; 2024 Learn With Nipun</p>
</footer>
\`\`\`

## Forms

\`\`\`html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <button type="submit">Submit</button>
</form>
\`\`\`
`,
      },
      {
        id: "fs-css",
        title: "CSS & Flexbox",
        content: `# CSS & Flexbox

CSS (Cascading Style Sheets) makes HTML look great.

## Selectors & Properties

\`\`\`css
/* Element selector */
h1 { color: #333; font-size: 2rem; }

/* Class selector */
.card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* ID selector */
#header { background: #1a1a2e; }

/* Pseudo-class */
a:hover { color: #0066cc; }
\`\`\`

## The Box Model

Every element is a box:

\`\`\`css
.box {
    width: 300px;
    padding: 20px;     /* Inside spacing */
    border: 1px solid #ddd;
    margin: 10px;      /* Outside spacing */
    box-sizing: border-box; /* Width includes padding+border */
}
\`\`\`

## Flexbox

The modern way to layout elements:

\`\`\`css
.container {
    display: flex;
    justify-content: space-between; /* Horizontal alignment */
    align-items: center;            /* Vertical alignment */
    gap: 20px;                      /* Space between items */
    flex-wrap: wrap;                /* Wrap on small screens */
}

.item {
    flex: 1;          /* Equal width */
    min-width: 200px; /* Minimum size before wrapping */
}
\`\`\`

## Responsive Design

\`\`\`css
/* Mobile first */
.grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
    .grid {
        flex-direction: row;
        flex-wrap: wrap;
    }
    .grid-item { flex: 1 1 calc(50% - 16px); }
}

/* Desktop */
@media (min-width: 1024px) {
    .grid-item { flex: 1 1 calc(33% - 16px); }
}
\`\`\`
`,
      },
      {
        id: "fs-js",
        title: "JavaScript Essentials",
        content: `# JavaScript Essentials

JavaScript makes web pages **interactive**.

## Variables

\`\`\`javascript
const name = "Nipun";    // Can't reassign
let age = 20;            // Can reassign
// var is old, avoid it

console.log(\`Hello, \${name}!\`);  // Template literal
\`\`\`

## Functions

\`\`\`javascript
// Arrow function
const add = (a, b) => a + b;

// Regular function
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Destructuring
const { title, author } = book;
const [first, ...rest] = [1, 2, 3, 4];
\`\`\`

## Arrays

\`\`\`javascript
const nums = [1, 2, 3, 4, 5];

// map — transform each element
const doubled = nums.map(n => n * 2);     // [2, 4, 6, 8, 10]

// filter — keep matching elements
const evens = nums.filter(n => n % 2 === 0); // [2, 4]

// reduce — accumulate into single value
const sum = nums.reduce((acc, n) => acc + n, 0); // 15

// find
const found = nums.find(n => n > 3);  // 4

// Spread
const more = [...nums, 6, 7];  // [1, 2, 3, 4, 5, 6, 7]
\`\`\`

## Async/Await

\`\`\`javascript
// Fetch data from an API
async function getUser(id) {
    try {
        const response = await fetch(\`/api/users/\${id}\`);
        if (!response.ok) throw new Error("User not found");
        const user = await response.json();
        return user;
    } catch (error) {
        console.error("Error:", error.message);
    }
}
\`\`\`

## DOM Manipulation

\`\`\`javascript
// Select elements
const btn = document.querySelector("#myButton");
const items = document.querySelectorAll(".item");

// Event listener
btn.addEventListener("click", () => {
    btn.textContent = "Clicked!";
    btn.classList.toggle("active");
});
\`\`\`
`,
      },
      {
        id: "fs-react",
        title: "React Basics",
        content: `# React Basics

React is a **component-based** library for building user interfaces.

## Components

\`\`\`jsx
// Functional component
function Welcome({ name }) {
    return <h1>Hello, {name}!</h1>;
}

// Usage
<Welcome name="Nipun" />
\`\`\`

## State with useState

\`\`\`jsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
\`\`\`

## Effects with useEffect

\`\`\`jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            const res = await fetch(\`/api/users/\${userId}\`);
            const data = await res.json();
            setUser(data);
            setLoading(false);
        }
        fetchUser();
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    return <h2>{user.name}</h2>;
}
\`\`\`

## Conditional Rendering

\`\`\`jsx
function Greeting({ isLoggedIn }) {
    return (
        <div>
            {isLoggedIn ? (
                <h1>Welcome back!</h1>
            ) : (
                <h1>Please sign in.</h1>
            )}
        </div>
    );
}
\`\`\`

## Lists

\`\`\`jsx
function TodoList({ todos }) {
    return (
        <ul>
            {todos.map(todo => (
                <li key={todo.id}>{todo.text}</li>
            ))}
        </ul>
    );
}
\`\`\`
`,
      },
      {
        id: "fs-api",
        title: "REST APIs & Backend",
        content: `# REST APIs & Backend

## What is a REST API?

A REST API lets your frontend communicate with a backend server using HTTP methods.

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Read data | \`GET /api/users\` |
| POST | Create data | \`POST /api/users\` |
| PUT | Update data | \`PUT /api/users/1\` |
| DELETE | Remove data | \`DELETE /api/users/1\` |

## Fetch API in JavaScript

\`\`\`javascript
// GET request
const response = await fetch('/api/courses');
const courses = await response.json();

// POST request
const newCourse = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: 'New Course',
        description: 'Course description'
    })
});
\`\`\`

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK — Success |
| 201 | Created — Resource created |
| 400 | Bad Request — Invalid data |
| 401 | Unauthorized — Not logged in |
| 403 | Forbidden — No permission |
| 404 | Not Found — Resource missing |
| 500 | Server Error — Bug in backend |

## Building with Node.js + Express

\`\`\`javascript
const express = require('express');
const app = express();

app.use(express.json());

let todos = [];

app.get('/api/todos', (req, res) => {
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const todo = {
        id: Date.now(),
        text: req.body.text,
        done: false
    };
    todos.push(todo);
    res.status(201).json(todo);
});

app.listen(3000, () => console.log('Server running on port 3000'));
\`\`\`

## Database Integration

\`\`\`javascript
// Using Supabase (PostgreSQL)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Read
const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true);

// Create
const { data } = await supabase
    .from('courses')
    .insert({ title: 'React 101', category: 'Web Dev' });
\`\`\`
`,
      },
    ],
  },
};
