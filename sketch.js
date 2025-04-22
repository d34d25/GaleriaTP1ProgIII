
/*
DISCLAIMER: A mí me gusta escribir el codigo en ingles ya que en lo personal
se ve mejor al no resaltar las palabras clave del lenguaje con el nombre de mis variables
y funciones
*/


//clases

class Rectangle
{
  constructor(x,y,width,height)
  {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class MyAnimation 
{
  constructor(spriteSheetPath, spriteWidth, spriteHeigth) 
  {
    this.spriteWidth = spriteWidth;
    this.spriteHeigth = spriteHeigth;
    this.sprites = [];
    
    this.index = 0;
    this.stepsPerSecond = 5;
    this.framesPerStep = int(60 / this.stepsPerSecond);
    this.frameCounter = 0;

    this.startFrame = 0;
    this.endFrame = 0;


    this.cols = 0;
    this.rows = 0;

    

    loadImage(spriteSheetPath, (img) => {
      this.spriteSheet = img;
      this.cols = Math.floor(img.width / this.spriteWidth);
      this.rows = Math.floor(img.height / this.spriteHeigth);
      this.cropImage();
    });
  }

  cropImage() 
  {
    for (let i = 0; i < this.rows; i++) 
    {
      for (let j = 0; j < this.cols; j++) 
      {
        let x = j * this.spriteWidth;
        let y = i * this.spriteHeigth;

        let croppedImage = this.spriteSheet.get(x, y, this.spriteWidth, this.spriteHeigth);

        croppedImage.resize(24*2,32*2);
        
        this.sprites.push(croppedImage);
      }
    }

    this.lastFrame = this.sprites.length;
  }

  setAnimationRange(start, end) 
  {
    this.startFrame = start;
    this.endFrame = end;
    this.index = start;
  }

}

class Picture
{
  constructor(x,y,width,height,imagePathSmall, imagePathBig,text)
  {
    this.pictRect = new Rectangle (x,y,width,height);
    this.imageSmall = imagePathSmall; // how it looks in the world
    this.imageBig = imagePathBig; // how it looks in the pop up
    this.text = text; // only shown in the pop up
    this.id;
  }

  debugDraw()
  {
    stroke(255, 0, 0);
    noFill();
    rect(this.pictRect.x, this.pictRect.y, this.pictRect.width, this.pictRect.height);
  }

  triggerText()
  {
    console.log("picture" + this.pictureCounter);
  }

}


class Player
{
    constructor(xPos, yPos, eWidth, eHeight, spriteSheetPath, spriteWidth, spriteHeigth, footstep, popupSound, popupOutSound)
    {
        this.x = xPos;
        this.y = yPos;
        this.width = eWidth;
        this.height = eHeight;
        this.velocityX = 0;
        this.velocityY = 0;
        this.currentAnimState;


        this.displayPopup = false;
        this.wasZPressed = false;
        this.activePicture = null;

        this.footstep = footstep;
        this.footstep.setVolume(0.6);

        this.popupSound = popupSound;
        this.popupOutSound = popupOutSound;

        this.sprite = new MyAnimation(spriteSheetPath, spriteWidth, spriteHeigth);
       
    }

    
    move()
    {

      if(this.displayPopup)
      {
        return;
      }

      let speed = 0.25;

      if (keyIsDown(87)) // W
      { 
        this.velocityY = -speed;
      }
      else if (keyIsDown(83)) // S
      {
        this.velocityY = speed;
      }
      else
      {
        this.velocityY = 0;
      }
      


      if (keyIsDown(65)) // A
      { 
        this.velocityX = -speed;
      }
      else if (keyIsDown(68)) // D 
      {
        this.velocityX = speed;
      }
      else
      {
        this.velocityX = 0;
      }
      
    }

    update()
    {
      this.x += this.velocityX * deltaTime;
      this.y += this.velocityY * deltaTime;
      this.playAnim();
    }


    playAnim()
    {
      
      if(this.velocityX != 0 || this.velocityY !=0)
      {

        let newState;
        if (this.velocityX < 0) {
          newState = "LEFT";
        } else if (this.velocityX > 0) {
          newState = "RIGHT";
        } else if (this.velocityY < 0) {
          newState = "UP";
        } else if (this.velocityY > 0) {
          newState = "DOWN";
        }
    
        if (newState !== this.currentAnimState) 
        {
          this.currentAnimState = newState;

          switch (newState) 
          {
            case "UP":
              this.sprite.setAnimationRange(0, 2);
              break;
            case "DOWN":
              this.sprite.setAnimationRange(6, 8);
              break;
            case "LEFT":
              this.sprite.setAnimationRange(9, 11);
              break;
            case "RIGHT":
              this.sprite.setAnimationRange(3, 5);
              break;
          }
        }

        this.sprite.frameCounter++;
        if (this.sprite.frameCounter >= this.sprite.framesPerStep) 
        {
          this.sprite.index++;
          
          if(this.sprite.index > this.sprite.endFrame)
          {
            this.sprite.index = this.sprite.startFrame;
            
          }
          if (!this.footstep.isPlaying())
          {
            this.footstep.play();
          }
          
          this.sprite.frameCounter = 0;
        }
      }
    }

    
    checkCollisionsX(player, obstacle, dt)
    {
      return(player.x + player.velocityX * dt + player.width > obstacle.x &&
        player.x + player.velocityX * dt < obstacle.x + obstacle.width &&
        player.y + player.height > obstacle.y &&
        player.y < obstacle.y + obstacle.height);
    }

    checkCollisionsY(player, obstacle, dt)
    {
      return(player.x + player.width > obstacle.x &&
        player.x < obstacle.x + obstacle.width &&
        player.y + player.velocityY * dt + player.height > obstacle.y &&
        player.y + player.velocityY * dt < obstacle.y + obstacle.height);
    }

    resolveCollisions(obstacle, dt)
    {
        
      if(this.checkCollisionsX(this, obstacle, dt))
      {
          
        this.velocityX = 0;
        if(this.x  < obstacle.x)
        {
          this.x = obstacle.x - this.width;
        }
        else if (this.x > obstacle.x)
        {
          this.x = obstacle.x + obstacle.width;
        }

      }

      if(this.checkCollisionsY(this, obstacle, dt))
      {
        this.velocityY = 0;

        if (this.y + this.height < obstacle.y)
        {
          this.y = obstacle.y - this.height;
        }
        else if (this.y > obstacle.y + obstacle.height )
        {
          this.y = obstacle.y + obstacle.height;
        }
      }
    }

    showPicture(picture) 
    {
      const isColliding = this.checkCollisionsX(this, picture.pictRect, deltaTime) || this.checkCollisionsY(this, picture.pictRect, deltaTime);

      if (isColliding) 
      {
        if ((keyIsDown(90) || keyIsDown(122)) && !this.wasZPressed && this.currentAnimState == 'UP') 
        {
          

          this.displayPopup = !this.displayPopup;
          this.activePicture = picture;             
          this.wasZPressed = true;

          if (this.displayPopup && !this.popupSound.isPlaying()) 
          {
            this.popupSound.play();
          }

          if (!this.displayPopup && !this.popupOutSound.isPlaying()) 
            {
              this.popupOutSound.play();
            }

        } 
        else if (!keyIsDown(90) && !keyIsDown(122)) 
        {
         
          this.wasZPressed = false;
        }
      }

      if (this.displayPopup && this.activePicture === picture ) 
      {
        

        let camX = floor(this.x + this.width / 2 - width / 2);
        let camY = floor(this.y + this.height / 2 - height / 2);

        fill(0, 0, 0, 150);
        rect(camX, camY, width, height);


        let centerX = this.x + this.width / 2;
        let centerY = this.y + this.height / 2;
        let imgWidth = 200;
        let imgHeight = 200;
        
        image(picture.imageBig, centerX - imgWidth / 2, centerY - imgHeight / 2, imgWidth, imgHeight);
        


        fill(255);


        //textAlign(CENTER);
        //textSize(16);
        //text(picture.text, width / 2, height / 2 + 120); // optional text
      }
    }


    

    debugDraw()
    {
      stroke(255, 0, 0);
      noFill();
      rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      stroke(0, 255, 0);
      rect(this.x, this.y, this.width, this.height);
    }

    draw()
    {
      let xOffset = -14;
      let yOffset = -44;
      image(this.sprite.sprites[this.sprite.index], this.x + xOffset, this.y + yOffset);

    }
}


class World
{
  constructor(worldPath, tileSize, wallImage, floorImage, floorShadowImage, ceilImage, picturesPathSmall, picturesPathBig)
  {
    this.worldPath = worldPath;

    this.worldImage = worldPath;
    this.wallImage = wallImage;
    this.floorImage = floorImage;
    this.floorShadowImage = floorShadowImage;

    this.tileSize = tileSize;
    this.ceilImage = ceilImage;

    this.map = [];

    this.picturesPathSmall = picturesPathSmall; //image only
    this.picturesPathBig = picturesPathBig; //image only
    this.pictures = []; //object
    this.pictureIndex = 0;

    this.rows = 0;
    this.cols = 0;

    this.loadWorld();
  }


  loadWorld()
  {
    this.cols = this.worldImage.width
    this.rows = this.worldImage.height;
    let imageIndex = 0;

    if(!this.worldImage)
    {
      console.log("Error al cargar la imagen del mundo");
      return;
    }

    this.worldImage.loadPixels();

    for(let i = 0; i < this.rows; i++)
    {
      this.map[i] = [];
      for(let j = 0; j < this.cols; j++)
      {


        let index = 4 * (j + i * this.cols);
        let r = this.worldImage.pixels[index];
        let g = this.worldImage.pixels[index + 1];
        let b = this.worldImage.pixels[index + 2];
        let a = this.worldImage.pixels[index + 3];
        console.log(`(${r}, ${g}, ${b}) at (${j}, ${i})`);

        if (a === 0) {
          this.map[i][j] = -1;
          continue;
        }

        if (r === 100 && g === 100 && b === 100)
        {
          this.map[i][j] = 1; // wall
        }
        else if (r === 0 && g === 0 && b === 0)
        {
          this.map[i][j] = 2; //Ceiling
        }
        else if (r === 255 && g === 0 && b === 0)
        {
          this.map[i][j] = 3;
        }
        else if (r === 255 && g === 0 && b === 255) 
        {
          this.map[i][j] = 4;
          
          this.pictures.push(new Picture(j * this.tileSize, i * this.tileSize, this.tileSize * 1.5, this.tileSize * 5, this.picturesPathSmall[imageIndex],this.picturesPathBig[imageIndex]));
          this.pictures[this.pictureIndex].id = this.pictureIndex;
          this.pictureIndex++;

          imageIndex = (imageIndex + 1) % this.picturesPathSmall.length;


        }
        else if (r === 255 && g === 255 && b === 255) 
        {
          this.map[i][j] = 0; // floor
        }

      }
    }

    console.log("Loaded pictures:", this.pictures.length);
    for (let p of this.pictures) {
      console.log(p, p.imageSmall);
    }


  }

  drawWorld(camX, camY) 
  {
    //only draw tiles that are visible
    let minCol = max(0, floor(camX / this.tileSize));
    let maxCol = min(this.cols, ceil((camX + width) / this.tileSize));

    let minRow = max(0, floor(camY / this.tileSize));
    let maxRow = min(this.rows, ceil((camY + height) / this.tileSize));

    for (let i = minRow; i < maxRow; i++) 
    {
      for (let j = minCol; j < maxCol; j++) 
      {

        let x = j * this.tileSize;
        let y = i * this.tileSize;

        switch(this.map[i][j])
        {
          case 0:
            image(this.floorImage, x, y, this.tileSize, this.tileSize);
            break;
          case 1:
            image(this.wallImage, x, y, this.tileSize, this.tileSize);
            break;
          case 2:
            image(this.ceilImage,x,y,this.tileSize, this.tileSize);
            break;
          case 3:
            image(this.floorShadowImage, x, y, this.tileSize, this.tileSize);
            break;
          case 4:
            image(this.wallImage, x, y, this.tileSize, this.tileSize);
            break;
          default:
        }
        
      }
    }


    for (let pic of this.pictures) 
    {
      let shownWidth = this.tileSize *2;
      let showHeight = this.tileSize *2;
      image(pic.imageSmall, pic.pictRect.x - 5, pic.pictRect.y, shownWidth, showHeight);
      //pic.debugDraw();
    }

  }
  

}



//"main"

let gPicturesSmall = [];
let gPicturesBig = [];

function preload() 
{
  footstep = loadSound("assets/sounds/footstep.wav");
  popup = loadSound("assets/sounds/popup.wav");
  popupOut = loadSound("assets/sounds/popupOut.wav");
  backgroundMusic = loadSound("assets/sounds/background.wav");

  worldImage = loadImage("assets/images/map.png");
  wallImage = loadImage("assets/images/wall.png");
  floorImage = loadImage("assets/images/floor.png");
  shadowFloorImage = loadImage("assets/images/floorShadow.png");
  cillingImage = loadImage("assets/images/ceilling.png");

  

  let pictureNamesSmall = ["sPictureA.png", "sPictureB.png", "sPictureC.png"];
  for (let name of pictureNamesSmall) 
  {
    gPicturesSmall.push(loadImage(`assets/images/${name}`));
  }

  let pictureNamesBig = ["bPictureA.jpg", "sPictureB.png", "sPictureC.png"];
  for (let name of pictureNamesBig) 
  {
    gPicturesBig.push(loadImage(`assets/images/${name}`));
  }

}

function setup() 
{
  noSmooth();
  noStroke();
  pixelDensity(1);
  colorMode(RGB);
  zoom = 1;
  

  let canvas = createCanvas(windowWidth, windowHeight * 0.855);
  canvas.parent("canvas-container");
  frameRate(60);


  spritePath = "assets/images/madotsuki.png";
  player = new Player(120,240,20,15, spritePath,24, 32, footstep, popup, popupOut);

  //add pictures to an array and then merge it with the loadWorld() from museum

  museum = new World(worldImage, 20, wallImage,floorImage, shadowFloorImage, cillingImage , gPicturesSmall, gPicturesBig);

  textSize(32);
  fill(255);

  backgroundMusic.setVolume(0.5);
  
}

function draw() 
{
    
  clear();

  if(!backgroundMusic.isPlaying())
  {
    backgroundMusic.play();
  }

  let camX = floor(player.x + player.width / 2 / zoom - width / 2 / zoom);
  let camY = floor(player.y + player.height / 2 / zoom - height / 2 /  zoom);
  
  push();
  
  scale(zoom);
  
  translate(-camX, -camY);

  if(museum && museum.worldImage && museum.map.length > 0)
  {
    museum.drawWorld(camX, camY);
  }

  if (player && player.sprite && player.sprite.sprites.length > 0)
  {
    
    player.draw();
    player.move();
    
    //collisions

    let range = 2;

    let minCol = max(0, floor((player.x - range * museum.tileSize) / museum.tileSize));
    let maxCol = min(museum.cols, ceil((player.x + player.width + range * museum.tileSize) / museum.tileSize));

    let minRow = max(0, floor((player.y - range * museum.tileSize) / museum.tileSize));
    let maxRow = min(museum.rows, ceil((player.y + player.height + range * museum.tileSize) / museum.tileSize));

    for (let i = minRow; i < maxRow; i++) 
    {
      for (let j = minCol; j < maxCol; j++) 
      {
        if (museum.map[i][j] != 0 && museum.map[i][j] != 3) 
        {
          let mapRect = new Rectangle(j * museum.tileSize, i * museum.tileSize, museum.tileSize, museum.tileSize);
          player.resolveCollisions(mapRect, deltaTime);
        }
      }
    }
    
    for (let pic of museum.pictures) 
    {
      player.showPicture(pic);
    }

    player.update();

  }
  pop();   

  
  let fps = frameRate();
  text("FPS: " + fps.toFixed(1), 10, 40);
 
}


function windowResized() 
{
  resizeCanvas(windowWidth, windowHeight * 0.855);
}
