# Vitte Language — Syntax Tour

Welcome to the **Vitte syntax tour** — a practical guide that walks you through the key concepts of the language, from basics to advanced features.

---

## 1. Your first program

```vitte
do main() {
    println!("Hello, Vitte")!
}
```

- `do` defines a **procedure** (function with no implicit return value).
- `println!` is a macro for displaying formatted text.
- `!` indicates a macro (like in Rust).
- Strings are enclosed in `"`.

---

## 2. Variables and constants

```vitte
let nom = "Alice"        // immutable variable
let mut compteur = 0     // mutable variable
const PI: f64 = 3.14159  // compile-time constant
```

By default, variables are immutable, making code safer.

---

## 3. Basic types

```vitte
let age: i32 = 30
let prix: f64 = 19.99
let actif: bool = true
let lettre: char = 'A'
```

- **Signed integers** : i8, i16, i32, i64, i128, isize
- **Unsigned integers** : u8, u16, u32, u64, u128, usize
- **Floating point** : f32, f64
- **Booleans** : bool
- **Characters** : char (UTF-8)

---

## 4. Arrays and slices

```vitte
let nombres = [1, 2, 3, 4]
let partie = &nombres[0..2]
```

- Arrays: fixed size known at compile time.
- Slices: views over part of an array.

---

## 5. Control flow

### Conditional
```vitte
if age >= 18 {
    println!("Adulte")!
} else {
    println!("Mineur")!
}
```

### Loops
```vitte
for i in 0..5 {
    println!(i)!
}

while compteur < 10 {
    compteur += 1
}

loop {
    break
}
```

### Match (pattern matching)
```vitte
match x {
    0 => println!("zéro")!,
    1..=9 => println!("petit")!,
    _ => println!("grand")!,
}
```

---

## 6. Functions

```vitte
fn addition(a: i32, b: i32) -> i32 {
    a + b
}

do afficher(msg: &str) {
    println!(msg)!
}
```

- `fn` : function with return value
- `do` : procedure without an implicit return value

---

## 7. Structures and enums

```vitte
struct Point { x: f64, y: f64 }
let p = Point { x: 1.0, y: 2.0 }

enum Couleur { Rouge, Vert, Bleu }
let c = Couleur::Rouge
```

---

## 8. Ownership system

```vitte
let s1 = String::from("bonjour")
let s2 = s1 // s1 is moved, and is no longer valid
```

Borrows :
```vitte
do afficher_ref(msg: &str) { println!(msg)! }
do modifier(msg: &mut String) { msg.push(" modifié") }
```

---

## 9. Error handling

```vitte
fn lire_fichier(chemin: &Path) -> Result[String, IoErr] {
    let f = open(chemin)?
    f.read_to_string()
}

try operation_risquée()
catch e: Panic => { println!("Erreur: {}", e)! }
```

---

## 10. Concurrency

```vitte
let (tx, rx) = Channel[i32]::unbounded()
spawn async { tx.send(42) }
let v = await rx.recv()
```

---

## 11. FFI and unsafe

```vitte
extern(c) { fn puts(s:*const u8) -> i32 }
do main() { unsafe { puts("Salut