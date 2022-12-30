const width = 600;
const height = 400;

export default class pong {
  player_left: any;
  player_right: any;
  ball: any;
  music: string;
  compuerLevel: number;

  constructor(id_1: string, id_2: string = "IA", difficulty: string = "easy") {
    this.ball = {
      x: width / 2,
      y: height / 2,
      radius: 10,
      speed: 11,
      velocity_X: 5,
      velocity_Y: 5,
    };
    this.player_left = {
      id: id_1,
      x: 20,
      y: (height - 100) / 2,
      width: 10,
      height: 100,
      score: 0,
    };
    this.player_right = {
      id: id_2,
      x: width - 30,
      y: (height - 100) / 2,
      width: 10,
      height: 100,
      score: 0,
    };
    this.music = "";
    if (difficulty === "easy") {
      this.compuerLevel = 0.1;
    }
    if (difficulty === "medium") {
      this.compuerLevel = 0.5;
    } else this.compuerLevel = 0.75;
  }

  reset_ball(): void {
    this.ball.x = width / 2;
    this.ball.y = height / 2;
    this.ball.speed = 11;
    this.ball.velocity_X *= -1;
  }

  collison(player: any): boolean {
    return (
      player.x < this.ball.x + this.ball.radius &&
      player.x + player.width > this.ball.x - this.ball.radius &&
      player.y < this.ball.y + this.ball.radius &&
      player.y + player.height > this.ball.y - this.ball.radius
    );
  }

  update(position_1: number, position_2: number = 0): any {
    this.music = "";
    if (this.ball.x - this.ball.radius < 0) {
      this.player_right.score++;
      this.reset_ball();
      this.music = "right";
    } else if (this.ball.x + this.ball.radius > width) {
      this.player_left.score++;
      this.reset_ball();
      this.music = "left";
    }
    this.ball.x += this.ball.velocity_X;
    this.ball.y += this.ball.velocity_Y;

    //IA
    this.player_left.y = position_1 * height;
    if (this.player_right.id === "IA") {
      this.player_right.y +=
        (this.ball.y - (this.player_right.y + this.player_right.height / 2)) *
        this.compuerLevel;
        // this.player_left.y = this.player_right.y;
    } else {
      this.player_right.y = position_2 * height;
    }
    if (this.ball.y < 20 || this.ball.y > height - 20)
    {
      // console.log('ball velocity Y: ', this.ball.velocity_Y);
      this.ball.y = this.ball.y < 20 ? 22 : height - 22;
    }
    // wall collision
    if (
      this.ball.y < this.ball.radius + 20 || this.ball.y + this.ball.radius + 20 > height
    ) {
      this.ball.velocity_Y *= -1;
      this.music = "wall";
      this.ball.y = this.ball.y < this.ball.radius + 20 ?  this.ball.y-- : this.ball.y++; 
    }
    //player collision
    let player = this.ball.x < width / 2 ? this.player_left : this.player_right;
    if (this.collison(player)) {
      this.music = "hit";
      let collide_point = this.ball.y - (player.y + player.height / 2);
      collide_point = collide_point / (player.height / 2);
      let angle_rad = (Math.PI / 4) * collide_point;
      let direction = this.ball.x + this.ball.radius < width / 2 ? 1 : -1;
      this.ball.velocity_X = direction * this.ball.speed * Math.cos(angle_rad);
      this.ball.velocity_Y = this.ball.speed * Math.sin(angle_rad);
      this.ball.speed += 0.6;
    }
    return this.onUpdate();
  }

  onUpdate(): any {
    return {
      playerLeft: {
        name: this.player_left.id,
        position: this.player_left.y / height,
        score: this.player_left.score,
      },
      playerRight: {
        name: this.player_right.id,
        position: this.player_right.y / height,
        score: this.player_right.score,
      },
      ball: {
        x: this.ball.x / width,
        y: this.ball.y / height,
      },
      isPlaying: this.player_left.score < 5 && this.player_right.score < 5,
      musicIndice: this.music,
      userRool: "",
    };
  }
}
