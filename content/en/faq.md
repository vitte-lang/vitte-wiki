# Vitte FAQ

Welcome to the **Vitte** Frequently Asked Questions.  
This page addresses the most common questions developers ask when starting or using Vitte.

---

## General

**Q: What is Vitte?**  
A: Vitte is a modern systems programming language combining the readability of Python, the safety of Rust, the performance of C/C++, and the low-level control of assembly. It is designed for both beginners and experts aiming to create robust, fast, and scalable software.

**Q: Is Vitte open-source?**  
A: Yes. Vitte is fully open-source and licensed under a permissive license, allowing commercial and personal use.

**Q: What platforms does Vitte support?**  
A: Vitte can target Linux, macOS, Windows, BSD systems, as well as embedded devices and microcontrollers.

---

## Installation

**Q: How do I install Vitte?**  
A: Download the latest toolchain from the official repository and follow the installation instructions for your OS.  
Example on Linux:
```bash
curl -fsSL https://vitte-lang.org/install.sh | sh
```

**Q: Does Vitte require a specific compiler?**  
A: Yes, Vitte uses its own compiler but internally relies on LLVM for code generation.

---

## Syntax & Features

**Q: How different is Vitte from Rust or Python?**  
A: Vitte borrows Rust’s memory safety and ownership model but uses a more flexible and Python-like syntax. It also supports direct inline assembly.

**Q: Does Vitte have garbage collection?**  
A: No. Vitte uses deterministic memory management with ownership and borrowing rules.

**Q: Does Vitte support async programming?**  
A: Yes. Vitte includes built-in async/await syntax, channels, and concurrency primitives.

---

## Development

**Q: How do I create a new project?**  
```bash
vitte new my_project
cd my_project
vitte run
```

**Q: Can I use C libraries in Vitte?**  
A: Yes, via its FFI (`extern(c) { ... }`) system.

**Q: Is cross-compilation supported?**  
A: Yes, using `vitte build --target <platform>`.

---

## Debugging & Testing

**Q: Does Vitte have built-in testing?**  
A: Yes. You can write tests with the `@test` attribute and run them using `vitte test`.

**Q: How do I debug Vitte code?**  
A: Use `vitte build --debug` and run it inside `gdb`, `lldb`, or with Vitte’s integrated debugger.

---

## Community & Contribution

**Q: Where can I ask for help?**  
A: You can join our official forum, Discord, or GitHub Discussions.

**Q: How can I contribute?**  
A: Fork the repository, make your changes, and submit a pull request. See the `CONTRIBUTING.md` file for more details.

---

_Last updated: 2025-08-12_
