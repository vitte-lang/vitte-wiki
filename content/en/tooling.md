# Vitte Language — Tooling Guide

Welcome to the **Vitte Tooling Guide** — a complete overview of the tools that power the Vitte development workflow.

---

## 1. Overview

The **Vitte toolchain** provides everything you need to write, build, test, and distribute Vitte applications and libraries.

**Main components:**

- `vittec` — The Vitte compiler
- `vitte` — The CLI tool for project management
- Standard library (`vitstd`)
- Package manager (`vitpkg`)
- Build system (`vitbuild`)

---

## 2. Installing the Toolchain

### Official installation
```sh
curl -sSL https://get.vitte.dev | sh
```

### Manual installation
- Download binaries from [vitte.dev/downloads](https://vitte.dev/downloads)
- Extract and add the `bin` directory to your `PATH`.

---

## 3. CLI Commands

Run `vitte help` to see all available commands.

### 3.1 Creating a new project
```sh
vitte new my_project
cd my_project
vitte run
```

### 3.2 Building a project
```sh
vitte build --release
```

### 3.3 Running tests
```sh
vitte test
```

### 3.4 Formatting code
```sh
vitte fmt
```

### 3.5 Linting code
```sh
vitte lint
```

---

## 4. Compiler (`vittec`)

The **Vitte compiler** is designed for:
- **High performance**: LLVM-based optimizations
- **Safety checks**: Ownership, borrow rules, and type checking
- **Cross-compilation**: Build for multiple platforms with `--target`

Example:
```sh
vittec main.vt -o main --target x86_64-linux-gnu --opt-level 3
```

---

## 5. Package Manager (`vitpkg`)

Vitte includes a package manager inspired by Cargo and npm.

### Installing a dependency
```sh
vitpkg add serde
```

### Updating dependencies
```sh
vitpkg update
```

### Publishing a package
```sh
vitpkg publish
```

---

## 6. Build System (`vitbuild`)

The Vitte build system handles:
- Compilation
- Dependency resolution
- Target-specific optimizations
- Incremental builds

Custom build scripts can be added in `build.vt`.

---

## 7. Editor Integration

Vitte supports **Language Server Protocol (LSP)** for autocompletion, linting, and inline errors.

**Supported editors:**
- Visual Studio Code
- JetBrains IDEs
- Neovim
- Emacs

LSP installation:
```sh
vitte lsp install
```

---

## 8. Continuous Integration (CI)

Example **GitHub Actions** workflow:
```yaml
name: Vitte CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Vitte
        run: curl -sSL https://get.vitte.dev | sh
      - name: Build
        run: vitte build --release
      - name: Test
        run: vitte test
```

---

## 9. Debugging

Enable debug mode with:
```sh
vitte build --debug
```

You can use GDB or LLDB for low-level debugging:
```sh
gdb ./target/debug/my_project
```

---

## 10. Summary

The Vitte toolchain provides a **complete, integrated development experience** with:
- Fast compilation
- Robust package management
- Flexible build system
- First-class editor support
- Easy CI/CD integration

For more details, see the [Official Documentation](#/en/reference).
