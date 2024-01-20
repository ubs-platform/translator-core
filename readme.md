# UBS Translator (Core)

This is an typescript library to managing translation operations. This library contains basic operations

**⚠️ DOM manupilation and fetching by url are not included in core library.** Some wraps are needed for DOM manupilations. You can check the [existing wraps](#wraps). If not exist for framework you used, you can open a issue or contact us.

## Installation

```Bash
npm install rxjs @ubs-platform/translator-core
```

Rxjs is required for listening operations

## Usage example (Typescript)

[Check on stackblitz](https://stackblitz.com/edit/typescript-twabpo)

[View on github](https://github.com/ubs-platform/translator-core-example/blob/main/index.ts)

## Wraps

| Framework    | Status         | Official | Repository                                                       |
| ------------ | -------------- | -------- | ---------------------------------------------------------------- |
| Vanillia     | ❌ Not planned |          |                                                                  |
| Angular 14   | 🪦 EOL (1.\*)  | ✅ Yes   | [Translator NGX](https://github.com/ubs-platform/translator-ngx) |
| Angular 15   | ❌ Not planned |          |                                                                  |
| Angular 16   | ✅ 2.\*        | ✅ Yes   | [Translator NGX](https://github.com/ubs-platform/translator-ngx) |
| React        | ❌ Not planned |          |                                                                  |
| React Native | ❌ Not planned |          |                                                                  |
| VueJS        | ❌ Not planned |          |                                                                  |

## Contact

### Hüseyin Can Gündüz

- [Linkedin](https://www.linkedin.com/in/huseyincgunduz/)
- [Instagram: @hussainlobo](https://instagram.com/hussainlobo)

## Changelogs

### 1.0.7

- `TranslationRepository.getString(TranslatorText)` accepts TranslatorText as null or undefined.

### 1.0.6

- Code optimisations and readme edits...

### 1.0.5

- Prefix is optional now
- Comment lines are added and readme.md is updated

### 1.0.0-4

- Worked on get runnable
