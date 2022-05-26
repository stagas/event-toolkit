import type { Fn } from 'everyday-types'

export type Task = {
  fn?: Fn<any, any>
  self?: any
  args?: any
  promise: Promise<any>
  resolve: Fn<any, any>
  reject: Fn<any, any>
}

export const Task = (fn?: Fn<any, any>, self?: any, args?: any): Task => {
  let resolve!: Fn<any, any>
  let reject!: Fn<any, any>
  const promise: Promise<any> = new Promise((rs, rj) => {
    resolve = rs
    reject = rj
  })
  return { promise, resolve, reject, fn, self, args }
}

export const runTask = (task: Task, res?: any) => (task.resolve(res = task.fn!.apply(task.self, task.args)), res)

export const groupTasks = (other: Task, tasks: Task[]) => tasks.forEach(t => other.promise.then(t.resolve))
