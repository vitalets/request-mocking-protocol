# Agent Rules

## Coding Guidelines

- When you create a new typescript file, add a concise JSDoc comment at the top of the file describing the purpose of the file.

- After any change to TypeScript files, run `npm run tsc`.

## Testing

Multiple interceptor-specific suites execute the same core test cases to verify that each interceptor behaves the same way. Test cases are defined once in `test/test-cases.ts`.