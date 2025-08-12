# Vitte Language — Syntax Tour

Bienvenue dans le **tour de la syntaxe Vitte**, un guide pas-à-pas pour comprendre les bases et les aspects avancés du langage.

---

## 1. Votre premier programme

```vitte
do main() {
    println!("Hello, Vitte")!
}
```

### Détails
- `do` déclare une **procédure** : elle ne retourne pas de valeur par défaut.
- `println!` est une **macro** (indiquée par `!`) pour afficher du texte formaté.
- Les chaînes de caractères (`"..."`) sont UTF-8 par défaut.
- Les fichiers source portent l’extension `.vit`.

💡 **Astuce** : vous pouvez exécuter ce code directement avec :
```sh
vitte run hello.vit
```

---

## 2. Variables et constantes

```vitte
let nom = "Alice"        // variable immuable
let mut compteur = 0     // variable mutable
const PI: f64 = 3.14159  // constante connue à la compilation
static mut GLOBAL: i32 = 10 // variable globale mutable (unsafe)
```

### Bonnes pratiques
- Toujours privilégier `let` immuable pour plus de sûreté.
- Les `const` sont évaluées **à la compilation**.
- `static mut` doit être utilisé avec précaution car non thread-safe.

---

## 3. Types de base

```vitte
let age: i32 = 30
let prix: f64 = 19.99
let actif: bool = true
let lettre: char = 'A'
```

- **Entiers signés** : `i8` … `i128`, `isize`
- **Entiers non signés** : `u8` … `u128`, `usize`
- **Flottants** : `f32`, `f64`
- **Booléens** : `bool` (`true` / `false`)
- **Caractères** : `char` (UTF-8)

⚠️ **Attention** : pas de conversions implicites entre types (`i32` ↔ `f64`).

---

## 4. Tableaux et tranches

```vitte
let nombres = [1, 2, 3, 4]
let partie = &nombres[0..2]
```

- Les **tableaux** ont une taille fixe connue à la compilation.
- Les **tranches** (`&[T]`) sont des vues immuables ou mutables sur un tableau.

---

## 5. Contrôle de flux

### Conditionnel
```vitte
if age >= 18 {
    println!("Adulte")!
} else {
    println!("Mineur")!
}
```

### Boucles
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

💡 **Astuce** : `match` doit être exhaustif — chaque cas doit être couvert ou utiliser `_`.

---

## 6. Fonctions

```vitte
fn addition(a: i32, b: i32) -> i32 {
    a + b
}

do afficher(msg: &str) {
    println!(msg)!
}
```

- `fn` : fonction qui retourne une valeur.
- `do` : procédure sans retour implicite.

---

## 7. Structures et énumérations

```vitte
struct Point { x: f64, y: f64 }
let p = Point { x: 1.0, y: 2.0 }

enum Couleur { Rouge, Vert, Bleu }
let c = Couleur::Rouge
```

📌 Les `enum` peuvent aussi contenir des données (enums sommatives).

---

## 8. Ownership et emprunts

```vitte
let s1 = String::from("bonjour")
let s2 = s1 // move
```

Emprunts :
```vitte
do afficher_ref(msg: &str) { println!(msg)! }
do modifier(msg: &mut String) { msg.push(" modifié") }
```

---

## 9. Gestion des erreurs

```vitte
fn lire_fichier(chemin: &Path) -> Result[String, IoErr] {
    let f = open(chemin)?
    f.read_to_string()
}
```

Gestion avec exceptions :
```vitte
try operation_risquée()
catch e: Panic => { println!("Erreur: {}", e)! }
```

---

## 10. Concurrence

```vitte
let (tx, rx) = Channel[i32]::unbounded()
spawn async { tx.send(42) }
let v = await rx.recv()
```

---

## 11. FFI et unsafe

```vitte
extern(c) { fn puts(s:*const u8) -> i32 }
do main() { unsafe { puts("Salut\0".as_ptr()) } }
```

---

## 12. Conclusion

Vous maîtrisez maintenant les fondations de Vitte.  
Pour le détail complet, voir la [référence du langage](#/fr/reference).
