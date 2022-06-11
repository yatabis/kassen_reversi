const COOL_TIME = 1000;
const COOLING_INTERVAL = 10;

const STONE = {
  NONE: 0,
  BLACK: 1,
  WHITE: 2,
};

const cell = {
  template: '<div class="cell"><div class="stone" :style="{ backgroundColor }" @click="onClick"></div></div>',
  props: ['id', 'stone'],
  emits: ['put'],
  computed: {
    backgroundColor() {
      return ['green', 'black', 'white'][this.stone];
    }
  },
  methods: {
    onClick() {
      this.$emit('put', this.id);
    }
  }
};

const coolTimeIndicator = {
  template: '<div class="panel-disabled" :style="background"></div>',
  props: ['coolTime'],
  computed: {
    background() {
      const degree = (1 - this.coolTime / COOL_TIME) * 100;
      const background = degree === 100 ? 'transparent' : `radial-gradient(circle, transparent 4vh, rgba(0, 128, 0) 4vh), conic-gradient(transparent 0% ${degree}%, rgb(0, 128, 0) ${degree}% 100%)`;
      return {
        background
      };
    }
  }
}

const panel = {
  template: `<div class="panel">
  <div class="panel-item" :class="{ 'panel-active': turn === ${STONE.BLACK} }" @click="onClick(${STONE.BLACK})"><coolTimeIndicator :coolTime="cooling.black"></coolTimeIndicator><div class="panel-stone panel-black"></div></div>
  <div class="panel-info"><span>{{ count.black }}</span><span>-</span><span>{{ count.white }}</span></div>
  <div class="panel-item" :class="{ 'panel-active': turn === ${STONE.WHITE} }" @click="onClick(${STONE.WHITE})"><coolTimeIndicator :coolTime="cooling.white"></coolTimeIndicator><div class="panel-stone panel-white"></div></div>
</div>`,
  components: {
    coolTimeIndicator,
  },
  props: ['turn', 'count', 'cooling'],
  emits: ['changeTurn'],
  methods: {
    onClick(turn) {
      this.$emit('changeTurn', turn);
    }
  }
};

const gameInfo = {
  template: '<div class="game-info"><div class="game-info-text">{{ message }}</div><div class="game-info-button" @click="onClick">はじめから</div></div>',
  props: ['winner'],
  emits: ['retry'],
  computed: {
    message() {
      return `${{ Black: '黒', White: '白' }[this.winner]}の勝ち！`;
    }
  },
  methods: {
    onClick() {
      this.$emit('retry');
    }
  }
}

const app = {
  components: {
    cell,
    panel,
    gameInfo,
  },
  data() {
    return {
      board: [...Array(8)].map(() => Array(8).fill(0)),
      turn: STONE.BLACK,
      count: {
        black: 0,
        white: 0,
      },
      cooling: {
        black: 0,
        white: 0,
      },
      winner: undefined,
      socket: undefined,
    }
  },
  mounted() {
    const domain = document.domain;
    console.log(domain);
    const socket = new WebSocket(`ws://${domain}:3000/ws`);
    socket.onopen = () => {
      console.log('connection opened');
    }
    socket.onmessage = (e) => {
      this.receive(e.data);
    }
    socket.onclose = () => {
      console.log('connection closed');
    }
    socket.onerror = (e) => {
      console.log('error occured', e);
    }
    this.socket = socket;
  },
  methods: {
    update(black, white) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const k = BigInt(i * 8 + j);
          if (black >> k & 1n) {
            this.board[i][j] = STONE.BLACK;
          } else if (white >> k & 1n) {
            this.board[i][j] = STONE.WHITE;
          } else {
            this.board[i][j] = STONE.NONE;
          }
        }
      }
    },
    put(id) {
      if (this.winner) {
        return;
      }
      if (this.turn === STONE.BLACK && this.cooling.black > 0) {
        return;
      }
      if (this.turn === STONE.WHITE && this.cooling.white > 0) {
        return;
      }
      this.socket.send(JSON.stringify({
        type: 'Put',
        turn: ['', 'Black', 'White'][this.turn],
        position: id,
      }));
      switch (this.turn) {
        case STONE.BLACK: 
          this.cooling.black = COOL_TIME;
          break;
        case STONE.WHITE:
          this.cooling.white = COOL_TIME;
          break;
      }
      setTimeout(this.cool, COOLING_INTERVAL, this.turn);
    },
    cool(turn) {
      switch (turn) {
        case STONE.BLACK:
          this.cooling.black -= COOLING_INTERVAL;
          if (this.cooling.black > 0) {
            setTimeout(this.cool, COOLING_INTERVAL, STONE.BLACK);
          }
          break;
        case STONE.WHITE:
          this.cooling.white -= COOLING_INTERVAL;
          if (this.cooling.white > 0) {
            setTimeout(this.cool, COOLING_INTERVAL, STONE.WHITE);
          }
          break;
      }
    },
    changeTurn(turn) {
      this.turn = turn;
    },
    retry() {
      this.socket.send(JSON.stringify({ type: 'Retry' }));
    },
    receive(msg) {
      const { black, white, black_count, white_count, winner } = JSON.parse(msg);
      this.update(BigInt(black), BigInt(white));
      this.count.black = black_count;
      this.count.white = white_count;
      this.winner = winner;
      if (winner) {
        this.cooling = {
          black: 0,
          white: 0,
        };
      }
    }
  }
};

Vue.createApp(app).mount('#app');
