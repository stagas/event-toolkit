import type { Fn } from 'everyday-types'

export type Task = {
  fn?: Fn<any, any>
  self?: any
  args?: any
  promise: Promise<any>
  resolve: Fn<any, any>
  reject: Fn<any, any>
}

function taskDeferred(this: Task, resolve: Fn<any, any>, reject: Fn<any, any>) {
  this.resolve = resolve
  this.reject = reject
}

export function Task(fn?: Fn<any, any>, self?: any, args?: any): Task {
  const task = { fn, self, args } as Task
  task.promise = new Promise(taskDeferred.bind(task))
  return task
}

export function taskRun(task: Task, res?: any) {
  return (task.resolve(res = task.fn!.apply(task.self, task.args)), res)
}

function taskNext(other: any, t: any) {
  return other.promise.then(t.resolve)
}
export function taskGroup(other: Task, tasks: Task[]) {
  return tasks.forEach(taskNext.bind(null, other))
}
