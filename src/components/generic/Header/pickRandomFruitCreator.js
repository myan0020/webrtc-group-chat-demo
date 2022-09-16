
const fruits = ['banana', 'apple', 'orange'];
let pickerIndex = 0;
let randomFruit = fruits[pickerIndex];

const pick = () => {
  pickerIndex = pickerIndex + 1;
  if (pickerIndex > fruits.length - 1) {
    pickerIndex = 0;
  }
  randomFruit = fruits[pickerIndex]
}


export { pick, randomFruit }

