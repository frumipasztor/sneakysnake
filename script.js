//kell egy változó, amelyben tároljuk a canvas kiválasztását
const canvas = document.querySelector("canvas");
//canvasnek van egy get context nevű konktextusa
const ctx = canvas.getContext("2d");

//canvasnek adunk méretet, meg kell egyezni-e a cssben is megadottal, vagy szét fog esni a kép
canvas.width = canvas.height = 600;

//mivel minden cellákban rajzolunk ki, mindnek 30x30px lesz a mérete
const CELL_SIZE = 30;
//a játék mérete  // Math.floor <- lekerekíti a kapott értéket, hogy ne legyenek tört számaink
const WORLD_WIDTH = Math.floor(canvas.width / CELL_SIZE);
const WORLD_HEIGHT = Math.floor(canvas.height / CELL_SIZE);

//megadja milyen gyorsan mozogjon a "kígyónk" 300ms-um gyorsasággal halad
const MOVE_INTERVAL = 300;
const FOOD_SPAWN_INTERVAL = 1500;

//JÁTÉKCIKLUS
let input;
let snake;
let foods;
let foodSpawnElapsed;
let score;
let gameOver;


function reset() {
  input = {};

  //azért csináljuk, hogy ne legyen sok változónk, vele tudunk refaktorálni
  snake = {
    moveElapsed: 0,
    //kígyó teste
    lenght: 4,
    //összes részét tárolja a kígyónak
    parts: [
      {
        x: 0,
        y: 0,
      },
    ],
    //diretionok megadása
    dir: null,
  
    //új irányzék
    newDir: {
      x: 1,
      y: 0,
    },
  };
  
  foods = [
    {
      x: 10,
      y: 0,
    },
  ];
  foodSpawnElapsed = 0;
  score = 0;
  gameOver = false;
  
}

//eltelt időt kapjuk meg
function update(delta) {
  //ha game over leáll a script
  if (gameOver) {
    //leellenőrizzük, hogy le van-e nyomva a space
    if (input[' ']){
      reset();
    }
    return;
  }
  //ha lenyomtuk a nyilakat akkor arra menjen, ezért else if mert egyszerre csak 1 gombnyomásra akarjuk h reagáljon
  // && snake.dir  ellenőrizzük h nem e megyünk épp ellenétes irányba, ha igen akkor nem engedi használni
  if (input.ArrowLeft && snake.dir.x !== 1) {
    snake.newDir = { x: -1, y: 0 };
  } else if (input.ArrowUp && snake.dir.y !== 1) {
    snake.newDir = { x: 0, y: -1 };
  } else if (input.ArrowRight && snake.dir.x !== -1) {
    snake.newDir = { x: 1, y: 0 };
  } else if (input.ArrowDown && snake.dir.y !== -1) {
    snake.newDir = { x: 0, y: 1 };
  }

  snake.moveElapsed += delta;

  if (snake.moveElapsed > MOVE_INTERVAL) {
    snake.dir = snake.newDir;
    snake.moveElapsed -= MOVE_INTERVAL;
    //1 cellányit mozgatjuk, mindig a fejét mozgatjuk és ahova mozgatjuk oda csinál nekünk 1 új partot,majd a farkát mindig kitöröljük
    const newSnakePart = {
      x: snake.parts[0].x + snake.dir.x,
      y: snake.parts[0].y + snake.dir.y,
    };
    // folyamatosan lesz+1 cellánk a kígyó végén
    snake.parts.unshift(newSnakePart);

    //parts.length a tényleges hossz(hány darabból áll)  snake.lenght a kígyó hossza amikor eszik
    if (snake.parts.length > snake.lenght) {
      //ha túl sok darabból áll eldobjuk a farka végét
      snake.parts.pop();
    }

    //kígyónk feje
    const head = snake.parts[0];
    //megkeresi melyik az a kaja, amelyik pontosan ott helyezkedik el ahol a fejünk van, azért kell az index, hogy tudjuk melyik foodot etettük meg a kicsi kígyónkkal
    const foodEatenIndex = foods.findIndex(
      (f) => f.x === head.x && f.y === head.y
    );

    //ha belemegyünk akkor növekedik a kígyónk 1 egységgel
    if (foodEatenIndex >= 0) {
      snake.lenght++;
      score++;
      foods.splice(foodEatenIndex, 1);
    }

    // kiment-e a kígyó a pályáról? ||-vagy jele
    const worldEdgeIntersect =
      head.x < 0 ||
      head.x >= WORLD_WIDTH ||
      head.y < 0 ||
      head.y >= WORLD_HEIGHT;

    if (worldEdgeIntersect) {
      gameOver = true;
      return;
    }
    //leellenőrzi, hogy a fejünk koordinátája véletlenül nem-e érinti a testünket
    //azért kell a part után az index, hogy ne álljon le a játék egyből, mivel nem 1 kockával indít a kígyónk, ezért indexelni kell
    const snakePartIntersect = snake.parts.some(
      (part, index) => index !== 0 && head.x === part.x && head.y === part.y
    );
    if (snakePartIntersect) {
      gameOver = true;
      return;
    }
  }

  foodSpawnElapsed += delta;
  if (foodSpawnElapsed > FOOD_SPAWN_INTERVAL) {
    foodSpawnElapsed -= FOOD_SPAWN_INTERVAL;
    //új értéket adunk a tömbünkhöz
    foods.push({
      //random generálja a kajáink helyét a math.floor kerekíti a számot egészre a math.random pedig random számot generál
      x: Math.floor(Math.random() * WORLD_WIDTH),
      y: Math.floor(Math.random() * WORLD_HEIGHT),
    });
  }
}

