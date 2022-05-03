import type { Fn } from './types'

export type Task = {
  fn?: Fn<any, any>
  self?: any
  args?: any
  promise: Promise<any>
  resolve: Fn<any, any>
}

export const Task = (fn?: Fn<any, any>, self?: any, args?: any): Task => {
  let resolve!: Fn<any, any>
  const promise: Promise<any> = new Promise(r => resolve = r)
  return { promise, resolve, fn, self, args }
}

export const run = (task: Task, res?: any) => (task.resolve(res = task.fn!.apply(task.self, task.args)), res)

export const chain = (tasks: Task[], other: Task) => tasks.forEach(t => other.promise.then(t.resolve))
