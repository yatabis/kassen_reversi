use serde::{Serialize, Deserialize};

use crate::board::Board;

#[derive(Debug, Serialize, Deserialize)]
pub enum Turn {
    Black,
    White,
}

impl Turn {
    pub fn parse(turn: &str) -> Option<Turn> {
        if turn == "1" { return Some(Turn::Black) }
        if turn == "2" { return Some(Turn::White) }
        None
    }
}

#[derive(Serialize)]
pub struct Game {
    black: Board,
    white: Board,
    black_count: i32,
    white_count: i32,
    winner: Option<Turn>,
}

impl Game {
    pub fn new() -> Game {
        Game {
            black: Board::new(0x0000000810000000),
            white: Board::new(0x0000001008000000),
            black_count: 2,
            white_count: 2,
            winner: None,
        }
    }

    pub fn put(&mut self, turn: &Turn, position: &i32) {
        match turn {
            Turn::Black => self.black.put(&mut self.white, 1 << position),
            Turn::White => self.white.put(&mut self.black, 1 << position),
        }
        self.black_count = self.black.count();
        self.white_count = self.white.count();
        if self.black_count == 0 { self.winner = Some(Turn::White); }
        if self.white_count == 0 { self.winner = Some(Turn::Black); }
    }
}
