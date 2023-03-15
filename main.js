const regionBtnsGroup = document.querySelectorAll('.btn-wrapper');
const devicesGroup = document.querySelectorAll('.device-wrapper');
const nextBtn = document.querySelector('.next-btn');
const servers = document.querySelectorAll('.server');
const title = document.querySelector('.main-title');
const linesBlocks = document.querySelectorAll('.server-holder');


//В цей масив отримаємо масиви з кнопками
const btnsArray = [];

for (let regionBtns of regionBtnsGroup) {
  const btns = regionBtns.querySelectorAll('.btn');
  btnsArray.push(btns)
}

//В цей масив отримаємо масиви з зображеннями девайсів
const devicesArray = [];

for (let devicesList of devicesGroup) {
  const devices = devicesList.querySelectorAll('.device');
  devicesArray.push(devices);
}


//В цей масив будемо отримувати масиви з відміченими кнопками
const checkedBtnsArray = [];

//В цей масив будемо отримувати масиви з серверами

const linesArray = [];

for (let i = 0; i < linesBlocks.length; i++) {
  linesArray.push([]);
  const countries = linesBlocks[i].querySelectorAll('.line-wrapper');
  for (let country of countries) {
    const lines = country.querySelectorAll('.line');
    linesArray[i].push(lines)
  }
}


for (let i = 0; i < btnsArray.length; i++) {
  let isChecked = false;
  checkedBtnsArray.push([]);
  for (let j = 0; j < btnsArray[i].length; j++) {
    btnsArray[i][j].addEventListener('click', function () {
      regionBtnsGroup[i].classList.add('hidden')
      for (let k = 0; k <= j; k++) {
        checkedBtnsArray[i].push(btnsArray[i][k]);
        devicesArray[i][k].classList.add('showed')
      }
      isChecked = true; //можливо можна зробити більш оптимізовано, щоб ця дія спрацбовувала лише один раз
      if (isChecked) {
        nextBtn.classList.add('next-btn-active')
      }
      if (checkedBtnsArray.every(elem => elem.length > 0)) {
        goNext()
      }
    })
    //Можливо можна уникнути перебору два рази
    btnsArray[i][j].addEventListener('mouseover', function () {
      for (let k = 0; k <= j; k++) {
        btnsArray[i][k].classList.add('btn-active');
      }
    })
    btnsArray[i][j].addEventListener('mouseout', function () {
      for (let k = 0; k <= j; k++) {
        btnsArray[i][k].classList.remove('btn-active');
      }
    })
  }
}

const isCheckedArray = [];

function goNext() {
  let counter = 0;
  for (let i = 0; i < servers.length; i++) {
    isCheckedArray.push('unchecked')
    servers[i].classList.add('showed');
    servers[i].addEventListener('mouseover', serverMouseOver);
    servers[i].addEventListener('mouseout', serverMouseOut);
    servers[i].addEventListener('click', function chooseServer() {
      servers[i].removeEventListener('mouseover', serverMouseOver);
      servers[i].removeEventListener('mouseout', serverMouseOut);
      if (isCheckedArray.includes('blue-server')) {
        isCheckedArray[i] = 'red-server';
        this.src = './img/server_ByteCloud.png'
      } else {
        isCheckedArray[i] = 'blue-server';
        this.src = './img/server.png';
        title.innerText = 'Choose minimum two additional spots for ByteCloud and press ';
        nextBtn.classList.add('next-btn-active');
        nextBtn.disabled = true;
        nextBtn.innerText = 'Start';
      }
      servers[i].removeEventListener('click', chooseServer);
      ++counter;
      if (counter >= 3) {
        nextBtn.disabled = false;
      }
      if (counter > 3) {
        calculation()
      }
    })
  }
  for (let btns of btnsArray) {
    for (let btn of btns) {
      btn.classList.add('hidden')
    }
  }
  title.innerText = 'Where is your data? Choose one spot for Object Storage system';
  nextBtn.classList.remove('next-btn-active');
  nextBtn.removeEventListener('click', goNext)
  nextBtn.addEventListener('click', calculation);
}

nextBtn.addEventListener('click', goNext);

function serverMouseOver() {
  this.src = './img/circle_filled.png'
}

function serverMouseOut() {
  this.src = './img/circle_empty.png'
}

