# Bien démarrer avec Vitte

Bienvenue dans **Vitte** — un langage de programmation système moderne qui combine :

- **La clarté de Python** → syntaxe lisible et minimale.  
- **La puissance de Rust** → gestion mémoire sûre, abstractions à coût nul.  
- **Le contrôle du C/Assembleur** → accès direct au matériel, performances déterministes.  

Vitte est conçu pour **la vitesse**, **la sécurité** et **l’expressivité**, ce qui le rend idéal pour :
- Les systèmes d’exploitation et noyaux.  
- Les systèmes embarqués et objets connectés (IoT).  
- Les moteurs de jeu et simulations temps réel.  
- Les systèmes back-end haute performance.  

---

## 🚀 Démarrage rapide

### 1. Installer la toolchain Vitte

Téléchargez et installez le compilateur et l’interface CLI :

```bash
curl -fsSL https://get.vitte.dev/install.sh | sh
```

Cela va :
- Installer la CLI `vitte` dans votre `$PATH`.  
- Configurer la **bibliothèque standard**.  
- Préparer votre environnement de développement.  

Vérifiez l’installation :
```bash
vitte --version
```

---

### 2. Créer un nouveau projet

```bash
vitte new hello
cd hello
```

Structure générée :
```
hello/
 ├─ src/
 │   └─ main.vt       # Point d’entrée
 ├─ vitte.toml        # Configuration du projet
 └─ README.md
```

---

### 3. Exécuter votre programme

```bash
vitte run
```

Ce qui se passe :
1. Compilation du projet avec le back-end LLVM.  
2. Exécution immédiate du binaire généré.  

---

## 📜 Votre premier programme

```vitte
do main() {
  println!("Hello, Vitte")!
}
```

**Explications :**
- `do main()` → Définit le point d’entrée du programme.  
- `println!()` → Affiche du texte avec retour à la ligne.  
- `!` → Indique une macro, qui peut propager des erreurs.  

---

## 🛠 Ajouter de l’interactivité

```vitte
do main() {
  print!("Quel est votre nom ? ")
  let name = input()!
  println!("Bonjour, {name}!")!
}
```

**Nouveaux concepts :**
- `print!()` → Affiche du texte sans retour à la ligne.  
- `input()` → Lit une ligne depuis l’entrée standard.  
- `{name}` → Interpolation de chaîne.  

---

## 💡 Conseils & pièges

**✅ Conseils :**
- Commencez petit et exécutez souvent (`vitte run`).  
- Utilisez `--release` pour les builds de production.  
- Profitez des vérifications de sécurité du compilateur.  

**⚠️ Pièges :**
- Les variables inutilisées provoquent un avertissement (`let _x = ...` pour le masquer).  
- Immuable par défaut : utilisez `mut` si nécessaire.  

---

## ⚡ Prochaines étapes

- 📖 Lire le [Tour du langage](#/fr/tour).  
- 📚 Consulter la [Référence complète](#/fr/reference).  
- 💻 Compiler avec optimisations :
```bash
vitte build --release
```
- 🧪 Lancer les tests :
```bash
vitte test
```