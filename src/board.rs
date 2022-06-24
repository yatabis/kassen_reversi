use serde::{Serialize, Serializer};

const GUARD_X: u64 = 0x7e7e7e7e7e7e7e7e;
const GUARD_Y: u64 = 0x00ffffffffffff00;
const GUARD_XY: u64 = 0x007e7e7e7e7e7e00;

pub struct Board(u64);

impl Serialize for Board {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: Serializer {
        serializer.serialize_str(&self.0.to_string())
    }
}

impl Board {
    pub fn new(data: u64) -> Board {
        Board(data)
    }

    pub fn count(&self) -> i32 {
        self.0.count_ones() as i32
    }

    fn line_left(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_X;
        let mut result = mask & position >> 1;
        result |= mask & result >> 1;
        result |= mask & result >> 1;
        result |= mask & result >> 1;
        result |= mask & result >> 1;
        result |= mask & result >> 1;
        result
    }

    fn line_right(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_X;
        let mut result = mask & position << 1;
        result |= mask & result << 1;
        result |= mask & result << 1;
        result |= mask & result << 1;
        result |= mask & result << 1;
        result |= mask & result << 1;
        result
    }

    fn line_upper(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_Y;
        let mut result = mask & position >> 8;
        result |= mask & result >> 8;
        result |= mask & result >> 8;
        result |= mask & result >> 8;
        result |= mask & result >> 8;
        result |= mask & result >> 8;
        result
    }

    fn line_lower(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_Y;
        let mut result = mask & position << 8;
        result |= mask & result << 8;
        result |= mask & result << 8;
        result |= mask & result << 8;
        result |= mask & result << 8;
        result |= mask & result << 8;
        result
    }

    fn line_upper_left(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position >> 9;
        result |= mask & result >> 9;
        result |= mask & result >> 9;
        result |= mask & result >> 9;
        result |= mask & result >> 9;
        result |= mask & result >> 9;
        result
    }

    fn line_upper_right(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position >> 7;
        result |= mask & result >> 7;
        result |= mask & result >> 7;
        result |= mask & result >> 7;
        result |= mask & result >> 7;
        result |= mask & result >> 7;
        result
    }

    fn line_lower_left(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position << 7;
        result |= mask & result << 7;
        result |= mask & result << 7;
        result |= mask & result << 7;
        result |= mask & result << 7;
        result |= mask & result << 7;
        result
    }

    fn line_lower_right(&self, other: u64, position: u64) -> u64 {
        let mask = other & GUARD_XY;
        let mut result = mask & position << 9;
        result |= mask & result << 9;
        result |= mask & result << 9;
        result |= mask & result << 9;
        result |= mask & result << 9;
        result |= mask & result << 9;
        result
    }

    fn get_reverse(&self, other: u64, position: u64) -> u64 {
        if (self.0 | other ) & position > 0 {
            return 0;
        }
        let mut result = 0;
        let line = self.line_left(other, position);
        if self.0 & line >> 1 > 0 { result |= line; }
        let line = self.line_right(other, position);
        if self.0 & line << 1 > 0 { result |= line; }
        let line = self.line_upper(other, position);
        if self.0 & line >> 8 > 0 { result |= line; }
        let line = self.line_lower(other, position);
        if self.0 & line << 8 > 0 { result |= line; }
        let line = self.line_upper_left(other, position);
        if self.0 & line >> 9 > 0 { result |= line; }
        let line = self.line_upper_right(other, position);
        if self.0 & line >> 7 > 0 { result |= line; }
        let line = self.line_lower_left(other, position);
        if self.0 & line << 7 > 0 { result |= line; }
        let line = self.line_lower_right(other, position);
        if self.0 & line << 9 > 0 { result |= line; }
        result
    }

    pub fn put(&mut self, other: &mut Board, position: u64) {
        let reversed = self.get_reverse(other.0, position);
        if reversed == 0 { return; }
        self.0 |= position | reversed;
        other.0 ^= reversed;
    }

    pub fn get_legal_move(&self, other: &Board) -> u64 {
        let mut result = 0;
        result |= self.line_left(other.0, self.0) >> 1;
        result |= self.line_right(other.0, self.0) << 1;
        result |= self.line_upper(other.0, self.0) >> 8;
        result |= self.line_lower(other.0, self.0) << 8;
        result |= self.line_upper_left(other.0, self.0) >> 9;
        result |= self.line_upper_right(other.0, self.0) >> 7;
        result |= self.line_lower_left(other.0, self.0) << 7;
        result |= self.line_lower_right(other.0, self.0) << 9;
        result & !self.0 & !other.0
    }

    pub fn preview(&self) {
        for i in 0..8 {
            for j in 0..8 {
                print!("{}", self.0 >> i * 8 + j & 1);
            }
            print!("\n");
        }
    }
}
