# Agent Rules

## Coding Guidelines

- Add a concise JSDoc comment at the top of every file in src/ you create describing the purpose of the file.

- After any change to TypeScript files, run `npm run tsc`.

## Testing

Multiple interceptor-specific suites execute the same core test cases to verify that each interceptor behaves the same way. Test cases are defined once in `test/test-cases.ts`.