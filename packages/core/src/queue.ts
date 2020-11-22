/**
 * Priority Queue (using pairing heap algorithm)
 */
type QueueNode<T> = {
  priority: number;
  data: T;
  next: QueueNode<T> | null;
  head: QueueNode<T> | null;
};

const merge = <T>(i: QueueNode<T> | null, j: QueueNode<T> | null) => {
  if (i == null) {
    return j;
  }

  if (j == null) {
    return i;
  }

  let tmp: QueueNode<T> | null = null;

  if (i.priority < j.priority) {
    tmp = i;
    i = j;
    j = tmp;
  }

  j.next = i.head;
  i.head = j;

  return i;
};

const mergeList = <T>(s: QueueNode<T> | null) => {
  let n: QueueNode<T> | null = null;
  let a: QueueNode<T> | null = null;
  let b: QueueNode<T> | null = null;
  let j: QueueNode<T> | null = null;

  while (s != null) {
    a = s;
    b = null;
    s = s.next;
    a.next = null;

    if (s != null) {
      b = s;
      s = s.next;
      b.next = null;
    }

    a = merge(a, b);
    a!.next = n;
    n = a;
  }

  while (n != null) {
    j = n;
    n = n.next;
    s = merge(j, s);
  }

  return s;
};

export class Queue<T> {
  private _root: QueueNode<T> | null = null;
  private _size = 0;

  public enqueue(priority: number, data: T): void {
    this._root = merge(this._root, {
      priority,
      data,
      next: null,
      head: null,
    });

    this._size += 1;
  }

  public dequeue(): T | null {
    if (this._root == null) {
      return null;
    }

    const result = this._root.data;

    this._root = mergeList(this._root.head);
    this._size -= 1;

    return result;
  }

  public clear(): void {
    this._root = null;
    this._size = 0;
  }

  public get size(): number {
    return this._size;
  }
}
