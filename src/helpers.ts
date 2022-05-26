export const chain = (first: () => Promise<any>, ...rest: (() => Promise<any>)[]) =>
  () => rest.reduce((p, n) => p.then(n), first())