function getMinIndex(arr) {
  let min;
  if (typeof (arr[0]) === 'number') {
    min = arr[0];
  } else {
    min = arr[1]
  }
  for (let i = 1; i < arr.length; i++) {
    if (typeof (arr[i]) === 'number') {
      if (arr[i] < min) {
        min = arr[i];
      }
    }
  }
  return arr.indexOf(min)
}

function findDistance(elem1, elem2) {
  const rectA = elem1.getBoundingClientRect(); //first device
  const rectB = elem2.getBoundingClientRect(); //server
  const distance = Math.sqrt(
    Math.pow(rectB.left - rectA.left, 2) +
    Math.pow(rectB.top - rectA.top, 2)
  );
  return distance;
}


function calculation() {
  //Ключі цього об'єкту будуть відповідати індексу клієнта. Сюди потраплять тільки ті, які відмічені. Кожному ключу буде відповідати один масив
  const allDistances = {};
  //В цьому об'єкті ключами будуть сервери, а властивістю масиви із списком підключених клієнтів
  const serverConections = {};

  for (let i = 0; i < checkedBtnsArray.length; i++) {
    if (checkedBtnsArray[i].length > 0) {
      allDistances[i] = [];
      for (let j = 0; j < isCheckedArray.length; j++) {
        if (isCheckedArray[j] !== 'unchecked') {
          serverConections[j] = { connectedClients: [] };
          // у відповідний масив пушиться об'єкт (скільки є обраних серверів, стільки буде об'єктів)
          const distance = findDistance(devicesArray[i][0], servers[j])
          allDistances[i].push({ serverIndex: j, distance: distance });

        }
      }
    }
  }
  const sortedDistances = sortDistances(allDistances);
  console.log(sortedDistances)
  console.log('calc');

  const clients = [];

  function connectToServer(clientId, distanceIndex = 0) {
    console.log("distanceIndex", distanceIndex);
    console.log("clientId", clientId);
    const currentDistance = sortedDistances[clientId][distanceIndex];
    console.log("currentDistance", currentDistance)
    if (!clients.includes(clientId)) {
      // console.log("distanceIndex", distanceIndex)
      //Отримаємо найближчий сервер (це об'єкт)
      
      //Перевіримо чи цей сервер має клієнта з меншою відстанню до нього. Повернемо індекс клієнта, у разі, якщо такий знайдеться, та false, якщо ні
      const isClosestClient = () => {
        for (let key in allDistances) {
          for (let obj of allDistances[key]) {
            if (obj.serverIndex === currentDistance.serverIndex) {
              if (obj.distance < currentDistance.distance) {
                return Number(key);
              }
            }
          }
        }
        return false;
      }
      const closestClient = isClosestClient();
      console.log("closestClient", closestClient)

      //Перевіримо, чи найближччий клієнт підключений до якогось серверу
      const isClosestClientConnected = closestClient && serverConections[currentDistance.serverIndex].connectedClients.includes(closestClient);
      console.log("isClosestClientConnected", isClosestClientConnected)

      //Перевіремо, чи наш сервер має підключених клієнтів
      const isServerFree = !serverConections[currentDistance.serverIndex].connectedClients.length;
      console.log("isServerFree", isServerFree)
      if (closestClient && !isClosestClientConnected && isServerFree) {
        console.log('push closest client')
        // serverConections[currentDistance.serverIndex].connectedClients.push(closestClient);
        clients.push(closestClient)
        console.log("clients", clients)
      }

      //Якщо немає іншого клієнта, який знаходиться ближче, додаємо цього клієнта до масиву. Також додамо до масиву clients, де просто будуть зберігатися всі клієнти, які підлючені до будь-якого серверу
      if (!closestClient && isServerFree || isClosestClientConnected) {
        serverConections[currentDistance.serverIndex].connectedClients.push(clientId);
        clients.push(clientId)
        console.log('test')
      } else if (++distanceIndex === Object.keys(serverConections).length) {
        serverConections[0].connectedClients.push(clientId);
        clients.push(clientId)
      }
      else {
        connectToServer(clientId, distanceIndex++)
      }
    } else {
      console.log('next')
    }
    console.log('end')
  }
  // for (let key in sortedDistances) {
  //   connectToServer(key)
  // }
  // connectToServer(0)
  console.log("serverConections", serverConections)
}

function sortDistances(distances) {
  const sortedDistances = {};

  for (const key in distances) {
    sortedDistances[key] = distances[key].sort((a, b) => a.distance - b.distance);
  }

  return sortedDistances;
}





