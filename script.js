//kell egy változó, amelyben tároljuk a canvas kiválasztását
const canvas = document.querySelector('canvas');
//canvasnek van egy get context nevű konktextusa 
const ctx =  canvas.getContext('2d');

//canvasnek adunk méretet, meg kell egyezni-e a cssben is megadottal, vagy szét fog esni a kép
canvas.width = 600;
canvas.height = 600;

//mivel minden cellákban rajzolunk ki, mindnek 30x30px lesz a mérete
const CELL_SIZE = 30
//a játék mérete  // Math.floor <- lekerekíti a kapott értéket, hogy ne legyenek tört számaink
const WORLD_WIDTH = Math.floor(canvas.width / CELL_SIZE);
const WORLD_HEIGHT = Math.floor(canvas.height / CELL_SIZE);

//megadja milyen gyorsan mozogjon a "kígyónk" 300ms-um gyorsasággal halad
const MOVE_INTERVAL = 300;
//Legyenek kaják a pályán (1500 milisecundumonként lesz egy új kaja)
const FOOD_SPAWN_INTERVAL = 1500

// Ebbe az objektumba helyezzük e, hogy a gomb éppen le van e nyomva vagy nincs
const input = {};
//JÁTÉKCIKLUS

//azért csináljuk ezt az objektumot, hogy ne legyen sok változónk, vele tudunk refaktorálni
const snake={
  moveElapsed: 0,
  //kígyó teste
  lenght: 4,
  //összes részét tárolja a kígyónak
  parts: [{
    x: 0,
    y: 0,
  }],
  //x, y koordináta, hogy merre menjen a kígyó
  dir: null,
  //Új irányzék változó, azért hogy ha gyorsan nyomjuk a gombot akkor se tudjunk helyben megfordulni
  newDir: {
    x: 1,
    y: 0,
  }
}
//Ez a tömb tárolja el az összes ételt
const foods = [
  {
    x: 10,
    y: 0,
  }
];
// Ez a változó azt számolja hogy mennyi idő telt el egy új kajának a létrehozásához
let foodSpawnElapsed = 0;
let gameOver = false;
//Pont számlálás
let score = 0;


//eltelt időt kapjuk meg
function update(delta) {

  //Ha game over akkor nem csinálunk semmit ebben a function-ben és visszatérünk
  if(gameOver) {
    return
  }

  //Leellenőrizzük, hogy le volt e nyomva a gomb vagy nem
  //Ha lefele nyílat megnyomom akkor lefele megy a kígyó
  if (input.ArrowLeft && snake.dir.x !== 1) { // Megvizsgálom hogy nem e megyek éppen jobbra, mert helyben ne tudjon megfordulni a kígyó
    snake.newDir = {x: -1, y: 0};
  }
  else if (input.ArrowUp && snake.dir.y !== 1) {
    snake.newDir = {x: 0, y: -1};
  }
  else if (input.ArrowRight && snake.dir.x !== -1) {
    snake.newDir = {x: 1, y: 0};
  }
  else if (input.ArrowDown && snake.dir.y !== -1) {
    snake.newDir = {x: 1, y: 0};
  }

  snake.moveElapsed += delta;


  if (snake.moveElapsed > MOVE_INTERVAL) {
    // Csak akkor kapja meg az új irányzékot ha már elmozdult a kígyó
    snake.dir = snake.newDir

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

    //Kígyónak a feje
    const head = snake.parts[0];
    //Lekérjük hogy éppen melyik ételt eszi meg a kígyó
    const foodEatenIndex = foods.findIndex(f => f.x === head.x && f.y === head.y); //Megkeressük hogy melyik kajának a koordinátája egyezik a kígyó fejének a koordinátájával
    // Ha van kaja akkor növelünk a kígyó hosszán
    if (foodEatenIndex >= 0) { //Tömbön belül találtunk e egyezőt és ha igen akkor tűnjön el a kaja
      snake.length++;
      score++;
      foods.splice(foodEatenIndex, 1); //Kitöröljük azt az elemet amelyiket megette a kígyó
    }

    // Ellenőrizzük hogy kiment e a kígyó a pályáról
    const worldEdgeIntersect = head.x < 0 || head.x >= WORLD_WIDTH || head.y < 0 || head.y >= WORLD_HEIGHT;
    if (worldEdgeIntersect) {
      gameOver = true;
      return
    }

    //Ha valahol a kígyónak a feje ütközik a testével akkor game over
    const snakePartIntersect = snake.parts.some((part, index) => index !==0 && head.x === part.x && head.y === part.y ); // Ez akkor tér vissza igazzal ha bármelyik tömbnek az elemére igazat adunk vissza
    if (snakePartIntersect) {
      gameOver = true;
      return
    }
  }

  // hozzáadjuk az eltelt másodperceket
  foodSpawnElapsed += delta;
  //Hogy ha ez az idő eltelik akkor létrehoz ey ételt a pélyán
  if(foodSpawnElapsed > FOOD_SPAWN_INTERVAL) {
    foodSpawnElapsed -= FOOD_SPAWN_INTERVAL;
  }
  // Lesz egy x, y koordinátája a kajának hogy el lehessen helyezni a pályán
  // Random helyen helyezkedjen el a kaja
  foods.push({
    x: Math.floor(Math.random() * WORLD_WIDTH), //0 és a pálya szélessége között változzon az érték
    y: Math.floor(Math.random() * WORLD_HEIGHT),
  })
}

//vele rajzoljuk ki, rendereljük ki a jéták jelenlegi állapotát
function render() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  //minden egyes frissítésnél kitörli a "rajzolásunkat"
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //kígyó színe legyen fekete
  ctx.fillStyle = "black";

  snake.parts.forEach(({ x, y}) => {
  // kirajzol 1 négyzeret, ha azt akarjuk, hogy mozogjon adunk egy x változót neki 
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE , CELL_SIZE, CELL_SIZE);
})

  //Kaja színe:
  ctx.fillStyle = "orange";
  //Végigmegyünk az összes kaján és az összeset kirajzoljuk
  foods.forEach(({ x, y}) => {
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE , CELL_SIZE, CELL_SIZE);
  })

  //Pontszám kiírása
    
    ctx.fillStyle = "green";
    ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, CELL_SIZE / 2);

  if (gameOver) {
    //Középre kiíratom hogy game over
    ctx.fillStyle = "red";
    ctx.font = "60px Arial";
    ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 2);
  }
}

let lastLoopTime = Date.now()


//gaming ciklus, folyamatosan fogja magát ismételni, de nem rakjuk végtelen cikulsba mivel a böngészőknek van erre saját functionjük (request animation frame)
function gameLoop(){
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

gameLoop();

//Lekezeljük, hogy milyen gombot nyomunk meg a böngészőben, amikor lenyomjuk és amikor felengedjuk a gombot
window.addEventListener("keydown", (event) => {
  input[event.key] = true;
})
window.addEventListener("keyup", (event) => {
  input[event.key] = false;
})
//Ha lenyomjuk a gombott akkor true ha felengedjük akkor false lesz