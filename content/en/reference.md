# Vitte Language Reference — Beginner & Intermediate Guide

This document is the **official and complete reference** for **Vitte**, a high-performance systems programming language that blends:

- **The readability of Python**
- **The memory safety and power of Rust**
- **The low-level control of C and Assembly**
- **The simplicity of Go**

Vitte is designed for both **beginners** who want to quickly build safe applications, and **experienced developers** who need performance and control.

---

## 1. Introduction

Vitte can be used for:

- **Operating system kernels** — low-level control without sacrificing safety
- **Embedded systems** — minimal footprint, high efficiency
- **Game engines** — performance-critical applications
- **WebAssembly modules** — compile once, run everywhere
- **Server applications** — concurrency and scalability built-in

### Key Goals
1. **Lightweight syntax** — Readable like Python, but compiled and optimized like C++.
2. **Memory safety without garbage collection** — Prevent common bugs like dangling pointers.
3. **First-class C & Assembly interop** — For hardware-level programming.
4. **Optimized by default** — Compiles with LLVM for maximum performance.

> 💡 **Why learn Vitte?**
> - You want **Rust-like safety** but with a more approachable syntax.
> - You want **control like C**, but without constant risk of memory corruption.
> - You want a **language that scales** from microcontrollers to servers.

---

## 2. Basic Syntax

A minimal "Hello World":

```vitte
do main() {
    println!("Hello, Vitte")!
}
```

### Explanation:
- `do` — Declares a **procedure** that has no explicit return value.
- `println!` — A **macro** for printing text to the console.
- `!` — Indicates macro expansion.
- Strings — Enclosed in double quotes.

---

## 3. Variables & Constants

```vitte
let name = "Alice"           // Immutable by default
let mut counter = 0          // Mutable variable
const PI: f64 = 3.14159      // Compile-time constant
static mut GLOBAL: i32 = 10  // Global mutable (unsafe)
```

### Tips for Beginners
- Mutability is explicit — safer code, fewer accidental changes.
- `const` is evaluated at compile time — no runtime cost.
- `static mut` is **unsafe** — avoid unless absolutely necessary.

---

## 4. Data Types

### 4.1 Scalars
```vitte
let score: i32 = 100
let ratio: f64 = 0.75
let active: bool = true
let letter: char = 'A'
```

### 4.2 Strings
- `&str` — Immutable view of text.
- `String` — Owned, growable string.

```vitte
let name = "Bob"
let mut msg = String::from("Hello")
msg.push(" World")
```

### 4.3 Arrays & Slices
```vitte
let nums: [i32; 3] = [1, 2, 3]   // Fixed-size array
let slice: &[i32] = &nums[0..2] // Borrow part of an array
```

### 4.4 Structs
```vitte
struct Point { x: f64, y: f64 }
let p = Point { x: 1.0, y: 2.0 }
```

### 4.5 Enums
```vitte
enum Color { Red, Green, Blue }
let c = Color::Red
```

---

## 5. Control Flow

### If Expressions
```vitte
let x = if cond { 1 } else { 0 }
```

### Loops
```vitte
for i in 0..10 { println!(i)! }
while x > 0 { x -= 1 }
loop { break }
```

### Match Expressions
```vitte
match val {
    0 => println!("zero")!,
    1..=9 => println!("small")!,
    _ => println!("large")!,
}
```

---

## 6. Functions

```vitte
fn add(a: i32, b: i32) -> i32 { a + b }
do log(msg: &str) { println!(msg)! }
```

### Beginner Advice
- Use `fn` when returning a value.
- Use `do` when performing actions without returning.

---

## 7. Ownership System

Vitte uses **lightweight ownership** inspired by Rust.

```vitte
let s1 = String::from("hi")
let s2 = s1 // Move — s1 is no longer valid
```

References:
```vitte
let s = String::from("hello")
print_ref(&s)       // Immutable borrow
modify(&mut s)      // Mutable borrow
```

---

## 8. Traits & Generics

```vitte
trait Display { fn fmt(&self, dst: &mut String) }
fn max[T: Ord](a: T, b: T) -> T { if a > b { a } else { b } }
```

---

## 9. Error Handling

Idiomatic way with `Result`:
```vitte
fn read_file(path: &Path) -> Result[String, IoErr] {
    let f = open(path)?
    f.read_to_string()
}
```

With exceptions:
```vitte
try risky()
catch e: Panic => { recover(e) }
```

---

## 10. Concurrency

```vitte
let (tx, rx) = Channel[i32]::unbounded()
spawn async { tx.send(42) }
let v = await rx.recv()
```

---

## 11. FFI & Unsafe

```vitte
extern(c) { fn puts(s:*const u8) -> i32 }
do main() { unsafe { puts("Hi\0".as_ptr()) } }
```

---

## 12. Example Project Structure

```
my_project/
├── src/
│   ├── main.vit
│   ├── utils.vit
│   └── net.vit
├── package.vit
└── README.md
```

---

## 13. Summary

Vitte is a modern language that provides:

- Safety without garbage collection
- Performance on par with C and Rust
- Clean syntax for productivity
- Full control for advanced systems programming

