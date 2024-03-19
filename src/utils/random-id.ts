export function randomId() {
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  return (Date.now() + Math.random()).toString(36)
}
