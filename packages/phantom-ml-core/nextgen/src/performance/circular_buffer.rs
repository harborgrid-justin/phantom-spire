/// Fixed-size circular buffer for performance metrics
/// Prevents memory leaks by maintaining constant memory footprint
#[derive(Debug, Clone)]
pub struct CircularBuffer<T> {
    buffer: Vec<T>,
    capacity: usize,
    head: usize,
    size: usize,
}

impl<T> CircularBuffer<T>
where
    T: Copy + Default + std::cmp::Ord + std::iter::Sum + std::ops::Div<Output = T> + From<usize>,
{
    pub fn new(capacity: usize) -> Self {
        Self {
            buffer: vec![T::default(); capacity],
            capacity,
            head: 0,
            size: 0,
        }
    }

    pub fn push(&mut self, value: T) {
        self.buffer[self.head] = value;
        self.head = (self.head + 1) % self.capacity;
        if self.size < self.capacity {
            self.size += 1;
        }
    }

    pub fn stats(&self) -> (T, T, T) {
        if self.size == 0 {
            return (T::default(), T::default(), T::default());
        }

        let data = if self.size < self.capacity {
            &self.buffer[0..self.size]
        } else {
            &self.buffer
        };

        let sum = data.iter().copied().sum::<T>();
        let avg = sum / T::from(self.size);
        let min = *data.iter().min().unwrap();
        let max = *data.iter().max().unwrap();

        (avg, min, max)
    }

    pub fn len(&self) -> usize {
        self.size
    }

    pub fn is_empty(&self) -> bool {
        self.size == 0
    }
}