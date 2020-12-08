//kell egy változó, amelyben tároljuk a canvas kiválasztását
const canvas = document.querySelector('canvas');
//canvasnek van egy get context nevű konktextusa 
const ctx =  canvas.getContext('2d');

//canvasnek adunk méretet, meg kell egyezni-e a cssben is megadottal, vagy szét fog esni a kép
canvas.width = canvas.height = 600;

//mivel minden cellákban rajzolunk ki, mindnek 30x30px lesz a mérete
const CELL_SIZE = 30
//a játék mérete  // Math.floor <- lekerekíti a kapott értéket, hogy ne legyenek tört számaink
const WORLD_WIDTH = Math.floor(canvas.width / CELL_SIZE);
const WORLD_HEIGHT = Math.floor(canvas.height / CELL_SIZE);

//megadja milyen gyorsan mozogjon a "kígyónk" 300ms-um gyorsasággal halad
const MOVE_INTERVAL = 300;

//JÁTÉKCIKLUS

//azért csináljuk, hogy ne legyen sok változónk, vele tudunk refaktorálni
const snake={
  moveElapsed: 0,
  //kígyó teste
  lenght: 4,
  //összes részét tárolja a kígyónak
  parts: [{
    x: 0,
    y: 0,
  }
  ]
}


//eltelt időt kapjuk meg
function update(delta) {
  snake.moveElapsed += delta;

  if (snake.moveElapsed > MOVE_INTERVAL) {
    snake.moveElapsed -= MOVE_INTERVAL;
    //1 cellányit mozgatjuk, mindig a fejét mozgatjuk és ahova mozgatjuk oda csinál nekünk 1 új partot,majd a farkát mindig kitöröljük
    const newSnakePart = {x: snake.parts[0].x + 1, y: snake.parts[0].y };
    // folyamatosan lesz+1 cellánk a kígyó végén
    snake.parts.unshift(newSnakePart);

    //parts.length a tényleges hossz(hány darabból áll)  snake.lenght a kígyó hossza amikor eszik 
    if (snake.parts.length > snake.lenght) {
      //ha túl sok darabból áll eldobjuk a farka végét
      snake.parts.pop();
    }
  }

}

//vele rajzoljuk ki, rendereljük ki a jéták jelenlegi állapotát
function render() {

  //minden egyes frissítésnél kitörli a "rajzolásunkat"
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.parts.forEach(({ x, y}) => {
  // kirajzol 1 négyzeret, ha azt akarjuk, hogy mozogjon adunk egy x változót neki 
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE , CELL_SIZE, CELL_SIZE);
})
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