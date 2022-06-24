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
pub enum State {
    Black,
    White,
    Draw,
    None,
}

#[derive(Serialize)]
pub struct Game {
    black: Board,
    white: Board,
    black_count: i32,
    white_count: i32,
    state: State,
}

impl Game {
    pub fn new() -> Game {
        Game {
            black: Board::new(0x0000000810000000),
            white: Board::new(0x0000001008000000),
            black_count: 2,
            white_count: 2,
            state: State::None,
        }
    }

    pub fn put(&mut self, turn: &Turn, position: &i32) {
        match turn {
            Turn::Black => self.black.put(&mut self.white, 1 << position),
            Turn::White => self.white.put(&mut self.black, 1 << position),
        }
        self.black_count = self.black.count();
        self.white_count = self.white.count();
        if self.black.get_legal_move(&self.white) == 0 && self.white.get_legal_move(&self.black) == 0 {
            self.state = if self.black_count == self.white_count {
                State::Draw
            } else if self.black_count > self.white_count {
                State::Black
            } else {
                State::White
            }
        }
        println!("black: {}", self.black.get_legal_move(&self.white));
        println!("white: {}", self.white.get_legal_move(&self.black));
    }
}
