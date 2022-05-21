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

const board = {
  components: {
    'cell': cell,
  },
  data() {
    return {
      board: [...Array(8)].map(() => Array(8).fill(0)),
      turn: STONE.BLACK,
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
    receive(msg) {
      console.log(msg);
      const [black, white] = msg.split(' ').map(text => BigInt(text));
      this.update(black, white);
    }
  }
};
// 日本語を書くテスト

Vue.createApp(board).mount('#board');
