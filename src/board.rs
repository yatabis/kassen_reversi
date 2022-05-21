pub struct Board {
    pub data: u64
}

const GUARD_X: u64 = 0x7e7e7e7e7e7e7e7e;
const GUARD_Y: u64 = 0x00ffffffffffff00;
const GUARD_XY: u64 = 0x007e7e7e7e7e7e00;

impl Board {
    pub fn new(data: u64) -> Board {
        Board { data }
    }

    fn line_left(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_X;
        let mut result = mask & position >> 1 as u64;
        result |= mask & (result >> 1);
        result |= mask & (result >> 1);
        result |= mask & (result >> 1);
        result |= mask & (result >> 1);
        result |= mask & (result >> 1);
        if self.data & result >> 1 > 1{
            result
        } else {
            0
        }
    }

    fn line_right(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_X;
        let mut result = mask & position << 1 as u64;
        result |= mask & (result << 1);
        result |= mask & (result << 1);
        result |= mask & (result << 1);
        result |= mask & (result << 1);
        result |= mask & (result << 1);
        if self.data & result << 1 > 1{
            result
        } else {
            0
        }
    }

    fn line_upper(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_Y;
        let mut result = mask & position >> 8 as u64;
        result |= mask & (result >> 8);
        result |= mask & (result >> 8);
        result |= mask & (result >> 8);
        result |= mask & (result >> 8);
        result |= mask & (result >> 8);
        if self.data & result >> 8 > 1{
            result
        } else {
            0
        }
    }

    fn line_lower(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_Y;
        let mut result = mask & position << 8 as u64;
        result |= mask & (result << 8);
        result |= mask & (result << 8);
        result |= mask & (result << 8);
        result |= mask & (result << 8);
        result |= mask & (result << 8);
        if self.data & result << 8 > 1{
            result
        } else {
            0
        }
    }

    fn line_upper_left(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position >> 9 as u64;
        result |= mask & (result >> 9);
        result |= mask & (result >> 9);
        result |= mask & (result >> 9);
        result |= mask & (result >> 9);
        result |= mask & (result >> 9);
        if self.data & result >> 9 > 1{
            result
        } else {
            0
        }
    }

    fn line_upper_right(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position >> 7 as u64;
        result |= mask & (result >> 7);
        result |= mask & (result >> 7);
        result |= mask & (result >> 7);
        result |= mask & (result >> 7);
        result |= mask & (result >> 7);
        if self.data & result >> 7 > 1{
            result
        } else {
            0
        }
    }

    fn line_lower_left(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position << 7 as u64;
        result |= mask & (result << 7);
        result |= mask & (result << 7);
        result |= mask & (result << 7);
        result |= mask & (result << 7);
        result |= mask & (result << 7);
        if self.data & result << 7 > 1{
            result
        } else {
            0
        }
    }

    fn line_lower_right(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position << 9 as u64;
        result |= mask & (result << 9);
        result |= mask & (result << 9);
        result |= mask & (result << 9);
        result |= mask & (result << 9);
        result |= mask & (result << 9);
        if self.data & result << 9 > 1{
            result
        } else {
            0
        }
    }

    fn get_reverse(&self, other: u64, position: u64) -> u64 {
        if (self.data | other ) & position > 0 {
            return 0;
        }
        let mut result = 0;
        result |= self.line_left(other, position);
        result |= self.line_right(other, position);
        result |= self.line_upper(other, position);
        result |= self.line_lower(other, position);
        result |= self.line_upper_left(other, position);
        result |= self.line_upper_right(other, position);
        result |= self.line_lower_left(other, position);
        result |= self.line_lower_right(other, position);
        result
    }

    pub fn put(&mut self, other: &mut Board, position: u64) {
        let reversed = self.get_reverse(other.data, position);
        self.data |= position | reversed;
        other.data ^= reversed;
    }

    pub fn preview(&self) {
        for i in 0..8 {
            for j in 0..8 {
                print!("{}", self.data >> i * 8 + j & 1);
            }
            print!("\n");
        }
    }
}