//vele rajzoljuk ki, rendereljük ki a jéták jelenlegi állapotát
function render() {
  //szövegek igazítása
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  //minden egyes frissítésnél kitörli a "rajzolásunkat"
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // KAJA KIRENDERELÉSE
   //végigmegyünk az összes ételen és az összeset kirajzoljuk
   ctx.fillStyle = "orange";
   foods.forEach(({ x, y }) => {
     ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
   });

   //KÍGYÓ KIRENDERELÉSE
  ctx.fillStyle = "black";
  snake.parts.forEach(({ x, y }, index) => {

    //KÍGYÓ FEJE MÁS SZÍNŰ
    if (index === 0) {
      ctx.fillStyle = 'black';
    }  else {
      ctx.fillStyle = 'gray';
    }
    // kirajzol 1 négyzeret, ha azt akarjuk, hogy mozogjon adunk egy x változót neki
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  });
 

  //score kiíratása , azért tesszük a kígyó és a kaja alá, hogy amikor kirenderelődik, akkor térben előbbre legyen hozzájuk képest
  ctx.fillStyle = "green";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, CELL_SIZE / 2);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Press SPACE to restart", canvas.width / 2, canvas.height / 2 + 40);
  }
}

let lastLoopTime = Date.now();

//gaming ciklus, folyamatosan fogja magát ismételni, de nem rakjuk végtelen cikulsba mivel a böngészőknek van erre saját functionjük (request animation frame)
function gameLoop() {
  // azért szükséges, hogy ha nem tud 60fpsel futni a medagott felületen, akkor is ugyan olyan gyorsan fut a játékban a kígyónk
  const now = Date.now();
  //1000-ed mp pontossággal megkapjuk mennyi idő telt ez az előző képkocka és a mostani képkocka között
  const delta = now - lastLoopTime;
  lastLoopTime = now;

  update(delta);
  render();

  //csak akkor fut amikot éppen meg van nyitva az adott lap a böngészőben 60 FPS-el dolgozik
  window.requestAnimationFrame(gameLoop);
}

reset();
gameLoop();

window.addEventListener("keydown", (event) => {
  //event.key megadja milyen gomb lett lenyomva
  input[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  input[event.key] = false;
});
