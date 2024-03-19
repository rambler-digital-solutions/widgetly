interface Styles {
  [key: string]: string
}

declare module '*.css' {
  const styles: Styles
  export default styles
}
