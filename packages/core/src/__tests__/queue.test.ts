import { Queue } from '../queue';

describe('Queue', () => {
  test('enqueue / dequeue / size', () => {
    const queue = new Queue<string>();

    expect(queue.size).toBe(0);

    queue.enqueue(3, 'data1');
    queue.enqueue(1, 'data2');
    queue.enqueue(2, 'data3');

    expect(queue.size).toBe(3);

    expect(queue.dequeue()).toBe('data1');
    expect(queue.size).toBe(2);

    expect(queue.dequeue()).toBe('data3');
    expect(queue.size).toBe(1);

    expect(queue.dequeue()).toBe('data2');
    expect(queue.size).toBe(0);

    expect(queue.dequeue()).toBeNull();
    expect(queue.size).toBe(0);
  });
});
