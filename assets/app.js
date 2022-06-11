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

const panel = {
  template: `<div class="panel">
  <div class="panel-item" :class="{ 'panel-active': turn === ${STONE.BLACK} }" @click="onClick(${STONE.BLACK})"><div class="panel-stone panel-black"></div></div>
  <div class="panel-info"><span>{{ count.black }}</span><span>-</span><span>{{ count.white }}</span></div>
  <div class="panel-item" :class="{ 'panel-active': turn === ${STONE.WHITE} }" @click="onClick(${STONE.WHITE})"><div class="panel-stone panel-white"></div></div>
</div>`,
  props: ['turn', 'count'],
  emits: ['changeTurn'],
  methods: {
    onClick(turn) {
      this.$emit('changeTurn', turn);
    }
  }
};

const app = {
  components: {
    'cell': cell,
    'panel': panel,
  },
  data() {
    return {
      board: [...Array(8)].map(() => Array(8).fill(0)),
      turn: STONE.BLACK,
      count: {
        black: 0,
        white: 0,
      },
      socket: undefined,
    }
  },
  mounted() {
    const socket = new WebSocket('ws://localhost:3000/ws');
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
          }
        }
      }
    },
    put(id) {
      this.socket.send(`${this.turn}: ${id}`);
    },
    changeTurn(turn) {
      this.turn = turn;
    },
    receive(msg) {
      const { black, white, black_count, white_count } = JSON.parse(msg);
      this.update(BigInt(black), BigInt(white));
      this.count.black = black_count;
      this.count.white = white_count;
    }
  }
};

Vue.createApp(app).mount('#app');
