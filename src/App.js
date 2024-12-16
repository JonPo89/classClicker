import React, {useState, useEffect, useRef} from 'react';
import './App.css';
import {ProducerClass} from './features/clickerClasses/clickerClasses';

function App() {
  const [funds, setFunds] = useState(0);
  const [level, setLevel] = useState(1);
  const [cost, setCost] = useState(10);
  const [clickValue, setClickValue] = useState(1);
  const [clicks, setClicks] = useState(0);

  const [PPS, setPPs] = useState(0);

  const [randomColour, setRandomColour] = useState(0)

  const producer1 = new ProducerClass(`Producer 1`, 1,);
  const [ producers, setProducers ] = useState([producer1]);
  const [ counter, setCounter] = useState(2);

  const timersRef = useRef({});
  const levelUpRef = useRef({});
  const maxLevelUpRef = useRef({});
  const transparencyRef = useRef({});

  
  useEffect(() => {
    let pointsPerSecond = 0;
    producers.forEach(producer => {
      const productionTime = producer.calculateProductionTime();
      const productionValue = producer.calculateProductionValue();
      if (producer.level > 0) {
        pointsPerSecond += (productionValue/productionTime);
      }

      let currentTimer = timersRef.current[producer.name]

      if (!currentTimer || currentTimer.productionTime !== productionTime){

        timersRef.current[producer.name] = {
          productionTime: productionTime,
          productionValue: productionValue
        }
        
      }
    })
    if (pointsPerSecond > 0){ 
      setPPs(pointsPerSecond);
      const timePerPoint = 1000/pointsPerSecond;

      if (timersRef.current.globalInterval){
        clearInterval(timersRef.current.globalInterval);
      }

      timersRef.current.globalInterval = setInterval(() => {
        setFunds((prevFunds) => prevFunds + Math.max(1, Math.floor((pointsPerSecond / 100))))
      }, Math.max(10, timePerPoint));

    }

    const intervalId = timersRef.current.globalInterval

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
    

  }, [funds, producers, levelUpRef, maxLevelUpRef])
  
  useEffect(() => {
    producers.forEach(producer => {
      let currentMaxLevel = maxLevelUpRef.current[producer.name]
      if (!currentMaxLevel || currentMaxLevel.maxCost !== producer.maxCost(funds)) {
        maxLevelUpRef.current[producer.name] = {
          maxCost: producer.maxCost(funds).maxCost,
          maxLevel: producer.maxCost(funds).maxLevel
        }
      }
    })
  }, [funds, producers, levelUpRef, maxLevelUpRef])

  const onClickClickbox = () => {
    setFunds(funds + clickValue);
    setClicks(clicks + 1);
    setRandomColour(Math.random()*255)
  }

  const onClickUpgradeClickbox = () => {
    if (funds >= cost) {
      setFunds(funds - cost);
      setLevel(level + 1);
      setCost(Math.round((10+Math.pow(1.2, level))));
      setClickValue(clickValue + 1);
    }
  }

  const onClickUnlock = (id) => {
    let cost = producers[id-1].levelCost(1);
    if (cost <= funds){
      setFunds(funds - cost);
      producers[id-1].levelUp(1);
      const newProducer = new ProducerClass(`Producer ${counter}`, counter)
      setCounter(counter + 1);

      setProducers([...producers, newProducer])
      levelUpRef.current[producers[id-1].name] = {
        id: producers[id],
        levelUpCost: producers[id-1].levelCost(1)
      }

      transparencyRef.current[producers[id-1].name] = {
        transparency: 0
      }

    }
  }

  const onClickLevelUp = (id) => {
    let cost = producers[id-1].levelCost(1);
    let producersArray = producers;
    if (cost <= funds && producers[id-1].level < 50) {
      setFunds(funds - cost);
      producersArray[id-1].levelUp(1);
      levelUpRef.current[producers[id-1].name] = {
        id: producers[id],
        levelUpCost: producers[id-1].levelCost(1)
      }
      transparencyRef.current[producers[id-1].name].transparency = producers[id-1].level * 0.02;
      setProducers(producersArray);
    }
  }

  const onClickMaxLevelUp = (id) => {
    let producerToLevel = maxLevelUpRef.current[producers[id-1].name]
    let cost = producerToLevel.maxCost;
    let producersArray = producers;
    if (cost <= funds) {
      setFunds(funds - cost);
      producersArray[id-1].levelUp(producerToLevel.maxLevel);
      levelUpRef.current[producers[id-1].name] = {
        id: producersArray[id],
        levelUpCost: producersArray[id-1].levelCost(1)
      }
      transparencyRef.current[producers[id-1].name].transparency = producers[id-1].level * 0.02;
      setProducers(producersArray);
    }
  }



  return (
    <div className="App">
      <p>Created by Jon Porter</p>
      <a href="www.jonportfolio.com" target="_blank">http://www.jonportfolio.com</a>
      <br/>
      <h1>Funds: {funds.toLocaleString()}</h1>
      <p>Clicks: {clicks}</p>
      <p>Your producers produce:<br/>
      <b>{(Math.floor(PPS*100)/100).toLocaleString()}</b>
       clicks per second</p>
      <div id="clickBox" onClick={() => onClickClickbox()} style={{backgroundColor: `hsl(${randomColour},60%,50%)`}}>
        <h1>Click Me</h1>
        <h3>Level: {level}</h3>  
      </div>
      <button onClick={onClickUpgradeClickbox} style={{color: `${(cost<funds)? 'black' : 'gray'}`}}>Upgrade {cost}</button>
      
      <div id="producers">
        {producers.map(producer => (
          <div key={`${producer.name}`} className="producer" style={{backgroundColor: `hsla(${producer.colour},${transparencyRef.current[producer.name] ? transparencyRef.current[producer.name].transparency : 0})`}}>
            <h1>{producer.name}</h1>
            
            {producer.level === 0 ?
              <button onClick={() => onClickUnlock(producer.rank)} style={{color:`${(producer.levelCost(1) < funds)? 'black' : 'gray'}`}}>Unlock: {producer.levelCost(1)}</button>
              :
              <>
                <h3>Level: {producer.level}</h3> 
                <p>{producer.calculateProductionValue().toLocaleString()} per {Math.round(100*producer.calculateProductionTime())/100} sec</p>
                {producer.level < 50 ? 
                  <>
                  <button onClick={() => onClickLevelUp(producer.rank)} style={{color:`${(levelUpRef.current[producer.name].levelUpCost < funds)? 'black' : 'gray'}`}}>Level Up(1): {levelUpRef.current[producer.name].levelUpCost}</button>
                  <button onClick={() => onClickMaxLevelUp(producer.rank)} style={{color:`${(maxLevelUpRef.current[producer.name].maxLevel)? 'black' : 'gray'}`}}>Max Level Up({maxLevelUpRef.current[producer.name].maxLevel}): {maxLevelUpRef.current[producer.name].maxCost}</button>
                  </>
                :
                  null
                }
                
              </>
            }
          </div>
        ))}
      </div>        
    </div>
  );
}

export default App;
