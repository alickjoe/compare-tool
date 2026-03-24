declare module 'vkbeautify' {
  export function xml(text: string, indent?: number): string
  export function json(text: string, indent?: number): string
  export function css(text: string, indent?: number): string
  export function sql(text: string, indent?: number): string
}
