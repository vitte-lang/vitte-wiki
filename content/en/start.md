
# Getting Started with Vitte

Welcome to **Vitte** — a modern systems programming language that blends:

- **The clarity of Python** → readable, minimal syntax.
- **The power of Rust** → safe memory management, zero-cost abstractions.
- **The control of C/Assembly** → direct hardware access, deterministic performance.

Vitte is designed for **speed**, **safety**, and **expressiveness**, making it perfect for:
- Operating systems & kernels.
- Embedded & IoT devices.
- Game engines & real-time simulations.
- High-performance back-end systems.

---

## 🚀 Quickstart

### 1. Install the Vitte Toolchain

Download and install the compiler & CLI:

```bash
curl -fsSL https://get.vitte.dev/install.sh | sh
```

This will:
- Install `vitte` CLI to your `$PATH`.
- Set up the **standard library**.
- Configure your development environment.

Verify installation:
```bash
vitte --version
```

---

### 2. Create a New Project

```bash
vitte new hello
cd hello
```

Generated project structure:
```
hello/
 ├─ src/
 │   └─ main.vt       # Entry point
 ├─ vitte.toml        # Project configuration
 └─ README.md
```

---

### 3. Run Your Program

```bash
vitte run
```

This will:
1. Compile the project with LLVM back-end.
2. Run the resulting binary immediately.

---

## 📜 Your First Program

```vitte
do main() {
  println!("Hello, Vitte")!
}
```

**Explanation:**
- `do main()` → Defines the program’s entry point.
- `println!()` → Prints text to console with newline.
- `!` → Indicates a macro, propagating possible errors.

---

## 🛠 Adding Interactivity

```vitte
do main() {
  print!("What's your name? ")
  let name = input()!
  println!("Hello, {name}!")!
}
```

**New concepts:**
- `print!()` → No newline added.
- `input()` → Reads a line from stdin.
- `{name}` → String interpolation.

---

## 💡 Tips & Pitfalls

**✅ Tips:**
- Always start small and run often (`vitte run`).
- Use `--release` for production builds.
- Rely on the compiler’s safety checks.

**⚠️ Pitfalls:**
- Unused variables cause warnings (`let _x = ...` to silence).
- Immutable by default: use `mut` if needed.

---

## ⚡ Next Steps

- 📖 Read the [Language Tour](#/en/tour).
- 📚 Check the [Full Reference](#/en/reference).
- 💻 Build with optimizations:
```bash
vitte build --release
```
- 🧪 Run tests:
```bash
vitte test
```
